<script setup>
import { useRouter } from 'vue-router'

import BaseDashboardCard from '../components/common/BaseDashboardCard.vue'
import WeatherList from '../components/weather/WeatherList.vue'
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
      <WeatherList :list="weatherStore.dangerCityList" @request-detail="handleDetailRequest" />
    </BaseDashboardCard>

    <StatusBar message="카드를 클릭하면 상세 날씨로 이동합니다." />
  </div>
</template>

<style scoped>
.alert-desc {
  color: #6c757d;
  font-size: 14px;
  margin: 4px 0 12px;
}
</style>
