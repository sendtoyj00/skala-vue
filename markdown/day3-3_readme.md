# Day 3-3 — 설계 문서 3종에 맞춘 구조 정리 + Pinia 배치

`service_architecture.md` / `design_architecture.md`(신규) / `vue_architecture.md` 3개 설계 문서를 먼저 재작성한 뒤, 그 문서가 정한 마이그레이션 순서(vue_architecture.md 10절)를 따라 코드를 실제로 옮긴 작업 기록이다. 범위는 **Pinia 도입 전 구조 정리 전부** + **Pinia는 배치까지만**(weatherStore를 실제로 연결하고 favoriteStore/authStore는 뼈대만 만들어 둔다)로 한정했다. 디자인 쪽은 배치(정보 순서·레이아웃)만 반영했고 색상 토큰·타이포 시스템 같은 디테일은 보류했다.

## 작업 순서

1. **정리(cleanup)** — 학습 산출물 격리, 스캐폴딩 삭제, 완전 중복 백업 삭제
2. **폴더 재편** — `components/exercise/` → `components/common/` + `components/weather/`
3. **도메인 계층 신설** — `src/domain/`, `src/composables/`
4. **컴포넌트 계약 수정** — `WeatherCard`/`WeatherList`/`WeatherBadge`의 emit·layout
5. **View 재작성** — Home/Alert/Detail이 store와 domain을 쓰도록
6. **App.vue 단일 셸화**
7. **Pinia 배치** — `weatherStore` 연결, `favoriteStore`/`authStore` 뼈대, `configStore` 소비 연결
8. **검증** — eslint, `npm run build`, 브라우저로 5개 라우트 전부 확인

## 1. 정리(cleanup) — vue_architecture.md 11절

| 대상 | 처리 | 이유 |
| --- | --- | --- |
| `WeatherMockup.vue` / `WeatherComposition.vue` / `WeatherParent.vue`, `App.vue.1st/.2nd/.3rd` | `src/practices/weather-intro/`로 이동 | 학습 계보 기록. 삭제하면 계보가 끊긴다 |
| `stores/counter.js` | `src/practices/counter.js`로 이동 (소비처 `StoreCounter.vue`의 import 경로도 수정) | 실습용 Store가 `weatherStore`/`favoriteStore`/`authStore`와 같은 폴더에 있으면 "이 앱의 전역 상태가 무엇인가"를 폴더 목록으로 답할 수 없다 |
| `components/HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`, `components/icons/*`, `views/HomeView.vue`, `views/AboutView.vue` | 삭제 | `npm create vue` 스캐폴딩 산출물, 본인 작성 아님, 라이브 트리 어디서도 참조되지 않음. `AboutView.vue`는 `WeatherAboutView.vue`와 이름이 헷갈려 잘못된 파일을 열게 만드는 위험까지 있었음 |
| `App.vue.old`, `router/index.js.old` | 삭제 | 다른 백업 파일과 바이트 단위로 완전 중복인 것을 `diff`로 확인 후 삭제 |
| `WeatherCard.vue.afterStore` / `.beforeStore` | `docs/reference/`로 이동, 확장자를 `.vue.txt`로 바꿔 lint/Vite 대상에서 제외 | 구현 참고자료로서 가치는 있으나, `.vue` 확장자로 두면 `defineProps` 반환값 미대입 등 결함이 검사 없이 방치된다(실제로 `.afterStore`가 그 결함을 갖고 있었다) |
| `components/practices/**`(basic/component/composition/library, 48개) | 그대로 둠 | 이미 `practices/` 아래 격리되어 있어 이번 정리 대상이 아니었다 |

## 2. 폴더 재편 — `components/exercise/` 분해

도메인 지식(날씨 필드·위험 규칙)을 아는지 여부로 나눴다.

| 새 위치 | 파일 |
| --- | --- |
| `components/common/` | `BaseDashboardCard.vue`, `SearchBar.vue`, `StatusBar.vue` |
| `components/weather/` | `WeatherList.vue`, `WeatherCard.vue`, `WeatherBadge.vue`, `UnitToggler.vue`, `weatherMockData.js` |

