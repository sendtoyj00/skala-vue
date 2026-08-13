<script setup>
// 서비스의 얼굴 — 화면에서 유일하게 배경이 채워진 요소다(design_architecture.md 2.6, 4.2).
// verdict는 통째로 받는다 — level/maxMinutes/reasons가 함께 움직이는 하나의 결과라
// 분해해서 넘기면 서로 어긋난 조합이 타입상 가능해진다(vue_architecture.md 7.2).
import { computed } from 'vue'
import { getWalkAdvice } from '@/domain/walkRules'

const props = defineProps({
  verdict: {
    type: Object,
    required: true,
  },
  dogLabel: {
    type: String,
    default: '',
  },
  groundTempCelsius: {
    type: Number,
    required: true,
  },
  groundTempIsEstimated: {
    type: Boolean,
    default: true,
  },
  airTempCelsius: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  // unsafe(maxMinutes<=0)일 때만 쓰인다 — "0분" 대신 다음 가능 시각을 보여주기 위함
  // (design_architecture.md 4.2 — "빈칸이나 0분으로 두지 않는다").
  nextAvailable: {
    type: String,
    default: '',
  },
})

const LEVEL_LABEL = {
  good: '좋음',
  caution: '주의',
  limited: '제한',
  unsafe: '위험',
}

// 원 기획서의 "위험 시 픽셀아트 장면 전환" 아이디어를 장식 요소로 격을 낮춰 반영한다.
// 좋음~제한 단계는 발자국이 앞으로 나아가고, 위험 단계는 집 앞에서 멈춘다. 이 장면은
// 상태를 전달하지 않는다 — 색약·저시력 사용자에게는 위 아이콘+텍스트만이 유일한 정보원이다
// (design_architecture.md 8.3 "색 단독 의존 금지"). 그래서 aria-hidden으로 완전히 숨긴다.
const isMoving = computed(() => props.verdict.level !== 'unsafe')
</script>

