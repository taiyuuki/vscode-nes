import type { EmulatorConfig } from '@nesjs/core'
import { NES } from '@nesjs/core'
import type { CanvasRendererOptions } from './renderer'
import { CanvasRenderer } from './renderer'
import type { AudioOptions } from './audio'
import { WebNESAudioOutput } from './audio'
import type { Player } from './controller'
import { NESController } from './controller'

export type NESEmulatorOptions = AudioOptions & CanvasRendererOptions & EmulatorConfig & {
    player1KeyMap?: Record<string, string>
    player2KeyMap?: Record<string, string>
}

/**
 * Netcode 回调集合，由 useNetcode 注入。
 * - waitForRemoteInput(frame)：阻塞直到对端第 frame 帧输入到达，返回 1 字节输入
 * - sendLocalInput(frame, input)：把本地第 frame 帧输入发给对端
 * - onLoopExit?(reason)：lockstep 循环退出时调用（无论正常退出还是 barrier 超时），
 *   useNetcode 在此重置 netcodeActive 等状态，使 UI 能重新触发"开始游戏"
 */
export interface NetcodeHooks {
    waitForRemoteInput: (frame: number) => Promise<number>
    sendLocalInput:     (frame: number, input: number) => void
    onLoopExit?:        (reason: string) => void
}

class NESEmulator {
    private static readonly FPS_BY_TV = {
        NTSC:  1789773.0 / 29781,
        PAL:   1662607.0 / 33252,
        DENDY: 1773448.0 / 35469,
    } as const

    nes:              NES
    renderer:         CanvasRenderer
    audioOutput:      WebNESAudioOutput
    frameDuration:    number
    lastFrameTime = 0
    targetFPS = 60
    status = 0 // 0: stopped, 1: running, 2: paused
    animationFrameId: number | null = null
    romData:          Uint8Array | null = null
    controller:       NESController

    // ---- netcode ----
    private netcodeMode = false
    private netcodeRemotePlayer: 1 | 2 | null = null
    private netcodeLocalPlayer:  1 | 2 | null = null
    private netcodeHooks:        NetcodeHooks | null = null
    private netcodeLoopRunning = false

    /** 联机期间备份的键盘映射，断开时恢复 */
    private savedP1KeyMap: Record<string, string> | null = null
    private savedP2KeyMap: Record<string, string> | null = null

    constructor(cvs: HTMLCanvasElement, config?: NESEmulatorOptions) {
        this.nes = new NES(config || {})
        this.renderer = new CanvasRenderer(cvs, config)
        this.audioOutput = new WebNESAudioOutput(config)
        this.frameDuration = 1000 / this.targetFPS

        this.nes.setAudioInterface(this.audioOutput)
        this.nes.setRenderer(this.renderer)

        this.controller = new NESController(this.nes.getGamepad(1), this.nes.getGamepad(2))

        if (config?.player1KeyMap) {
            this.controller.setupKeyboadController(1, config.player1KeyMap)
        }
        
        if (config?.player2KeyMap) {
            this.controller.setupKeyboadController(2, config.player2KeyMap)
        }
    }

    async loadROM(romData: Uint8Array) {
        this.romData = romData
        await this.nes.loadROM(romData)
        switch (this.nes.getTVType()) {
            case 'NTSC':
                this.targetFPS = NESEmulator.FPS_BY_TV.NTSC
                break
            case 'PAL':
                this.targetFPS = NESEmulator.FPS_BY_TV.PAL
                break
            case 'DENDY':
                this.targetFPS = NESEmulator.FPS_BY_TV.DENDY
                break
            default:
                this.targetFPS = NESEmulator.FPS_BY_TV.NTSC
        }
        this.frameDuration = 1000 / this.targetFPS
    }

    getNESInstance() {
        return this.nes
    }

    private mainLoop = () => {

        // 联机模式不跑单机循环（由 mainLoopNetcode 接管）
        // 暂停/停止时也不跑帧
        if (this.netcodeMode || this.status !== 1) {
            this.animationFrameId = null

            return
        }

        const now = performance.now()
        let deltaTime = now - this.lastFrameTime

        if (deltaTime > 1000) {
            this.lastFrameTime = now
            deltaTime = 0
        }

        while (deltaTime >= this.frameDuration) {
            this.nes.runFrame()
            this.lastFrameTime += this.frameDuration
            deltaTime -= this.frameDuration
        }

        this.animationFrameId = requestAnimationFrame(this.mainLoop)
    }

