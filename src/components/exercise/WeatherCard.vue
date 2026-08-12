<script setup>
import WeatherBadge from './WeatherBadge.vue'

// 1. 상위로부터 단방향 주입받을 객체 데이터 규격 검수 (매크로)
defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

// 2. 상위로 송신할 두 가지 경로의 커스텀 이벤트 식별자 등록 (매크로)
const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <div class="weather-card" @click="emit('select-card', `${cityItem.name}이 선택되었습니다.`)">
    <h4>{{ cityItem.name }} ({{ cityItem.status }})</h4>
    <p>현재 기온: {{ cityItem.temp }}°C</p>
    <p>습도: {{ cityItem.humidity }}%</p>
    <p>바람: {{ cityItem.windSpeed }}m/s</p>

    <WeatherBadge :status="cityItem.status" :temp="cityItem.temp" :humidity="cityItem.humidity" :wind-speed="cityItem.windSpeed" />

    <button class="btn-detail" @click.stop="emit('click-detail', cityItem.name, cityItem.status, cityItem.humidity, cityItem.windSpeed, cityItem.id)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}
.btn-detail {
  position: absolute;
  right: 12px;
  top: 15px;
  padding: 6px 10px;
  cursor: pointer;
}
</style>
