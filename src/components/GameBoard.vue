
<script setup lang="ts">
import {ref, onMounted, onUnmounted, computed } from 'vue';
import { type Tile, GameStates } from '../types/game';

// Composants
import GameHeader from './GameHeader.vue';
import TilesGrid from './TilesGrid.vue';
import OperatorsPanel from './OperatorsPanel.vue';
import ExpressionDisplay from './ExpressionDisplay.vue';
import VictoryOverlay from './VictoryOverlay.vue';
import SolutionsDisplay from './SolutionsDisplay.vue';
import GameModeSelector from './GameModeSelector.vue';
import ManualGameSetup from './ManualGameSetup.vue';
import {useGameStore} from "../stores/gameStore";

// Types pour les modes de jeu
type GameMode = 'auto' | 'manual';

const {
  newGame,
  selectTile,
  selectOperator,
  resetGame,
  undo,
  state,
    tiles,
    targetNumber,
    timeLeft,
    totalTime,
    operator,
  operationsHistory,
  isSearching,
  foundSolutions
} = useGameStore()

// État du jeu
const showSolutions = computed(() => state.value != GameStates.NOT_STARTED && state.value != GameStates.IN_PROGRESS  && !isSearching.value);
const showGameElements = computed(() => state.value !== GameStates.NOT_STARTED )
// État pour le mode de jeu
const gameMode = ref<GameMode>('auto');
const showManualSetup = ref(false);

// État pour l'affichage des raccourcis clavier
const showKeyboardShortcuts = ref(true); // Par défaut, afficher les raccourcis
const isTouchDevice = ref(false); // Détection des appareils tactiles



// Sélectionner un mode de jeu
const selectGameMode = (mode: GameMode) => {
  gameMode.value = mode;

  if (mode === 'auto') {
    // Mode automatique: démarrer directement une nouvelle partie
    newGame({});
  } else {
    // Mode manuel: afficher l'interface de configuration
    showManualSetup.value = true;
  }
};


// Gestion des entrées pour les opérateurs
const handleOperatorInput = (value: string) => {

  if (value === 'C') {
    // Réinitialiser l'expression et l'état de l'opération
    resetGame();
    return;
  }

  if (value === 'U') {
    // Annuler la dernière opération
    undo();
    return;
  }

  if (['+', '-', '×', '÷'].includes(value)) {
    // Mettre à jour l'opérateur
    selectOperator(value)
  }
};

// Gestion des clics sur les tuiles numériques
const handleTileClick = (tile: Tile) => {
  if (tile.isSelected) return;

  selectTile(tile);
};

// Gestionnaire d'événements pour les touches du clavier
const handleKeydown = (event: KeyboardEvent) => {

  // Gestion des touches numériques (1-9, 0)
  if (/^[0-9]$/.test(event.key)) {
    const numericValue = parseInt(event.key);
    // Cas spécial pour la touche 0 qui doit sélectionner une tuile 10
    const tileValue = numericValue === 0 ? 10 : numericValue;
    // Chercher une tuile non sélectionnée avec cette valeur
    const matchingTile = tiles.value.find(tile =>
      tile.value === tileValue && !tile.isSelected
    );

    if (matchingTile) {
      handleTileClick(matchingTile);
    }
  }

  // Gestion des touches spéciales pour 25, 50, 75, 100
  if (event.key === 'a' || event.key === 'A') { // Pour 25
    const tile25 = tiles.value.find(tile => tile.value === 25 && !tile.isSelected);
    if (tile25) handleTileClick(tile25);
  }
  if (event.key === 'z' || event.key === 'Z') { // Pour 50
    const tile50 = tiles.value.find(tile => tile.value === 50 && !tile.isSelected);
    if (tile50) handleTileClick(tile50);
  }
  if (event.key === 'e' || event.key === 'E') { // Pour 75
    const tile75 = tiles.value.find(tile => tile.value === 75 && !tile.isSelected);
    if (tile75) handleTileClick(tile75);
  }
  if (event.key === 'r' || event.key === 'R') { // Pour 100
    const tile100 = tiles.value.find(tile => tile.value === 100 && !tile.isSelected);
    if (tile100) handleTileClick(tile100);
  }

  // Gestion des touches pour les tuiles résultats (f, g, h, j, k, l, m)
  // Ces touches permettent de sélectionner les tuiles résultats en fonction de l'ordre de création
  const resultKeyMap = ['f', 'g', 'h', 'j', 'k', 'l', 'm'];
  const lowerKey = event.key.toLowerCase();

  if (resultKeyMap.includes(lowerKey)) {
    // Trouver l'index de la touche dans le tableau des touches de résultat
    const keyIndex = resultKeyMap.indexOf(lowerKey);

    // Obtenir toutes les tuiles résultats (ID >= 6) qui ne sont pas sélectionnées
    const resultTiles = tiles.value.filter(tile => tile.id >= 6 && !tile.isSelected);

    // Si nous avons suffisamment de tuiles résultats
    if (keyIndex < resultTiles.length) {
      // Trier les tuiles par ID pour maintenir l'ordre de création
      const sortedResultTiles = resultTiles.sort((a, b) => a.id - b.id);
      // Sélectionner la tuile correspondante
      handleTileClick(sortedResultTiles[keyIndex]);
    }
  }

  // Gestion des opérateurs
  if (event.key === '+') {
    handleOperatorInput('+');
  } else if (event.key === '-') {
    handleOperatorInput('-');
  } else if (event.key === '*' || event.key === 'x' || event.key === 'X') {
    handleOperatorInput('×');
  } else if (event.key === '/' || event.key === ':') {
    handleOperatorInput('÷');
  } else if (event.key === 'c' || event.key === 'C') {
    handleOperatorInput('C');
  } else if (event.key === 'Backspace' || event.key === 'u' || event.key === 'U') {
    handleOperatorInput('U');
  }

  // Ajout de raccourcis supplémentaires

  // Espace pour sélectionner la première tuile disponible
  if (event.key === ' ' || event.key === 'Space') {
    const firstAvailableTile = tiles.value.find((tile: Tile) => !tile.isSelected);
    if (firstAvailableTile) {
      handleTileClick(firstAvailableTile);
    }
  }

  // Échap pour réinitialiser (comme la touche C)
  if (event.key === 'Escape') {
    handleOperatorInput('C');
  }

};

