import net from 'node:net'
import {
    ControlCode,
    FrameDecoder,
    MESSAGE_KIND_LABEL,
    MessageKind,
    type RawMessage,
    decodeControlPayload,
    decodeInputPayload,
    decodeRomPayload,
    decodeSavePayload,
    decodeSyncPayload,
    encodeControlPayload,
    encodeInputPayload,
    encodeMessage,
    encodeRomPayload,
    encodeSavePayload,
    encodeSyncPayload,
} from './protocol'

/**
 * 收到一条消息时触发（已按 kind 区分，payload 已解析为高层语义）
 */
export interface NetMessageHandler {
    onInput?(frame: number, input: number): void
    onSave?(saveState: Uint8Array): void
    onControl?(code: ControlCode): void
    onRom?(name: string, rom: Uint8Array): void
    onSync?(frame: number, hash: number): void
}

/**
 * 连接状态变化
 */
export type NetState = 'closed' | 'connected' | 'connecting' | 'hosting' | 'idle'

export interface NetStateHandler { onStateChange(state: NetState, reason?: string): void }

/**
 * 扩展端网络管理
 *
 * 两种角色：
 *   - host：createRoom() 起一个 net.Server 监听端口，等待 guest 连入
 *   - guest：joinRoom() 主动连接 host 的 host:port
 *
 * 连接建立后两端对称，通过 socket 互发消息。
 * 所有收到的消息通过 handler 回调上抛，由 src/index.ts 转发给 webview。
 */
export class NetManager {

    /** 当前角色：'host' | 'guest' | null */
    role: 'guest' | 'host' | null = null

    /** 本地玩家号 1|2 */
    localPlayer: 1 | 2 = 1

    /** 对端玩家号（由 localPlayer 推导） */
    peerPlayer: 1 | 2 = 2

    private server: net.Server | null = null
    private socket: net.Socket | null = null
    private decoder = new FrameDecoder()
    private state:  NetState = 'idle'

    constructor(
        private messageHandler: NetMessageHandler = {},
        private stateHandler: NetStateHandler = {},
    ) {}

    private setState(state: NetState, reason?: string): void {
        this.state = state
        this.stateHandler.onStateChange?.(state, reason)
    }

    getState(): NetState {
        return this.state
    }

    /**
     * 创建房间（host 角色）
     * @param localPlayer 本地玩家号
     * @param preferredPort 期望端口，0 表示随机
     * @returns 实际监听端口
     */
    async createRoom(localPlayer: 1 | 2, preferredPort = 0): Promise<number> {
        this.ensureIdle()
        this.role = 'host'
        this.localPlayer = localPlayer
        this.peerPlayer = localPlayer === 1 ? 2 : 1

        return new Promise((resolve, reject) => {
            const server = net.createServer(socket => {

                // host 只接受第一个连接
                if (this.socket) {
                    socket.destroy()

                    return
                }
                this.attachSocket(socket)
            })

            server.once('error', (err: NodeJS.ErrnoException) => {
                this.cleanup()
                reject(err)
            })

            server.listen(preferredPort, '0.0.0.0', () => {
                const address = server.address()
                const port = typeof address === 'object' && address ? address.port : 0
                this.server = server
                this.setState('hosting')
                resolve(port)
            })
        })
    }

    /**
     * 加入房间（guest 角色）
     */
    async joinRoom(host: string, port: number, localPlayer: 1 | 2): Promise<void> {
        this.ensureIdle()
        this.role = 'guest'
        this.localPlayer = localPlayer
        this.peerPlayer = localPlayer === 1 ? 2 : 1

        return new Promise((resolve, reject) => {
            const socket = net.createConnection({ host, port }, () => {
                this.attachSocket(socket)
                resolve()
            })

            socket.once('error', (err: NodeJS.ErrnoException) => {
                this.cleanup()
                reject(err)
            })
        })
    }

