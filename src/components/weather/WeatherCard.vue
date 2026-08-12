<script setup>
import WeatherBadge from './WeatherBadge.vue'
import { useTemperature } from '@/composables/useTemperature'
import { isDangerWeather } from '@/domain/weatherRules'

defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  // 카드류 공용 강조 계약. WeatherList → WeatherCard → WeatherBadge로 그대로 흘려보낸다.
  // 'muted'면 이 카드의 위험 표시가 화면의 최강 강조가 아니라는 뜻이다(design_architecture.md 2.6).
  emphasis: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'muted'].includes(value),
  },
})

// 상세보기 = cityId 하나만 전달한다. 카드 전체 클릭이 곧 상세 이동이다 (service_architecture.md 5.3, vue_architecture.md 7.3).
const emit = defineEmits(['request-detail'])

const { formatTemp, unitSymbol } = useTemperature()
</script>

<template>
  <div
    class="weather-card"
    :class="{ danger: isDangerWeather(cityItem), muted: emphasis === 'muted' }"
    @click="emit('request-detail', cityItem.id)"
  >
    <div v-if="isDangerWeather(cityItem)" class="danger-flag">⚠ 위험</div>

    <div class="card-head">
      <h4 class="city-name">{{ cityItem.name }}</h4>
      <span class="status-label">{{ cityItem.status }}</span>
    </div>

    <p class="temp-value">{{ formatTemp(cityItem.temp) }}{{ unitSymbol }}</p>

    <div class="card-metrics">
      <span><span class="metric-label">습도</span> {{ cityItem.humidity }}%</span>
      <span><span class="metric-label">바람</span> {{ cityItem.windSpeed }}m/s</span>
    </div>

    <WeatherBadge :city-item="cityItem" :emphasis="emphasis" />
  </div>
</template>

<style scoped>
.weather-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
}
.weather-card.danger {
  border-left: 4px solid var(--color-danger);
}
.weather-card.danger.muted {
  border-left-color: var(--color-text-muted);
}
.danger-flag {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  font-weight: bold;
  margin-bottom: var(--space-1);
}
.weather-card.muted .danger-flag {
  color: var(--color-text-muted);
}
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.city-name {
  font-size: var(--font-size-md);
  font-weight: 700;
  margin: 0;
}
.status-label {
  color: var(--color-text-muted);
}
.temp-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: var(--space-1) 0;
}
.card-metrics {
  display: flex;
  gap: var(--space-4);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2);
}
.metric-label {
  color: var(--color-text-muted);
}
</style>
