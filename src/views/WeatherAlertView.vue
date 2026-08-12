<script setup>
import { useRouter } from 'vue-router'

import BaseDashboardCard from '../components/common/BaseDashboardCard.vue'
import WeatherList from '../components/weather/WeatherList.vue'
import WeatherCardSkeleton from '../components/common/WeatherCardSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'
import StatusBar from '../components/common/StatusBar.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { DANGER_WIND_SPEED, DANGER_TEMP } from '@/domain/weatherRules'

const router = useRouter()
const weatherStore = useWeatherStore()

weatherStore.loadCityWeather()

const handleDetailRequest = (cityId) => {
  router.push({ name: 'WeatherDetail', params: { cityId } })
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <h3>⚠️ 위험 날씨 경보</h3>
      <p class="alert-desc">폭우 · 강풍({{ DANGER_WIND_SPEED }}m/s 이상) · 폭염({{ DANGER_TEMP }}도 이상) 지역만 모아 보여줍니다.</p>
      <WeatherCardSkeleton v-if="weatherStore.listStatus === 'loading'" />
      <ErrorState
        v-else-if="weatherStore.listStatus === 'error'"
        message="경보 정보를 불러오지 못했습니다."
        @retry="weatherStore.refreshCityWeather()"
      />
      <WeatherList v-else :list="weatherStore.dangerCityList" @request-detail="handleDetailRequest" />
    </BaseDashboardCard>

    <StatusBar message="카드를 클릭하면 상세 날씨로 이동합니다." />
  </div>
</template>

<style scoped>
.alert-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: var(--space-1) 0 var(--space-3);
}
</style>
