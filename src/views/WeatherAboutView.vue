<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="dashboard-wrapper">
    <p class="page-eyebrow">About · P4</p>
    <h3 class="page-title">🌱 왈씨 이야기</h3>

    <div class="description-box">
      <p>왈씨는 강아지 기준으로 <strong>지금 산책해도 되는지</strong> 알려주는 서비스예요. 아래 순서대로 따라오시면 바로 쓰실 수 있어요.</p>

      <h4>1. 반려견 등록하기</h4>
      <ul>
        <li>사이드바의 <strong>댕댕이들</strong>에서 견종·연령·체중을 등록하면, 그 강아지 기준으로 판정이 시작돼요.</li>
        <li>여러 마리를 등록했다면 상단바의 반려견 선택기로 기준이 되는 강아지를 바꿀 수 있어요.</li>
      </ul>

      <h4>2. 오늘 산책 확인하기</h4>
      <ul>
        <li>사이드바 첫 메뉴 <strong>오늘 산책</strong>(홈 화면)에서 지금 나가도 되는지, 얼마나 걸을 수 있는지 바로 보여드려요.</li>
        <li>판정 카드 아래 "판정 근거 자세히 보기"를 펼치면 어떤 조건 때문에 그런 판정이 나왔는지 확인할 수 있어요.</li>
        <li>발바닥 화상 위험을 지면 온도로 따로 표시하니, 기온만 보고 방심하지 마세요.</li>
        <li>추천 산책 경로 카드에서 코스를 고르고 "지도에서 경로 보기"로 실제 지도에 표시할 수 있어요.</li>
      </ul>

      <h4>3. 동네 날씨·주의보 살펴보기</h4>
      <ul>
        <li><strong>동네 날씨</strong>에서 지역별 현재 날씨를 검색하고, 카드를 클릭하면 상세 예보로 이동해요.</li>
        <li><strong>산책 주의보</strong>에서 폭염·한파 등 위험 날씨 경보를 모아 볼 수 있어요.</li>
        <li>상단바의 <strong>℃/℉ 전환 버튼</strong>으로 온도 표시 단위를 언제든 바꿀 수 있어요.</li>
      </ul>

      <h4>4. 산책 다이어리 남기기</h4>
      <ul>
        <li>산책을 다녀온 뒤 홈 화면에서 시간과 경로를 짧게 기록하면 <strong>산책 다이어리</strong>에 쌓여요.</li>
      </ul>

      <p class="tip">💡 이 서비스는 참고용 정보이며 수의학적 진단을 대체하지 않아요. 궁금한 점은 수의사와 상담해 주세요.</p>
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

h4 {
  margin: var(--space-4) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

h4:first-of-type {
  margin-top: var(--space-3);
}

ul {
  padding-left: var(--space-5);
  margin: var(--space-2) 0 0 0;
}

li {
  margin-bottom: var(--space-1);
  color: var(--color-text);
}

.tip {
  margin: var(--space-4) 0 0;
  padding-top: var(--space-3);
  border-top: 1px dashed var(--color-border);
  color: var(--color-text-muted);
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
