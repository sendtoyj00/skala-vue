<script setup>
import WeatherBadge from './WeatherBadge.vue'
import { useTemperature } from '@/composables/useTemperature'
import { isDangerWeather } from '@/domain/weatherRules'

defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

// 상세보기 = cityId 하나만 전달한다. 카드 전체 클릭이 곧 상세 이동이다 (service_architecture.md 5.3, vue_architecture.md 7.3).
const emit = defineEmits(['request-detail'])

const { formatTemp, unitSymbol } = useTemperature()
</script>

<template>
  <div class="weather-card" :class="{ danger: isDangerWeather(cityItem) }" @click="emit('request-detail', cityItem.id)">
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

    <WeatherBadge :city-item="cityItem" />
  </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}
.weather-card.danger {
  border-left: 4px solid #d91010;
}
.danger-flag {
  font-size: 12px;
  color: #d91010;
  font-weight: bold;
  margin-bottom: 4px;
}
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.city-name {
  font-weight: bold;
  margin: 0;
}
.status-label {
  color: #6c757d;
}
.temp-value {
  font-size: 28px;
  font-weight: bold;
  margin: 4px 0;
}
.card-metrics {
  display: flex;
  gap: 16px;
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
}
.metric-label {
  color: #adb5bd;
}
</style>
