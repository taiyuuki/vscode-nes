<img alt="红白机" width="128px" src="https://taiyuuki.gallerycdn.vsassets.io/extensions/taiyuuki/vscode-nes/0.0.6/1685968691107/Microsoft.VisualStudio.Services.Icons.Default">

# 红白机模拟器

<a href="https://marketplace.visualstudio.com/items?itemName=taiyuuki.vscode-nes">
<img alt="Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/taiyuuki.vscode-nes?color=%0eb0c9&label=Marketplace&logo=visual%20studio%20code"></a>

 <a href="https://github.com/taiyuuki/vscode-nes"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/taiyuuki/vscode-nes?style=social"></a>


这是一款可以玩 FC(NES) 游戏的 VS Code 插件，超过3000个远程ROM，也可以添加本地ROM。

v1.0.0版本使用[nesjs](https://nesjs.netlify.app/)模拟器，大幅提升对各类ROM的兼容性。

VS Code版本要求： >= 1.75.0

## 功能

- [x] 支持即时保存、读取，每个游戏有四个存档位。
- [x] 支持本地ROM，可以将远程ROM保存到本地。
- [x] 支持播放nsf音乐
- [x] 支持双人
- [x] 支持自定义按键
- [x] 支持金手指
- [x] 支持手柄
- [x] 支持连发键

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

## 使用

安装插件后，点击侧边栏的手柄图标，然后选择游戏就可以玩了。

如果黑屏、没反应、不显示文字等，重新选择一次游戏。

## 配置项

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

## 金手指

现在插件支持金手指功能，由于每个游戏的金手指代码不同，你需要自行网上搜索所玩游戏对应的金手指。

目前采用的是兼容`VirtuaNES`的金手指格式，例如079F-01-01，其中079F表示内存地址，中间01的0表示修改类型，中间01的1表示数值长度，右侧的01表示数值。

如果有多个同一地址的金手指，只会生效一个。

另外请注意修改类型：0表示始终修改，1表示只修改一次，2表示保证值不大于，3表示保证值不小于。

更详细的信息请自行查阅VirtuaNES的金手指相关内容。

## Issue

如果遇到任何问题或bug，欢迎提交[issue](https://github.com/taiyuuki/vscode-nes/issues)。

## License

MIT Copyright (c) 2023-2025 Taiyuuki