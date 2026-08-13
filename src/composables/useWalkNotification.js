// 좋음 시간대 알림(F-37). useGeolocation.js와 동일한 원칙 — 진입 시점엔 절대 권한을
// 요청하지 않고, 사용자가 버튼을 눌러야 브라우저 권한 프롬프트가 뜬다.
//
// [범위 한계 — 명시적으로 남김] 이 알림은 이 브라우저 탭이 열려 있는 동안만 동작한다
// (setTimeout 기반 포그라운드 알림). 탭을 닫거나 브라우저를 종료하면 예약된 알림은 발사되지
// 않는다. 탭이 닫혀도 동작하는 진짜 백그라운드 push는 Service Worker + Push API + 구독을
// 저장할 서버가 필요해 이번 범위에서 다루지 않는다.
import { ref, onUnmounted } from 'vue'

const STORAGE_KEY = 'walssi.notifyEnabled.v1'
const LEAD_MINUTES = 10

function loadEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function saveEnabled(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    // 저장 실패는 조용히 무시 — 알림 on/off는 세션 내 동작에는 영향 없다.
  }
}

export function useWalkNotification() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window
  const permission = ref(isSupported ? Notification.permission : 'unsupported') // 'default' | 'granted' | 'denied' | 'unsupported'
  const enabled = ref(isSupported && loadEnabled())

  let timerId = null

  function clearScheduled() {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  function requestPermissionAndEnable() {
    if (!isSupported) {
      permission.value = 'unsupported'
      return
    }
    Notification.requestPermission().then((result) => {
      permission.value = result
      enabled.value = result === 'granted'
      saveEnabled(enabled.value)
    })
  }

  function disable() {
    enabled.value = false
    saveEnabled(false)
    clearScheduled()
  }

  // startAtMs: 다음 "좋음" 구간 시작 timestamp(ms) 또는 null. LEAD_MINUTES분 전에 알림을 예약한다.
  // 이미 지난 시각이거나 대상이 없으면 아무 것도 예약하지 않는다(조용히 무동작).
  function scheduleForWindow(startAtMs) {
    clearScheduled()
    if (!enabled.value || permission.value !== 'granted' || !startAtMs) return

    const fireAt = startAtMs - LEAD_MINUTES * 60 * 1000
    const delay = fireAt - Date.now()
    if (delay <= 0) return

    timerId = setTimeout(() => {
      new Notification('왈씨', { body: `${LEAD_MINUTES}분 뒤부터 산책하기 좋아요!`, icon: '/favicon.ico' })
      timerId = null
    }, delay)
  }

  onUnmounted(clearScheduled)

  return { isSupported, permission, enabled, requestPermissionAndEnable, disable, scheduleForWindow }
}
