// axios 인스턴스 — Store는 axios를 직접 호출하지 않고 반드시 이 계층을 거친다
// (vue_architecture.md 9.1). 키는 여기 한 곳에서만 참조한다(9.5).
import axios from 'axios'

export const owmClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 8000,
})

owmClient.interceptors.request.use((config) => {
  config.params = {
    appid: import.meta.env.VITE_OWM_API_KEY,
    units: 'metric',
    lang: 'kr',
    ...config.params,
  }
  return config
})

// 기상청 도로기상관측자료(apihub.kma.go.kr)는 Access-Control-Allow-Origin 헤더를 주지 않는다
// (curl로 실측 확인 — 브라우저에서 직접 fetch/axios 호출 시 CORS로 차단된다). 개발 서버는
// vite.config.js의 프록시(/kma-api)로 우회한다. 운영 배포(정적 호스팅)에는 이 프록시가 없으므로
// 별도 서버리스 프록시가 필요하다 — 이 프로젝트엔 백엔드가 없어 아직 [결정 필요]로 남는다
// (vue_architecture.md 9절 — 백엔드가 없다는 전제와 정면으로 부딪히는 지점).
const KMA_BASE = import.meta.env.DEV ? '/kma-api' : 'https://apihub.kma.go.kr'

export const kmaClient = axios.create({
  baseURL: KMA_BASE,
  timeout: 8000,
  // EUC-KR 텍스트 응답이라 axios 기본 UTF-8 디코딩을 쓰면 한글이 깨진다. 원본 바이트를 받아
  // roadWeatherApi.js에서 TextDecoder('euc-kr')로 직접 디코딩한다.
  responseType: 'arraybuffer',
})

kmaClient.interceptors.request.use((config) => {
  config.params = {
    authKey: import.meta.env.VITE_KMA_AUTH_KEY,
    ...config.params,
  }
  return config
})