    /**
     * Netcode 主循环（lockstep）
     *
     * 纯四步循环，没有任何 deltaTime/时钟逻辑——lockstep 的帧率天然由
     * "网络往返 + rAF 间隔"决定，不需要本地时钟干预。
     *
     * 两端各自独立运行此循环，顺序队列保证输入配对：
     *   host 发的第 N 个输入 = guest 消费的第 N 个输入，反之亦然。
     *
     * 60Hz 屏 → 每轮约 16.7ms（rAF）→ ~60fps
     * 120Hz 屏 → 每轮约 8.3ms（rAF），但 barrier 等待通常 ≥ 一个 rAF，
     *   实际帧率被网络往返限制在 60fps 左右。
     *   若 barrier 很快返回（输入已缓存），rAF 仍会节流到刷新率，
     *   但不会超过——因为每轮只有 1 次 runFrame。
     *   高刷新率可能导致略快于 60fps，但两端输入序列仍一致（确定性不变）。
     */
    private mainLoopNetcode = async() => {
        if (!this.netcodeMode || !this.netcodeHooks || this.netcodeLocalPlayer === null) {
            return
        }
        this.netcodeLoopRunning = true
        let exitReason = 'normal'

        // 帧率控制时钟：用 max 对齐，barrier 等待时间不会累积成追赶
        let nextFrameTime = performance.now()

        try {
            while (this.status === 1 && this.netcodeMode) {

                // 0. 帧率限制：如果距离上一帧还没到 frameDuration，等 rAF 再检查。
                //    防止高刷新率显示器（120/144Hz）导致游戏加速。
                //    用 max 对齐而非 += ：barrier 等了 50ms 时 nextFrameTime 推到 now，
                //    下一轮从此刻重新计时，绝不追赶历史帧。
                const now = performance.now()
                if (now < nextFrameTime) {
                    await this.nextFrameTick()
                    continue
                }

                // 1. 帧边界：应用上一轮 await 期间暂存的键盘事件到 buttonStates。
                this.controller.flushInputs()

                // 2. 采样本地输入并发送给对端
                const localInput = this.nes.getInput(this.netcodeLocalPlayer)
                this.netcodeHooks.sendLocalInput(this.nes.frameCount, localInput)

                // 3. 等待对端该帧输入到达。
                //    await 期间键盘事件进入 buffer（不改 buttonStates），安全。
                let remoteInput: number
                try {
                    remoteInput = await this.netcodeHooks.waitForRemoteInput(this.nes.frameCount)
                }
                catch {
                    exitReason = 'barrier-timeout'
                    this.disableNetcode()
                    break
                }

                if (this.status !== 1 || !this.netcodeMode) {
                    exitReason = 'paused'
                    break
                }

                // 4. 注入远程输入并 runFrame
                if (this.netcodeRemotePlayer !== null) {
                    this.nes.setInput(this.netcodeRemotePlayer, remoteInput)
                }
                this.nes.runFrame()

                // 5. 计算下一帧的最早时刻。取"逻辑下一帧"和"当前时刻"的较大值：
                //    - 正常情况（barrier 快速返回）：nextFrameTime += frameDuration，限制 60fps
                //    - barrier 等了较久：now 已超过 nextFrameTime + frameDuration，
                //      max 取 now，下一帧立即可以跑（不追赶，只是不额外等待）
                nextFrameTime = Math.max(nextFrameTime + this.frameDuration, performance.now())

                // 6. 让出主线程——让浏览器处理键盘事件（进入 buffer）和渲染
                await this.nextFrameTick()
            }
        }
        finally {
            this.netcodeLoopRunning = false

            // 通知 useNetcode 层循环已退出，让它重置 netcodeActive 等状态
            // （pause 退出不算异常，不重置——resume 时会重新进入循环）
            if (exitReason !== 'paused') {
                this.netcodeHooks.onLoopExit?.(exitReason)
            }
        }
    }

    /**
     * 用 requestAnimationFrame 等待下一次屏幕刷新。
     * 这里 rAF 的作用是"挂起循环、让出主线程"，不参与帧数计算——
     * 实际帧数由 mainLoopNetcode 外层的 deltaTime 累积严格控制，
     * 因此高刷新率显示器不会导致加速。
     */
    private nextFrameTick(): Promise<void> {
        return new Promise(resolve => {
            requestAnimationFrame(() => resolve())
        })
    }

    /**
     * 启用 netcode 模式
     *
     * 进入联机后：
     *   1. 清除远程玩家的键盘映射，避免本地键盘事件写入远程手柄（远程手柄只接受 setInput 注入）
     *   2. 本地玩家统一使用 P1 的按键配置——这样无论你是 1P 还是 2P，
     *      都用自己熟悉的 P1 按键操作本地角色
     *
     * @param remotePlayer 远程玩家号（接收对端输入注入的手柄）
     * @param hooks        由 useNetcode 提供的帧屏障与发送回调
     */
    enableNetcode(remotePlayer: 1 | 2, hooks: NetcodeHooks): void {
        this.netcodeMode = true
        this.netcodeRemotePlayer = remotePlayer
        this.netcodeLocalPlayer = remotePlayer === 1 ? 2 : 1
        this.netcodeHooks = hooks

        // 备份当前两个玩家的键盘映射，退出联机时恢复
        this.savedP1KeyMap = { ...this.controller.p1KeyMap }
        this.savedP2KeyMap = { ...this.controller.p2KeyMap }

        const localPlayer = this.netcodeLocalPlayer

        if (localPlayer === 1) {

            // host（本地 P1）：清除远程 P2 的键盘映射，P1 保持不变
            this.controller.setupKeyboadController(1, this.savedP1KeyMap)
            this.controller.setupKeyboadController(2, {})
        }
        else {

            // guest（本地 P2）：清除远程 P1 的键盘映射，
            // 并把本地 P2 的按键映射设为 P1 的配置——让用户用 P1 按键操作 P2
            this.controller.setupKeyboadController(1, {})
            this.controller.setupKeyboadController(2, this.savedP1KeyMap)
        }

        // 开启 lockstep 模式：键盘事件暂存到 buffer，在帧边界 flushInputs 时才应用
        this.controller.setLockstep(true)
    }

