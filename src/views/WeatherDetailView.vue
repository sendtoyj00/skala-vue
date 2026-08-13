<script setup>
import { computed, watch } from 'vue'
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

// F-12(P1) 대기질. 상세 화면은 "판정 근거 확인 용도"라 원시 수치를 그대로 보여준다
// (service_architecture.md 3.3 — 판정에 쓰이지 않는 값이라도 근거 확인 화면에는 노출 가능).
// cityData(계산값)를 감시한다 — route.params만 보면 loadCityWeather()가 아직 비동기로 응답하기
// 전(lat/lon 미확보 상태)에 한 번 실행되고 끝나 대기질이 영영 안 뜨는 경합이 생긴다.
watch(
  cityData,
  (city) => {
    if (city?.lat != null && city?.lon != null) weatherStore.loadAirQuality(city.id)
  },
  { immediate: true },
)
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="detail-container">
      <button @click="router.push('/weather')" class="back-btn">← 지역 목록으로 돌아가기</button>

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

        <p class="page-eyebrow">Weather · P3</p>
        <h4 class="city-name">📍 {{ cityData.name }}</h4>
        <p class="status-label">{{ cityData.status }}</p>
        <p class="temp-value metric">{{ formatTemp(cityData.temp) }}{{ unitSymbol }}</p>

        <div class="info-card">
          <div class="info-row"><span class="info-label">습도</span><span class="metric">{{ cityData.humidity }}%</span></div>
          <div class="info-row"><span class="info-label">풍속</span><span class="metric">{{ cityData.windSpeed }}m/s</span></div>
          <div v-if="weatherStore.airQuality" class="info-row">
            <span class="info-label">대기질(사람 기준 AQI)</span>
            <span class="metric">{{ weatherStore.airQuality.aqi }}단계 · PM2.5 {{ weatherStore.airQuality.pm2_5 }}㎍/㎥</span>
          </div>
        </div>
        <p v-if="weatherStore.airQuality" class="aqi-note">
          🐾 개 기준 등급 환산 기준은 아직 정해지지 않았습니다(사람 기준 수치입니다).
        </p>
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
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}
.back-btn {
  display: inline-block;
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: var(--font-size-sm);
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
.aqi-note {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin: 0;
}
</style>
