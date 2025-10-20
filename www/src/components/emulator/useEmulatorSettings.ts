import { reactive, ref } from 'vue'
import type { NESEmulator } from '@nesjs/native'

export interface EmulatorSettings {
    scale: number
    smoothing: boolean
    muted: boolean
    volume: number
    clip8px: boolean
    notifications: boolean
}

export function useEmulatorSettings() {
    const showSettings = ref(false)

    const settings = reactive<EmulatorSettings>({
        scale: 2,
        smoothing: false,
        muted: false,
        volume: 0.8,
        clip8px: false,
        notifications: true,
    })

    async function loadSettings(db: IDBDatabase) {
        try {
            const transaction = db.transaction(['settings'], 'readonly')
            const store = transaction.objectStore('settings')
            const request = store.get('emulator_settings')

            const savedSettings = await new Promise<any>((resolve, reject) => {
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })

            if (savedSettings) {
                Object.assign(settings, savedSettings)
            }
        }
        catch(error) {
            console.error('加载设置失败:', error)
        }
    }

    async function saveSettings(db: IDBDatabase) {
        try {
            const transaction = db.transaction(['settings'], 'readwrite')
            const store = transaction.objectStore('settings')
            store.put({
                key: 'emulator_settings',
                ...settings,
            })
        }
        catch(error) {
            console.error('保存设置失败:', error)
        }
    }

    function applySettings(emu: NESEmulator) {
        emu.setScale(settings.scale)
        emu.setSmoothing(settings.smoothing)
        emu.setVolume(settings.muted ? 0 : settings.volume)
        emu.setClip8px(settings.clip8px ? settings.clip8px : false)

        // saveSettings会由父组件调用
    }

    return {
        settings,
        showSettings,
        loadSettings,
        saveSettings,
        applySettings,
    }
}
