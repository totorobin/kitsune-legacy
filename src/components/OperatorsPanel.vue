<script setup lang="ts">
defineProps<{
  gameStarted: boolean;
  hasFirstOperand: boolean;
  showGameElements: boolean;
  showKeyboardShortcuts: boolean
  currentOperator: string | null
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
      <button 
        @click="handleOperatorClick('+')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{ 'show-shortcuts': showKeyboardShortcuts && gameStarted , selected: currentOperator === '+'}"
      >
        +
        <span v-if="showKeyboardShortcuts && gameStarted" class="key-hint">
          {{ getOperatorKeyHint('+') }}
        </span>
      </button>
      <button 
        @click="handleOperatorClick('-')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{ 'show-shortcuts': showKeyboardShortcuts && gameStarted , selected: currentOperator === '-'}"
      >
        -
        <span v-if="showKeyboardShortcuts && gameStarted" class="key-hint">
          {{ getOperatorKeyHint('-') }}
        </span>
      </button>
      <button 
        @click="handleOperatorClick('×')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{ 'show-shortcuts': showKeyboardShortcuts && gameStarted , selected: currentOperator === '×'}"
      >
        ×
        <span v-if="showKeyboardShortcuts && gameStarted" class="key-hint">
          {{ getOperatorKeyHint('×') }}
        </span>
      </button>
      <button 
        @click="handleOperatorClick('÷')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{ 'show-shortcuts': showKeyboardShortcuts && gameStarted , selected: currentOperator === '÷'}"
      >
        ÷
        <span v-if="showKeyboardShortcuts && gameStarted" class="key-hint">
          {{ getOperatorKeyHint('÷') }}
        </span>
      </button>
    </div>
    <div class="operators-controls">
      <button 
        @click="handleOperatorClick('C')" 
        :disabled="!gameStarted" 
        class="control-button"
        :class="{ 'show-shortcuts': showKeyboardShortcuts && gameStarted }"
      >
        C
        <span v-if="showKeyboardShortcuts && gameStarted" class="key-hint">
          {{ getOperatorKeyHint('C') }}
        </span>
      </button>
      <button 
        @click="handleOperatorClick('U')" 
        :disabled="!gameStarted" 
        class="undo-button" 
        title="Annuler la dernière opération"
        :class="{ 'show-shortcuts': showKeyboardShortcuts && gameStarted }"
      >
        ↩
        <span v-if="showKeyboardShortcuts && gameStarted" class="key-hint">
          {{ getOperatorKeyHint('U') }}
        </span>
      </button>
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

.selected {
  background-color: var(--kitsune-light-orange);
  color: white;
  border-color: var(--kitsune-orange);
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

/* Style pour les raccourcis clavier */
.operators button {
  position: relative;
}

.operators .key-hint {
  position: absolute;
  top: 3px;
  right: 3px;
  font-size: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--kitsune-dark);
  padding: 1px 3px;
  border-radius: 3px;
  opacity: 0.7;
  min-width: 12px;
  text-align: center;
}

/* Animation pour les raccourcis clavier */
.show-shortcuts .key-hint {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 0.7; }
  100% { opacity: 0.5; }
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
