<script setup>
import UnitToggler from './components/weather/UnitToggler.vue'
</script>

<template>
  <div class="app-shell">
    <nav class="navigation-bar">
      <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/weather/alerts" class="nav-item">⚠️ 위험 날씨 경보</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
      <UnitToggler />
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/exercise.css';
</style>
