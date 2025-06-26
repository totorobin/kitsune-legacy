
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Tile, Operator, MAX_TIME, GameResult } from '../types/game';
import { generateRandomTiles, generateTargetNumber, performOperation } from '../utils/gameLogic';
import { findSolutions, getTopSolutions, Solution } from '../utils/solutionFinder';

// Composants
import GameHeader from './GameHeader.vue';
import TilesGrid from './TilesGrid.vue';
import OperatorsPanel from './OperatorsPanel.vue';
import ExpressionDisplay from './ExpressionDisplay.vue';
import VictoryOverlay from './VictoryOverlay.vue';
import SolutionsDisplay from './SolutionsDisplay.vue';

// État du jeu
const tiles = ref<Tile[]>([]);
const targetNumber = ref(0);
const timeLeft = ref(MAX_TIME);
const expression = ref('');
const operationsHistory = ref<string[]>([]);
const timer = ref<number | null>(null);
const gameStarted = ref(false);
const gameResult = ref<GameResult>(GameResult.IN_PROGRESS);
const showNewGameButton = ref(false);
const showSolutions = ref(false);
const solutions = ref<Solution[]>([]);

// État de l'opération en cours
const firstOperand = ref<Tile | null>(null);
const operator = ref<Operator | null>(null);
const nextId = ref(6); // Pour générer des IDs uniques pour les nouvelles tuiles

// Le meilleur résultat obtenu par le joueur
const bestPlayerResult = ref<number | null>(null);

// Gestion du timer
const startTimer = () => {
  if (timer.value) clearInterval(timer.value);
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      if (timer.value) clearInterval(timer.value);
      gameStarted.value = false;

      // Quand le temps est écoulé, calculer les solutions possibles
      calculateSolutions();
    }
  }, 1000);
};

// Calculer toutes les solutions possibles
const calculateSolutions = () => {
  // Utiliser seulement les tuiles initiales (ID < 6) pour chercher les solutions
  const initialTiles = tiles.value.filter(tile => tile.id < 6);

  // Trouver toutes les solutions possibles
  const allSolutions = findSolutions(initialTiles, targetNumber.value);

  // Prendre les 5 meilleures solutions
  solutions.value = getTopSolutions(allSolutions, 5);

  // Vérifier si le joueur a trouvé le meilleur résultat possible
  if (solutions.value.length > 0 && bestPlayerResult.value !== null) {
    const bestPossibleDistance = solutions.value[0].distance;
    const playerDistance = Math.abs(bestPlayerResult.value - targetNumber.value);

    if (playerDistance === 0) {
      // Le joueur a trouvé le résultat exact
      gameResult.value = GameResult.EXACT_WIN;
    } else if (playerDistance === bestPossibleDistance) {
      // Le joueur a trouvé le meilleur résultat possible (pas exact)
      gameResult.value = GameResult.BEST_WIN;
    } else {
      // Le joueur n'a pas trouvé le meilleur résultat
      gameResult.value = GameResult.LOSS;
    }
  } else {
    // Aucune solution trouvée ou le joueur n'a pas obtenu de résultat
    gameResult.value = GameResult.LOSS;
  }

  // Afficher les solutions
  showSolutions.value = true;

  // Afficher le bouton nouvelle partie
  setTimeout(() => {
    showNewGameButton.value = true;
  }, 3000);
};

// Démarrer une nouvelle partie
const startNewGame = () => {
  tiles.value = generateRandomTiles();
  targetNumber.value = generateTargetNumber();
  timeLeft.value = MAX_TIME;
  expression.value = '';
  operationsHistory.value = [];
  gameStarted.value = true;
  firstOperand.value = null;
  operator.value = null;
  nextId.value = 6; // Réinitialiser l'ID pour les nouvelles tuiles
  gameResult.value = GameResult.IN_PROGRESS;
  showNewGameButton.value = false;
  showSolutions.value = false;
  solutions.value = [];
  bestPlayerResult.value = null;
  startTimer();
};

// Gestion des entrées pour les opérateurs
const handleOperatorInput = (value: string) => {
  if (!gameStarted.value) return;

  if (value === 'C') {
    // Réinitialiser l'expression et l'état de l'opération
    expression.value = '';
    operationsHistory.value = [];
    firstOperand.value = null;
    operator.value = null;

    // Supprimer les tuiles résultats (celles avec ID >= 6) et réactiver les autres
    tiles.value = tiles.value.filter(tile => tile.id < 6);
    tiles.value.forEach(tile => tile.isSelected = false);
    bestPlayerResult.value = null;
    return;
  }

  if (['+', '-', '×', '÷'].includes(value) && firstOperand.value) {
    // Mettre à jour l'opérateur
    operator.value = value as Operator;

    // Reconstruire complètement l'expression pour garantir la cohérence
    // expression = premierOpérande + nouvelOpérateur
    expression.value = `${firstOperand.value.value} ${value}`;
  }
};

