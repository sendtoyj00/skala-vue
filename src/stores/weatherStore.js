import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { CITY_MASTER_LIST } from '@/api/cityMaster'
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchAirQuality,
  fetchCurrentWeatherByCoords,
  fetchForecastByCoords,
} from '@/api/weatherApi'
import { isDangerWeather } from '@/domain/weatherRules'

// 날씨 데이터의 단일 출처. 세 View(Home/Alert/Detail)가 각각 mock을 import하던 상태를 대체한다.
// (vue_architecture.md 4.4, 10절 2단계)
//
// [실데이터 연동] loadCityWeather의 이름·시그니처는 mock 시절과 동일하게 유지된다 — 안이
// weatherMockList 대입에서 실제 axios 호출(api/weatherApi.js)로 바뀌었을 뿐이다
// (vue_architecture.md 9.3 Mock→API 교체 원칙, "Store/View는 전혀 바뀌지 않는다").
export const useWeatherStore = defineStore('weather', () => {
  // state — 현재 관측
  const cities = ref([])
  const listStatus = ref('idle') // 'idle' | 'loading' | 'success' | 'error'
  const listError = ref(null)

  // state — 예보(F-11, P0). 목록 상태와 분리한다 — 예보만 실패해도 현재 관측·판정은
  // 살아있어야 한다(design_architecture.md 6.4, vue_architecture.md 4.4).
  const forecast = ref([])
  const forecastStatus = ref('idle')
  const forecastError = ref(null)

  // state — 대기질(F-12, P1)
  const airQuality = ref(null)
  const airQualityStatus = ref('idle')

  // state — 현재 위치 날씨(F-31). city 목록과 별개 축이다 — 사용자의 실제 좌표는 8개
  // 도시 마스터 중 하나와 정확히 일치하지 않는 경우가 대부분이라 cities 배열을 재사용하지
  // 않고 lat/lon 쿼리 전용 상태를 둔다.
  const myLocationWeather = ref(null)
  const myLocationForecast = ref([])
  const myLocationStatus = ref('idle') // 'idle' | 'loading' | 'success' | 'error'
  const myLocationForecastStatus = ref('idle')

  // getters
  const dangerCityList = computed(() => cities.value.filter(isDangerWeather))

  function findCityById(cityId) {
    return cities.value.find((item) => item.id === cityId) ?? null
  }

  // actions
  async function loadCityWeather() {
    if (listStatus.value === 'success' || listStatus.value === 'loading') return
    listStatus.value = 'loading'

    const results = await Promise.allSettled(
      CITY_MASTER_LIST.map(async (city) => ({
        id: city.id,
        name: city.name,
        ...(await fetchCurrentWeather(city.apiQuery)),
      })),
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)

    if (succeeded.length === 0) {
      listStatus.value = 'error'
      listError.value = { type: 'API_ERROR', retryable: true }
      return
    }

    cities.value = succeeded
    listStatus.value = 'success'
    listError.value = null
  }

  function refreshCityWeather() {
    listStatus.value = 'idle'
    forecastStatus.value = 'idle'
    return loadCityWeather()
  }

  async function loadForecast(cityId) {
    const master = CITY_MASTER_LIST.find((c) => c.id === cityId)
    if (!master) return
    forecastStatus.value = 'loading'
    try {
      forecast.value = await fetchForecast(master.apiQuery)
      forecastStatus.value = 'success'
      forecastError.value = null
    } catch {
      forecastStatus.value = 'error'
      forecastError.value = { type: 'FORECAST_ERROR', retryable: true }
    }
  }

  async function loadAirQuality(cityId) {
    const city = findCityById(cityId)
    if (!city || city.lat == null || city.lon == null) return
    airQualityStatus.value = 'loading'
    try {
      airQuality.value = await fetchAirQuality(city.lat, city.lon)
      airQualityStatus.value = 'success'
    } catch {
      airQualityStatus.value = 'error'
    }
  }

  // 좌표 기준 현재 위치 조회. useGeolocation()이 mock→실측으로 좌표를 바꿀 때마다
  // 다시 호출되므로, loadCityWeather와 달리 idle/success 가드를 두지 않고 매번 갱신한다.
  async function loadMyLocationWeather(lat, lon) {
    myLocationStatus.value = 'loading'
    try {
      myLocationWeather.value = await fetchCurrentWeatherByCoords(lat, lon)
      myLocationStatus.value = 'success'
    } catch {
      myLocationStatus.value = 'error'
    }
  }

  async function loadMyLocationForecast(lat, lon) {
    myLocationForecastStatus.value = 'loading'
    try {
      myLocationForecast.value = await fetchForecastByCoords(lat, lon)
      myLocationForecastStatus.value = 'success'
    } catch {
      myLocationForecastStatus.value = 'error'
    }
  }

  return {
    cities,
    listStatus,
    listError,
    forecast,
    forecastStatus,
    forecastError,
    airQuality,
    airQualityStatus,
    myLocationWeather,
    myLocationForecast,
    myLocationStatus,
    myLocationForecastStatus,
    dangerCityList,
    findCityById,
    loadCityWeather,
    refreshCityWeather,
    loadForecast,
    loadAirQuality,
    loadMyLocationWeather,
    loadMyLocationForecast,
  }
})
