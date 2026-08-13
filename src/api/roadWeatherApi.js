// 기상청 도로기상관측자료(data.go.kr 15159045) 클라이언트.
// 응답이 JSON이 아니라 EUC-KR 텍스트 표라(curl로 실측 확인) 직접 파싱한다.
// 어댑터 책임(필드명·타입만 맞춘다)은 weatherApi.js와 동일 원칙을 따른다(vue_architecture.md 9.4).
import { kmaClient } from './client'

// 응답 컬럼 순서(help=1 헤더 기준, 고정): TM,STN_ID,STN_KO,ROAD_NM,STN_SP,LAT,LON,HT,SFS,
// TR1(노면온도),VS,HM(습도),RN_DAY,SD,TA(기온),WD1,WS1,WD_INS,WS_INS,PS,CH1,CH2,CH3,CA
const COL = {
  TM: 0,
  STN_ID: 1,
  STN_KO: 2,
  ROAD_NM: 3,
  LAT: 5,
  LON: 6,
  TR1: 9, // 노면온도(광학)
  HM: 11, // 습도
  TA: 14, // 기온
}

function decodeEucKr(buffer) {
  return new TextDecoder('euc-kr').decode(buffer)
}

// 결측값은 -999 / -999.0으로 온다.
function toNumberOrNull(raw) {
  const value = Number(raw)
  return Number.isFinite(value) && value > -900 ? value : null
}

// mode=1은 콤마 없는 고정폭 공백 구분, mode=3은 콤마+공백 구분으로 응답 형식이 다르다
// (실측 확인). 콤마를 공백으로 치환한 뒤 공백 기준으로 나누면 두 형식 모두 처리된다.
export function parseRoadWeatherText(text) {
  const rows = []
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const cols = line.replace(/,/g, ' ').trim().split(/\s+/)
    if (cols.length < 15) continue // 손상되거나 불완전한 줄은 건너뛴다

    rows.push({
      observedAtRaw: cols[COL.TM],
      stationId: cols[COL.STN_ID],
      stationName: cols[COL.STN_KO],
      roadName: cols[COL.ROAD_NM],
      lat: toNumberOrNull(cols[COL.LAT]),
      lon: toNumberOrNull(cols[COL.LON]),
      roadTempC: toNumberOrNull(cols[COL.TR1]),
      humidity: toNumberOrNull(cols[COL.HM]),
      airTempC: toNumberOrNull(cols[COL.TA]),
    })
  }
  return rows
}

// KMA는 관측시각을 KST(YYYYMMDDHHmm)로 요구한다. 브라우저 로컬 타임존에 의존하지 않도록
// UTC 기준으로 9시간을 더해 직접 계산한다. offsetMinutes는 발행 지연 버퍼(기본 10분 전).
export function formatKstTime(offsetMinutes = -10) {
  const shifted = new Date(Date.now() + offsetMinutes * 60 * 1000 + 9 * 60 * 60 * 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${shifted.getUTCFullYear()}${pad(shifted.getUTCMonth() + 1)}${pad(shifted.getUTCDate())}` +
    `${pad(shifted.getUTCHours())}${pad(shifted.getUTCMinutes())}`
  )
}

// mode=3: 특정 시각, 전 관측점(366개소) 스냅샷. domain/groundTemp.js의 최근접 관측점 탐색이
// 이 응답을 원천으로 쓴다. tmKST를 생략하면 10분 전 시각으로 자동 계산한다.
export async function fetchAllRoadStations(tmKST = formatKstTime()) {
  const res = await kmaClient.get('/api/typ01/url/road_stn_obs.php', {
    params: { mode: 3, tm1: tmKST, var: 2, disp: 1, help: 0 },
  })
  return parseRoadWeatherText(decodeEucKr(res.data))
}