`exercise/` 폴더는 비워져 삭제됐다.

## 3. 도메인 계층 신설

| 파일 | 내용 |
| --- | --- |
| `src/domain/weatherRules.js` (신규) | 위험 판정 임계값 상수(`DANGER_WIND_SPEED=50`, `DANGER_TEMP=30` 등) + `isDangerWeather()` + `getWeatherAdvice()`. 기존에 함수 1벌(`weatherMockData.js`) + 템플릿 `v-if` 체인 1벌(`WeatherBadge.vue`)로 흩어져 있던 판정 규칙을 이 파일 하나로 합쳤다 |
| `src/domain/temperature.js` (신규) | `celsiusToFahrenheit()` 순수 함수. 기존에 `WeatherCard.vue.afterStore`/`WeatherDetailView.vue.afterStore` 두 곳에 복사돼 있던 공식을 이 파일 하나로 합쳤다 |
| `src/composables/useTemperature.js` (신규) | `configStore.unit`을 구독해 `formatTemp()`/`unitSymbol`을 제공. Store에 변환 로직을 두지 않고(원본 섭씨가 사라짐), 컴포넌트마다 복사하지도 않는 절충안 |

`weatherMockData.js`는 이제 데이터만 갖는다. `isDangerWeather`는 더 이상 이 파일에서 export하지 않는다 — 데이터 파일과 판정 규칙은 수명이 다르기 때문(목업은 API 연동 시 사라지지만 판정 규칙은 남아야 한다).

### 버그 수정: 위험 판정 기준값 불일치

기존 `WeatherAlertView.vue`는 화면에 "강풍(60m/s 이상)"이라고 적혀 있었지만 실제 판정 코드는 `windSpeed >= 50`이었다. 데이터 8건 중 50~59 구간 도시가 마침 폭우 조건도 만족해 우연히 증상이 보이지 않았을 뿐이다. 이제 화면 문구가 `DANGER_WIND_SPEED` 상수를 직접 참조해 출력하므로, 값을 하나만 바꾸면 코드와 문구가 항상 같이 바뀐다.

## 4. 컴포넌트 계약 수정

### WeatherCard.vue

- **emit을 5개 위치 인자 → `cityId` 문자열 1개로 축소**하고 이름을 `click-detail` → `request-detail`로 바꿨다. 기존에는 `(name, status, humidity, windSpeed, id)`를 보내 수신부(Home/Alert View)가 앞 4개를 버리는 코드를 써야 했다.
- **카드 전체 클릭 = 상세 이동**으로 통일했다. 기존에는 카드 클릭이 `select-card`(상태바 문구 변경)만 하고, 절대 위치(`position: absolute`)로 얹힌 별도 버튼이 이동을 담당해 도시명과 겹칠 수 있는 구조였다. `select-card` 이벤트와 상세보기 버튼을 모두 없앴다.
- **레이아웃을 정보 위계에 맞게 재배치**했다: 위험 시 좌측 4px 빨간 테두리 + "⚠ 위험" 플래그를 카드 최상단에 고정, 도시명/상태를 한 줄로, 기온을 카드에서 가장 큰 글자(28px)로, 습도·풍속은 라벨을 흐리게 처리한 보조 정보로 뒀다. 기존에는 도시명·기온·습도·풍속이 전부 같은 크기의 `<p>` 태그였다.
- `useTemperature()`로 기온을 표시해, 단위 토글이 실제로 카드 숫자를 바꾸게 됐다(아래 7절 참조).

### WeatherBadge.vue

- `status`/`temp`/`humidity`/`windSpeed` 개별 prop 대신 `cityItem` 객체 하나를 받고, 표시는 `domain/weatherRules.js`의 `getWeatherAdvice()` 결과를 그대로 렌더링만 한다.
- 조합 전용 문구("폭우+강풍 동시 발생!" 등)를 없애고, **위험 조건 1건당 문구 1개, 최대 2개까지 동시 노출**로 바꿨다. 조건이 늘어도 조합 분기가 배로 늘지 않는다.
- 온도감 배지("🔥 더움 (25도 이상)")는 판정에 쓰이지 않는 표시였으므로 제거했다(디테일 판단은 design 문서 몫이라 색·토큰 재설계는 하지 않았고, 판정과 무관한 요소만 정리했다).

