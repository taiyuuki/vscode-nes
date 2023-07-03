const THRESHOLD = 0.3

const keyMap = {
  'p1': {
    'UP': [1, jsnes.Controller.BUTTON_UP],
    'DOWN': [1, jsnes.Controller.BUTTON_DOWN],
    'LEFT': [1, jsnes.Controller.BUTTON_LEFT],
    'RIGHT': [1, jsnes.Controller.BUTTON_RIGHT],
    'START': [1, jsnes.Controller.BUTTON_START],
    'SELECT': [1, jsnes.Controller.BUTTON_SELECT],
    'B': [1, jsnes.Controller.BUTTON_B],
    'A': [1, jsnes.Controller.BUTTON_A],
    'D': [1, jsnes.Controller.BUTTON_D],
    'C': [1, jsnes.Controller.BUTTON_C],
  },
  'p2': {
    'UP': [2, jsnes.Controller.BUTTON_UP],
    'DOWN': [2, jsnes.Controller.BUTTON_DOWN],
    'LEFT': [2, jsnes.Controller.BUTTON_LEFT],
    'RIGHT': [2, jsnes.Controller.BUTTON_RIGHT],
    'B': [2, jsnes.Controller.BUTTON_B],
    'A': [2, jsnes.Controller.BUTTON_A],
    'D': [2, jsnes.Controller.BUTTON_D],
    'C': [2, jsnes.Controller.BUTTON_C],
  }
}

const defaultKeys = {
  'p1': {
    UP: 'KeyW',
    DOWN: 'KeyS',
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    START: 'Digit1',
    SELECT: 'Digit2',
    B: 'KeyJ',
    A: 'KeyK',
    D: 'KeyU',
    C: 'KeyI'
  },
  'p2': {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    B: 'Numpad1',
    A: 'Numpad2',
    D: 'Numpad4',
    C: 'Numpad5'
  }
}

function getKeys() {
  const keys = {}
  Object.keys(defaultKeys.p1).forEach(key => {
    keys[defaultKeys.p1[key]] = keyMap.p1[key]
  })
  Object.keys(defaultKeys.p2).forEach(key => {
    keys[defaultKeys.p2[key]] = keyMap.p2[key]
  })
  return keys
}

function getTurboKeys() {
  const turbo = {}
  turbo[defaultKeys.p1.C] = {
    key: keyMap.p1.A,
    timeout: 0,
    beDown: false,
    once: true
  }
  turbo[defaultKeys.p1.D] = {
    key: keyMap.p1.B,
    timeout: 0,
    beDown: false,
    once: true
  }
  turbo[defaultKeys.p2.C] = {
    key: keyMap.p2.A,
    timeout: 0,
    beDown: false,
    once: true
  }
  turbo[defaultKeys.p2.D] = {
    key: keyMap.p2.B,
    timeout: 0,
    beDown: false,
    once: true
  }
  return turbo
}



function getBtnList() {
  return {
    p1: [
      defaultKeys.p1.A,
      defaultKeys.p1.C,
      defaultKeys.p1.B,
      defaultKeys.p1.D,
      '',
      '',
      '',
      '',
      defaultKeys.p1.SELECT,
      defaultKeys.p1.START,
      '',
      '',
      defaultKeys.p1.UP,
      defaultKeys.p1.DOWN,
      defaultKeys.p1.LEFT,
      defaultKeys.p1.RIGHT,
    ],
    p2: [
      defaultKeys.p2.A,
      defaultKeys.p2.C,
      defaultKeys.p2.B,
      defaultKeys.p2.D,
      '',
      '',
      '',
      '',
      defaultKeys.p1.SELECT,
      defaultKeys.p1.START,
      '',
      '',
      defaultKeys.p2.UP,
      defaultKeys.p2.DOWN,
      defaultKeys.p2.LEFT,
      defaultKeys.p2.RIGHT,
    ],
  }
}

let keys = getKeys()
let turbo = getTurboKeys()
let btnList = getBtnList()

function setKeys(config) {
  Object.assign(defaultKeys, config)
  keys = getKeys()
  turbo = getTurboKeys()
  btnList = getBtnList()
}



