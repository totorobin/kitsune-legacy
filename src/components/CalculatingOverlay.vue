<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue';

defineProps<{
  isCalculating: boolean;
}>();
</script>

<template>
  <div v-if="isCalculating" class="calculating-overlay">
    <div class="calculating-content">
      <div class="timeout-message">Temps écoulé !</div>
      <LoadingSpinner text="Recherche des solutions..." />
      <p class="calculating-info">La recherche peut prendre quelques secondes...</p>
    </div>
  </div>
</template>

<style scoped>
.calculating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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

.timeout-message {
  font-size: 48px;
  font-weight: 900;
  color: var(--kitsune-orange);
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
  animation: pulse 2s infinite;
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
