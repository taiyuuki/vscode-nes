<script setup lang="ts">
import { NESEmulator } from '@nesjs/native'
import { type Ref, onMounted, reactive, ref, useTemplateRef } from 'vue'

const vscode = acquireVsCodeApi()

interface SaveState {
    id: string
    name: string
    timestamp: number
    data: Uint8Array
    screenshot?: string
}

interface GameData {
    name: string
    saves: SaveState[]
}

interface EmulatorSettings {
    scale: number
    smoothing: boolean
    muted: boolean
    volume: number
    clip8px: boolean
}

interface CheatCode {
    code: string
    description: string
    enabled: boolean
}

let emu: NESEmulator
const $cvs = useTemplateRef('cvs') as Ref<HTMLCanvasElement>

// 响应式状态
const isPlaying = ref(false)
const isPaused = ref(false)
const currentGame = ref<string>('')
const showSettings = ref(false)
const showSaveMenu = ref(false)
const showCheatMenu = ref(false)

// 设置选项
const settings = reactive<EmulatorSettings>({
    scale: 2,
    smoothing: false,
    muted: false,
    volume: 0.8,
    clip8px: false,
})

// 金手指
const cheats = ref<CheatCode[]>([])
const newCheatCode = ref('')
const newCheatDesc = ref('')

// 存档数据
const gameData = ref<Record<string, GameData>>({})

// IndexedDB 操作
let db: IDBDatabase

async function initDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('NESEmulator', 1)
    
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
    
        request.onupgradeneeded = () => {
            const db = request.result
      
            // 创建存档表
            if (!db.objectStoreNames.contains('saves')) {
                const saveStore = db.createObjectStore('saves', { keyPath: 'id' })
                saveStore.createIndex('game', 'game', { unique: false })
            }
      
            // 创建设置表
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' })
            }
      
            // 创建金手指表
            if (!db.objectStoreNames.contains('cheats')) {
                const cheatStore = db.createObjectStore('cheats', { keyPath: 'id' })
                cheatStore.createIndex('game', 'game', { unique: false })
            }
        }
    })
}

async function saveToIndexedDB(storeName: string, data: any) {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    return store.put(data)
}

async function loadFromIndexedDB(storeName: string, key: string) {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)

    return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

