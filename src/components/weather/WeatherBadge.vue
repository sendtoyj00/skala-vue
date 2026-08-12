<script setup>
// 위험/추천 배지 전용 컴포넌트. 판정·추천 로직은 src/domain/weatherRules.js 단일 출처를 그대로 렌더링만 한다.
// (vue_architecture.md 5.3 — 판정을 템플릿에서 다시 계산하지 않는다)
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
    <span v-for="advice in getWeatherAdvice(props.cityItem)" :key="advice.text" class="badge">{{ advice.icon }} {{ advice.text }}</span>
  </div>
</template>

<style scoped>
.badge-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.badge {
  display: inline-block;
  background: #f1f2f6;
  color: #2c3e50;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  width: fit-content;
}
</style>
