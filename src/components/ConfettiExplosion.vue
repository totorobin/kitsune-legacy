<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps<{
  active: boolean;
  count?: number;
}>();

// Nombre de confettis à générer
const confettiCount = computed(() => props.count || 150);

// Interface pour les propriétés d'un confetti
interface Confetti {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  delay: number;
  opacity: number;
  fallDuration: number;
  spinDuration: number;
}

// Couleurs de confettis, y compris les couleurs Kitsune
const colors = [
  'var(--kitsune-orange, #FF6B00)',
  'var(--kitsune-light-orange, #FF8C40)',
  'var(--kitsune-dark-orange, #E65C00)',
  '#FFD700', // Or
  '#FF4500', // Rouge-orange
  '#FFFFFF', // Blanc
];

// Tableau réactif pour stocker les confettis
const confettis = ref<Confetti[]>([]);

// Générer un tableau de confettis avec des propriétés aléatoires
const generateConfettis = () => {
  const items: Confetti[] = [];
  for (let i = 0; i < confettiCount.value; i++) {
    items.push({
      id: i,
      x: Math.random() * 100, // Position horizontale en pourcentage
      y: -20 - Math.random() * 100, // Position verticale initiale négative
      size: Math.random() * 10 + 5, // Taille entre 5 et 15px
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, // Rotation initiale
      delay: Math.random() * 1.5, // Délai aléatoire
      opacity: Math.random() * 0.5 + 0.5, // Opacité entre 0.5 et 1
      fallDuration: Math.random() * 2 + 3, // Durée de chute entre 3 et 5 secondes
      spinDuration: Math.random() * 3 + 1 // Durée de rotation entre 1 et 4 secondes
    });
  }
  return items;
};

// Observer les changements de la propriété active
watch(() => props.active, (newValue) => {
  if (newValue) {
    confettis.value = generateConfettis();
  }
});

// Générer les confettis au montage si actif
onMounted(() => {
  if (props.active) {
    confettis.value = generateConfettis();
  }
});
</script>

<template>
  <div class="confetti-container" v-if="active">
    <div 
      v-for="confetti in confettis" 
      :key="confetti.id"
      class="confetti"
      :style="{
        backgroundColor: confetti.color,
        left: confetti.x + '%',
        top: confetti.y + 'px',
        width: confetti.size + 'px',
        height: confetti.size + 'px',
        opacity: confetti.opacity,
        transform: `rotate(${confetti.rotation}deg)`,
        animationDelay: confetti.delay + 's',
        animationDuration: `${confetti.fallDuration}s, ${confetti.spinDuration}s`
      }"
    ></div>
  </div>
</template>

<style scoped>
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

.confetti {
  position: absolute;
  border-radius: 20%;
  animation: fall linear forwards, spin linear infinite;
}

@keyframes fall {
  to {
    top: 100vh;
    opacity: 0;
  }
}

.confetti-container.fullscreen {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1001;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
