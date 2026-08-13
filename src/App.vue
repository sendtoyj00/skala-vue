<script setup>
// 앱 셸. 헤더(T1/T2 탐색 + 대상 개체 표시) + RouterView 1개 + 푸터(P4)로 구성한다
// (design_architecture.md 3.2). 대상 개체 표시를 헤더에 두는 이유: 다견 가정에서 어느 아이
// 기준 판정인지 모르면 판정 전체를 신뢰할 수 없다(service_architecture.md 4.7) — 화면마다
// 반복하지 않고 셸에 한 번만 둔다.
import UnitToggler from './components/weather/UnitToggler.vue'
import DogSelector from './components/dog/DogSelector.vue'
import NavSearch from './components/common/NavSearch.vue'
import { useConfigStore } from './stores/configStore'
import { useDogStore } from './stores/dogStore'
import { useWalkLogStore } from './stores/walkLogStore'

// 영속 상태 복원은 셸에서 한 번만 한다 — 화면마다 각자 복원하면 순서 경쟁이 생긴다.
useConfigStore().restoreUnit()
useDogStore().restoreDogs()
useWalkLogStore().restoreLogs()
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="26" height="26">
              <ellipse cx="20" cy="24.5" rx="8.6" ry="9.6" fill="currentColor" />
              <ellipse cx="9" cy="14" rx="4.6" ry="5.6" fill="currentColor" />
              <ellipse cx="31" cy="14" rx="4.6" ry="5.6" fill="currentColor" />
              <ellipse cx="12.5" cy="4.5" rx="4" ry="5" fill="currentColor" />
              <ellipse cx="27.5" cy="4.5" rx="4" ry="5" fill="currentColor" />
            </svg>
          </span>
          <span class="brand-text">
            <span class="brand-name">왈씨</span>
            <span class="brand-sub">Walssi</span>
          </span>
        </RouterLink>

        <nav class="nav-links" aria-label="주요 메뉴">
          <RouterLink to="/" class="nav-item">
            <span aria-hidden="true">🐕</span> 산책 판정
          </RouterLink>
          <RouterLink to="/weather" class="nav-item">
            <span aria-hidden="true">🌦️</span> 지역 날씨
          </RouterLink>
          <RouterLink to="/weather/alerts" class="nav-item">
            <span aria-hidden="true">⚠️</span> 산책 불가 지역
          </RouterLink>
          <RouterLink to="/walks" class="nav-item">
            <span aria-hidden="true">📒</span> 산책 기록
          </RouterLink>
          <RouterLink to="/about" class="nav-item">
            <span aria-hidden="true">ℹ️</span> 서비스 소개
          </RouterLink>
        </nav>

        <NavSearch />

        <div class="nav-tools">
          <DogSelector />
          <span class="tools-divider" aria-hidden="true"></span>
          <UnitToggler />
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <!-- 셸 레벨 면책·출처 안내(P4) — 판정 대상이 동물이라 오독 비용이 크다(service_architecture.md
         11절). 크기는 최소이되 숨기지 않는다(design_architecture.md 2.3). -->
    <footer class="app-footer">
      <div class="footer-inner">
        <p class="footer-brand">🐾 왈씨 Walssi</p>
        <p class="footer-disclaimer">
          이 서비스는 참고용 정보를 제공하며 수의학적 진단을 대체하지 않습니다. 개체의 건강 상태는
          수의사와 상담하세요.
        </p>
        <p class="footer-source">
          현재 날씨·예보·대기질은 OpenWeatherMap, 노면 실측온도는 기상청 도로기상관측자료를
          사용합니다. 실측 관측점이 없는 지역은 기온과 일사 조건으로 지면온도를 추정해 표시합니다.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
@import '@/assets/layout.css';
</style>
