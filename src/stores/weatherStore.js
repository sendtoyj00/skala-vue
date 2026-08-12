import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { weatherMockList } from '@/components/weather/weatherMockData'
import { isDangerWeather } from '@/domain/weatherRules'

// 날씨 데이터의 단일 출처. 세 View(Home/Alert/Detail)가 각각 mock을 import하던 상태를 대체한다.
// (vue_architecture.md 4.4, 10절 2단계)
export const useWeatherStore = defineStore('weather', () => {
  // state
  const cities = ref([])
  const listStatus = ref('idle') // 'idle' | 'loading' | 'success' | 'error'
  const listError = ref(null)

  // getters
  const dangerCityList = computed(() => cities.value.filter(isDangerWeather))

  function findCityById(cityId) {
    return cities.value.find((item) => item.id === cityId) ?? null
  }

  // actions
  // API 계층이 없는 현재는 mock을 그대로 담는다. 도입 후에도 이 action의 이름과 시그니처는 유지된다.
  function loadCityWeather() {
    if (listStatus.value === 'success') return
    listStatus.value = 'loading'
    try {
      cities.value = weatherMockList
      listStatus.value = 'success'
      listError.value = null
    } catch {
      listStatus.value = 'error'
      listError.value = { type: 'UNKNOWN_ERROR', retryable: true }
    }
  }

  function refreshCityWeather() {
    listStatus.value = 'idle'
    loadCityWeather()
  }

  return {
    cities,
    listStatus,
    listError,
    dangerCityList,
    findCityById,
    loadCityWeather,
    refreshCityWeather,
  }
})
