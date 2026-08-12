# Day 3 — Vue 날씨 대시보드 과제 수행 기록

> **과제 순서**: 1. Component 분리 → 2. Vue Router 적용 → 3. Pinia Store 배치
> 각 단계별 요구사항, 변경점, 설계 판단, 버그 수정, 검증 방법을 정리했다.

---

# 1단계 — Component 분리 (Vue Components)

## 과제 요구사항

1. `WeatherParent.vue` — 모든 반응형 데이터 유지 (컨테이너 역할)
2. `BaseDashboardCard.vue` — 검색박스와 리스트박스의 디자인을 공통화. `<slot>` 배치하여 부모가 도시 검색, 날씨 현황 주입
3. `SearchBar.vue` — 부모로부터 검색도시 반응형 데이터를 전달받아 표시(props). 도시 검색 시 `update-query` 이벤트를 발생시켜 검색어를 부모에게 전달(emits)
4. `WeatherCard.vue` — 선택된 도시 객체를 전달받아 표시(props). 카드 선택(`select-card`)과 상세보기(`click-detail`) 이벤트를 부모에게 전달(emits)
5. 각 컴포넌트의 디자인은 `<style scoped>`로 각각 분리
6. Slot으로 전달되는 자식 컴포넌트는 시각적으로는 `BaseDashboardCard` 내부에 위치하지만, 스크립트적으로는 부모(`WeatherParent`) 스코프에서 컴파일되므로 직접 바인딩/통신이 가능하다
7. 추가로 Component를 더 분리하여 추가 Component를 만든다

## 최종 컴포넌트 구조

```
WeatherParent.vue            ← 상태/로직 소유자 (컨테이너)
├─ BaseDashboardCard.vue     ← 레이아웃 껍데기 (slot만 있음)
│   └─ SearchBar.vue         ← 도시 검색 입력 (범용화됨)
├─ BaseDashboardCard.vue
│   └─ SearchBar.vue         ← 날씨 상태 검색 입력 (같은 컴포넌트 재사용)
├─ BaseDashboardCard.vue
│   ├─ (위험 필터 체크박스)   ← 부모 템플릿에 인라인 유지
│   └─ WeatherList.vue       ← 목록 순회 + 빈 결과 상태
│       └─ WeatherCard.vue   ← 리스트 아이템 (카드 1개)
│           └─ WeatherBadge.vue  ← 온도/추천 뱃지 규칙
└─ StatusBar.vue             ← 하단 알림 문구
```

## 분리 기준

컴포넌트 경계를 정할 때 4가지 질문을 기준으로 했다.

1. **상태/로직 소유권** — 이 조각이 반응형 상태(`ref`/`computed`/`watch`)를 스스로 가져야 하는지, 혹은 부모가 준 데이터를 그리기만 합니까?
   → 상태를 갖는 건 `WeatherParent` 하나뿐이고, 나머지는 전부 `props`로 받아 `emit`으로 올리는 무상태(presentational) 컴포넌트이다.
2. **반복되는 시각적 뼈대** — 데이터와 무관하게 스타일/구조만 반복되는지?
   → `BaseDashboardCard`. props/emit이 전혀 없어 첫 번째로 안전하게 뗄 수 있었다.
3. **`v-for`로 반복되는 리스트 아이템** — 배열의 원소 하나를 그리는 단위인지?
   → `WeatherCard`(카드 한 장), 그리고 카드들을 순회하며 빈 상태까지 책임지는 `WeatherList`.
4. **복잡한 조걶부 규칙이 독립적으로 존재** — 하나의 컴포넌트가 "레이아웃"과 "판정 로직" 두 책임을 동시에 갖고 있지 않은지?
   → `WeatherCard` 안에 있던 7단짜리 `v-if/v-else-if` 뱃지 판정 체인을 `WeatherBadge`로 분리해, `WeatherCard`는 카드 레이아웃만, `WeatherBadge`는 추천 규칙만 갖게 했다.

## "새로 만들지 않기"로 판단한 기준

- **똑같이 생긴 UI가 2번 나오면, 새 컴포넌트보다 기존 컴포넌트를 범용화** — 도시 검색창과 날씨 상태 검색창은 구조가 동일해서 `SearchBar`를 복제하지 않고 `label`/`placeholder`/`hint-label` prop을 추가해 재사용했다.
- **로직이 한 줄이라 유지** — 위험 날씨 필터 체크박스는 `v-model` 한 줄뿐이라 별도 컴포넌트로 만들지 않고 `WeatherParent` 템플릿에 인라인으로 남겼다. (과설계 방지)

