const container = document.getElementById('container')
const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')
ctx.width = '256'
ctx.height = '240'
let fpsInterval = 0
let romBuffer = null

let req = new XMLHttpRequest()

function inBrowser() {
  return typeof acquireVsCodeApi === 'undefined'
}

const vscode = inBrowser() ? undefined : acquireVsCodeApi()
// 标题
const title = document.getElementById('title')

// 开始按钮
const mask = document.getElementById('mask')
const startBtn = document.getElementById('start')
startBtn.addEventListener('click', () => {
  if (!romBuffer) {
    return
  }
  start()
})
function hiddenEl(el) {
  el.classList.add('hidden')
}
function showEl(el) {
  el.classList.remove('hidden')
}

// 加载中
const loading = document.getElementById('loading')

// 选择分辨率
const slt = document.getElementById('rsl')
slt.addEventListener('change', () => {
  container.style.width = slt.value + 'px'
  container.style.height = slt.value * 240 / 256 + 'px'
  setTimeout(() => {
    slt.blur()
    fitInParent(cvs)
  }, 50);
})

// 显示FPS
const fps = document.getElementById('fps')
const showFps = document.getElementById('showFps')
function getFPS() {
  fpsInterval = setInterval(() => {
    fps.textContent = nes.getFPS()?.toFixed(2) ?? '0.00'
  }, 1000)
}
showFps.addEventListener('change', () => {
  if (showFps.checked) {
    fps.style.display = 'block'
    getFPS()
  } else if (fpsInterval) {
    clearInterval(fpsInterval)
    fps.style.display = 'none'
  }
})

// 剪切画面边缘
const clipSize = document.getElementById('clipSize')
clipSize.addEventListener('change', () => {
  nes.ppu.clipToTvSize = clipSize.checked
})

// 游戏暂停
let isPause = false
const pauseBtn = document.getElementById('pause')
pauseBtn.addEventListener('click', () => {
  if (!romBuffer) {
    return
  }
  if (isPause) {
    play()
    pauseBtn.value = '暂停'
  } else {
    pause()
    pauseBtn.value = '继续'
  }
  isPause = !isPause
})

// 游戏静音
let isMut = false
const muteBtn = document.getElementById('mute')
muteBtn.addEventListener('click', () => {
  if (isMut) {
    setGain(100)
    muteBtn.value = '静音'
  } else {
    setGain(0)
    muteBtn.value = '恢复'
  }
  isMut = !isMut
})

// 游戏停止
let isStop = true
function stop() {
  if (isStop) {
    return
  }
  audioStop()
  animationStop()
  clearInterval(fpsInterval)
  nes.reset()
  isStop = true
}

// 游戏重置
const resetBtn = document.getElementById('reset')
function reset() {
  if (!romBuffer) {
    return
  }
  if (!isStop) {
    stop()
  }
  start()
}
resetBtn.addEventListener('click', reset)

const nes = new jsnes.NES({
  onFrame,
  onAudioSample,
  sampleRate: getSampleRate(),
})
addKeyboardEvent(nes)

// 触发错误消息
function emitError(message) {
  if (!inBrowser()) {
    vscode.postMessage({
      code: 404,
      type: 'error',
      message,
    })
  } else {
    console.error(message)
  }
  hiddenEl(loading)
}

// 开始
function start() {
  try {
    nes.loadROM(romBuffer)
  } catch (e) {
    emitError("读取失败，模拟器不支持该游戏ROM。")
    return
  }
  fitInParent(cvs)
  audioFrame(nes)
  animationFram(cvs)
  if (showFps.checked) {
    getFPS()
  }
  isStop = false
  isPause = false
  pauseBtn.value = '暂停'
  hiddenEl(mask)// 隐藏遮罩
}

// 加载ROM
function loadROM(url) {
  if (!isStop) {
    stop()
  }
  if (romBuffer) {
    start()
    return
  }
  req = new XMLHttpRequest()
  req.open('GET', url)
  req.overrideMimeType('text/plain; charset=x-user-defined')
  req.timeout = 300000
  req.ontimeout = () => {
    emitError(`${title.textContent}请求超时，可能是地址失效或网络不稳定。`)
  }
  req.onerror = () => {
    emitError(`${title.textContent}加载失败，可能是地址失效或网络不稳定。`)
  }
  req.onload = function () {
    if (this.status === 200) {
      romBuffer = this.responseText
      hiddenEl(loading)// 隐藏加载中
      showEl(startBtn)// 显示开始按钮
      inBrowser() && start()
    }
    else {
      emitError(`${title.textContent}加载失败，地址可能已经失效。`)
    }
  }
  req.send()
}

// 保存游戏
const saveBtn = document.getElementById('save')
let saveTimeout = null
saveBtn.addEventListener('click', () => {
  if (nes.cpu.irqRequested && !isStop && !isPause) {
    const data = JSON.stringify({ data: nes.toJSON(), name: title.textContent })
    localStorage.setItem('nes', data)
    saveBtn.value = '已存'
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      saveBtn.value = '保存'
      saveTimeout = null
    }, 1000)
  }
})

// 读取游戏
const loadBtn = document.getElementById('load')
let loadTimeout = null
loadBtn.addEventListener('click', () => {
  if (nes.cpu.irqRequested && !isStop && !isPause) {
    const saveData = JSON.parse(localStorage.getItem('nes'))
    if (saveData) {
      if (saveData.name !== title.textContent) {
        return emitError(`当前游戏[${title.textContent}]与保存的数据[${saveData.name}]不一致`)
      }
      try {
        nes.ppu.reset()
        nes.romData = saveData.data.romData
        nes.cpu.fromJSON(saveData.data.cpu)
        nes.mmap.fromJSON(saveData.data.mmap)
        nes.ppu.fromJSON(saveData.data.ppu)
        loadBtn.value = '已读'
        if (loadTimeout) {
          clearTimeout(loadTimeout)
        }
        loadTimeout = setTimeout(() => {
          loadBtn.value = '读取'
          loadTimeout = null
        }, 1000)
      }
      catch (_) {
        return emitError('无法读取，请开始游戏后重试')
      }
    }
  }
})

window.addEventListener('message', (e) => {
  showEl(mask)// 显示遮罩
  hiddenEl(startBtn)// 隐藏开始按钮
  showEl(loading)// 显示加载中
  if (e.data.lable) {
    title.textContent = e.data.lable
    romBuffer = null
  }
  req.abort()
  loadROM(e.data.url)
})

const gm = new GamepadManager()
gm.frame()

if (inBrowser()) {
  loadROM('./roms/超级魂斗罗 (v2.0) (简).nes')
}