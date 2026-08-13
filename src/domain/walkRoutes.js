// 산책 경로 3종(F-33) 생성 로직. Vue를 모르는 순수 함수만 둔다(walkRules.js와 같은 원칙).
//
// [범위 한계 — 명시적으로 [결정 필요]로 남김] 실제 도로망을 따라가는 경로(정식 라우팅 API,
// 예: OSRM/Google Directions)는 이 과제 범위의 백엔드·키 발급 없이는 연동할 수 없다. 대신
// 현재 위치를 중심으로 한 폐곡선(출발=도착) 루프를 좌표 오프셋으로 합성해, "경로가 지도 위에
// 어떻게 보이는가"라는 화면 요구사항(지도에서 경로 보기)을 절 단위로 만족시킨다. 실제
// 보행로를 반영하지 않는다는 한계는 README에 그대로 남긴다.
const EARTH_RADIUS_KM = 6371

// center에서 bearing(도, 0=북) 방향으로 distanceKm만큼 떨어진 좌표.
function destinationPoint(center, distanceKm, bearingDeg) {
  const bearing = (bearingDeg * Math.PI) / 180
  const lat1 = (center.lat * Math.PI) / 180
  const lon1 = (center.lon * Math.PI) / 180
  const angularDistance = distanceKm / EARTH_RADIUS_KM

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  )
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    )

  return { lat: (lat2 * 180) / Math.PI, lon: (lon2 * 180) / Math.PI }
}

// 출발점(center)에서 시작해 다각형 루프를 그리고 다시 center로 돌아오는 좌표열을 만든다.
// pointCount가 많을수록 더 둥글게 보인다(실제 도로망은 아니지만 "루프 산책로"처럼 보이게).
function buildLoopPath(center, radiusKm, pointCount, startBearing) {
  const points = [center]
  for (let i = 1; i <= pointCount; i++) {
    const bearing = startBearing + (360 / pointCount) * i
    // 완전한 원이 아니라 살짝 찌그러뜨려 "합성 경로"임이 과장되지 않게 한다.
    const jitter = 0.85 + 0.3 * Math.sin(i * 1.7)
    points.push(destinationPoint(center, radiusKm * jitter, bearing))
  }
  points.push(center)
  return points
}

// route 유형별 정적 프로필. distanceKm/평균 보행 속도(4.5km/h 기준)로 예상 소요시간을 역산한다.
const ROUTE_PROFILES = [
  {
    type: 'relax',
    name: '릴렉스 코스',
    icon: '🌿',
    distanceKm: 1.2,
    shadeLevel: 'high',
    baseReason: '그늘이 많고 경사가 적어 부담이 적어요.',
  },
  {
    type: 'active',
    name: '액티브 코스',
    icon: '🏃',
    distanceKm: 2.6,
    shadeLevel: 'low',
    baseReason: '거리가 길어 활동량이 많은 아이에게 좋아요.',
  },
  {
    type: 'easy',
    name: '이지 코스',
    icon: '🐾',
    distanceKm: 0.8,
    shadeLevel: 'medium',
    baseReason: '짧고 평탄해 짧은 외출에 알맞아요.',
  },
]

const WALK_SPEED_KMH = 4.5

// 판정 단계(level)에 따라 이번엔 어떤 코스를 추천할지 결정한다. 단조 규칙 하나로만 판단해
// walkRules.js의 4단계와 맞춘다(조합 분기를 만들지 않는다는 프로젝트 전체 원칙과 동일).
const RECOMMEND_BY_LEVEL = {
  good: 'active',
  caution: 'relax',
  limited: 'easy',
  unsafe: 'easy',
}

// weather.statusCode/그늘 필요 여부에 따라 추천 이유 문구를 한 줄 덧붙인다. 조건 1건당
// 문구 1개, 최대 1개만 덧붙여 walkRules.js의 "reasons 1건당 1문구" 관례를 따른다.
function extraReason({ verdict, groundTempIsCaution }) {
  if (verdict.level === 'unsafe' || verdict.level === 'limited') {
    return groundTempIsCaution ? '지금은 지면이 뜨거워요, 그늘 위주 코스를 우선하세요.' : '오늘은 짧게만 다녀오세요.'
  }
  if (verdict.level === 'good') return '지금 날씨엔 활동량 있는 코스도 무리 없어요.'
  return null
}

// center: {lat, lon} · verdict: assessWalk() 결과 · groundTempIsCaution: boolean
export function generateWalkRoutes({ center, verdict, groundTempIsCaution }) {
  const recommendedType = RECOMMEND_BY_LEVEL[verdict.level] ?? 'relax'

  return ROUTE_PROFILES.map((profile, i) => {
    const estimatedMinutesRaw = Math.round((profile.distanceKm / WALK_SPEED_KMH) * 60)
    // 판정이 허용하는 시간(maxMinutes)을 넘는 코스는 "판정 시간 내 완주 어려움"을 함께 표기한다
    // — 경로 추천이 판정 결과와 모순되는 것처럼 보이지 않게 한다(vue_architecture.md 7.2와
    // 같은 원칙: 서로 다른 결과가 화면에서 어긋나 보이면 신뢰가 깨진다).
    const exceedsVerdict = verdict.maxMinutes > 0 && estimatedMinutesRaw > verdict.maxMinutes

    const reasons = [profile.baseReason]
    if (profile.type === recommendedType) {
      const extra = extraReason({ verdict, groundTempIsCaution })
      if (extra) reasons.push(extra)
    }

    return {
      id: `route_${profile.type}`,
      type: profile.type,
      name: profile.name,
      icon: profile.icon,
      distanceKm: profile.distanceKm,
      estimatedMinutes: estimatedMinutesRaw,
      shadeLevel: profile.shadeLevel,
      isRecommended: profile.type === recommendedType,
      exceedsVerdict,
      reasons,
      path: buildLoopPath(center, profile.distanceKm / (2 * Math.PI), 10, i * 37),
    }
  })
}

export const SHADE_LABEL = { high: '그늘 많음', medium: '그늘 보통', low: '그늘 적음' }
