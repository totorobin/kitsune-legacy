<script setup lang="ts">
import {onMounted, ref} from "vue";

defineProps<{
  gameStarted: boolean;
  hasFirstOperand: boolean;
  currentOperator: string | null
}>();

const emit = defineEmits<{
  'operator-click': [value: string];
}>();

const handleOperatorClick = (value: string) => {
  emit('operator-click', value);
};


const showKeyboardShortcuts = ref(false);
onMounted(() => {
  // Détection des appareils tactiles
  showKeyboardShortcuts.value = ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);
});
</script>

<template>
  <div class="operators">
    <div class="operators-main">
      <button 
        @click="handleOperatorClick('+')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{ selected: currentOperator === '+'}"
      >
        +
      </button>
      <button 
        @click="handleOperatorClick('-')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{ selected: currentOperator === '-'}"
      >
        -
      </button>
      <button 
        @click="handleOperatorClick('×')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{  selected: currentOperator === '×'}"
      >
        ×
      </button>
      <button 
        @click="handleOperatorClick('÷')" 
        :disabled="!gameStarted || !hasFirstOperand"
        :class="{ selected: currentOperator === '÷'}"
      >
        ÷
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
          C
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
         ⌫
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
  border-color: var(--kitsune-orange);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.operators button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #e0e0e0;
  border-color: #999;
}

.operators button.selected {
  background-color: var(--kitsune-light-orange);
  color: white;
  border-color: var(--kitsune-orange);
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
