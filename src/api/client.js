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
// vite.config.js의 프록시(/kma-api)로, 운영 배포는 api/kma-proxy/[...path].js 서버리스 함수로
// 우회한다 — 둘 다 authKey를 그쪽에서 주입하므로 이 클라이언트가 보내는 값은 프록시 경유 시 무시된다.
const KMA_BASE = import.meta.env.DEV ? '/kma-api' : '/api/kma-proxy'

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
