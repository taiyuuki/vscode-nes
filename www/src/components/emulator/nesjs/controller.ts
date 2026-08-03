import type { GamepadInterface } from '@nesjs/core'
import { NESControllerButton } from '@nesjs/core'

export type Player = 1 | 2

const KEYS_INDEX: Record<string, number> = {
    A:      0,
    B:      1,
    SELECT: 2,
    START:  3,
    UP:     4,
    DOWN:   5,
    LEFT:   6,
    RIGHT:  7,
    C:      8,
    D:      9,
}

const GAMEPAD_BUTTON_MAP: Record<number, NESControllerButton> = {
    0:  NESControllerButton.A, // XBox - A
    1:  NESControllerButton.A, // XBox - B (auto A)
    2:  NESControllerButton.B, // XBox - X
    3:  NESControllerButton.B, // XBox - Y (auto B)
    8:  NESControllerButton.SELECT, // XBox - Select
    9:  NESControllerButton.START, // XBox - Start
    12: NESControllerButton.UP, // XBox - Up
    13: NESControllerButton.DOWN, // XBox - Down
    14: NESControllerButton.LEFT, // XBox - Left
    15: NESControllerButton.RIGHT, // XBox - Right
}

const GAMEPAD_AXES_MAP = {
    HORIZONTAL: {
        LEFT:  NESControllerButton.LEFT,
        RIGHT: NESControllerButton.RIGHT,
    },
    VERTICAL: {
        UP:   NESControllerButton.UP,
        DOWN: NESControllerButton.DOWN,
    },
}

export const P1_DEFAULT: Record<string, string> = {
    UP:     'KeyW',
    DOWN:   'KeyS',
    LEFT:   'KeyA',
    RIGHT:  'KeyD',
    A:      'KeyK',
    B:      'KeyJ',
    C:      'KeyI',
    D:      'KeyU',
    SELECT: 'Digit2',
    START:  'Digit1',
}

export const P2_DEFAULT: Record<string, string> = {
    UP:     'ArrowUp',
    DOWN:   'ArrowDown',
    LEFT:   'ArrowLeft',
    RIGHT:  'ArrowRight',
    A:      'Numpad2',
    B:      'Numpad1',
    C:      'Numpad5',
    D:      'Numpad4',
    SELECT: 'NumpadDecimal',
    START:  'NumpadEnter',
}

export interface ControllerStateType {
    player: number
    index:  number
}

interface AutoFireState {
    id:      number
    on:      boolean
    pressed: boolean
}

class AutoFireManager {
    private _autoStates: Record<Player, Record<number, AutoFireState>> = {
        1: {
            0: { id: 0, on: false, pressed: true }, // A
            1: { id: 0, on: false, pressed: true }, // B
        },
        2: {
            0: { id: 0, on: false, pressed: true }, // A
            1: { id: 0, on: false, pressed: true }, // B
        },
    }

    constructor(private controllers: {
        1: GamepadInterface
        2: GamepadInterface
    }) {}

    /**
     * 设置连发状态
     * @param player 玩家编号
     * @param button NES 按键
     * @param pressed 是否按下
     * @param interval 连发间隔
     */
    setAutoFire(player: Player, button: NESControllerButton, pressed: boolean, interval: number) {
        const autoState = this._autoStates[player]?.[button]
        if (!autoState) return

        const controller = this.controllers[player]

        if (pressed) {
            if (autoState.pressed) {

                // 开始连发
                controller.setButton(button, 1)
                autoState.id = window.setInterval(() => {
                    controller.setButton(button, autoState.on ? 1 : 0)
                    autoState.on = !autoState.on
                }, interval)
                autoState.pressed = false
            }
        }
        else {

            // 停止连发
            if (autoState.id) {
                clearInterval(autoState.id)
                autoState.id = 0
            }
            autoState.on = false
            autoState.pressed = true
            controller.setButton(button, 0)
        }
    }

    /**
     * 停止所有连发
     */
    stopAllAutoFire() {
        Object.values(this._autoStates).forEach(playerStates => {
            Object.values(playerStates).forEach(autoState => {
                if (autoState.id) {
                    clearInterval(autoState.id)
                    autoState.id = 0
                }
                autoState.on = false
                autoState.pressed = true
            })
        })
    }