## 작업 순서

리스크가 낮은 것부터, 상태 의존성이 낮은 것부터 뗐다.

1. **`BaseDashboardCard`** : props/emit 없음. 구조만 바꾸는 작업이라 로직을 건드릴 위험이 없어 첫 번째로 진행.
2. **`WeatherCard`** : `v-for` 블록을 떼어서 `cityItem` prop 하나로 경계를 좁힘. `select-card`/`click-detail` 이벤트 계약을 이 시점에 확정.
3. **`SearchBar`** : `currentQuery` prop + `update-query` emit으로 "props down, events up" 계약을 명시적으로 세움.
4. **`WeatherParent`로 조립** : 세 컴포넌트를 import하고 남은 상태/로직은 유지한 채 템플릿만 컴포넌트 태그로 교체.
5. **추가 분리: `StatusBar` / `WeatherBadge` / `WeatherList`** : "아직 어디에도 안 들어간 것"(하단 알림 문구)과 "기존 컴포넌트가 책임을 2개 이상 가진 곳"(카드 안의 뱃지 판정 체인, 부모 템플릿의 v-for+빈 상태)을 추가로 분리.
6. **기능 전체 이식** : 날씨 상태 검색(`statusQuery`), 위험 날씨 필터(`showDangerOnly`), 8개 도시 전체 데이터, 2단 `computed` 체인(`filteredWeatherList` → `displayWeatherList`)을 추가.

## 파일별 변경 요약

