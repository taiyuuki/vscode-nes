export interface CanvasRendererOptions {
    scale?:     number
    clip8px?:   boolean
    fillColor?: string | [number, number, number, number]
    smoothing?: boolean
}

class CanvasRenderer {
    canvas:             HTMLCanvasElement
    ctx:                CanvasRenderingContext2D
    scale:              number
    smoothing:          boolean
    clip8px:            boolean
    fillColor:          Uint8ClampedArray
    NES_Width = 256
    NEX_Height = 240
    private clipBounds: { startX: number; startY: number; width: number; height: number } | null = null

    constructor(canvas: HTMLCanvasElement, options?: CanvasRendererOptions) {
        const cfg = Object.assign({
            scale:   2,
            clip8px: false,
        }, options)
        
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        this.scale = cfg.scale
        this.clip8px = cfg.clip8px
        this.smoothing = cfg.smoothing ?? false
        this.fillColor = this.parseFillColor(cfg.fillColor)

        this.updateClipBounds()
        this.updateCanvasSize()
        this.setSmoothing(this.smoothing)
    }

    parseFillColor(color?: string | [number, number, number, number]): Uint8ClampedArray {
        if (!color) {
            return new Uint8ClampedArray([0, 0, 0, 255])
        }
        if (Array.isArray(color)) {
            return new Uint8ClampedArray(color)
        }
        if (color.startsWith('#')) {
            color = color.slice(1)
        }
        const hex = Number.parseInt(color, 16)
        if (Number.isNaN(hex)) {
            return new Uint8ClampedArray([0, 0, 0, 255])
        }
        switch (color.length) {
            case 3: 
            {
                const r = hex >> 8 & 0xF
                const g = hex >> 4 & 0xF
                const b = hex & 0xF

                return new Uint8ClampedArray([r * 17, g * 17, b * 17, 255])
            }
            case 4:
            {
                const r = hex >> 12 & 0xF
                const g = hex >> 8 & 0xF
                const b = hex >> 4 & 0xF
                const a = hex & 0xF

                return new Uint8ClampedArray([r * 17, g * 17, b * 17, a * 17])
            }
            case 6:
            {
                const r = hex >> 16 & 0xFF
                const g = hex >> 8 & 0xFF
                const b = hex & 0xFF

                return new Uint8ClampedArray([r, g, b, 255])
            }
            case 8:
            {
                const r = hex >> 24 & 0xFF
                const g = hex >> 16 & 0xFF
                const b = hex >> 8 & 0xFF
                const a = hex & 0xFF

                return new Uint8ClampedArray([r, g, b, a])
            }
            default:
                return new Uint8ClampedArray([0, 0, 0, 255])
        }
    }

    private updateClipBounds() {
        if (this.clip8px) {
            this.clipBounds = {
                startX: 8,
                startY: 8,
                width:  this.NES_Width - 16,
                height: this.NEX_Height - 16,
            }
        }
        else {
            this.clipBounds = null
        }
    }

    updateCanvasSize() {
        this.canvas.width = this.NES_Width
        this.canvas.height = this.NEX_Height
        this.canvas.style.width = `${this.NES_Width * this.scale}px`
        this.canvas.style.height = `${this.NEX_Height * this.scale}px`
    }

    renderFrame(imageData: Uint8Array) {
        const imgData = this.ctx.createImageData(256, 240)
        
        if (this.clipBounds) {
            const { startX, startY, width, height } = this.clipBounds
            const sourceWidth = this.NES_Width

            const data = imgData.data
            
            for (let y = 0; y < startY; y++) {
                const rowStart = y * sourceWidth * 4
                for (let i = rowStart; i < rowStart + sourceWidth * 4; i += 4) {
                    data[i] = this.fillColor[0] // R
                    data[i + 1] = this.fillColor[1] // G
                    data[i + 2] = this.fillColor[2] // B
                    data[i + 3] = this.fillColor[3] // A
                }
            }
            
            for (let y = startY + height; y < this.NEX_Height; y++) {
                const rowStart = y * sourceWidth * 4
                for (let i = rowStart; i < rowStart + sourceWidth * 4; i += 4) {
                    data[i] = this.fillColor[0] // R
                    data[i + 1] = this.fillColor[1] // G
                    data[i + 2] = this.fillColor[2] // B
                    data[i + 3] = this.fillColor[3] // A
                }
            }
            
            for (let y = 0; y < height; y++) {
                const sourceY = y + startY
                const rowStart = sourceY * sourceWidth * 4
                const gameRowStart = sourceY * sourceWidth * 4
                
                for (let i = rowStart; i < rowStart + startX * 4; i += 4) {
                    data[i] = this.fillColor[0] // R
                    data[i + 1] = this.fillColor[1] // G
                    data[i + 2] = this.fillColor[2] // B
                    data[i + 3] = this.fillColor[3] // A
                }
                
                const gameStart = gameRowStart + startX * 4
                const gameEnd = gameStart + width * 4
                data.set(imageData.subarray(gameStart, gameEnd), gameStart)
                
                const rightStart = rowStart + (startX + width) * 4
                const rightEnd = rowStart + sourceWidth * 4
                for (let i = rightStart; i < rightEnd; i += 4) {
                    data[i] = this.fillColor[0] // R
                    data[i + 1] = this.fillColor[1] // G
                    data[i + 2] = this.fillColor[2] // B
                    data[i + 3] = this.fillColor[3] // A
                }
            }
        }
        else {

            imgData.data.set(imageData)
        }
        
        this.ctx.putImageData(imgData, 0, 0)
    }

    setScale(newScale: number) {
        this.scale = newScale
        this.updateCanvasSize()
    }

    setClip8px(clip: boolean) {
        this.clip8px = clip
        this.updateClipBounds()
    }

    setFillColor(color: string | [number, number, number, number]) {
        this.fillColor = this.parseFillColor(color)
    }

    setSmoothing(smoothing: boolean) {
        this.smoothing = smoothing
        if (smoothing) {
            this.ctx.imageSmoothingEnabled = true
            this.canvas.style.imageRendering = 'auto'
        }
        else {
            this.ctx.imageSmoothingEnabled = false
            this.canvas.style.imageRendering = 'pixelated'
        }
    }
}

export { CanvasRenderer }
