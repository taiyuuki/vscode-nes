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
        const now = performance.now()
        let deltaTime = now - this.lastFrameTime

        if (deltaTime > 1000) {
            this.lastFrameTime = now
            deltaTime = 0
        }

        // if (this.status === 1) {
        while (deltaTime >= this.frameDuration) {
            this.nes.runFrame()
            this.lastFrameTime += this.frameDuration
            deltaTime -= this.frameDuration
        }

        // }

        // if (this.status === 1) {
        this.animationFrameId = requestAnimationFrame(this.mainLoop)

        // }
        // else {
        //     this.animationFrameId = null
        // }
    }

    /**
     * Netcode 主循环（lockstep）
     *
     * 与单机 mainLoop 的关键区别：**严格 1 rAF = 1 帧，不追赶历史帧**。
     *
     * lockstep 要求两端帧严格一一对应。如果积压了多帧后用 while 连续追赶，
     * 中间没有 rAF 让出主线程，本地键盘事件不会被处理——getInput 会连续读到
     * 同一个按键状态，导致发给对端的输入重复，两端迅速失步。
     *
     * 因此每轮循环：最多推进 1 帧 → await rAF 让出主线程（让浏览器处理键盘/网络）。
     * 这样每帧的 getInput 读到的都是最新输入，两端帧率天然对齐。
     *
     * deltaTime 只用于决定"这一轮 rAF 是否到了跑帧的时机"，不做累积追赶：
     * 超时积压则重置（与单机防漂移一致），保证不会越来越慢。
     */
    private mainLoopNetcode = async() => {
        if (!this.netcodeMode || !this.netcodeHooks || this.netcodeLocalPlayer === null) {
            return
        }
        this.netcodeLoopRunning = true
        this.lastFrameTime = performance.now()
        let exitReason = 'normal'

        try {
            while (this.status === 1 && this.netcodeMode) {
                const now = performance.now()
                const deltaTime = now - this.lastFrameTime

                // 掉帧超 1 秒则重置时钟，避免无限积压（单机一致的防漂移逻辑）
                if (deltaTime > 1000) {
                    this.lastFrameTime = now
                }

                // 还没到下一帧的执行时间——让出主线程等下一次刷新
                if (deltaTime < this.frameDuration) {
                    await this.nextFrameTick()
                    continue
                }

                // ---- 推进 1 帧（lockstep barrier）----

                // 1. 采样本地输入并发送给对端
                const localInput = this.nes.getInput(this.netcodeLocalPlayer)
                this.netcodeHooks.sendLocalInput(this.nes.frameCount, localInput)

                // 2. 等待对端该帧输入到达
                let remoteInput: number
                try {
                    remoteInput = await this.netcodeHooks.waitForRemoteInput(this.nes.frameCount)
                }
                catch {
                    exitReason = 'barrier-timeout'
                    this.disableNetcode()
                    break
                }

                // 等待期间状态可能变化（如被暂停），退出但不视为异常
                if (this.status !== 1 || !this.netcodeMode) {
                    exitReason = 'paused'
                    break
                }

                // 3. 注入远程输入并推进一帧
                if (this.netcodeRemotePlayer !== null) {
                    this.nes.setInput(this.netcodeRemotePlayer, remoteInput)
                }
                this.nes.runFrame()
                this.lastFrameTime += this.frameDuration

                // 4. 让出主线程——让浏览器处理键盘事件，保证下一帧 getInput 读到最新输入
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
    }

    /** 退出 netcode 模式，恢复单机调度与键盘映射 */
    disableNetcode(): void {
        this.netcodeMode = false
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
