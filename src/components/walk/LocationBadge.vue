<script setup>
// 현재 위치(F-31) UI. mock 좌표로 즉시 렌더링을 시작하고, 사용자가 버튼을 눌러야 실제
// Geolocation permission prompt가 뜨게 한다 — 진입 즉시 팝업을 띄우면 대부분 거부로
// 이어진다는 경험칙(design_architecture.md 6.4의 "사용자 행동을 막지 않는다" 연장 해석).
defineProps({
  cityName: { type: String, default: '' },
  source: { type: String, required: true }, // 'mock' | 'gps' | 'denied' | 'unsupported'
  status: { type: String, required: true }, // 'idle' | 'loading' | 'success' | 'error'
})

const emit = defineEmits(['request'])
</script>

<template>
  <div class="location-badge">
    <span class="pin" aria-hidden="true">📍</span>
    <span class="location-text">
      {{ cityName || '현재 위치' }}
      <span class="source-tag">{{ source === 'gps' ? '(실제 위치)' : '(기본 위치)' }}</span>
    </span>
    <button
      v-if="source !== 'gps'"
      type="button"
      class="locate-btn"
      :disabled="status === 'loading'"
      @click="emit('request')"
    >
      {{ status === 'loading' ? '위치 확인 중…' : '내 위치로 보기' }}
    </button>
    <p v-if="source === 'denied'" class="denied-note">위치 접근이 거부됐어요. 기본 위치 기준으로 보여드려요.</p>
  </div>
</template>

<style scoped>
.location-badge {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
}
.pin {
  font-size: var(--font-size-sm);
}
.location-text {
  color: var(--color-text);
  font-weight: 600;
}
.source-tag {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.locate-btn {
  margin-left: auto;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  padding: 4px var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 700;
  cursor: pointer;
  min-height: 32px;
}
.locate-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.denied-note {
  width: 100%;
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
