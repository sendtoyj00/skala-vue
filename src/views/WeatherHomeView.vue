<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseDashboardCard from '../components/common/BaseDashboardCard.vue'
import SearchBar from '../components/common/SearchBar.vue'
import WeatherList from '../components/weather/WeatherList.vue'
import WeatherCardSkeleton from '../components/common/WeatherCardSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'
import StatusBar from '../components/common/StatusBar.vue'
import WalkVerdictCard from '../components/walk/WalkVerdictCard.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { isDangerWeather } from '@/domain/weatherRules'
import { assessWalk } from '@/domain/walkRules'

const router = useRouter()
const route = useRoute()
const weatherStore = useWeatherStore()

weatherStore.loadCityWeather()

// --- 마이그레이션 1~2단계 검증용 배치(vue_architecture.md 10절) ---
// 판정 문구가 실제로 쓸모 있는지 확인하는 것이 목적이라 프로필·위치·지면온도를 전부 하드코딩한다.
// 7단계(라우트 재편)에서 전용 WalkHomeView로 옮기고, 여기 있는 임시값들은 그때 각각의
// 정식 자리(dogStore 3단계, domain/groundTemp.js 5단계, 위치 연동 F-10)로 대체된다.
const PLACEHOLDER_DOG = {
  label: '테스트견(단두종·노령·소형)',
  traits: { brachycephalic: true, coatType: 'double', weightClass: 'small', ageClass: 'senior' },
}

// 지면온도 실측 API(기상청_도로기상관측자료, data.go.kr 15159045)는 있지만 고속도로 366개
// 관측점뿐이라 대부분의 위치는 커버되지 않는다(service_architecture.md 4.2). 그 공백을
// 날씨 상태 기반 추정으로 메운다 — domain/groundTemp.js(마이그레이션 5단계)가 생기면
// 이 함수는 삭제하고 그것을 쓴다(실측 우선, 없으면 이 추정으로 폴백하는 이중 구조).
const GROUND_TEMP_OFFSET_BY_STATUS = { 맑음: 25, 구름: 15, 흐림: 8, 비: 2, 바람: 15, 폭우: 2 }
function estimateGroundTempPlaceholder(weather) {
  return weather.temp + (GROUND_TEMP_OFFSET_BY_STATUS[weather.status] ?? 15)
}

const myCityWeather = computed(() => weatherStore.cities[0] ?? null)
const groundTempCelsius = computed(() =>
  myCityWeather.value ? estimateGroundTempPlaceholder(myCityWeather.value) : null,
)
const walkVerdict = computed(() => {
  if (!myCityWeather.value) return null
  return assessWalk({
    weather: myCityWeather.value,
    traits: PLACEHOLDER_DOG.traits,
    groundTempCelsius: groundTempCelsius.value,
  })
})
// --- 검증용 배치 끝 ---

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
    <WalkVerdictCard
      v-if="walkVerdict"
      :verdict="walkVerdict"
      :dog-label="PLACEHOLDER_DOG.label"
      :ground-temp-celsius="groundTempCelsius"
      :air-temp-celsius="myCityWeather.temp"
      :humidity="myCityWeather.humidity"
    />
    <!-- F-30 최소 면책 문구. F-23(산책 판정)과 동시 투입이 원칙이라(service_architecture.md 3.5)
         근거 화면(F-30 상세판) 없이도 판정 카드 옆에는 최소 한 줄을 둔다. 셸 레벨 정식 배치
         (design_architecture.md 3.2)는 마이그레이션 7단계에서 대체한다. -->
    <p v-if="walkVerdict" class="walk-disclaimer">
      🐾 참고용 정보이며 수의학적 진단을 대체하지 않습니다. 개체의 건강 상태는 수의사와 상담하세요.
    </p>

    <div class="search-row">
      <div class="search-col">
        <BaseDashboardCard>
          <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
        </BaseDashboardCard>
      </div>

      <div class="search-col">
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
    </div>

    <p v-if="weatherStore.listStatus === 'success'" class="result-count">
      {{ weatherStore.cities.length }}곳 중 {{ resultCount }}곳 표시
    </p>

    <!-- 이 화면의 최강 강조는 위 WalkVerdictCard 하나다. 목록은 emphasis="muted"로 강등해
         위험 배지·좌측 바가 빨강으로 다시 경쟁하지 않게 한다(design_architecture.md 2.6). -->
    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
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

    <StatusBar message="카드를 클릭하면 상세 날씨로 이동합니다." />
  </div>
</template>

<style scoped>
/* P4 — 최소 대비, 최소 크기. 숨기지는 않는다(design_architecture.md 2.3, service_architecture.md 11절). */
.walk-disclaimer {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin: 0 0 var(--space-3);
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
