<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'
import CheatItem from './CheatItem.vue'

interface CheatCode {
    code: string
    description: string
    enabled: boolean
}

interface Props { cheats: CheatCode[] }

defineProps<Props>()

const emit = defineEmits<{
    close: []
    add: [code: string, description: string]
    toggle: [cheat: CheatCode]
    remove: [cheat: CheatCode]
}>()

const newCheatCode = ref('')
const newCheatDesc = ref('')

function handleAddCheat() {
    if (!newCheatCode.value.trim()) return
    
    emit('add', newCheatCode.value, newCheatDesc.value || '未命名金手指')
    newCheatCode.value = ''
    newCheatDesc.value = ''
}
</script>

<template>
  <Modal
    title="金手指"
    @close="emit('close')"
  >
    <div class="cheats-content">
      <!-- 添加金手指表单 -->
      <div class="add-cheat-section">
        <h4 class="section-title">
          添加金手指
        </h4>
        
        <div class="add-cheat-form">
          <input
            v-model="newCheatCode"
            type="text"
            placeholder="金手指代码 (例如: 079F-01-01)"
            class="cheat-input"
            @keyup.enter="handleAddCheat"
          >
          
          <input
            v-model="newCheatDesc"
            type="text"
            placeholder="描述 (可选)"
            class="cheat-input"
            @keyup.enter="handleAddCheat"
          >
          
          <button
            class="add-btn"
            :disabled="!newCheatCode.trim()"
            @click="handleAddCheat"
          >
            添加金手指
          </button>
        </div>
      </div>
      
      <!-- 金手指列表 -->
      <div class="cheats-list-section">
        <h4 class="section-title">
          已添加的金手指
        </h4>
        
        <div
          v-if="cheats.length === 0"
          class="empty-state"
        >
          <span class="empty-icon">🎮</span>
          <p>暂无金手指</p>
          <p class="empty-hint">
            在上方添加金手指代码以开始使用
          </p>
        </div>
        
        <div
          v-else
          class="cheats-list"
        >
          <CheatItem
            v-for="cheat in cheats"
            :key="cheat.code"
            :cheat="cheat"
            @toggle="emit('toggle', cheat)"
            @remove="emit('remove', cheat)"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.cheats-content {
  padding: var(--spacing-large, 20px);
  min-width: 500px;
  max-width: 600px;
}

.add-cheat-section,
.cheats-list-section {
  margin-bottom: var(--spacing-large, 24px);
}

.add-cheat-section {
  padding-bottom: var(--spacing-large, 24px);
  border-bottom: 1px solid var(--vscode-panel-border);
}

.section-title {
  margin: 0 0 var(--spacing-medium, 16px) 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vscode-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.add-cheat-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small, 12px);
}

.cheat-input {
  padding: var(--spacing-small, 10px) var(--spacing-medium, 12px);
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border);
  border-radius: var(--border-radius-small, 4px);
  font-size: 14px;
  font-family: var(--vscode-editor-font-family);
  transition: border-color 0.2s ease;
}

.cheat-input::placeholder {
  color: var(--vscode-input-placeholderForeground);
}

.cheat-input:hover {
  border-color: var(--vscode-focusBorder);
}

.cheat-input:focus {
  outline: none;
  border-color: var(--vscode-focusBorder);
  box-shadow: 0 0 0 1px var(--vscode-focusBorder);
}

.add-btn {
  padding: var(--spacing-small, 10px) var(--spacing-medium, 16px);
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: var(--border-radius-small, 4px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover:not(:disabled) {
  background: var(--vscode-button-hoverBackground);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.add-btn:active:not(:disabled) {
  transform: translateY(0);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl, 48px) var(--spacing-large, 20px);
  color: var(--vscode-descriptionForeground);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-medium, 16px);
  opacity: 0.5;
}

.empty-state p {
  margin: var(--spacing-xs, 4px) 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.7;
}

.cheats-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small, 12px);
  max-height: 400px;
  overflow-y: auto;
  padding-right: var(--spacing-xs, 4px);
}

.cheats-list::-webkit-scrollbar {
  width: 8px;
}

.cheats-list::-webkit-scrollbar-track {
  background: var(--vscode-scrollbarSlider-background);
  border-radius: 4px;
}

.cheats-list::-webkit-scrollbar-thumb {
  background: var(--vscode-scrollbarSlider-hoverBackground);
  border-radius: 4px;
}

.cheats-list::-webkit-scrollbar-thumb:hover {
  background: var(--vscode-scrollbarSlider-activeBackground);
}

@media (max-width: 768px) {
  .cheats-content {
    min-width: 0;
    padding: var(--spacing-medium, 16px);
  }
  
  .add-cheat-form {
    gap: var(--spacing-small, 10px);
  }
}
</style>
