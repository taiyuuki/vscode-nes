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
                this.run()
                await this.audioOutput.start()
                
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
        this.run()
    }

    public stop() {
        if (this.status === 0) return // Already stopped
        this.audioOutput.destroy()
        this.status = 0
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
