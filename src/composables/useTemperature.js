import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit } from '@/domain/temperature'

// configStore.unit을 구독해 섭씨 원본 값을 현재 단위의 표시값으로 변환한다.
// 판정(위험 여부)은 항상 섭씨 원본 기준이며 이 함수는 표시에만 쓰인다(vue_architecture.md 5.2).
export function useTemperature() {
  const configStore = useConfigStore()

  function formatTemp(celsius) {
    return configStore.unit === 'celsius' ? celsius : celsiusToFahrenheit(celsius)
  }

  const unitSymbol = computed(() => configStore.unitSymbol)

  return { formatTemp, unitSymbol }
}
