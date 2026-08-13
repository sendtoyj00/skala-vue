<script setup>
// 세그먼트 형태로 바꾼다(design_architecture.md 4.7) — 버튼 하나("단위변경")로는 누르면
// 어떤 값이 될지 예측할 수 없었다. 두 옵션을 항상 함께 보여줘 현재 선택과 다음 상태가 한눈에
// 보이게 한다. 앱 전체에 하나뿐이므로 Store를 직접 참조한다(vue_architecture.md 2.4).
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()

function select(unit) {
  if (configStore.unit !== unit) configStore.toggleUnit()
}
</script>

<template>
  <div class="unit-toggler" role="group" aria-label="온도 단위 선택">
    <button
      type="button"
      class="segment"
      :class="{ active: configStore.unit === 'celsius' }"
      :aria-pressed="configStore.unit === 'celsius'"
      @click="select('celsius')"
    >
      ℃
    </button>
    <button
      type="button"
      class="segment"
      :class="{ active: configStore.unit === 'fahrenheit' }"
      :aria-pressed="configStore.unit === 'fahrenheit'"
      @click="select('fahrenheit')"
    >
      ℉
    </button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  padding: 2px;
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
}
.segment {
  min-width: 44px;
  min-height: 32px;
  padding: 4px var(--space-3);
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}
.segment.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
</style>
