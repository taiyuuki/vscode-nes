<script setup lang="ts">
import Modal from './Modal.vue'

interface EmulatorSettings {
    scale: number
    smoothing: boolean
    muted: boolean
    volume: number
    clip8px: boolean
    notifications: boolean
}

interface Props { settings: EmulatorSettings }

defineProps<Props>()

const emit = defineEmits<{
    'close': []
    'apply': []
    'save': []
    'update:settings': [settings: EmulatorSettings]
}>()

function handleChange() {
    emit('apply')
}

function handleSave() {
    emit('save')
}
</script>

<template>
  <Modal
    title="设置"
    @close="emit('close')"
  >
    <div class="settings-content">
      <div class="settings-group">
        <h4 class="group-title">
          显示设置
        </h4>
        
        <div class="setting-item">
          <label
            for="scale"
            class="setting-label"
          >画面缩放</label>
          <select
            id="scale"
            v-model.number="settings.scale"
            class="setting-select"
            @change="handleChange"
          >
            <option :value="1">
              1x (256×240)
            </option>
            <option :value="2">
              2x (512×480)
            </option>
            <option :value="3">
              3x (768×720)
            </option>
            <option :value="4">
              4x (1024×960)
            </option>
          </select>
        </div>
        
        <div class="setting-item checkbox-item">
          <label class="checkbox-label">
            <input
              v-model="settings.smoothing"
              type="checkbox"
              class="setting-checkbox"
              @change="handleChange"
            >
            <span>抗锯齿 (平滑处理)</span>
          </label>
        </div>
        
        <div class="setting-item checkbox-item">
          <label class="checkbox-label">
            <input
              v-model="settings.clip8px"
              type="checkbox"
              class="setting-checkbox"
              @change="handleChange"
            >
            <span>裁剪边框 (隐藏上下8像素)</span>
          </label>
        </div>
      </div>
      
      <div class="settings-group">
        <h4 class="group-title">
          音频设置
        </h4>
        
        <div class="setting-item checkbox-item">
          <label class="checkbox-label">
            <input
              v-model="settings.muted"
              type="checkbox"
              class="setting-checkbox"
              @change="handleChange"
            >
            <span>静音</span>
          </label>
        </div>
        
        <div
          v-if="!settings.muted"
          class="setting-item"
        >
          <label class="setting-label">
            音量: {{ Math.round(settings.volume * 100) }}%
          </label>
          <input
            v-model.number="settings.volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="setting-range"
            @input="handleChange"
          >
        </div>
      </div>
      
      <div class="settings-group">
        <h4 class="group-title">
          通知设置
        </h4>
        
        <div class="setting-item checkbox-item">
          <label class="checkbox-label">
            <input
              v-model="settings.notifications"
              type="checkbox"
              class="setting-checkbox"
              @change="handleSave"
            >
            <span>启用通知</span>
          </label>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.settings-content {
  padding: var(--spacing-large, 20px);
  min-width: 400px;
  max-width: 500px;
}

.settings-group {
  margin-bottom: var(--spacing-large, 24px);
  padding-bottom: var(--spacing-large, 24px);
  border-bottom: 1px solid var(--vscode-panel-border);
}

.settings-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.group-title {
  margin: 0 0 var(--spacing-medium, 16px) 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vscode-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.setting-item {
  margin-bottom: var(--spacing-medium, 16px);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 14px;
  color: var(--vscode-foreground);
  margin-bottom: var(--spacing-xs, 8px);
  font-weight: 500;
}

.setting-select {
  width: 100%;
  padding: var(--spacing-xs, 8px) var(--spacing-small, 12px);
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border);
  border-radius: var(--border-radius-small, 4px);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.setting-select:hover {
  border-color: var(--vscode-focusBorder);
}

.setting-select:focus {
  outline: none;
  border-color: var(--vscode-focusBorder);
  box-shadow: 0 0 0 1px var(--vscode-focusBorder);
}

.checkbox-item {
  margin-bottom: var(--spacing-small, 12px);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-small, 10px);
  cursor: pointer;
  font-size: 14px;
  color: var(--vscode-foreground);
  transition: color 0.2s ease;
}

.checkbox-label:hover {
  color: var(--vscode-textLink-foreground);
}

.setting-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--vscode-focusBorder);
}

.setting-range {
  width: 100%;
  height: 6px;
  background: var(--vscode-input-background);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.setting-range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--vscode-focusBorder);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.setting-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.setting-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--vscode-focusBorder);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.setting-range::-moz-range-thumb:hover {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .settings-content {
    min-width: 0;
    padding: var(--spacing-medium, 16px);
  }
}
</style>
