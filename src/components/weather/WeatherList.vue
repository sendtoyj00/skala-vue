<script setup>
// 날씨 목록 전용 컴포넌트: 리스트 순회 + 빈 결과 상태를 함께 책임진다
import WeatherCard from './WeatherCard.vue'

defineProps({
  list: {
    type: Array,
    required: true,
  },
})

defineEmits(['request-detail'])
</script>

<template>
  <div>
    <WeatherCard v-for="item in list" :key="item.id" :city-item="item" @request-detail="$emit('request-detail', $event)" />

    <p v-if="list.length === 0" class="empty-state">😭 조건에 맞는 결과가 없습니다.</p>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  color: #6c757d;
  padding: 10px 0;
}
</style>
