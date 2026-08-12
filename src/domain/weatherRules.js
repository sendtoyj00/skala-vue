// 위험 날씨 판정 규칙과 추천 문구 매핑. Vue를 모르는 순수 함수/상수만 둔다.
// (vue_architecture.md 5.3, 5.5)

export const DANGER_STATUS = '폭우'
export const DANGER_WIND_SPEED = 50
export const DANGER_TEMP = 30
export const HOT_TEMP = 25
export const HUMID_THRESHOLD = 70

export const isDangerWeather = (item) =>
  item.status === DANGER_STATUS || item.windSpeed >= DANGER_WIND_SPEED || item.temp >= DANGER_TEMP

// 위험 조건 1건당 코드 1개. 조합 전용 문구를 만들지 않는다(service_architecture.md 4절).
export const RECOMMENDATIONS = {
  RAIN: { icon: '🌧️', text: '폭우가 예상되니 외출을 자제해주세요.' },
  WIND: { icon: '🌪️', text: '강풍이 불고 있어 야외 활동을 피해주세요.' },
  HEAT: { icon: '🔥', text: '기온이 높으니 더위에 주의하세요.' },
  HEAT_HUMID: { icon: '🥵', text: '고온다습! 체감온도가 더 높으니 수분 섭취에 유의하세요.' },
  SAFE: { icon: '🍃', text: '산책하기 좋은 날씨예요!' },
}

const MAX_RECOMMENDATIONS = 2

// 위험 조건별 코드를 수집해 우선순위(폭우 > 강풍 > 폭염)순으로 최대 2개까지 반환한다.
export function getWeatherAdvice(item) {
  const codes = []
  if (item.status === DANGER_STATUS) codes.push('RAIN')
  if (item.windSpeed >= DANGER_WIND_SPEED) codes.push('WIND')
  if (item.temp >= DANGER_TEMP) codes.push(item.humidity >= HUMID_THRESHOLD ? 'HEAT_HUMID' : 'HEAT')

  if (codes.length === 0) return [RECOMMENDATIONS.SAFE]
  return codes.slice(0, MAX_RECOMMENDATIONS).map((code) => RECOMMENDATIONS[code])
}
