<script setup lang="ts">
import { computed } from 'vue';
import { Tile, SPECIAL_KEY_MAPPING } from '../types/game';

const props = defineProps<{
  tiles: Tile[];
  gameStarted: boolean;
  showGameElements: boolean;
  showKeyboardShortcuts: boolean;
}>();

const emit = defineEmits<{
  'tile-click': [tile: Tile];
}>();

const handleTileClick = (tile: Tile) => {
  emit('tile-click', tile);
};

// Fonction pour obtenir l'indicateur de touche pour les tuiles de résultat
const getResultKeyHint = (tileId: number) => {
  // Nous n'affichons les indicateurs que pour les tuiles résultats (ID >= 6)
  if (tileId < 6) return '';

  // Obtenir toutes les tuiles résultats non sélectionnées
  const resultTiles = props.tiles
    .filter(tile => tile.id >= 6 && !tile.isSelected)
    .sort((a, b) => a.id - b.id);

  // Trouver l'index de cette tuile dans le tableau des tuiles résultats
  const tileIndex = resultTiles.findIndex(tile => tile.id === tileId);

  // Tableau des touches pour les résultats
  const resultKeys = ['F', 'G', 'H', 'J', 'K', 'L', 'M'];

  // Retourner la touche correspondante si disponible
  return tileIndex >= 0 && tileIndex < resultKeys.length ? resultKeys[tileIndex] : '';
};

// Fonction pour obtenir l'indicateur de touche pour les tuiles initiales
const getInitialTileKeyHint = (tileValue: number) => {
  // Pour les valeurs 1-9, on utilise le chiffre lui-même
  if (tileValue >= 1 && tileValue <= 9) {
    return String(tileValue);
  }

  // Pour 10, on utilise 0
  if (tileValue === 10) {
    return '0';
  }

  // Pour les valeurs spéciales (25, 50, 75, 100), on utilise les lettres définies
  const specialKeys = Object.entries(SPECIAL_KEY_MAPPING);
  for (const [key, value] of specialKeys) {
    if (value === tileValue) {
      return key.toUpperCase();
    }
  }

  return '';
};

// Fonction générique pour obtenir le raccourci clavier d'une tuile
const getKeyHint = (tile: Tile) => {
  if (tile.id < 6) {
    return getInitialTileKeyHint(tile.value);
  } else {
    return getResultKeyHint(tile.id);
  }
};
</script>

<template>
  <div class="tiles" v-if="showGameElements">
    <button
      v-for="tile in tiles"
      :key="tile.id"
      :class="{ 
        selected: tile.isSelected, 
        'result-tile': tile.id >= 6, 
        'show-shortcuts': showKeyboardShortcuts && !tile.isSelected && gameStarted 
      }"
      @click="handleTileClick(tile)"
      :disabled="!gameStarted || tile.isSelected"
      :data-value="tile.value"
    >
      {{ tile.value }}
      <span v-if="showKeyboardShortcuts && !tile.isSelected && gameStarted" class="key-hint">
        {{ getKeyHint(tile) }}
      </span>
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
  padding: 22px;
  font-size: 22px;
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
  }

  .tiles button {
    padding: 16px 10px;
    font-size: 18px;
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
}

.tiles button.selected {
  background-color: #e0e0e0;
  border-color: #999;
  opacity: 0.7;
}

.tiles button {
  position: relative;
}

.tiles .key-hint {
  position: absolute;
  top: 3px;
  right: 3px;
  font-size: 11px;
  background-color: var(--kitsune-orange);
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
  opacity: 0.9;
  min-width: 14px;
  text-align: center;
}

/* Animation pour les raccourcis clavier */
.show-shortcuts .key-hint {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
</style>
