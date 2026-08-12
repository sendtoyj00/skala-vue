<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherList from '../components/exercise/WeatherList.vue'
import StatusBar from '../components/exercise/StatusBar.vue'
import { weatherMockList } from '../components/exercise/weatherMockData'

const router = useRouter()
const route = useRoute()

const weatherList = ref(weatherMockList)

const searchQuery = ref('')
const statusQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 초기 마운트 시 주소창의 쿼리(?search=&status=) 스트링 읽어서 상태 복원 (KeepAlive를 적용해야만 동작함)
onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  if (route.query.status) {
    statusQuery.value = route.query.status
  }
})

// 타이핑될 때마다 주소창의 쿼리 스트링 값을 실시간 푸시 개편 (현재 큰 의미없음)
watch([searchQuery, statusQuery], ([newSearch, newStatus]) => {
  router.push({
    path: route.path,
    query: { search: newSearch || undefined, status: newStatus || undefined },
  })
})

const filteredWeatherList = computed(() => {
  const cityQuery = searchQuery.value.trim()
  const weatherQuery = statusQuery.value.trim()

  return weatherList.value.filter((item) => {
    const cityMatch = !cityQuery || item.name.includes(cityQuery)
    const weatherMatch = !weatherQuery || item.status.includes(weatherQuery)
    return cityMatch && weatherMatch
  })
})

// 자식 카드 컴포넌트의 상세보기 신호를 받으면 해당 ID 주소로 라우터 점프 실행
const handleDetailJump = (id) => {
  router.push(`/weather/${id}`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <SearchBar
        label="🌤️ 날씨 상태 검색"
        placeholder="예: 맑음, 비, 폭우"
        hint-label="검색 중인 날씨:"
        :current-query="statusQuery"
        @update-query="(val) => (statusQuery = val)"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
      <WeatherList :list="filteredWeatherList" @select-card="(msg) => (selectedCityInfo = msg)" @click-detail="(name, status, humidity, windSpeed, id) => handleDetailJump(id)" />
    </BaseDashboardCard>

    <StatusBar :message="selectedCityInfo" />
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 600px;
  margin: 0 auto;
}
</style>
