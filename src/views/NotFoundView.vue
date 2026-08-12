<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <!-- 전체 화면을 중앙 정렬하기 위한 래퍼 -->
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 시각적 포인트를 위한 아이콘 또는 큰 텍스트 (옵션) -->
      <div class="error-icon">☀️❓</div>

      <h2>페이지를 찾을 수 없습니다.</h2>
      <p>요청하신 주소가 존재하지 않거나,<br />아직 개발되지 않았습니다.</p>

      <!-- 포인트 컬러가 적용된 버튼 -->
      <button class="home-button" @click="goHome">날씨 메인으로 이동</button>
    </div>
  </div>
</template>

<!-- Scoped CSS로 이 컴포넌트에만 스타일 적용 -->
<style scoped>
/* 다른 화면과 같은 토큰(폰트·색·반경)을 써서 톤을 통일한다 (design_architecture.md 3절). */
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: var(--color-surface-sunken);
}

.not-found-content {
  text-align: center;
  background-color: var(--color-surface);
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.error-icon {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-5);
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

p {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-8);
}

.home-button {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
  font-weight: 500;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.home-button:hover {
  opacity: 0.9;
}

.home-button:active {
  transform: scale(0.98);
}
</style>
