<script setup lang="ts">
import ConfettiExplosion from './ConfettiExplosion.vue';
import type { GameStatesType } from '../types/game';
import { GameStates } from '../types/game';
import { ref, watch } from 'vue';
import LoadingSpinner from "./LoadingSpinner.vue";

const props = defineProps<{
  gameResult: GameStatesType;
  targetNumber?: number;
  isCalculating: boolean;
}>();

const emit = defineEmits<{
  'close-overlay': [];
}>();

// État pour contrôler la visibilité de l'overlay
const visible = ref(true);

// Réinitialiser visible à true quand gameResult change de IN_PROGRESS à autre chose
watch(() => props.gameResult, (newValue, oldValue) => {
  if (newValue !== GameStates.IN_PROGRESS && oldValue === GameStates.IN_PROGRESS) {
    visible.value = true;
  }
});


const closeOverlay = () => {
  visible.value = false;
  emit('close-overlay');
};

</script>

<template>
  <div v-if="gameResult !== GameStates.IN_PROGRESS && gameResult != GameStates.NOT_STARTED && visible" class="victory-overlay" @click="closeOverlay">
    <div class="victory-content">
      <div class="victory-text">
        <template v-if="gameResult === GameStates.EXACT_WIN">GAGNÉ !</template>
        <template v-else-if="gameResult === GameStates.BEST_WIN">BIEN JOUÉ !</template>
        <template v-else-if="gameResult === GameStates.LOSS || gameResult === GameStates.TIME_UP">TEMPS ÉCOULÉ</template>
      </div>
      <div v-if="gameResult === GameStates.TIME_UP && isCalculating" class="calculating-content">
          <LoadingSpinner text="Recherche des solutions..." />
          <p class="calculating-info">La recherche peut prendre quelques secondes...</p>
      </div>
      <div class="victory-subtitle">
        <template v-if="gameResult === GameStates.EXACT_WIN">Vous avez trouvé le nombre exact !</template>
        <template v-else-if="gameResult === GameStates.BEST_WIN">Vous avez trouvé le meilleur résultat possible !</template>
      </div>

    </div>
    <ConfettiExplosion :active="gameResult !== GameStates.LOSS && gameResult != GameStates.TIME_UP" :count="150" />
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

.calculating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.calculating-info {
  margin-top: 15px;
  font-size: 18px;
  color: white;
  font-style: italic;
  opacity: 0.8;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
