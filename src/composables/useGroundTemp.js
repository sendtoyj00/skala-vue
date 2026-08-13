// weather × 위치를 결합해 GroundTemp를 만든다 — 두 데이터 원천의 결합은 Store가 아니라
// composable이 담당한다(vue_architecture.md 4.6, 5.2와 같은 원칙). 실측 조회가 실패해도
// (기상청 API가 CORS를 지원하지 않아 운영 배포에서는 상시 실패 — api/client.js 참조)
// 오류로 취급하지 않고 조용히 추정으로 폴백한다(design_architecture.md 6.4 부분 실패 원칙).
import { ref, computed } from 'vue'
import { fetchAllRoadStations } from '@/api/roadWeatherApi'
import { estimateGroundTemp, findNearestRoadStation } from '@/domain/groundTemp'

// 관측점 스냅샷(366개소)은 자주 바뀌는 데이터가 아니라 세션당 한 번만 받아 재사용한다.
let stationsPromise = null
function loadStationsOnce() {
  if (!stationsPromise) {
    stationsPromise = fetchAllRoadStations().catch((err) => {
      stationsPromise = null // 실패 시 캐시를 비워 다음 시도에서 재요청되게 한다
      throw err
    })
  }
  return stationsPromise
}

// weather: ComputedRef<{temp, statusCode} | null> · coords: ComputedRef<{lat, lon} | null>
export function useGroundTemp(weather, coords) {
  const stations = ref([])
  const stationStatus = ref('idle') // 'idle' | 'loading' | 'success' | 'error'

  async function ensureStations() {
    if (stationStatus.value === 'loading' || stationStatus.value === 'success') return
    stationStatus.value = 'loading'
    try {
      stations.value = await loadStationsOnce()
      stationStatus.value = 'success'
    } catch {
      stationStatus.value = 'error'
    }
  }
  ensureStations()

  const nearestMatch = computed(() => {
    if (!coords.value || stations.value.length === 0) return null
    return findNearestRoadStation(stations.value, coords.value.lat, coords.value.lon)
  })

  // 반드시 computed를 반환한다 — 낡은 지면온도가 남으면 잘못된 안심으로 이어진다(7.5).
  const groundTemp = computed(() => {
    if (!weather.value) return null

    if (nearestMatch.value) {
      const { station, distanceKm } = nearestMatch.value
      return {
        celsius: station.roadTempC,
        isEstimated: false,
        basis: `${station.stationName} 관측점 실측 (${distanceKm.toFixed(1)}km)`,
      }
    }

    const hour = new Date().getHours()
    return {
      celsius: Math.round(estimateGroundTemp(weather.value, hour) * 10) / 10,
      isEstimated: true,
      basis: '기온·날씨 상태 기반 추정',
    }
  })

  return { groundTemp, stationStatus }
}