function keydown(e) {
  if (e.code in turbo) {
    const autoObj = turbo[e.code]
    if (autoObj.once) {
      nes.buttonDown(autoObj.key[0], autoObj.key[1])
      autoObj.timeout = window.setInterval(() => {
        if (autoObj.beDown) {
          nes.buttonDown(autoObj.key[0], autoObj.key[1])
        }
        else {
          nes.buttonUp(autoObj.key[0], autoObj.key[1])
        }
        autoObj.beDown = !autoObj.beDown
      }, 1000 / 16)
      autoObj.once = false
    }
  } else if (e.code in keys) {
    const key = keys[e.code]
    nes.buttonDown(key[0], key[1])
  }
}

function keyup(e) {
  if (e.code in turbo) {
    const autoObj = turbo[e.code]
    clearInterval(autoObj.timeout)
    autoObj.once = true
    nes.buttonUp(autoObj.key[0], autoObj.key[1])
    autoObj.beDown = false
  } else if (e.code in keys) {
    const key = keys[e.code]
    nes.buttonUp(key[0], key[1])
  }
}

function addKeyboardEvent() {
  document.addEventListener('keydown', keydown)
  document.addEventListener('keyup', keyup)
}

function removeKeyboardEvent() {
  document.removeEventListener('keydown', keydown)
  document.removeEventListener('keyup', keyup)
}

class GamepadManager {
  get gamepads() {
    return navigator.getGamepads().filter(Boolean)
  }

  constructor() {
    document.addEventListener('gamepadconnected', this.connectHandler.bind(this, true))
    document.addEventListener('gamepaddisconnected', this.connectHandler.bind(this, false))
    this.animationFrame = requestAnimationFrame(this.frame.bind(this))
    this.btnHolding = {
      p1: fillFalse(20),
      p2: fillFalse(20),
    }
    this.axesHolding = {
      p1: fillFalse(4),
      p2: fillFalse(4),
    }
  }

  connectHandler(state, e) {
    if (state) {
      this.gamepads[e.gamepad.index] = e.gamepad
    }
    else if (this.gamepads.length === 0) {
      this.close()
    }
  }

  onKeydown(player, bindex) {
    document.dispatchEvent(new KeyboardEvent('keydown', { code: btnList[player][bindex] }))
  }

  onKeyup(player, bindex) {
    document.dispatchEvent(new KeyboardEvent('keyup', { code: btnList[player][bindex] }))
  }

  // 连接或断开手柄
  connectHandler(state, e) {
    if (state) {
      this.gamepads[e.gamepad.index] = e.gamepad
    }
    else if (this.gamepads.length === 0) {
      this.close()
    }
  }

  /**
   * 推动摇杆
   * @param {*} player - 玩家
   * @param {*} check - 推动状态
   * @param {*} aindex - 摇杆方向索引
   * @param {*} bindex - 按键索引
   */
  axesHandler(player, check, aindex, bindex) {
    const hold = this.axesHolding[player]?.[aindex]
    if (check) {
      if (!hold) {
        this.onKeydown(player, bindex)
        this.axesHolding[player][aindex] = true
      }
    }
    else if (hold) {
      this.onKeyup(player, bindex)
      this.axesHolding[player][aindex] = false
    }
  }

  // 按下按钮
  btnHandler(player, btn, bindex) {
    const hold = this.btnHolding[player]?.[bindex]
    if (btn.pressed) {
      if (hold) {
        return
      }
      this.btnHolding[player][bindex] = true
      this.onKeydown(player, bindex)
    }
    else if (hold) {
      this.btnHolding[player][bindex] = false
      this.onKeyup(player, bindex)
    }
  }

  // 运行手柄
  run() {
    for (let gindex = 0; gindex < this.gamepads.length; gindex++) {
      // 支持两个手柄
      if (gindex > 1) {
        break
      }
      const player = `p${gindex + 1}`
      const gamepad = this.gamepads[gindex]

      gamepad.buttons.forEach(this.btnHandler.bind(this, player))

      const lr = gamepad.axes[0]
      const tb = gamepad.axes[1]

      this.axesHandler(player, lr > THRESHOLD, 0, 15)
      this.axesHandler(player, lr < -THRESHOLD, 1, 14)
      this.axesHandler(player, tb > THRESHOLD, 2, 13)
      this.axesHandler(player, tb < -THRESHOLD, 3, 12)
    }
  }

  // 开启帧动画
  frame() {
    this.run()
    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = requestAnimationFrame(this.frame.bind(this))
  }

  // 清除帧动画
  close() {
    this.btnHolding.p1.fill(false)
    this.btnHolding.p2.fill(false)
    cancelAnimationFrame(this.animationFrame)
  }
}