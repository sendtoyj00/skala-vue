<script setup>
// 위험/추천 배지 전용 컴포넌트. 판정·추천 로직은 src/domain/weatherRules.js 단일 출처를 그대로 렌더링만 한다.
// (vue_architecture.md 5.3 — 판정을 템플릿에서 다시 계산하지 않는다)
import { getWeatherAdvice, isDangerWeather } from '@/domain/weatherRules'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  // 카드류 공용 강조 계약(WeatherCard.vue와 동일 prop) — 화면당 최강 강조는 1개뿐이라는
  // 규칙을 화면마다 손으로 지키는 대신 컴포넌트가 스스로 지키게 한다(design_architecture.md 2.6).
  // 'muted'면 위험 배지도 badge-safe와 같은 무채색 텍스트로 강등된다 — 이 화면의 최강 강조가
  // 다른 요소(예: WalkVerdictCard)에게 있다는 뜻이기 때문이다.
  emphasis: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'muted'].includes(value),
  },
})
</script>

<template>
  <div class="badge-row">
    <span
      v-for="advice in getWeatherAdvice(props.cityItem)"
      :key="advice.text"
      class="badge"
      :class="props.emphasis === 'muted' || !isDangerWeather(props.cityItem) ? 'badge-safe' : 'badge-danger'"
      >{{ advice.icon }} {{ advice.text }}</span
    >
  </div>
</template>

<style scoped>
/* 배경 채움은 위험(P0)에만 쓴다. 안전 상태는 텍스트로 강등해 두 성격이 같은 시각 강도를
   갖지 않게 한다 (design_architecture.md 2절 파생 규칙 1, 6절). */
.badge-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.badge {
  display: inline-block;
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  width: fit-content;
}
.badge-danger {
  background: var(--color-danger);
  color: var(--color-on-danger);
  font-weight: 700;
}
.badge-safe {
  background: transparent;
  color: var(--color-text-muted);
  padding-left: 0;
  padding-right: 0;
}
</style>
