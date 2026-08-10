<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Modal from './Modal.vue'
import type { NetStatus } from './useNetcode'

interface Props {

    /** 初始模式，弹窗内可用 tab 切换 */
    mode?: 'create' | 'join'

    /** 联机状态，用于在弹窗内展示当前进度并禁用表单 */
    netStatus?:   NetStatus
    statusText?:  string
    localPlayer?: number | null

    /** 创建房间后回传的本机局域网 IP 列表 */
    localIps?: string[]

    /** 房间监听端口 */
    roomPort?: number | null
}

const props = withDefaults(defineProps<Props>(), {
    mode:        'create',
    netStatus:   'offline',
    statusText:  '',
    localPlayer: null,
    localIps:    () => [],
    roomPort:    null,
})

const emit = defineEmits<{
    close:      []
    create:     [port: number]
    join:       [host: string, port: number]
    disconnect: []
}>()

// 内部 tab 状态（create / join 可切换），初始值来自 prop
const activeTab = ref<'create' | 'join'>(props.mode)

// 切换模式时（父组件通过命令再次打开）同步 tab
watch(() => props.mode, v => {
    activeTab.value = v
})

// 创建房间：端口输入
const createPortInput = ref('')

// 加入房间：地址输入 + 校验
const joinAddrInput = ref('')
const joinError = ref('')
function validateAddr(v: string): string | null {
    const m = v.trim().match(/^(.+):(\d+)$/)
    if (!m) return '格式应为 host:port'
    const p = Number(m[2])
    if (!Number.isInteger(p) || p < 1 || p > 65535) return '端口必须是 1-65535'

    return null
}

// 房间已建立（host 在 connecting/syncing/online，guest 同理）→ 表单收起
const isConnected = computed(() => props.netStatus !== 'offline')

// 复制 IP:端口 到剪贴板
const copiedAddr = ref<string | null>(null)
async function copyAddress(ip: string) {
    const addr = `${ip}:${props.roomPort}`
    try {
        await navigator.clipboard.writeText(addr)
        copiedAddr.value = addr
        setTimeout(() => {
            if (copiedAddr.value === addr) copiedAddr.value = null
        }, 1500)
    }
    catch {

        // 剪贴板不可用时静默失败
    }
}

function handleCreate() {
    const raw = createPortInput.value.trim()
    const port = raw ? Number(raw) : 0
    if (raw && (!Number.isInteger(port) || port < 0 || port > 65535)) {
        return
    }
    emit('create', port)
}

function handleJoin() {
    const err = validateAddr(joinAddrInput.value)
    if (err) {
        joinError.value = err

        return
    }
    joinError.value = ''
    const [host, portStr] = joinAddrInput.value.trim().split(':')
    emit('join', host, Number(portStr))
}

function handleDisconnect() {
    emit('disconnect')
}

// 连接建立后自动切到对应 tab，便于看到状态
watch(() => props.netStatus, v => {
    if (v !== 'offline' && activeTab.value === 'create' && props.roomPort != null) {

        // 保持 create tab（房主视角）
    }
})
</script>

<template>
  <Modal
    title="联机对战"
    @close="emit('close')"
  >
    <div class="net-room">
      <!-- 联机进行中：显示状态面板，隐藏表单 -->
      <div
        v-if="isConnected"
        class="net-status-panel"
      >
        <div class="net-status-row">
          <span
            class="net-status-dot"
            :class="`net-status-dot--${netStatus}`"
          />
          <span class="net-status-text">{{ statusText }}</span>
        </div>

        <!-- 房主信息卡 -->
        <div
          v-if="roomPort != null && localIps.length"
          class="room-info-card"
        >
          <div class="room-info-card__title">
            把以下地址发给对手
          </div>
          <ul class="addr-list">
            <li
              v-for="ip in localIps"
              :key="ip"
            >
              <code class="addr-text">{{ ip }}:{{ roomPort }}</code>
              <button
                class="copy-btn"
                title="复制地址"
                @click="copyAddress(ip)"
              >
                {{ copiedAddr === `${ip}:${roomPort}` ? '已复制' : '复制' }}
              </button>
            </li>
          </ul>
        </div>

        <!-- 仅显示玩家号 -->
        <div
          v-else-if="localPlayer"
          class="player-badge"
        >
          你是 P{{ localPlayer }}
        </div>

        <button
          class="btn-primary disconnect-btn"
          @click="handleDisconnect"
        >
          断开连接
        </button>
      </div>

      <!-- 未连接：显示 tab + 表单 -->
      <template v-else>
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ 'tab-btn--active': activeTab === 'create' }"
            @click="activeTab = 'create'"
          >
            创建房间
          </button>
          <button
            class="tab-btn"
            :class="{ 'tab-btn--active': activeTab === 'join' }"
            @click="activeTab = 'join'"
          >
            加入房间
          </button>
        </div>

        <!-- 创建房间 -->
        <div
          v-if="activeTab === 'create'"
          class="tab-pane"
        >
          <p class="pane-hint">
            创建房间后你是 <strong>1P</strong>（主机）。对手加入并同步存档后即可开始游戏。
          </p>
          <label class="field">
            <span class="field__label">监听端口（留空 = 随机端口）</span>
            <input
              v-model="createPortInput"
              class="input"
              type="text"
              inputmode="numeric"
              placeholder="例如 19890"
              @keyup.enter="handleCreate"
            >
          </label>
          <button
            class="btn-primary action-btn"
            @click="handleCreate"
          >
            创建房间
          </button>
        </div>

        <!-- 加入房间 -->
        <div
          v-else
          class="tab-pane"
        >
          <p class="pane-hint">
            输入主机的 <strong>IP:端口</strong>，加入后你是 <strong>2P</strong>。
          </p>
          <label class="field">
            <span class="field__label">主机地址</span>
            <input
              v-model="joinAddrInput"
              class="input"
              type="text"
              placeholder="例如 192.168.1.100:19890"
              @keyup.enter="handleJoin"
            >
          </label>
          <p
            v-if="joinError"
            class="field__error"
          >
            {{ joinError }}
          </p>
          <button
            class="btn-primary action-btn"
            @click="handleJoin"
          >
            连接
          </button>
        </div>
      </template>
    </div>
  </Modal>