### WeatherList.vue

이벤트 패스스루를 `select-card`/`click-detail` 두 개에서 `request-detail` 하나로 단순화했다.

## 5. View 재작성

### WeatherHomeView.vue

- 세 View가 각각 `weatherMockData`를 직접 import하던 것을 **`weatherStore` 하나로 통일**했다(6절 참조).
- 검색 URL 동기화 방식을 바꿨다: 기존에는 타이핑 1글자마다 `router.push`로 히스토리가 쌓였고(주석에도 "현재 큰 의미없음"이라 적혀 있었다), 복원 로직은 `onMounted` + `KeepAlive` 전제였는데 실제 `KeepAlive`는 주석 처리돼 있어 동작 방식이 코드와 어긋나 있었다. 이제 **초기값은 setup 시점에 `route.query`에서 한 번만 읽고, 이후 변경은 `router.replace` + 300ms 디바운스**로 반영한다. `onMounted`/`KeepAlive` 의존을 없앴다.
- 필터된 목록을 **위험 지역이 상단에 오도록 정렬**했다(`isDangerWeather` 기준). 기존에는 배열 원본 순서 그대로라 안전한 도시 4곳이 항상 위에 나왔다.
- 검색 결과 0건일 때 "검색 조건 초기화" 버튼을 추가했다.

### WeatherAlertView.vue

`weatherStore.dangerCityList`(getter)를 그대로 렌더링하도록 바꿨다. 안내 문구의 임계값을 `domain/weatherRules.js` 상수에서 직접 가져오도록 해 위 "버그 수정" 항목을 반영했다.

### WeatherDetailView.vue

- `mockDetails` 룩업 객체를 직접 만드는 대신 `weatherStore.findCityById()`를 쓴다.
- **조회를 `onMounted` 1회에서 `computed(() => weatherStore.findCityById(route.params.cityId))`로 바꿨다.** 기존 방식은 `/weather/city_01`에서 `/weather/city_02`로 파라미터만 바뀌며 이동하면(vue-router가 컴포넌트를 재사용하므로) `onMounted`가 다시 실행되지 않아 이전 도시 정보가 남는 버그가 있었다. 지금까지는 상세 화면에 다른 도시로 가는 링크가 없어 증상이 드러나지 않았을 뿐이다.
- 레이아웃을 재배치했다: 돌아가기 버튼을 최상단으로(기존엔 최하단), 위험 시 배지를 도시명보다 위에, 습도·풍속을 라벨:값 2열 정렬로(기존엔 "대기 습도: 90%" 같은 문장형이라 값만 훑을 수 없었다).
- 존재하지 않는 도시 안내 문구를 "해당 지역의 상세 데이터 장부가 존재하지 않습니다"(내부 은어, 다음 행동 없음)에서 "요청하신 지역의 날씨 정보를 찾을 수 없습니다. 지역 목록에서 다시 선택해 주세요"로 바꿨다.
- `useTemperature()`로 기온을 표시한다.

## 6. App.vue 단일 셸화

기존 `App.vue`는 과제 1~5 다섯 섹션을 세로로 쌓아 한 페이지에 동시 렌더링했고, `<RouterView />`가 이름 없이 두 곳(과제4, 과제5 섹션)에 있어 **같은 라우트가 항상 두 인스턴스로 마운트**됐다(검색창 상태가 서로 어긋나고, 404 카드가 2개 뜨는 등). 이제 네비게이션 1개 + `<RouterView />` 1개인 단일 셸만 남겼다. 학습 단계 컴포넌트(`WeatherMockup`/`WeatherComposition`/`WeatherParent`)는 1절에서 `practices/`로 옮겼으므로 `App.vue`에서 import를 제거했다.

