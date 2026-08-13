<script setup>
// 헤더 상시 검색(P1) — 지역 날씨 검색(WeatherHomeView)의 search 쿼리와 동일한 계약을 쓴다.
// WeatherHomeView는 setup 시점에 route.query.search를 초기값으로 읽으므로, 여기서 쿼리와 함께
// /weather로 이동시키면 도착한 화면에 검색어가 그대로 이어진다(새 검색 로직을 만들지 않는다).
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

function submit() {
  const trimmed = query.value.trim()
  router.push({ path: '/weather', query: trimmed ? { search: trimmed } : {} })
}
</script>

<template>
  <form class="nav-search" role="search" @submit.prevent="submit">
    <span class="nav-search-icon" aria-hidden="true">🐾</span>
    <label for="nav-search-input" class="visually-hidden">지역 이름으로 날씨 검색</label>
    <input
      id="nav-search-input"
      v-model="query"
      type="search"
      placeholder="지역 날씨 검색…"
      enterkeyhint="search"
    />
  </form>
</template>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.nav-search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1 1 200px;
  max-width: 320px;
  min-width: 0;
  padding: 0 var(--space-3);
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}
.nav-search:focus-within {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-surface);
}
.nav-search-icon {
  font-size: var(--font-size-sm);
  flex-shrink: 0;
  opacity: 0.8;
}
.nav-search input {
  all: unset;
  width: 100%;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-family: var(--font-sans);
}
.nav-search input::placeholder {
  color: var(--color-text-muted);
}
.nav-search input::-webkit-search-cancel-button {
  cursor: pointer;
}
</style>
