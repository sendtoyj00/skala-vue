<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

// 1. [1일차 데이터] 가상의 백엔드 데이터 배열
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 40, windSpeed: 30 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 80, windSpeed: 10 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 60, windSpeed: 20 },
  { id: 'city_04', name: '울산', temp: 23, status: '흐림', humidity: 70, windSpeed: 40 },
  { id: 'city_05', name: '경주', temp: 24, status: '바람', humidity: 50, windSpeed: 60 },
  { id: 'city_06', name: '제주', temp: 29, status: '폭우', humidity: 90, windSpeed: 50 },
  { id: 'city_07', name: '대구', temp: 33, status: '맑음', humidity: 40, windSpeed: 15 },
  { id: 'city_08', name: '포항', temp: 27, status: '폭우', humidity: 85, windSpeed: 55 },
])

// 2. [1일차 데이터] 검색어 및 알림창 제어용 데이터
const searchQuery = ref('')
// 2일차 나만의 반응형 상태 변수
const showDangerOnly = ref(false)
const statusQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 3. [2일차 추가] computed를 활용한 실시간 검색 필터링 연산기 (★핵심)
const filteredWeatherList = computed(() => {
  const cityQuery = searchQuery.value.trim()
  const weatherQuery = statusQuery.value.trim()

  return weatherList.value.filter((item) => {
    const cityMatch = !cityQuery || item.name.includes(cityQuery)

    const weatherMatch = !weatherQuery || item.status.includes(weatherQuery)

    return cityMatch && weatherMatch
  })
})

// 위험 날씨 필터
const displayWeatherList = computed(() => {
  let result = filteredWeatherList.value

  if (showDangerOnly.value) {
    result = result.filter((item) => item.status === '폭우' || item.windSpeed >= 50 || item.temp >= 30)
  }

  return result
})

// 4. [2일차 추가] watch를 활용한 선택 도시 추적 센서
// selectedCityInfo의 문구 변화를 감시하여 후속 로그를 처리합니다.
watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

// 위험 날씨 필터 상태 감시
watch(showDangerOnly, (newValue) => {
  console.log('⚠️ 위험 날씨 필터:', newValue ? 'ON' : 'OFF')
})

// 5. [2일차 추가] watchEffect를 활용한 자동 의존성 API 로그 시뮬레이션
// 타이핑할 때마다 변하는 searchQuery를 AI CCTV처럼 자동 추적합니다.
watchEffect(() => {
  console.log(`🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`)
})

// 알림 대행 함수 (window 객체 격리 우회) (습도 바람 세기 추가)
const showDetail = (cityName, status, humidity, windSpeed) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다. 습도는 [${humidity}]퍼센트 입니다. 바람세기는 [${windSpeed}]m/s입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <h3>🔍 도시 검색</h3>
      <input type="text" :value="searchQuery" @input="(e) => (searchQuery = e.target.value)" placeholder="검색할 도시 이름 입력" />
      <p>
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
      </p>
    </section>

    <section class="search-box">
      <h3>🌤️ 날씨 상태 검색</h3>
      <!-- 날씨 상태로 검색 추가-->
      <input type="text" v-model="statusQuery" placeholder="예: 맑음, 비, 폭우" />
      <p>
        검색 중인 날씨: <strong>{{ statusQuery }}</strong>
      </p>
    </section>

    <section class="list-box">
      <div class="list-header">
        <h3>🏙️ 지역별 날씨 현황</h3>

        <label class="danger-filter">
          <input type="checkbox" v-model="showDangerOnly" />
          <span>⚠️ 위험 날씨만 보기</span>
        </label>
      </div>
      <div v-for="item in displayWeatherList" :key="item.id" class="weather-card" @click="selectedCityInfo = `${item.name}이 선택되었습니다.`">
        <h4>{{ item.name }} ({{ item.status }})</h4>
        <p>현재 기온: {{ item.temp }}°C</p>
        <p>습도: {{ item.humidity }}%</p>
        <p>바람: {{ item.windSpeed }}m/s</p>

        <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
        <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

        <!-- 위험 날씨 추천 -->
        <span v-if="item.status === '폭우' && item.windSpeed >= 50" class="badge recommend-rain">🌊 폭우+강풍 동시 발생! 외출을 삼가세요.</span>
        <span v-else-if="item.status === '폭우'" class="badge recommend-rain">🌧️ 폭우가 예상되니 외출을 자제해주세요.</span>
        <span v-else-if="item.windSpeed >= 50 && item.temp >= 30" class="badge recommend-wind">🌪️🔥 강풍+고온 동시! 열사병과 낙하물 모두 주의하세요.</span>
        <span v-else-if="item.windSpeed >= 50" class="badge recommend-wind">🌪️ 강풍이 불고 있어 야외 활동을 피해주세요.</span>
        <span v-else-if="item.temp >= 30 && item.humidity >= 70" class="badge recommend-overhit">🥵 고온다습! 체감온도가 더 높으니 수분 섭취에 유의하세요.</span>
        <span v-else-if="item.temp >= 30" class="badge recommend-overhit">🔥 기온이 높으니 더위에 주의하세요.</span>
        <span v-else class="badge recommend">🍃 산책하기 좋은 날씨예요!</span>

        <button class="btn-detail" @click.stop="showDetail(item.name, item.status, item.humidity, item.windSpeed)">상세보기</button>
      </div>

      <p v-if="displayWeatherList.length === 0" style="text-align: center; color: #e74c3c; padding: 10px 0">😭 조건에 맞는 날씨가 없습니다.</p>
    </section>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
