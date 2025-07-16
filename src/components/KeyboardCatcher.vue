<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue";
import {Tile} from "../types/game";

const props = defineProps<{
  tiles: Tile[];
}>()

const emit = defineEmits<{
  'tile-click' : [ tile: Tile]
  'operator-click' : [ operator: String ]

}>()

// État pour l'affichage des raccourcis clavier
const isTouchDevice = ref(false); // Détection des appareils tactiles

// Ajout et suppression des écouteurs d'événements
onMounted(() => {

  // Détection des appareils tactiles
  isTouchDevice.value = ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);

  if(!isTouchDevice.value) {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const currentNumber = ref<string>('');
// Gestionnaire d'événements pour les touches du clavier
const handleKeydown = (event: KeyboardEvent) => {

  console.log(`key : ${event.key} current number : ${currentNumber.value}`)
  // Gestion des touches numériques (1-9, 0)
  if (/^[0-9]$/.test(event.key)) {
    currentNumber.value += event.key;
    const availableTiles = props.tiles.filter((tile: Tile) => !tile.isUsed && !tile.isSelected);

    if(!availableTiles.some((tile: Tile) => tile.value.toString().startsWith(currentNumber.value))) {
      currentNumber.value = event.key;
      if(!availableTiles.some((tile: Tile) => tile.value.toString().startsWith(currentNumber.value))) {
          currentNumber.value = '';
      }
    }

  }
  // Gestion des opérateurs
  if (event.key === '+') {
    handleOperator( '+');
  } else if (event.key === '-') {
    handleOperator( '-');
  } else if (event.key === '*' || event.key === 'x' || event.key === 'X') {
    handleOperator( '×');
  } else if (event.key === '/' || event.key === ':') {
    handleOperator( '÷');
  } else if (event.key === 'c' || event.key === 'C') {
    handleOperator( 'C');
  } else if (event.key === 'Backspace' || event.key === 'u' || event.key === 'U') {
    handleOperator( 'U');
  } else if (event.key === 'Enter' || event.key === '=' || event.key === 'space') {
    handleOperator( '=');
  }
  console.log(`current number : ${currentNumber.value}`)

};

const handleOperator = (value: string) => {
  const seletedTile = props.tiles.filter((tile: Tile) => !tile.isUsed && !tile.isSelected).find((tile: Tile) => tile.value.toString() === currentNumber.value)
  if(seletedTile) {
    emit('tile-click', seletedTile);
  }
  emit('operator-click', value);
  currentNumber.value = ''
}

watch(() => props.tiles, () => {
  currentNumber.value = ''
}, {deep: true})
</script>

<template>
<slot :current-number="currentNumber"></slot>
</template>

<style scoped>

</style>