<script setup>
// 24시간 가로 막대. 현재 시각 마커 고정 — 지금이 어디인지 없으면 "저녁 7시"가 얼마나 남았는지
// 읽을 수 없다(design_architecture.md 4.4). 색 단독 의존 금지 — 구간마다 시각 라벨을 함께 둔다.
// 모바일은 가로 스크롤 대신 접기를 쓴다(가로 스크롤은 마커 위치를 잃는다) — <details>로 구현.
import { computed } from 'vue'

const props = defineProps({
  // [{ at: timestamp, level: 'good'|'caution'|'limited'|'unsafe', label: string }]
  windows: {
    type: Array,
    required: true,
  },
  // 3시간 간격 예보라 한 구간이 대표하는 폭(시간)
  stepHours: {
    type: Number,
    default: 3,
  },
})

const LEVEL_LABEL = { good: '좋음', caution: '주의', limited: '제한', unsafe: '위험' }

const rangeStart = computed(() => (props.windows.length ? props.windows[0].at : Date.now()))
const rangeEnd = computed(() => rangeStart.value + props.windows.length * props.stepHours * 3600 * 1000)
const totalMs = computed(() => rangeEnd.value - rangeStart.value)

const nowPercent = computed(() => {
  const now = Date.now()
  if (now < rangeStart.value || now > rangeEnd.value || totalMs.value <= 0) return null
  return ((now - rangeStart.value) / totalMs.value) * 100
})

const nowLabel = computed(() =>
  new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
)
</script>

<template>
  <details class="walk-timeline" open>
    <summary>시간대별 산책 적합도</summary>

    <div class="bar-wrap">
      <div class="bar" role="img" :aria-label="`24시간 산책 적합도: ${windows.map((w) => `${w.label} ${LEVEL_LABEL[w.level]}`).join(', ')}`">
        <div
          v-for="(w, i) in windows"
          :key="i"
          class="segment"
          :class="`level-${w.level}`"
          :style="{ width: `${100 / windows.length}%` }"
        >
          <span class="segment-time">{{ w.label }}</span>
        </div>
        <div v-if="nowPercent !== null" class="now-marker" :style="{ left: `${nowPercent}%` }">
          <span class="now-label">지금 {{ nowLabel }}</span>
        </div>
      </div>
    </div>

    <ul class="legend">
      <li v-for="level in ['good', 'caution', 'limited', 'unsafe']" :key="level" :class="`level-${level}`">
        <span class="dot" aria-hidden="true"></span>{{ LEVEL_LABEL[level] }}
      </li>
    </ul>
  </details>
</template>

<style scoped>
.walk-timeline {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
}
.walk-timeline summary {
  cursor: pointer;
  font-weight: 700;
  font-size: var(--font-size-sm);
  min-height: 44px;
  display: flex;
  align-items: center;
}
.bar-wrap {
  padding-top: var(--space-5);
  position: relative;
}
.bar {
  display: flex;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}
.segment {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.35);
}
.segment:last-child {
  border-right: none;
}
.segment-time {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-on-walk);
  font-variant-numeric: tabular-nums;
}
.level-good {
  background: var(--color-walk-good);
}
.level-caution {
  background: var(--color-walk-caution);
}
.level-limited {
  background: var(--color-walk-limited);
}
.level-unsafe {
  background: var(--color-walk-unsafe);
}
.now-marker {
  position: absolute;
  top: -22px;
  bottom: 0;
  width: 2px;
  background: var(--color-text);
  transform: translateX(-1px);
}
.now-label {
  position: absolute;
  top: -20px;
  left: 0;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
}
.legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: 0;
  margin: var(--space-2) 0 0;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.legend li.level-good .dot {
  background: var(--color-walk-good);
}
.legend li.level-caution .dot {
  background: var(--color-walk-caution);
}
.legend li.level-limited .dot {
  background: var(--color-walk-limited);
}
.legend li.level-unsafe .dot {
  background: var(--color-walk-unsafe);
}
</style>
