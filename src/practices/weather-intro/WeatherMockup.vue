<script setup>
import { ref } from 'vue'

// 4일차 API 연동을 대비한 가상의 백엔드 데이터 배열 (v-for 및 :key 실습용) (습도 바람 세기 추가)
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 40, windSpeed: 30 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 80, windSpeed: 10 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 59, windSpeed: 20 },
  { id: 'city_04', name: '울산', temp: 23, status: '흐림', humidity: 70, windSpeed: 40 },
  { id: 'city_05', name: '경주', temp: 24, status: '바람', humidity: 50, windSpeed: 60 },
  { id: 'city_06', name: '제주', temp: 29, status: '폭우', humidity: 90, windSpeed: 49 },
])

// 검색어 및 알림창 제어용 데이터 (v-model 대용 한글 처리 및 이벤트 실습용)
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 알림 대행 함수 (window 객체 격리 우회) (습도 바람 세기 추가)
const showDetail = (cityName, status, humidity, windSpeed) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다. 습도는 [${humidity}]퍼센트 입니다. 바람세기는 [${windSpeed}]m/s입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <h3>🔍 도시 검색</h3>
      <!-- input type="text" v-model="searchQuery" placeholder="검색할 도시 이름 입력" / -->
      <input type="text" :value="searchQuery" @input="(e) => (searchQuery = e.target.value)" placeholder="검색할 도시 이름 입력" />
      <p>
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
      </p>
    </section>

    <!--(습도 바람 세기 추가)-->
    <section class="list-box">
      <h3>🏙️ 지역별 날씨 현황</h3>

      <div v-for="item in weatherList" :key="item.id" class="weather-card" @click="selectedCityInfo = `${item.name}이 선택되었습니다.`">
        <h4>{{ item.name }} ({{ item.status }})</h4>
        <p>현재 기온: {{ item.temp }}°C</p>
        <p>습도: {{ item.humidity }}</p>
        <p>바람: {{ item.windSpeed }}</p>

        <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
        <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
        <!-- 활동 추천 문구 추가-->
        <span v-if="item.humidity >= 60 && item.windSpeed <= 50" class="badge recommend-rain">☔️오늘은 우산을 준비해주세요</span>
        <span v-else-if="item.humidity <= 60 && item.windSpeed >= 50" class="badge recommend-wind">🌪️바람이 세니 외출을 자제해주세요</span>
        <span v-else class="badge recommend">🍃산책하기 좋은 날씨에요!</span>

        <button class="btn-detail" @click.stop="showDetail(item.name, item.status, item.humidity, item.windSpeed)">상세보기</button>
      </div>
    </section>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