| 파일                           | 변경 내용                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WeatherParent.vue`            | `weatherList`를 8개 도시 전체 데이터로 복원. `statusQuery`, `showDangerOnly` 상태와 `filteredWeatherList`→`displayWeatherList` computed 체인, `showDangerOnly` watch 로그 복원. 템플릿에 상태 검색용 `SearchBar` 추가, `list-header`(제목+위험 필터 체크박스) 추가, `WeatherList`에 `displayWeatherList` 연결 |
| `BaseDashboardCard.vue` (신규) | props/emit 없는 레이아웃 껍데기. `<slot>`만 있음                                                                                                                                                                                                                                                              |
| `SearchBar.vue` (신규)         | `label`/`placeholder`/`hintLabel` prop 추가로 범용화. 도시 검색과 날씨 상태 검색 두 곳에서 재사용                                                                                                                                                                                                             |
| `WeatherCard.vue` (신규)       | `cityItem` prop 하나로 경계를 좁힘. `select-card`/`click-detail` 이벤트 emit. 인라인 뱃지 로직은 `WeatherBadge`로 분리 예정                                                                                                                                                                                   |
| `WeatherList.vue` (신규)       | `list` prop을 순회하며 `WeatherCard` 렌더링, 빈 결과 메시지("😭 조건에 맞는 결과가 없습니다.") 처리, `select-card`/`click-detail` 이벤트를 그대로 상위로 전달                                                                                                                                                 |
| `WeatherBadge.vue` (신규)      | `status`/`temp`/`humidity`/`windSpeed` prop으로 온도감 뱃지 + 활동 추천 문구 계산. `WeatherCard`의 조걶부 렌더링 책임을 분리                                                                                                                                                                                  |
| `StatusBar.vue` (신규)         | `message` prop만 받아 하단 알림바 렌더링. 상태 없음                                                                                                                                                                                                                                                           |

## 검증 방법

`npm run dev`로 로컬 서버를 띄운 뒤 브라우저에서 확인:

- 도시 검색 / 날씨 상태 검색 입력 시 목록이 올바르게 필터링되는지
- 위험 날씨만 보기 체크박스로 목록이 좁혀지는지 ("폭우" 검색 + 위험 필터 동시 적용 시 제주/포항만 남는 것까지 확인)
- 카드 클릭 시 하단 `StatusBar` 문구가 갱신되는지
- 상세보기 클릭 시 습도/바람 세기가 포함된 알림창이 뜨는지
- 콘솔에 에러 없이 `watch`/`watchEffect` 로그가 정상 출력되는지

---

# 2단계 — Router 적용 (Vue Router)

## 과제 요구사항

1. **Vue Router 설정** — 라우터 지연 로딩 적용, Catch-all Route 적용
2. **App.vue** — Navigation Bar 추가 (`RouterLink`) 및 메인 콘텐츠 영역 배치 (`RouterView`)
3. **WeatherHomeView.vue** — `WeatherParent` 대체 (`/` 경로). 상세보기 버튼 클릭 시 `window.alert()`를 제거하고 Programmatic Navigation 처리 (`router.push('/weather/' + id)`)
4. **WeatherDetailView.vue** — 지역별 상세 기상관측 정보. 도시 코드에 해당하는 Mock Data를 임시로 활용. 동적 경로 매칭 `cityId`를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택
5. **WeatherAboutView.vue** — 적당한 내용 작성 및 메인 대시보드로 돌아가기 작성
6. **추가 view 작성 및 Routing** — 본인만의 추가 view를 작성하고 라우팅

## 최종 라우팅 구조

| Path               | Name            | Component               | Lazy | 비고                                   |
| ------------------ | --------------- | ----------------------- | ---- | -------------------------------------- |
| `/`                | `WeatherHome`   | `WeatherHomeView.vue`   | ❌   | 초기 진입점, 즉시 로드                 |
| `/weather/alerts`  | `WeatherAlerts` | `WeatherAlertView.vue`  | ✅   | 위험 날씨 경보 전용 페이지 (추가 view) |
| `/about`           | `WeatherAbout`  | `WeatherAboutView.vue`  | ✅   | 서비스 소개                            |
| `/weather/:cityId` | `WeatherDetail` | `WeatherDetailView.vue` | ✅   | 동적 세그먼트, 상세보기                |
| `/:pathMatch(.*)*` | `NotFound`      | `NotFoundView.vue`      | ✅   | Catch-all                              |

`/weather/alerts`는 `/weather/:cityId`보다 위에 선언했다. Vue Router는 static 세그먼트를 dynamic보다 우선 매칭하므로 순서 자체가 동작에 영향을 주진 않지만, 가독성을 위해 더 구체적인 라우트를 위에 뒀다.

## 새 뷰 분리 기준

기존 화면 안의 기능들 중 "별도 URL로 뽑을 가치가 있는가"를 다음 기준으로 판단했다.

1. **북마크/공유가 의미 있는 독립된 결과 집합인가** — 필터링된 결과 자체가 하나의 화면 목적이 되는지.
2. **기존 컴포넌트를 그대로 재사용해 새 페이지를 구성할 수 있는가** — 새 컴포넌트를 만들지 않고 뷰 레벨에서만 분리 가능한지.
3. **같은 데이터셋에 대한 단순 필터인가, 아니면 성격이 다른 화면인가** — 후자만 분리 대상.

| 후보                                      | 판단      | 이유                                                                                                                                        |
| ----------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 위험 날씨 경보 (`/weather/alerts`)        | ✅ 채택   | 체크박스 필터로 Home에 끼워 넣기보다, 북마크 가능한 독립 결과 화면으로 승격하는 게 더 적합. `WeatherList`/`WeatherBadge` 그대로 재사용 가능 |
| 도시 비교 (`/weather/compare?cities=...`) | ⏸ 보류    | Path param vs Query string을 대비한 좋은 후보지만, 선택 UI를 새로 설계해야 해서 작업량이 더 큼 — 다음 단계로 미룸                           |
| 날씨 상태 검색 SearchBar                  | ❌ 비채택 | 도시 검색과 동일한 리스트/데이터셋을 걸러내는 필터일 뿐, 독립된 화면 목적이 없어 Home 컴포넌트로 유지                                       |

## 작업 순서

1. **현재 라우팅 현황 분석** — 기존 `router/index.js`, `App.vue`, `views/*`, `WeatherParent.vue`를 읽고 구현/미구현 목록 정리
2. **새 뷰 후보 검토** — 위 기준으로 위험 날씨 경보 뷰를 우선 채택, 도시 비교 뷰는 보류
3. **공용 mock 데이터 추출** — `weatherMockData.js`로 분리 (`weatherMockList`, `isDangerWeather` 판정 함수 포함). Home/Alert/Detail 세 뷰가 공유
4. **WeatherHomeView 기능 보강** — 상태 검색 SearchBar 복원, `WeatherList`/`StatusBar` 사용으로 교체, 8개 도시 데이터 복원, 검색어/상태어 쿼리스트링(`?search=&status=`) 동기화
5. **버그 수정 — `WeatherCard` 이벤트 계약** — `WeatherList`를 경유하면 `click-detail` 이벤트가 `(name, status, humidity, windSpeed)`만 전달되고 `id`가 빠져 있어 라우팅이 불가능했음. `id`를 마지막 인자로 추가하는 방식으로 수정
6. **WeatherAlertView 신규 작성** — `isDangerWeather` 조건(폭우 / 강풍 60m/s↑ / 폭염 30도↑)으로 필터링한 목록을 `WeatherList`/`StatusBar`로 렌더링, 상세보기는 동일하게 `router.push`
7. **라우터에 `/weather/alerts` 추가** — `/weather/:cityId`보다 위에 선언, lazy import 적용
8. **버그 수정 — WeatherDetailView mock 데이터** — Home이 8개 도시로 늘어나면서 기존 3개 도시만 있던 상세 페이지 mock으로는 나머지 5개 도시가 "데이터 없음"으로 뜨는 문제 발견. 공용 mock 데이터 기반으로 8개 도시 전체를 커버하도록 재작성
9. **App.vue 내비게이션에 경보 링크 추가** — nav bar에 `⚠️ 위험 날씨 경보` `RouterLink` 추가
10. **브라우저 검증**

## 파일별 변경 요약

| 파일                          | 변경 내용                                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `weatherMockData.js` (신규)   | `weatherMockList`(8개 도시 전체 데이터) + `isDangerWeather` 판정 함수. Home/Alert/Detail 세 뷰가 공유                                                                                  |
| `WeatherAlertView.vue` (신규) | 위험 날씨만 필터링해 보여주는 전용 페이지. `WeatherList`/`StatusBar` 재사용                                                                                                            |
| `WeatherHomeView.vue`         | 상태 검색 SearchBar 추가, `WeatherList`/`StatusBar` 사용으로 교체, 8개 도시 데이터 복원, 쿼리스트링에 `status` 추가 동기화. 상세보기 버튼 `window.alert()` 제거 → `router.push`로 변경 |
| `WeatherDetailView.vue`       | mock 데이터를 공용 `weatherMockList` 기반으로 재작성해 8개 도시 전체 커버. 동적 경로 `cityId` 기반으로 Mount 시점에 도시 객체 선택                                                     |
| `WeatherAboutView.vue`        | 서비스 소개 내용 + 메인 대시보드로 돌아가기 링크                                                                                                                                       |
| `WeatherCard.vue`             | `click-detail` emit 마지막 인자로 `cityItem.id` 추가 (기존 4개 인자 순서는 유지)                                                                                                       |
| `router/index.js`             | `/weather/alerts` 라우트 추가 (lazy, `/weather/:cityId`보다 위). Catch-all 적용. 기존 라우트 지연 로딩 유지                                                                            |
| `App.vue`                     | Navigation Bar 추가 (`RouterLink`), 메인 콘텐츠 영역 `RouterView` 배치                                                                                                                 |

## 설계 판단: `weatherMockData.js`는 왜 Pinia store가 아닌 plain module인가

세 뷰가 같은 데이터를 공유한다는 점만 본다면 Pinia store가 먼저 떠오르지만, 판단 기준은 **"반응형으로 변경되고 그 변경이 여러 컴포넌트에 동기화돼야 하냐"**로 잡았다.

- **plain module로 충분한 이유**: `weatherMockList`는 어디서도 mutate되지 않는 정적 배열이다. ES 모듈은 import할 때마다 같은 참조를 돌려주므로 "여러 곳에서 같은 데이터를 본다"는 목적 자체는 이미 달성된다. Pinia가 주는 부가가치(반응형 상태, 변경 시 실시간 동기화, devtools 추적)를 하나도 활용하지 못하는 상태에서 store를 만드는 건 보일러플레이트만 늘리는 과설계라고 판단했다.
- **Pinia가 실제로 쓰인 사례와의 대조**: `stores/configStore.js` + `UnitToggler.vue`(섭씨/화씨 단위 토글)는 정확히 Pinia가 필요한 사례다. 단위를 어디서 바꾸든 모든 화면에 그 변경이 즉시 반영돼야 하기 때문.
- **재검토 조건**: "즐겨찾기 도시 토글", "실시간 API로 목록 갱신" 같이 상태를 실제로 변경하고 여러 뷰에 반영돼야 하는 기능이 생기면 그때 Pinia store로 옮기는 게 맞다.

## 검증 방법

`npm run dev`로 로컬 서버를 띄운 뒤 브라우저에서 확인:

- Home(`/`)에 8개 도시가 검색바 2개(도시/날씨 상태)와 함께 정상 렌더링되는지
- 상세보기 클릭 시 `/weather/city_01`처럼 올바른 `id`로 라우팅되고, 해당 도시의 실제 데이터가 상세 페이지에 표시되는지
- `/weather/alerts` 진입 시 위험 조건(폭우/강풍60↑/폭염30↑)에 해당하는 도시(경주·제주·대구·포항)만 남는지
- 네트워크 탭에서 `/weather/alerts` 방문 시점에 `WeatherAlertView.vue` 청크가 지연 로드되는지
- 콘솔에 에러 없이 정상 동작하는지

---

# 3단계 — Store 배치 (Pinia)

## 과제 요구사항

1. `configStore.js` 작성 — 날씨 단위 설정
   - `state`: `unit` (초기값: `celsius`)
   - `getters`: `unitSymbol` (현재 단위 상태에 맞는 기호: `℃` / `℉`)
   - `actions`: `toggleUnit` (`celsius`와 `fahrenheit`를 토글)
2. `UnitToggler.vue` — 대시보드 상단에 배치되어 단위 설정을 변경하는 UI 버튼과 영역
3. Navigation Bar 옆에 `UnitToggler.vue` 배치
4. 메인과 상세 날씨에 단위 설정 변경 적용
5. **추가 Store 작성 및 활용** — `configStore`에서 state/getter/action을 추가하거나, 본인만의 추가 Store를 작성

## 추가 구현: 설계 문서 기반 구조 정리

`service_architecture.md` / `design_architecture.md` / `vue_architecture.md` 3개 설계 문서를 먼저 재작성한 뒤, 그 문서가 정한 마이그레이션 순서를 따라 코드를 실제로 옮겼다. 범위는 **Pinia 도입 전 구조 정리 전부** + **Pinia는 배치까지만**으로 한정했다.

## 작업 순서

1. **정리(cleanup)** — 학습 산출물 격리, 스캐폴드 삭제, 완전 중복 백업 삭제
2. **폴더 재편** — `components/exercise/` → `components/common/` + `components/weather/`
3. **도메인 계층 신설** — `src/domain/`, `src/composables/`
4. **컴포넌트 계약 수정** — `WeatherCard`/`WeatherList`/`WeatherBadge`의 emit·layout
5. **View 재작성** — Home/Alert/Detail이 store와 domain을 쓰도록
6. **App.vue 단일 셸화**
7. **Pinia 배치** — `weatherStore` 연결, `favoriteStore`/`authStore` 뼈대, `configStore` 소비 연결
8. **검증**

## 1. 정리 (Cleanup)

| 대상                                                                                                                                | 처리                                               | 이유                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `WeatherMockup.vue` / `WeatherComposition.vue` / `WeatherParent.vue`, `App.vue.1st/.2nd/.3rd`                                       | `src/practices/weather-intro/`로 이동              | 학습 계보 기록. 삭제하면 계보가 끊긴다                                                                               |
| `stores/counter.js`                                                                                                                 | `src/practices/counter.js`로 이동                  | 실습용 Store가 실제 전역 상태 Store와 같은 폴더에 있으면 폴더 목록으로 "이 앱의 전역 상태가 무엇인가"를 답할 수 없다 |
| `components/HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`, `components/icons/*`, `views/HomeView.vue`, `views/AboutView.vue` | 삭제                                               | `npm create vue` 스캐폴드 산출물, 본인 작성 아님, 라이브 트리 어디서도 참조되지 않음                                 |
| `App.vue.old`, `router/index.js.old`                                                                                                | 삭제                                               | 다른 백업 파일과 바이트 단위로 완전 중복인 것을 `diff`로 확인 후 삭제                                                |
| `WeatherCard.vue.afterStore` / `.beforeStore`                                                                                       | `docs/reference/`로 이동, 확장자 `.vue.txt`로 변경 | 구현 참고자료로서 가치는 있으나, `.vue` 확장자로 두면 `defineProps` 반환값 미대입 등 결함이 검사 없이 방치된다       |

## 2. 폴더 재편

도메인 지식(날씨 필드·위험 규칙)을 아는지 여부로 `components/exercise/`를 분해했다.

| 새 위치               | 파일                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `components/common/`  | `BaseDashboardCard.vue`, `SearchBar.vue`, `StatusBar.vue`                                         |
| `components/weather/` | `WeatherList.vue`, `WeatherCard.vue`, `WeatherBadge.vue`, `UnitToggler.vue`, `weatherMockData.js` |

`exercise/` 폴더는 비워져 삭제됐다.

## 3. 도메인 계층 신설

| 파일                                       | 내용                                                                                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/weatherRules.js` (신규)        | 위험 판정 임계값 상수(`DANGER_WIND_SPEED=50`, `DANGER_TEMP=30` 등) + `isDangerWeather()` + `getWeatherAdvice()`. 기존에 함수 1벌 + 템플릿 `v-if` 체인 1벌로 흩어져 있던 판정 규칙을 이 파일 하나로 합침 |
| `src/domain/temperature.js` (신규)         | `celsiusToFahrenheit()` 순수 함수. 기존에 두 곳에 복사돼 있던 공식을 이 파일 하나로 합침                                                                                                                |
| `src/composables/useTemperature.js` (신규) | `configStore.unit`을 구독해 `formatTemp()`/`unitSymbol`을 제공. Store에 변환 로직을 두지 않고, 컴포넌트마다 복사하지도 않는 절충안                                                                      |

`weatherMockData.js`는 이제 데이터만 갖는다. `isDangerWeather`는 더 이상 이 파일에서 export하지 않는다 — 데이터 파일과 판정 규칙은 수명이 다르기 때문(목업은 API 연동 시 사라지지만 판정 규칙은 남아야 한다).

## 4. 컴포넌트 계약 수정

### `WeatherCard.vue`

- **emit을 5개 위치 인자 → `cityId` 문자열 1개로 축소**하고 이름을 `click-detail` → `request-detail`로 변경. 기존에는 `(name, status, humidity, windSpeed, id)`를 별도로 본냈으나 수신부가 앞 4개를 버리는 코드를 써야 했다.
- **카드 전체 클릭 = 상세 이동**으로 통일. 기존에는 카드 클릭이 `select-card`(상태바 문구 변경)만 하고, 절대 위치로 얹힌 별도 버튼이 이동을 담당해 도시명과 겹칠 수 있는 구조였다.
- **레이아웃을 정보 위계에 맞게 재배치**: 위험 시 좌측 4px 빨간 테두리 + "⚠ 위험" 플래그를 카드 최상단에 고정, 도시명/상태를 한 줄로, 기온을 카드에서 가장 큰 글자(28px)로, 습도·풍속은 라벨을 흐리게 처리한 보조 정보로 배치.
- `useTemperature()`로 기온을 표시해, 단위 토글이 실제로 카드 숫자를 바꾸게 됐다.

### `WeatherBadge.vue`

- `status`/`temp`/`humidity`/`windSpeed` 개별 prop 대신 `cityItem` 객체 하나를 받고, 표시는 `domain/weatherRules.js`의 `getWeatherAdvice()` 결과를 그대로 렌더링만 한다.
- 조합 전용 문구("폭우+강풍 동시 발생!" 등)를 없애고, **위험 조건 1건당 문구 1개, 최대 2개까지 동시 노출**로 변경. 조건이 늘어도 조합 분기가 배로 늘지 않는다.
- 온도감 배지("🔥 더움 (25도 이상)")는 판정에 쓰이지 않는 표시였으므로 제거.

### `WeatherList.vue`

이벤트 패스스루를 `select-card`/`click-detail` 두 개에서 `request-detail` 하나로 단순화.

## 5. View 재작성

### `WeatherHomeView.vue`

- 세 View가 각각 `weatherMockData`를 직접 import하던 것을 **`weatherStore` 하나로 통일**.
- 검색 URL 동기화 방식 개선: 기존에는 타이핑 1글자마다 `router.push`로 히스토리가 쌓였고, 복원 로직은 `onMounted` + `KeepAlive` 전제였으나 실제 `KeepAlive`는 주석 처리돼 있어 코드와 동작 방식이 어긋나 있었다. 이제 **초기값은 setup 시점에 `route.query`에서 한 번만 읽고, 이후 변경은 `router.replace` + 300ms 디바운스**로 반영. `onMounted`/`KeepAlive` 의존을 제거.
- 필터된 목록을 **위험 지역이 상단에 오도록 정렬**(`isDangerWeather` 기준).
- 검색 결과 0건일 때 "검색 조건 초기화" 버튼 추가.

### `WeatherAlertView.vue`

`weatherStore.dangerCityList`(getter)를 그대로 렌더링하도록 변경. 안내 문구의 임계값을 `domain/weatherRules.js` 상수에서 직접 가져오도록 수정.

### `WeatherDetailView.vue`

- `mockDetails` 룩업 객체를 직접 만드는 대신 `weatherStore.findCityById()` 사용.
- **조회를 `onMounted` 1회에서 `computed(() => weatherStore.findCityById(route.params.cityId))`로 변경.** 기존 방식은 `/weather/city_01`에서 `/weather/city_02`로 파라미터만 바뀌며 이동하면(vue-router가 컴포넌트를 재사용하므로) `onMounted`가 다시 실행되지 않아 이전 도시 정보가 남는 버그가 있었다.
- 레이아웃 재배치: 돌아가기 버튼을 최상단으로, 위험 시 배지를 도시명보다 위에, 습도·풍속을 라벨:값 2열 정렬로 배치.
- 존재하지 않는 도시 안내 문구를 사용자 친화적으로 변경.
- `useTemperature()`로 기온을 표시.

## 6. `App.vue` 단일 셸화

기존 `App.vue`는 과제 1~5 다섯 섹션을 세로로 쌓아 한 페이지에 동시 렌더링했고, `<RouterView />`가 이름 없이 두 곳(과제4, 과제5 섹션)에 있어 **같은 라우트가 항상 두 인스턴스로 마운트**됐다(검색창 상태가 서로 어긋나고, 404 카드가 2개 뜨는 등). 이제 네비게이션 1개 + `<RouterView />` 1개인 단일 셸만 남겼다.

부수 정리: `.dashboard-wrapper`가 4개 파일에 `width: 600px` 고정으로 중복 선언돼 있던 것을 `exercise.css` 한 곳(`max-width: 640px; width: 100%`)으로 통합. `main.css`의 스캐폴드 기본값인 `@media (min-width: 1024px)` 2열 그리드도 제거 — 콘텐츠 성격과 무관하게 화면을 반으로 쪼개던 규칙이라 단일 셸 구조와 맞지 않았다.

## 7. Pinia 배치

> 요청 범위: "적용 배치까지만" — Store 구조를 세우고 화면에 연결하되, API 연동·인증 흐름·영속성 저장 같은 그 다음 단계는 손대지 않았다.

### Store 현황

| Store                            | 상태               | 내용                                                                                                                                                                                                                   |
| -------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stores/weatherStore.js` (신규)  | **연결 완료**      | `cities`, `listStatus`, `listError`, getter `dangerCityList`/`findCityById`, action `loadCityWeather`/`refreshCityWeather`. Home/Alert/Detail 세 View가 전부 이 Store를 통해서만 날씨 데이터를 읽는다                  |
| `stores/configStore.js`          | **소비 연결 완료** | `unit` (state), `unitSymbol` (getter), `toggleUnit` (action). `unitLabel` getter를 추가해 `UnitToggler.vue`의 중복 삼항식을 제거. `WeatherCard`/`WeatherDetailView`가 `useTemperature()`를 통해 실제로 이 Store를 구독 |
| `stores/favoriteStore.js` (신규) | **뼈대만**         | `favoriteCityIds`, `isFavorite`, `toggleFavorite` 등 구조만. 즐겨찾기 기능 자체가 화면에 없어 UI에는 연결하지 않음                                                                                                     |
| `stores/authStore.js` (신규)     | **뼈대만**         | `user`, `token`, `login`/`logout` 등 구조만. 로그인 화면·API가 없어 UI에는 연결하지 않음                                                                                                                               |

### `UnitToggler.vue` 배치

- 대시보드 상단(Navigation Bar 옆)에 배치되어 단위 설정을 변경하는 UI 버튼과 영역
- `configStore.toggleUnit()`을 호출하여 `celsius` ↔ `fahrenheit` 전환
- `configStore.unitSymbol`을 표시하여 현재 단위 상태를 시각적으로 피드백

### `useTemperature()` Composable

과제 요구사항 4번(메인/상세 날씨에 단위 설정 변경 적용)에서 "유사한 코드가 중복됨 → Composable로 해결 가능함"이라는 힌트를 반영했다.

- `configStore.unit`을 구독해 `formatTemp()`/`unitSymbol`을 제공
- Store에 변환 로직을 두지 않고(원본 섭씨가 사라짐), 컴포넌트마다 복사하지도 않는 절충안
- `WeatherCard.vue`와 `WeatherDetailView.vue`가 모두 이 composable을 사용하여 단위 변경 시 숫자가 실시간으로 갱신됨

---

## 3단계 주요 버그 수정 및 설계 개선

### 1. 위험 판정 기준값 불일치

기존 `WeatherAlertView.vue`는 화면에 "강풍(60m/s 이상)"이라고 적혀 있었지만 실제 판정 코드는 `windSpeed >= 50`이었다. 데이터 8건 중 50~59 구간 도시가 마침 폭우 조걼도 만족해 우연히 증상이 보이지 않았을 뿐이다. 이제 화면 문구가 `DANGER_WIND_SPEED` 상수를 직접 참조해 출력하므로, 값을 하나만 바꾸면 코드와 문구가 항상 같이 바뀐다.

### 2. 단위 토글이 화면에 반영되지 않던 문제

기존에는 `configStore.toggleUnit()`이 정상 동작했지만 `WeatherCard.vue`/`WeatherDetailView.vue`가 `°C`를 문자열로 하드코딩해 store를 구독하지 않았다 — 버튼을 눌러도 카드 숫자가 그대로였다. 이제 두 컴포넌트 모두 `useTemperature().formatTemp()`로 기온을 표시해 **단위변경 버튼이 실제로 화면 숫자를 바꾼다.** 단, 위험 판정(`isDangerWeather`)은 항상 섭씨 원본 값으로만 계산하도록 유지 — 화씨로 표시를 바꿔도 어떤 도시가 위험 판정을 받는지는 변하지 않는다.

### 3. `WeatherCard` 이벤트 계약 불일치

`WeatherList`를 경유하면 `click-detail` 이벤트가 `(name, status, humidity, windSpeed)`만 전달되고 `id`가 빠져 있어 라우팅이 불가능했었다. 이를 `cityId` 단일 인자로 축소하여 해결.

### 4. `WeatherDetailView` 라우트 파라미터 변경 시 데이터 미갱신

기존 방식은 `onMounted` 1회 조회였는데, vue-router가 컴포넌트를 재사용하면 `onMounted`가 다시 실행되지 않아 이전 도시 정보가 남는 버그가 있었다. `computed` 기반 조회로 변경하여 해결.

---

## 최종 파일 구조

```
src/
├─ components/
│   ├─ common/
│   │   ├─ BaseDashboardCard.vue
│   │   ├─ SearchBar.vue
│   │   └─ StatusBar.vue
│   └─ weather/
│       ├─ WeatherList.vue
│       ├─ WeatherCard.vue
│       ├─ WeatherBadge.vue
│       ├─ UnitToggler.vue
│       └─ weatherMockData.js
├─ views/
│   ├─ WeatherHomeView.vue
│   ├─ WeatherAlertView.vue
│   ├─ WeatherDetailView.vue
│   ├─ WeatherAboutView.vue
│   └─ NotFoundView.vue
├─ domain/
│   ├─ weatherRules.js
│   └─ temperature.js
├─ composables/
│   └─ useTemperature.js
├─ stores/
│   ├─ weatherStore.js
│   ├─ configStore.js
│   ├─ favoriteStore.js
│   └─ authStore.js
├─ router/
│   └─ index.js
├─ App.vue
└─ main.js
```

---

## 검증 방법

1. `npx eslint src` — 0 errors (기존에 있던 무관한 warning 2건 제외)
2. `npm run build` — 정상 빌드
3. 브라우저로 5개 라우트 전부 확인:
   - 홈(`/`) — 8개 도시, 검색바 2개(도시/날씨 상태), 위험 정렬, 빈 결과, 검색어 URL 동기화
   - 상세(`/weather/:cityId`) — 존재/미존재 도시, 단위 토글, 습도/풍속 표시
   - 경보(`/weather/alerts`) — 위험 조건에 해당하는 도시만 노출
   - 소개(`/about`) — 정상 렌더링
   - 404 — catch-all 정상 동작
4. 네트워크 탭에서 `/weather/alerts` 방문 시점에 `WeatherAlertView.vue` 청크가 지연 로드되는지 확인
5. 콘솔 에러 없음, 네비게이션/RouterView 중복 렌더링 사라짐 확인
6. 검색어 입력 시 URL이 `router.replace`로 반영되고(`?search=제주`), 히스토리가 쌓이지 않는 것 확인
7. 단위 토글 버튼 클릭 시 메인 카드와 상세 페이지의 온도 숫자가 실시간으로 변경되는지 확인

---

## 남은 이슈 (다음 작업 후보)

- `vue_architecture.md` 10절 기준 5~8단계: 로딩/오류 상태의 실제 구현, `api/` 계층 신설과 실 API 연동, 인증·Navigation Guard, 디자인 토큰(색상·타이포·간격 시스템) 적용
- 도시 비교 뷰(`/weather/compare`) — query string 다중 선택 패턴, 보류 중
- 홈 라우트(`/`)도 lazy loading으로 통일할지 여부
- `favoriteStore`/`authStore`는 UI에 연결되지 않은 뼈대 상태
- `configStore.unit`/`favoriteStore.favoriteCityIds`의 localStorage 영속화 (새로고침하면 섭씨로 초기화됨)
- `components/practices/**`(48개) 자체의 정리

---

![날씨1 화면](./day3_weather1.png)
![날씨2 화면](./day3_weather2.png)
![날씨3 화면](./day3_weather3.png)
