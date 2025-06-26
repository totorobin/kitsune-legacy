<script setup lang="ts">
defineProps<{
  gameStarted: boolean;
  hasFirstOperand: boolean;
  showGameElements: boolean;
}>();

const emit = defineEmits<{
  'operator-click': [value: string];
}>();

const handleOperatorClick = (value: string) => {
  emit('operator-click', value);
};
</script>

<template>
  <div class="operators" v-if="showGameElements">
    <button @click="handleOperatorClick('+')" :disabled="!gameStarted || !hasFirstOperand">+</button>
    <button @click="handleOperatorClick('-')" :disabled="!gameStarted || !hasFirstOperand">-</button>
    <button @click="handleOperatorClick('×')" :disabled="!gameStarted || !hasFirstOperand">×</button>
    <button @click="handleOperatorClick('÷')" :disabled="!gameStarted || !hasFirstOperand">÷</button>
    <button @click="handleOperatorClick('C')" :disabled="!gameStarted">C</button>
  </div>
</template>

<style scoped>
.operators {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.operators button {
  padding: 15px;
  font-size: 18px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.operators button:hover:not(:disabled) {
  background-color: var(--kitsune-light-orange);
  color: white;
  border-color: var(--kitsune-orange);
  transform: translateY(-2px);
}

.operators button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
