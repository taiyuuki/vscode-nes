<script setup lang="ts">
interface CheatCode {
    code: string
    description: string
    enabled: boolean
}

interface Props { cheat: CheatCode }

defineProps<Props>()

const emit = defineEmits<{
    toggle: []
    remove: []
}>()
</script>

<template>
  <div class="cheat-item">
    <div class="cheat-info">
      <div class="cheat-header">
        <span class="cheat-description">{{ cheat.description }}</span>
        <span
          class="cheat-status"
          :class="{ active: cheat.enabled }"
        >
          {{ cheat.enabled ? '已启用' : '已禁用' }}
        </span>
      </div>
      <code class="cheat-code">{{ cheat.code }}</code>
    </div>
    
    <div class="cheat-actions">
      <button
        class="action-btn toggle-btn"
        :class="{ active: cheat.enabled }"
        :title="cheat.enabled ? '禁用金手指' : '启用金手指'"
        @click="emit('toggle')"
      >
        {{ cheat.enabled ? '禁用' : '启用' }}
      </button>
      
      <button
        class="action-btn remove-btn"
        title="删除金手指"
        @click="emit('remove')"
      >
        删除
      </button>
    </div>
  </div>
</template>

<style scoped>
.cheat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-medium, 16px);
  padding: var(--spacing-medium, 14px);
  background: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: var(--border-radius, 6px);
  transition: all 0.2s ease;
}

.cheat-item:hover {
  background: var(--vscode-list-hoverBackground);
  border-color: var(--vscode-focusBorder);
}

.cheat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 6px);
}

.cheat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-small, 12px);
}

.cheat-description {
  font-size: 14px;
  font-weight: 500;
  color: var(--vscode-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cheat-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.cheat-status.active {
  background: var(--vscode-testing-iconPassed);
  color: white;
}

.cheat-code {
  font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
  font-size: 12px;
  color: var(--vscode-textPreformat-foreground);
  background: var(--vscode-textCodeBlock-background);
  padding: 4px 8px;
  border-radius: var(--border-radius-small, 4px);
  display: inline-block;
  border: 1px solid var(--vscode-panel-border);
}

.cheat-actions {
  display: flex;
  gap: var(--spacing-xs, 8px);
  flex-shrink: 0;
}

.action-btn {
  padding: var(--spacing-xs, 6px) var(--spacing-small, 12px);
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: var(--border-radius-small, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(0);
}

.toggle-btn {
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: 1px solid var(--vscode-button-border, transparent);
}

.toggle-btn:hover {
  background: var(--vscode-button-secondaryHoverBackground);
}

.toggle-btn.active {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.toggle-btn.active:hover {
  background: var(--vscode-button-hoverBackground);
}

.remove-btn {
  background: var(--vscode-inputValidation-errorBackground);
  color: var(--vscode-inputValidation-errorForeground);
  border: 1px solid var(--vscode-inputValidation-errorBorder);
}

.remove-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .cheat-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cheat-actions {
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
  }
}
</style>
