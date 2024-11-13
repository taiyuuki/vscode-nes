const saveBtn = document.getElementById('save')
const loadBtn = document.getElementById('load')
const removeBtn = document.getElementById('remove')
const downloadBtn = document.getElementById('download')
const saveImage = document.getElementById('save-image')
const saveDataMsg = document.getElementById('save-data-message')
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
function ableToDowload() {
  downloadBtn.removeAttribute('disabled')
  downloadBtn.value = '下载ROM'
}
function disableDownload(value) {
  downloadBtn.setAttribute('disabled', true)
  downloadBtn.value = value
}

// 加载中
const loading = document.getElementById('loading')

// 选择分辨率
const slt = document.getElementById('rsl')
function toggleSolution() {
  container.style.width = slt.value + 'px'
  container.style.height = slt.value * 240 / 256 + 'px'
  setTimeout(() => {
    slt.blur()
    fitInParent(cvs)
  }, 50)
}
slt.addEventListener('change', () => {
  toggleSolution()
  saveConfig()
})

// 显示FPS
const fps = document.getElementById('fps')
const showFps = document.getElementById('showFps')
function getFPS() {
  fpsInterval = setInterval(() => {
    fps.textContent = nes.getFPS()?.toFixed(2) ?? '0.00'
  }, 1000)
}
function toggleShowFPS() {
  if (showFps.checked) {
    fps.style.display = 'block'
    getFPS()
  } else if (fpsInterval) {
    clearInterval(fpsInterval)
    fps.style.display = 'none'
  }
}
showFps.addEventListener('change', () => {
  toggleShowFPS()
  saveConfig()
})

// 剪切画面边缘
const clipSize = document.getElementById('clipSize')
clipSize.addEventListener('change', () => {
  nes.ppu.clipToTvSize = clipSize.checked
  saveConfig()
})

// 游戏暂停
let isPause = false
const pauseBtn = document.getElementById('pause')
function togglePause() {
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
}
pauseBtn.addEventListener('click', togglePause)

// 游戏静音
let isMut = false
const muteBtn = document.getElementById('mute')
function toggleMut() {
  if (isMut) {
    setGain(100)
    muteBtn.value = '静音'
  } else {
    setGain(0)
    muteBtn.value = '恢复'
  }
}
muteBtn.addEventListener('click', () => {
  isMut = !isMut
  toggleMut()
  saveConfig()
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

function gameId() {
  return romBuffer.substring(3, 20)
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
async function loadROM(url) {
  if (!isStop) {
    stop()
  }
  if (romBuffer) {
    start()
    return
  }
  return new Promise((resolve, reject) => {
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
        loadList()
        const data = localStorage.getItem(gameId())
        if (data) {
          const json = JSON.parse(data)
          showEl(loadBtn)
          showEl(removeBtn)
          const img = new Image()
          saveDataMsg.textContent = json.time
          img.src = json.dataURL
          saveImage.appendChild(img)
        }
        resolve(true)
      }
      else {
        emitError(`${title.textContent}加载失败，地址可能已经失效。`)
        reject(false)
      }
    }
    req.send()
  })
}

function getNesData() {
  const ppuData = nes.ppu.toJSON()
  const cpuData = nes.cpu.toJSON()
  delete ppuData.attrib
  delete ppuData.bgbuffer
  delete ppuData.buffer
  delete ppuData.pixrendered
  delete ppuData.vramMirrorTable
  const vramMenZip = compressArray(ppuData.vramMem)
  const nameTableZip = compressNameTable(ppuData.nameTable)
  const ptTileZip = compressPtTile(ppuData.ptTile)
  const cpuMemZip = compressArray(cpuData.mem)
  delete ppuData.vramMem
  delete ppuData.nameTable
  delete cpuData.mem
  delete ppuData.ptTile
  return JSON.stringify({
    title: title.textContent,
    data: {
      cpu: cpuData,
      mmap: nes.mmap.toJSON(),
      ppu: ppuData,
      vramMenZip,
      nameTableZip,
      cpuMemZip,
      ptTileZip,
    },
  })
}

// 没有存档时隐藏部分按钮
function initSaveData() {
  hiddenEl(loadBtn)
  hiddenEl(removeBtn)
  saveImage.innerHTML = ''
  saveDataMsg.textContent = '暂无存档'
}

// 保存游戏
let saveTimeout = null
function saved() {
  if (cvs) {
    const img = new Image()
    img.src = cvs.toDataURL('image/png')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 48
      canvas.height = 45
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 48, 45)
      const dataURL = canvas.toDataURL('image/png')
      const resizeImage = new Image()
      saveBtn.textContent = '已存'
      saveDataMsg.textContent = `保存于 ${getCurrentTime()}`
      resizeImage.src = dataURL
      saveImage.innerHTML = ''
      saveImage.appendChild(resizeImage)
      localStorage.setItem(gameId(), JSON.stringify({
        dataURL,
        time: saveDataMsg.textContent
      }))
    }
  }
  showEl(removeBtn)
  showEl(loadBtn)
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    saveBtn.textContent = '保存'
    saveTimeout = null
  }, 1000)
}
saveBtn.addEventListener('click', (e) => {
  if (nes.cpu.irqRequested && !isStop) {
    const data = {
      id: gameId(),
      nes: getNesData(),
    }
    saveData({
      data,
      onError: (code) => {
        if (code === 0) {
          putData({
            data,
            onSuccess: saved,
            onError: () => {
              localStorage.setItem('nes', JSON.stringify(data))
            }
          })
        }
      },
      onSuccess: saved
    })
  } else {
    emitError('游戏尚未运行，请开始游戏后再试。')
  }
})

