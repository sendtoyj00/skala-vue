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
      type="text"
      :value="currentQuery"
      @input="$emit('update-query', $event.target.value)"
      :placeholder="placeholder"
    />
    <p>
      {{ hintLabel }} <strong>{{ currentQuery }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-inner label {
  display: block;
  font-weight: 700;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-1);
}
</style>
