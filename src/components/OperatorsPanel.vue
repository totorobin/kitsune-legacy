<script setup lang="ts">
defineProps<{
  gameStarted: boolean;
  hasFirstOperand: boolean;
  showGameElements: boolean;
  showKeyboardShortcuts: boolean;
}>();

const emit = defineEmits<{
  'operator-click': [value: string];
}>();

const handleOperatorClick = (value: string) => {
  emit('operator-click', value);
};

// Fonction pour obtenir le raccourci clavier d'un opérateur
const getOperatorKeyHint = (operator: string) => {
  switch (operator) {
    case '+': return '+';
    case '-': return '-';
    case '×': return '*';
    case '÷': return '/';
    case 'C': return 'C';
    case 'U': return '⌫';
    default: return '';
  }
};
</script>

<template>
  <div class="operators" v-if="showGameElements">
    <div class="operators-main">
      <button @click="handleOperatorClick('+')" :disabled="!gameStarted || !hasFirstOperand">+</button>
      <button @click="handleOperatorClick('-')" :disabled="!gameStarted || !hasFirstOperand">-</button>
      <button @click="handleOperatorClick('×')" :disabled="!gameStarted || !hasFirstOperand">×</button>
      <button @click="handleOperatorClick('÷')" :disabled="!gameStarted || !hasFirstOperand">÷</button>
    </div>
    <div class="operators-controls">
      <button @click="handleOperatorClick('C')" :disabled="!gameStarted" class="control-button">C</button>
      <button @click="handleOperatorClick('U')" :disabled="!gameStarted" class="undo-button" title="Annuler la dernière opération">↩</button>
    </div>
  </div>
</template>

<style scoped>
.operators {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.operators-main {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.operators-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.operators button {
  padding: 16px;
  font-size: 20px;
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

.operators .undo-button {
  background-color: #f0f0f0;
  color: #444;
  font-size: 20px;
}

.control-button {
  background-color: #f0f0f0;
  color: #444;
}

.operators .undo-button:hover:not(:disabled),
.operators .control-button:hover:not(:disabled) {
  background-color: var(--kitsune-light-orange);
  color: white;
}

/* Style desktop: afficher sur une seule ligne */
@media (min-width: 481px) {
  .operators {
    flex-direction: row;
  }

  .operators-main {
    flex: 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .operators-controls {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Style mobile: afficher sur deux lignes */
@media (max-width: 480px) {
  .operators-main button,
  .operators-controls button {
    padding: 14px;
    font-size: 18px;
  }

  .operators-controls button {
    font-weight: bold;
  }
}
</style>
