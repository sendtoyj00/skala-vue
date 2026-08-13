// 지면온도 추정 + 실측 관측점 탐색. Vue를 모르는 순수 함수다(vue_architecture.md 5.1).
// WeatherHomeView.vue에 있던 임시 추정 로직(estimateGroundTempPlaceholder)을 승계해 정식
// 자리로 옮긴다 — 그 파일에 남아있던 예고("domain/groundTemp.js가 생기면 이 함수는 삭제")를
// 이행한다(마이그레이션 5단계, vue_architecture.md 10절).

// 맑을수록 노면이 태양복사로 더 달궈진다 — 기온 대비 최대 가산치(℃, 정오 기준).
// statusCode는 domain/weatherRules.js의 classifyStatusCode가 만든다.
const PEAK_OFFSET_BY_STATUS_CODE = {
  CLEAR: 25,
  CLOUDS: 15,
  ATMOSPHERE: 10,
  DRIZZLE: 5,
  RAIN: 2,
  STORM: 2,
  SNOW: 0,
  UNKNOWN: 12,
}

// 06~19시에만 일사 보정을 적용하고, 정오(13시) 부근에서 최대치, 양끝 경계로 갈수록 0에
// 수렴한다(design_architecture.md 2.5 "야간은 보정 0에 수렴" 규정의 구현).
function daylightFactor(hour) {
  if (hour < 6 || hour >= 19) return 0
  const midday = 13
  const span = 7
  return Math.max(0, 1 - Math.abs(hour - midday) / span)
}

// weather: { temp, statusCode } · hour: 0~23(로컬 시)
export function estimateGroundTemp(weather, hour) {
  const peakOffset = PEAK_OFFSET_BY_STATUS_CODE[weather.statusCode] ?? PEAK_OFFSET_BY_STATUS_CODE.UNKNOWN
  return weather.temp + peakOffset * daylightFactor(hour)
}

const EARTH_RADIUS_KM = 6371

// 두 좌표 사이 직선거리(km). WeatherHomeView의 "가까운 위치 순" 정렬도 이 구현을 재사용한다
// — 지구 반경 상수·공식이 파일마다 흩어지지 않게 여기서 한 번만 계산한다.
export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

// 실측 채택 반경 — service_architecture.md 4.2가 [결정 필요]로 남겨둔 값에 잠정치를 준다.
// 고속도로 366개소 관측망은 성기므로, 대부분의 도심 사용자는 이 반경 밖에 있어 추정으로
// 폴백하는 것이 정상 동작이다(실측 커버리지가 좁다는 한계 자체는 해소되지 않는다).
export const ROAD_STATION_RADIUS_KM = 15

// stations: roadWeatherApi.parseRoadWeatherText()의 반환값
export function findNearestRoadStation(stations, lat, lon) {
  let nearest = null
  let nearestDistance = Infinity

  for (const station of stations) {
    if (station.lat == null || station.lon == null || station.roadTempC == null) continue
    const distance = haversineKm(lat, lon, station.lat, station.lon)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = station
    }
  }

  if (!nearest || nearestDistance > ROAD_STATION_RADIUS_KM) return null
  return { station: nearest, distanceKm: nearestDistance }
}
