<template>
  <div class="spinner-container">
    <div class="spinner">
      <div class="dot dot1"></div>
      <div class="dot dot2"></div>
      <div class="dot dot3"></div>
    </div>
    <div class="spinner-text" v-if="text">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 150px;
  /* Adaptation pour l'affichage en plein écran */
  margin: 0 auto;
  max-width: 400px;
}

.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--kitsune-orange);
  animation: bounce 1.4s infinite ease-in-out both;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.dot1 {
  animation-delay: -0.32s;
}

.dot2 {
  animation-delay: -0.16s;
}

.dot3 {
  animation-delay: 0s;
}

.spinner-text {
  margin-top: 25px;
  font-size: 24px;
  color: white;
  font-weight: 600;
  animation: fadeInOut 2s infinite ease-in-out;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
}
</style>
