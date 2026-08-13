import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

const UNIT_STORAGE_KEY = 'walssi.unit.v1'

export const useConfigStore = defineStore('config', () => {
  // 1. state: 단위를 저장하는 변수 (초기값은 'celsius')
  // 값은 오직 'celsius' 또는 'fahrenheit' 두 가지만 가집니다.
  const unit = ref('celsius')

  // 2. getters: 현재 단위 상태에 맞춰 화면에 뿌릴 기호(℃ / ℉)를 실시간 리턴
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })

  const unitLabel = computed(() => {
    return unit.value === 'celsius' ? '섭씨(℃)' : '화씨(℉)'
  })

  // 3. actions: 버튼 클릭 시 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  // 영속성(vue_architecture.md 4.3 [예정] → 구현). 변환 공식은 여전히 Store에 두지 않는다
  // (domain/temperature.js 소관, 5.1).
  function restoreUnit() {
    const saved = localStorage.getItem(UNIT_STORAGE_KEY)
    if (saved === 'celsius' || saved === 'fahrenheit') unit.value = saved
  }

  watch(unit, (value) => {
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, value)
    } catch {
      // 저장 실패는 조용히 무시 — 단위 표시는 계속 동작한다.
    }
  })

  return {
    unit,
    unitSymbol,
    unitLabel,
    toggleUnit,
    restoreUnit,
  }
})
