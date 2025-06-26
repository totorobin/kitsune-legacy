<script setup lang="ts">
import ConfettiExplosion from './ConfettiExplosion.vue';
import { GameResult } from '../types/game';

defineProps<{
  gameResult: GameResult;
  showNewGameButton: boolean;
}>();

const emit = defineEmits<{
  'new-game': [];
}>();

const startNewGame = () => {
  emit('new-game');
};
</script>

<template>
  <div v-if="gameResult !== GameResult.IN_PROGRESS && gameResult !== GameResult.LOSS" class="victory-overlay">
    <div class="victory-content">
      <div class="victory-text">
        <template v-if="gameResult === GameResult.EXACT_WIN">GAGNÉ !</template>
        <template v-else-if="gameResult === GameResult.BEST_WIN">BIEN JOUÉ !</template>
      </div>
      <div class="victory-subtitle">
        <template v-if="gameResult === GameResult.EXACT_WIN">Vous avez trouvé le nombre exact !</template>
        <template v-else-if="gameResult === GameResult.BEST_WIN">Vous avez trouvé le meilleur résultat possible !</template>
      </div>
      <button v-if="showNewGameButton" class="new-game-button" @click="startNewGame">Nouvelle Partie</button>
    </div>
    <ConfettiExplosion :active="true" :count="150" />
  </div>
</template>

<style scoped>
.victory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}

.victory-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.victory-text {
  font-size: 72px;
  font-weight: bold;
  color: var(--kitsune-orange);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  animation: pulse 1.5s infinite;
}

.victory-subtitle {
  font-size: 24px;
  color: white;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  animation: fadeIn 1s ease-in;
}

.new-game-button {
  margin-top: 10px;
  padding: 15px 30px;
  font-size: 24px;
  background: var(--kitsune-orange);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  animation: fadeIn 0.5s ease-in;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
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
</style>
