<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
// 1. 컴포넌트 파일명 국룰 표기법(PascalCase) 매칭 수입
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherList from './WeatherList.vue'
import StatusBar from './StatusBar.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 40, windSpeed: 30 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 80, windSpeed: 10 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 60, windSpeed: 20 },
  { id: 'city_04', name: '울산', temp: 23, status: '흐림', humidity: 70, windSpeed: 40 },
  { id: 'city_05', name: '경주', temp: 24, status: '바람', humidity: 50, windSpeed: 60 },
  { id: 'city_06', name: '제주', temp: 29, status: '폭우', humidity: 90, windSpeed: 50 },
  { id: 'city_07', name: '대구', temp: 33, status: '맑음', humidity: 40, windSpeed: 15 },
  { id: 'city_08', name: '포항', temp: 27, status: '폭우', humidity: 85, windSpeed: 55 },
])

// 검색어 및 알림창 제어용 데이터
const searchQuery = ref('')
const statusQuery = ref('')
const showDangerOnly = ref(false)
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 기존 핵심 비즈니스 로직(computed, watch)의 소유권은 안전하게 부모 콘텍스트가 격리 유지
const filteredWeatherList = computed(() => {
  const cityQuery = searchQuery.value.trim()
  const weatherQuery = statusQuery.value.trim()

  return weatherList.value.filter((item) => {
    const cityMatch = !cityQuery || item.name.includes(cityQuery)
    const weatherMatch = !weatherQuery || item.status.includes(weatherQuery)
    return cityMatch && weatherMatch
  })
})

// 위험 날씨 필터
const displayWeatherList = computed(() => {
  let result = filteredWeatherList.value

  if (showDangerOnly.value) {
    result = result.filter((item) => item.status === '폭우' || item.windSpeed >= 50 || item.temp >= 30)
  }

  return result
})

watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

// 위험 날씨 필터 상태 감시
watch(showDangerOnly, (newValue) => {
  console.log('⚠️ 위험 날씨 필터:', newValue ? 'ON' : 'OFF')
})

watchEffect(() => {
  console.log(`🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`)
})

const showDetail = (cityName, status, humidity, windSpeed) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다. 습도는 [${humidity}]퍼센트 입니다. 바람세기는 [${windSpeed}]m/s입니다.`)
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
      <div class="list-header">
        <h3>🏙️ 지역별 날씨 현황</h3>

        <label class="danger-filter">
          <input type="checkbox" v-model="showDangerOnly" />
          <span>⚠️ 위험 날씨만 보기</span>
        </label>
      </div>

      <WeatherList :list="displayWeatherList" @select-card="(msg) => (selectedCityInfo = msg)" @click-detail="showDetail" />
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
