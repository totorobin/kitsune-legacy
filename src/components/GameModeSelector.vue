<template>
  <div class="game-mode-selector">
    <h2>Choisissez un mode de jeu</h2>
    <div class="mode-options">
      <div 
        class="mode-option" 
        :class="{ 'selected': selectedMode === 'auto' }"
        @click="selectMode('auto')"
      >
        <h3>Mode Automatique</h3>
        <p>Les tuiles et le nombre cible sont générés aléatoirement.</p>
      </div>
      <div 
        class="mode-option" 
        :class="{ 'selected': selectedMode === 'manual' }"
        @click="selectMode('manual')"
      >
        <h3>Mode Manuel</h3>
        <p>Choisissez vous-même les tuiles et le nombre cible.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Définir les types de mode de jeu
type GameMode = 'auto' | 'manual';

// État local pour le mode sélectionné
const selectedMode = ref<GameMode>('auto');

// Props et émissions
const props = defineProps<{
  initialMode?: GameMode;
}>();

const emit = defineEmits<{
  (e: 'mode-selected', mode: GameMode): void;
}>();

// Initialiser le mode sélectionné avec la prop si elle est fournie
if (props.initialMode) {
  selectedMode.value = props.initialMode;
}

// Fonction pour sélectionner un mode
const selectMode = (mode: GameMode) => {
  selectedMode.value = mode;
  emit('mode-selected', mode);
};
</script>

<style scoped>
.game-mode-selector {
  margin: 20px 0;
  text-align: center;
}

.mode-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.mode-option {
  flex: 1;
  max-width: 300px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mode-option:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.mode-option.selected {
  border-color: var(--kitsune-orange);
  background-color: var(--kitsune-orange-light);
}

h3 {
  margin-top: 0;
  color: var(--kitsune-dark);
}

p {
  color: #666;
  font-size: 14px;
}

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .mode-options {
    flex-direction: column;
    align-items: center;
  }
  
  .mode-option {
    width: 100%;
  }
}
</style>