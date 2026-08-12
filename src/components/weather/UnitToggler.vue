<script setup>
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span
      >날씨단위: <strong>{{ configStore.unitLabel }}</strong></span
    >
    <button @click="configStore.toggleUnit" class="toggle-btn">단위변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  text-align: center;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.toggle-btn {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: bold;
}
</style>
