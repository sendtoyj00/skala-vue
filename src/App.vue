<script setup>
// 앱 셸. 좌측 사이드바(T1 전역 내비 아이콘 레일) + 상단 topbar(T2 검색·대상 개체 표시) +
// RouterView 1개 + 푸터(P4)로 구성한다. 대상 개체 표시를 topbar에 두는 이유: 다견 가정에서
// 어느 아이 기준 판정인지 모르면 판정 전체를 신뢰할 수 없다(service_architecture.md 4.7) —
// 화면마다 반복하지 않고 셸에 한 번만 둔다.
import { computed, watchEffect } from 'vue'
import UnitToggler from './components/weather/UnitToggler.vue'
import DogSelector from './components/dog/DogSelector.vue'
import NavSearch from './components/common/NavSearch.vue'
import NavIcon from './components/common/NavIcon.vue'
import WeatherEffectLayer from './components/common/WeatherEffectLayer.vue'
import { useConfigStore } from './stores/configStore'
import { useDogStore } from './stores/dogStore'
import { useWalkLogStore } from './stores/walkLogStore'
import { useWeatherStore } from './stores/weatherStore'
import { MY_CITY_ID } from './composables/useWalkVerdict'
import { getWeatherMood } from './domain/weatherRules'

// 영속 상태 복원은 셸에서 한 번만 한다 — 화면마다 각자 복원하면 순서 경쟁이 생긴다.
useConfigStore().restoreUnit()
useDogStore().restoreDogs()
useWalkLogStore().restoreLogs()

// 날씨 연동 파스텔 테마 — 폴백 도시(city_01) 관측값으로 무드를 정하고 :root[data-weather]에
// 매긴다(base.css의 [data-weather] 블록이 실제 색을 정의). 셸에서 한 번만 구독해 어느
// 화면에서도 같은 무드가 유지되게 한다. loadCityWeather는 idempotent라 WalkHomeView 등이
// 이미 호출했어도 중복 조회하지 않는다.
//
// [색상 번쩍임 방지] index.html의 인라인 스크립트가 localStorage에 저장된 마지막 무드를
// 페인트 전에 이미 적용해 뒀다. 여기서는 API 응답 전(item이 아직 null)에는 data-weather를
// 건드리지 않는다 — getWeatherMood(null)의 폴백값('cloudy')으로 캐시된 실제 무드를
// 덮어써버리면 매 새로고침마다 흐림 색으로 번쩍였다가 실제 무드로 다시 바뀌는 동일한
// 문제가 재발한다. 응답이 오면 그 값으로 갱신하고 다음 방문을 위해 캐시도 갱신한다.
const WEATHER_MOOD_CACHE_KEY = 'walssi:lastWeatherMood'
const weatherStore = useWeatherStore()
weatherStore.loadCityWeather()
const weatherMood = computed(() => {
  // 내 위치 날씨가 있으면 내 위치를 우선 사용
  if (weatherStore.myLocationWeather) {
    return getWeatherMood(weatherStore.myLocationWeather)
  }

  // 내 위치 데이터가 아직 없으면 기존 기본 도시 사용
  const city = weatherStore.findCityById(MY_CITY_ID)
  return city ? getWeatherMood(city) : null
})
watchEffect(() => {
  if (!weatherMood.value) return
  document.documentElement.dataset.weather = weatherMood.value
  localStorage.setItem(WEATHER_MOOD_CACHE_KEY, weatherMood.value)
})

const NAV_ITEMS = [
  { to: '/', icon: 'paw', label: '오늘 산책' },
  { to: '/dogs', icon: 'dog', label: '댕댕이들' },
  { to: '/weather', icon: 'cloud', label: '동네 날씨' },
  { to: '/weather/alerts', icon: 'alert', label: '산책 주의보' },
  { to: '/walks', icon: 'book', label: '산책 다이어리' },
  { to: '/about', icon: 'leaf', label: '왈씨 이야기' },
]
</script>

<template>
  <WeatherEffectLayer :mood="weatherMood" />
  <div class="app-shell">
    <aside class="app-sidebar">
      <RouterLink to="/" class="brand">
        <span class="brand-mark glass-surface" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="26" height="26">
            <ellipse cx="20" cy="28" rx="10" ry="8" fill="currentColor" />
            <ellipse cx="7" cy="17" rx="4.2" ry="5.2" fill="currentColor" />
            <ellipse cx="15.5" cy="9" rx="4.6" ry="5.6" fill="currentColor" />
            <ellipse cx="24.5" cy="9" rx="4.6" ry="5.6" fill="currentColor" />
            <ellipse cx="33" cy="17" rx="4.2" ry="5.2" fill="currentColor" />
          </svg>
        </span>
        <span class="brand-text">
          <span class="brand-name">왈씨</span>
          <span class="brand-sub">Walssi</span>
        </span>
      </RouterLink>

      <nav class="sidebar-nav" aria-label="주요 메뉴">
        <RouterLink v-for="item in NAV_ITEMS" :key="item.to" :to="item.to" class="sidebar-nav-item">
          <span class="sidebar-nav-item-icon"><NavIcon :name="item.icon" :size="20" /></span>
          <span class="sidebar-nav-item-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <span class="sidebar-spacer" aria-hidden="true"></span>
    </aside>

    <div class="app-content">
      <div class="app-topbar">
        <div class="app-topbar-inner">
          <NavSearch />

          <div class="topbar-tools">
            <DogSelector />
            <span class="tools-divider" aria-hidden="true"></span>
            <UnitToggler />
          </div>
        </div>
      </div>

      <main>
        <RouterView />
      </main>

      <!-- 셸 레벨 면책·출처 안내(P4) — 판정 대상이 동물이라 오독 비용이 크다(service_architecture.md
           11절). 크기는 최소이되 숨기지 않는다(design_architecture.md 2.3). -->
      <footer class="app-footer">
        <div class="footer-inner">
          <p class="footer-brand">🐾 왈씨 Walssi</p>
          <p class="footer-disclaimer">이 서비스는 참고용 정보를 제공하며 수의학적 진단을 대체하지 않습니다. 개체의 건강 상태는 수의사와 상담하세요.</p>
          <p class="footer-source">
            현재 날씨·예보·대기질은 OpenWeatherMap, 노면 실측온도는 기상청 도로기상관측자료를 사용합니다. 실측 관측점이 없는 지역은 기온과 일사 조건으로 지면온도를 추정해 표시합니다.
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
@import '@/assets/layout.css';
</style>