// 读取游戏
let loadTimeout = null
function load(saveData) {
  try {
    nes.ppu.reset()
    const ppuData = saveData.data.ppu
    const cpuData = saveData.data.cpu
    ppuData.attrib = get_fill_arr(0x20, 0)
    ppuData.bgbuffer = get_fill_arr(0xF000, 0)
    ppuData.buffer = get_fill_arr(0xF000, 0)
    ppuData.pixrendered = get_fill_arr(0xF000, 0)
    ppuData.vramMem = decompressArray(saveData.data.vramMenZip)
    ppuData.nameTable = decompressNameTable(saveData.data.nameTableZip)
    ppuData.vramMirrorTable = getVramMirrorTable()
    ppuData.ptTile = decompressPtTile(saveData.data.ptTileZip)
    cpuData.mem = decompressArray(saveData.data.cpuMemZip)
    nes.ppu.reset()
    nes.romData = romBuffer
    nes.cpu.fromJSON(cpuData)
    nes.mmap.fromJSON(saveData.data.mmap)
    nes.ppu.fromJSON(ppuData)
    loadBtn.textContent = '已读'
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }
    loadTimeout = setTimeout(() => {
      loadBtn.textContent = '读取'
      loadTimeout = null
    }, 1000)
  }
  catch (e) {
    console.log(e)
    return emitError('读取失败，数据丢失或无效。')
  }
}
loadBtn.addEventListener('click', () => {
  if (nes.cpu.irqRequested && !isStop) {
    if (isPause) {
      togglePause()
    }
    loadData({
      id: gameId(),
      onSuccess(res) {
        if (res.result?.nes) {
          const saveData = JSON.parse(res.result.nes)
          if (saveData) {
            load(saveData)
          } else {
            return emitError('读取失败，数据丢失或无效。')
          }
        }
        else {
          return emitError('读取失败，数据丢失或无效。')
        }
      },
      onError() {
        const loaclItem = localStorage.getItem('nes')
        if (loaclItem && 'nes' in loaclItem) {
          const saveData = JSON.parse(loaclItem.nes)
          load(saveData)
        }
      },
    })
  } else {
    emitError('游戏尚未运行，请开始游戏后再试。')
  }
})

// 删除存档
removeBtn.addEventListener('click', () => {
  removeData({
    id: gameId(),
    onSuccess: initSaveData
  })
  localStorage.removeItem(gameId())
})

// 保存配置
function saveConfig() {
  localStorage.setItem('config', JSON.stringify({
    showFps: showFps.checked,
    isMut,
    slt: slt.value,
    clipSize: clipSize.checked,
  }))
}

// 读取配置
function loadConfig() {
  const data = localStorage.getItem('config')
  if (data) {
    const config = JSON.parse(data)
    showFps.checked = config.showFps
    isMut = config.isMut
    clipSize.checked = config.clipSize
    nes.ppu.clipToTvSize = config.clipSize
    slt.value = config.slt
    toggleMut()
    toggleSolution()
    toggleShowFPS()
  }
}

// 下载ROM到本地
function saveROM() {
  if (romBuffer) {
    vscode.postMessage({
      type: 'download',
      content: romBuffer,
      fileName: title.textContent,
    })
    disableDownload('本地ROM')// 禁用下载
  }
}

downloadBtn.addEventListener('click', saveROM)

window.addEventListener('message', (e) => {
  disableDownload('下载ROM')// 禁用下载
  showEl(mask)// 显示遮罩
  hiddenEl(startBtn)// 隐藏开始按钮
  showEl(loading)// 显示加载中
  initSaveData()
  clearList()
  if (e.data.lable) {
    title.textContent = e.data.lable
    romBuffer = null
  }
  if (e.data.controller) {
    setKeys(e.data.controller)
  }
  req.abort()
  loadROM(e.data.url).then(() => {
    if (e.data.isLocal) {
      disableDownload('本地ROM')// 禁用下载
    }
    else {
      ableToDowload()// 允许下载
    }
  })
})

window.onload = () => {
  const gm = new GamepadManager()
  gm.frame()
  loadConfig()
}
