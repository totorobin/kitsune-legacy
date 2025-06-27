<script setup lang="ts">
import GameBoard from './components/GameBoard.vue'
import ViewportMetaTag from './components/ViewportMetaTag.vue'
</script>

<template>
  <ViewportMetaTag />
  <div class="app">
    <GameBoard />
  </div>
</template>

<style>
.app {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .game-title {
    font-size: 2.2rem;
    margin: 0.5rem 0 1rem;
  }

  .app-container {
    width: 100%;
    padding: 0;
  }
}
</style>