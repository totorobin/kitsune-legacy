<script setup lang="ts">
defineProps<{
  expression: string;
  operationsHistory: string[];
}>();
</script>

<template>
  <div class="expression">
    <div v-for="(op, index) in operationsHistory" :key="'history-'+index" class="history-item">
      {{ op }}
    </div>
    <div v-if="expression" class="current-expression">{{ expression }}</div>
  </div>
</template>

<style scoped>
.expression {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  text-align: right;
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.history-item {
  margin-bottom: 5px;
  font-size: 16px;
  color: #555;
}

.current-expression {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-top: 8px;
  border-top: 1px solid #ddd;
  padding-top: 8px;
}

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .expression {
    padding: 10px;
    min-height: 90px;
    max-height: 150px;
  }

  .history-item {
    font-size: 14px;
    margin-bottom: 3px;
    overflow-x: auto;
    white-space: nowrap;
  }

  .current-expression {
    font-size: 20px;
    padding-top: 5px;
    margin-top: 5px;
  }
}
</style>
