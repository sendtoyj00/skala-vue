<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WeatherBadge from '../components/weather/WeatherBadge.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'
import { isDangerWeather } from '@/domain/weatherRules'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()
const { formatTemp, unitSymbol } = useTemperature()

weatherStore.loadCityWeather()

// cityId 파라미터 변화에 반응한다(onMounted 1회 조회가 아님 — vue_architecture.md 8.6).
const cityData = computed(() => weatherStore.findCityById(route.params.cityId))
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="detail-container">
      <button @click="router.push('/')" class="back-btn">← 메인 대시보드로 돌아가기</button>

      <template v-if="cityData">
        <div v-if="isDangerWeather(cityData)" class="danger-banner">
          <WeatherBadge :city-item="cityData" />
        </div>

        <h4 class="city-name">📍 {{ cityData.name }}</h4>
        <p class="status-label">{{ cityData.status }}</p>
        <p class="temp-value">{{ formatTemp(cityData.temp) }}{{ unitSymbol }}</p>

        <div class="info-card">
          <div class="info-row"><span class="info-label">습도</span><span>{{ cityData.humidity }}%</span></div>
          <div class="info-row"><span class="info-label">풍속</span><span>{{ cityData.windSpeed }}m/s</span></div>
        </div>
      </template>
      <div v-else class="not-found">
        <p>요청하신 지역의 날씨 정보를 찾을 수 없습니다. 지역 목록에서 다시 선택해 주세요.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.back-btn {
  display: block;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.danger-banner {
  margin-bottom: 12px;
}
.city-name {
  margin: 0;
}
.status-label {
  color: #6c757d;
  margin: 4px 0;
}
.temp-value {
  font-size: 32px;
  font-weight: bold;
  margin: 8px 0;
}
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}
.info-label {
  color: #6c757d;
}
.not-found {
  padding: 16px 0;
}
</style>
