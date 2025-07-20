<script setup lang="ts">
import type { Tile } from '../types/game';

defineProps<{
  tiles: Tile[];
  gameStarted: boolean;
}>();

const emit = defineEmits<{
  'tile-click': [tile: Tile];
}>();

const handleTileClick = (tile: Tile) => {
  emit('tile-click', tile);
};
</script>

<template>
  <div class="tiles">
    <button
      v-for="tile in tiles"
      :key="tile.id"
      :class="{ 
        selected: tile.isSelected, 
        'result-tile': tile.id >= 6
      }"
      @click="handleTileClick(tile)"
      :disabled="!gameStarted || tile.isSelected || tile.isUsed"
      :data-value="tile.value"
    >
      {{ tile.value }}
    </button>
  </div>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.tiles button {
  padding: 18px;
  font-size: 32px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Adaptation mobile pour les tuiles */
@media (max-width: 480px) {
  .tiles {
    gap: 8px;
    grid-template-columns: repeat(3, 1fr);
  }

  .tiles button {
    padding: 14px 10px;
    font-size: 26px;
    min-height: 60px;
  }
}

.tiles button:hover:not(:disabled) {
  border-color: var(--kitsune-orange);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.tiles button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #e0e0e0;
  border-color: #999;
}

.tiles button.selected {
  background-color: var(--kitsune-light-orange);
  color: white;
  border-color: var(--kitsune-orange);
}

.tiles button {
  position: relative;
}
</style>
