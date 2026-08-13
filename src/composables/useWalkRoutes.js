// coords × verdict 결합 — useWalkVerdict.js와 같은 원칙(vue_architecture.md 5.2)으로,
// 순수 도메인 함수(domain/walkRoutes.js)를 반응형 결과로 감싸기만 한다.
import { ref, computed, watch } from 'vue'
import { generateWalkRoutes } from '@/domain/walkRoutes'
import { GROUND_TEMP_CAUTION } from '@/domain/walkRules'

// coords/verdict/groundTemp: ComputedRef (useWalkVerdict()의 반환값을 그대로 넘긴다)
export function useWalkRoutes(coords, verdict, groundTemp) {
  const selectedRouteId = ref(null)

  const routes = computed(() => {
    if (!coords.value || !verdict.value) return []
    return generateWalkRoutes({
      center: coords.value,
      verdict: verdict.value,
      groundTempIsCaution: (groundTemp.value?.celsius ?? 0) >= GROUND_TEMP_CAUTION,
    })
  })

  // 추천 코스를 기본 선택값으로 둔다 — 사용자가 지도를 열자마자 "왜 이 코스인지" 바로 보이게.
  watch(
    routes,
    (list) => {
      if (list.length === 0) return
      const stillValid = list.some((r) => r.id === selectedRouteId.value)
      if (!stillValid) selectedRouteId.value = list.find((r) => r.isRecommended)?.id ?? list[0].id
    },
    { immediate: true },
  )

  const selectedRoute = computed(() => routes.value.find((r) => r.id === selectedRouteId.value) ?? null)

  function selectRoute(routeId) {
    selectedRouteId.value = routeId
  }

  return { routes, selectedRouteId, selectedRoute, selectRoute }
}
