// 산책 가능 판정. Vue를 모르는 순수 함수이며 견종 이름을 모른다 — 견종→특성 변환은
// domain/breeds.js(예정)가 담당한다(service_architecture.md 4.4, 조합 폭발 방지).
// 판정 함수는 이 파일 1곳에만 존재한다(service_architecture.md 4.1).
import { DANGER_STATUS, DANGER_WIND_SPEED } from './weatherRules'

// 임계값 출처(service_architecture.md 4.2, 9절 — 상세 근거는 해당 절 참조):
//
// GROUND_TEMP_CAUTION(44℃) / GROUND_TEMP_UNSAFE(51℃)
//   Henriques FC, "Studies of Thermal Injury V", Arch Pathol. 1947 — 피부 화상 역학의 고전
//   참조치. 44℃ 미만은 장시간 접촉해도 손상이 없고, 44~51℃ 구간은 온도가 1도 오를 때마다
//   손상 속도가 배가되며, 51℃ 이상에서는 표피 손상이 거의 즉시 일어난다. 발바닥 패드는 각질층이
//   두꺼워 사람 피부보다 내성이 있으나, 이 문서가 확보한 자료 중 가장 근거 수준이 높은 정량 기준이라
//   그대로 채택한다. AKC/AAHA의 소비자 가이드(포장도로 51.7℃=125°F에서 60초 내 화상)와
//   대한민국 정책브리핑(정책뉴스, 2023 — 기온 25℃일 때 노면 약 50℃까지 상승, 화상 위험)이
//   같은 자릿수로 수렴해 교차 검증된다.
// AIR_TEMP_CAUTION(29℃)
//   AKC(American Kennel Club)·AAHA(American Animal Hospital Association) 공동 가이드 —
//   기온 85°F(≈29.4℃) 이상이고 노면이 식을 기회가 없으면 산책이 위험할 수 있다고 권고.
// HUMID_THRESHOLD(80%)
//   개는 땀샘이 발달하지 않아 헐떡임(panting)의 증발냉각으로 체온을 조절하는데, 상대습도가
//   80%를 넘으면 이 증발냉각이 급격히 실패해 체열이 축적되기 시작한다는 것이 캐닌 열스트레스
//   연구의 공통된 소견이다.
//
// 이 값들은 사람/일반 소비자 가이드 기반 1차 근거다 — 수의학 원저 논문으로 교체하거나 검증하는
// 것은 여전히 [결정 필요]로 남는다.
export const GROUND_TEMP_UNSAFE = 51
export const GROUND_TEMP_CAUTION = 44
export const AIR_TEMP_CAUTION = 29
export const HUMID_THRESHOLD = 80

const LEVEL_ORDER = ['good', 'caution', 'limited', 'unsafe']

function escalate(current, candidate) {
  return LEVEL_ORDER.indexOf(candidate) > LEVEL_ORDER.indexOf(current) ? candidate : current
}

// 취약 개체(단두종·이중모·유노령견)는 같은 조건에서 한 단계 더 보수적으로 판정한다
// (service_architecture.md 11절 — 정보가 부족할 때 낙관적으로 판정하지 않는다의 연장).
function isVulnerable(traits) {
  return traits.brachycephalic || traits.coatType === 'double' || traits.ageClass !== 'adult'
}

const MAX_MINUTES = {
  good: { base: 60, vulnerable: 45 },
  caution: { base: 30, vulnerable: 20 },
  limited: { base: 15, vulnerable: 10 },
  unsafe: { base: 0, vulnerable: 0 },
}

// reasons는 조건 1건당 1개. 조합 전용 문구를 만들지 않는다(service_architecture.md 4.1).
// push 순서가 우선순위다 — 지면온도 > 강수·강풍 > 기온·습도(service_architecture.md 4.5).
// 반환 전 최대 2개로 자른다.
export function assessWalk({ weather, traits, groundTempCelsius }) {
  const vulnerable = isVulnerable(traits)
  const reasons = []
  let level = 'good'

  if (groundTempCelsius >= GROUND_TEMP_UNSAFE) {
    level = escalate(level, 'unsafe')
    reasons.push({ code: 'GROUND_TEMP', threshold: GROUND_TEMP_UNSAFE, actual: groundTempCelsius })
  } else if (groundTempCelsius >= GROUND_TEMP_CAUTION) {
    level = escalate(level, vulnerable ? 'limited' : 'caution')
    reasons.push({ code: 'GROUND_TEMP', threshold: GROUND_TEMP_CAUTION, actual: groundTempCelsius })
  }

  if (weather.status === DANGER_STATUS) {
    level = escalate(level, 'unsafe')
    reasons.push({ code: 'RAIN_STORM', threshold: null, actual: weather.status })
  }

  if (weather.windSpeed >= DANGER_WIND_SPEED) {
    level = escalate(level, vulnerable ? 'unsafe' : 'limited')
    reasons.push({ code: 'WIND', threshold: DANGER_WIND_SPEED, actual: weather.windSpeed })
  }

  if (weather.temp >= AIR_TEMP_CAUTION) {
    const humid = weather.humidity >= HUMID_THRESHOLD
    const heatLevel = humid ? 'limited' : 'caution'
    level = escalate(level, vulnerable && heatLevel === 'caution' ? 'limited' : heatLevel)
    reasons.push({ code: humid ? 'HEAT_HUMID' : 'HEAT', threshold: AIR_TEMP_CAUTION, actual: weather.temp })
  }

  return {
    level,
    maxMinutes: MAX_MINUTES[level][vulnerable ? 'vulnerable' : 'base'],
    reasons: reasons.slice(0, 2),
  }
}

const ADVICE = {
  RAIN_STORM: { icon: '🌧️', text: '비바람이 강해요. 그친 뒤 다시 확인해 주세요.' },
  GROUND_TEMP: { icon: '🐾', text: '바닥이 뜨거워요. 그늘진 길로, 가능하면 신발을 신겨 주세요.' },
  WIND: { icon: '🌪️', text: '바람이 강해요. 짧게, 트인 곳은 피해 주세요.' },
  HEAT_HUMID: { icon: '🥵', text: '덥고 습해요. 그늘 위주로, 물을 챙겨 주세요.' },
  HEAT: { icon: '☀️', text: '기온이 높아요. 그늘 위주로 짧게 다녀오세요.' },
}
const SAFE_ADVICE = { icon: '🐕', text: '지금 산책하기 좋아요!' }

// 단정하지 않는다("괜찮습니다" 금지) — 조건부 지시문만 반환한다(service_architecture.md 11절).
// 위험 0건일 때도 문구 1개는 노출한다(판정이 돌았다는 확인, service_architecture.md 4.5).
export function getWalkAdvice(verdict) {
  if (verdict.reasons.length === 0) return [SAFE_ADVICE]
  return verdict.reasons.map((reason) => ADVICE[reason.code])
}
