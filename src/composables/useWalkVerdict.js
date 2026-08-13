// weather × dog 결합. vue_architecture.md 5.2가 채택한 (e)안 — 판정 Store를 만들지 않고
// composable이 두 Store(weatherStore, dogStore)를 구독해 결합한다.
//
//   weatherStore.cities ┐
//   dogStore.activeDog  ┼→ useWalkVerdict() → computed<WalkVerdict> → WalkVerdictCard(props)
//   domain/groundTemp   ┘
//
// dogStore가 생기기 전까지는 WalkHomeView.vue의 로컬 computed가 이 역할을 임시로 맡고
// 있었다(PLACEHOLDER_DOG). 이 파일은 그 배선을 정식 composable로 승격한다 — WalkHomeView의
// 로컬 결합 코드는 삭제된다(vue_architecture.md 5.1).
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weatherStore'
import { useDogStore } from '@/stores/dogStore'
import { useGeolocation } from './useGeolocation'
import { useGroundTemp } from './useGroundTemp'
import { assessWalk } from '@/domain/walkRules'
import { estimateGroundTemp } from '@/domain/groundTemp'

// [실측 위치 연동] 이전엔 "도시 마스터의 첫 항목을 내 동네로 고정"하는 잠정 처리였다.
// useGeolocation()으로 좌표(처음엔 mock, 사용자가 허용하면 실측)를 얻어 lat/lon 쿼리로
// 직접 조회한다 — city_01(서울)은 좌표 조회가 실패했을 때만 쓰는 최종 폴백으로 격하한다.
const MY_CITY_ID = 'city_01'

