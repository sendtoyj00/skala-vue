<script setup>
// 1. 상위로 입력 텍스트를 전달할 커스텀 이벤트 등록 (매크로)
defineEmits(['update-query'])

// 2. 상위로부터 현재 검색 상태 값을 수신 (한글 동기화 상태 유지용)
// 3. 도시 검색/날씨 상태 검색 등 여러 검색창에서 재사용할 수 있도록 문구를 prop으로 개방
//
// 라벨을 h3로 마크업하지 않는다 — 도구가 정보 섹션과 같은 위계를 갖게 되는 것을 막고,
// <label for>로 입력과 프로그램적으로 연결한다(design_architecture.md 4.7, 8.2 "폼 레이블").
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '🔍 도시 검색',
  },
  placeholder: {
    type: String,
    default: '검색할 도시 이름 입력',
  },
  hintLabel: {
    type: String,
    default: '검색 중인 도시:',
  },
  // 같은 화면에 검색창이 2개 이상 있을 수 있어(예: 도시명 + 날씨 상태) id 충돌을 피하려면
  // 소비처가 고유값을 넘긴다.
  inputId: {
    type: String,
    default: 'search-bar-input',
  },
})
</script>

<template>
  <div class="search-inner">
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      class="search-input"
      type="text"
      :value="currentQuery"
      @input="$emit('update-query', $event.target.value)"
      :placeholder="placeholder"
    />
    <p class="search-hint">
      {{ hintLabel }} <strong>{{ currentQuery }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-inner label {
  display: block;
  font-weight: 700;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2);
}
/* 투명 검색창 — 카드 자체가 이미 글래스라, 입력창까지 불투명한 흰 박스로 남아있으면 카드
   안에 또 다른 카드가 떠 있는 것처럼 보였다. 입력창도 같은 글래스 톤으로 맞춘다. */
.search-inner .search-input {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  color: var(--color-text);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}
.search-inner .search-input::placeholder {
  color: var(--color-text-muted);
}
.search-inner .search-input:focus {
  outline: none;
  background: var(--color-surface);
  border-color: var(--color-primary);
}
.search-hint {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.search-hint strong {
  color: var(--color-text);
}
</style>
