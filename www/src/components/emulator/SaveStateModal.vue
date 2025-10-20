<script setup lang="ts">
import Modal from './Modal.vue'
import SaveSlot from './SaveSlot.vue'

interface SaveState {
    id: string
    name: string
    timestamp: number
    data: Uint8Array
    screenshot?: string
}

interface GameData {
    name: string
    saves: SaveState[]
}

interface Props {
    currentGame: string
    gameData: Record<string, GameData>
}

const props = defineProps<Props>()

const emit = defineEmits<{
    close: []
    save: [slotId: number]
    load: [saveState: SaveState]
    delete: [saveState: SaveState]
}>()

const SLOT_COUNT = 4

function getSaveBySlot(slotId: number): SaveState | null {
    if (!props.currentGame || !props.gameData[props.currentGame]) return null
    const gameInfo = props.gameData[props.currentGame]!

    return gameInfo.saves.find(save => 
        save.id === `${props.currentGame}_slot_${slotId}`) || null
}
</script>

<template>
  <Modal
    title="存档管理"
    @close="emit('close')"
  >
    <div class="save-slots">
      <SaveSlot
        v-for="slotId in SLOT_COUNT"
        :key="slotId"
        :slot-id="slotId"
        :save-state="getSaveBySlot(slotId)"
        @save="emit('save', slotId)"
        @load="emit('load', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </Modal>
</template>

<style scoped>
.save-slots {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-medium, 16px);
  padding: var(--spacing-large, 20px);
  min-width: 600px;
}

@media (max-width: 768px) {
  .save-slots {
    min-width: 0;
    padding: var(--spacing-medium, 16px);
  }
}
</style>
