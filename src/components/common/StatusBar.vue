<script setup>
// 알림 문구 표시 전용 컴포넌트 (상태 없음, message prop만 그대로 렌더링)
defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="status-bar">
    {{ message }}
  </div>
</template>

<style scoped>
/* 조작 피드백 전용. 배경 채움·성공색(초록) 금지, 좌측 정렬(문구 길이가 매번 달라
   중앙 정렬은 위치가 흔들린다) — design_architecture.md 3절, 6절. */
.status-bar {
  background: var(--color-info-surface);
  padding: var(--space-2) var(--space-3);
  text-align: left;
  color: var(--color-info);
  font-weight: 600;
  border-radius: var(--radius-sm);
}
</style>
