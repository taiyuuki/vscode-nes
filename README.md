# 红白机模拟器

<a href="https://marketplace.visualstudio.com/items?itemName=taiyuuki.vscode-nes">
<img alt="Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/taiyuuki.vscode-nes?color=%0eb0c9&label=Marketplace&logo=visual%20studio%20code"></a>

这是一款可以玩 FC(NES) 游戏的 VS Code 插件。

受 [小霸王](https://marketplace.visualstudio.com/items?itemName=gamedilong.anes) 的启发，但它已经很久没有维护，不太能用了，于是我写了这个能用、且功能更强大的版本。

## 功能

* 支持手柄
* 支持连发键
* 支持即时保存、读取
* 支持切换分辨率
* 支持暂停、静音
* 支持加载本地ROM
* 支持双人

## 使用

安装插件后，点击侧边栏的图标，然后选择游戏就可以玩了。

由于安全策略的问题，每次选择游戏都需要手动点击屏幕中间的 `点我开始游戏` 才会运行。

如果黑屏、不显示文字，点重置按钮试试，或者重新点击侧边栏中的游戏。

## 配置项

我默认设置了20多个游戏，我直接用的 Github Page作为远程地址，理论上不太需要担心会失效。

根据网速的不同情况，个别游戏可能需要加载较长时间。

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

## Issue

如果遇到任何问题或bug，欢迎提交[issue](https://github.com/taiyuuki/vscode-nes/issues)。

## License

MIT Copyright (c) 2023 Taiyuuki