<script setup lang="ts">
// Interface Solution pour la compatibilité
import { computed } from 'vue';
import type { Solution } from '../utils/solutionFinder3';

const props = withDefaults(defineProps<{
  solutions: Solution[];
  targetNumber: number;
  showSolutions: boolean;
  isCalculating?: boolean;
}>(), {
  isCalculating: false
});


// Regrouper les solutions par nombre d'opérations
const groupedSolutions = computed(() => {
  return Object.values<Solution[]>(Object.groupBy(props.solutions, (s : Solution) => s.nbTiles) as Record<number,Solution[]>) as Solution[][];
});
</script>

<template>
  <div v-if="showSolutions" class="solutions-display">
    <h2>Solutions</h2>

    <!-- Aucune solution trouvée (seulement si le calcul est terminé) -->
    <div v-if="solutions.length === 0" class="no-solutions">
      Aucune solution trouvée avec ces nombres.
    </div>

    <!-- Afficher les solutions quand elles sont disponibles (et le calcul est terminé) -->
    <div v-else-if="solutions.length > 0">
      <div class="best-result">
        <p v-if="solutions[0].distance === 0">
          <strong>Résultat exact :</strong> {{ targetNumber }}
        </p>
        <p v-else>
          <strong>Meilleur résultat possible :</strong> {{ solutions[0].result }} 
          <span>(distance: {{ solutions[0].distance }})</span>
        </p>
      </div>

      <div class="solutions-list">
        <div v-for="(solutions, groupIndex) in groupedSolutions" :key="'group-'+groupIndex" class="solutions-group">
          <div class="group-header">
            <h3>Solutions avec {{ solutions[0].nbTiles }} tuiles</h3>
            <div class="result-badge" v-if="solutions[0].distance === 0">Exact: {{ targetNumber }}</div>
            <div class="result-badge" v-else>Résultat: {{ solutions[0].result }}</div>
          </div>

          <div 
            v-for="(solution, index) in solutions"
            :key="'solution-'+groupIndex+'-'+index"
            class="solution-item"
          >
            <div class="concise-expression">
              {{ solution.operation }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.solutions-display {
  margin-top: 20px;
  padding: 15px;
  background-color: #FFF5EB;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #FF6B00;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.no-solutions {
  color: #333333;
  font-style: italic;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.loading-info {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.best-result {
  margin-bottom: 20px;
  font-size: 18px;
}

.solutions-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-top: 15px;
  overflow-y: visible;
}

.solutions-group {
  border: 1px solid #FFD2A8;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 5px;
  background-color: #FFF9F2;
}

.group-header {
  background-color: #FFB980;
  padding: 10px 15px;
  border-bottom: 1px solid #FFD2A8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-header h3 {
  margin: 0;
  font-size: 18px;
  color: #7D3500;
  display: flex;
  align-items: center;
}

.result-badge {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
  color: #7D3500;
}

.solution-item {
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  overflow: hidden;
  margin: 12px 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.concise-expression {
  padding: 12px 15px;
  background-color: white;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  text-align: left;
  border-bottom: 1px solid #E0E0E0;
  position: relative;
}


.toggle-details {
  text-align: right;
  padding: 0;
  background-color: transparent;
  position: relative;
  top: -32px;
  right: 10px;
  margin-bottom: -20px;
  height: 20px;
}

.toggle-details button {
  background: none;
  border: none;
  color: #FF6B00;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  opacity: 0.7;
  border-radius: 4px;
}

.toggle-details button:hover {
  color: #E65C00;
  opacity: 1;
  background-color: rgba(255, 107, 0, 0.1);
}

/* Par défaut, cacher les opérations détaillées */
.operations {
  display: none;
  padding: 10px;
  background-color: white;
  border-radius: 0 0 6px 6px;
}

/* Afficher les opérations détaillées quand la classe show-details est présente */
.solution-item.show-details .operations {
  display: block;
}

.operation {
  padding: 8px 0;
  border-bottom: 1px solid #F5F5F5;
  font-size: 16px;
  color: #333333;
  line-height: 1.4;
}

.operation:last-child {
  border-bottom: none;
  font-weight: bold;
}
</style>
