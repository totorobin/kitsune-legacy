<script setup lang="ts">
import ConfettiExplosion from './ConfettiExplosion.vue';
import { GameResult } from '../types/game';
import { Solution, generateConciseExpression } from '../utils/solutionFinder';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  gameResult: GameResult;
  showNewGameButton: boolean;
  solutions?: Solution[];
  targetNumber?: number;
}>();

const emit = defineEmits<{
  'new-game': [];
  'close-overlay': [];
}>();

// État pour contrôler la visibilité de l'overlay
const visible = ref(true);

// Réinitialiser visible à true quand gameResult change de IN_PROGRESS à autre chose
watch(() => props.gameResult, (newValue, oldValue) => {
  if (newValue !== GameResult.IN_PROGRESS && oldValue === GameResult.IN_PROGRESS) {
    visible.value = true;
  }
});

const startNewGame = () => {
  emit('new-game');
};

const closeOverlay = () => {
  visible.value = false;
  emit('close-overlay');
};

// Calcul des expressions concises pour chaque solution
const solutionsWithExpressions = computed(() => {
  if (!props.solutions) return [];
  return props.solutions.map(solution => ({
    ...solution,
    conciseExpression: generateConciseExpression(solution.operations)
  }));
});

// Récupérer la meilleure solution
const bestSolution = computed(() => {
  if (solutionsWithExpressions.value.length === 0) return null;
  return solutionsWithExpressions.value[0];
});
</script>

<template>
  <div v-if="gameResult !== GameResult.IN_PROGRESS && visible" class="victory-overlay">
    <div class="victory-content">
          <button class="close-button" @click="closeOverlay" aria-label="Fermer l'overlay" title="Fermer pour voir les solutions">
                  <span class="close-icon">&times;</span>
                </button>
      <div class="victory-text">
        <template v-if="gameResult === GameResult.EXACT_WIN">GAGNÉ !</template>
        <template v-else-if="gameResult === GameResult.BEST_WIN">BIEN JOUÉ !</template>
        <template v-else-if="gameResult === GameResult.LOSS">TEMPS ÉCOULÉ</template>
      </div>
      <div class="victory-subtitle">
        <template v-if="gameResult === GameResult.EXACT_WIN">Vous avez trouvé le nombre exact !</template>
        <template v-else-if="gameResult === GameResult.BEST_WIN">Vous avez trouvé le meilleur résultat possible !</template>
        <template v-else-if="gameResult === GameResult.LOSS && targetNumber">
          <div class="solution-header">Voici la meilleure solution :</div>
        </template>
      </div>

      <!-- Affichage de la meilleure solution quand le temps est écoulé -->
      <div v-if="gameResult === GameResult.LOSS && bestSolution" class="best-solution-display">
        <div class="target-number-info">Nombre cible : {{ targetNumber }}</div>
        <div class="best-solution-card">
          <div class="solution-result">
            <span v-if="bestSolution.distance === 0">Résultat exact</span>
            <span v-else>Meilleur résultat: {{ bestSolution.result }}</span>
          </div>
          <div class="solution-expression">{{ bestSolution.conciseExpression }}</div>
        </div>
      </div>

      <button v-if="showNewGameButton" class="new-game-button" @click="startNewGame">Nouvelle Partie</button>
    </div>
    <ConfettiExplosion :active="gameResult !== GameResult.LOSS" :count="150" />
  </div>
</template>

<style scoped>
.victory-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.victory-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 90%;
  width: 550px;
  position: relative;
}

.close-button {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--kitsune-orange);
  color: white;
  border: none;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s, transform 0.2s;
  /* Amélioration de la zone cliquable avec pseudo-élément */
  z-index: 10;
}

.close-button:hover {
  background-color: var(--kitsune-dark-orange);
  transform: scale(1.1);
}

/* Ajouter une zone invisible plus grande pour faciliter le clic/toucher */
.close-button::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  /* La zone est invisible mais cliquable */
  cursor: pointer;
}

.close-icon {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.victory-text {
  font-size: 96px;
  font-weight: 900;
  color: var(--kitsune-orange);
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  animation: pulse 1.5s infinite;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.victory-subtitle {
  font-size: 32px;
  color: white;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  animation: fadeIn 1s ease-in;
  max-width: 600px;
  margin: 0 auto;
}

.new-game-button {
  margin-top: 30px;
  padding: 20px 40px;
  font-size: 28px;
  background: var(--kitsune-orange);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  animation: fadeIn 0.5s ease-in;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .victory-text {
    font-size: 52px;
    letter-spacing: 1px;
  }

  .victory-subtitle {
    font-size: 22px;
    padding: 0 10px;
  }

  .new-game-button {
    margin-top: 20px;
    padding: 15px 30px;
    font-size: 20px;
  }

  .close-button {
    top: -15px;
    right: -15px;
    width: 40px;
    height: 40px;
  }

  .solution-expression {
    font-size: 18px;
    padding: 15px 10px;
    word-break: break-word;
  }
}

.new-game-button:hover {
  background: var(--kitsune-dark-orange);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Styles pour l'affichage de la solution */
.solution-header {
  margin-top: 10px;
  font-size: 24px;
  color: white;
  text-align: center;
}

.best-solution-display {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0 20px;
  animation: fadeIn 1s ease-in;
}

.target-number-info {
  font-size: 18px;
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.best-solution-card {
  background-color: #FFF5EB;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.solution-result {
  background-color: #FF6B00;
  color: white;
  padding: 10px 15px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.solution-expression {
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
}
</style>
