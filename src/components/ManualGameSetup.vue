<template>
  <div class="manual-game-setup">
    <h3>Configuration du jeu</h3>

    <!-- Sélection du nombre cible -->
    <div class="setup-section">
      <h4>Nombre cible</h4>
      <div class="target-input">
        <input 
          type="number" 
          v-model.number="targetNumber" 
          min="1" 
          max="999" 
          step="1"
          @input="validateTargetNumber"
        />
      </div>
    </div>

    <!-- Sélection des tuiles -->
    <div class="setup-section">
      <h4>Tuiles (sélectionnez 6 tuiles)</h4>
      <div class="tiles-selection">
        <div class="tiles-group">
          <h5>Petits nombres (1-10)</h5>
          <div class="tiles-grid">
            <div 
              v-for="num in 10" 
              :key="`small-${num}`"
              class="tile-option"
              :class="{ 
                'selected': isSelected(num), 
                'selected-once': isSelected(num) && getSelectionCount(num) === 1 && canSelectAgain(num)
              }"
              @click="toggleTile(num)"
              :disabled="selectedTiles.length >= 6 && !canSelectAgain(num)"
            >
              {{ num }}
              <span v-if="isSelected(num)" class="selection-count">{{ getSelectionCount(num) }}</span>
            </div>
          </div>
        </div>

        <div class="tiles-group">
          <h5>Grands nombres</h5>
          <div class="tiles-grid">
            <div 
              v-for="num in [25, 50, 75, 100]" 
              :key="`large-${num}`"
              class="tile-option"
              :class="{ 'selected': isSelected(num) }"
              @click="toggleTile(num)"
              :disabled="selectedTiles.length >= 6 && !canSelectAgain(num)"
            >
              {{ num }}
              <span v-if="isSelected(num)" class="selection-count">{{ getSelectionCount(num) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="selected-tiles-summary">
        <p>Tuiles sélectionnées: {{ selectedTiles.length }}/6</p>
        <div class="selected-tiles-list">
          <div 
            v-for="(tile, index) in selectedTiles" 
            :key="`selected-${index}`"
            class="selected-tile"
          >
            {{ tile }}
            <button class="remove-tile" @click="removeTile(index)">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sélection du temps de jeu -->
    <div class="setup-section">
      <h4>Temps de jeu (secondes)</h4>
      <div class="time-input">
        <input 
          type="range" 
          v-model.number="gameTime" 
          min="10" 
          max="120" 
          step="5"
        />
        <span class="time-value">{{ gameTime }} secondes</span>
      </div>
    </div>

    <!-- Bouton pour démarrer le jeu -->
    <div class="setup-actions">
      <button 
        class="start-game-btn" 
        @click="startGame"
        :disabled="!isValid"
      >
        Démarrer la partie
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Tile } from '../types/game';

// État local
const targetNumber = ref(100);
const selectedTilesCount = ref<Map<number, number>>(new Map());
const selectedTiles = ref<number[]>([]);
const gameTime = ref(40); // Temps de jeu par défaut en secondes

// Props et émissions
const emit = defineEmits<{
  (e: 'start-game', config: { targetNumber: number, tiles: Tile[], gameTime: number }): void;
}>();

// Validation du nombre cible
const validateTargetNumber = () => {
  if (targetNumber.value < 1) targetNumber.value = 1;
  if (targetNumber.value > 999) targetNumber.value = 999;
  targetNumber.value = Math.floor(targetNumber.value);
};

// Vérifier si une tuile est déjà sélectionnée et combien de fois
const isSelected = (value: number): boolean => {
  return selectedTilesCount.value.has(value);
};

// Obtenir le nombre de fois qu'une tuile a été sélectionnée
const getSelectionCount = (value: number): number => {
  return selectedTilesCount.value.get(value) || 0;
};

// Vérifier si une tuile peut encore être sélectionnée
const canSelectAgain = (value: number): boolean => {
  // Les petits nombres (1-10) peuvent être sélectionnés jusqu'à 2 fois
  if (value >= 1 && value <= 10) {
    return !isSelected(value) || getSelectionCount(value) < 2;
  }
  // Les grands nombres ne peuvent être sélectionnés qu'une fois
  return !isSelected(value);
};

// Ajouter ou retirer une tuile
const toggleTile = (value: number) => {
  if (selectedTiles.value.length < 6 && canSelectAgain(value)) {
    // Ajouter la tuile si on peut encore la sélectionner
    selectedTiles.value.push(value);

    // Incrémenter le compteur
    const currentCount = getSelectionCount(value);
    selectedTilesCount.value.set(value, currentCount + 1);
  } else {
    // Retirer une instance de la tuile
    const currentCount = getSelectionCount(value);
    if (currentCount > 1) {
      // Si la tuile a été sélectionnée plusieurs fois, réduire le compteur
      selectedTilesCount.value.set(value, currentCount - 1);

      // Trouver et supprimer une instance de cette valeur dans le tableau
      const index = selectedTiles.value.lastIndexOf(value);
      if (index !== -1) {
        selectedTiles.value.splice(index, 1);
      }
    } else {
      // Si c'est la dernière instance, supprimer complètement
      selectedTilesCount.value.delete(value);

      // Trouver et supprimer l'instance dans le tableau
      const index = selectedTiles.value.indexOf(value);
      if (index !== -1) {
        selectedTiles.value.splice(index, 1);
      }
    }
  }
};

// Retirer une tuile par son index
const removeTile = (index: number) => {
  if (index >= 0 && index < selectedTiles.value.length) {
    const value = selectedTiles.value[index];

    // Mettre à jour le compteur
    const currentCount = getSelectionCount(value);
    if (currentCount > 1) {
      selectedTilesCount.value.set(value, currentCount - 1);
    } else {
      selectedTilesCount.value.delete(value);
    }

    // Supprimer du tableau
    selectedTiles.value.splice(index, 1);
  }
};

// Vérifier si la configuration est valide
const isValid = computed(() => {
  return targetNumber.value > 0 && selectedTiles.value.length === 6;
});

// Démarrer le jeu avec la configuration actuelle
const startGame = () => {
  if (!isValid.value) return;

  // Créer les objets Tile à partir des valeurs sélectionnées
  const tiles: Tile[] = selectedTiles.value.map((value, index) => ({
    id: index,
    value,
    isSelected: false
  }));

  // Émettre l'événement pour démarrer le jeu
  emit('start-game', {
    targetNumber: targetNumber.value,
    tiles,
    gameTime: gameTime.value
  });
};
</script>

<style scoped>
.manual-game-setup {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.setup-section {
  margin-bottom: 20px;
}

h3, h4, h5 {
  color: var(--kitsune-dark);
  margin-top: 0;
}

h5 {
  margin-bottom: 10px;
}

.target-input input {
  width: 100%;
  max-width: 200px;
  padding: 10px;
  font-size: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.time-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
}

.time-input input[type="range"] {
  width: 100%;
  height: 10px;
  -webkit-appearance: none;
  background: #ddd;
  border-radius: 5px;
  outline: none;
}

.time-input input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--kitsune-orange);
  cursor: pointer;
}

