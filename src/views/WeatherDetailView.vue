<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WeatherBadge from '../components/weather/WeatherBadge.vue'
import WeatherCardSkeleton from '../components/common/WeatherCardSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'
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

      <WeatherCardSkeleton v-if="weatherStore.listStatus === 'loading'" :count="1" />
      <ErrorState
        v-else-if="weatherStore.listStatus === 'error'"
        message="날씨 정보를 불러오지 못했습니다."
        @retry="weatherStore.refreshCityWeather()"
      />
      <template v-else-if="cityData">
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
  background: var(--color-surface);
  padding: var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.back-btn {
  display: block;
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.danger-banner {
  margin-bottom: var(--space-3);
}
.city-name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
}
.status-label {
  color: var(--color-text-muted);
  margin: var(--space-1) 0;
}
.temp-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: var(--space-2) 0;
}
.info-card {
  background: var(--color-surface-sunken);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin: var(--space-4) 0;
  border: 1px solid var(--color-border);
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-1) 0;
}
.info-label {
  color: var(--color-text-muted);
}
.not-found {
  padding: var(--space-4) 0;
  color: var(--color-text);
}
</style>
