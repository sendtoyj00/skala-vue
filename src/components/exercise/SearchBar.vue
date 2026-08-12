<script setup>
// 1. 상위로 입력 텍스트를 전달할 커스텀 이벤트 등록 (매크로)
defineEmits(['update-query'])

// 2. 상위로부터 현재 검색 상태 값을 수신 (한글 동기화 상태 유지용)
// 3. 도시 검색/날씨 상태 검색 등 여러 검색창에서 재사용할 수 있도록 문구를 prop으로 개방
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
})
</script>

<template>
  <div class="search-inner">
    <h3>{{ label }}</h3>
    <input type="text" :value="currentQuery" @input="$emit('update-query', $event.target.value)" :placeholder="placeholder" />
    <p>
      {{ hintLabel }} <strong>{{ currentQuery }}</strong>
    </p>
  </div>
</template>