// "오늘" 라벨과 맞추기 위해 향후 24시간(3시간 간격 8개)만 본다(F-26, WalkHomeView.vue 이력 승계).
const UPCOMING_WINDOW_COUNT = 8

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function useWalkVerdict() {
  const weatherStore = useWeatherStore()
  const dogStore = useDogStore()
  const {
    cities,
    forecast,
    forecastStatus,
    myLocationWeather,
    myLocationForecast,
    myLocationStatus,
    myLocationAirQuality,
  } = storeToRefs(weatherStore)

  const geo = useGeolocation()

  weatherStore.loadCityWeather() // 폴백(서울)·지역 목록 화면의 데이터 원천은 그대로 유지
  weatherStore.loadForecast(MY_CITY_ID)
  weatherStore.loadMyLocationWeather(geo.coords.value.lat, geo.coords.value.lon)
  weatherStore.loadMyLocationForecast(geo.coords.value.lat, geo.coords.value.lon)
  weatherStore.loadMyLocationAirQuality(geo.coords.value.lat, geo.coords.value.lon)

  // mock → 실측 좌표로 바뀌면(geo.requestLocation() 이후) 위치 날씨를 다시 조회한다.
  watch(geo.coords, (next) => {
    weatherStore.loadMyLocationWeather(next.lat, next.lon)
    weatherStore.loadMyLocationForecast(next.lat, next.lon)
    weatherStore.loadMyLocationAirQuality(next.lat, next.lon)
  })

  const activeDog = computed(() => dogStore.activeDog)

  const cityFallbackWeather = computed(() => cities.value.find((c) => c.id === MY_CITY_ID) ?? null)

  // 좌표 기반 조회가 성공하면 우선 사용하고, 실패·로딩 중이면 도시 마스터 폴백으로 대체한다
  // (design_architecture.md 6.4 — 부분 실패는 조용히 폴백, 화면을 막지 않는다).
  const myCityWeather = computed(() => myLocationWeather.value ?? cityFallbackWeather.value)

  const usingLiveLocation = computed(() => geo.source.value === 'gps' && myLocationStatus.value === 'success')

  const coords = computed(() =>
    myCityWeather.value ? { lat: myCityWeather.value.lat, lon: myCityWeather.value.lon } : null,
  )
  const { groundTemp } = useGroundTemp(myCityWeather, coords)

  // 프로필 없을 때 범용 판정을 보여주지 않는다(service_architecture.md 4.6) — activeDog가
  // 없으면 verdict 자체를 만들지 않는다. 맞춤이 아닌 판정을 맞춤인 것처럼 보이면 사용자가
  // 자기 개에게 맞는 답이라고 오해할 수 있다.
  const verdict = computed(() => {
    if (!myCityWeather.value || !groundTemp.value || !activeDog.value) return null
    return assessWalk({
      weather: myCityWeather.value,
      traits: activeDog.value.traits,
      groundTempCelsius: groundTemp.value.celsius,
      airQuality: myLocationAirQuality.value,
    })
  })

  // 시간대별 산책 적합도(F-26). 미래 시점은 실측 노면온도가 없으므로 추정만 쓴다.
  // 위치 예보가 있으면 그걸, 없으면 도시 폴백 예보를 쓴다(위 myCityWeather와 같은 원칙).
  const activeForecast = computed(() =>
    myLocationForecast.value.length > 0 ? myLocationForecast.value : forecast.value,
  )
  const forecastWindows = computed(() => {
    if (!activeDog.value) return []
    return activeForecast.value.slice(0, UPCOMING_WINDOW_COUNT).map((entry) => {
      const hour = new Date(entry.at).getHours()
      const groundTempCelsius = estimateGroundTemp(entry, hour)
      const v = assessWalk({ weather: entry, traits: activeDog.value.traits, groundTempCelsius })
      return { at: entry.at, level: v.level, label: fmtTime(entry.at) }
    })
  })

  const goodWindows = computed(() =>
    forecastWindows.value.filter((w) => w.level === 'good').map((w) => w.label),
  )

  // 최적 산책 시간(F-32) — 연속된 'good' 구간을 하나의 범위 칩으로 묶는다(스크린샷의
  // "06:00–09:00 좋음" 칩 참조). 한 구간이 stepHours(3시간)를 대표하므로 구간 끝 시각은
  // 다음 구간 시작 라벨로 표기한다.
  const bestWindowRanges = computed(() => {
    const windows = forecastWindows.value
    const ranges = []
    let runStart = null
    for (let i = 0; i < windows.length; i++) {
      const isGood = windows[i].level === 'good'
      if (isGood && runStart === null) runStart = i
      const isLastOfRun = isGood && (i === windows.length - 1 || windows[i + 1].level !== 'good')
      if (isLastOfRun) {
        const endAt = windows[i].at + 3 * 3600 * 1000 // stepHours(3시간) 뒤가 구간의 끝
        ranges.push({ startLabel: windows[runStart].label, endLabel: fmtTime(endAt) })
        runStart = null
      }
    }
    return ranges
  })

  // unsafe 상태에서 "0분" 대신 보여줄 다음 가능 시각(design_architecture.md 4.2).
  const nextAvailableTime = computed(() => {
    if (!verdict.value || verdict.value.maxMinutes > 0) return ''
    const next = forecastWindows.value.find((w) => w.level === 'good' || w.level === 'caution')
    return next ? `${next.label} 이후` : ''
  })

  // 알림 예약용(F-37) — 다음 "좋음" 구간의 시작 timestamp 1개만 있으면 충분하다(과설계 방지).
  // bestWindowRanges는 표시용 라벨 문자열만 갖고 있어 별도로 계산한다.
  const nextGoodWindowAt = computed(() => {
    const upcoming = forecastWindows.value.find((w) => w.level === 'good' && w.at > Date.now())
    return upcoming ? upcoming.at : null
  })

  return {
    activeDog,
    myCityWeather,
    coords,
    geo,
    usingLiveLocation,
    groundTemp,
    verdict,
    airQuality: myLocationAirQuality,
    forecast: activeForecast,
    forecastStatus,
    forecastWindows,
    goodWindows,
    bestWindowRanges,
    nextAvailableTime,
    nextGoodWindowAt,
  }
}
