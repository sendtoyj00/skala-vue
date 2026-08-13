<script setup>
// 지도에서 경로 보기(F-34). Leaflet + OpenStreetMap 타일(무료, 키 불필요)을 쓴다 —
// 이번 과제 범위엔 지도 SaaS(Google Maps 등) API 키 발급이 없어 오픈소스 타일로 대체한다.
// 마커 아이콘은 기본 이미지 에셋 대신 divIcon(이모지)을 써서 Vite 번들링 시 흔히 겪는
// leaflet 기본 마커 경로 깨짐 문제를 원천 회피한다.
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  center: { type: Object, required: true }, // {lat, lon}
  routes: { type: Array, required: true },
  selectedRouteId: { type: String, default: null },
})

const mapEl = ref(null)
let map = null
let layerGroup = null

// 팔레트 리뉴얼(base.css)과 동일한 값으로 맞춘다 — Leaflet은 CSS 변수를 못 읽어 직접 값을 쓴다.
// base.css의 4색 스케일(--gr-700/--pk-700/--sk-700)과 정확히 같은 hex를 쓴다.
const ROUTE_COLOR = {
  relax: '#5a8730', // --gr-700
  active: '#a6486e', // --pk-700
  easy: '#26718c', // --sk-700
}

function emojiIcon(emoji) {
  return L.divIcon({
    html: `<span style="font-size:20px;line-height:1">${emoji}</span>`,
    className: 'walssi-emoji-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function render() {
  if (!map) return
  layerGroup.clearLayers()

  for (const route of props.routes) {
    const isSelected = route.id === props.selectedRouteId
    const latlngs = route.path.map((p) => [p.lat, p.lon])
    L.polyline(latlngs, {
      color: ROUTE_COLOR[route.type] ?? '#8bc24d',
      weight: isSelected ? 5 : 2,
      opacity: isSelected ? 0.95 : 0.35,
    }).addTo(layerGroup)
  }

  L.marker([props.center.lat, props.center.lon], { icon: emojiIcon('🏠') })
    .bindTooltip('출발/도착', { permanent: false })
    .addTo(layerGroup)

  map.setView([props.center.lat, props.center.lon], 16)
}

onMounted(async () => {
  await nextTick()
  map = L.map(mapEl.value, { attributionControl: true }).setView([props.center.lat, props.center.lon], 16)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  layerGroup = L.layerGroup().addTo(map)
  render()
})

watch(() => [props.routes, props.selectedRouteId, props.center], render, { deep: true })

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="route-map-wrap">
    <div ref="mapEl" class="route-map" role="img" aria-label="선택된 산책 경로가 표시된 지도"></div>
    <p class="map-note">
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
.map-note {
  margin: var(--space-1) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
:global(.walssi-emoji-marker) {
  background: transparent;
  border: none;
  text-align: center;
}
</style>
