<script setup>
// 서비스의 얼굴 — 화면에서 유일하게 배경이 채워진 요소다(design_architecture.md 2.6, 4.2).
// verdict는 통째로 받는다 — level/maxMinutes/reasons가 함께 움직이는 하나의 결과라
// 분해해서 넘기면 서로 어긋난 조합이 타입상 가능해진다(vue_architecture.md 7.2).
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
  airTempCelsius: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
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
      <span aria-hidden="true">🐕</span>
      <span class="level-label">{{ LEVEL_LABEL[verdict.level] }}</span>
      <span v-if="dogLabel" class="dog-label">{{ dogLabel }} 기준</span>
    </div>

    <p class="minutes">
      <template v-if="verdict.maxMinutes > 0">{{ verdict.maxMinutes }}분</template>
      <template v-else>지금은 어려워요</template>
    </p>

    <ul class="advice-list">
      <li v-for="advice in getWalkAdvice(props.verdict)" :key="advice.text">{{ advice.icon }} {{ advice.text }}</li>
    </ul>

    <p class="basis">추정 지면 {{ groundTempCelsius }}℃ · 기온 {{ airTempCelsius }}℃ · 습도 {{ humidity }}%</p>
  </div>
</template>

<style scoped>
.walk-verdict-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  color: var(--color-on-walk);
  margin-bottom: var(--space-4);
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

.level-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 700;
  font-size: var(--font-size-md);
}
.dog-label {
  font-weight: 400;
  opacity: 0.85;
  font-size: var(--font-size-sm);
}
.minutes {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: var(--space-2) 0;
}
.advice-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
}
.basis {
  font-size: var(--font-size-xs);
  opacity: 0.85;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: var(--space-2);
}
</style>
