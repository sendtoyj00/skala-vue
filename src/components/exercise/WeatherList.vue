<script setup>
// 날씨 목록 전용 컴포넌트: 리스트 순회 + 빈 결과 상태를 함께 책임진다
import WeatherCard from './WeatherCard.vue'

defineProps({
  list: {
    type: Array,
    required: true,
  },
})

defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <div>
    <WeatherCard v-for="item in list" :key="item.id" :city-item="item" @select-card="$emit('select-card', $event)" @click-detail="(...args) => $emit('click-detail', ...args)" />

    <p v-if="list.length === 0" style="text-align: center; color: #e74c3c; padding: 10px 0">😭 조건에 맞는 결과가 없습니다.</p>
  </div>
</template>
