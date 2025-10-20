<script setup lang="ts">
interface Props { title: string }

defineProps<Props>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div
    class="modal-overlay"
    @click="emit('close')"
  >
    <div
      class="modal-container"
      @click.stop
    >
      <div class="modal-header">
        <h3 class="modal-title">
          {{ title }}
        </h3>
        <button
          class="close-btn"
          title="关闭"
          @click="emit('close')"
        >
          <span class="close-icon">✕</span>
        </button>
      </div>
      
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: var(--border-radius-large, 12px);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-medium, 16px) var(--spacing-large, 20px);
  border-bottom: 1px solid var(--vscode-panel-border);
  background: var(--vscode-sideBar-background);
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vscode-foreground);
  letter-spacing: 0.3px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-small, 4px);
  color: var(--vscode-foreground);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--vscode-toolbar-hoverBackground);
  color: var(--vscode-errorForeground);
}

.close-icon {
  font-size: 18px;
  line-height: 1;
}

.modal-body {
  overflow-y: auto;
  flex: 1;
}

.modal-body::-webkit-scrollbar {
  width: 10px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--vscode-scrollbarSlider-background);
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--vscode-scrollbarSlider-hoverBackground);
  border-radius: 5px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--vscode-scrollbarSlider-activeBackground);
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: var(--border-radius, 8px);
  }
  
  .modal-header {
    padding: var(--spacing-small, 12px) var(--spacing-medium, 16px);
  }
  
  .modal-title {
    font-size: 14px;
  }
}
</style>
