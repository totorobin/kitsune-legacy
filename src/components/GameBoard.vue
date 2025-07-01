
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { type Tile, type Operator, MAX_TIME, GameResult } from '../types/game';
import { generateRandomTiles, generateTargetNumber, performOperation } from '../utils/gameLogic';
import { findSolution } from '../utils/solutionFinder2';

// Interface Solution pour la compatibilité
interface Solution {
  operations: string[];
  result: number;
  distance: number;
  oneLineOperation: string;
  nbTiles: number;
}

// Composants
import GameHeader from './GameHeader.vue';
import TilesGrid from './TilesGrid.vue';
import OperatorsPanel from './OperatorsPanel.vue';
import ExpressionDisplay from './ExpressionDisplay.vue';
import VictoryOverlay from './VictoryOverlay.vue';
import SolutionsDisplay from './SolutionsDisplay.vue';
import CalculatingOverlay from './CalculatingOverlay.vue';
import GameModeSelector from './GameModeSelector.vue';
import ManualGameSetup from './ManualGameSetup.vue';

// Types pour les modes de jeu
type GameMode = 'auto' | 'manual';

// État du jeu
const tiles = ref<Tile[]>([]);
const targetNumber = ref(0);
const timeLeft = ref(MAX_TIME);
const gameTime = ref(MAX_TIME)
const expression = ref('');
const operationsHistory = ref<string[]>([]);
const timer = ref<number | null>(null);
const gameStarted = ref(false);
const gameResult = ref<GameResultType>(GameResult.IN_PROGRESS);
const showNewGameButton = ref(false);
const showSolutions = ref(false);
const solutions = ref<Solution[]>([]);

// État pour le mode de jeu
const gameMode = ref<GameMode>('auto');
const showModeSelector = ref(true);
const showManualSetup = ref(false);

// État pour l'affichage des raccourcis clavier
const showKeyboardShortcuts = ref(true); // Par défaut, afficher les raccourcis
const isTouchDevice = ref(false); // Détection des appareils tactiles

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

// État pour le chargement des solutions
const isCalculatingSolutions = ref(false);

// Calculer toutes les solutions possibles
const calculateSolutions = () => {
  // Activer l'indicateur de chargement et afficher le conteneur de solutions
  isCalculatingSolutions.value = true;
  showSolutions.value = true;
  solutions.value = []; // Vider les solutions précédentes pendant le calcul

  // Utiliser seulement les tuiles initiales (ID < 6) pour chercher les solutions
  const initialTiles = tiles.value.filter(tile => tile.id < 6);

  // Utiliser setTimeout pour ne pas bloquer l'interface pendant le calcul
  setTimeout(() => {
    // Extraire les valeurs des tuiles
    const tileValues = initialTiles.map(tile => tile.value);

    // Trouver les solutions avec solutionFinder2
    solutions.value = findSolution(tileValues, targetNumber.value);

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
  // Les solutions sont déjà affichées (showSolutions a été activé avant le calcul)

  // Afficher le bouton nouvelle partie
  setTimeout(() => {
    showNewGameButton.value = true;
  }, 3000);

  // Désactiver l'indicateur de chargement
  isCalculatingSolutions.value = false;
  });
};

// Sélectionner un mode de jeu
const selectGameMode = (mode: GameMode) => {
  gameMode.value = mode;
  showModeSelector.value = false;

  if (mode === 'auto') {
    // Mode automatique: démarrer directement une nouvelle partie
    startNewGame();
  } else {
    // Mode manuel: afficher l'interface de configuration
    showManualSetup.value = true;
  }
};

// Démarrer une nouvelle partie avec configuration manuelle
const startManualGame = (config: { targetNumber: number, tiles: Tile[], gameTime: number }) => {
  tiles.value = config.tiles;
  targetNumber.value = config.targetNumber;
  timeLeft.value = config.gameTime; // Utiliser le temps de jeu personnalisé
  gameTime.value = config.gameTime;
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
  showManualSetup.value = false;
  startTimer();
};

