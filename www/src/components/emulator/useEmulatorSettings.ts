import { reactive, ref } from 'vue'
import type { NESEmulator } from '@nesjs/native'

// 调色板配置
export const PALETTES = {
    'ASQ_realityA':            { url: 'palettes/ASQ_realityA.pal', label: 'ASQ Reality A' },
    'ASQ_realityB':            { url: 'palettes/ASQ_realityB.pal', label: 'ASQ Reality B' },
    'BMF_final2':              { url: 'palettes/BMF_final2.pal', label: 'BMF Final 2' },
    'BMF_final3':              { url: 'palettes/BMF_final3.pal', label: 'BMF Final 3' },
    'Composite_Direct_FBX':    { url: 'palettes/Composite_Direct_FBX.pal', label: 'Composite Direct' },
    'FCEU-13-default_nitsuja': { url: 'palettes/FCEU-13-default_nitsuja.pal', label: 'FCEU-13 Default' },
    'FCEU-15-nitsuja_new':     { url: 'palettes/FCEU-15-nitsuja_new.pal', label: 'FCEU-15 New' },
    'FCEUX':                   { url: 'palettes/FCEUX.pal', label: 'FCEUX' },
    'nestopia_rgb':            { url: 'palettes/nestopia_rgb.pal', label: 'Nestopia RGB' },
    'nestopia_yuv':            { url: 'palettes/nestopia_yuv.pal', label: 'Nestopia YUV' },
    'NES_Classic_FBX':         { url: 'palettes/NES_Classic_FBX.pal', label: 'NES Classic' },
    'NRS_NTSC':                { url: 'palettes/NRS_NTSC.pal', label: 'NRS NTSC' },
    'NRS_PAL':                 { url: 'palettes/NRS_PAL.pal', label: 'NRS PAL' },
    'PC-10':                   { url: 'palettes/PC-10.pal', label: 'PC-10' },
    'PVM_Style_D93_FBX':       { url: 'palettes/PVM_Style_D93_FBX.pal', label: 'PVM Style D93' },
    'r57shell_PAL':            { url: 'palettes/r57shell_PAL.pal', label: 'r57shell PAL' },
    'RP2C03':                  { url: 'palettes/RP2C03.pal', label: 'RP2C03' },
    'RP2C04_0001':             { url: 'palettes/RP2C04_0001.pal', label: 'RP2C04-0001' },
    'RP2C04_0002':             { url: 'palettes/RP2C04_0002.pal', label: 'RP2C04-0002' },
    'RP2C04_0003':             { url: 'palettes/RP2C04_0003.pal', label: 'RP2C04-0003' },
    'RP2C04_0004':             { url: 'palettes/RP2C04_0004.pal', label: 'RP2C04-0004' },
    'Smooth_FBX':              { url: 'palettes/Smooth_FBX.pal', label: 'Smooth' },
    'SONY_CXA2025AS_US':       { url: 'palettes/SONY_CXA2025AS_US.pal', label: 'Sony CXA2025AS' },
    'Unsaturated-V6':          { url: 'palettes/Unsaturated-V6.pal', label: 'Unsaturated V6' },
    'Wavebeam':                { url: 'palettes/Wavebeam.pal', label: 'Wavebeam' },
} as const

export type PaletteName = keyof typeof PALETTES

export interface EmulatorSettings {
    scale:         number
    smoothing:     boolean
    muted:         boolean
    volume:        number
    clip8px:       boolean
    notifications: boolean
    palette:       PaletteName
}

export function useEmulatorSettings() {
    const showSettings = ref(false)

    const settings = reactive<EmulatorSettings>({
        scale:         2,
        smoothing:     false,
        muted:         true,
        volume:        0.8,
        clip8px:       false,
        notifications: false,
        palette:       'FCEUX',
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
    }

    return {
        settings,
        showSettings,
        loadSettings,
        saveSettings,
        applySettings,
    }
}
