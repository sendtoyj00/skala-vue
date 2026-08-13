<template>
  <div class="base-dashboard-card" v-glow-tilt>
    <slot></slot>
  </div>
</template>

<style scoped>
.base-dashboard-card {
  background: var(--glass-bg);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
</style>
