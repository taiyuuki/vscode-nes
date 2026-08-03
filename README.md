<img alt="红白机" width="128px" src="https://taiyuuki.gallerycdn.vsassets.io/extensions/taiyuuki/vscode-nes/0.0.6/1685968691107/Microsoft.VisualStudio.Services.Icons.Default">

# 红白机模拟器

<a href="https://marketplace.visualstudio.com/items?itemName=taiyuuki.vscode-nes">
<img alt="Marketplace Version" src="https://img.shields.io/github/package-json/v/taiyuuki/vscode-nes?label=Marketplace&labelColor=%23FFFFFF&color=%23962538"></a>

 <a href="https://github.com/taiyuuki/vscode-nes"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/taiyuuki/vscode-nes?style=social"></a>


这是一款可以玩 FC(NES) 游戏的 VS Code 插件，内置了超过3000个游戏的远程ROM，你还可以自己添加本地ROM。

^1.0.0 版本改用[nesjs](https://github.com/taiyuuki/nesjs)，这是我自己用TS写的NES模拟器库，大幅提升对各类ROM的兼容性，覆盖 99% 原版游戏ROM，大部分改版、汉化版游戏ROM也都能正常运行。

VS Code版本要求： >= 1.75.0

## 使用

安装插件后，点击侧边栏的手柄图标，然后选择游戏就可以玩了。

打开模拟器页面后，**游戏默认是静音的**，你需要在页面的设置面板中手动打开声音。

## 功能

- [x] 支持即时保存、读取，每个游戏有四个存档位。
- [x] 支持本地ROM，可以将远程ROM保存到本地。
- [x] 支持播放nsf格式的NES音乐文件
- [x] 支持双人
- [x] 支持自定义按键
- [x] 支持金手指
- [x] 支持手柄
- [x] 支持连发键
- [x] 支持局域网双人联机（lockstep 帧同步）


## 局域网联机

插件支持两台处于同一局域网的机器通过 TCP 进行双人联机，采用确定性 lockstep 帧同步（每帧互发 1 字节手柄输入）。

### 联机步骤

1. **两台机器都打开模拟器面板并加载同一个游戏**（确保 ROM 一致）。
2. **房主（P1）**：命令面板执行 `红白机模拟器：创建房间`，选择本地玩家号（P1），记下弹出的端口号，把它和自己的局域网 IP 告诉对手。
3. **对手（P2）**：命令面板执行 `红白机模拟器：加入房间`，选择互补的玩家号（P2），输入 `IP:端口`。
4. 连接建立后，房主端出现联机状态条。点击 **同步存档** 把当前游戏状态发给对手，对手加载完成后房主点 **开始游戏** 即可对战。
5. 结束时点 **断开** 或执行 `红白机模拟器：断开连接`。

> 注意：联机过程中两端会按帧严格同步，网络抖动会导致双方一起卡顿（等待对齐），局域网延迟通常可忽略。如果中途断线，需重新创建房间并重新同步存档。


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

## 配置项

### 自定义按键

在settings.json中设置"vscodeNes.controller"字段可以自定义键盘按键，默认值如下：

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

## 金手指（作弊码）

现在插件支持金手指功能，你需要自行网上搜索所玩游戏对应的金手指。

模拟器采用的是兼容`VirtuaNES`的金手指格式，例如079F-01-01，其中079F表示内存地址，中间01的0表示修改类型，中间01的1表示数值长度，右侧的01表示数值。

## Issue

如果有任何问题或bug，欢迎提交[issue](https://github.com/taiyuuki/vscode-nes/issues)，如果是遇到游戏运行错误，你也可以去[nesjs](https://github.com/taiyuuki/nesjs)反馈。

## License

MIT Copyright (c) 2023-2026 Taiyuuki