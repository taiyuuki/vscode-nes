<script setup lang="ts">
interface SaveState {
    id:          string
    name:        string
    timestamp:   number
    data:        Uint8Array
    screenshot?: string
}

interface Props {
    slotId:    number
    saveState: SaveState | null
}

defineProps<Props>()

const emit = defineEmits<{
    save:   []
    load:   [saveState: SaveState]
    delete: [saveState: SaveState]
}>()

function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="save-slot">
    <!-- 截图预览 -->
    <div class="screenshot-wrapper">
      <img
        v-if="saveState?.screenshot"
        :src="saveState.screenshot"
        alt="存档截图"
        class="screenshot"
      >
      <div
        v-else
        class="screenshot-empty"
      >
        <span class="empty-icon">📷</span>
      </div>
    </div>
    
    <!-- 存档信息 -->
    <div class="save-info">
      <template v-if="saveState">
        <div class="save-name">
          存档位 {{ slotId }}
        </div>
        <div class="save-time">
          {{ formatTime(saveState.timestamp) }}
        </div>
      </template>
      <div
        v-else
        class="no-save"
      >
        空存档位
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="save-actions">
      <button
        v-if="saveState"
        class="action-btn load-btn"
        title="加载此存档"
        @click="emit('load', saveState)"
      >
        加载
      </button>
      
      <button
        class="action-btn save-btn"
        title="保存到此位置"
        @click="emit('save')"
      >
        保存
      </button>
      
      <button
        v-if="saveState"
        class="action-btn delete-btn"
        title="删除此存档"
        @click="emit('delete', saveState)"
      >
        删除
      </button>
    </div>
  </div>
</template>

<style scoped>
.save-slot {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium, 16px);
  padding: var(--spacing-medium, 16px);
  background: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: var(--border-radius, 8px);
  transition: all 0.2s ease;
}

.save-slot:hover {
  background: var(--vscode-list-hoverBackground);
  border-color: var(--vscode-focusBorder);
}

.screenshot-wrapper {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
}

.screenshot {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-small, 6px);
  border: 1px solid var(--vscode-panel-border);
}

.screenshot-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vscode-input-background);
  border: 2px dashed var(--vscode-panel-border);
  border-radius: var(--border-radius-small, 6px);
  color: var(--vscode-descriptionForeground);
}

.empty-icon {
  font-size: 32px;
  opacity: 0.5;
}

.save-info {
  flex: 1;
  min-width: 0;
}

.save-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vscode-editor-foreground);
  margin-bottom: var(--spacing-xs, 4px);
}

.save-time {
  font-size: 13px;
  color: var(--vscode-descriptionForeground);
}

.no-save {
  font-size: 14px;
  color: var(--vscode-disabledForeground);
  font-style: italic;
}

.save-actions {
  display: flex;
  gap: var(--spacing-xs, 8px);
  flex-shrink: 0;
}

.action-btn {
  padding: var(--spacing-xs, 6px) var(--spacing-small, 12px);
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: var(--border-radius-small, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

.load-btn {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.load-btn:hover {
  background: var(--vscode-button-hoverBackground);
}

.save-btn {
  background: var(--vscode-inputValidation-infoBackground);
  color: var(--vscode-inputValidation-infoForeground);
  border: 1px solid var(--vscode-inputValidation-infoBorder);
}

.save-btn:hover {
  opacity: 0.9;
}

.delete-btn {
  background: var(--vscode-inputValidation-errorBackground);
  color: var(--vscode-inputValidation-errorForeground);
  border: 1px solid var(--vscode-inputValidation-errorBorder);
}

.delete-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .save-slot {
    flex-direction: column;
    text-align: center;
  }
  
  .screenshot-wrapper {
    width: 100px;
    height: 75px;
  }
  
  .save-actions {
    width: 100%;
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
  }
}
</style>
