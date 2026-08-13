<script setup>
// 서비스의 얼굴 — 화면에서 유일하게 배경이 채워진 요소다(design_architecture.md 2.6, 4.2).
// verdict는 통째로 받는다 — level/maxMinutes/reasons가 함께 움직이는 하나의 결과라
// 분해해서 넘기면 서로 어긋난 조합이 타입상 가능해진다(vue_architecture.md 7.2).
import { getWalkAdvice } from '@/domain/walkRules'
import { useTemperature } from '@/composables/useTemperature'

const { formatTemp, unitSymbol } = useTemperature()

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
</script>

<template>
  <div class="walk-verdict-card" :class="`level-${verdict.level}`">
    <div class="level-row">
      <span class="level-chip">
        <svg class="level-chip-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <circle cx="12" cy="15.5" r="4.6" fill="currentColor" />
          <circle cx="5.2" cy="9.5" r="2.3" fill="currentColor" />
          <circle cx="9.6" cy="5" r="2.5" fill="currentColor" />
          <circle cx="14.4" cy="5" r="2.5" fill="currentColor" />
          <circle cx="18.8" cy="9.5" r="2.3" fill="currentColor" />
        </svg>
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
        <dd class="metric">{{ formatTemp(groundTempCelsius) }}{{ unitSymbol }}</dd>
      </div>
      <div class="basis-item">
        <dt>기온</dt>
        <dd class="metric">{{ formatTemp(airTempCelsius) }}{{ unitSymbol }}</dd>
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
/* 서명 장식 — 발자국 트레일 대신 은은하게 겹치는 보케 블롭 2개로 정리한다(카드 안에서
   패턴끼리 겹쳐 지저분해 보이던 문제를 없앤다). 상태 정보를 전달하지 않으므로
   aria-hidden 없이도 무해하다 — 배경 장식일 뿐 색·아이콘·수치 3중 전달과 무관하다. */
.walk-verdict-card::before,
.walk-verdict-card::after {
  content: '';
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
}
.walk-verdict-card::before {
  inset: 0;
  border-radius: 0;
  background: radial-gradient(circle at 12% -10%, rgba(255, 255, 255, 0.6), transparent 55%);
}
.walk-verdict-card::after {
  width: 240px;
  height: 240px;
  right: -70px;
  bottom: -90px;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0) 70%);
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
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  font-weight: 800;
  font-size: var(--font-size-base);
}
.level-chip-icon {
  flex-shrink: 0;
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
  border-top: 1px dashed rgba(0, 0, 0, 0.16);
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