// Démarrer une nouvelle partie
const startNewGame = () => {
  // Réinitialiser l'interface
  showModeSelector.value = true;
  showManualSetup.value = false;
  gameStarted.value = false;

  if (gameMode.value === 'auto') {
    // Mode automatique: générer des tuiles et un nombre cible aléatoires
    tiles.value = generateRandomTiles();
    targetNumber.value = generateTargetNumber();
    timeLeft.value = MAX_TIME;
    gameTime.value = MAX_TIME;
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
  }
  // Pour le mode manuel, on attend que l'utilisateur configure et démarre le jeu
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

  if (value === 'U') {
    // Annuler la dernière opération
    if (operationsHistory.value.length > 0) {
      // Supprimer la dernière entrée d'historique
      operationsHistory.value.pop();

      // Récupérer toutes les tuiles initiales (ID < 6)
      const initialTiles = tiles.value.filter(tile => tile.id < 6);

      // Réinitialiser l'état de sélection des tuiles initiales
      initialTiles.forEach(tile => tile.isSelected = false);

      // Si on n'a plus aucune opération, on garde juste les tuiles initiales
      if (operationsHistory.value.length === 0) {
        tiles.value = initialTiles;
        bestPlayerResult.value = null;
      } else {
        // Sinon, on recalcule toutes les opérations à partir des tuiles initiales
        // en répétant chaque opération sauf la dernière
        tiles.value = [...initialTiles]; // Commencer avec les tuiles initiales
        let currentNextId = 6;

        // Parcourir l'historique et recréer les tuiles résultantes
        for (const opText of operationsHistory.value) {
          // Extraire les valeurs de l'opération (format: "a op b = result")
          const match = opText.match(/(\d+\.?\d*)\s*([+\-×÷])\s*(\d+\.?\d*)\s*=\s*(\d+\.?\d*)/);
          if (match) {
            const [, leftVal, _, rightVal, resultVal] = match;

            // Marquer les tuiles utilisées comme sélectionnées
            const leftTile = tiles.value.find(t => t.value === parseFloat(leftVal) && !t.isSelected);
            const rightTile = tiles.value.find(t => t.value === parseFloat(rightVal) && !t.isSelected);

            if (leftTile && rightTile) {
              leftTile.isSelected = true;
              rightTile.isSelected = true;

              // Créer une nouvelle tuile avec le résultat
              const newTile: Tile = {
                id: currentNextId++,
                value: parseFloat(resultVal),
                isSelected: false
              };

              // Ajouter la nouvelle tuile
              tiles.value.push(newTile);

              // Mettre à jour le meilleur résultat obtenu
              const distance = Math.abs(newTile.value - targetNumber.value);
              if (bestPlayerResult.value === null || distance < Math.abs(bestPlayerResult.value - targetNumber.value)) {
                bestPlayerResult.value = newTile.value;
              }
            }
          }
        }

        // Mettre à jour l'ID pour les nouvelles tuiles
        nextId.value = currentNextId;
      }

      // Réinitialiser l'expression courante
      expression.value = '';
      firstOperand.value = null;
      operator.value = null;
    }
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

// Gestionnaire d'événements pour les touches du clavier
const handleKeydown = (event: KeyboardEvent) => {
  if (!gameStarted.value) return;

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
    const firstAvailableTile = tiles.value.find(tile => !tile.isSelected);
    if (firstAvailableTile) {
      handleTileClick(firstAvailableTile);
    }
  }

  // Entrée pour confirmer une opération si un premier opérande et un opérateur sont sélectionnés
  if (event.key === 'Enter') {
    if (firstOperand.value && operator.value) {
      // Chercher la première tuile disponible pour compléter l'opération
      const secondOperand = tiles.value.find(tile => 
        !tile.isSelected && tile.id !== firstOperand.value?.id
      );
      if (secondOperand) {
        handleTileClick(secondOperand);
      }
    }
  }

  // Échap pour réinitialiser (comme la touche C)
  if (event.key === 'Escape') {
    handleOperatorInput('C');
  }

  // Tab pour basculer entre les opérateurs
  if (event.key === 'Tab') {
    event.preventDefault(); // Empêcher le comportement par défaut du navigateur

    const operators = ['+', '-', '×', '÷'];
    const currentIndex = operators.indexOf(operator.value as string);
    const nextIndex = (currentIndex + 1) % operators.length;

    handleOperatorInput(operators[nextIndex]);
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
  if (timer.value) clearInterval(timer.value);
});
</script>

<template>
  <div class="game-board">
    <GameHeader 
      v-if="showGameElements"
      :targetNumber="targetNumber"
      :timeLeft="timeLeft"
      :gameTime="gameTime"
    />

    <VictoryOverlay 
      :gameResult="gameResult"
      :showNewGameButton="showNewGameButton"
      :solutions="solutions"
      :targetNumber="targetNumber"
      @new-game="startNewGame"
      @close-overlay="gameResult = GameResult.IN_PROGRESS"
    />

    <CalculatingOverlay
      :isCalculating="isCalculatingSolutions"
    />

    <!-- Configuration manuelle du jeu -->
    <ManualGameSetup 
      v-if="showManualSetup" 
      @start-game="startManualGame" 
    />

    <div class="game-area" v-if="gameStarted || showSolutions">
      <!-- Bouton pour afficher/masquer les raccourcis clavier (visible uniquement sur desktop) -->
      <div v-if="!isTouchDevice && gameStarted" class="shortcuts-toggle">
        <button @click="toggleKeyboardShortcuts" class="toggle-btn">
          {{ showKeyboardShortcuts ? 'Masquer raccourcis' : 'Afficher raccourcis' }}
        </button>
      </div>

      <TilesGrid 
        :tiles="tiles"
        :gameStarted="gameStarted"
        :showGameElements="showGameElements"
        :showKeyboardShortcuts="showKeyboardShortcuts && !isTouchDevice"
        @tile-click="handleTileClick"
      />

      <OperatorsPanel
        :gameStarted="gameStarted"
        :hasFirstOperand="!!firstOperand"
        :showGameElements="showGameElements"
        :showKeyboardShortcuts="showKeyboardShortcuts && !isTouchDevice"
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
        :isCalculating="isCalculatingSolutions"
      />

    </div>


    <!-- Sélecteur de mode de jeu -->
    <GameModeSelector
        v-if="showModeSelector && !gameStarted"
        :initialMode="gameMode"
        @mode-selected="selectGameMode"
    />

    <button 
      class="start-button" 
      @click="startNewGame"
      v-if="!showModeSelector && !showManualSetup && !gameStarted && !showSolutions"
    >
      Nouvelle partie
    </button>
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
  background-color: var(--kitsune-orange-light);
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
