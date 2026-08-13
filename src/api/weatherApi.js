// 어댑터 — 필드명·타입만 맞춘다. 필터링·정렬·판정·문구 생성은 하지 않는다
// (vue_architecture.md 9.4). 도메인 모델(vue_architecture.md 9.3)은 여기서 확정된다.
import { owmClient } from './client'
import { classifyStatusCode } from '@/domain/weatherRules'

// F-10 실데이터: 현재 관측. lat/lon도 함께 반환해 domain/groundTemp.js의 최근접 관측점
// 탐색(useGroundTemp.js)이 별도 지오코딩 호출 없이 바로 쓸 수 있게 한다.
export async function fetchCurrentWeather(apiQuery) {
  const { data } = await owmClient.get('/weather', { params: { q: apiQuery } })
  return {
    temp: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.wind?.speed ?? 0,
    statusCode: classifyStatusCode(data.weather[0].id),
    status: data.weather[0].description,
    lat: data.coord.lat,
    lon: data.coord.lon,
    observedAt: data.dt * 1000,
  }
}

// F-11(P0): 3시간 간격 5일 예보. F-26 타임라인의 데이터 원천이다.
export async function fetchForecast(apiQuery) {
  const { data } = await owmClient.get('/forecast', { params: { q: apiQuery } })
  return data.list.map((entry) => ({
    at: entry.dt * 1000,
    temp: entry.main.temp,
    humidity: entry.main.humidity,
    windSpeed: entry.wind?.speed ?? 0,
    statusCode: classifyStatusCode(entry.weather[0].id),
    status: entry.weather[0].description,
  }))
}

// F-31(현재 위치): 브라우저 Geolocation 좌표로 직접 조회한다. 도시 마스터에 없는 임의
// 지점(현재 위치)의 날씨를 얻으려면 city 쿼리가 아니라 lat/lon 쿼리가 필요하다 — 어댑터
// 계층(vue_architecture.md 9.4)에 조회 축을 하나 더 두는 것이지, 기존 city 기반 조회를
// 대체하지 않는다(지역 날씨 목록·경보는 계속 city 기준으로 동작해야 한다).
export async function fetchCurrentWeatherByCoords(lat, lon) {
  const { data } = await owmClient.get('/weather', { params: { lat, lon } })
  return {
    temp: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.wind?.speed ?? 0,
    statusCode: classifyStatusCode(data.weather[0].id),
    status: data.weather[0].description,
    lat: data.coord.lat,
    lon: data.coord.lon,
    cityName: data.name,
    observedAt: data.dt * 1000,
  }
}

export async function fetchForecastByCoords(lat, lon) {
  const { data } = await owmClient.get('/forecast', { params: { lat, lon } })
  return data.list.map((entry) => ({
    at: entry.dt * 1000,
    temp: entry.main.temp,
    humidity: entry.main.humidity,
    windSpeed: entry.wind?.speed ?? 0,
    statusCode: classifyStatusCode(entry.weather[0].id),
    status: entry.weather[0].description,
  }))
}

// F-12(P1): 대기질. 개는 지면 30cm에서 호흡해 사람 기준 농도와 노출량이 다르다는 것이
// 채택 근거였다(service_architecture.md 3.3) — 사람 기준 등급(aqi 1~5)을 개 기준으로
// 재해석하는 규칙은 여전히 [결정 필요](service_architecture.md 6절)이므로 원본 수치만 전달한다.
export async function fetchAirQuality(lat, lon) {
  const { data } = await owmClient.get('/air_pollution', { params: { lat, lon } })
  const entry = data.list[0]
  return {
    aqi: entry.main.aqi,
    pm2_5: entry.components.pm2_5,
    pm10: entry.components.pm10,
    observedAt: entry.dt * 1000,
  }
}
