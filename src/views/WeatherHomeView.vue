<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseDashboardCard from '../components/common/BaseDashboardCard.vue'
import SearchBar from '../components/common/SearchBar.vue'
import WeatherList from '../components/weather/WeatherList.vue'
import StatusBar from '../components/common/StatusBar.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { isDangerWeather } from '@/domain/weatherRules'

const router = useRouter()
const route = useRoute()
const weatherStore = useWeatherStore()

weatherStore.loadCityWeather()

// 검색어는 로컬 ref가 원본이고 URL은 사본이다. 초기값은 setup 시점에 route.query에서 한 번만 읽는다
// (vue_architecture.md 8.4 — onMounted가 아니라 setup 본문에서, KeepAlive 불필요).
const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
const statusQuery = ref(typeof route.query.status === 'string' ? route.query.status : '')

// 타이핑이 멎은 뒤 300ms 후에만 URL에 반영한다. replace를 써서 히스토리를 쌓지 않는다.
let debounceTimer = null
watch([searchQuery, statusQuery], ([newSearch, newStatus]) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    router.replace({
      path: route.path,
      query: { search: newSearch || undefined, status: newStatus || undefined },
    })
  }, 300)
})
onBeforeUnmount(() => clearTimeout(debounceTimer))

// 위험 지역이 목록 상단에 오도록 정렬한다(design_architecture.md 3.1 원칙 5).
const filteredWeatherList = computed(() => {
  const cityQuery = searchQuery.value.trim()
  const weatherQuery = statusQuery.value.trim()

  return weatherStore.cities
    .filter((item) => {
      const cityMatch = !cityQuery || item.name.includes(cityQuery)
      const weatherMatch = !weatherQuery || item.status.includes(weatherQuery)
      return cityMatch && weatherMatch
    })
    .slice()
    .sort((a, b) => Number(isDangerWeather(b)) - Number(isDangerWeather(a)))
})

const resultCount = computed(() => filteredWeatherList.value.length)

const handleClearSearch = () => {
  searchQuery.value = ''
  statusQuery.value = ''
}

// 카드 클릭 시 cityId 하나만 받아 바로 상세로 이동한다(service_architecture.md 5.3 결정 1).
const handleDetailRequest = (cityId) => {
  router.push({ name: 'WeatherDetail', params: { cityId } })
}
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="search-row">
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
    </div>

    <p class="result-count">8곳 중 {{ resultCount }}곳 표시</p>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
      <WeatherList :list="filteredWeatherList" @request-detail="handleDetailRequest" />
      <button v-if="resultCount === 0" class="reset-btn" @click="handleClearSearch">검색 조건 초기화</button>
    </BaseDashboardCard>

    <StatusBar message="카드를 클릭하면 상세 날씨로 이동합니다." />
  </div>
</template>

<style scoped>
.search-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.result-count {
  color: #6c757d;
  font-size: 14px;
  margin: 4px 0 12px;
}
.reset-btn {
  display: block;
  margin: 8px auto 0;
  padding: 6px 12px;
  cursor: pointer;
}
</style>
