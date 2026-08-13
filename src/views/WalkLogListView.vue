<script setup>
// 산책 기록 목록(F-38). DogListView.vue와 같은 레이아웃 원칙(온보딩 → 리스트)을 따른다.
import { computed } from 'vue'
import { useDogStore } from '@/stores/dogStore'
import { useWalkLogStore } from '@/stores/walkLogStore'

const dogStore = useDogStore()
const walkLogStore = useWalkLogStore()

const activeDogId = computed(() => dogStore.activeDog?.id ?? null)
const logs = computed(() => (activeDogId.value ? walkLogStore.logsForDog(activeDogId.value) : []))
const stats = computed(() => (activeDogId.value ? walkLogStore.statsForDog(activeDogId.value) : null))

const LEVEL_LABEL = { good: '좋음', caution: '주의', limited: '제한', unsafe: '위험' }
const LEVEL_ORDER = ['good', 'caution', 'limited', 'unsafe']

const maxLevelCount = computed(() => {
  if (!stats.value) return 0
  return Math.max(1, ...LEVEL_ORDER.map((level) => stats.value.levelCounts[level]))
})

function fmtDate(ts) {
  return new Date(ts).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="dashboard-wrapper">
    <p class="page-eyebrow">Walks</p>
    <h1 class="page-title">산책 기록</h1>
    <p class="page-desc">기록을 남기면 이번 달 산책 통계를 여기서 볼 수 있어요.</p>

    <div v-if="!dogStore.hasProfile" class="onboarding">
      <p class="onboarding-icon" aria-hidden="true">🐕</p>
      <p class="onboarding-text">반려견을 먼저 등록해야 산책 기록을 남길 수 있어요.</p>
      <RouterLink to="/dogs" class="add-btn">반려견 등록하기</RouterLink>
    </div>

    <template v-else>
      <section v-if="stats" class="stats-card">
        <div class="stats-summary">
          <div class="stat">
            <span class="stat-num metric">{{ stats.count }}</span>
            <span class="stat-label">이번 달 산책</span>
          </div>
          <div class="stat">
            <span class="stat-num metric">{{ stats.totalMinutes }}</span>
            <span class="stat-label">총 분(min)</span>
          </div>
        </div>
        <div class="level-bars">
          <div v-for="level in LEVEL_ORDER" :key="level" class="level-bar-row">
            <span class="level-bar-label">{{ LEVEL_LABEL[level] }}</span>
            <div class="level-bar-track">
              <div
                class="level-bar-fill"
                :class="`level-${level}`"
                :style="{ width: `${(stats.levelCounts[level] / maxLevelCount) * 100}%` }"
              ></div>
            </div>
            <span class="level-bar-count metric">{{ stats.levelCounts[level] }}</span>
          </div>
        </div>
      </section>

      <div v-if="logs.length === 0" class="onboarding">
        <p class="onboarding-icon" aria-hidden="true">📒</p>
        <p class="onboarding-text">아직 기록된 산책이 없어요.<br />홈에서 판정을 확인한 뒤 산책 기록을 남겨보세요.</p>
        <RouterLink to="/" class="add-btn">산책 판정 보러 가기</RouterLink>
      </div>

      <ul v-else class="log-list">
        <li v-for="log in logs" :key="log.id" class="log-row">
          <span class="log-badge" :class="`level-${log.level}`">{{ LEVEL_LABEL[log.level] ?? log.level }}</span>
          <div class="log-body">
            <span class="log-line">
              <span class="metric">{{ fmtDate(log.startedAt) }}</span>
              · <span class="metric">{{ log.durationMinutes }}분</span>
              <span v-if="log.routeLabel"> · {{ log.routeLabel }}</span>
            </span>
            <span v-if="log.note" class="log-note">{{ log.note }}</span>
          </div>
          <button class="delete-btn" aria-label="기록 삭제" @click="walkLogStore.removeLog(log.id)">✕</button>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
h1 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-1);
}
.page-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-5);
}
.onboarding {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}
.onboarding-icon {
  font-size: 40px;
  margin: 0 0 var(--space-3);
}
.onboarding-text {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-4);
}
.add-btn {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-md);
  font-weight: 700;
  text-decoration: none;
}

.stats-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}
.stats-summary {
  display: flex;
  gap: var(--space-6);
  margin-bottom: var(--space-4);
}
.stat {
  display: flex;
  flex-direction: column;
}
.stat-num {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-text);
}
.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.level-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.level-bar-row {
  display: grid;
  grid-template-columns: 40px 1fr 24px;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
}
.level-bar-label {
  color: var(--color-text-muted);
}
.level-bar-track {
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--color-surface-sunken);
  overflow: hidden;
}
.level-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s;
}
.level-bar-count {
  text-align: right;
  color: var(--color-text-muted);
}
.level-good {
  background: var(--color-walk-good);
}
.level-caution {
  background: var(--color-walk-caution);
}
.level-limited {
  background: var(--color-walk-limited);
}
.level-unsafe {
  background: var(--color-walk-unsafe);
}

.log-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.log-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}
.log-badge {
  flex-shrink: 0;
  padding: 4px var(--space-2);
  border-radius: var(--radius-full);
  color: var(--color-on-walk);
  font-size: 11px;
  font-weight: 700;
}
.log-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.log-line {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}
.log-note {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  overflow-wrap: break-word;
}
.delete-btn {
  flex-shrink: 0;
  min-width: 32px;
  min-height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-sm);
}
</style>
