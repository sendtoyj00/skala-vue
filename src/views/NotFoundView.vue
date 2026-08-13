<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'WalkHome' })
}
</script>

<template>
  <!-- 전체 화면을 중앙 정렬하기 위한 래퍼 -->
  <div class="not-found-container">
    <div class="not-found-content">
      <span class="error-icon" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <ellipse cx="20" cy="28" rx="10" ry="8" fill="currentColor" />
          <ellipse cx="7" cy="17" rx="4.2" ry="5.2" fill="currentColor" />
          <ellipse cx="15.5" cy="9" rx="4.6" ry="5.6" fill="currentColor" />
          <ellipse cx="24.5" cy="9" rx="4.6" ry="5.6" fill="currentColor" />
          <ellipse cx="33" cy="17" rx="4.2" ry="5.2" fill="currentColor" />
        </svg>
      </span>

      <h2>페이지를 찾을 수 없습니다.</h2>
      <p>요청하신 주소가 존재하지 않거나,<br />아직 개발되지 않았습니다.</p>

      <!-- 포인트 컬러가 적용된 버튼 -->
      <button class="home-button" @click="goHome">오늘 산책으로 이동</button>
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
  background-color: var(--color-canvas);
  padding: var(--space-4);
}

.not-found-content {
  text-align: center;
  background-color: var(--color-surface);
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  max-width: 400px;
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--color-primary-surface);
  color: var(--color-primary);
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
