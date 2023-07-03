<center><img alt="红白机" width="128px" src="https://taiyuuki.gallerycdn.vsassets.io/extensions/taiyuuki/vscode-nes/0.0.6/1685968691107/Microsoft.VisualStudio.Services.Icons.Default"></center>

# 红白机模拟器

<a href="https://marketplace.visualstudio.com/items?itemName=taiyuuki.vscode-nes">
<img alt="Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/taiyuuki.vscode-nes?color=%0eb0c9&label=Marketplace&logo=visual%20studio%20code"></a>

这是一款可以玩 FC(NES) 游戏的 VS Code 插件。

受 [小霸王](https://marketplace.visualstudio.com/items?itemName=gamedilong.anes) 的启发，但它已经很久没有维护，新版本VS Code无法使用，于是我写了这个能用、且功能更强大的版本。

## 功能

- [x] 支持手柄
- [x] 支持连发键
- [x] 支持即时保存、读取
- [x] 支持切换分辨率
- [x] 支持暂停、静音
- [x] 支持加载本地ROM
- [x] 支持双人
- [x] 支持自定义按键

## 默认按键

| 按键      | P1   | P2      |
| --------- | ---- | ------- |
| 上        | W    | ↑       |
| 下        | S    | ↓       |
| 左        | A    | ←       |
| 右        | D    | →       |
| 跳跃A     | K    | 数字键2 |
| 攻击B     | J    | 数字键1 |
| 跳跃连发C | I    | 数字键5 |
| 攻击连发D | U    | 数字键4 |
| 开始      | 1    |         |
| 选择      | 2    |         |

## 更新v0.1.0

- 支持自定义按键

## 使用

安装插件后，点击侧边栏的图标，然后选择游戏就可以玩了。

由于安全策略的问题，每次选择游戏都需要手动点击屏幕中间的 `点我开始游戏` 才会运行。

如果黑屏、不显示文字，点重置按钮试试，或者重新点击侧边栏中的游戏。

## 配置项

### 远程地址

我默认设置了30多个游戏，我直接用 Github Page作为远程地址，理论上不太需要担心会失效。

如果想玩更多游戏，除了加载本地ROM，你还可以在插件的设置（`settings.json`）中增加或修改`vscodeNes.romPath`，格式如下：

```json
"vscodeNes.romPath": [
    [
      "忍者龙剑传3-黄泉方舟",
      "https://taiyuuki.github.io/vscode-nes/roms/忍者龙剑传3-黄泉方舟.nes"
    ],
    [
      "快打旋风",
      "https://taiyuuki.github.io/vscode-nes/roms/快打旋风.nes"
    ],
    [
      "恶魔城",
      "https://taiyuuki.github.io/vscode-nes/roms/恶魔城.nes"
    ]
  ]
```

### 自定义按键

在settings.json中设置"vscodeNes.controller"字段可以自定义键盘按键（不会影响手柄），键值为[KeyboardEvent.code](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/code)，默认值如下：

```json
{
  "p1": {
    "UP": "KeyW",
    "DOWN": "KeyS",
    "LEFT": "KeyA",
    "RIGHT": "KeyD",
    "START": "Digit1",
    "SELECT": "Digit2",
    "B": "KeyJ",
    "A": "KeyK",
    "D": "KeyU",
    "C": "KeyI"
  },
  "p2": {
    "UP": "ArrowUp",
    "DOWN": "ArrowDown",
    "LEFT": "ArrowLeft",
    "RIGHT": "ArrowRight",
    "B": "Numpad1",
    "A": "Numpad2",
    "D": "Numpad4",
    "C": "Numpad5"
  }
}
```

## Issue

如果遇到任何问题或bug，欢迎提交[issue](https://github.com/taiyuuki/vscode-nes/issues)。

## License

MIT Copyright (c) 2023 Taiyuuki