    /**
     * 检查是否支持连发
     */
    supportsAutoFire(button: NESControllerButton): boolean {
        return button === NESControllerButton.A || button === NESControllerButton.B
    }
}
function arrFill<T>(v: T, length: number) {
    return Array.from<T>({ length }).fill(v)
}

class ControllerAdapter {
    private _events:         Record<string, ControllerStateType[]> = {}
    private autoFireManager: AutoFireManager

    constructor(public controller: {
        1: GamepadInterface
        2: GamepadInterface
    }) {
        this.autoFireManager = new AutoFireManager(controller)
    }

    addEvent(keyCode: string, state: ControllerStateType) {
        if (!this._events[keyCode]) {
            this._events[keyCode] = []
        }
        this._events[keyCode].push(state)
    }

    trigger(keyboadCode: string, state: 0 | 1, interval: number) {
        const eventList = this._events[keyboadCode]
        if (!eventList) return
        eventList.forEach(event => {
            const player = event.player as Player
            const controller = this.controller[player]
            if (event.index <= 7) {
                controller.setButton(event.index, state)
            }
            else {
                const nesButton = (event.index - 8) as NESControllerButton
                this.autoFireManager.setAutoFire(player, nesButton, state === 1, interval)
            }
        })
    }

    setAutoFire(player: Player, button: NESControllerButton, pressed: boolean, interval: number) {
        this.autoFireManager.setAutoFire(player, button, pressed, interval)
    }

    supportsAutoFire(button: NESControllerButton): boolean {
        return this.autoFireManager.supportsAutoFire(button)
    }

    getState(keyCode: string) {
        return this._events[keyCode]
    }

    init() {
        this._events = {}
    }

    destroy() {
        this.autoFireManager.stopAllAutoFire()
    }
}

export class NESController {
    THRESHOLD = 0.3
    private adapter:          ControllerAdapter
    private animationFrameID: number | null = null
    private autoFireButtonIndices = new Set([1, 3]) // 默认 B 和 Y 为连发
    private axesHolding: Record<Player, boolean[]> = {
        1: arrFill(false, 4),
        2: arrFill(false, 4),
    }
    private btnHolding: Record<Player, boolean[]> = {
        1: arrFill(false, 20),
        2: arrFill(false, 20),
    }

    private mashingSpeed = 1000 / (16 * 2)

    private controllers: {
        1: GamepadInterface
        2: GamepadInterface
    }

    p1KeyMap = P1_DEFAULT
    p2KeyMap = P2_DEFAULT

    constructor(p1: GamepadInterface, p2: GamepadInterface) {
        this.controllers = { 1: p1, 2: p2 }
        this.setupKeyboadEvents()
        this.setupGampad()
        this.adapter = new ControllerAdapter(this.controllers)
        
        this.setupKeyboadController(1, this.p1KeyMap)
        this.setupKeyboadController(2, this.p2KeyMap)
    }

    private get gamepads() {
        return navigator.getGamepads().filter(Boolean)
    }

    private connectHandler(state: boolean, e: GamepadEvent) {
        if (state) {
            this.gamepads[e.gamepad.index] = e.gamepad
        }
        else if (this.gamepads.length === 0) {
            this.close()
        }
    }

    private close() {
        this.btnHolding[1].fill(false)
        this.btnHolding[2].fill(false)
        this.axesHolding[1].fill(false)
        this.axesHolding[2].fill(false)
        if (this.animationFrameID) {
            cancelAnimationFrame(this.animationFrameID)
            this.animationFrameID = null
        }
    }

    private gamepadAxesHandler(player: Player, check: boolean, aindex: number, nesButton: NESControllerButton) {
        const hold = this.axesHolding[player]?.[aindex]
        if (check) {
            if (!hold) {
                this.controllers[player].setButton(nesButton, 1)
                this.axesHolding[player][aindex] = true
            }
        }
        else if (hold) {
            this.controllers[player].setButton(nesButton, 0)
            this.axesHolding[player][aindex] = false
        }
    }

