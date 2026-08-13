// coords × verdict 결합 — useWalkVerdict.js와 같은 원칙(vue_architecture.md 5.2)으로,
// 순수 도메인 함수(domain/walkRoutes.js)를 반응형 결과로 감싼다. 카카오맵 장소 검색이 비동기라
// 기존 computed 대신 ref + watch로 바꿨다(coords/verdict/groundTemp가 바뀔 때마다 다시 조회).
import { ref, computed, watch } from 'vue'
import { generateWalkRoutes, buildRoutesFromPlaces } from '@/domain/walkRoutes'
import { GROUND_TEMP_CAUTION } from '@/domain/walkRules'
import { searchNearbyWalkSpots } from '@/api/kakaoMapApi'

// '공원' 결과가 없는 외곽 지역을 위한 2차 키워드.
const WALK_SPOT_KEYWORDS = ['공원', '산책로']

// coords/verdict/groundTemp: ComputedRef (useWalkVerdict()의 반환값을 그대로 넘긴다)
export function useWalkRoutes(coords, verdict, groundTemp) {
  const routes = ref([])
  const selectedRouteId = ref(null)
  // 'idle' | 'loading' | 'live'(카카오 실제 장소) | 'fallback'(합성 루프로 대체됨)
  const placesStatus = ref('idle')

  let requestId = 0

  async function loadRoutes() {
    if (!coords.value || !verdict.value) {
      routes.value = []
      placesStatus.value = 'idle'
      return
    }

    const center = coords.value
    const currentVerdict = verdict.value
    const groundTempIsCaution = (groundTemp.value?.celsius ?? 0) >= GROUND_TEMP_CAUTION
    const myRequestId = ++requestId

    placesStatus.value = 'loading'
    try {
      const places = await searchNearbyWalkSpots(center, WALK_SPOT_KEYWORDS)
      if (myRequestId !== requestId) return // 최신 요청만 반영(경쟁 조건 방지)
      if (places.length === 0) throw new Error('반경 내 실제 장소를 찾지 못했습니다.')

      routes.value = buildRoutesFromPlaces({ places, center, verdict: currentVerdict, groundTempIsCaution })
      placesStatus.value = 'live'
    } catch {
      if (myRequestId !== requestId) return
      // 카카오 SDK 로드 실패·키 미설정·검색 결과 0건 — 합성 루프로 폴백해 경로 추천 자체는
      // 계속 동작하게 한다(design_architecture.md 6.4 부분 실패 원칙).
      routes.value = generateWalkRoutes({ center, verdict: currentVerdict, groundTempIsCaution })
      placesStatus.value = 'fallback'
    }
  }

  watch([coords, verdict, groundTemp], loadRoutes, { immediate: true })

  // 추천 코스를 기본 선택값으로 둔다 — 사용자가 지도를 열자마자 "왜 이 코스인지" 바로 보이게.
  watch(routes, (list) => {
    if (list.length === 0) return
    const stillValid = list.some((r) => r.id === selectedRouteId.value)
    if (!stillValid) selectedRouteId.value = list.find((r) => r.isRecommended)?.id ?? list[0].id
  })

  const selectedRoute = computed(() => routes.value.find((r) => r.id === selectedRouteId.value) ?? null)

  function selectRoute(routeId) {
    selectedRouteId.value = routeId
  }

  return { routes, selectedRouteId, selectedRoute, selectRoute, placesStatus }
}
