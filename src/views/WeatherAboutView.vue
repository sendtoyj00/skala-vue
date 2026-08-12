<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div>
    <h3>ℹ️ 서비스 소개</h3>
    <hr />

    <div class="description-box">
      <p>본 앱은 <strong>Vue 3</strong> 및 <strong>Vue Router 4</strong> 기반 제작된 실습용 기상 관측 대시보드 시스템입니다.</p>
      <ul>
        <li><code>components/weather/</code>, <code>components/common/</code> 폴더의 독립 부품 연동</li>
        <li>클라이언트 사이드 라우팅을 통한 새로고침 없는 화면 전환</li>
        <li>URL 쿼리 스트링 매핑을 활용한 실시간 검색 상태 동기화</li>
      </ul>
    </div>

    <button @click="handleGoHome" class="home-btn">대시보드 홈으로 이동</button>
  </div>
</template>

<style scoped>
/* 화면 전체가 P4(부가 정보)다. 부가 정보 화면의 장식이 경보의 위험 표시보다 강해서는
   안 되므로 채도 높은 브랜드색 대신 muted 톤으로 정정한다 (design_architecture.md 3절). */
.description-box {
  background-color: var(--color-surface-sunken);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  line-height: 1.5;
  font-size: var(--font-size-sm);
}

ul {
  padding-left: var(--space-5);
  margin: var(--space-2) 0 0 0;
}

li {
  margin-bottom: var(--space-1);
  color: var(--color-text);
}

code {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 2px var(--space-1);
  border-radius: var(--radius-sm);
  color: var(--color-text);
}

.home-btn {
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-3);
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-weight: bold;
  cursor: pointer;
}
.home-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
