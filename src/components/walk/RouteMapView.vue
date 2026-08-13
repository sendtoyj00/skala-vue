<script setup>
// 지도에서 경로 보기(F-34). 카카오맵 JS SDK로 렌더링한다(api/kakaoMapApi.js가 SDK 로더를
// 소유) — 경로 자체가 카카오 장소 검색으로 찾은 실제 위치를 가리키므로, 그 위치를 다시
// OpenStreetMap 같은 다른 지도에 옮겨 그리지 않고 카카오맵 그대로 보여준다.
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { loadKakaoMaps } from '@/api/kakaoMapApi'

const props = defineProps({
  center: { type: Object, required: true }, // {lat, lon}
  routes: { type: Array, required: true },
  selectedRouteId: { type: String, default: null },
  // 'live'(카카오 실제 장소 기반) | 'fallback'(합성 루프) — useWalkRoutes.js의 placesStatus.
  placesStatus: { type: String, default: 'fallback' },
})

const mapEl = ref(null)
const loadError = ref(null)
let map = null
let overlays = []

// 팔레트(base.css)와 같은 값으로 맞춘다 — 카카오맵 SDK는 CSS 변수를 못 읽어 직접 hex를 쓴다.
const ROUTE_COLOR = {
  relax: '#5a8730', // --gr-700
  active: '#a6486e', // --pk-700
  easy: '#26718c', // --sk-700
}

function clearOverlays() {
  overlays.forEach((o) => o.setMap(null))
  overlays = []
}

function render(kakao) {
  if (!map) return
  clearOverlays()

  for (const route of props.routes) {
    const isSelected = route.id === props.selectedRouteId
    const path = route.path.map((p) => new kakao.maps.LatLng(p.lat, p.lon))
    const line = new kakao.maps.Polyline({
      path,
      strokeWeight: isSelected ? 5 : 2,
      strokeColor: ROUTE_COLOR[route.type] ?? '#8bc24d',
      strokeOpacity: isSelected ? 0.95 : 0.35,
      strokeStyle: 'solid',
    })
    line.setMap(map)
    overlays.push(line)
  }

  const home = new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(props.center.lat, props.center.lon),
    content: '<span class="walssi-emoji-marker">🏠</span>',
    yAnchor: 0.5,
  })
  home.setMap(map)
  overlays.push(home)

  map.setCenter(new kakao.maps.LatLng(props.center.lat, props.center.lon))
}

onMounted(async () => {
  await nextTick()
  try {
    const kakao = await loadKakaoMaps()
    map = new kakao.maps.Map(mapEl.value, {
      center: new kakao.maps.LatLng(props.center.lat, props.center.lon),
      level: 5,
    })
    render(kakao)
    watch(
      () => [props.routes, props.selectedRouteId, props.center],
      () => render(kakao),
      { deep: true },
    )
  } catch (err) {
    loadError.value = err.message
  }
})

onBeforeUnmount(() => {
  clearOverlays()
  map = null
})
</script>

<template>
  <div class="route-map-wrap">
    <div v-if="loadError" class="map-error">
      🗺️ 카카오맵을 불러오지 못했어요. ({{ loadError }})
    </div>
    <div v-else ref="mapEl" class="route-map" role="img" aria-label="선택된 산책 경로가 표시된 카카오맵"></div>
    <p v-if="placesStatus === 'live'" class="map-note">
      🐾 카카오맵에서 실제로 찾은 주변 장소를 기준으로 한 왕복 경로입니다. 실제 보행로와는 다를 수 있어요.
    </p>
    <p v-else class="map-note">
      🐾 실제 도로망을 반영한 경로가 아니라 현재 위치를 중심으로 합성한 미리보기 루프입니다.
    </p>
  </div>
</template>

<style scoped>
.route-map-wrap {
  margin-bottom: var(--space-3);
}
.route-map {
  width: 100%;
  height: 260px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
}
.map-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
  padding: var(--space-3);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  background: var(--color-surface-sunken);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}
.map-note {
  margin: var(--space-1) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
:global(.walssi-emoji-marker) {
  font-size: 20px;
  line-height: 1;
}
</style>
