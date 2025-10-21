<script setup lang="ts">
interface Props { isPaused: boolean }

defineProps<Props>()

const isLocalROM = defineModel<boolean>('isLocal', { required: true })

const emit = defineEmits<{
    togglePlayPause: []
    reset: []
    openSaves: []
    openSettings: []
    openCheats: []
    download: []
}>()
</script>

<template>
  <div class="game-controls">
    <button
      class="control-btn primary"
      :title="isPaused ? '继续' : '暂停'"
      @click="emit('togglePlayPause')"
    >
      <span class="icon">{{ isPaused ? '▶' : '⏸' }}</span>
      <span class="label">{{ isPaused ? '继续' : '暂停' }}</span>
    </button>
    
    <button
      class="control-btn"
      title="重启游戏"
      @click="emit('reset')"
    >
      <span class="icon">↻</span>
      <span class="label">重启</span>
    </button>
    
    <button
      class="control-btn"
      title="存档管理"
      @click="emit('openSaves')"
    >
      <span class="icon">💾</span>
      <span class="label">存档</span>
    </button>
    
    <button
      class="control-btn"
      title="设置"
      @click="emit('openSettings')"
    >
      <span class="icon">⚙</span>
      <span class="label">设置</span>
    </button>
    
    <button
      class="control-btn"
      title="金手指"
      @click="emit('openCheats')"
    >
      <span class="icon">🎮</span>
      <span class="label">金手指</span>
    </button>

    <button
      class="control-btn"
      :disabled="isLocalROM"
      :title="isLocalROM ? '已下载' : '下载游戏'"
      @click="() => {
        $emit('download')
        isLocalROM = true
      }"
    >
      <span class="icon">⬇</span>
      <span class="label">{{ isLocalROM ? '本地ROM' : '保存ROM' }}</span>
    </button>
  </div>
</template>

<style scoped>
.game-controls {
  display: flex;
  gap: var(--spacing-small, 12px);
  padding: var(--spacing-medium, 16px);
  background: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: var(--border-radius, 8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 6px);
  padding: var(--spacing-small, 10px) var(--spacing-medium, 16px);
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: 1px solid var(--vscode-button-border, transparent);
  border-radius: var(--border-radius-small, 6px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.control-btn:hover {
  background: var(--vscode-button-secondaryHoverBackground);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:active {
  transform: translateY(0);
}

.control-btn.primary {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.control-btn.primary:hover {
  background: var(--vscode-button-hoverBackground);
}

.control-btn:disabled {
  background: var(--vscode-button-disabledBackground);
  color: var(--vscode-button-disabledForeground);
  cursor: not-allowed;
}

.control-btn:disabled:hover {
  background: var(--vscode-button-disabledBackground);
  transform: none;
  box-shadow: none;
}

.icon {
  font-size: 16px;
  line-height: 1;
}

@media (max-width: 768px) {
  .game-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .control-btn {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }
  
  .label {
    display: none;
  }
  
  .icon {
    font-size: 18px;
  }
}
</style>