    private gamepadBtnHandler(player: Player, btn: GamepadButton, index: number) {
        const hold = this.btnHolding[player]?.[index]
        const nesButton = GAMEPAD_BUTTON_MAP[index]
        
        if (nesButton == null) return
        
        if (btn.pressed) {
            if (!hold) {

                if (this.isAutoFireButton(index)) {
                    this.adapter.setAutoFire(player, nesButton, true, this.mashingSpeed)
                }
                else {
                    this.controllers[player].setButton(nesButton, 1)
                }
                this.btnHolding[player][index] = true
            }
        }
        else if (hold) {
            if (this.isAutoFireButton(index)) {
                this.adapter.setAutoFire(player, nesButton, false, this.mashingSpeed)
            }
            else {
                this.controllers[player].setButton(nesButton, 0)
            }
            this.btnHolding[player][index] = false
        }
    }

    private frame() {
        for (let gindex = 0; gindex < this.gamepads.length; gindex++) {
            if (gindex > 1) break
            const gamepad = this.gamepads[gindex]
            if (!gamepad) continue
            const player = (gindex + 1) as Player

            gamepad.buttons.forEach((button, index) => {
                this.gamepadBtnHandler(player, button, index)
            })

            const lr = gamepad.axes[0] ?? 0
            const ud = gamepad.axes[1] ?? 0

            this.gamepadAxesHandler(player, lr > this.THRESHOLD, 0, GAMEPAD_AXES_MAP.HORIZONTAL.RIGHT)
            this.gamepadAxesHandler(player, lr < -this.THRESHOLD, 1, GAMEPAD_AXES_MAP.HORIZONTAL.LEFT)
            this.gamepadAxesHandler(player, ud > this.THRESHOLD, 2, GAMEPAD_AXES_MAP.VERTICAL.DOWN)
            this.gamepadAxesHandler(player, ud < -this.THRESHOLD, 3, GAMEPAD_AXES_MAP.VERTICAL.UP)
        }
    }

    private run() {
        this.frame()
        this.animationFrameID = requestAnimationFrame(this.run.bind(this))
    }

    public setupKeyboadController(player: Player, keyMap: Record<string, string>) {
        this.adapter.init()
        if (player === 1) {
            this.p1KeyMap = keyMap
        }
        else if (player === 2) {
            this.p2KeyMap = keyMap
        }
        Object.keys(KEYS_INDEX).forEach(key => {
            if (key in this.p1KeyMap) {
                this.adapter.addEvent(this.p1KeyMap[key], {
                    player: 1,
                    index:  KEYS_INDEX[key],
                })
            }
            if (key in this.p2KeyMap) {
                this.adapter.addEvent(this.p2KeyMap[key], {
                    player: 2,
                    index:  KEYS_INDEX[key],
                })
            }
        })
    }

    private setupKeyboadEvents() {
        document.addEventListener('keydown', e => {
            this.adapter.trigger(e.code, 1, this.mashingSpeed)
        })

        document.addEventListener('keyup', e => {
            this.adapter.trigger(e.code, 0, this.mashingSpeed)
        })
    }

    private setupGampad() {
        window.addEventListener('gamepadconnected', this.connectHandler.bind(this, true))
        window.addEventListener('gamepaddisconnected', this.connectHandler.bind(this, false))

        this.run()
    }

    setMashingSpeed(speed: number) {
        this.mashingSpeed = 1000 / (speed * 2)
    }

    setAutoFireForButton(player: Player, button: NESControllerButton, enabled: boolean) {
        if (enabled && this.adapter.supportsAutoFire(button)) {
            this.adapter.setAutoFire(player, button, true, this.mashingSpeed)
        }
        else {
            this.adapter.setAutoFire(player, button, false, this.mashingSpeed)
        }
    }

    stopAllAutoFire() {
        this.adapter.destroy()
    }

    /**
     * 设置手柄连发按键映射
     * @param buttonIndices 需要启用连发的手柄按键索引数组
     */
    setAutoFireButtons(buttonIndices: number[]) {
        this.autoFireButtonIndices = new Set(buttonIndices)
    }

    private isAutoFireButton(gamepadButtonIndex: number): boolean {
        return this.autoFireButtonIndices.has(gamepadButtonIndex)
    }
}
