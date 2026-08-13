<script setup>
// 산책 기록(F-38). "산책 시작→진행중→완료" 세션 상태는 만들지 않는다 — 새로고침·탭 이동 중에
// 세션이 깨지는 문제를 피하려면 그 자체로 별도 저장소가 필요해지는데, 이 서비스는 실시간 GPS
// 추적 앱이 아니다. 대신 판정을 확인하고 나서 "방금 산책한 시간"을 짧게 기록하는 방식으로
// 범위를 좁힌다(과설계 방지).
import { ref } from 'vue'
import { useWalkLogStore } from '@/stores/walkLogStore'

const props = defineProps({
  dogId: { type: String, default: null },
  verdict: { type: Object, default: null }, // { level, maxMinutes, reasons }
  routeLabel: { type: String, default: null },
})

const walkLogStore = useWalkLogStore()

const minutes = ref(30)
const note = ref('')
const savedAt = ref(0)

function suggestedMinutes() {
  if (!props.verdict || !props.verdict.maxMinutes) return 30
  return Math.min(props.verdict.maxMinutes, 30)
}
minutes.value = suggestedMinutes()

let hideTimer = null
function saveLog() {
  if (!props.dogId || !props.verdict || !minutes.value || minutes.value <= 0) return
  walkLogStore.addLog({
    dogId: props.dogId,
    startedAt: Date.now(),
    durationMinutes: minutes.value,
    level: props.verdict.level,
    routeLabel: props.routeLabel,
    note: note.value,
  })
  note.value = ''
  savedAt.value = Date.now()
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    savedAt.value = 0
  }, 2500)
}
</script>

<template>
  <section v-if="verdict && dogId" class="log-quick-add" aria-labelledby="log-quick-add-title">
    <h2 id="log-quick-add-title">🐾 산책 기록 남기기</h2>
    <div class="log-form">
      <label class="minutes-field">
        <span>산책 시간(분)</span>
        <el-input-number v-model="minutes" :min="1" :max="180" :step="5" size="default" />
      </label>
      <el-input v-model="note" placeholder="메모(선택) — 예: 공원에서 잘 뛰었어요" maxlength="60" />
      <el-button type="primary" round @click="saveLog">산책 기록 저장</el-button>
    </div>
    <p v-if="savedAt" class="saved-note">기록했어요 🐾 — <RouterLink to="/walks">산책 기록 보기</RouterLink></p>
  </section>
</template>

<style scoped>
.log-quick-add {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}
.log-quick-add h2 {
  margin: 0 0 var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 700;
}
.log-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.minutes-field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.saved-note {
  margin: var(--space-3) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-safe);
}
.saved-note a {
  color: inherit;
  font-weight: 700;
}
</style>
