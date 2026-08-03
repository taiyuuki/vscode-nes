import { type Ref, ref } from 'vue'
import type { NESEmulator } from './nesjs'

export type NetStatus = 'connecting' | 'offline' | 'online' | 'syncing'
type Player = 1 | 2

/** 等待单帧远程输入的最大时长，超时视为断线 */
const FRAME_BARRIER_TIMEOUT = 3000

/**
 * 联机（局域网双人 lockstep）组合式函数
 *
 * 职责：
 *   1. 维护远程输入缓冲 + 帧屏障（frame barrier），保证本地第 N 帧严格在对端第 N 帧输入到达后才模拟
 *   2. 监听扩展端 postMessage 的 net-* 消息，分发输入 / 存档 / 控制消息
 *   3. 在连接建立后驱动 NESEmulator 进入 netcode 主循环
 *
 * 不直接操作 TCP —— 网络全在扩展端（src/net），webview 只经 postMessage 中转。
 */
export function useNetcode(vscode: any) {
    const netStatus: Ref<NetStatus> = ref('offline')
    const localPlayer: Ref<Player | null> = ref(null)
    const remotePlayer: Ref<Player | null> = ref(null)
    const statusText = ref('')

    /** 本机角色：host=房主(被连接方)，guest=加入方。决定谁发起存档同步。 */
    const role: Ref<'guest' | 'host' | null> = ref(null)

    let emu: NESEmulator | null = null

    // 远程输入缓冲：frame → input（提前到达、尚未被 barrier 取走的帧）
    const remoteInputs = new Map<number, number>()

    // 正在等待的帧：frame → resolver
    const pendingFrames = new Map<number, (input: number) => void>()

    // 帧超时定时器：frame → timer
    const frameTimers = new Map<number, ReturnType<typeof setTimeout>>()

    // 防止重复进入 netcode 循环
    let netcodeActive = false

    function attachEmulator(instance: NESEmulator): void {
        emu = instance
    }

    // ============ 帧屏障 ============

    /**
     * 等待指定帧的远程输入到达。
     * 如果输入已提前缓存，立即返回；否则挂起 Promise 直到对应输入到达或超时。
     */
    function waitForRemoteInput(frame: number): Promise<number> {
        const cached = remoteInputs.get(frame)
        if (cached !== undefined) {
            remoteInputs.delete(frame)

            return Promise.resolve(cached)
        }

        return new Promise<number>((resolve, reject) => {
            const timer = setTimeout(() => {
                pendingFrames.delete(frame)
                frameTimers.delete(frame)
                reject(new Error(`frame ${frame} 远程输入等待超时`))
            }, FRAME_BARRIER_TIMEOUT)
            frameTimers.set(frame, timer)
            pendingFrames.set(frame, input => {
                clearTimeout(timer)
                frameTimers.delete(frame)
                resolve(input)
            })
        })
    }

    /** 远程输入到达时调用：取走等待中的 resolver，或缓存 */
    function onRemoteInput(frame: number, input: number): void {
        const resolver = pendingFrames.get(frame)
        if (resolver) {
            pendingFrames.delete(frame)
            resolver(input)
        }
        else {
            remoteInputs.set(frame, input)
        }
    }

    /** 发送本地一帧输入给扩展端转发 */
    function sendLocalInput(frame: number, input: number): void {
        vscode.postMessage({ type: 'net-send', kind: 'input', frame, input })
    }

    // ============ 消息监听 ============

    function onMessage(e: MessageEvent): void {
        const data = e.data
        if (!data || typeof data.type !== 'string') return
        if (!data.type.startsWith('net-')) return

        switch(data.type) {
            case 'net-room-created':

                // host：房间已创建，等待对手
                localPlayer.value = data.localPlayer === 2 ? 2 : 1
                remotePlayer.value = localPlayer.value === 1 ? 2 : 1
                role.value = 'host'
                netStatus.value = 'connecting'
                statusText.value = `房间已创建（端口 ${data.port}），等待对手加入…`
                break

            case 'net-connected':

                // guest：已连接到 host
                localPlayer.value = data.localPlayer === 2 ? 2 : 1
                remotePlayer.value = localPlayer.value === 1 ? 2 : 1
                role.value = 'guest'
                netStatus.value = 'connecting'
                statusText.value = '已连接，等待主机同步游戏状态…'
                break

            case 'net-state':
                handleStateChange(data.state, data.reason)
                break

            case 'net-recv':
                handleRecv(data)
                break
        }
    }

    function handleStateChange(state: string, reason?: string): void {
        switch(state) {
            case 'connected':

                // TCP 连接已建立。
                // host 在此处触发握手（host 是被连接方，收到 connected 时 guest 已连入）；
                // guest 由 net-connected 消息已经设好角色，等待存档即可。
                if (role.value === 'host' && !netcodeActive) {
                    netStatus.value = 'syncing'
                    statusText.value = '对手已连接，点击"同步存档"开始'

                    // host 自动发送存档（如果已加载 ROM 且游戏在跑）
                    autoHostSendSaveState()
                }
                break
            case 'closed':
            case 'disconnected':
                teardown(reason || '连接已断开')
                break
        }
    }

    /**
     * host 自动发送存档（前提是 ROM 已加载）。
     * 若尚未加载 ROM，则等用户手动点"同步存档"。
     */
    function autoHostSendSaveState(): void {
        if (!emu || !emu.romData) {

            // ROM 未就绪，保持 syncing 状态等用户手动触发
            return
        }
        void hostSendSaveState()
    }

    function handleRecv(data: any): void {
        switch(data.kind) {
            case 'input':
                onRemoteInput(data.frame, data.input)
                break
            case 'control':
                onControl(data.code)
                break
            case 'save':
                void onRemoteSave(new Uint8Array(data.saveState))
                break
            case 'rom':
                onRemoteRom(data.name, new Uint8Array(data.rom))
                break
        }
    }

    // ============ 握手与同步 ============

    /**
     * 控制码：0=READY, 1=START, 2=RESET, 3=DISCONNECT
     *
     * 握手流程：
     *   guest 加载存档 → 发 READY(0)
     *   host 收到 READY → UI 可点"开始游戏"，发 START(1)
     *   双方收到 START → 进入 netcode 主循环
     */
    function onControl(code: number): void {
        if (code === 0) {

            // READY：guest 已就绪。host 此时可以开始游戏
            if (role.value === 'host') {
                statusText.value = '对手已就绪，点击"开始游戏"开始联机'
            }
        }
        else if (code === 1) {

            // START：进入 netcode 主循环
            startNetcodeLoop()
        }
        else if (code === 2) {

            // RESET：双方同步重置
            emu?.reset()
        }
        else if (code === 3) {
            teardown('对手已断开')
        }
    }

    /**
     * host：把当前存档发给 guest。
     *
     * 发送前会暂停本地模拟器（停止单机循环），避免存档发出后 host 的 frameCount
     * 继续前进导致两端失步。真正开始联机时由 startNetcodeLoop → enableNetcode
     * 切到 lockstep 循环。
     *
     * guest 收到存档后加载并回 READY，host 收到 READY 即可点"开始游戏"发 START。
     */
    async function hostSendSaveState(): Promise<void> {
        if (!emu) return

        // 暂停本地单机循环，确保存档是"冻结的起点"
        try {
            await emu.pause()
        }
        catch(err) {
            console.warn('host 暂停模拟器失败:', err)
        }
        const save = emu.saveState()
        if (!save) return
        vscode.postMessage({ type: 'net-send', kind: 'save', saveState: Array.from(save) })
        netStatus.value = 'syncing'
        statusText.value = '已发送游戏状态，等待对手就绪…'
    }

    /** guest：收到 host 存档，加载并回 READY */
    async function onRemoteSave(saveState: Uint8Array): Promise<void> {
        if (!emu) return
        if (!emu.romData) {
            // guest 尚未加载同一 ROM，存档无法应用
            // 提示用户先加载相同游戏；或由 host 单独发送 ROM（见 onRemoteRom）
            statusText.value = '请先加载相同游戏，再同步状态'
            console.error('无法加载远程存档：本地尚未加载 ROM')

            return
        }
        try {
            // 暂停单机循环，避免加载存档后 frameCount 继续前进导致两端失步
            await emu.pause()
            emu.loadState(saveState)

            // 通知 host 我已就绪
            vscode.postMessage({ type: 'net-send', kind: 'control', code: 0 })
            statusText.value = '已同步游戏状态，等待主机开始…'
            netStatus.value = 'syncing'
        }
        catch(err) {
            console.error('加载远程存档失败:', err)
            statusText.value = '存档同步失败：ROM 可能不匹配'
        }
    }

    /** 收到远程 ROM 数据 */
    function onRemoteRom(name: string, rom: Uint8Array): void {

        // ROM 加载是异步的且会改变状态，由组件层处理更合适
        // 这里发出事件，由 NESEmulatorV2.vue 监听后调用 emu.loadROM
        window.dispatchEvent(new CustomEvent('net-rom-received', { detail: { name, rom } }))
    }

    /**
     * 启动 netcode 主循环。
     * 由 host 在收到 guest READY 后调用（发 START），guest 收到 START 后调用。
     */
    function startNetcodeLoop(): void {
        if (!emu || netcodeActive) return
        if (!localPlayer.value || !remotePlayer.value) return

        netcodeActive = true
        netStatus.value = 'online'
        statusText.value = '联机进行中'

        // 清空缓冲，从当前帧开始
        remoteInputs.clear()
        pendingFrames.clear()
        frameTimers.forEach(t => clearTimeout(t))
        frameTimers.clear()

        emu.enableNetcode(remotePlayer.value, {
            waitForRemoteInput,
            sendLocalInput,
        })
        void emu.start()
    }

    /** 拆除联机状态 */
    function teardown(reason: string): void {
        netcodeActive = false
        if (emu) {
            emu.disableNetcode()
        }
        remoteInputs.clear()
        pendingFrames.forEach(r => r(0))
        pendingFrames.clear()
        frameTimers.forEach(t => clearTimeout(t))
        frameTimers.clear()

        netStatus.value = 'offline'
        statusText.value = reason
        localPlayer.value = null
        remotePlayer.value = null
    }

    // ============ 对外动作 ============

    function disconnect(): void {
        vscode.postMessage({ type: 'net-send', kind: 'control', code: 3 })
        vscode.postMessage({ type: 'net-close' })
        teardown('已主动断开')
    }

    /** host：开始游戏（在存档同步完成后调用，会向 guest 发 START） */
    function hostStartGame(): void {
        vscode.postMessage({ type: 'net-send', kind: 'control', code: 1 })
        startNetcodeLoop()
    }

    function install(): () => void {
        window.addEventListener('message', onMessage)

        return () => window.removeEventListener('message', onMessage)
    }

    return {
        netStatus,
        localPlayer,
        remotePlayer,
        statusText,
        attachEmulator,
        disconnect,
        hostSendSaveState,
        hostStartGame,
        install,
    }
}
