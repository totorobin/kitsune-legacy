<script setup lang="ts">
import { computed } from 'vue';
import { MAX_TIME } from '../types/game';

const props = defineProps<{
  targetNumber: number;
  timeLeft: number;
  gameTime: number;
}>();

// Format du temps restant
const formattedTime = computed(() => {
  return `${props.timeLeft.toString().padStart(2, '0')}`;
});

// Pourcentage de temps restant pour la barre de progression
const timeLeftPercentage = computed(() => {
  return (props.timeLeft / props.gameTime) * 100;
});

// Couleur de la barre de progression en fonction du temps restant
const progressBarColor = computed(() => {
  if (timeLeftPercentage.value > 66) {
    return '#FF6B00'; // Orange Kitsune
  } else if (timeLeftPercentage.value > 33) {
    return '#FF8C40'; // Orange clair Kitsune
  } else {
    return '#E65C00'; // Orange foncé Kitsune
  }
});
</script>

<template>
  <div class="target-number">Nombre à trouver: {{ targetNumber }}</div>
  <div class="timer-container">
    <div class="timer">Temps restant: {{ formattedTime }}s</div>
    <div class="progress-bar-container">
      <div 
        class="progress-bar" 
        :style="{
          width: timeLeftPercentage + '%',
          backgroundColor: progressBarColor
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 20px;
}

.target-number {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.timer-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.timer {
  font-size: 20px;
  color: #666;
  text-align: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.logo {
  max-height: 80px;
  margin-bottom: 10px;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 1s linear, background-color 1s ease;
}
</style>