async function getAllFromIndexedDB(storeName: string, indexName?: string, indexValue?: string) {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
  
    return new Promise((resolve, reject) => {
        let request: IDBRequest
    
        if (indexName && indexValue) {
            const index = store.index(indexName)
            request = index.getAll(indexValue)
        }
        else {
            request = store.getAll()
        }
    
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

async function deleteFromIndexedDB(storeName: string, key: string) {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    return store.delete(key)
}

// 存档管理
async function saveState(slotId: number) {
    if (!emu || !currentGame.value) return
  
    try {
        const stateData = emu.saveState()
        if (!stateData) {
            vscode.postMessage({ type: 'error', message: '保存状态失败' })

            return
        }
    
        // 截图
        const screenshot = $cvs.value.toDataURL('image/png')
    
        const saveState: SaveState = {
            id: `${currentGame.value}_slot_${slotId}`,
            name: `存档槽 ${slotId}`,
            timestamp: Date.now(),
            data: stateData,
            screenshot,
        }
    
        await saveToIndexedDB('saves', {
            ...saveState,
            game: currentGame.value,
        })
    
        // 更新本地数据
        if (!gameData.value[currentGame.value]) {
            gameData.value[currentGame.value] = { name: currentGame.value, saves: [] }
        }
    
        const gameInfo = gameData.value[currentGame.value]!
        const existingIndex = gameInfo.saves.findIndex(s => s.id === saveState.id)
        if (existingIndex >= 0) {
            gameInfo.saves[existingIndex] = saveState
        }
        else {
            gameInfo.saves.push(saveState)
        }
    
        showSaveMenu.value = false
        vscode.postMessage({ type: 'info', message: `游戏已保存到存档槽 ${slotId}` })
    }
    catch(error) {
        console.error('保存失败:', error)
        vscode.postMessage({ type: 'error', message: '保存失败' })
    }
}

async function loadState(saveState: SaveState) {
    if (!emu) return
  
    try {
        emu.loadState(saveState.data)
        showSaveMenu.value = false
        vscode.postMessage({ type: 'info', message: `已加载存档: ${saveState.name}` })
    }
    catch(error) {
        console.error('加载存档失败:', error)
        vscode.postMessage({ type: 'error', message: '加载存档失败' })
    }
}

async function deleteSave(saveState: SaveState) {
    try {
        await deleteFromIndexedDB('saves', saveState.id)
    
        if (gameData.value[currentGame.value]) {
            const gameInfo = gameData.value[currentGame.value]!
            const index = gameInfo.saves.findIndex(s => s.id === saveState.id)
            if (index >= 0) {
                gameInfo.saves.splice(index, 1)
            }
        }
    
        vscode.postMessage({ type: 'info', message: '存档已删除' })
    }
    catch(error) {
        console.error('删除存档失败:', error)
        vscode.postMessage({ type: 'error', message: '删除存档失败' })
    }
}

// 设置管理
async function saveSettings() {
    try {
        await saveToIndexedDB('settings', {
            key: 'emulator_settings',
            ...settings,
        })
    }
    catch(error) {
        console.error('保存设置失败:', error)
    }
}

async function loadSettings() {
    try {
        const savedSettings: any = await loadFromIndexedDB('settings', 'emulator_settings')
        if (savedSettings) {
            Object.assign(settings, savedSettings)
        }
    }
    catch(error) {
        console.error('加载设置失败:', error)
    }
}

function applySettings() {
    if (!emu) return
  
    emu.setScale(settings.scale)
    emu.setSmoothing(settings.smoothing)
    emu.setVolume(settings.muted ? 0 : settings.volume)
    emu.setClip8px(settings.clip8px ? settings.clip8px : false)
  
    saveSettings()
}

// 金手指管理
async function loadCheats() {
    if (!currentGame.value) return
  
    try {

        // 清除当前金手指
        emu.clearAllCheats()
        
        const gameCheats: any = await getAllFromIndexedDB('cheats', 'game', currentGame.value)
        
        // 重新加载金手指，默认都设为禁用状态
        const loadedCheats = (gameCheats || []).map((cheat: any) => ({
            code: cheat.code,
            description: cheat.description,
            enabled: false, // 默认关闭
        }))
        
        cheats.value = loadedCheats
    }
    catch(error) {
        console.error('加载金手指失败:', error)
    }
}

async function addCheat() {
    if (!newCheatCode.value.trim() || !currentGame.value) return
  
    try {

        // 检查是否已存在相同代码的金手指
        const existingCheat = cheats.value.find(c => c.code === newCheatCode.value)
        if (existingCheat) {
            vscode.postMessage({ type: 'error', message: '该金手指已存在' })

            return
        }
        
        const success = emu.addCheat(newCheatCode.value)
        if (!success) {
            vscode.postMessage({ type: 'error', message: '无效的金手指代码' })

            return
        }
    
        const cheat: CheatCode = {
            code: newCheatCode.value,
            description: newCheatDesc.value || '未命名金手指',
            enabled: true,
        }
    
        // 使用唯一键保存到IndexedDB
        await saveToIndexedDB('cheats', {
            id: `${currentGame.value}_${cheat.code}`, // 使用游戏名和代码作为唯一ID
            game: currentGame.value,
            ...cheat,
        })
    
        cheats.value.push(cheat)
        newCheatCode.value = ''
        newCheatDesc.value = ''
    
        vscode.postMessage({ type: 'info', message: '金手指已添加' })
    }
    catch(error) {
        console.error('添加金手指失败:', error)
        vscode.postMessage({ type: 'error', message: '添加金手指失败' })
    }
}

async function toggleCheat(cheat: CheatCode) {
    try {
        if (cheat.enabled) {

            // 如果当前是启用状态，禁用它
            emu.removeCheat(cheat.code)
            cheat.enabled = false
        }
        else {

            // 如果当前是禁用状态，先尝试添加，然后启用
            const success = emu.addCheat(cheat.code)
            if (success) {
                cheat.enabled = true
            }
            else {
                vscode.postMessage({ type: 'error', message: '无效的金手指代码' })

                return
            }
        }
    
        // 更新数据库中的状态
        await saveToIndexedDB('cheats', {
            id: `${currentGame.value}_${cheat.code}`,
            game: currentGame.value,
            ...cheat,
        })
    }
    catch(error) {
        console.error('切换金手指失败:', error)
    }
}

async function removeCheat(cheat: CheatCode) {
    try {

        // 从模拟器中移除
        emu.removeCheat(cheat.code)
    
        // 从本地列表移除
        const index = cheats.value.indexOf(cheat)
        if (index >= 0) {
            cheats.value.splice(index, 1)
        }
    
        // 从数据库删除
        await deleteFromIndexedDB('cheats', `${currentGame.value}_${cheat.code}`)
    
        vscode.postMessage({ type: 'info', message: '金手指已移除' })
    }
    catch(error) {
        console.error('移除金手指失败:', error)
    }
}

// 游戏控制
function togglePlayPause() {
    if (!emu) return
  
    if (isPaused.value) {
        emu.resume()
        isPaused.value = false
    }
    else {
        emu.pause()
        isPaused.value = true
    }
}

function resetGame() {
    if (!emu) return
    emu.reset()
}

function stopGame() {
    if (!emu) return
    emu.stop()
    isPlaying.value = false
    isPaused.value = false
    currentGame.value = ''
}

// 加载游戏存档数据
async function loadGameData(gameName: string) {
    try {
        const saves: any = await getAllFromIndexedDB('saves', 'game', gameName)
    
        gameData.value[gameName] = {
            name: gameName,
            saves: saves || [],
        }
    }
    catch(error) {
        console.error('加载游戏数据失败:', error)
    }
}

// 辅助函数
function getSaveBySlot(slotId: number) {
    if (!currentGame.value || !gameData.value[currentGame.value]) return null
    const gameInfo = gameData.value[currentGame.value]!

    return gameInfo.saves.find(save => 
        save.id === `${currentGame.value}_slot_${slotId}`)
}

function formatTime(timestamp: number) {
    const date = new Date(timestamp)

    return date.toLocaleString('zh-CN')
}

function saveGameState(slotId: number) {
    saveState(slotId)
}

function loadGameState(save: SaveState) {
    loadState(save)
}

function addCheatCode() {
    addCheat()
}

function toggleCheatCode(cheat: CheatCode) {
    toggleCheat(cheat)
}

function removeCheatCode(cheat: CheatCode) {
    removeCheat(cheat)
}

async function enableAudio() {
    if (emu && !settings.muted) {
        await emu.enableAudio()
        emu.setVolume(settings.volume)
    }
}

async function onInteraction() {
    await enableAudio()
    window.removeEventListener('click', onInteraction)
    window.removeEventListener('keydown', onInteraction)
    window.removeEventListener('touchstart', onInteraction)
}

onMounted(async() => {

    // 初始化数据库
    db = await initDB()
  
    // 加载设置
    await loadSettings()
  
    // 创建模拟器实例
    emu = new NESEmulator($cvs.value, {
        scale: settings.scale,
        smoothing: settings.smoothing,
        audioSampleRate: 44100,
        enableCheat: true,
        clip8px: settings.clip8px,
    })
  
    // 监听VSCode消息
    window.addEventListener('message', async e => {
        switch(e.data.type) {
            case 'play':
                try {
                    const data = await fetch(e.data.url)
                    const buffer = await data.arrayBuffer()
                    await emu.loadROM(new Uint8Array(buffer))
          
                    isPlaying.value = true
                    isPaused.value = false
                    currentGame.value = e.data.lable || 'Unknown Game'
          
                    // 加载游戏相关数据
                    await loadGameData(currentGame.value)
                    await loadCheats()
          
                    // 应用设置
                    applySettings()
                    await emu.start()
                }
                catch(error) {
                    console.error('加载游戏失败:', error)
                    vscode.postMessage({ type: 'error', message: '加载游戏失败' })
                }
                break
        
            case 'setController':

                // 处理控制器设置
                break
        
            case 'delete':

                // 处理游戏删除
                if (currentGame.value === e.data.lable) {
                    stopGame()
                }
                break
        }
    })

    // 用户交互音频启用
    window.addEventListener('click', onInteraction, { once: true })
    window.addEventListener('keydown', onInteraction, { once: true })
    window.addEventListener('touchstart', onInteraction, { once: true })
    
    // 确保所有初始化完成后再通知VSCode
    await new Promise(resolve => setTimeout(resolve, 100))
    vscode.postMessage({ type: 'ready' })
})
</script>

<template>
  <div class="nes-emulator">
    <!-- 游戏画面 -->
    <div class="game-container">
      <canvas
        ref="cvs"
        class="game-canvas"
      />
      
      <!-- 控制栏 -->
      <div
        v-if="isPlaying"
        class="controls"
      >
        <button
          class="control-btn"
          @click="togglePlayPause"
        >
          {{ isPaused ? '▶️' : '⏸️' }}
        </button>
        <button
          class="control-btn"
          @click="resetGame"
        >
          🔄
        </button>
        <button
          class="control-btn"
          @click="showSaveMenu = true"
        >
          💾
        </button>
        <button
          class="control-btn"
          @click="showSettings = true"
        >
          ⚙️
        </button>
        <button
          class="control-btn"
          @click="showCheatMenu = true"
        >
          🎮
        </button>
      </div>
    </div>

    <!-- 存档管理菜单 -->
    <div
      v-if="showSaveMenu"
      class="modal-overlay"
      @click="showSaveMenu = false"
    >
      <div
        class="modal save-modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>存档管理</h3>
          <button
            class="close-btn"
            @click="showSaveMenu = false"
          >
            ✕
          </button>
        </div>
        <div class="save-slots">
          <div
            v-for="slotId in [1, 2, 3]"
            :key="slotId"
            class="save-slot-row"
          >
            <!-- 左侧：截图预览或空方框 -->
            <div class="screenshot-area">
              <img
                v-if="getSaveBySlot(slotId)?.screenshot"
                :src="getSaveBySlot(slotId)?.screenshot"
                alt="存档截图"
                class="save-screenshot"
              >
              <div
                v-else
                class="empty-screenshot"
              >
                <span />
              </div>
            </div>
            
            <!-- 中间：存档信息 -->
            <div class="save-info">
              <div
                v-if="getSaveBySlot(slotId)"
                class="save-details"
              >
                <div class="save-time">
                  {{ formatTime(getSaveBySlot(slotId)?.timestamp || 0) }}
                </div>
                <div class="save-name">
                  存档位 {{ slotId }}
                </div>
              </div>
              <div
                v-else
                class="no-save"
              >
                没有存档
              </div>
            </div>
            
            <!-- 右侧：操作按钮 -->
            <div class="save-actions">
              <button
                v-if="getSaveBySlot(slotId)"
                class="action-btn load-btn"
                @click="loadGameState(getSaveBySlot(slotId)!)"
              >
                读档
              </button>
              <button
                class="action-btn save-btn"
                @click="saveGameState(slotId)"
              >
                存档
              </button>
              <button
                v-if="getSaveBySlot(slotId)"
                class="action-btn delete-btn"
                @click="deleteSave(getSaveBySlot(slotId)!)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置菜单 -->
    <div
      v-if="showSettings"
      class="modal-overlay"
      @click="showSettings = false"
    >
      <div
        class="modal settings-modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>设置</h3>
          <button
            class="close-btn"
            @click="showSettings = false"
          >
            ✕
          </button>
        </div>
        <div class="settings-content">
          <div class="setting-group">
            <label>缩放倍数: {{ settings.scale }}x</label>
            <input 
              v-model.number="settings.scale" 
              type="range" 
              min="1" 
              max="4" 
              step="1"
              @input="applySettings"
            >
          </div>
          
          <div class="setting-group">
            <label>
              <input 
                v-model="settings.smoothing" 
                type="checkbox" 
                @change="applySettings"
              >
              启用抗锯齿
            </label>
          </div>
          
          <div class="setting-group">
            <label>
              <input 
                v-model="settings.clip8px" 
                type="checkbox" 
                @change="applySettings"
              >
              裁剪边框
            </label>
          </div>
          
          <div class="setting-group">
            <label>
              <input 
                v-model="settings.muted" 
                type="checkbox" 
                @change="applySettings"
              >
              静音
            </label>
          </div>
          
          <div
            v-if="!settings.muted"
            class="setting-group"
          >
            <label>音量: {{ Math.round(settings.volume * 100) }}%</label>
            <input 
              v-model.number="settings.volume" 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              @input="applySettings"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 金手指菜单 -->
    <div
      v-if="showCheatMenu"
      class="modal-overlay"
      @click="showCheatMenu = false"
    >
      <div
        class="modal cheats-modal"
        @click.stop
      >
        <div class="modal-header">
          <h3>金手指</h3>
          <button
            class="close-btn"
            @click="showCheatMenu = false"
          >
            ✕
          </button>
        </div>
        <div class="cheats-content">
          <!-- 添加金手指 -->
          <div class="add-cheat">
            <h4>添加金手指</h4>
            <div class="cheat-input-group">
              <input 
                v-model="newCheatCode" 
                placeholder="例如: 079F-01-01"
                class="cheat-input"
              >
              <input 
                v-model="newCheatDesc" 
                placeholder="描述 (可选)"
                class="cheat-input"
              >
              <button
                class="add-cheat-btn"
                @click="addCheatCode"
              >
                添加
              </button>
            </div>
          </div>
          
          <!-- 金手指列表 -->
          <div class="cheats-list">
            <h4>已添加的金手指</h4>
            <div
              v-if="cheats.length === 0"
              class="no-cheats"
            >
              暂无金手指
            </div>
            <div
              v-for="cheat in cheats"
              :key="cheat.code"
              class="cheat-item"
            >
              <div class="cheat-info">
                <div class="cheat-desc">
                  {{ cheat.description }}
                </div>
                <div class="cheat-code">
                  {{ cheat.code }}
                </div>
              </div>
              <div class="cheat-actions">
                <button 
                  :class="['toggle-btn', cheat.enabled ? 'enabled' : 'disabled']" 
                  @click="toggleCheatCode(cheat)"
                >
                  {{ cheat.enabled ? '关闭' : '开启' }}
                </button>
                <button
                  class="remove-btn"
                  @click="removeCheatCode(cheat)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nes-emulator {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.game-container {
  position: relative;
  margin-bottom: 20px;
}

.game-canvas {
  border: 2px solid #333;
  border-radius: 8px;
  background: #000;
  image-rendering: pixelated;
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.control-btn {
  background: #2d2d2d;
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #3d3d3d;
  transform: translateY(-2px);
}

.control-btn:active {
  transform: translateY(0);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2d2d2d;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #444;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #444;
}

/* 存档样式 */
.save-modal {
  min-width: 600px;
  max-width: 800px;
}

.save-slots {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.save-slot-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid #444;
  border-radius: 10px;
  background: #333;
  transition: background 0.2s;
  min-height: 100px;
}

.save-slot-row:hover {
  background: #3a3a3a;
}

/* 左侧：截图区域 */
.screenshot-area {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-screenshot {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #555;
  background: #1a1a1a;
}

.empty-screenshot {
  width: 120px;
  height: 90px;
  border: 2px dashed #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  color: #888;
  font-size: 12px;
}

/* 中间：存档信息 */
.save-info {
  flex: 1;
  padding: 0 20px;
  min-width: 0;
}

.save-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.save-time {
  font-size: 13px;
  color: #bbb;
  line-height: 1.4;
}

.no-save {
  color: #888;
  font-style: italic;
  font-size: 14px;
  text-align: center;
}

/* 右侧：操作按钮 */
.save-actions {
  display: flex;
  flex-direction: row;
  gap: 6px;
  min-width: 160px;
  align-items: center;
}

.action-btn {
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 12px;
  text-align: center;
  min-width: 50px;
  white-space: nowrap;
}

.action-btn.save-btn {
  background: #28a745;
}

.action-btn.save-btn:hover {
  background: #34ce57;
  transform: translateY(-1px);
}

.action-btn.load-btn {
  background: #007acc;
}

.action-btn.load-btn:hover {
  background: #1a8dd8;
  transform: translateY(-1px);
}

.action-btn.delete-btn {
  background: #d73a49;
}

.action-btn.delete-btn:hover {
  background: #e85d75;
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
}

.no-saves {
  text-align: center;
  color: #666;
  padding: 40px;
}

/* 设置样式 */
.settings-modal {
  min-width: 400px;
}

.settings-content {
  padding: 20px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.setting-group input[type="range"] {
  width: 100%;
  margin-top: 5px;
}

.setting-group input[type="checkbox"] {
  margin-right: 8px;
}

/* 金手指样式 */
.cheats-modal {
  min-width: 500px;
}

.cheats-content {
  padding: 20px;
}

.add-cheat {
  margin-bottom: 30px;
}

.add-cheat h4 {
  margin: 0 0 15px 0;
}

.cheat-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cheat-input {
  flex: 1;
  background: #3d3d3d;
  border: 1px solid #555;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
}

.cheat-input:focus {
  outline: none;
  border-color: #007acc;
}

.add-cheat-btn {
  background: #28a745;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.add-cheat-btn:hover {
  background: #34ce57;
}

.cheats-list h4 {
  margin: 0 0 15px 0;
  border-top: 1px solid #444;
  padding-top: 20px;
}

.cheat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 6px;
  margin-bottom: 8px;
}

.cheat-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cheat-desc {
  font-weight: bold;
  margin-right: 10px;
}

.cheat-code {
  font-family: monospace;
  font-size: 12px;
  color: #aaa;
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 3px;
}

.cheat-actions {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.toggle-btn.enabled {
  background: #28a745;
}

.toggle-btn.disabled {
  background: #6c757d;
}

.toggle-btn:hover {
  opacity: 0.8;
}

.remove-btn {
  background: #d73a49;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: #e85d75;
}

.no-cheats {
  text-align: center;
  color: #666;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nes-emulator {
    padding: 10px;
  }
  
  .controls {
    flex-wrap: wrap;
  }
  
  .control-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .modal {
    margin: 10px;
  }
  
  .settings-modal,
  .cheats-modal {
    min-width: 0;
  }
  
  .cheat-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .save-modal {
    min-width: 0;
    margin: 10px;
  }
  
  .save-slot-row {
    flex-direction: column;
    text-align: center;
    gap: 15px;
    min-height: auto;
    padding: 15px;
  }
  
  .screenshot-area {
    width: 100px;
    height: 75px;
  }
  
  .save-screenshot,
  .empty-screenshot {
    width: 100px;
    height: 75px;
  }
  
  .save-info {
    padding: 0;
    text-align: center;
  }
  
  .save-actions {
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    min-width: auto;
  }
  
  .action-btn {
    flex: 1;
    min-width: 45px;
    padding: 5px 8px;
    font-size: 11px;
  }
}
</style>
