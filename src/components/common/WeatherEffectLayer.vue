<script setup>
// 날씨 무드별 배경 장식(App.vue의 data-weather와 동일한 값을 그대로 받는다). 상태 정보를
// 전달하지 않는 순수 장식이라 aria-hidden으로 완전히 숨긴다 — WalkVerdictCard의 발자국
// 트레일 장식과 같은 원칙(design_architecture.md 4.2). 화면 전체 고정 레이어라 main 콘텐츠
// 클릭을 막지 않도록 pointer-events: none을 건다.
//
// 위치·지속시간의 변주는 CSS calc()가 아니라 여기서 미리 계산해 인라인 스타일로 꽂는다 —
// calc()는 modulo(%) 연산을 지원하지 않아 `calc((var(--i) * 4.3%) % 100%)` 같은 식은 통째로
// 무효 선언이 되고, 그 결과 모든 파티클이 좌표 없이 한 자리에 겹쳐 "안 보이는" 상태가 된다.
import { computed } from 'vue'

const props = defineProps({
  mood: {
    type: String,
    default: null,
  },
})

function makeRaindrops(count, fast) {
  return Array.from({ length: count }, (_, i) => ({
    key: `rd-${i}`,
    style: {
      left: `${((i * 4.3) % 100).toFixed(1)}%`,
      animationDuration: `${(fast ? 0.45 : 0.7) + (i % 5) * (fast ? 0.1 : 0.15)}s`,
      animationDelay: `${(i * -0.22).toFixed(2)}s`,
    },
  }))
}

function makeSnowflakes(count) {
  return Array.from({ length: count }, (_, i) => ({
    key: `sf-${i}`,
    style: {
      left: `${((i * 5.1) % 100).toFixed(1)}%`,
      animationDuration: `${7 + (i % 6) * 1.4}s, ${3 + (i % 4) * 0.6}s`,
      animationDelay: `${(i * -0.6).toFixed(2)}s`,
    },
  }))
}

function makeSparkles(count) {
  return Array.from({ length: count }, (_, i) => ({
    key: `sp-${i}`,
    style: {
      top: `${6 + i * 8}%`,
      left: `${4 + ((i * 9) % 92)}%`,
      animationDelay: `${(i * 0.4).toFixed(2)}s`,
    },
  }))
}

const raindrops = computed(() => makeRaindrops(24, props.mood === 'storm'))
const snowflakes = computed(() => makeSnowflakes(20))
const sparkles = computed(() => makeSparkles(10))
</script>

<template>
  <div v-if="mood" class="weather-fx" :class="`fx-${mood}`" aria-hidden="true">
    <template v-if="mood === 'sunny' || mood === 'hot'">
      <span class="fx-sun"></span>
      <span v-for="s in sparkles" :key="s.key" class="fx-sparkle" :style="s.style"></span>
    </template>

    <template v-if="mood === 'rain' || mood === 'storm'">
      <span v-for="r in raindrops" :key="r.key" class="fx-raindrop" :style="r.style"></span>
      <span v-if="mood === 'storm'" class="fx-flash"></span>
    </template>

    <template v-if="mood === 'snow'">
      <span v-for="f in snowflakes" :key="f.key" class="fx-snowflake" :style="f.style"></span>
    </template>
  </div>
</template>

<style scoped>
.weather-fx {
  position: fixed;
  inset: 0;
  /* app-topbar(z-index: 30)까지 포함해 화면 전체 위에 올려야 카드가 빼곡한 대시보드에서도
     보인다 — 카드 사이 여백(투명한 canvas)만으로는 노출 면적이 너무 적었다. 텍스트를
     가리지 않도록 각 효과 요소는 낮은 불투명도를 유지한다. */
  z-index: 40;
  overflow: hidden;
  pointer-events: none;
}

/* ── 맑음 · 더위 ─────────────────────────────────────────────────────── */

.fx-sun {
  position: absolute;
  top: -60px;
  right: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--yl-300) 65%, transparent) 0%, transparent 70%);
  animation: fx-pulse 6s ease-in-out infinite;
}
.fx-hot .fx-sun {
  background: radial-gradient(circle, color-mix(in srgb, var(--or-300) 55%, transparent) 0%, transparent 70%);
}
.fx-sparkle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--yl-400) 70%, transparent);
  opacity: 0;
  animation: fx-twinkle 4.5s ease-in-out infinite;
}
.fx-hot .fx-sparkle {
  background: color-mix(in srgb, var(--or-400) 70%, transparent);
}

/* ── 비 · 폭풍 ───────────────────────────────────────────────────────── */

.fx-raindrop {
  position: absolute;
  top: -40px;
  width: 2px;
  height: 22px;
  border-radius: var(--radius-full);
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--sk-500) 65%, transparent));
  animation: fx-fall linear infinite;
}
.fx-storm .fx-raindrop {
  height: 30px;
}
.fx-flash {
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0;
  animation: fx-flash 7s ease-in-out infinite;
}

/* ── 눈 ──────────────────────────────────────────────────────────────── */

.fx-snowflake {
  position: absolute;
  top: -20px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--sk-100) 40%, white);
  animation:
    fx-snow-fall linear infinite,
    fx-snow-sway ease-in-out infinite;
}

/* ── 애니메이션 ──────────────────────────────────────────────────────── */

@keyframes fx-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}
@keyframes fx-twinkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.6);
  }
  50% {
    opacity: 0.9;
    transform: scale(1);
  }
}
@keyframes fx-fall {
  from {
    transform: translateY(-40px);
  }
  to {
    transform: translateY(110vh);
  }
}
@keyframes fx-flash {
  0%,
  92%,
  100% {
    opacity: 0;
  }
  93% {
    opacity: 0.25;
  }
  94% {
    opacity: 0;
  }
  95% {
    opacity: 0.15;
  }
  96% {
    opacity: 0;
  }
}
@keyframes fx-snow-fall {
  from {
    transform: translateY(-20px);
  }
  to {
    transform: translateY(110vh);
  }
}
@keyframes fx-snow-sway {
  0%,
  100% {
    margin-left: -8px;
  }
  50% {
    margin-left: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-fx * {
    animation: none !important;
  }
}
</style>
