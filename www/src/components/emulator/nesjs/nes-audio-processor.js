class NESAudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super()
        this.frameCount = 0
        this.lastLogTime = 0
        this.maxBufferSize = 8192

        // SAB views (if initialized)
        this.sab = null
        this.sabControl = null
        this.sabData = null
        this.sabCapacity = 0

        // internal ring buffer for non-SAB path
        this.ring = new Float32Array(this.maxBufferSize)
        this.rRead = 0
        this.rWrite = 0
        this.rCapacity = this.ring.length

        this.port.onmessage = event => {
            const d = event.data
            if (d && d.type === 'init-config') {
                try {
                    const rc = d.ringCapacity || this.maxBufferSize
                    this.maxBufferSize = rc
                    this.ring = new Float32Array(this.maxBufferSize)
                    this.rCapacity = this.ring.length
                    this.rRead = 0
                    this.rWrite = 0
                }
                catch {

                    // ignore
                }
            }
            else if (d && d.type === 'init-sab') {
                try {
                    this.sab = d.sab
                    this.sabControl = new Int32Array(this.sab, 0, 2)
                    const controlBytes = 2 * Int32Array.BYTES_PER_ELEMENT
                    this.sabData = new Float32Array(this.sab, controlBytes)
                    this.sabCapacity = d.capacity || this.sabData.length
                }
                catch {
                    this.sab = null
                    this.sabControl = null
                    this.sabData = null
                }
            }
            else if (d && d.type === 'samples') {
                this.lastDataTime = Date.now()
                if (d.buffer) {
                    try {
                        const arr = new Float32Array(d.buffer)
                        this._ringWrite(arr)
                    }
                    catch {

                        // ignore
                    }
                }
                else if (d.samples) {

                    // samples might be a normal JS array
                    const arr = new Float32Array(d.samples)
                    this._ringWrite(arr)
                }
            }
        }
    }

    _ringWrite(arr) {
        for (let i = 0; i < arr.length; i++) {

            // reserve next position; keep one slot empty to distinguish full/empty
            const next = (this.rWrite + 1) % this.rCapacity
            if (next === this.rRead) {

                // buffer full - drop oldest by advancing read
                this.rRead = (this.rRead + 1) % this.rCapacity
            }
            this.ring[this.rWrite] = arr[i]
            this.rWrite = next
        }
    }

    process(inputs, outputs) {
        const output = outputs[0]
        const left = output[0]
        const right = output[1]

        this.frameCount++

        if (this.sabData) {
            let read = Atomics.load(this.sabControl, 0)
            const write = Atomics.load(this.sabControl, 1)
            const capacity = this.sabCapacity || this.sabData.length
            let available = write >= read ? write - read : write + capacity - read

            for (let i = 0; i < left.length; i++) {
                if (available >= 2) {
                    left[i] = this.sabData[read]
                    right[i] = this.sabData[(read + 1) % capacity]
                    read = (read + 2) % capacity
                    available -= 2
                }
                else {
                    left[i] = 0
                    right[i] = 0
                }
            }

            Atomics.store(this.sabControl, 0, read)
        }
        else {
            for (let i = 0; i < left.length; i++) {
                if (this.rRead === this.rWrite) {
                    left[i] = 0
                    right[i] = 0
                }
                else {

                    // read two samples (stereo interleaved)
                    left[i] = this.ring[this.rRead]
                    right[i] = this.ring[(this.rRead + 1) % this.rCapacity]
                    this.rRead = (this.rRead + 2) % this.rCapacity
                }
            }
        }

        return true
    }
}

registerProcessor('nes-audio-processor', NESAudioProcessor)
