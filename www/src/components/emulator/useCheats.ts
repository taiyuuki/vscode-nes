import { ref } from 'vue'
import type { NESEmulator } from '@nesjs/native'
import { useEmulatorSettings } from './useEmulatorSettings'

interface CheatCode {
    code: string
    description: string
    enabled: boolean
}

export function useCheats(vscode: any) {
    const cheats = ref<CheatCode[]>([])
    const showCheatMenu = ref(false)
    const emulatorSettings = useEmulatorSettings()

    async function loadCheats(emu: NESEmulator, gameName: string, db: IDBDatabase) {
        if (!gameName) return

        try {

            // 清除当前金手指
            emu.clearAllCheats()

            const transaction = db.transaction(['cheats'], 'readonly')
            const store = transaction.objectStore('cheats')
            const index = store.index('game')
            const request = index.getAll(gameName)

            const gameCheats = await new Promise<any[]>((resolve, reject) => {
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })

            // 重新加载金手指，默认都设为禁用状态
            cheats.value = (gameCheats || []).map((cheat: any) => ({
                code: cheat.code,
                description: cheat.description,
                enabled: false, // 默认关闭
            }))
        }
        catch(error) {
            console.error('加载金手指失败:', error)
        }
    }

    async function addCheat(
        emu: NESEmulator,
        code: string,
        description: string,
        gameName: string,
        db: IDBDatabase,
    ) {
        if (!code.trim() || !gameName) return

        try {

            // 检查是否已存在相同代码的金手指
            const existingCheat = cheats.value.find(c => c.code === code)
            if (existingCheat) {
                notify('error', '该金手指已存在')

                return
            }

            const success = emu.addCheat(code)
            if (!success) {
                notify('error', '无效的金手指代码')

                return
            }

            const cheat: CheatCode = {
                code,
                description: description || '未命名金手指',
                enabled: true,
            }

            // 保存到IndexedDB
            const transaction = db.transaction(['cheats'], 'readwrite')
            const store = transaction.objectStore('cheats')
            store.put({
                id: `${gameName}_${cheat.code}`,
                game: gameName,
                ...cheat,
            })

            cheats.value.push(cheat)
            notify('info', '金手指已添加')
        }
        catch(error) {
            console.error('添加金手指失败:', error)
            notify('error', '添加金手指失败')
        }
    }

    async function toggleCheat(
        emu: NESEmulator,
        cheat: CheatCode,
        gameName: string,
        db: IDBDatabase,
    ) {
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
                    notify('error', '无效的金手指代码')

                    return
                }
            }

            // 更新数据库中的状态
            const transaction = db.transaction(['cheats'], 'readwrite')
            const store = transaction.objectStore('cheats')
            store.put({
                id: `${gameName}_${cheat.code}`,
                game: gameName,
                ...cheat,
            })
        }
        catch(error) {
            console.error('切换金手指失败:', error)
        }
    }

    async function removeCheat(
        emu: NESEmulator,
        cheat: CheatCode,
        gameName: string,
        db: IDBDatabase,
    ) {
        try {

            // 从模拟器中移除
            emu.removeCheat(cheat.code)

            // 从本地列表移除
            const index = cheats.value.indexOf(cheat)
            if (index >= 0) {
                cheats.value.splice(index, 1)
            }

            // 从数据库删除
            const transaction = db.transaction(['cheats'], 'readwrite')
            const store = transaction.objectStore('cheats')
            store.delete(`${gameName}_${cheat.code}`)

            notify('info', '金手指已移除')
        }
        catch(error) {
            console.error('移除金手指失败:', error)
        }
    }

    function notify(type: 'error' | 'info', message: string) {
        if (emulatorSettings.settings.notifications || type === 'error') vscode.postMessage({ type, message })
    }

    return {
        cheats,
        showCheatMenu,
        loadCheats,
        addCheat,
        toggleCheat,
        removeCheat,
        notify,
    }
}
