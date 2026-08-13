<script setup>
import { SHADE_LABEL } from '@/domain/walkRoutes'

defineProps({
  route: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    class="route-card"
    :class="{ selected: isSelected, recommended: route.isRecommended }"
    @click="$emit('select', route.id)"
  >
    <div class="route-head">
      <span class="route-icon" aria-hidden="true">{{ route.icon }}</span>
      <span class="route-name">{{ route.name }}</span>
      <el-tag v-if="route.isRecommended" type="success" size="small" effect="dark" round>오늘의 추천</el-tag>
    </div>

    <div class="route-stats">
      <span>{{ route.distanceKm.toFixed(1) }}km</span>
      <span class="dot" aria-hidden="true">·</span>
      <span>약 {{ route.estimatedMinutes }}분</span>
      <span class="dot" aria-hidden="true">·</span>
      <span>{{ SHADE_LABEL[route.shadeLevel] }}</span>
    </div>

    <p v-if="route.exceedsVerdict" class="route-warn">
      ⚠ 지금 판정 가능 시간보다 길어요. 중간에 돌아오는 것도 고려하세요.
    </p>

    <ul class="route-reasons">
      <li v-for="(r, i) in route.reasons" :key="i">💡 {{ r }}</li>
    </ul>
  </button>
</template>

<style scoped>
.route-card {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font: inherit;
  color: inherit;
}
.route-card.recommended {
  border-color: var(--color-walk-good);
}
.route-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-surface);
}
.route-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 700;
}
.route-icon {
  font-size: var(--font-size-md);
}
.route-name {
  flex: 1;
}
.route-stats {
  margin-top: var(--space-1);
  display: flex;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
.dot {
  color: var(--color-border);
}
.route-warn {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-warning);
}
.route-reasons {
  list-style: none;
  margin: var(--space-2) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
