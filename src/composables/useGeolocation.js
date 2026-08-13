// 현재 위치(F-31). 과제 요구사항 "처음엔 mock → 이후 브라우저 위치"를 그대로 구현한다.
// 브라우저 Geolocation API는 permission prompt가 필요해 첫 진입에 항상 즉시 값을 주지
// 못한다 — 그래서 mock 좌표(서울시청)로 즉시 렌더링을 시작하고, 사용자가 위치를 허용하면
// 실측 좌표로 조용히 교체한다(design_architecture.md 6.4 부분 실패/점진적 향상 원칙과 동일선상).
import { ref, computed } from 'vue'

// 관측 대상이 없을 때의 기본값 — 서울시청. CITY_MASTER_LIST의 서울(city_01)과 같은 도시라
// mock↔실측 전환 시 화면이 크게 요동치지 않는다.
const MOCK_COORDS = { lat: 37.5665, lon: 126.978 }

export function useGeolocation() {
  const coords = ref({ ...MOCK_COORDS })
  const source = ref('mock') // 'mock' | 'gps' | 'denied' | 'unsupported'
  const status = ref('idle') // 'idle' | 'loading' | 'success' | 'error'

  function requestLocation() {
    if (!('geolocation' in navigator)) {
      source.value = 'unsupported'
      return
    }
    status.value = 'loading'
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coords.value = { lat: pos.coords.latitude, lon: pos.coords.longitude }
        source.value = 'gps'
        status.value = 'success'
      },
      () => {
        // 거부·타임아웃 모두 오류로 화면을 막지 않는다 — mock 좌표를 계속 쓴다.
        source.value = 'denied'
        status.value = 'error'
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )
  }

  const isMock = computed(() => source.value === 'mock')

  return { coords, source, status, isMock, requestLocation }
}
