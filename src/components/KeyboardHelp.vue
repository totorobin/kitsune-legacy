<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  alwaysOpen: {
    type: Boolean,
    default: false
  }
});

const showHelp = ref(false);

const toggleHelp = () => {
  showHelp.value = !showHelp.value;
};

const shouldShowHelp = computed(() => {
  return props.alwaysOpen || showHelp.value;
});
</script>

<template>
  <div class="keyboard-help">
    <button v-if="!alwaysOpen" @click="toggleHelp" class="help-button">
      <span v-if="!showHelp">Afficher l'aide clavier</span>
      <span v-else>Masquer l'aide</span>
    </button>

    <div v-if="alwaysOpen" class="help-title">Aide clavier</div>

    <div v-if="shouldShowHelp" class="help-content">
      <h3>Touches du clavier</h3>
      <div class="help-grid">
        <div class="help-item">
          <span class="key">1-9</span>
          <span class="desc">Sélectionner les tuiles de 1 à 9</span>
        </div>
        <div class="help-item">
          <span class="key">0</span>
          <span class="desc">Sélectionner la tuile 10</span>
        </div>
        <div class="help-item">
          <span class="key">A</span>
          <span class="desc">Sélectionner la tuile 25</span>
        </div>
        <div class="help-item">
          <span class="key">Z</span>
          <span class="desc">Sélectionner la tuile 50</span>
        </div>
        <div class="help-item">
          <span class="key">E</span>
          <span class="desc">Sélectionner la tuile 75</span>
        </div>
        <div class="help-item">
          <span class="key">R</span>
          <span class="desc">Sélectionner la tuile 100</span>
        </div>
        <div class="help-item">
          <span class="key">+</span>
          <span class="desc">Addition</span>
        </div>
        <div class="help-item">
          <span class="key">-</span>
          <span class="desc">Soustraction</span>
        </div>
        <div class="help-item">
          <span class="key">* ou X</span>
          <span class="desc">Multiplication</span>
        </div>
        <div class="help-item">
          <span class="key">/ ou :</span>
          <span class="desc">Division</span>
        </div>
        <div class="help-item">
          <span class="key">C</span>
          <span class="desc">Effacer/Réinitialiser</span>
        </div>
        <div class="help-item">
          <span class="key">Backspace ou U</span>
          <span class="desc">Annuler la dernière opération</span>
        </div>
      </div>

      <h3>Tuiles résultats</h3>
      <div class="help-grid">
        <div class="help-item">
          <span class="key">F, G, H</span>
          <span class="desc">Premiers résultats</span>
        </div>
        <div class="help-item">
          <span class="key">J, K, L, M</span>
          <span class="desc">Autres résultats</span>
        </div>
        <div class="help-item">
          <span class="desc">Les lettres apparaissent sur chaque tuile résultat</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--kitsune-dark);
  margin-bottom: 10px;
  border-bottom: 2px solid var(--kitsune-orange);
  padding-bottom: 6px;
}

/* Style pour la version desktop de l'aide */
.desktop-help .help-content {
  font-size: 13px;
}

.desktop-help .help-item {
  margin-bottom: 8px;
}

.desktop-help .key {
  font-size: 12px;
  padding: 3px 6px;
}

.desktop-help .desc {
  font-size: 12px;
}
</style>

<style scoped>
.keyboard-help {
  margin-top: 20px;
}

.help-button {
  background: var(--kitsune-light-orange);
  border: none;
  color: var(--kitsune-dark);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.help-button:hover {
  background: var(--kitsune-orange);
  color: white;
}

.help-content {
  margin-top: 10px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.help-content h3 {
  margin-top: 0;
  color: var(--kitsune-dark);
  font-size: 16px;
  margin-bottom: 12px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.help-item {
  display: flex;
  flex-direction: column;
}

.key {
  font-weight: bold;
  background: #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  display: inline-block;
  width: fit-content;
}

.desc {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}
</style>
