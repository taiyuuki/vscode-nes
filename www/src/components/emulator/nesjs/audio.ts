import type { AudioOutputInterface } from '@nesjs/core'
import Worklet from './nes-audio-processor.js?raw'

export interface AudioOptions { 
    enableSAB?:       boolean
    sabCapacity?:     number
    ringCapacity?:    number
    audioSampleRate?: number
    audioBufferSize?: number
}

class WebNESAudioOutput implements AudioOutputInterface {
    sampleRate:        number
    bufferSize:        number
    audioContext:      AudioContext | null
    gainNode:          GainNode | null
    audioWorkletNode!: AudioWorkletNode | null
    audiobuf:          Float32Array
    enableSAB:         boolean// SharedArrayBuffer support
    sab?:              SharedArrayBuffer | null
    sabControl?:       Int32Array | null
    sabData?:          Float32Array | null
    sabCapacity:       number
    ringCapacity:      number
    bufptr:            number
    isInitialized:     boolean
    isPlaying:         boolean
    volume:            number

    constructor(options?: AudioOptions) {
        this.enableSAB = !!options?.enableSAB
        this.sabCapacity = options?.sabCapacity || 65536
        this.ringCapacity = options?.ringCapacity || 8192
        this.sampleRate = options?.audioSampleRate || 44100
        this.bufferSize = options?.audioBufferSize || 1024

        this.audiobuf = new Float32Array(this.bufferSize * 8)
        this.bufptr = 0
        this.sab = null
        this.sabControl = null
        this.sabData = null
        this.isInitialized = false
        this.isPlaying = false
        this.volume = 0.5 
        const AudioContext = window.AudioContext
        this.audioContext = new AudioContext({
            sampleRate:  this.sampleRate,
            latencyHint: 'interactive',
        })

        this.gainNode = this.audioContext.createGain()
        this.gainNode.gain.value = this.volume
        this.gainNode.connect(this.audioContext.destination)
    }

    async initialize() {
        if (this.isInitialized) return

        try {

            if (!this.audioContext) {
                const AudioContext = window.AudioContext

                this.audioContext = new AudioContext({
                    sampleRate:  this.sampleRate,
                    latencyHint: 'interactive',
                })

                this.gainNode = this.audioContext.createGain()
                this.gainNode.gain.value = this.volume
                this.gainNode.connect(this.audioContext.destination)
            }
            await this.setupAudioWorklet()

            this.isInitialized = true
        }
        catch(error) {
            console.error('Failed to initialize WebAudio:', error)
            throw error
        }
    }

    async setupAudioWorklet() {

        const workletCode = Worklet
 
        const blob = new Blob([workletCode], { type: 'application/javascript' })
        const workletUrl = URL.createObjectURL(blob)
        try {
            await this.audioContext?.audioWorklet.addModule(workletUrl)
        }
        finally {
            URL.revokeObjectURL(workletUrl)
        }
        
        this.audioWorkletNode = new AudioWorkletNode(
            this.audioContext!, 
            'nes-audio-processor', 
            {
                outputChannelCount: [2],
                numberOfOutputs:    1,
            },
        )
        this.audioWorkletNode.connect(this.gainNode!)

        // send configuration (ringCapacity) to worklet
        try {
            this.audioWorkletNode.port.postMessage({ type: 'init-config', ringCapacity: this.ringCapacity })
        }
        catch {

            // ignore
        }

        // If SAB is requested and supported, create and send it to the worklet
        if (this.enableSAB) {
            if (typeof SharedArrayBuffer === 'undefined') {
                console.warn('SharedArrayBuffer is not supported in this environment; falling back to non-SAB audio path.')
            }
            else {
                try {
                    const controlBytes = 2 * Int32Array.BYTES_PER_ELEMENT
                    const dataBytes = this.sabCapacity * Float32Array.BYTES_PER_ELEMENT
                    const sab = new SharedArrayBuffer(controlBytes + dataBytes)
                    const control = new Int32Array(sab, 0, 2)
                    control[0] = 0 // read
                    control[1] = 0 // write
                    const data = new Float32Array(sab, controlBytes, this.sabCapacity)
    
                    this.sab = sab
                    this.sabControl = control
                    this.sabData = data
    
                    this.audioWorkletNode.port.postMessage({ type: 'init-sab', sab: sab, capacity: this.sabCapacity })
                }
                catch {
                    this.sab = null
                    this.sabControl = null
                    this.sabData = null
                }
            }
        }
    }

