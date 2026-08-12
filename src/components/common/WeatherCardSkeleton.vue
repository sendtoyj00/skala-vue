<script setup>
// 초기 로딩 표시. 실제 WeatherCard와 같은 padding·radius를 써서 로딩→카드 전환 시
// 레이아웃이 밀리지 않게 한다 (design_architecture.md 6절).
defineProps({
  count: {
    type: Number,
    default: 3,
  },
})
</script>

<template>
  <div class="skeleton-card" v-for="n in count" :key="n" aria-hidden="true">
    <div class="skeleton-line skeleton-title" />
    <div class="skeleton-line skeleton-temp" />
    <div class="skeleton-line skeleton-metrics" />
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  border-radius: var(--radius-md);
}
.skeleton-line {
  background: var(--color-surface-sunken);
  border-radius: var(--radius-sm);
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}
.skeleton-title {
  width: 40%;
  height: var(--font-size-md);
  margin-bottom: var(--space-2);
}
.skeleton-temp {
  width: 30%;
  height: var(--font-size-2xl);
  margin-bottom: var(--space-2);
}
.skeleton-metrics {
  width: 60%;
  height: var(--font-size-sm);
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line {
    animation: none;
  }
}
</style>
