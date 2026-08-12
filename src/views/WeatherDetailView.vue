<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { weatherMockList } from '../components/exercise/weatherMockData'

const route = useRoute()
const router = useRouter()

// Home / Alert 뷰와 동일한 목업 데이터를 기반으로 상세 정보 구성 (8개 도시 전체 커버)
const mockDetails = Object.fromEntries(
  weatherMockList.map((item) => [
    item.id,
    { name: item.name, temp: item.temp, status: item.status, humidity: `${item.humidity}%`, wind: `${item.windSpeed}m/s` },
  ]),
)

const cityData = ref(null)

onMounted(() => {
  const id = route.params.cityId
  if (mockDetails[id]) {
    cityData.value = mockDetails[id]
  }
})
</script>

<template>
  <div class="detail-container">
    <h3>📊 지역별 상세 기상 관측 정보</h3>
    <hr />

    <div v-if="cityData" class="info-card">
      <h4>📍 지정 지역: {{ cityData.name }}</h4>
      <p>
        실시간 기온: <strong>{{ cityData.temp }}°C</strong>
      </p>
      <p>기상 현황: {{ cityData.status }}</p>
      <p>대기 습도: {{ cityData.humidity }}</p>
      <p>현재 풍속: {{ cityData.wind }}</p>
    </div>
    <div v-else>
      <p>해당 지역의 상세 데이터 장부가 존재하지 않습니다.</p>
    </div>

    <button @click="router.push('/')" class="back-btn">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
