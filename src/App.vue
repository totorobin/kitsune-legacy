<script setup lang="ts">
import GameBoard from './components/GameBoard.vue'
import AppHeader from './components/AppHeader.vue'
</script>

<template>
    <AppHeader />
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