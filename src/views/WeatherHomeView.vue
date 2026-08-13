<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseDashboardCard from '../components/common/BaseDashboardCard.vue'
import SearchBar from '../components/common/SearchBar.vue'
import WeatherList from '../components/weather/WeatherList.vue'
import WeatherCardSkeleton from '../components/common/WeatherCardSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'
import StatusBar from '../components/common/StatusBar.vue'
import AdBreakSlot from '../components/common/AdBreakSlot.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useGeolocation } from '@/composables/useGeolocation'
import { haversineKm } from '@/domain/groundTemp'

const router = useRouter()
const route = useRoute()
const weatherStore = useWeatherStore()
const geo = useGeolocation()

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

// [정렬 기준 변경] 이전에는 위험 지역이 상단에 오도록 정렬했다(design_architecture.md 3.1
// 원칙 5). 이번 요청은 "나열 순서 가까운 위치 순"을 명시했으므로 현재 위치(geo.coords, GPS
// 허용 전에는 mock 서울시청 좌표)에서 가까운 도시 순으로 바꾼다 — 위험 배지(⚠ 위험)는 카드에
// 계속 표시되니 위험 정보 자체가 사라지진 않는다, 다만 목록 순서의 우선순위 축이 바뀐다.
const filteredWeatherList = computed(() => {
  const cityQuery = searchQuery.value.trim()
  const weatherQuery = statusQuery.value.trim()
  const { lat, lon } = geo.coords.value

  return weatherStore.cities
    .filter((item) => {
      const cityMatch = !cityQuery || item.name.includes(cityQuery)
      const weatherMatch = !weatherQuery || item.status.includes(weatherQuery)
      return cityMatch && weatherMatch
    })
    .slice()
    .sort((a, b) => {
      const distA = a.lat != null && a.lon != null ? haversineKm(lat, lon, a.lat, a.lon) : Infinity
      const distB = b.lat != null && b.lon != null ? haversineKm(lat, lon, b.lat, b.lon) : Infinity
      return distA - distB
    })
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
    <p class="page-eyebrow">Weather · P2·P3</p>
    <h1 class="page-title">🌦️ 날씨 현황</h1>
    <p class="downgrade-note">
      산책 판정은 <RouterLink to="/">판정 홈</RouterLink>에서 확인하세요. 여기서는 지역별 날씨를
      찾아볼 수 있어요.
    </p>

    <div class="search-row">
      <div class="search-col">
        <BaseDashboardCard>
          <SearchBar
            input-id="search-city"
            :current-query="searchQuery"
            @update-query="(val) => (searchQuery = val)"
          />
        </BaseDashboardCard>
      </div>

      <div class="search-col">
        <BaseDashboardCard>
          <SearchBar
            input-id="search-status"
            label="🌤️ 날씨 상태 검색"
            placeholder="예: 맑음, 비, 폭우"
            hint-label="검색 중인 날씨:"
            :current-query="statusQuery"
            @update-query="(val) => (statusQuery = val)"
          />
        </BaseDashboardCard>
      </div>
    </div>

    <p v-if="weatherStore.listStatus === 'success'" class="result-count">
      {{ weatherStore.cities.length }}곳 중 {{ resultCount }}곳 표시
    </p>

    <!-- 이 화면의 최강 강조 요소인 WalkVerdictCard는 WalkHomeView(/)로 옮겨갔다. 여기 목록은
         emphasis="muted"로 유지해 위험 배지·좌측 바가 빨강으로 과하게 도드라지지 않게 한다
         (design_architecture.md 2.6). -->
    <BaseDashboardCard>
      <WeatherCardSkeleton v-if="weatherStore.listStatus === 'loading'" />
      <ErrorState
        v-else-if="weatherStore.listStatus === 'error'"
        message="날씨 정보를 불러오지 못했습니다."
        @retry="weatherStore.refreshCityWeather()"
      />
      <template v-else>
        <WeatherList :list="filteredWeatherList" emphasis="muted" @request-detail="handleDetailRequest" />
        <button v-if="resultCount === 0" class="reset-btn" @click="handleClearSearch">검색 조건 초기화</button>
      </template>
    </BaseDashboardCard>

    <!-- 광고 허용 구역(service_architecture.md 10절 — "지역 목록"은 허용, 화면당 최대 1개).
         판정 화면(WalkHomeView)에는 이 컴포넌트를 절대 두지 않는다. -->
    <AdBreakSlot />

    <StatusBar message="카드를 클릭하면 상세 날씨로 이동합니다." />
  </div>
</template>

<style scoped>
.downgrade-note {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin: 0 0 var(--space-3);
}
.downgrade-note a {
  color: var(--color-info);
}

/* 탐색 도구는 결과보다 작게, 한 줄로 압축한다(design_architecture.md 3.1 원칙 2).
   모바일은 세로 스택, 640px 이상에서 가로 2단으로 전환한다(7절 반응형 기준). */
.search-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.search-col :deep(.base-dashboard-card) {
  margin-bottom: 0;
  height: 100%;
}
@media (min-width: 640px) {
  .search-row {
    flex-direction: row;
    align-items: stretch;
  }
  .search-col {
    flex: 1;
  }
}
.result-count {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: var(--space-1) 0 var(--space-3);
}
.reset-btn {
  display: block;
  margin: var(--space-2) auto 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
</style>