<template>
  <div class="walk-verdict-card" :class="`level-${verdict.level}`">
    <div class="verdict-scene" aria-hidden="true">
      <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
        <template v-if="isMoving">
          <g
            v-for="(p, i) in [
              [40, 118, -18],
              [78, 96, -10],
              [118, 104, -14],
              [158, 84, -8],
              [198, 90, -12],
              [238, 72, -6],
              [278, 78, -10],
              [318, 60, -4],
            ]"
            :key="'paw-' + i"
            :transform="`translate(${p[0]},${p[1]}) rotate(${p[2]}) scale(1.6)`"
          >
            <ellipse cx="0" cy="0" rx="4" ry="5" fill="currentColor" />
            <ellipse cx="-6" cy="-1" rx="2.4" ry="3" fill="currentColor" />
            <ellipse cx="6" cy="-1" rx="2.4" ry="3" fill="currentColor" />
            <ellipse cx="-3.6" cy="-8" rx="2.2" ry="2.8" fill="currentColor" />
            <ellipse cx="3.6" cy="-8" rx="2.2" ry="2.8" fill="currentColor" />
          </g>
          <g transform="translate(350,46) scale(1.3)">
            <ellipse cx="0" cy="4" rx="22" ry="12" fill="currentColor" />
            <circle cx="20" cy="-6" r="10" fill="currentColor" />
            <polygon points="26,-16 34,-24 30,-10" fill="currentColor" />
            <polygon points="-18,10 -30,2 -20,-2" fill="currentColor" />
          </g>
        </template>
        <template v-else>
          <g
            v-for="(p, i) in [
              [40, 130, -18],
              [78, 120, -10],
              [112, 128, -8],
            ]"
            :key="'paw-' + i"
            :transform="`translate(${p[0]},${p[1]}) rotate(${p[2]}) scale(1.4)`"
          >
            <ellipse cx="0" cy="0" rx="4" ry="5" fill="currentColor" />
            <ellipse cx="-6" cy="-1" rx="2.4" ry="3" fill="currentColor" />
            <ellipse cx="6" cy="-1" rx="2.4" ry="3" fill="currentColor" />
            <ellipse cx="-3.6" cy="-8" rx="2.2" ry="2.8" fill="currentColor" />
            <ellipse cx="3.6" cy="-8" rx="2.2" ry="2.8" fill="currentColor" />
          </g>
          <g transform="translate(300,70)">
            <polygon points="0,10 40,10 40,58 0,58" fill="currentColor" opacity="0.9" />
            <polygon points="-8,10 20,-22 48,10" fill="currentColor" />
            <rect x="16" y="34" width="10" height="24" fill="var(--color-surface)" />
            <ellipse cx="-14" cy="60" rx="20" ry="11" fill="currentColor" />
            <circle cx="2" cy="50" r="9" fill="currentColor" />
            <polygon points="6,42 13,35 10,47" fill="currentColor" />
          </g>
        </template>
      </svg>
    </div>

    <div class="level-row">
      <span class="level-chip">
        <span aria-hidden="true">🐕</span>
        <span class="level-label">{{ LEVEL_LABEL[verdict.level] }}</span>
      </span>
      <span v-if="dogLabel" class="dog-label">{{ dogLabel }} 기준</span>
    </div>

    <p class="minutes">
      <template v-if="verdict.maxMinutes > 0">
        <span class="minutes-num metric">{{ verdict.maxMinutes }}</span
        ><span class="minutes-unit">분</span>
      </template>
      <template v-else>지금은 어려워요</template>
    </p>
    <p v-if="verdict.maxMinutes <= 0 && nextAvailable" class="next-available">
      → {{ nextAvailable }} 다시 확인해 보세요
    </p>

    <ul class="advice-list">
      <li v-for="advice in getWalkAdvice(props.verdict)" :key="advice.text">{{ advice.icon }} {{ advice.text }}</li>
    </ul>

    <dl class="basis-grid">
      <div class="basis-item">
        <dt>{{ groundTempIsEstimated ? '추정 지면' : '지면(실측)' }}</dt>
        <dd class="metric">{{ groundTempCelsius }}℃</dd>
      </div>
      <div class="basis-item">
        <dt>기온</dt>
        <dd class="metric">{{ airTempCelsius }}℃</dd>
      </div>
      <div class="basis-item">
        <dt>습도</dt>
        <dd class="metric">{{ humidity }}%</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.walk-verdict-card {
  position: relative;
  padding: var(--space-6) var(--space-5) var(--space-5);
  border-radius: var(--radius-lg);
  color: var(--color-on-walk);
  margin-bottom: var(--space-4);
  overflow: hidden;
  isolation: isolate;
  box-shadow: var(--shadow-md);
  background-image: var(--pattern-contour);
  background-blend-mode: overlay;
}
.level-good {
  background-color: var(--color-walk-good);
}
.level-caution {
  background-color: var(--color-walk-caution);
}
.level-limited {
  background-color: var(--color-walk-limited);
}
.level-unsafe {
  background-color: var(--color-walk-unsafe);
}

.verdict-scene {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  pointer-events: none;
  z-index: 0;
}
.verdict-scene svg {
  width: 100%;
  height: 100%;
  display: block;
}

.level-row,
.minutes,
.next-available,
.advice-list,
.basis-grid {
  position: relative;
  z-index: 1;
}

.level-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-1);
}
.level-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px var(--space-3) 3px var(--space-2);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.16);
  font-weight: 800;
  font-size: var(--font-size-base);
}
.dog-label {
  font-weight: 600;
  opacity: 0.85;
  font-size: var(--font-size-xs);
  letter-spacing: 0.03em;
}
.minutes {
  font-weight: 800;
  letter-spacing: var(--tracking-tight);
  margin: var(--space-1) 0 0;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.minutes-num {
  font-size: 64px;
}
.minutes-unit {
  font-size: var(--font-size-lg);
  font-weight: 700;
  opacity: 0.9;
}
.next-available {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin: var(--space-2) 0 0;
}
.advice-list {
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
}
.basis-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
  padding-top: var(--space-3);
}
.basis-item dt {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 2px;
}
.basis-item dd {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 700;
}
</style>
