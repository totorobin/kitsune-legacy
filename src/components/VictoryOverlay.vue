<script setup lang="ts">
import ConfettiExplosion from './ConfettiExplosion.vue';
import type { GameResultType } from '../types/game';
import { GameResult } from '../types/game';
import { computed, ref, watch } from 'vue';
import { type Solution } from "../utils/solutionFinder2";

const props = defineProps<{
  gameResult: GameResultType;
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


const closeOverlay = () => {
  visible.value = false;
  emit('close-overlay');
};


// Récupérer la meilleure solution
const bestSolution = computed(() => {
  if (!props.solutions || props.solutions.length === 0) return null;
  return props.solutions[0];
});
</script>

<template>
  <div v-if="gameResult !== GameResult.IN_PROGRESS && visible" class="victory-overlay" @click="closeOverlay">
    <div class="victory-content" @click.stop>
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
      <div v-if="bestSolution" class="best-solution-display">
        <div class="target-number-info">Nombre cible : {{ targetNumber }}</div>
        <div class="best-solution-card">
          <div class="solution-result">
            <span v-if="bestSolution.distance === 0">Résultat exact</span>
            <span v-else>Meilleur résultat: {{ bestSolution.result }}</span>
          </div>
          <div class="solution-expression">{{ bestSolution.oneLineOperation }}</div>
        </div>
      </div>

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


.victory-text {
  font-size: 96px;
  font-weight: 900;
  color: var(--kitsune-orange);
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
  animation: pulse 1.5s infinite;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
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


  .solution-expression {
    font-size: 18px;
    padding: 15px 10px;
    word-break: break-word;
  }
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