    /** 退出 netcode 模式，恢复单机调度与键盘映射 */
    disableNetcode(): void {
        this.netcodeMode = false
        this.controller.setLockstep(false)
        this.netcodeRemotePlayer = null
        this.netcodeLocalPlayer = null
        this.netcodeHooks = null

        // 恢复键盘映射
        if (this.savedP1KeyMap) {
            this.controller.setupKeyboadController(1, this.savedP1KeyMap)
        }
        if (this.savedP2KeyMap) {
            this.controller.setupKeyboadController(2, this.savedP2KeyMap)
        }
        this.savedP1KeyMap = null
        this.savedP2KeyMap = null
    }

    private run() {
        this.animationFrameId = requestAnimationFrame(this.mainLoop)
    }

    public async start() {
        switch (this.status) {
            case 0: // Stopped
                if (!this.romData) {
                    throw new Error('ROM not loaded')
                }
                this.status = 1
                this.lastFrameTime = performance.now()
                if (this.netcodeMode) {

                    // 联机：用 lockstep 异步循环替代单机 rAF 追赶循环
                    void this.mainLoopNetcode()
                }
                else {
                    this.run()
                }

                // 音频启动放最后且不阻塞游戏循环——AudioContext.resume()
                // 在无用户交互时会挂起，若放在 run() 前会导致游戏要等点击才开始
                void this.audioOutput.start()

                break
            case 2: // Paused
                await this.resume()
                break
            case 1: // Running
                // Already running
                break
        }
    }

    public async pause() {
        if (this.status !== 1) return // Not running
        try {
            await this.audioOutput.pause()
        }
        catch {

            // ignore if suspend failed or wasn't a promise
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
        this.status = 2
    }

    public async resume() {
        if (this.status !== 2) return // Not paused

        await this.audioOutput.resume()
        this.status = 1
        this.lastFrameTime = performance.now()
        if (this.netcodeMode && !this.netcodeLoopRunning) {
            void this.mainLoopNetcode()
        }
        else {
            this.run()
        }
    }

    public stop() {
        if (this.status === 0) return // Already stopped
        this.audioOutput.destroy()
        this.status = 0

        // netcode 循环检查 status===1 会自然退出
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
    }

    public reset() {
        this.nes.reset()
    }

    public async enableAudio() {
        try {
            await this.audioOutput.start()

            return true
        }
        catch(error) {
            console.error(`Failed to enable audio: ${error}`)

            return false
        }
    }

    public disableAudio() {
        this.audioOutput.pause()
    }

    public setVolume(volume: number) {
        this.audioOutput.setVolume(volume)
    }

    public setScale(scale: number) {
        this.renderer.setScale(scale)
    }

    public setSmoothing(smoothing: boolean) {
        this.renderer.setSmoothing(smoothing)
    }

    public setClip8px(clip: boolean) {
        this.renderer.setClip8px(clip)
    }

    public setFillColor(color: string | [number, number, number, number]) {
        this.renderer.setFillColor(color)
    }

    public setFDSBIOS(bios: Uint8Array) {
        this.nes.setFDSBIOS(bios)
    }

    public addCheat(code: string) {
        const cheater = this.nes.getCheater()
        if (!cheater) return
        try {

            cheater.addCheat(code)

            return true
        }
        catch(error) {
            console.error(error)

            return false
        }
    }

    public toggleCheat(code: string) {
        const cheater = this.nes.getCheater()
        if (!cheater) return
        const cheat = cheater.getCheat(code)

        if (cheat) {
            cheater.setCheatEnabled(code, !cheat.enabled)
        }
    }

    public removeCheat(code: string) {
        const cheater = this.nes.getCheater()
        if (!cheater) return
        cheater.removeCheat(code)
    }

    public clearAllCheats() {
        const cheater = this.nes.getCheater()
        if (!cheater) return
        cheater.clearCheats()
    }

    public setupKeyboadController(player: Player, keyMap: Record<string, string>) {
        this.controller.setupKeyboadController(player, keyMap)
    }

    public saveState(): Uint8Array {
        return this.nes.createBinarySaveState()
    }

    public loadState(state: Uint8Array) {
        this.nes.loadBinarySaveState(state)
    }
}

export { NESEmulator }
