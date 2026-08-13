<script setup>
import WeatherBadge from './WeatherBadge.vue'
import { useTemperature } from '@/composables/useTemperature'
import { isDangerWeather } from '@/domain/weatherRules'

defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  // 카드류 공용 강조 계약. WeatherList → WeatherCard로 전달돼 좌측 테두리/위험 플래그
  // 강도를 결정한다. 'muted'면 이 카드의 위험 표시가 화면의 최강 강조가 아니라는 뜻이다
  // (design_architecture.md 2.6). WeatherBadge는 판단 문구가 없어 이 prop을 받지 않는다.
  emphasis: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'muted'].includes(value),
  },
})

// 상세보기 = cityId 하나만 전달한다. 카드 전체 클릭이 곧 상세 이동이다 (service_architecture.md 5.3, vue_architecture.md 7.3).
const emit = defineEmits(['request-detail'])

const { formatTemp, unitSymbol } = useTemperature()
</script>

<template>
  <div class="weather-card" :class="{ danger: isDangerWeather(cityItem), muted: emphasis === 'muted' }" v-glow-tilt @click="emit('request-detail', cityItem.id)">
    <div v-if="isDangerWeather(cityItem)" class="danger-flag">⚠ 위험</div>

    <div class="card-head">
      <h4 class="city-name">{{ cityItem.name }}</h4>
      <span class="status-label">{{ cityItem.status }}</span>
    </div>

    <p class="temp-value metric">{{ formatTemp(cityItem.temp) }}{{ unitSymbol }}</p>

    <div class="card-metrics metric">
      <span><span class="metric-label">습도</span> {{ cityItem.humidity }}%</span>
      <span><span class="metric-label">바람</span> {{ cityItem.windSpeed }}m/s</span>
    </div>

    <WeatherBadge :city-item="cityItem" />
  </div>
</template>

<style scoped>
.weather-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);

  padding: var(--space-4);

  border-radius: var(--radius-lg);

  cursor: pointer;
  position: relative;

  height: 100%;

  display: flex;
  flex-direction: column;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.weather-card:hover {
  transform: translateY(-3px);

  box-shadow: 0 10px 28px rgba(38, 50, 56, 0.07);

  border-color: var(--color-border-strong);
}

/* 위험 카드 */
.weather-card.danger {
  border-color: var(--color-danger-surface);

  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-danger-surface) 100%);
}

.weather-card.danger.muted {
  border-color: var(--color-border);
  background: var(--color-surface);
}

/* 위험 표시 */
.danger-flag {
  display: inline-flex;
  align-items: center;

  width: fit-content;

  font-size: var(--font-size-xs);
  font-weight: 700;

  color: var(--color-danger);

  background: var(--color-danger-surface);

  padding: 4px 8px;

  border-radius: var(--radius-full);

  margin-bottom: var(--space-2);
}

.weather-card.muted .danger-flag {
  color: var(--color-text-muted);
  background: var(--color-surface-sunken);
}

/* 상단 */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--space-3);
}

.city-name {
  font-size: var(--font-size-md);
  font-weight: 800;
  margin: 0;
}

.status-label {
  color: var(--color-text-muted);

  font-size: var(--font-size-sm);
  font-weight: 600;
}

/* 온도 */
.temp-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;

  letter-spacing: -0.04em;

  color: var(--color-text);

  margin: var(--space-3) 0 var(--space-4);
}

/* 환경 정보 */
.card-metrics {
  display: flex;

  gap: var(--space-4);

  color: var(--color-text);

  font-size: var(--font-size-sm);

  margin-top: auto;
  margin-bottom: var(--space-3);
}

.metric-label {
  color: var(--color-text-muted);
}
</style>
