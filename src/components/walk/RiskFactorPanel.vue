<script setup>
import { computed } from 'vue'
import { getRiskFactors } from '@/domain/walkRules'
import { useTemperature } from '@/composables/useTemperature'

const props = defineProps({
  weather: { type: Object, required: true }, // {temp, humidity, windSpeed, statusCode, status}
  groundTempCelsius: { type: Number, required: true },
  airQuality: { type: Object, default: null }, // {aqi, pm2_5, pm10, observedAt} — 로드 전이면 null
})

const { formatTemp, unitSymbol } = useTemperature()

const factors = computed(() =>
  getRiskFactors({
    weather: props.weather,
    groundTempCelsius: props.groundTempCelsius,
    airQuality: props.airQuality,
    formatTemp,
    unitSymbol: unitSymbol.value,
  }),
)

const SEVERITY_LABEL = { safe: '안전', caution: '주의', unsafe: '위험' }
</script>

<template>
  <details class="risk-panel" v-glow-tilt>
    <summary>🔍 산책 위험 요소 {{ factors.length }}가지</summary>
    <ul class="risk-list">
      <li v-for="f in factors" :key="f.code" class="risk-row" :class="`severity-${f.severity}`">
        <span class="risk-icon" aria-hidden="true">{{ f.icon }}</span>
        <span class="risk-label">{{ f.label }}</span>
        <span class="risk-value">{{ f.valueLabel }}</span>
        <span class="risk-badge">{{ SEVERITY_LABEL[f.severity] }}</span>
        <span class="risk-threshold">{{ f.thresholdLabel }}</span>
      </li>
    </ul>
  </details>
</template>

<style scoped>
.risk-panel {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  margin-bottom: var(--space-4);
}
.risk-panel summary {
  cursor: pointer;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 700;
  min-height: 44px;
  display: flex;
  align-items: center;
}
.risk-list {
  list-style: none;
  margin: 0;
  padding: 0 var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.risk-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
}
.risk-row:first-child {
  border-top: none;
  padding-top: 0;
}
.risk-icon {
  font-size: var(--font-size-sm);
}
.risk-label {
  font-weight: 600;
  color: var(--color-text);
}
.risk-value {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
.risk-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 10px;
  background: var(--color-safe-surface);
  color: var(--color-safe);
}
.severity-caution .risk-badge {
  background: var(--color-warning-surface);
  color: var(--color-warning);
}
.severity-unsafe .risk-badge {
  background: var(--color-danger-surface);
  color: var(--color-danger);
}
.risk-threshold {
  grid-column: 2 / -1;
  color: var(--color-text-muted);
  font-size: 11px;
}
</style>
