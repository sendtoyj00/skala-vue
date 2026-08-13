<template>
  <div class="base-dashboard-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.base-dashboard-card {
  background: var(--color-surface);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
</style>
