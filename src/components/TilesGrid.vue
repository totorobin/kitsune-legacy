<script setup lang="ts">
import { Tile } from '../types/game';

defineProps<{
  tiles: Tile[];
  gameStarted: boolean;
  showGameElements: boolean;
}>();

const emit = defineEmits<{
  'tile-click': [tile: Tile];
}>();

const handleTileClick = (tile: Tile) => {
  emit('tile-click', tile);
};
</script>

<template>
  <div class="tiles" v-if="showGameElements">
    <button
      v-for="tile in tiles"
      :key="tile.id"
      :class="{ selected: tile.isSelected }"
      @click="handleTileClick(tile)"
      :disabled="!gameStarted || tile.isSelected"
    >
      {{ tile.value }}
    </button>
  </div>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.tiles button {
  padding: 20px;
  font-size: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tiles button:hover:not(:disabled) {
  border-color: var(--kitsune-orange);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.tiles button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tiles button.selected {
  background-color: #e0e0e0;
  border-color: #999;
  opacity: 0.7;
}
</style>
