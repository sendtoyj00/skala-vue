<script setup>
// 산책 체크리스트(F-36). 판정(WalkVerdictCard)과 달리 "안전 여부를 알려주는 정보"가 아니라
// "나가기 전 준비를 돕는 보조 기능"이라, AdBreakSlot을 이 화면(WalkHomeView)에 두는 유일한
// 예외로 판단했다 — 광고가 판정 신뢰도에 영향을 주지 않도록 체크리스트 아래, 판정 카드와는
// 최대한 멀리 떨어뜨려 배치한다(AdBreakSlot.vue 주석의 "판정 화면엔 절대 배치 금지" 원칙은
// 판정 카드 자체에 대한 것으로 좁혀 해석한다).
import { ref, watch } from 'vue'
import AdBreakSlot from '@/components/common/AdBreakSlot.vue'

const STORAGE_KEY = 'walssi.checklist.v1'

const DEFAULT_ITEMS = [
  { id: 'water', icon: '💧', label: '물 / 휴대용 급수기' },
  { id: 'poop_bag', icon: '💩', label: '배변봉투' },
  { id: 'leash', icon: '🦮', label: '리드줄·하네스' },
  { id: 'treat', icon: '🍖', label: '간식(보상용)' },
  { id: 'shoes', icon: '👟', label: '신발 또는 패드 보호제(지면 뜨거울 때)' },
  { id: 'id_tag', icon: '🏷️', label: '인식표·목줄' },
]

function loadChecked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const checked = ref(loadChecked())

watch(
  checked,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 저장 실패는 조용히 무시 — 체크리스트는 세션 내 동작에는 영향 없다.
    }
  },
  { deep: true },
)

const checkedCount = () => Object.values(checked.value).filter(Boolean).length
</script>

<template>
  <details class="checklist" open v-glow-tilt>
    <summary>🎒 산책 준비물 체크리스트 ({{ checkedCount() }}/{{ DEFAULT_ITEMS.length }})</summary>
    <ul class="items">
      <li v-for="item in DEFAULT_ITEMS" :key="item.id">
        <el-checkbox v-model="checked[item.id]" :label="`${item.icon} ${item.label}`" size="large" />
      </li>
    </ul>
    <AdBreakSlot />
  </details>
</template>

<style scoped>
.checklist {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
}
.checklist summary {
  cursor: pointer;
  font-weight: 700;
  font-size: var(--font-size-sm);
  min-height: 44px;
  display: flex;
  align-items: center;
}
.items {
  list-style: none;
  margin: var(--space-2) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2);
}
.items li {
  min-width: 0;
}
/* Element Plus 체크박스는 기본이 한 줄(white-space: nowrap) 라벨이라 긴 항목("신발 또는
   패드 보호제(지면 뜨거울 때)")이 카드 밖으로 삐져나갔다 — 줄바꿈을 허용하고 체크박스를
   첫 줄 텍스트에 맞춰 위쪽 정렬한다. */
.items li :deep(.el-checkbox) {
  display: flex;
  align-items: flex-start;
  height: auto;
  width: 100%;
  white-space: normal;
}
.items li :deep(.el-checkbox__input) {
  margin-top: 2px;
}
.items li :deep(.el-checkbox__label) {
  white-space: normal;
  overflow-wrap: break-word;
  line-height: 1.4;
}
</style>
