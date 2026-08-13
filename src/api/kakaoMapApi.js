// 카카오맵 SDK 로더 + 장소 검색 어댑터. 이 프로젝트엔 백엔드가 없어(client.js 9절과 같은 전제)
// REST API(dapi.kakao.com)를 axios로 직접 fetch하지 않고, 브라우저에 로드하는 카카오맵
// JavaScript SDK(kakao.maps.services.Places)를 쓴다 — SDK가 appkey 인증을 내부적으로 처리해
// 별도 CORS 우회(vite 프록시 등)가 필요 없다.
const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY
const SDK_SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`

let sdkPromise = null

// autoload=false + kakao.maps.load()로 SDK 초기화 완료 시점을 명시적으로 기다린다(스크립트
// onload만으로는 지도·서비스 네임스페이스가 아직 안 채워져 있을 수 있다). 앱 전체에서
// 스크립트 태그가 중복 삽입되지 않도록 Promise를 모듈 스코프에 캐싱한다.
export function loadKakaoMaps() {
  if (typeof window === 'undefined') return Promise.reject(new Error('브라우저 환경이 아닙니다.'))
  if (window.kakao?.maps?.services) return Promise.resolve(window.kakao)
  if (sdkPromise) return sdkPromise

  if (!KAKAO_APP_KEY) {
    return Promise.reject(new Error('VITE_KAKAO_APP_KEY가 설정되지 않았습니다.'))
  }

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_SRC
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = () => {
      sdkPromise = null
      // 브라우저가 script onerror에 HTTP 상태 코드를 안 넘겨준다 — 콘솔에 URL을 남겨
      // 개발자도구 Network 탭에서 실제 상태(403=도메인 미등록, ERR_CONNECTION_REFUSED=네트워크
      // 차단 등)를 바로 찾아볼 수 있게 한다.
      console.error('[kakaoMapApi] SDK 스크립트 로드 실패:', SDK_SRC)
      reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })
  return sdkPromise
}

const SEARCH_RADIUS_M = 3000
const MAX_RESULTS = 6

function keywordSearchOnce(kakao, places, keyword, center) {
  return new Promise((resolve, reject) => {
    places.keywordSearch(
      keyword,
      (result, status) => {
        if (status === kakao.maps.services.Status.OK) resolve(result)
        else if (status === kakao.maps.services.Status.ZERO_RESULT) resolve([])
        else reject(new Error(`카카오 장소 검색 실패: ${status}`))
      },
      {
        location: new kakao.maps.LatLng(center.lat, center.lon),
        radius: SEARCH_RADIUS_M,
        sort: kakao.maps.services.SortBy.DISTANCE,
      },
    )
  })
}

// keywords를 순서대로 검색해 처음으로 결과가 있는 키워드를 채택한다(예: '공원' 결과가 없는
// 외곽 지역은 '산책로'로 한 번 더 시도). center 반경 3km, 거리순 정렬 후 상위 MAX_RESULTS개.
export async function searchNearbyWalkSpots(center, keywords) {
  const kakao = await loadKakaoMaps()
  const places = new kakao.maps.services.Places()

  for (const keyword of keywords) {
    const result = await keywordSearchOnce(kakao, places, keyword, center)
    if (result.length > 0) {
      return result.slice(0, MAX_RESULTS).map((item) => ({
        id: item.id,
        name: item.place_name,
        category: item.category_name?.split(' > ').pop() ?? '',
        address: item.road_address_name || item.address_name,
        lat: Number(item.y),
        lon: Number(item.x),
      }))
    }
  }
  return []
}
