
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
import KeyboardCatcher from "./KeyboardCatcher.vue";

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

</script>

<template>
  <KeyboardCatcher :tiles="tiles" @tile-click="selectTile" @operator-click="handleOperatorInput" v-slot="slotProps" >
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

      <TilesGrid 
        :tiles="tiles"
        :gameStarted="state === GameStates.IN_PROGRESS || state === GameStates.LOSS"
        :showGameElements="showGameElements"
        :showKeyboardShortcuts="false"
        @tile-click="handleTileClick"
      />

      <OperatorsPanel
        :gameStarted="state === GameStates.IN_PROGRESS || state === GameStates.LOSS"
        :hasFirstOperand="tiles.some(t => t.isSelected)"
        :showGameElements="showGameElements"
        :showKeyboardShortcuts="false"
        @operator-click="handleOperatorInput"
        :current-operator="operator"
      />

      <ExpressionDisplay
        :expression="(tiles.find(t => t.isSelected) ? tiles.find(t => t.isSelected)?.value + ' ' : '') + ( operator ? operator + ' ' : '') + slotProps.currentNumber"
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
  </KeyboardCatcher>
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
}
</style>
