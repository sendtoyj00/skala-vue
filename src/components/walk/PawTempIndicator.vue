<script setup>
// 지면온도 전용 표시 컴포넌트(design_architecture.md 4.3). 색 단독 의존 금지 — 색+아이콘(🐾)
// +수치 텍스트 3중으로 전달한다. 기온과 나란히 둬 격차가 보이게 하는 것이 목적이다.
// 임계값은 walkRules.js를 재사용한다 — 이 컴포넌트가 직접 숫자를 다시 정의하면 판정 임계값과
// 화면 문구가 어긋난 과거 실패(weatherRules.js vs 화면 문구)가 재현된다.
import { computed } from 'vue'
import { GROUND_TEMP_CAUTION, GROUND_TEMP_UNSAFE } from '@/domain/walkRules'

const props = defineProps({
  groundTempCelsius: {
    type: Number,
    required: true,
  },
  isEstimated: {
    type: Boolean,
    required: true,
  },
  airTempCelsius: {
    type: Number,
    required: true,
  },
  basis: {
    type: String,
    default: '',
  },
})

const severity = computed(() => {
  if (props.groundTempCelsius >= GROUND_TEMP_UNSAFE) return 'unsafe'
  if (props.groundTempCelsius >= GROUND_TEMP_CAUTION) return 'caution'
  return 'good'
})

const diffLabel = computed(() => {
  const diff = Math.round((props.groundTempCelsius - props.airTempCelsius) * 10) / 10
  return diff >= 0 ? `+${diff}` : `${diff}`
})

// 계기판 눈금(장식) — 20℃~(위험 임계+8) 구간에 현재 지면온도를 표시한다. 눈금은 severity와
// 같은 임계값(walkRules.js)에서 산출해 색 배지와 항상 일치한다. 시각 보조일 뿐 색+아이콘+수치
// 3중 전달을 대체하지 않는다(위 severity/estimate-badge/value가 여전히 유일한 정보원).
const GAUGE_MIN = 20
const gaugeMax = GROUND_TEMP_UNSAFE + 8
const gaugePercent = computed(() => {
  const clamped = Math.min(Math.max(props.groundTempCelsius, GAUGE_MIN), gaugeMax)
  return ((clamped - GAUGE_MIN) / (gaugeMax - GAUGE_MIN)) * 100
})
const cautionPercent = ((GROUND_TEMP_CAUTION - GAUGE_MIN) / (gaugeMax - GAUGE_MIN)) * 100
const unsafePercent = ((GROUND_TEMP_UNSAFE - GAUGE_MIN) / (gaugeMax - GAUGE_MIN)) * 100
</script>

<template>
  <div class="paw-temp" :class="`severity-${severity}`">
    <div class="paw-temp-head">
      <span class="paw-icon" aria-hidden="true">🐾</span>
      <span class="label">지면 온도</span>
      <span class="estimate-badge">{{ isEstimated ? '추정' : '실측' }}</span>
      <span class="value metric">{{ groundTempCelsius }}℃</span>
    </div>

    <div
      class="gauge-track"
      role="img"
      :aria-label="`계기판: 20℃부터 ${gaugeMax}℃까지 중 현재 지면온도 ${groundTempCelsius}℃`"
    >
      <span class="gauge-tick" :style="{ left: `${cautionPercent}%` }" aria-hidden="true"></span>
      <span class="gauge-tick" :style="{ left: `${unsafePercent}%` }" aria-hidden="true"></span>
      <span class="gauge-marker" :style="{ left: `${gaugePercent}%` }" aria-hidden="true"></span>
    </div>

    <span class="vs metric">기온 {{ airTempCelsius }}℃ 대비 {{ diffLabel }}</span>
  </div>
  <p v-if="basis" class="basis-note">{{ basis }}</p>
</template>

<style scoped>
/* 실선 테두리 금지 — 점선으로 관측값과 시각적으로 구분한다(design_architecture.md 2.5). */
.paw-temp {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  margin-bottom: var(--space-2);
}
.paw-temp-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.paw-icon {
  font-size: var(--font-size-md);
}
.label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.estimate-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: var(--color-walk-caution-surface, var(--color-warning-surface));
  color: var(--color-walk-caution, var(--color-warning));
}
.severity-good .estimate-badge {
  background: var(--color-walk-good-surface, var(--color-safe-surface));
  color: var(--color-walk-good, var(--color-safe));
}
.severity-unsafe .estimate-badge {
  background: var(--color-walk-unsafe-surface, var(--color-danger-surface));
  color: var(--color-walk-unsafe, var(--color-danger));
}
.value {
  margin-left: auto;
  font-weight: 700;
  font-size: var(--font-size-md);
}
.severity-caution .value {
  color: var(--color-walk-caution, var(--color-warning));
}
.severity-unsafe .value {
  color: var(--color-walk-unsafe, var(--color-danger));
}

/* 계기판 트랙 — 좋음→주의→위험 임계값을 눈금(tick)으로, 현재값을 점(marker)으로 표시한다. */
.gauge-track {
  position: relative;
  height: 6px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    to right,
    var(--color-walk-good) 0%,
    var(--color-walk-caution) 55%,
    var(--color-walk-unsafe) 100%
  );
  margin: var(--space-1) 2px;
}
.gauge-tick {
  position: absolute;
  top: -2px;
  width: 2px;
  height: 10px;
  background: var(--color-surface);
  opacity: 0.85;
  transform: translateX(-1px);
}
.gauge-marker {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 3px solid var(--color-text);
  transform: translate(-50%, -50%);
  box-shadow: var(--shadow-sm);
  transition: left 0.25s ease;
}
.severity-good .gauge-marker {
  border-color: var(--color-walk-good);
}
.severity-caution .gauge-marker {
  border-color: var(--color-walk-caution);
}
.severity-unsafe .gauge-marker {
  border-color: var(--color-walk-unsafe);
}

.vs {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.basis-note {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4);
}
</style>
