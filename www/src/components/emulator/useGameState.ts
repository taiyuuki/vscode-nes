import { ref } from 'vue'
import type { NESEmulator } from '@nesjs/native'
import { useEmulatorSettings } from './useEmulatorSettings'

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

export function useGameState(vscode: any) {
    const isPlaying = ref(false)
    const isPaused = ref(false)
    const currentGame = ref<string>('')
    const gameData = ref<Record<string, GameData>>({})
    const isLocalROM = ref(false)
    const emulatorSettings = useEmulatorSettings()

    async function loadGameData(gameName: string, db: IDBDatabase) {
        try {
            const transaction = db.transaction(['saves'], 'readonly')
            const store = transaction.objectStore('saves')
            const index = store.index('game')
            const request = index.getAll(gameName)

            const saves = await new Promise<any[]>((resolve, reject) => {
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })

            gameData.value[gameName] = {
                name: gameName,
                saves: saves || [],
            }
        }
        catch(error) {
            console.error('加载游戏数据失败:', error)
        }
    }

    async function saveState(
        emu: NESEmulator,
        canvas: HTMLCanvasElement,
        slotId: number,
        db: IDBDatabase,
    ) {
        if (!currentGame.value) return

        try {
            const stateData = emu.saveState()
            if (!stateData) {
                notify('error', '保存状态失败')

                return
            }

            const screenshot = canvas.toDataURL('image/png')

            const saveStateData: SaveState = {
                id: `${currentGame.value}_slot_${slotId}`,
                name: `存档槽 ${slotId}`,
                timestamp: Date.now(),
                data: stateData,
                screenshot,
            }

            const transaction = db.transaction(['saves'], 'readwrite')
            const store = transaction.objectStore('saves')
            store.put({
                ...saveStateData,
                game: currentGame.value,
            })

            // 更新本地数据
            if (!gameData.value[currentGame.value]) {
                gameData.value[currentGame.value] = { name: currentGame.value, saves: [] }
            }

            const gameInfo = gameData.value[currentGame.value]!
            const existingIndex = gameInfo.saves.findIndex(s => s.id === saveStateData.id)
            if (existingIndex >= 0) {
                gameInfo.saves[existingIndex] = saveStateData
            }
            else {
                gameInfo.saves.push(saveStateData)
            }

            notify('info', `游戏已保存到存档槽 ${slotId}`)
        }
        catch(error) {
            console.error('保存失败:', error)
            notify('error', '保存失败')
        }
    }

    async function loadState(emu: NESEmulator, saveStateData: SaveState) {
        try {
            emu.loadState(saveStateData.data)
            notify('info', `已加载存档: ${saveStateData.name}`)
        }
        catch(error) {
            console.error('加载存档失败:', error)
            notify('error', '加载存档失败')
        }
    }

    async function deleteSave(saveStateData: SaveState, db: IDBDatabase) {
        try {
            const transaction = db.transaction(['saves'], 'readwrite')
            const store = transaction.objectStore('saves')
            store.delete(saveStateData.id)

            if (gameData.value[currentGame.value]) {
                const gameInfo = gameData.value[currentGame.value]!
                const index = gameInfo.saves.findIndex(s => s.id === saveStateData.id)
                if (index >= 0) {
                    gameInfo.saves.splice(index, 1)
                }
            }

            notify('info', '存档已删除')
        }
        catch(error) {
            console.error('删除存档失败:', error)
            notify('error', '删除存档失败')
        }
    }

    function notify(type: 'error' | 'info', message: string) {
        if (emulatorSettings.settings.notifications || type === 'error') vscode.postMessage({ type, message })
    }

    return {
        isPlaying,
        isPaused,
        currentGame,
        gameData,
        loadGameData,
        saveState,
        loadState,
        deleteSave,
        isLocalROM,
        notify,
    }
}
