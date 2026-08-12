<script setup>
// 알림 문구 표시 전용 컴포넌트 (상태 없음, message prop만 그대로 렌더링)
defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="status-bar">
    {{ message }}
  </div>
</template>