</template>

<style scoped>
.net-room {
    min-width: 440px;
    max-width: 520px;
    padding: var(--spacing-large, 20px);
}

/* ============ tab 切换栏 ============ */
.tab-bar {
    display: flex;
    gap: 4px;
    margin-bottom: var(--spacing-large, 20px);
    border-bottom: 1px solid var(--vscode-panel-border);
}
.tab-btn {
    flex: 1;
    padding: var(--spacing-small, 8px) var(--spacing-medium, 12px);
    background: transparent;
    color: var(--vscode-disabledForeground);
    border: none;
    border-bottom: 2px solid transparent;
    font-size: var(--font-size-medium, 14px);
    font-weight: var(--font-weight-medium, 500);
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s ease);
}
.tab-btn:hover {
    color: var(--vscode-foreground);
}
.tab-btn--active {
    color: var(--vscode-foreground);
    border-bottom-color: var(--vscode-button-background);
}

/* ============ 表单 ============ */
.tab-pane {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-medium, 12px);
}
.pane-hint {
    margin: 0 0 var(--spacing-small, 8px);
    color: var(--vscode-descriptionForeground);
    font-size: var(--font-size-small, 12px);
    line-height: 1.6;
}
.pane-hint strong {
    color: var(--vscode-foreground);
}
.field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 4px);
}
.field__label {
    font-size: var(--font-size-small, 12px);
    color: var(--vscode-descriptionForeground);
}
.field__error {
    margin: 0;
    color: var(--vscode-errorForeground);
    font-size: var(--font-size-small, 12px);
}
.input {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: var(--border-radius-small, 4px);
    padding: var(--spacing-small, 8px) var(--spacing-medium, 12px);
    font-size: var(--font-size-normal, 13px);
    font-family: inherit;
    transition: border-color var(--transition-fast, 0.15s ease);
}
.input:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
}
.input::placeholder {
    color: var(--vscode-input-placeholderForeground);
}
.action-btn {
    margin-top: var(--spacing-small, 8px);
    align-self: stretch;
    padding: var(--spacing-small, 8px) var(--spacing-medium, 12px);
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: var(--border-radius-small, 4px);
    font-size: var(--font-size-medium, 14px);
    font-weight: var(--font-weight-medium, 500);
    cursor: pointer;
    transition: background var(--transition-fast, 0.15s ease);
}
.action-btn:hover {
    background: var(--vscode-button-hoverBackground);
}
.btn-primary {
    padding: var(--spacing-small, 8px) var(--spacing-medium, 12px);
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: var(--border-radius-small, 4px);
    font-size: var(--font-size-medium, 14px);
    font-weight: var(--font-weight-medium, 500);
    cursor: pointer;
    transition: background var(--transition-fast, 0.15s ease);
}
.btn-primary:hover {
    background: var(--vscode-button-hoverBackground);
}

/* ============ 已连接状态面板 ============ */
.net-status-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-large, 20px);
}
.net-status-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-small, 8px);
}
.net-status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--vscode-disabledForeground);
    flex-shrink: 0;
}
.net-status-dot--connecting,
.net-status-dot--syncing {
    background: #f5a623;
    box-shadow: 0 0 6px #f5a623;
}
.net-status-dot--online {
    background: #4ec07b;
    box-shadow: 0 0 6px #4ec07b;
}
.net-status-text {
    flex: 1;
    color: var(--vscode-foreground);
    font-size: var(--font-size-normal, 13px);
    line-height: 1.5;
}

.room-info-card {
    padding: var(--spacing-medium, 12px) var(--spacing-large, 16px);
    background: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: var(--border-radius, 6px);
}
.room-info-card__title {
    margin-bottom: var(--spacing-small, 8px);
    color: var(--vscode-descriptionForeground);
    font-size: var(--font-size-small, 12px);
}
.addr-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 4px);
}
.addr-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-small, 8px);
}
.addr-text {
    font-family: var(--vscode-editor-font-family, 'Menlo', 'Monaco', monospace);
    font-size: var(--font-size-normal, 13px);
    color: var(--vscode-textLink-foreground);
}
.copy-btn {
    padding: 2px 10px;
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: 1px solid var(--vscode-button-border, transparent);
    border-radius: var(--border-radius-small, 4px);
    font-size: var(--font-size-small, 12px);
    cursor: pointer;
    transition: background var(--transition-fast, 0.15s ease);
}
.copy-btn:hover {
    background: var(--vscode-button-secondaryHoverBackground, var(--vscode-button-hoverBackground));
}

.player-badge {
    align-self: flex-start;
    padding: var(--spacing-xs, 4px) var(--spacing-medium, 12px);
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border-radius: var(--border-radius-small, 4px);
    font-size: var(--font-size-small, 12px);
    font-weight: var(--font-weight-semibold, 600);
}

.disconnect-btn {
    align-self: flex-start;
}

@media (max-width: 768px) {
    .net-room {
        min-width: 0;
        padding: var(--spacing-medium, 16px);
    }
}
</style>
