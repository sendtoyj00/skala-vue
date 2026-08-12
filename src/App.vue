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
@import '@/assets/layout.css';
</style>