.time-input input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--kitsune-orange);
  cursor: pointer;
}

.time-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--kitsune-dark);
}

.tiles-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.tiles-group {
  flex: 1;
  min-width: 250px;
}

.tiles-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.tile-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #eee;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.tile-option:hover {
  background-color: #ddd;
}

.tile-option.selected {
  background-color: var(--kitsune-orange);
  color: white;
  position: relative;
}

.tile-option.selected-once {
  background-color: var(--kitsune-orange-light);
  border: 2px solid var(--kitsune-orange);
}

.selection-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: white;
  color: var(--kitsune-dark);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--kitsune-orange);
}

.tile-option[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-tiles-summary {
  margin-top: 20px;
}

.selected-tiles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.selected-tile {
  display: flex;
  align-items: center;
  background-color: var(--kitsune-orange-light);
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.remove-tile {
  background: none;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  margin-left: 5px;
  padding: 0 5px;
}

.remove-tile:hover {
  color: #333;
}

.setup-actions {
  margin-top: 30px;
  text-align: center;
}

.start-game-btn {
  padding: 12px 24px;
  font-size: 16px;
  background-color: var(--kitsune-orange);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-game-btn:hover:not([disabled]) {
  background-color: var(--kitsune-dark-orange);
}

.start-game-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .tiles-selection {
    flex-direction: column;
  }

  .tiles-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .tile-option {
    width: 100%;
    height: 40px;
  }
}
</style>
