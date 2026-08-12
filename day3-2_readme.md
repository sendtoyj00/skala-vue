# Day 3-2 — Vue Router 적용 및 위험 날씨 경보 뷰 분리

`WeatherParent.vue`(컴포넌트 트리 버전)를 Vue Router 기반 페이지 구조(`views/`)로 옮기고, 그 과정에서 새로 분리할 가치가 있는 화면을 판단해 위험 날씨 경보 페이지를 추가한 작업 기록. 무엇을, 어떤 기준으로 바꿨는지와 그 과정에서 드러난 버그를 남겼다.

## 최종 라우팅 구조

| Path | Name | Component | Lazy | 비고 |
| --- | --- | --- | --- | --- |
| `/` | `WeatherHome` | `WeatherHomeView.vue` | ❌ (static import) | 초기 진입점이라 즉시 로드 |
| `/weather/alerts` | `WeatherAlerts` | `WeatherAlertView.vue` | ✅ | 신규 — 위험 날씨 경보 전용 페이지 |
| `/about` | `WeatherAbout` | `WeatherAboutView.vue` | ✅ | 서비스 소개 |
| `/weather/:cityId` | `WeatherDetail` | `WeatherDetailView.vue` | ✅ | 동적 세그먼트, 상세보기 클릭 시 진입 |
| `/:pathMatch(.*)*` | `NotFound` | `NotFoundView.vue` | ✅ | Catch-all, 배열 마지막 위치 고정 |

`/weather/alerts`는 `/weather/:cityId`보다 위에 선언했다. Vue Router는 static 세그먼트를 dynamic보다 우선 매칭하므로 순서 자체가 동작에 영향을 주진 않지만, 가독성을 위해 더 구체적인 라우트를 위에 뒀다.

## 기존 라우팅 현황 분석에서 확인한 것

작업 시작 전 `router/index.js` / `App.vue` / `views/*`를 먼저 읽고 다음을 확인했다.

- 라우터 설정(지연 로딩 3곳 + catch-all)은 이미 구현되어 있었음.
- `WeatherHomeView.vue`가 `WeatherParent.vue`를 완전히 이식하지 못한 상태였음: 상태 검색 SearchBar, `WeatherList`/`StatusBar` 재사용, 8개 도시 mock 데이터가 빠져 있었고 3개 도시로 축소되어 있었음.
- `App.vue`에 라우팅 실습 섹션이 "과제4"/"과제5" 두 벌 있는데, 둘 다 이름 없는 `<RouterView>`라 같은 라우터의 같은 화면을 그대로 중복 렌더링하는 구조였음 (이번 작업 범위 밖이라 그대로 두고 기록만 남김).

## 새 뷰 분리 기준

기존 화면 안의 기능들 중 "별도 URL로 뽑을 가치가 있는가"를 다음 기준으로 판단했다.

1. **북마크/공유가 의미 있는 독립된 결과 집합인가** — 필터링된 결과 자체가 하나의 화면 목적이 되는지.
2. **기존 컴포넌트(`WeatherList`/`WeatherBadge`)를 그대로 재사용해 새 페이지를 구성할 수 있는가** — 새 컴포넌트를 만들지 않고 뷰 레벨에서만 분리 가능한지.
3. **같은 데이터셋에 대한 단순 필터인가, 아니면 성격이 다른 화면인가** — 후자만 분리 대상.

| 후보 | 판단 | 이유 |
| --- | --- | --- |
| 위험 날씨 경보 (`/weather/alerts`) | ✅ 채택 | 체크박스 필터로 Home에 끼워 넣기보다, 북마크 가능한 독립 결과 화면으로 승격하는 게 더 적합. `WeatherList`/`WeatherBadge` 그대로 재사용 가능 |
| 도시 비교 (`/weather/compare?cities=...`) | ⏸ 보류 | Path param(단일 리소스) vs Query string(다중 선택)을 대비해서 보여줄 좋은 후보지만, 선택 UI를 새로 설계해야 해서 작업량이 더 큼 — 다음 단계로 미룸 |
| 날씨 상태 검색 SearchBar | ❌ 비채택 | 도시 검색과 동일한 리스트/데이터셋을 걸러내는 필터일 뿐, 독립된 화면 목적이 없어 Home 컴포넌트로 유지 |

## 작업 순서

1. **현재 라우팅 현황 분석** — 기존 `router/index.js`, `App.vue`, `views/*`, `WeatherParent.vue`를 읽고 구현/미구현 목록 정리.
2. **새 뷰 후보 검토** — 위 "새 뷰 분리 기준"으로 위험 날씨 경보 뷰를 우선 채택, 도시 비교 뷰는 보류.
3. **공용 mock 데이터 추출** — `WeatherHomeView`와 새로 만들 `WeatherAlertView`가 같은 8개 도시 데이터를 중복 없이 쓰도록 `weatherMockData.js`로 분리 (`weatherMockList`, `isDangerWeather` 판정 함수 포함).
4. **WeatherHomeView 기능 보강** — 상태 검색 SearchBar 복원, `WeatherCard` 직접 순회 → `WeatherList` 사용, 인라인 상태바 → `StatusBar` 사용, 8개 도시 데이터 복원, 검색어/상태어 쿼리스트링(`?search=&status=`) 동기화.
5. **버그 발견 및 수정 — `WeatherCard` 이벤트 계약** — `WeatherList`를 경유하면 `click-detail` 이벤트가 `(name, status, humidity, windSpeed)`만 전달되고 `id`가 빠져 있어 라우팅이 불가능했음. `WeatherParent`(기존 alert 방식) 호환을 깨지 않도록 `id`를 마지막 인자로 추가하는 방식으로 수정.
6. **WeatherAlertView 신규 작성** — `isDangerWeather` 조건(폭우 / 강풍 60m/s↑ / 폭염 30도↑)으로 필터링한 목록을 `WeatherList`/`StatusBar`로 렌더링, 상세보기는 동일하게 `router.push`.
7. **라우터에 `/weather/alerts` 추가** — `/weather/:cityId`보다 위에 선언, lazy import 적용.
8. **버그 발견 및 수정 — WeatherDetailView mock 데이터** — Home이 8개 도시로 늘어나면서 기존 3개 도시만 있던 상세 페이지 mock으로는 나머지 5개 도시가 "데이터 없음"으로 뜨는 문제 발견. 공용 mock 데이터 기반으로 8개 도시 전체를 커버하도록 재작성 (기존의 상세 주소 문구는 포기하고 데이터 일관성을 우선함).
9. **App.vue 내비게이션에 경보 링크 추가** — 과제4/과제5 두 nav 섹션 모두에 `⚠️ 위험 날씨 경보` 링크 추가.
10. **브라우저 검증** — 아래 "검증 방법" 참고.

