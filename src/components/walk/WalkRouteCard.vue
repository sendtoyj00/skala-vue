<script setup>
import { SHADE_LABEL } from '@/domain/walkRoutes'

defineProps({
  route: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <!-- 바깥은 div — 안에 "카카오맵 길찾기" <a>를 두려면 <button> 안에 <a>를 넣는 잘못된 중첩
       (interactive-in-interactive)을 피해야 한다. 선택 동작만 내부 button이 맡는다. -->
  <div class="route-card" :class="{ selected: isSelected, recommended: route.isRecommended }">
    <button type="button" class="route-select" @click="$emit('select', route.id)">
      <div class="route-head">
        <span class="route-icon" aria-hidden="true">{{ route.icon }}</span>
        <span class="route-name">{{ route.name }}</span>
        <el-tag v-if="route.isRecommended" class="recommended-tag" size="small" round> 오늘의 추천 </el-tag>
      </div>

      <div class="route-stats">
        <span>{{ route.distanceKm.toFixed(1) }}km</span>
        <span class="dot" aria-hidden="true">·</span>
        <span>약 {{ route.estimatedMinutes }}분</span>
        <span class="dot" aria-hidden="true">·</span>
        <span>{{ SHADE_LABEL[route.shadeLevel] }}</span>
      </div>

      <p v-if="route.placeAddress" class="route-address">📍 {{ route.placeAddress }}</p>

      <p v-if="route.exceedsVerdict" class="route-warn">⚠ 지금 판정 가능 시간보다 길어요. 중간에 돌아오는 것도 고려하세요.</p>

      <ul class="route-reasons">
        <li v-for="(r, i) in route.reasons" :key="i">💡 {{ r }}</li>
      </ul>
    </button>

    <a v-if="route.kakaoMapUrl" :href="route.kakaoMapUrl" target="_blank" rel="noopener noreferrer" class="route-kakao-link">
      🗺️ 카카오맵에서 {{ route.placeName }} 길찾기
    </a>
  </div>
</template>

<style scoped>
.recommended-tag {
  background: var(--glass-bg);
  color: var(--color-text);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}
.route-card {
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.route-card.recommended {
  border-color: var(--color-walk-good);
}
.route-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-surface);
}
.route-select {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: inherit;
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
.route-address {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
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
.route-kakao-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
}
.route-kakao-link:hover {
  text-decoration: underline;
}
</style>
