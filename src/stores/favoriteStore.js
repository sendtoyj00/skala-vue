import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// [예정] 즐겨찾기 도메인. 서비스 기능(F-14)이 아직 화면에 없어 UI에는 연결하지 않는다.
// 배치만 먼저 확정한다 — 도시 id만 저장하고 Weather는 참조하지 않는다(vue_architecture.md 4.5, 4.7).
export const useFavoriteStore = defineStore('favorite', () => {
  // state
  const favoriteCityIds = ref([])
  const saveStatus = ref('idle') // 'idle' | 'saving' | 'error'
  const saveError = ref(null)

  // getters
  const isFavorite = computed(() => (cityId) => favoriteCityIds.value.includes(cityId))
  const favoriteCount = computed(() => favoriteCityIds.value.length)

  // actions
  // 쓰기 시점의 로그인 전제 조건은 authStore를 여기서 단방향으로 참조해 검사한다(서열 규칙, vue_architecture.md 4.7).
  function toggleFavorite(cityId) {
    const idx = favoriteCityIds.value.indexOf(cityId)
    if (idx === -1) {
      favoriteCityIds.value.push(cityId)
    } else {
      favoriteCityIds.value.splice(idx, 1)
    }
  }

  function restoreFavorites() {
    // [예정] localStorage 복원 (vue_architecture.md 4.9)
  }

  return {
    favoriteCityIds,
    saveStatus,
    saveError,
    isFavorite,
    favoriteCount,
    toggleFavorite,
    restoreFavorites,
  }
})
