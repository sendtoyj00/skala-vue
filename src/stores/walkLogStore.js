import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

// 산책 기록의 단일 출처. dogStore.js와 정확히 같은 패턴(로그인 없이 localStorage로 완전히
// 동작, watch 기반 영속화)을 따른다 — 이 저장소가 이미 검증한 방식이라 새로 고안하지 않는다.

const STORAGE_KEY = 'walssi.walkLogs.v1'

const LEVELS = ['good', 'caution', 'limited', 'unsafe']

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLogs(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // 저장 실패(용량 초과·프라이빗 모드 등)는 화면 동작을 막지 않는다 — 조용히 무시한다.
  }
}

export const useWalkLogStore = defineStore('walkLog', () => {
  const logs = ref([])

  function addLog({ dogId, startedAt, durationMinutes, level, routeLabel, note }) {
    const id = `walklog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    logs.value.unshift({
      id,
      dogId,
      startedAt,
      durationMinutes,
      level,
      routeLabel: routeLabel ?? null,
      note: note?.trim() || '',
    })
    return id
  }

  function removeLog(logId) {
    logs.value = logs.value.filter((l) => l.id !== logId)
  }

  // 최신순 정렬. dogId별로 걸러 화면에 전달한다(여러 개를 등록해도 기록이 섞이지 않게).
  function logsForDog(dogId) {
    return logs.value.filter((l) => l.dogId === dogId).sort((a, b) => b.startedAt - a.startedAt)
  }

  // 이번 달 통계 — 캘린더/그래프 없이도 "얼마나 산책했는지"를 바로 답한다.
  function statsForDog(dogId) {
    const now = new Date()
    const monthLogs = logsForDog(dogId).filter((l) => {
      const d = new Date(l.startedAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    const levelCounts = { good: 0, caution: 0, limited: 0, unsafe: 0 }
    let totalMinutes = 0
    for (const log of monthLogs) {
      totalMinutes += log.durationMinutes ?? 0
      if (LEVELS.includes(log.level)) levelCounts[log.level] += 1
    }
    return { count: monthLogs.length, totalMinutes, levelCounts }
  }

  function restoreLogs() {
    logs.value = loadLogs()
  }

  watch(logs, (value) => saveLogs(value), { deep: true })

  return {
    logs,
    addLog,
    removeLog,
    logsForDog,
    statsForDog,
    restoreLogs,
  }
})
