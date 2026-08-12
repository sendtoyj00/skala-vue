<script setup>
// 날씨 목록 전용 컴포넌트: 리스트 순회 + 빈 결과 상태를 함께 책임진다
import WeatherCard from './WeatherCard.vue'

defineProps({
  list: {
    type: Array,
    required: true,
  },
  // WeatherCard로 그대로 전달하는 공용 강조 계약(WeatherCard.vue 참조).
  emphasis: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'muted'].includes(value),
  },
})

defineEmits(['request-detail'])
</script>

<template>
  <div>
    <WeatherCard
      v-for="item in list"
      :key="item.id"
      :city-item="item"
      :emphasis="emphasis"
      @request-detail="$emit('request-detail', $event)"
    />

    <p v-if="list.length === 0" class="empty-state">😭 조건에 맞는 결과가 없습니다.</p>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-2) 0;
}
</style>
