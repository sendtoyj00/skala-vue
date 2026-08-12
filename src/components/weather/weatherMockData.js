// weatherStore가 사용하는 목업 데이터. 위험 판정 규칙은 src/domain/weatherRules.js 소관이다.
// (vue_architecture.md 5.3 — 데이터 파일과 도메인 로직은 수명이 다르므로 분리한다)
export const weatherMockList = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 40, windSpeed: 30 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 80, windSpeed: 10 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 60, windSpeed: 20 },
  { id: 'city_04', name: '울산', temp: 23, status: '흐림', humidity: 70, windSpeed: 40 },
  { id: 'city_05', name: '경주', temp: 24, status: '바람', humidity: 50, windSpeed: 60 },
  { id: 'city_06', name: '제주', temp: 29, status: '폭우', humidity: 90, windSpeed: 50 },
  { id: 'city_07', name: '대구', temp: 33, status: '맑음', humidity: 40, windSpeed: 15 },
  { id: 'city_08', name: '포항', temp: 27, status: '폭우', humidity: 85, windSpeed: 55 },
]
