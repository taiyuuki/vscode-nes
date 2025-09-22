# @nesjs/native - 浏览器原生 NES 模拟器

[![npm version](https://badge.fury.io/js/%40nesjs%2Fnative.svg)](https://badge.fury.io/js/%40nesjs%2Fnative) 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 [@nesjs/core](./core) 的浏览器原生实现，提供开箱即用的 Canvas 渲染、Web Audio API 音频输出和键盘/手柄控制支持。

## 特性

- 🎮 基于 `@nesjs/core` 的完整 NES 模拟
- 🖼️ Canvas 2D 渲染器，支持缩放和图像抗锯齿
- 🎵 Web Audio API 音频输出，低延迟播放
- ⌨️ 可自定义的键盘控制映射
- 🎯 手柄 (Gamepad API) 支持，包括连发功能
- 🔧 金手指功能支持
- 🎨 可配置的视觉效果（缩放、抗锯齿、边框裁剪等）
- 📱 响应式设计，适配不同屏幕尺寸

## 安装

::: code-group
```bash [npm]
npm install @nesjs/native
```

```bash [yarn]
yarn add @nesjs/native
```

```bash [pnpm]
pnpm add @nesjs/native
```
:::

## 快速开始

### 基础使用

```typescript
import { NESEmulator } from '@nesjs/native'

// 获取 Canvas 元素
const canvas = document.getElementById('nes-canvas') as HTMLCanvasElement

// 创建模拟器实例
const emulator = new NESEmulator(canvas, {
    scale: 2, // 2x 缩放
    smoothing: false, // 关闭抗锯齿
    audioSampleRate: 44100, // 音频采样率
    enableCheat: true, // 启用金手指
})

// 加载 ROM 文件
const response = await fetch('path/to/game.nes')
const romData = new Uint8Array(await response.arrayBuffer())

await emulator.loadROM(romData)

// 启动模拟器
await emulator.start()
```

### HTML 示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>NES Emulator</title>
    <style>
        #nes-canvas {
            border: 2px solid #333;
            image-rendering: pixelated; /* 保持像素完美 */
        }
        .controls {
            margin-top: 10px;
        }
        button {
            margin: 5px;
            padding: 10px 15px;
        }
    </style>
</head>
<body>
    <canvas id="nes-canvas"></canvas>
    <div class="controls">
        <button onclick="emulator.start()">开始</button>
        <button onclick="emulator.pause()">暂停</button>
        <button onclick="emulator.reset()">重置</button>
        <input type="file" id="rom-input" accept=".nes">
    </div>

    <script type="module">
        import { NESEmulator } from '@nesjs/native'
        
        const canvas = document.getElementById('nes-canvas')
        const emulator = new NESEmulator(canvas)
        
        // ROM 文件加载
        document.getElementById('rom-input').addEventListener('change', async (e) => {
            const file = e.target.files[0]
            if (file) {
                const romData = new Uint8Array(await file.arrayBuffer())
                await emulator.loadROM(romData)
            }
        })
        
        // 暴露到全局作用域供按钮使用
        window.emulator = emulator
    </script>
</body>
</html>
```

## API 参考

### NESEmulator 类

#### 构造函数

```typescript
new NESEmulator(canvas: HTMLCanvasElement, options?: NESEmulatorOptions)
```

**配置选项 (NESEmulatorOptions):**

```typescript
interface NESEmulatorOptions {

    // 渲染选项
    scale?: number // 缩放倍数，默认 2
    clip8px?: boolean // 裁剪边框 8 像素，默认 false
    fillColor?: string | [number, number, number, number] // 裁剪区域的填充颜色
    smoothing?: boolean // 图像抗锯齿，默认 false
    
    // 核心模拟器选项
    audioBufferSize?: number // 音频缓冲区大小，默认 1024
    audioSampleRate?: number // 音频采样率，默认 44100
    autoSaveInterval?: number // 自动保存间隔，默认 3600
    enableCheat?: boolean // 启用金手指，默认 true
    
    // 控制器键位映射
    player1KeyMap?: Record<string, string> // 玩家1键位映射
    player2KeyMap?: Record<string, string> // 玩家2键位映射
}
```

#### 核心方法

##### loadROM(romData: Uint8Array): Promise\<void>
加载 ROM 文件数据。

##### start(): Promise\<void>
启动模拟器。如果已暂停，则恢复运行。

##### pause(): void
暂停模拟器。

##### resume(): void
恢复暂停的模拟器。

##### stop(): void
完全停止模拟器并清理资源。

##### reset(): void
重置游戏到初始状态。

#### 音频控制

##### enableAudio(): Promise\<boolean>
启用音频输出。

##### disableAudio(): void
禁用音频输出。

##### setVolume(volume: number): void
设置音量 (0.0 - 1.0)。

#### 视觉设置

##### setScale(scale: number): void
设置画面缩放倍数。

##### setSmoothing(smoothing: boolean): void
设置图像抗锯齿开关。

#### 金手指功能

##### addCheat(code: string): boolean
添加金手指代码。

##### toggleCheat(code: string): void
切换金手指启用状态。

##### removeCheat(code: string): void
移除金手指。

##### clearAllCheats(): void
清除所有金手指。

#### 控制器配置

##### setupKeyboadController(player: 1 | 2, keyMap: Record<string, string>): void
设置键盘控制映射。

## 控制器配置

### 默认键位映射

**玩家1 (WASD + KJ):**
```typescript
const P1_DEFAULT = {
    UP: 'KeyW', // W - 上
    DOWN: 'KeyS', // S - 下  
    LEFT: 'KeyA', // A - 左
    RIGHT: 'KeyD', // D - 右
    A: 'KeyK', // K - A键
    B: 'KeyJ', // J - B键
    C: 'KeyI', // I - A连发
    D: 'KeyU', // U - B连发
    SELECT: 'Digit2', // 2 - SELECT
    START: 'Digit1', // 1 - START
}
```

**玩家2 (方向键 + 小键盘):**
```typescript
const P2_DEFAULT = {
    UP: 'ArrowUp', // ↑ - 上
    DOWN: 'ArrowDown', // ↓ - 下
    LEFT: 'ArrowLeft', // ← - 左  
    RIGHT: 'ArrowRight', // → - 右
    A: 'Numpad2', // 小键盘2 - A键
    B: 'Numpad1', // 小键盘1 - B键
    C: 'Numpad5', // 小键盘5 - A连发
    D: 'Numpad4', // 小键盘4 - B连发
    SELECT: 'NumpadDecimal', // 小键盘. - SELECT
    START: 'NumpadEnter', // 小键盘Enter - START
}
```

### 自定义键位映射

```typescript
// 自定义玩家1键位
emulator.setupKeyboadController(1, {
    UP: 'KeyI',
    DOWN: 'KeyK', 
    LEFT: 'KeyJ',
    RIGHT: 'KeyL',
    A: 'Space',
    B: 'ShiftLeft',
    SELECT: 'KeyQ',
    START: 'KeyE',
})
```

### 手柄支持

模拟器自动检测并支持标准游戏手柄：

- **按键映射**: 自动映射 Xbox/PlayStation 控制器按键
- **连发功能**: B 和 Y 按键默认支持连发
- **摇杆支持**: 左摇杆控制方向
- **即插即用**: 无需额外配置，连接后自动识别

## 高级用法

### 画面设置

```typescript
// 创建像素完美的显示
const emulator = new NESEmulator(canvas, {
    scale: 3, // 3倍缩放
    smoothing: false, // 关闭抗锯齿
    clip8px: true, // 裁剪边缘
    fillColor: '#000000', // 黑色填充
})

// 运行时调整
emulator.setScale(4)
emulator.setSmoothing(true)
```

### 音频配置

```typescript
const emulator = new NESEmulator(canvas, {
    audioSampleRate: 48000, // 高质量音频
    audioBufferSize: 512, // 低延迟缓冲区
})

// 控制音频
await emulator.enableAudio()
emulator.setVolume(0.8) // 80% 音量
emulator.disableAudio() // 静音
```

### 金手指使用

```typescript
// 添加金手指代码
emulator.addCheat('079F-01-01')

// 管理金手指
emulator.toggleCheat('079F-01-01') // 切换启用状态
emulator.removeCheat('079F-01-01') // 移除
emulator.clearAllCheats() // 清除全部
```

### 状态管理

```typescript
// 创建存档
const saveState = emulator.saveState()

// 加载存档
const savedState = emulator.loadState(savedState)

// 获取调试信息
const debug = nes.getDebugInfo()
console.log(`帧数: ${debug.frameCount}, CPU: ${debug.cpuCycles}`)
```

## 浏览器兼容性

- **Chrome 66+** - 完全支持
- **Firefox 60+** - 完全支持  
- **Safari 11.1+** - 完全支持
- **Edge 79+** - 完全支持

**所需 API:**
- Canvas 2D Context
- Web Audio API
- Gamepad API (可选)
- ArrayBuffer/Uint8Array

## 性能优化

### 建议配置

```typescript
// 性能优先
const emulator = new NESEmulator(canvas, {
    scale: 2,
    smoothing: false, // 关闭抗锯齿减少 GPU 负载
    audioBufferSize: 2048, // 增大缓冲区减少音频卡顿
})

// 质量优先  
const emulator = new NESEmulator(canvas, {
    scale: 4,
    smoothing: true, // 抗锯齿
    audioSampleRate: 48000, // 高音质
    audioBufferSize: 512, // 低延迟
})
```

## 故障排除

### 常见问题

**音频无法播放:**

```typescript
// 确保在用户交互后启用音频
const enableAudioOnInteraction = async() => {
    await emulator.enableAudio()

    // Remove event listeners
    document.removeEventListener('click', enableAudioOnInteraction)
    document.removeEventListener('keydown', enableAudioOnInteraction)
    document.removeEventListener('touchstart', enableAudioOnInteraction)
}

document.addEventListener('click', enableAudioOnInteraction)
document.addEventListener('keydown', enableAudioOnInteraction)
document.addEventListener('touchstart', enableAudioOnInteraction)
```

**画面模糊:**
```typescript
// 关闭抗锯齿并设置 CSS
emulator.setSmoothing(false)
canvas.style.imageRendering = 'pixelated'
```

**性能问题:**
```typescript
// 检查帧率
let frameCount = 0
setInterval(() => {
    const debug = emulator.nes.getDebugInfo()
    console.log(`FPS: ${debug.frameCount - frameCount}`)
    frameCount = debug.frameCount
}, 1000)
```