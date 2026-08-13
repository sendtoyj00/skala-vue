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

const nowLabel = computed(() => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }))
</script>

<template>
  <details class="walk-timeline glass-surface" open v-glow-tilt>
    <summary>
      <span class="summary-icon" aria-hidden="true">🕐</span>
      시간대별 산책 적합도
    </summary>

    <div class="bar-wrap">
      <div v-if="nowPercent !== null" class="now-marker" :style="{ left: `${nowPercent}%` }">
        <span class="now-chip glass-surface">지금 {{ nowLabel }}</span>
        <span class="now-stem" aria-hidden="true"></span>
      </div>

      <div class="bar" role="img" :aria-label="`24시간 산책 적합도: ${windows.map((w) => `${w.label} ${LEVEL_LABEL[w.level]}`).join(', ')}`">
        <div v-for="(w, i) in windows" :key="i" class="segment" :class="`level-${w.level}`" :style="{ width: `${100 / windows.length}%` }">
          <span class="segment-time">{{ w.label }}</span>
        </div>
      </div>
    </div>

    <ul class="legend">
      <li v-for="level in ['good', 'caution', 'limited', 'unsafe']" :key="level" :class="`level-${level}`"><span class="dot" aria-hidden="true"></span>{{ LEVEL_LABEL[level] }}</li>
    </ul>
  </details>
</template>

<style scoped>
.walk-timeline {
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow-sm);
}
.walk-timeline summary {
  cursor: pointer;
  font-weight: 800;
  font-size: var(--font-size-sm);
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
}
.summary-icon {
  font-size: var(--font-size-base);
  line-height: 1;
}
.bar-wrap {
  padding-top: 30px;
  position: relative;
}
.bar {
  display: flex;
  height: 44px;
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
  isolation: isolate;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.12);
}
/* 유리 광택 오버레이 — 색 구간은 판정 신호라 그대로 두고, 그 위에만 얇은 하이라이트를 얹어
   전체 바가 프로스트 글래스 카드 톤과 어울리게 한다(design_architecture.md 4.4 색 단독
   의존 금지 원칙과 충돌하지 않도록 구간 색상값 자체는 변경하지 않는다). */
.bar::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 45%);
}
.segment {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  transition: filter 0.15s ease;
}
.segment:last-child {
  border-right: none;
}
.segment-time {
  font-size: var(--font-size-xs);
  font-weight: 800;
  color: var(--color-on-walk);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.55);
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

/* ── 지금 마커 — 얇은 선 대신 유리 칩 배지로. 바 위로 살짝 뜬 채 줄기(stem)로 위치를 짚는다 */
.now-marker {
  position: absolute;
  top: 0;
  bottom: -4px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.now-chip {
  padding: 3px var(--space-2);
  border-radius: var(--radius-full);
  font-size: 10.5px;
  font-weight: 800;
  color: var(--color-text);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}
.now-stem {
  width: 2px;
  flex: 1;
  margin-top: 2px;
  background: linear-gradient(180deg, var(--color-text) 0%, transparent 100%);
  opacity: 0.55;
}

.legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: 0;
  margin: var(--space-3) 0 0;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px var(--space-3) 4px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text);
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
.legend li.level-good {
  background: var(--color-walk-good-surface);
}
.legend li.level-good .dot {
  background: var(--color-walk-good);
}
.legend li.level-caution {
  background: var(--color-walk-caution-surface);
}
.legend li.level-caution .dot {
  background: var(--color-walk-caution);
}
.legend li.level-limited {
  background: var(--color-walk-limited-surface);
}
.legend li.level-limited .dot {
  background: var(--color-walk-limited);
}
.legend li.level-unsafe {
  background: var(--color-walk-unsafe-surface);
}
.legend li.level-unsafe .dot {
  background: var(--color-walk-unsafe);
}
</style>
