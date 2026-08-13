// 도시 시드 목록 — 실데이터 연동 이전 weatherMockData.js가 하던 역할 중 "어떤 도시를
// 보여줄지"만 남는다. 온도·날씨 상태는 더 이상 여기 두지 않는다 — weatherApi.js가 매번
// 실제로 받아온다(vue_architecture.md 9.3 Mock→API 교체 원칙, 도메인 모델은 불변·데이터
// 획득 경로만 바뀐다). apiQuery는 OpenWeatherMap이 정확히 매칭하도록 country code를 붙인다
// (service_architecture.md 6절 City 모델 — id/name/apiQuery/lat·lon).
export const CITY_MASTER_LIST = [
  { id: 'city_01', name: '서울', apiQuery: 'Seoul,KR' },
  { id: 'city_02', name: '수원', apiQuery: 'Suwon,KR' },
  { id: 'city_03', name: '부산', apiQuery: 'Busan,KR' },
  { id: 'city_04', name: '울산', apiQuery: 'Ulsan,KR' },
  { id: 'city_05', name: '경주', apiQuery: 'Gyeongju,KR' },
  { id: 'city_06', name: '제주', apiQuery: 'Jeju,KR' },
  { id: 'city_07', name: '대구', apiQuery: 'Daegu,KR' },
  { id: 'city_08', name: '포항', apiQuery: 'Pohang,KR' },
]