    outputSample(sample: number) {
        if (!this.isInitialized || !this.isPlaying) return
        const normalizedSample = sample / 0x7FFF

        // If SAB is enabled and available, try to write directly into it (zero-copy ring buffer)
        if (this.enableSAB && this.sabData && this.sabControl) {
            const capacity = this.sabData.length
            const write = Atomics.load(this.sabControl, 1)
            const read = Atomics.load(this.sabControl, 0)
            const free = write >= read ? capacity - (write - read) - 1 : read - write - 1

            if (free >= 2) {

                // write stereo interleaved
                this.sabData[write] = normalizedSample
                const next = (write + 1) % capacity
                this.sabData[next] = normalizedSample
                const newWrite = (write + 2) % capacity

                // publish new write index
                Atomics.store(this.sabControl, 1, newWrite)
                Atomics.notify(this.sabControl, 1, 1)

                return
            }
        }

        // ensure capacity for stereo interleaved samples in local buffer
        const required = this.bufptr + 2
        if (required > this.audiobuf.length) {

            // expand by 2x until it's large enough
            let newSize = this.audiobuf.length || this.bufferSize * 8
            while (newSize < required) newSize *= 2
            const newBuf = new Float32Array(newSize)
            newBuf.set(this.audiobuf.subarray(0, this.bufptr))
            this.audiobuf = newBuf
        }

        this.audiobuf[this.bufptr] = normalizedSample
        this.audiobuf[this.bufptr + 1] = normalizedSample

        this.bufptr += 2
    }

    flushFrame() {
        if (this.bufptr > 0) {
            if (this.audioWorkletNode?.port) {

                // If SAB is active, we assume the worklet will read from it.
                if (this.sab) {

                    // nothing to post; data was written into SAB directly
                }
                else {

                    // copy the used portion into a transferable ArrayBuffer
                    const samples = this.audiobuf.subarray(0, this.bufptr)
                    const copy = new Float32Array(samples.length)
                    copy.set(samples)
                    this.audioWorkletNode.port.postMessage({
                        type:   'samples',
                        buffer: copy.buffer,
                    }, [copy.buffer])
                }
            }

            // keep allocated buffer, just reset pointer
            this.bufptr = 0
        }
    }

    async start() {
        if (!this.isInitialized) {
            await this.initialize()
        }
        
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume()
        }
        
        this.isPlaying = true
    }

    pause() {
        this.isPlaying = false
        if (this.audioContext && this.audioContext.state === 'running') {
            
            return this.audioContext.suspend()
        }
    }

    async resume() {
        this.isPlaying = true
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }
    }

    destroy() {
        this.isPlaying = false

        // reset to an empty Float32Array
        this.audiobuf = new Float32Array(0)

        // clear SAB references
        this.sab = null
        this.sabControl = null
        this.sabData = null
        
        if (this.audioWorkletNode) {
            this.audioWorkletNode.disconnect()
            this.audioWorkletNode = null
        }
        
        if (this.gainNode) {
            this.gainNode.disconnect()
            this.gainNode = null
        }
        
        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }
        
        this.isInitialized = false
    }

    // 音量控制
    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume))
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume
        }
    }

    getVolume() {
        return this.volume
    }

    getAudioContext() {
        return this.audioContext
    }
}

export { WebNESAudioOutput }
