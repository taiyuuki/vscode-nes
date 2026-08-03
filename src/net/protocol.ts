/**
 * TCP 线路协议 — 扩展端之间传输的帧格式
 *
 * 帧头 4 字节：
 *   [1B kind] [3B payload-len (big-endian)]
 * 随后是 payload，长度由 payload-len 指定（最大 16MB，足够存档与 ROM）。
 *
 * kind 取值：
 *   0x01  INPUT    输入帧      payload = [4B frame(LE)] [1B input]
 *   0x02  SAVE     存档同步    payload = [4B len(LE)] [saveState bytes...]
 *   0x03  CONTROL  控制消息    payload = [1B code]
 *   0x04  ROM      ROM 数据    payload = [2B name-len(LE)] [name utf8] [4B rom-len(LE)] [rom bytes]
 */

/** 消息类型 */
export enum MessageKind {
    INPUT   = 0x01,
    SAVE    = 0x02,
    CONTROL = 0x03,
    ROM     = 0x04,
}

/** 消息类型 → 描述，便于日志 */
export const MESSAGE_KIND_LABEL: Record<number, string> = {
    [MessageKind.INPUT]:   'INPUT',
    [MessageKind.SAVE]:    'SAVE',
    [MessageKind.CONTROL]: 'CONTROL',
    [MessageKind.ROM]:     'ROM',
}

/** 控制消息码 */
export enum ControlCode {
    READY = 0,
    START = 1,
    RESET = 2,
    DISCONNECT = 3,
}

/** 控制码 → 描述，便于日志 */
export const CONTROL_CODE_LABEL: Record<number, string> = {
    [ControlCode.READY]:      'READY',
    [ControlCode.START]:      'START',
    [ControlCode.RESET]:      'RESET',
    [ControlCode.DISCONNECT]: 'DISCONNECT',
}

/** 协议解析出的原始消息 */
export interface RawMessage {
    kind:    MessageKind
    payload: Buffer
}

const HEADER_SIZE = 4
const MAX_PAYLOAD = 0xFFFFFF // 3 字节最大值 16MB

/**
 * 编码一条消息为 Buffer
 */
export function encodeMessage(kind: MessageKind, payload: Buffer): Buffer {
    const len = payload.length
    if (len > MAX_PAYLOAD) {
        throw new Error(`payload too large: ${len} bytes (max ${MAX_PAYLOAD})`)
    }

    // 3 字节大端长度：header[1] = 高字节，header[3] = 低字节
    const header = Buffer.allocUnsafe(HEADER_SIZE)
    header.writeUInt8(kind, 0)
    header.writeUInt8(len >> 16 & 0xFF, 1)
    header.writeUInt8(len >> 8 & 0xFF, 2)
    header.writeUInt8(len & 0xFF, 3)

    return Buffer.concat([header, payload])
}

// ---- 各类型 payload 编码辅助 ----

/** 编码输入帧 payload: [4B frame(LE)] [1B input] */
export function encodeInputPayload(frame: number, input: number): Buffer {
    const buf = Buffer.allocUnsafe(5)
    buf.writeUInt32LE(frame >>> 0, 0)
    buf.writeUInt8(input & 0xFF, 4)

    return buf
}

/** 解码输入帧 payload */
export function decodeInputPayload(payload: Buffer): { frame: number, input: number } {
    return {
        frame: payload.readUInt32LE(0),
        input: payload.readUInt8(4),
    }
}

/** 编码存档同步 payload: [4B len(LE)] [saveState bytes] */
export function encodeSavePayload(saveState: Uint8Array): Buffer {
    const len = saveState.length
    const buf = Buffer.allocUnsafe(4 + len)
    buf.writeUInt32LE(len, 0)
    buf.set(saveState, 4)

    return buf
}

/** 解码存档同步 payload，返回原始存档字节 */
export function decodeSavePayload(payload: Buffer): Uint8Array {
    const len = payload.readUInt32LE(0)

    return new Uint8Array(payload.subarray(4, 4 + len))
}

/** 编码控制消息 payload: [1B code] */
export function encodeControlPayload(code: ControlCode): Buffer {
    const buf = Buffer.allocUnsafe(1)
    buf.writeUInt8(code, 0)

    return buf
}

/** 解码控制消息 payload */
export function decodeControlPayload(payload: Buffer): ControlCode {
    return payload.readUInt8(0) as ControlCode
}

/** 编码 ROM 数据 payload: [2B name-len(LE)] [name utf8] [4B rom-len(LE)] [rom bytes] */
export function encodeRomPayload(name: string, rom: Uint8Array): Buffer {
    const nameBytes = Buffer.from(name, 'utf8')
    const nameLen = nameBytes.length
    const romLen = rom.length
    const buf = Buffer.allocUnsafe(2 + nameLen + 4 + romLen)
    buf.writeUInt16LE(nameLen, 0)
    buf.set(nameBytes, 2)
    buf.writeUInt32LE(romLen, 2 + nameLen)
    buf.set(rom, 2 + nameLen + 4)

    return buf
}

/** 解码 ROM 数据 payload */
export function decodeRomPayload(payload: Buffer): { name: string, rom: Uint8Array } {
    const nameLen = payload.readUInt16LE(0)
    const name = payload.subarray(2, 2 + nameLen).toString('utf8')
    const romLen = payload.readUInt32LE(2 + nameLen)
    const rom = new Uint8Array(payload.subarray(2 + nameLen + 4, 2 + nameLen + 4 + romLen))

    return { name, rom }
}

/**
 * 流式帧解码器
 *
 * TCP 是字节流，一次 data 事件可能包含半个消息或多个消息。
 * FrameDecoder 累积 buffer，喂入 chunk 后吐出所有完整消息。
 */
export class FrameDecoder {
    private buffer: Buffer = Buffer.alloc(0)

    /** 喂入一段数据，返回本次新解析出的完整消息列表 */
    feed(chunk: Buffer): RawMessage[] {
        this.buffer = this.buffer.length === 0 ? chunk : Buffer.concat([this.buffer, chunk])
        const messages: RawMessage[] = []

        while (this.buffer.length >= HEADER_SIZE) {
            const payloadLen = this.buffer.readUInt8(1) << 16 | this.buffer.readUInt8(2) << 8 | this.buffer.readUInt8(3)
            const kind = this.buffer.readUInt8(0) as MessageKind

            if (payloadLen > MAX_PAYLOAD) {
                throw new Error(`invalid payload length: ${payloadLen}`)
            }

            // 尚未收齐 payload，等下一次 data
            if (this.buffer.length < HEADER_SIZE + payloadLen) {
                break
            }

            const payload = this.buffer.subarray(HEADER_SIZE, HEADER_SIZE + payloadLen)
            messages.push({ kind, payload: Buffer.from(payload) })

            // 移除已消费部分
            this.buffer = this.buffer.subarray(HEADER_SIZE + payloadLen)
        }

        return messages
    }

    /** 重置内部状态 */
    reset(): void {
        this.buffer = Buffer.alloc(0)
    }
}
