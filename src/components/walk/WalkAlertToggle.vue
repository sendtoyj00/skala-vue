<script setup>
// 좋음 시간대 알림 토글 UI(F-37). LocationBadge.vue/AdBreakSlot.vue와 동일한 opt-in 버튼
// 패턴 — 버튼을 누르기 전엔 브라우저 권한 API를 절대 건드리지 않는다.
import { watch } from 'vue'
import { useWalkNotification } from '@/composables/useWalkNotification'

const props = defineProps({
  nextGoodWindowAt: { type: Number, default: null },
})

const { isSupported, permission, enabled, requestPermissionAndEnable, disable, scheduleForWindow } =
  useWalkNotification()

watch(
  () => props.nextGoodWindowAt,
  (startAt) => scheduleForWindow(startAt),
  { immediate: true },
)
watch(enabled, (value) => scheduleForWindow(value ? props.nextGoodWindowAt : null))

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}
</script>

<template>
  <div v-if="isSupported" class="alert-toggle">
    <template v-if="enabled">
      <span class="alert-status">🔔 알림 켜짐</span>
      <button type="button" class="alert-btn" @click="disable">끄기</button>
    </template>
    <button
      v-else-if="permission !== 'denied' && nextGoodWindowAt"
      type="button"
      class="alert-btn"
      @click="requestPermissionAndEnable"
    >
      🔔 {{ fmtTime(nextGoodWindowAt) }} 시작 전에 알림 받기
    </button>
    <p v-if="permission === 'denied'" class="alert-note">
      브라우저 설정에서 알림 권한을 허용하면 좋음 시간대를 알려드릴 수 있어요.
    </p>
    <p v-if="enabled || (permission !== 'denied' && nextGoodWindowAt)" class="alert-note">
      이 브라우저 탭이 열려 있는 동안만 알려드려요.
    </p>
  </div>
</template>

<style scoped>
.alert-toggle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
.alert-status {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-primary);
}
.alert-btn {
  min-height: 36px;
  padding: 4px var(--space-3);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 700;
  cursor: pointer;
}
.alert-note {
  width: 100%;
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
