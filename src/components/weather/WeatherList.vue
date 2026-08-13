<script setup>
// 날씨 목록 전용 컴포넌트: 리스트 순회 + 빈 결과 상태를 함께 책임진다
import WeatherCard from './WeatherCard.vue'

defineProps({
  list: {
    type: Array,
    required: true,
  },
  // WeatherCard로 그대로 전달하는 공용 강조 계약(WeatherCard.vue 참조).
  emphasis: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'muted'].includes(value),
  },
})

defineEmits(['request-detail'])
</script>

<template>
  <div>
    <!-- 도시별 카드 그리드 — 참고 대시보드처럼 카드가 세로로 쌓이지 않고 격자로 펼쳐진다.
         화면 폭에 따라 열 수가 자동으로 늘고 준다(auto-fill). -->
    <div class="weather-grid">
      <WeatherCard v-for="item in list" :key="item.id" :city-item="item" :emphasis="emphasis" @request-detail="$emit('request-detail', $event)" />
    </div>

    <p v-if="list.length === 0" class="empty-state">😭 조건에 맞는 결과가 없습니다.</p>
  </div>
</template>

<style scoped>
.weather-grid {
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));

  gap: var(--space-5);

  align-items: stretch;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 180px;

  margin: 0;

  color: var(--color-text-muted);

  background: var(--color-surface);

  border: 1px dashed var(--color-border);

  border-radius: var(--radius-lg);

  font-size: var(--font-size-sm);
}
</style>
