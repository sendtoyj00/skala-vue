<script setup>
// 최적 산책 시간(F-32). WalkWindowTimeline(24시간 막대)은 "전체 그림"을, 이 컴포넌트는
// "그래서 언제가 제일 좋아?"라는 단순 질문에 바로 답하는 요약이다 — 같은 데이터(forecastWindows)를
// 다른 해상도로 다시 보여주는 것이지 새 데이터 원천을 쓰지 않는다.
defineProps({
  ranges: { type: Array, required: true }, // [{ startLabel, endLabel }]
})
</script>

<template>
  <div class="best-time">
    <span class="best-time-label">🕒 오늘 산책하기 좋은 시간</span>
    <div v-if="ranges.length > 0" class="chip-row">
      <span v-for="(r, i) in ranges" :key="i" class="chip">{{ r.startLabel }}–{{ r.endLabel }} 좋음</span>
    </div>
    <p v-else class="no-window">오늘은 '좋음' 구간이 없어요. 시간대별 적합도를 참고해 주세요.</p>
  </div>
</template>

<style scoped>
.best-time {
  margin-bottom: var(--space-4);
}
.best-time-label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text);
}
.chip-row {
  margin-top: var(--space-2);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.chip {
  padding: 4px var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-walk-good-surface);
  color: var(--color-walk-good);
  font-size: var(--font-size-xs);
  font-weight: 700;
}
.no-window {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
