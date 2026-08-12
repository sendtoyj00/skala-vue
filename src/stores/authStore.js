import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// [예정] 인증 도메인. 로그인 화면·API가 아직 없어 UI에는 연결하지 않는다. 배치만 확정한다.
// (vue_architecture.md 4.6)
export const useAuthStore = defineStore('auth', () => {
  // state
  const user = ref(null)
  const token = ref(null) // [결정 필요] 저장 위치 — 백엔드 확보 후 결정
  const loginStatus = ref('idle') // 'idle' | 'loading' | 'error'
  const loginError = ref(null)

  // getters
  const isLoggedIn = computed(() => user.value !== null)

  // actions
  async function login(/* credentials */) {
    // [예정] api/authApi.js 연동 후 구현. 인자 시그니처는 확정되어 있다 (service_architecture.md 4절)
  }

  function logout() {
    user.value = null
    token.value = null
  }

  function restoreSession() {
    // [예정] 저장된 세션 복원
  }

  return {
    user,
    token,
    loginStatus,
    loginError,
    isLoggedIn,
    login,
    logout,
    restoreSession,
  }
})
