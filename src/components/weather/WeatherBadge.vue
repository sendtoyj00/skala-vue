<script setup>
// 날씨 상태 표시 전용 컴포넌트(판단 문구 없음). 텍스트는 src/domain/weatherRules.js 단일
// 출처를 그대로 렌더링만 한다(vue_architecture.md 5.3 — 판정을 템플릿에서 다시 계산하지 않는다).
// 배경 채움을 쓰지 않는다 — 화면에서 배경이 채워진 요소는 WalkVerdictCard 하나뿐이어야
// 한다(design_architecture.md 2.6, 4.2, 4.6). 위험 신호는 WeatherCard의 좌측 테두리/플래그가
// 맡는다(design_architecture.md 4.7) — 이 배지는 색만으로 위험을 주장하지 않는다.
import { getWeatherAdvice } from '@/domain/weatherRules'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="badge-row">
    <span v-for="advice in getWeatherAdvice(props.cityItem)" :key="advice.text" class="badge">
      {{ advice.icon }} {{ advice.text }}
    </span>
  </div>
</template>

<style scoped>
.badge-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.badge {
  display: inline-block;
  padding-left: 0;
  padding-right: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  width: fit-content;
}
</style>