    /**
     * 把一个已建立的 socket 接入管理
     */
    private attachSocket(socket: net.Socket): void {
        this.socket = socket
        this.decoder.reset()

        socket.on('data', (chunk: Buffer) => {
            let messages: RawMessage[]
            try {
                messages = this.decoder.feed(chunk)
            }
            catch(err) {
                this.setState('closed', `协议解析错误: ${(err as Error).message}`)
                this.cleanup()

                return
            }
            for (const msg of messages) {
                this.handleMessage(msg)
            }
        })

        socket.on('error', (err: Error) => {

            // close 事件会随后触发，这里只记录
            console.warn('[NetManager] socket error:', err.message)
        })

        socket.on('close', () => {
            if (this.state !== 'closed') {
                this.setState('closed', '连接已断开')
            }
            this.cleanup()
        })

        this.setState('connected')
    }

    /**
     * 分发一条原始消息到对应 handler
     */
    private handleMessage(msg: RawMessage): void {
        switch(msg.kind) {
            case MessageKind.INPUT: {
                const { frame, input } = decodeInputPayload(msg.payload)
                this.messageHandler.onInput?.(frame, input)
                break
            }
            case MessageKind.SAVE: {
                const saveState = decodeSavePayload(msg.payload)
                this.messageHandler.onSave?.(saveState)
                break
            }
            case MessageKind.CONTROL: {
                const code = decodeControlPayload(msg.payload)
                this.messageHandler.onControl?.(code)
                break
            }
            case MessageKind.ROM: {
                const { name, rom } = decodeRomPayload(msg.payload)
                this.messageHandler.onRom?.(name, rom)
                break
            }
            case MessageKind.SYNC: {
                const { frame, hash } = decodeSyncPayload(msg.payload)
                this.messageHandler.onSync?.(frame, hash)
                break
            }
            default:
                console.warn('[NetManager] unknown message kind:', msg.kind)
        }
    }

    // ---- 发送 API（供 webview 经由扩展调用）----

    /** 发送一帧输入 */
    sendInput(frame: number, input: number): void {
        this.write(MessageKind.INPUT, encodeInputPayload(frame, input))
    }

    /** 发送状态校验 hash */
    sendSync(frame: number, hash: number): void {
        this.write(MessageKind.SYNC, encodeSyncPayload(frame, hash))
    }

    /** 发送初始存档 */
    sendSaveState(saveState: Uint8Array): void {
        this.write(MessageKind.SAVE, encodeSavePayload(saveState))
    }

    /** 发送控制消息 */
    sendControl(code: ControlCode): void {
        this.write(MessageKind.CONTROL, encodeControlPayload(code))
    }

    /** 发送 ROM 数据 */
    sendRom(name: string, rom: Uint8Array): void {
        this.write(MessageKind.ROM, encodeRomPayload(name, rom))
    }

    private write(kind: MessageKind, payload: Buffer): void {
        if (!this.socket || this.socket.destroyed) {
            console.warn(`[NetManager] cannot send (${MESSAGE_KIND_LABEL[kind] ?? kind}): socket not open`)

            return
        }
        const buf = encodeMessage(kind, payload)
        this.socket.write(buf)
    }

    // ---- 生命周期 ----

    /** 主动关闭连接 */
    close(): void {
        if (this.socket && !this.socket.destroyed) {

            // 通知对端即将断开
            try { this.sendControl(ControlCode.DISCONNECT) }
            catch { /* ignore */ }
            this.socket.end()
        }
        this.cleanup()
        this.setState('closed', '主动断开')
    }

    /** 销毁所有资源 */
    dispose(): void {
        this.cleanup()
        this.setState('closed', 'disposed')
    }

    private cleanup(): void {
        if (this.socket) {
            this.socket.removeAllListeners()
            if (!this.socket.destroyed) {
                this.socket.destroy()
            }
            this.socket = null
        }
        if (this.server) {
            this.server.removeAllListeners()
            this.server.close()
            this.server = null
        }
        this.role = null
        this.decoder.reset()
    }

    private ensureIdle(): void {
        if (this.state !== 'idle' && this.state !== 'closed') {
            throw new Error(`NetManager busy (state=${this.state})，请先断开当前连接`)
        }

        // closed → 可复用，先清理
        if (this.state === 'closed') {
            this.cleanup()
            this.state = 'idle'
        }
    }

    /** 是否已连接 */
    isConnected(): boolean {
        return this.state === 'connected' && !!this.socket && !this.socket.destroyed
    }
}
