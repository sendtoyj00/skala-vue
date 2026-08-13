// 위험 날씨 판정 규칙과 추천 문구 매핑. Vue를 모르는 순수 함수/상수만 둔다.
// (vue_architecture.md 5.3, 5.5)
//
// [실데이터 연동 개정] 문자열 정확 일치(`status === '폭우'`) 대신 OpenWeatherMap 응답의
// 수치 조건코드(weather[0].id)를 코드값(statusCode)으로 정규화해 판정한다. API가 반환하는
// 한글 설명 문구가 "강한 비"/"많은 비"/"천둥을 동반한 비"처럼 매번 달라져도 판정이 깨지지 않는다
// (service_architecture.md 6절 — "status는 statusCode와 statusLabel을 함께 둔다"의 실제 적용).
// classifyStatusCode의 구간은 OpenWeatherMap 공식 Weather Condition Codes 문서 기준이다.
export function classifyStatusCode(owmId) {
  if (owmId >= 200 && owmId < 300) return 'STORM' // 뇌우
  if (owmId >= 300 && owmId < 400) return 'DRIZZLE' // 이슬비
  if (owmId >= 500 && owmId < 600) return 'RAIN' // 비
  if (owmId >= 600 && owmId < 700) return 'SNOW' // 눈
  if (owmId >= 700 && owmId < 800) return 'ATMOSPHERE' // 안개·황사 등
  if (owmId === 800) return 'CLEAR' // 맑음
  if (owmId > 800 && owmId < 900) return 'CLOUDS' // 구름
  return 'UNKNOWN'
}

// 산책을 막는 강수 계열. 이슬비는 제외하되(약한 비는 산책 가능), 눈은 포함한다 — 정보가
// 부족할 때 낙관적으로 판정하지 않는다는 원칙(service_architecture.md 11절)을 강수 분류에도 적용.
export const DANGER_STATUS_CODES = ['STORM', 'RAIN', 'SNOW']

// [실측 재보정] 이전 값 50은 목업 windSpeed(10~60, km/h 감각으로 만들어진 값)에 맞춘 것이었다
// (service_architecture.md 6절이 이미 이 재조정 필요성을 명시해 뒀다). 실제 OpenWeatherMap
// windSpeed는 m/s이므로 50m/s는 사실상 발생하지 않아 조건이 죽은 코드가 된다. 기상청
// 강풍주의보 기준(평균풍속 14m/s 이상)으로 재보정한다.
export const DANGER_WIND_SPEED = 14
export const DANGER_TEMP = 30
export const HOT_TEMP = 25
export const HUMID_THRESHOLD = 70

export const isDangerWeather = (item) =>
  DANGER_STATUS_CODES.includes(item.statusCode) ||
  item.windSpeed >= DANGER_WIND_SPEED ||
  item.temp >= DANGER_TEMP

// 위험 조건 1건당 코드 1개. 조합 전용 문구를 만들지 않는다(service_architecture.md 4절).
// 행동 권고("~하세요")가 아니라 날씨 상태 설명만 담는다 — 행동 판정(산책 가능 여부)은
// domain/walkRules.js 하나만 한다(service_architecture.md 1.4, 4.1 — 판정 주체는 1개).
export const RECOMMENDATIONS = {
  RAIN: { icon: '🌧️', text: '비나 눈이 내리고 있어요.' },
  WIND: { icon: '🌪️', text: '바람이 강하게 불고 있어요.' },
  HEAT: { icon: '🔥', text: '기온이 높은 날씨예요.' },
  HEAT_HUMID: { icon: '🥵', text: '기온과 습도가 모두 높아요.' },
  SAFE: { icon: '🍃', text: '평온한 날씨예요.' },
}

const MAX_RECOMMENDATIONS = 2

// 위험 조건별 코드를 수집해 우선순위(강수 > 강풍 > 폭염)순으로 최대 2개까지 반환한다.
export function getWeatherAdvice(item) {
  const codes = []
  if (DANGER_STATUS_CODES.includes(item.statusCode)) codes.push('RAIN')
  if (item.windSpeed >= DANGER_WIND_SPEED) codes.push('WIND')
  if (item.temp >= DANGER_TEMP) codes.push(item.humidity >= HUMID_THRESHOLD ? 'HEAT_HUMID' : 'HEAT')

  if (codes.length === 0) return [RECOMMENDATIONS.SAFE]
  return codes.slice(0, MAX_RECOMMENDATIONS).map((code) => RECOMMENDATIONS[code])
}

// 날씨 무드(UI 테마 전용, F-40 유사). statusCode(classifyStatusCode 결과)를 6개 무드로
// 단순화한다 — 판정(walkRules.js)과는 완전히 분리된 장식용 매핑이라 여기 두되 walkRules.js는
// 참조하지 않는다(판정 주체는 여전히 1개). 더위는 맑음/흐림보다 우선한다 — 발바닥 화상
// 위험이 하늘 상태보다 사용자에게 더 중요한 신호이기 때문이다.
const STATUS_CODE_TO_MOOD = {
  CLEAR: 'sunny',
  CLOUDS: 'cloudy',
  RAIN: 'rain',
  DRIZZLE: 'rain',
  STORM: 'storm',
  SNOW: 'snow',
  ATMOSPHERE: 'cloudy',
  UNKNOWN: 'cloudy',
}

export function getWeatherMood(item) {
  if (!item) return 'cloudy'
  if (item.temp != null && item.temp >= DANGER_TEMP) return 'hot'
  return STATUS_CODE_TO_MOOD[item.statusCode] ?? 'cloudy'
}
