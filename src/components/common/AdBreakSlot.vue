<script setup>
// Google Ad Placement(adBreak) 연동 — index.html의 data-adbreak-test="on"로 테스트 모드다.
// 정책 준수 배치(service_architecture.md 10절): 판정 카드(WalkVerdictCard)·타임라인처럼
// "안전 여부를 알려주는" 요소 옆에는 절대 두지 않는다. 지역 날씨 화면 외에 유일한 예외는
// WalkHomeView 맨 아래 WalkChecklist(준비물 체크리스트) — 판정 정보가 아닌 보조 기능이라
// 광고가 판정 신뢰도에 영향을 주지 않는다고 판단해 배치했다(WalkChecklist.vue 주석 참조).
// 어떤 기능도 광고 시청으로 잠그지 않는다 — 여기서는 순수 보상형(선택, 안 봐도 아무것도
// 막히지 않음)으로만 쓴다.
//
// 참고: Google Ad Placement API는 정책상 게임 콘텐츠 전용이다
// (developers.google.com/ad-placement/docs/test). 왈씨는 게임이 아니므로 실제 운영 전환 시
// 표준 AdSense 디스플레이 광고 단위로 교체하는 것이 정책에 맞다 — 지금은 테스트 모드로
// 연동 경로만 시연한다.
import { ref } from 'vue'

const status = ref('idle') // 'idle' | 'loading' | 'done'

function showAd() {
  if (typeof window.adBreak !== 'function') {
    status.value = 'done'
    return
  }
  status.value = 'loading'

  // 광고 네트워크가 차단되거나(광고 차단기·오프라인) 스크립트가 아예 응답하지 않으면
  // adBreak의 콜백이 영영 안 불릴 수 있다 — "불러오는 중…"에 갇히지 않도록 안전장치를 둔다.
  // 광고는 부가 기능이라 실패해도 화면의 다른 어떤 기능도 막지 않는다(정책 원칙과 동일선상).
  const timeoutId = setTimeout(() => {
    if (status.value === 'loading') status.value = 'idle'
  }, 4000)
  const clearAndSet = (next) => {
    clearTimeout(timeoutId)
    status.value = next
  }

  window.adBreak({
    type: 'reward',
    name: 'weather_extra_tip',
    beforeReward: (showAdFn) => showAdFn(),
    adDismissed: () => {
      clearAndSet('idle')
    },
    adViewed: () => {
      clearAndSet('done')
    },
    adBreakDone: () => {
      if (status.value === 'loading') clearAndSet('idle')
    },
  })
}
</script>

<template>
  <div class="ad-slot">
    <span class="ad-badge">광고</span>
    <template v-if="status === 'done'">
      <span class="ad-copy">시청해 주셔서 감사해요 🐾</span>
    </template>
    <template v-else>
      <span class="ad-copy">짧은 광고를 보면 왈씨 운영에 도움이 돼요(선택)</span>
      <button class="ad-btn" :disabled="status === 'loading'" @click="showAd">
        {{ status === 'loading' ? '불러오는 중…' : '광고 보기' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.ad-slot {
  margin-top: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px dashed var(--color-border);
  background: var(--color-surface-sunken);
  border-radius: var(--radius-md);
  max-height: 120px;
}
.ad-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1px 6px;
  flex-shrink: 0;
}
.ad-copy {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  flex: 1;
}
.ad-btn {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  cursor: pointer;
  min-height: 32px;
  flex-shrink: 0;
}
.ad-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
