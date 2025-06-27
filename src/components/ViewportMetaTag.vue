<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Récupérer ou créer la balise meta viewport
  let viewportMeta = document.querySelector('meta[name="viewport"]');

  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }

  // Définir les attributs pour optimiser l'affichage sur mobile
  viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
});
</script>

<template>
  <!-- Ce composant n'a pas de rendu visible -->
</template>