부수 정리: `.dashboard-wrapper`가 4개 파일(`exercise.css`, `WeatherHomeView.vue`, `WeatherAlertView.vue`, `WeatherParent.vue`)에 `width: 600px` 고정으로 중복 선언돼 있던 것을 `exercise.css` 한 곳(`max-width: 640px; width: 100%`)으로 통합했다. `main.css`의 스캐폴딩 기본값인 `@media (min-width: 1024px)` 2열 그리드도 제거했다 — 콘텐츠 성격과 무관하게 화면을 반으로 쪼개던 규칙이라 단일 셸 구조와 맞지 않았다.

## 7. Pinia 배치

> 요청 범위: "적용 배치까지만" — Store 구조를 세우고 화면에 연결하되, API 연동·인증 흐름·영속성 저장 같은 그 다음 단계는 손대지 않았다.

| Store | 상태 | 내용 |
| --- | --- | --- |
| `stores/weatherStore.js` (신규) | **연결 완료** | `cities`, `listStatus`, `listError`, getter `dangerCityList`/`findCityById`, action `loadCityWeather`/`refreshCityWeather`. Home/Alert/Detail 세 View가 전부 이 Store를 통해서만 날씨 데이터를 읽는다 |
| `stores/favoriteStore.js` (신규) | **뼈대만** | `favoriteCityIds`, `isFavorite`, `toggleFavorite` 등 구조만 만들었다. 즐겨찾기 기능 자체가 화면에 없어 UI에는 연결하지 않았다 |
| `stores/authStore.js` (신규) | **뼈대만** | `user`, `token`, `login`/`logout` 등 구조만. 로그인 화면·API가 없어 UI에는 연결하지 않았다 |
| `stores/configStore.js` | **소비 연결 완료** | `unitLabel` getter를 추가해 `UnitToggler.vue`의 중복 삼항식을 제거했고, `WeatherCard`/`WeatherDetailView`가 `useTemperature()`를 통해 실제로 이 Store를 구독하게 됐다 |

### 버그 수정: 단위 토글이 화면에 반영되지 않던 문제

기존에는 `configStore.toggleUnit()`이 정상 동작했지만 `WeatherCard.vue`/`WeatherDetailView.vue`가 `°C`를 문자열로 하드코딩해 store를 구독하지 않았다 — 버튼을 눌러도 카드 숫자가 그대로였다. 이제 두 컴포넌트 모두 `useTemperature().formatTemp()`로 기온을 표시해 **단위변경 버튼이 실제로 화면 숫자를 바꾼다.** 단, 위험 판정(`isDangerWeather`)은 항상 섭씨 원본 값으로만 계산하도록 유지했다 — 화씨로 표시를 바꿔도 어떤 도시가 위험 판정을 받는지는 변하지 않는다.

## 검증

- `npx eslint src` — 0 errors (기존에 있던 무관한 warning 2건 제외)
- `npm run build` — 정상 빌드
- 브라우저로 5개 라우트 전부 확인: 홈(검색·정렬·빈 결과), 상세(존재/미존재 도시, 단위 토글), 경보, 소개, 404 — 콘솔 에러 없음, 네비게이션/RouterView 중복 렌더링 사라짐 확인
- 검색어 입력 시 URL이 `router.replace`로 반영되고(`?search=제주`), 히스토리가 쌓이지 않는 것 확인

## 남은 이슈 (다음 작업 후보)

- `vue_architecture.md` 10절 기준 5~8단계: 로딩/오류 상태의 실제 구현, `api/` 계층 신설과 실 API 연동, 인증·Navigation Guard, 디자인 토큰(색상·타이포·간격 시스템) 적용 — 전부 이번 범위 밖으로 남겨둠
- `favoriteStore`/`authStore`는 UI에 연결되지 않은 뼈대 상태
- `configStore.unit`/`favoriteStore.favoriteCityIds`의 localStorage 영속화는 아직 없음(새로고침하면 섭씨로 초기화됨)
- `components/practices/**`(48개) 자체의 정리(격리 위치 재검토 등)는 이번 작업에서 다루지 않음