## 파일별 변경 요약

| 파일 | 변경 내용 |
| --- | --- |
| `weatherMockData.js` (신규) | `weatherMockList`(8개 도시 전체 데이터) + `isDangerWeather` 판정 함수. Home/Alert/Detail 세 뷰가 공유 |
| `WeatherAlertView.vue` (신규) | 위험 날씨만 필터링해 보여주는 전용 페이지. `WeatherList`/`StatusBar` 재사용 |
| `WeatherHomeView.vue` | 상태 검색 SearchBar 추가, `WeatherList`/`StatusBar` 사용으로 교체, 8개 도시 데이터 복원, 쿼리스트링에 `status` 추가 동기화 |
| `WeatherDetailView.vue` | mock 데이터를 공용 `weatherMockList` 기반으로 재작성해 8개 도시 전체 커버 |
| `WeatherCard.vue` | `click-detail` emit 마지막 인자로 `cityItem.id` 추가 (기존 4개 인자 순서는 유지) |
| `router/index.js` | `/weather/alerts` 라우트 추가 (lazy, `/weather/:cityId`보다 위) |
| `App.vue` | 과제4/과제5 nav bar 각각에 `⚠️ 위험 날씨 경보` `RouterLink` 추가 |

## 설계 판단: `weatherMockData.js`는 왜 Pinia store가 아닌 plain module인가

세 뷰(Home/Alert/Detail)가 같은 데이터를 공유한다는 점만 보면 Pinia store가 먼저 떠오르지만, 판단 기준은 "공유하냐"가 아니라 **"반응형으로 변경되고 그 변경이 여러 컴포넌트에 동기화돼야 하냐"**로 잡았다.

- **plain module로 충분한 이유**: `weatherMockList`는 어디서도 mutate되지 않는 정적 배열이다. ES 모듈은 import할 때마다 같은 참조를 돌려주므로 "여러 곳에서 같은 데이터를 본다"는 목적 자체는 이미 달성된다. Pinia가 주는 부가가치(반응형 상태, 변경 시 다른 컴포넌트로 실시간 동기화, devtools 추적)를 하나도 활용하지 못하는 상태에서 store를 만드는 건 보일러플레이트만 늘리는 과설계라고 판단했다.
- **이 프로젝트에서 Pinia가 실제로 쓰인 사례와의 대조**: `stores/configStore.js` + `UnitToggler.vue`(섭씨/화씨 단위 토글)는 정확히 Pinia가 필요한 사례다. 단위를 어디서 바꾸든 모든 화면에 그 변경이 즉시 반영돼야 하기 때문. `weatherMockList`는 이런 "쓰기 + 동기화" 요구가 없다.
- **재검토 조건**: 나중에 "즐겨찾기 도시 토글", "실시간 API로 목록 갱신" 같이 상태를 실제로 변경하고 그 변경이 여러 뷰에 반영돼야 하는 기능이 생기면, 그때 이 데이터를 Pinia store로 옮기는 게 맞다. 지금은 그 요구가 없어 plain module을 유지했다.

## 검증 방법

`npm run dev`로 로컬 서버를 띄운 뒤 브라우저에서 확인:

- Home(`/`)에 8개 도시가 검색바 2개(도시/날씨 상태)와 함께 정상 렌더링되는지
- 상세보기 클릭 시 `/weather/city_01`처럼 올바른 `id`로 라우팅되고, 해당 도시의 실제 데이터가 상세 페이지에 표시되는지
- `/weather/alerts` 진입 시 위험 조건(폭우/강풍60↑/폭염30↑)에 해당하는 도시(경주·제주·대구·포항)만 남는지
- 네트워크 탭에서 `/weather/alerts` 방문 시점에 `WeatherAlertView.vue` 청크가 지연 로드되는지
- 콘솔에 에러 없이 정상 동작하는지

위 항목 모두 브라우저 프리뷰에서 직접 클릭/네트워크 요청으로 확인 완료.

## 남은 이슈 (다음 작업 후보)

- 도시 비교 뷰(`/weather/compare`) — query string 다중 선택 패턴, 보류 중
- 홈 라우트(`/`)도 lazy loading으로 통일할지 여부
- `App.vue`의 과제4/과제5 이중 `RouterView` 구조 정리 (이름 없는 뷰라 두 섹션이 동일 화면을 중복 렌더링하는 문제)
- `router/index.js.old` 정리 여부