// Gestion des clics sur les tuiles numériques
const handleTileClick = (tile: Tile) => {
  if (!gameStarted.value || tile.isSelected) return;

  if (!firstOperand.value) {
    // Premier opérande
    firstOperand.value = tile;
    tile.isSelected = true;
    expression.value = tile.value.toString(); // Affiche juste le premier nombre
  } else if (!operator.value) {
    // Si on clique sur une autre tuile sans avoir sélectionné d'opérateur,
    // on remplace la première tuile sélectionnée
    firstOperand.value.isSelected = false; // Désélectionne la première tuile
    firstOperand.value = tile;
    tile.isSelected = true;
    expression.value = tile.value.toString();
  } else if (operator.value && !tile.isSelected) {
    // Deuxième opérande - effectuer l'opération
    const result = performOperation(firstOperand.value.value, operator.value, tile.value);

    if (!isNaN(result)) {
      // Marquer les tuiles utilisées comme sélectionnées
      tile.isSelected = true;

      // Créer une nouvelle tuile avec le résultat
      const newTile: Tile = {
        id: nextId.value++,
        value: Math.round(result * 100) / 100, // Arrondir à 2 décimales
        isSelected: false
      };

      // Ajouter la nouvelle tuile sans supprimer les anciennes
      tiles.value.push(newTile);

      // Créer une entrée d'historique pour cette opération
      const operationText = `${firstOperand.value.value} ${operator.value} ${tile.value} = ${newTile.value}`;
      operationsHistory.value.push(operationText);

      // Mettre à jour le meilleur résultat obtenu par le joueur
      const distance = Math.abs(newTile.value - targetNumber.value);
      if (bestPlayerResult.value === null || distance < Math.abs(bestPlayerResult.value - targetNumber.value)) {
        bestPlayerResult.value = newTile.value;
      }

      // Vérifier si le joueur a gagné
      if (newTile.value === targetNumber.value) {
        gameResult.value = GameResult.EXACT_WIN;
        if (timer.value) clearInterval(timer.value);
        gameStarted.value = false;

        // Afficher le bouton de nouvelle partie après 3 secondes (après la plupart des confettis)
        setTimeout(() => {
          showNewGameButton.value = true;
        }, 3000);
      }

      // Réinitialiser pour la prochaine opération
      expression.value = '';
      firstOperand.value = null;
      operator.value = null;
    }
  }
};

// Propriété calculée pour déterminer si les éléments du jeu doivent être affichés
const showGameElements = computed(() => {
  return gameStarted.value || showSolutions.value;
});

// Nettoyage du timer
onMounted(() => {
  return () => {
    if (timer.value) clearInterval(timer.value);
  };
});
</script>

<template>
  <div class="game-board">
    <GameHeader 
      :targetNumber="targetNumber"
      :timeLeft="timeLeft"
      :showGameElements="showGameElements"
    />

    <VictoryOverlay 
      :gameResult="gameResult"
      :showNewGameButton="showNewGameButton"
      @new-game="startNewGame"
    />

    <div class="game-area">
      <TilesGrid 
        :tiles="tiles"
        :gameStarted="gameStarted"
        :showGameElements="showGameElements"
        @tile-click="handleTileClick"
      />

      <OperatorsPanel
        :gameStarted="gameStarted"
        :hasFirstOperand="!!firstOperand"
        :showGameElements="showGameElements"
        @operator-click="handleOperatorInput"
      />

      <ExpressionDisplay
        :expression="expression"
        :operationsHistory="operationsHistory"
        :showGameElements="showGameElements"
      />

      <SolutionsDisplay
        :solutions="solutions"
        :targetNumber="targetNumber"
        :showSolutions="showSolutions"
        :playerHasWon="gameResult === GameResult.EXACT_WIN || gameResult === GameResult.BEST_WIN"
      />

      <button class="start-button" @click="startNewGame">
        {{ gameStarted ? 'Nouvelle partie' : 'Commencer' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  max-width: 600px;
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

.start-button {
  padding: 15px;
  font-size: 18px;
  background: var(--kitsune-orange);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.start-button:hover {
  background: var(--kitsune-dark-orange);
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}
</style>
