<script setup>
// 상세 화면 전용 — 오늘 하루(3시간 간격 8개, weatherStore.forecast와 동일한 해상도)의
// 날씨 흐름을 한눈에 보여준다. 판정에는 관여하지 않는 참고용 표시라 statusCode → 아이콘
// 매핑은 domain/weatherRules.js의 무드 분류와 별개로 이 컴포넌트 안에 로컬로 둔다.
import { computed } from 'vue'
import { useTemperature } from '@/composables/useTemperature'

const props = defineProps({
  entries: { type: Array, required: true }, // [{ at, temp, status, statusCode, humidity, windSpeed }]
})

const { formatTemp, unitSymbol } = useTemperature()

const STATUS_ICON = {
  CLEAR: '☀️',
  CLOUDS: '☁️',
  RAIN: '🌧️',
  DRIZZLE: '🌦️',
  STORM: '⛈️',
  SNOW: '❄️',
  ATMOSPHERE: '🌫️',
  UNKNOWN: '⛅',
}

function iconFor(statusCode) {
  return STATUS_ICON[statusCode] ?? STATUS_ICON.UNKNOWN
}

function fmtHour(ts) {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// 꺾은선 그래프의 좌표계. 절대 온도 눈금은 두지 않고 "흐름"만 보여주는 장식용
// 시각화라 0~100(가로) × 0~100(세로) % 좌표로 고정한다 — 실제 렌더 박스가 아주 넓고
// 낮은 비율(카드 폭 대비 그래프 높이 64px)이라 SVG viewBox를 preserveAspectRatio="none"으로
// 늘리면 원이 납작한 타원으로 찌그러진다. 그래서 점(dot)은 SVG가 아니라 같은 %좌표를 쓰는
// 별도 HTML 오버레이로 그려 항상 정원을 유지한다. Y_TOP/Y_BOTTOM 여백도 넉넉히 둬서
// 최고점이 위 아이콘 줄과 겹치며 "튀어나와" 보이지 않게 한다.
const VIEW_W = 100
const VIEW_H = 100
const Y_TOP = 18
const Y_BOTTOM = 82

function xAt(i) {
  return props.entries.length > 1 ? (i / (props.entries.length - 1)) * VIEW_W : VIEW_W / 2
}

const tempRange = computed(() => {
  const temps = props.entries.map((e) => e.temp)
  return { min: Math.min(...temps), max: Math.max(...temps) }
})

function yAt(temp) {
  const { min, max } = tempRange.value
  if (max === min) return (Y_TOP + Y_BOTTOM) / 2
  return Y_BOTTOM - ((temp - min) / (max - min)) * (Y_BOTTOM - Y_TOP)
}

const points = computed(() => props.entries.map((e, i) => ({ x: xAt(i), y: yAt(e.temp) })))

const linePath = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
)

const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  const lineSegment = points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return `${lineSegment} L ${last.x} ${VIEW_H} L ${first.x} ${VIEW_H} Z`
})
</script>

<template>
  <div class="hourly-flow">
    <div class="flow-row flow-icons">
      <span v-for="entry in entries" :key="`icon-${entry.at}`" class="flow-icon">{{ iconFor(entry.statusCode) }}</span>
    </div>

    <div class="flow-graph">
      <svg class="flow-svg" :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" preserveAspectRatio="none">
        <path class="flow-area" :d="areaPath" />
        <path class="flow-line" :d="linePath" />
      </svg>
      <span
        v-for="(p, i) in points"
        :key="i"
        class="flow-dot"
        :style="{ left: p.x + '%', top: p.y + '%' }"
      ></span>
    </div>

    <div class="flow-row flow-temps">
      <span v-for="entry in entries" :key="`temp-${entry.at}`" class="flow-temp metric">{{ formatTemp(entry.temp) }}°</span>
    </div>
    <div class="flow-row flow-times">
      <span v-for="entry in entries" :key="`time-${entry.at}`" class="flow-time">{{ fmtHour(entry.at) }}</span>
    </div>

    <p class="flow-note">기온·풍속·강수 3시간 간격 예보이며, 실제와 다를 수 있어요.</p>
  </div>
</template>

<style scoped>
.hourly-flow {
  margin: var(--space-4) 0;
  background: var(--color-surface-sunken);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-3) var(--space-2);
}
.flow-row {
  display: flex;
  justify-content: space-between;
}
.flow-icon {
  font-size: var(--font-size-md);
  flex: 1;
  text-align: center;
}
.flow-graph {
  position: relative;
  height: 64px;
  margin: var(--space-2) 0;
  overflow: hidden;
}
.flow-svg {
  width: 100%;
  height: 100%;
  display: block;
}
.flow-area {
  fill: var(--color-primary);
  opacity: 0.16;
  stroke: none;
}
.flow-line {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
/* dot은 SVG가 아니라 같은 %좌표계의 HTML 오버레이다 — viewBox를 preserveAspectRatio="none"으로
   비균일하게 늘리면 SVG <circle>은 납작한 타원이 되지만, 이 방식은 항상 정원을 유지한다. */
.flow-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--color-surface);
  border: 1.4px solid var(--color-primary);
}
.flow-temp {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text);
}
.flow-time {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.flow-note {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
