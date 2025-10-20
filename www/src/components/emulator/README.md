# NES 模拟器 V2 - 重构版本

## 📁 项目结构

```
www/src/components/
├── NESEmulator.vue              # 原始版本 (保留)
├── NESEmulatorV2.vue            # 重构的主组件
└── emulator/                    # 子组件和组合式函数
    ├── GameControls.vue         # 游戏控制按钮组件
    ├── Modal.vue                # 通用弹窗组件
    ├── SaveStateModal.vue       # 存档管理弹窗
    ├── SaveSlot.vue             # 单个存档槽组件
    ├── SettingsModal.vue        # 设置弹窗
    ├── CheatModal.vue           # 金手指弹窗
    ├── CheatItem.vue            # 单个金手指项组件
    ├── useEmulatorDB.ts         # 数据库操作 Composable
    ├── useGameState.ts          # 游戏状态管理 Composable
    ├── useEmulatorSettings.ts   # 设置管理 Composable
    └── useCheats.ts             # 金手指管理 Composable
```

## ✨ 主要改进

### 1. **组件化设计**
   - 将大型单一组件拆分为多个小型、可复用的组件
   - 每个组件职责单一,便于维护和测试
   - 遵循 Vue 3 组件最佳实践

### 2. **组合式函数 (Composables)**
   - `useEmulatorDB`: 管理 IndexedDB 数据库操作
   - `useGameState`: 管理游戏状态和存档
   - `useEmulatorSettings`: 管理模拟器设置
   - `useCheats`: 管理金手指功能
   - 实现业务逻辑的复用和解耦

### 3. **VS Code 主题集成**
   使用 VS Code 内置的 CSS 变量,完美融入编辑器主题:
   
   #### 颜色变量
   - `--vscode-editor-background`: 编辑器背景色
   - `--vscode-editor-foreground`: 编辑器前景色
   - `--vscode-button-background`: 主按钮背景
   - `--vscode-button-foreground`: 主按钮文字
   - `--vscode-button-hoverBackground`: 主按钮悬停
   - `--vscode-button-secondaryBackground`: 次要按钮背景
   - `--vscode-panel-border`: 面板边框
   - `--vscode-focusBorder`: 焦点边框
   - `--vscode-input-background`: 输入框背景
   - 更多变量...
   
   #### 自定义 CSS 变量
   ```css
   :root {
       --spacing-xs: 4px;
       --spacing-small: 8px;
       --spacing-medium: 16px;
       --spacing-large: 20px;
       --spacing-xxl: 48px;
       --border-radius: 8px;
       --border-radius-small: 4px;
       --border-radius-large: 12px;
   }
   ```

### 4. **改进的用户体验**
   - 平滑的动画和过渡效果
   - 响应式设计,适配移动端
   - 更清晰的视觉层次
   - 更好的交互反馈
   - 无障碍访问支持

### 5. **代码质量提升**
   - TypeScript 类型安全
   - 更清晰的代码组织
   - 更好的错误处理
   - 减少代码重复

## 🎨 设计特点

### Modal 组件
- 统一的弹窗样式
- 支持自定义标题
- 平滑的打开/关闭动画
- 点击遮罩层关闭
- 滚动条样式优化

### GameControls 组件
- 图标 + 文字的按钮设计
- 主要/次要按钮区分
- 移动端自动隐藏文字,只显示图标
- 悬停效果和阴影

### SaveSlot 组件
- 卡片式设计
- 截图预览
- 清晰的操作按钮
- 空槽位的占位符设计

### SettingsModal 组件
- 分组的设置项
- 直观的控件 (复选框、滑块、下拉框)
- 实时预览设置效果

### CheatModal 组件
- 添加表单 + 列表展示
- 金手指状态标签
- 启用/禁用切换

## 📱 响应式设计

- 桌面端: 完整的按钮文字和大尺寸弹窗
- 移动端:
  - 控制按钮只显示图标
  - 弹窗宽度适应屏幕
  - 卡片式布局调整为垂直排列
  - 触摸优化的点击区域

## 🔧 如何使用

### 在 App.vue 中引入

```vue
<script setup lang="ts">
// 使用新版本
import NESEmulator from './components/NESEmulatorV2.vue'

// 或继续使用原版本
// import NESEmulator from './components/NESEmulator.vue'
</script>

<template>
  <NESEmulator />
</template>
```

### API 兼容性

新版本与原版本保持完全兼容:
- 接收相同的 VSCode 消息
- 支持相同的功能
- 数据库结构相同

## 🎯 未来优化建议

1. **添加单元测试**
   - 为 Composables 编写测试
   - 为组件编写快照测试

2. **性能优化**
   - 虚拟滚动优化长列表
   - 图片懒加载

3. **功能增强**
   - 存档导入/导出
   - 金手指数据库集成
   - 快捷键支持
   - 手柄支持状态显示

4. **国际化**
   - 添加 i18n 支持
   - 支持多语言切换

5. **主题定制**
   - 允许用户自定义主题色
   - 提供主题预设

## 🐛 已知问题

目前代码中有一些 ESLint 警告,主要是:
- 未使用的导入 (如 `reactive`, `computed`)
- 代码格式问题 (空行、引号等)

这些都是小问题,不影响功能,可以通过配置 ESLint 或格式化代码解决。

## 📄 许可

与主项目保持一致
