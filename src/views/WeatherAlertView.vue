<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import WeatherList from '../components/exercise/WeatherList.vue'
import StatusBar from '../components/exercise/StatusBar.vue'
import { weatherMockList, isDangerWeather } from '../components/exercise/weatherMockData'

const router = useRouter()

const selectedCityInfo = ref('카드를 클릭하거나 상세보기를 눌러보세요.')

// 폭우 / 강풍(60m/s 이상) / 폭염(30도 이상) 조건에 해당하는 지역만 별도 페이지로 분리
const dangerWeatherList = computed(() => weatherMockList.filter(isDangerWeather))

const handleDetailJump = (id) => {
  router.push(`/weather/${id}`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <h3>⚠️ 위험 날씨 경보</h3>
      <p class="alert-desc">폭우 · 강풍(60m/s 이상) · 폭염(30도 이상) 지역만 모아 보여줍니다.</p>
      <WeatherList
        :list="dangerWeatherList"
        @select-card="(msg) => (selectedCityInfo = msg)"
        @click-detail="(name, status, humidity, windSpeed, id) => handleDetailJump(id)"
      />
    </BaseDashboardCard>

    <StatusBar :message="selectedCityInfo" />
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 600px;
  margin: 0 auto;
}
.alert-desc {
  color: #c0392b;
  font-size: 14px;
  margin: 4px 0 12px;
}
</style>
