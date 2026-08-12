<script setup>
// 오류 상태 전용 표시. 빈 결과(empty-state)와 다른 컴포넌트로 분리해
// "통신 실패"와 "검색 결과 0건"이 같은 문구로 섞이지 않게 한다 (design_architecture.md 6절).
defineProps({
  message: {
    type: String,
    default: '정보를 불러오지 못했습니다.',
  },
  retryable: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['retry'])
</script>

<template>
  <div class="error-state" role="alert">
    <span class="error-icon" aria-hidden="true">⚠️</span>
    <p class="error-message">{{ message }}</p>
    <button v-if="retryable" type="button" class="retry-btn" @click="$emit('retry')">다시 시도</button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-3);
  text-align: center;
}
.error-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-danger);
}
.error-message {
  color: var(--color-text);
}
.retry-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.retry-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
