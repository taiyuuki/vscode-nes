<script setup lang="ts">
import { NESEmulator } from '@nesjs/native'
import { type Ref, onMounted, ref, useTemplateRef } from 'vue'
import { extract7z } from '../7z'
import GameControls from './emulator/GameControls.vue'
import SaveStateModal from './emulator/SaveStateModal.vue'
import SettingsModal from './emulator/SettingsModal.vue'
import CheatModal from './emulator/CheatModal.vue'
import { useEmulatorDB } from './emulator/useEmulatorDB'
import { useGameState } from './emulator/useGameState'
import { useEmulatorSettings } from './emulator/useEmulatorSettings'
import { useCheats } from './emulator/useCheats'

const vscode = acquireVsCodeApi()

let emu: NESEmulator
const $cvs = useTemplateRef('cvs') as Ref<HTMLCanvasElement>

// 使用组合式函数管理状态
const { db, initDB } = useEmulatorDB()
const {
    isPlaying,
    isPaused,
    currentGame,
    gameData,
    loadGameData,
    saveState,
    loadState,
    deleteSave,
} = useGameState(vscode)

const {
    settings,
    showSettings,
    loadSettings,
    saveSettings,
    applySettings: applySettingsToEmulator,
} = useEmulatorSettings()

const {
    cheats,
    showCheatMenu,
    loadCheats,
    addCheat,
    toggleCheat,
    removeCheat,
} = useCheats(vscode)

const showSaveMenu = ref(false)

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

// 应用设置
function applySettings() {
    if (!emu) return
    applySettingsToEmulator(emu)
}

// 存档相关
async function handleSaveState(slotId: number) {
    if (!emu || !currentGame.value) return
    await saveState(emu, $cvs.value, slotId, db.value!)
}

async function handleLoadState(saveStateData: any) {
    if (!emu) return
    await loadState(emu, saveStateData)
    showSaveMenu.value = false
}

async function handleDeleteSave(saveStateData: any) {
    await deleteSave(saveStateData, db.value!)
}

// 金手指相关
async function handleAddCheat(code: string, description: string) {
    if (!emu || !currentGame.value) return
    await addCheat(emu, code, description, currentGame.value, db.value!)
}

async function handleToggleCheat(cheat: any) {
    if (!emu || !currentGame.value) return
    await toggleCheat(emu, cheat, currentGame.value, db.value!)
}

async function handleRemoveCheat(cheat: any) {
    if (!emu || !currentGame.value) return
    await removeCheat(emu, cheat, currentGame.value, db.value!)
}

// 启用音频
async function enableAudio() {
    if (emu) {
        await emu.enableAudio()
        emu.setVolume(settings.muted ? 0 : settings.volume)
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
    db.value = await initDB()
    
    // 加载设置
    await loadSettings(db.value)
    
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
                    currentGame.value = e.data.label || 'Unknown Game'
                    
                    await loadGameData(currentGame.value, db.value!)
                    await loadCheats(emu, currentGame.value, db.value!)
                    
                    applySettings()
                    await emu.start()
                }
                catch(error) {
                    console.error('加载游戏失败:', error)
                    vscode.postMessage({ type: 'error', message: '加载游戏失败' })
                }
                break
            
            case 'setController':
                emu.setupKeyboadController(1, e.data.controller.p1)
                emu.setupKeyboadController(2, e.data.controller.p2)
                break
            
            case 'delete':
                if (currentGame.value === e.data.label) {
                    stopGame()
                }
                break

            case 'openROM':
                fetch(`https://taiyuuki.github.io/nes-roms/roms/${e.data.rom}`).then(response => {
                    response.arrayBuffer().then(async buffer => {
                        try {
                            const zipFiles = await extract7z(new Uint8Array(buffer))
                            for (const filename in zipFiles) {
                                if (filename.endsWith('.nes')) {
                                    const data = zipFiles[filename]!

                                    await emu.loadROM(data)
                                    
                                    isPlaying.value = true
                                    isPaused.value = false
                                    currentGame.value = filename.replace('.nes', '')

                                    await loadGameData(currentGame.value, db.value!)
                                    await loadCheats(emu, currentGame.value, db.value!)

                                    applySettings()
                                    await emu.start()

                                    vscode.postMessage({
                                        type: 'download',
                                        filename,
                                        content: data,
                                    })

                                    return
                                }
                            }
                        }
                        catch(error) {
                            console.error('解压7z失败:', error)
                            vscode.postMessage({ type: 'error', message: '解压7z失败' })
                        }
                    })
                })
        }
    })

    // 用户交互音频启用
    window.addEventListener('click', onInteraction, { once: true })
    window.addEventListener('keydown', onInteraction, { once: true })
    window.addEventListener('touchstart', onInteraction, { once: true })
    
    vscode.postMessage({ type: 'ready' })
})
</script>

<template>
  <div class="nes-emulator-v2">
    <!-- 游戏画面容器 -->
    <div class="game-viewport">
      <canvas
        ref="cvs"
        class="game-canvas"
      />
      
      <!-- 控制面板 -->
      <GameControls
        v-if="isPlaying"
        :is-paused="isPaused"
        @toggle-play-pause="togglePlayPause"
        @reset="resetGame"
        @open-saves="showSaveMenu = true"
        @open-settings="showSettings = true"
        @open-cheats="showCheatMenu = true"
        @download="vscode.postMessage({ type: 'download', label: currentGame, data: gameData })"
      />
    </div>

    <!-- 存档管理弹窗 -->
    <SaveStateModal
      v-if="showSaveMenu"
      :current-game="currentGame"
      :game-data="gameData"
      @close="showSaveMenu = false"
      @save="handleSaveState"
      @load="handleLoadState"
      @delete="handleDeleteSave"
    />

    <!-- 设置弹窗 -->
    <SettingsModal
      v-if="showSettings"
      v-model:settings="settings"
      @close="showSettings = false"
      @apply="applySettings"
      @save="() => saveSettings(db!)"
    />

    <!-- 金手指弹窗 -->
    <CheatModal
      v-if="showCheatMenu"
      :cheats="cheats"
      @close="showCheatMenu = false"
      @add="handleAddCheat"
      @toggle="handleToggleCheat"
      @remove="handleRemoveCheat"
    />
  </div>
</template>

<style scoped>
.nes-emulator-v2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-large, 20px);
  background: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
}

.game-viewport {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-medium, 16px);
  width: 100%;
  max-width: 1200px;
}

.game-canvas {
  border: 2px solid var(--vscode-panel-border);
  border-radius: var(--border-radius, 8px);
  background: #000;
  image-rendering: pixelated;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s ease;
}

.game-canvas:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
}

@media (max-width: 768px) {
  .nes-emulator-v2 {
    padding: var(--spacing-small, 12px);
  }
}
</style>
