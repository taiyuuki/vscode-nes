const THRESHOLD = 0.3

// 键盘按键
const keys = {
  'KeyW': [1, jsnes.Controller.BUTTON_UP],
  'KeyS': [1, jsnes.Controller.BUTTON_DOWN],
  'KeyA': [1, jsnes.Controller.BUTTON_LEFT],
  'KeyD': [1, jsnes.Controller.BUTTON_RIGHT],
  'Digit1': [1, jsnes.Controller.BUTTON_START],
  'Digit2': [1, jsnes.Controller.BUTTON_SELECT],
  'KeyJ': [1, jsnes.Controller.BUTTON_B],
  'KeyK': [1, jsnes.Controller.BUTTON_A],
  'ArrowUp': [2, jsnes.Controller.BUTTON_UP],
  'ArrowDown': [2, jsnes.Controller.BUTTON_DOWN],
  'ArrowLeft': [2, jsnes.Controller.BUTTON_LEFT],
  'ArrowRight': [2, jsnes.Controller.BUTTON_RIGHT],
  'Numpad1': [2, jsnes.Controller.BUTTON_B],
  'Numpad2': [2, jsnes.Controller.BUTTON_A],
}

// 连发按键
const turbo = {
  'KeyU': {
    key: keys['KeyJ'],
    timeout: 0,
    beDown: false,
    once: true,
  },
  'KeyI': {
    key: keys['KeyK'],
    timeout: 0,
    beDown: false,
    once: true,
  },
  'Numpad4': {
    key: keys['Numpad1'],
    timeout: 0,
    beDown: false,
    once: true,
  },
  'Numpad5': {
    key: keys['Numpad2'],
    timeout: 0,
    beDown: false,
    once: true,
  },
}

function getBtnList() {
  return {
    p1: [
      'KeyK',
      'KeyI',
      'KeyJ',
      'KeyU',
      '',
      '',
      '',
      '',
      'Digit2',
      'Digit1',
      '',
      '',
      'KeyW',
      'KeyS',
      'KeyA',
      'KeyD',
    ],
    p2: [
      'Numpad2',
      'Numpad5',
      'Numpad1',
      'Numpad4',
      '',
      '',
      '',
      '',
      'Digit2',
      'Digit1',
      '',
      '',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ],
  }
}

const btnList = getBtnList()

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
   * @param {*} aindex - 摇杆放向索引
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