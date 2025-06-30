<script setup lang="ts">
import GameBoard from './components/GameBoard.vue'
</script>

<template>
    <GameBoard />
</template>

<style>

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .game-title {
    font-size: 2.2rem;
    margin: 0;
  }
}
</style>