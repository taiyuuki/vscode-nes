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
 */
export interface NetcodeHooks {
    waitForRemoteInput: (frame: number) => Promise<number>
    sendLocalInput:     (frame: number, input: number) => void
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
     * 与单机 mainLoop 的关键区别：
     *   - 不按 wall-clock 追赶历史帧，而是严格按 frameCount 逐帧推进
     *   - 每帧先等待对端该帧输入到达（barrier），再注入并 runFrame
     *   - 用 requestAnimationFrame 控制帧节奏上限，避免空转
     *
     * 因为每帧 await 远程输入，此循环是异步的；浏览器音频回调由系统驱动，
     * 短暂等待不会冻结主线程（但环形缓冲可能耗尽，属 lockstep 正常现象）。
     */
    private mainLoopNetcode = async() => {
        if (!this.netcodeMode || !this.netcodeHooks || this.netcodeLocalPlayer === null) {
            return
        }
        this.netcodeLoopRunning = true

        try {
            while (this.status === 1 && this.netcodeMode) {
                const frame = this.nes.frameCount

                // 1. 采样本地输入并发送给对端
                const localInput = this.nes.getInput(this.netcodeLocalPlayer)
                this.netcodeHooks.sendLocalInput(frame, localInput)

                // 2. 等待对端该帧输入到达
                let remoteInput: number
                try {
                    remoteInput = await this.netcodeHooks.waitForRemoteInput(frame)
                }
                catch(err) {
                    console.warn('[netcode] 帧屏障失败，退出联机循环:', err)
                    this.disableNetcode()
                    break
                }

                // 3. 注入远程输入并推进一帧
                if (this.netcodeRemotePlayer !== null) {
                    this.nes.setInput(this.netcodeRemotePlayer, remoteInput)
                }
                this.nes.runFrame()

                // 4. 帧节奏控制：用 rAF 对齐到下一次刷新，避免快于 60fps
                await this.nextFrameTick()
            }
        }
        finally {
            this.netcodeLoopRunning = false
        }
    }

    /** 等待下一个 requestAnimationFrame 回调（帧节奏节流） */
    private nextFrameTick(): Promise<void> {
        return new Promise(resolve => {
            requestAnimationFrame(() => resolve())
        })
    }

    /**
     * 启用 netcode 模式
     *
     * 进入联机后会清除远程玩家的键盘映射，避免本地键盘事件
     * 写入远程手柄（远程手柄只接受 setInput 注入的输入）。
     *
     * @param remotePlayer 远程玩家号（接收对端输入注入的手柄）
     * @param hooks        由 useNetcode 提供的帧屏障与发送回调
     */
    enableNetcode(remotePlayer: 1 | 2, hooks: NetcodeHooks): void {
        this.netcodeMode = true
        this.netcodeRemotePlayer = remotePlayer
        this.netcodeLocalPlayer = remotePlayer === 1 ? 2 : 1
        this.netcodeHooks = hooks

        // 备份并清除远程玩家的键盘映射，防止本地按键污染远程手柄
        if (remotePlayer === 1) {
            this.savedP1KeyMap = this.controller.p1KeyMap
            this.controller.setupKeyboadController(1, {})
        }
        else {
            this.savedP2KeyMap = this.controller.p2KeyMap
            this.controller.setupKeyboadController(2, {})
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
            this.savedP1KeyMap = null
        }
        if (this.savedP2KeyMap) {
            this.controller.setupKeyboadController(2, this.savedP2KeyMap)
            this.savedP2KeyMap = null
        }
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
                await this.audioOutput.start()
                if (this.netcodeMode) {

                    // 联机：用 lockstep 异步循环替代单机 rAF 追赶循环
                    void this.mainLoopNetcode()
                }
                else {
                    this.run()
                }

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