// Fonction pour basculer l'affichage des raccourcis clavier
const toggleKeyboardShortcuts = () => {
  showKeyboardShortcuts.value = !showKeyboardShortcuts.value;
};

// Ajout et suppression des écouteurs d'événements
onMounted(() => {

  // Détection des appareils tactiles
  isTouchDevice.value = ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);

  if(!isTouchDevice.value) {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>

<template>
  <div class="game-board">
    <GameHeader 
      v-if="state !== GameStates.NOT_STARTED"
      :targetNumber="targetNumber"
      :timeLeft="timeLeft"
      :gameTime="totalTime"
    />

    <VictoryOverlay
      :gameResult="state"
      :targetNumber="targetNumber"
      :isCalculating="isSearching"
    />

    <!-- Configuration manuelle du jeu -->
    <ManualGameSetup 
      v-if="showManualSetup" 
      @start-game="(options) => {
        newGame(options);
        showManualSetup = false
      }"
    />

    <div class="game-area" v-if="state !== GameStates.NOT_STARTED">
      <!-- Bouton pour afficher/masquer les raccourcis clavier (visible uniquement sur desktop) -->
      <div v-if="!isTouchDevice && state === GameStates.IN_PROGRESS" class="shortcuts-toggle">
        <button @click="toggleKeyboardShortcuts" class="toggle-btn">
          {{ showKeyboardShortcuts ? 'Masquer raccourcis' : 'Afficher raccourcis' }}
        </button>
      </div>

      <TilesGrid 
        :tiles="tiles"
        :gameStarted="state === GameStates.IN_PROGRESS || state === GameStates.TIME_UP"
        :showGameElements="showGameElements"
        :showKeyboardShortcuts="showKeyboardShortcuts && !isTouchDevice"
        @tile-click="handleTileClick"
      />

      <OperatorsPanel
        :gameStarted="state === GameStates.IN_PROGRESS || state === GameStates.TIME_UP"
        :hasFirstOperand="tiles.some(t => t.isSelected)"
        :showGameElements="showGameElements"
        :showKeyboardShortcuts="showKeyboardShortcuts && !isTouchDevice"
        @operator-click="handleOperatorInput"
        :current-operator="operator"
      />

      <ExpressionDisplay
        :expression="''"
        :operationsHistory="operationsHistory"
        :showGameElements="showGameElements"
      />

      <SolutionsDisplay
        :solutions="foundSolutions"
        :targetNumber="targetNumber"
        :showSolutions="showSolutions"
        :isCalculating="isSearching"
      />

    </div>


    <!-- Sélecteur de mode de jeu -->
    <GameModeSelector
        v-if="!showManualSetup && state !== GameStates.IN_PROGRESS"
        :initialMode="gameMode"
        @mode-selected="selectGameMode"
    />
  </div>
</template>

<style scoped>
.game-board {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  background-color: var(--kitsune-light);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.game-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.shortcuts-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5px;
}

.toggle-btn {
  font-size: 14px;
  padding: 6px 12px;
  background-color: var(--kitsune-light);
  border: 1px solid var(--kitsune-orange);
  color: var(--kitsune-dark);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background-color: var(--kitsune-light-orange);
}

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .game-board {
    padding: 10px;
    margin: 0;
    border-radius: 0;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  .game-area {
    gap: 10px;
  }

  .start-button {
    padding: 12px;
    font-size: 16px;
  }
}
</style>
