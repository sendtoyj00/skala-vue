# Vue 구현 아키텍처 기준

> "무엇을 왜"는 [service_architecture.md](./service_architecture.md), "어떻게 보이는가"는 [design_architecture.md](./design_architecture.md)가 답한다. 이 문서는 **어디에 구현할 것인가**에만 답한다: 계층·상태 위치·Store 설계·로직 소유권·데이터 흐름·라우팅·API 계층·마이그레이션.

세 문서 역할 분담:

| 파일 | 답하는 질문 |
| --- | --- |
| [service_architecture.md](./service_architecture.md) | 무엇을, 왜 만드는가 |
| [design_architecture.md](./design_architecture.md) | 어떻게 보여줄 것인가 |
| **vue_architecture.md** (이 문서) | 어디에 구현할 것인가 |

경계: "즐겨찾기는 로그인해야 저장된다"(서비스) / "즐겨찾기 별 아이콘은 활성 시 색이 바뀐다"(디자인) / "즐겨찾기 상태는 favoriteStore가 소유하고 authStore를 참조한다"(이 문서).

상태 표기: `[현재]`(file:line 근거 필수) / `[예정]` / `[결정 필요]`.

---

## 1. 현재 구조 실태

`src/` 전체 파일 **104개**, `.vue` **74개**. 그러나 라이브 엔트리(`main.js → App.vue → router/index.js`)에서 실제 도달하는 `.vue`는 **16개**뿐이다. 나머지 58개(78.4%)는 어떤 실행 경로에서도 마운트되지 않는다.

| 성격 | 위치 | 개수 | 판별 근거 |
| --- | --- | --- | --- |
| 서비스 코드 | `App.vue`, `router/index.js`, `configStore.js`, `views/Weather*.vue`, `components/exercise/*` | `.vue` 16 + 데이터/설정 파일 | 라이브 엔트리에서 도달 |
| 학습 실습 코드 | `components/practices/**` | 50 | 라이브 import 0건. 참조는 `App.vue.1st/.2nd/.3rd` 백업 안에만 존재 |
| 스캐폴딩 잔재 | `HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`, `icons/*`, `HomeView.vue`, `AboutView.vue`, `practice.css`, `counter.js` | 12 | create-vue 기본 산출물, 라이브 트리 미참조 |
| 백업 변형 | `*.vue.*`, `*.js.*` | 19 | 전부 git 추적 중 |

이전 설계 문서는 이 트리를 생략하고 "View 7 / Component 10 / Store 2"로만 그렸다. 실태를 숨기면 정리 대상이 영원히 남는다 — 예: `router/index.js.old`는 "직전 상태 백업"으로 커밋됐지만 실제 내용은 스캐폴딩 원본과 동일해 되돌릴 수 없다.

---

## 2. 계층 정의와 책임 경계

### 계층 목록

| # | 계층 | 정의 | 위치 |
| --- | --- | --- | --- |
| 1 | View | 라우트 1개에 대응하는 화면. 조립과 화면 전용 상태만 | `src/views/` |
| 2 | Component | 화면 조각. props 받아 그리고 이벤트를 올림 | `src/components/common/`, `.../weather/` `[예정]` |
| 3 | composable | 반응형 재사용 로직 | `src/composables/` `[예정]` |
| 4 | Store | 라우트를 넘어 공유되는 상태의 주인 | `src/stores/` |
| 5 | Router | URL↔화면 매핑, URL에 남는 상태 | `src/router/` |
| 6 | API 클라이언트 | HTTP 요청/응답, 오류 정규화 | `src/api/` `[예정]` |
| 7 | 도메인 로직 | Vue를 모르는 순수 함수와 상수 | `src/domain/` `[예정]` |

### composable/domain 계층을 새로 도입하는 이유

이전 설계에는 View/Component/Store/Router 네 칸뿐이었다. "반응형 재사용 로직"과 "Vue를 모르는 순수 규칙"이 갈 칸이 없어 로직이 흩어졌다:

| 로직 | 흩어진 곳 | 벌 수 |
| --- | --- | --- |
| 위험 판정 | `weatherMockData.js:13`(함수), `WeatherComposition.vue:42`·`WeatherParent.vue:43`(computed 인라인), `WeatherBadge.vue:27-33`(템플릿) | 4 |
| 검색 필터 | `WeatherHomeView.vue:38-47`, 과제2·3 | 3 |
| 온도 변환 | `WeatherCard.vue.afterStore:18-24`, `WeatherDetailView.vue.afterStore:26-33` | 2 |

> 계층을 만들지 않으면 로직이 사라지지 않는다. 갈 곳 없는 로직은 아무 데나 눌러앉고, 눌러앉은 만큼 복제된다.

반응성이 필요하면 composable, 필요 없으면 domain으로 나눈다 — `isDangerWeather`는 인자 하나로 boolean을 내는 순수 함수라 반응형 컨텍스트가 불필요하다.

### 의존 방향

```text
View → Component → composable → Store → API 클라이언트 → 도메인 로직
```

> 각 계층은 아래 계층만 안다. 위쪽을 알게 되는 순간, 아래 계층은 그 화면 전용 부품이 된다.

`weatherMockData.js:1`의 주석("WeatherHomeView / WeatherAlertView가 공유하는")이 이미 역방향 참조다 — 데이터 파일이 자기를 쓰는 View 이름을 알고 있다.

### Component가 Store를 직접 참조해도 되는가

**조건부 허용.** 판별 질문: "같은 화면에 여러 인스턴스가 뜨고 각각 다른 값을 보여야 하는가?" Yes면 props, No면 Store 직접 참조 가능.

| 컴포넌트 | 방식 | 판정 |
| --- | --- | --- |
| `UnitToggler` | Store 직접 참조 | 적합(앱 전체에 하나뿐) |
| `WeatherCard` | props(`cityItem`) | 적합(목록에 8개 인스턴스, 각각 다른 도시) |
| `SearchBar` | props+emit | 적합(같은 화면에 2인스턴스가 각각 다른 검색어 담당) |

`[결정됨]`: 온도 단위처럼 전역이면서 카드마다 반복 소비되는 값은 composable로 해소한다 — 카드는 도시 데이터를 props로, 단위는 composable로 읽는다.

### 폴더 구조 규칙

> 도메인 지식을 알아야 하는 컴포넌트와, 몰라도 되는 컴포넌트를 같은 폴더에 두지 않는다.

판별 질문: "이 컴포넌트를 다른 서비스에 그대로 옮길 수 있는가?"

| 폴더 | 조건 | 현재 해당 |
| --- | --- | --- |
| `components/common/` | 날씨 필드명·위험 규칙을 모른다 | `BaseDashboardCard`, `SearchBar`, `StatusBar` |
| `components/weather/` | 날씨 필드명·위험 규칙을 안다 | `WeatherCard`, `WeatherList`, `WeatherBadge`, `UnitToggler` |

나누는 시점: 같은 폴더에 도메인 의존/무의존 컴포넌트가 각각 3개 이상 쌓이면. `exercise/`는 이미 이 조건(무의존 3, 의존 4)을 충족했으므로 지금 나눈다.

---

## 3. 상태 배치 결정 기준

### 결정 트리

```text
새 상태
 ① URL에 남아야 하는가(새로고침·공유·뒤로가기 복원)?  Yes → Router(params/query)
 ② 하나의 View 안에서 끝나는가?                      Yes → 로컬 ref
 ③ 부모-자식 2단계 안에서 전달되는가?                 Yes → props/emits
 ④ 라우트 넘어 살아야 하거나 형제 화면이 공유하는가?    Yes → Pinia Store
                                                    No  → provide/inject(현재 사용처 0건)
```

### "일단 Pinia에 넣기"를 막는 규칙

> Store에 올리려면 "현재 이 값을 읽는 두 번째 라우트가 존재한다"를 file:line으로 댈 수 있어야 한다. 대지 못하면 로컬 ref.

`counter.js`가 반례 표본이다 — 도메인 상태가 아닌데 Store로 만들어졌고, 유일한 소비처가 dead code다.

### "props로 계속 내리기"를 막는 규칙

> 같은 값이 3단계 이상 내려가며 중간 컴포넌트가 쓰지 않고 전달만 하면, Store 또는 composable로 올린다.

`WeatherList.vue:17`이 `click-detail`을 `(...args) => $emit(...)`로 무검증 중계하고, `WeatherCard.vue:25`가 보내는 5개 인자 중 실제 필요한 것은 `id` 하나뿐이라 수신부마다 앞 4개를 버리는 코드를 쓴다.

### 현재 상태 전수 판정

| 상태 | 현재 위치 | 결정 위치 | 근거 |
| --- | --- | --- | --- |
| 도시 목록 | 세 View 각각 `weatherMockData` import | `weatherStore` `[예정]` | 세 라우트가 같은 목록을 읽는다. API 전환 시 조회·오류가 한 곳에 있어야 |
| 선택 도시 | `route.params.cityId` | Router params 유지 | 링크 공유·새로고침 복원 필요 |
| 검색어 | 로컬 ref + URL push | Router query 단일화 `[예정]` | 같은 값이 두 곳에 있어 어긋난다 |
| 온도 단위 | `configStore.unit` | 유지 + 영속 `[예정]` | 위치는 이미 옳음. 문제는 소비자가 하나뿐 |
| 위험 판정 결과 | computed 3벌 + 템플릿 1벌 | **상태로 두지 않음.** 규칙은 domain, 계산은 getter | 원본에서 항상 계산 가능한 파생값 |
| 즐겨찾기/로그인/토큰 | 없음 | `favoriteStore`/`authStore` `[예정]` | 신규 |
| 로딩/오류 | 없음(백업본에만) | Store별 요청 단위 `[예정]` | 6절 |
| 상태 메시지(StatusBar) | View 로컬 ref | 유지 | 화면을 벗어나면 의미가 없다 |

---

## 4. Pinia Store 설계

### 분리 기준

> Store는 도메인 단위로 나눈다. 화면 단위로 나누지 않는다.

화면 단위(`HomeStore`/`AlertStore`)로 나누면 같은 8개 도시 목록을 두 Store가 각각 갖게 되어, 지금 세 View가 mock을 직접 import하는 문제가 이름만 바뀐 채 재현된다.

| Store | 도메인 | 상태 |
| --- | --- | --- |
| `configStore` | 앱 표시 설정 | `[현재]` |
| `weatherStore` | 날씨 데이터 | `[예정]` |
| `favoriteStore` | 사용자 즐겨찾기 | `[예정]` |
| `authStore` | 인증 | `[예정]` |

`stores/counter.js`는 어떤 도메인에도 속하지 않으므로 정리 대상(11절).

### 문법 통일

> 모든 Store는 setup store(`defineStore(id, () => {...})`)로 작성한다.

이미 `configStore`가 이 형식이고 options store는 레포에 0건. state=`ref`, getter=`computed`, action=일반 함수, 마지막에 `return`으로 노출. 소비는 점 표기 직접 접근(`store.unit`), 구조 분해는 반응성이 끊기므로 금지(`storeToRefs` 미도입 — 사용 선례 0건).

### configStore `[현재]`

| 구분 | 이름 | 설명 |
| --- | --- | --- |
| state | `unit` | `'celsius'\|'fahrenheit'` |
| getter | `unitSymbol` | `℃`/`℉` |
| action | `toggleUnit()` | 토글 |

`[예정]`: localStorage 복원(4.9), `unitLabel` getter 추가(`UnitToggler.vue:9`의 삼항식 중복 제거). **변환 공식은 Store에 두지 않는다**(5.2절 참조).

### weatherStore `[예정]`

| 구분 | 이름 | 설명 |
| --- | --- | --- |
| state | `cities` | 원본 단위(섭씨) 숫자 그대로 |
| state | `listStatus`/`listError`/`fetchedAt` | 6.2/6.3 |
| getter | `dangerCityList` | `cities.filter(isDangerWeather)` — `WeatherAlertView.vue:15`를 그대로 옮김 |
| getter | `findCityById(id)` | `WeatherDetailView.vue:10-15` lookup map 대체 |
| action | `loadCityWeather()` / `refreshCityWeather()` | 최초 조회 / 강제 재조회(재시도 버튼용) |

`selectedCity`를 state로 두지 않는 이유: `route.params.cityId`가 이미 소유한다. Store에 복사하면 URL과 두 곳이 진실을 주장한다.

### favoriteStore `[예정]`

| 구분 | 이름 | 설명 |
| --- | --- | --- |
| state | `favoriteCityIds` | id 배열(도시 객체 아님 — 4.7) |
| getter | `isFavorite(cityId)` | — |
| action | `toggleFavorite(cityId)` | 등록/제거 단일 진입점 |

`addFavorite`/`removeFavorite`를 따로 열지 않는 이유: 서비스 규칙이 토글 하나만 정의한다. 둘을 열면 "이미 등록됐는지" 판정이 호출부(카드·상세·목록)마다 복제된다 — `isDangerWeather` 4벌 복제와 같은 경로.

### authStore `[예정]`

`user`, `token`(저장 위치 `[결정 필요]`), `isLoggedIn`(getter), `login()`, `logout()`, `restoreSession()`.

### Store 간 의존 규칙

```text
서열 0(독립)   authStore   weatherStore
                    ▲ 단방향(쓰기 전제조건 검사)
서열 1(의존허용) favoriteStore
```

> 참조는 서열이 높은 Store가 낮은 Store를 향하는 한 방향만. 같은 서열끼리는 참조하지 않는다.

`favoriteStore → authStore`는 허용(즐겨찾기가 로그인에 종속된다는 서비스 규칙을 코드로 표현할 자리가 필요). 역방향은 불가(로그인은 즐겨찾기를 몰라도 완결된다). `favoriteStore → weatherStore`는 금지 — 즐겨찾기 카드를 그리려면 도시 데이터가 필요하지만, 그 결합은 **composable에서** 한다(localStorage 복원 타이밍이 weatherStore보다 빠를 수 있어서).

> 쓰기의 전제 조건은 Store 안에서 검사하고, 읽기의 데이터 결합은 composable에서 한다.

### Store에 두면 안 되는 것

파생 데이터(재계산 누락 위험) / 표시용 문자열·단위 접미사(비교·정렬 불가능해짐 — `WeatherDetailView.vue:13`이 이미 이 실수를 함) / 화면 전용 일시 상태 / API 키(위치만 바뀔 뿐 해결이 아님).

### 영속성

| 상태 | 영속 | 저장소 |
| --- | --- | --- |
| `configStore.unit` | 필요 | localStorage |
| `favoriteStore.favoriteCityIds` | 필요 | 비로그인 localStorage / 로그인 서버 `[결정 필요]` |
| `authStore.token` | `[결정 필요]` | 백엔드 확보 후 |
| `weatherStore.cities` | 불필요 | — (시간 의존 데이터, 저장하면 어제 값이 먼저 보임) |

구현은 `pinia-plugin-persistedstate` 미설치이므로 각 Store 안에서 `watch` + `localStorage`로 직접 구현한다.

---

## 5. 로직 소유권 결정

### 5.1 지금 막혀 있는 것 `[현재]`

`UnitToggler.vue:11`이 `configStore.toggleUnit`을 호출하고 `unit`은 실제로 바뀐다. 그런데 `WeatherCard.vue:19`는 `{{ cityItem.temp }}°C`로 store를 참조하지 않는다. **결과: 버튼을 눌러도 카드 기온 표기가 그대로다.** Store 설계 문제가 아니라 변환 로직의 소유자가 정해지지 않은 문제다.

### 5.2 온도 단위 변환

세 선택지 비교: (a) Store getter가 변환된 목록 반환 — 원본 섭씨가 사라져 판정 임계값이 다 깨진다. (b) 컴포넌트가 각자 변환 — **이미 시도됐고 실패했다**: `WeatherCard.vue.afterStore`와 `WeatherDetailView.vue.afterStore`에 공식이 두 벌 복사돼 있다. (c) composable이 함수를 제공, 컴포넌트가 호출.

> **(c) 채택.** `domain/temperature.js`가 순수 변환 함수, `composables/useTemperature.js`가 `configStore`를 구독해 포맷 함수 제공.

> 템플릿에 `°C`/`%`/`m/s` 단위 문자열을 직접 쓰지 않는다.

> **판정은 항상 원본 섭씨 기준. 단위 변환은 표시 순간에만 적용한다.** (`WeatherCard.vue.afterStore:33`이 이미 이렇게 동작 — 이 규칙이 없는 상태였을 뿐)

### 5.3 위험 판정 로직

`isDangerWeather`는 `weatherMockData.js:13`에 있는데, 목업 도시 8건과 수명이 다르다 — 목업은 API 연동 시 사라지지만 판정 규칙은 그대로 필요하다. **목업을 지우면 규칙이 같이 지워지는 구조다.**

> 위험 판정 규칙과 임계값 상수는 `src/domain/weatherRules.js` `[예정]`에 둔다.

`DANGER_STATUS`, `DANGER_WIND_SPEED(50)`, `DANGER_TEMP(30)` 등을 named 상수로 뺀다 — 숫자 `50`이 현재 코드 4곳에 리터럴로 등장하고 화면 문구는 `60`이라 이미 어긋나 있다. `WeatherBadge`의 `v-if` 체인도 같은 규칙을 재사용한다(템플릿 판정은 단위 테스트가 불가능하고 순서를 바꾸면 조용히 다른 결과가 난다).

### 5.4 검색 필터링

판단 근거: 두 번째 소비자가 있는가. `WeatherAlertView`·`WeatherDetailView`엔 검색창이 없다(소비자는 `WeatherHomeView` 하나).

> **`WeatherHomeView`의 computed에 그대로 둔다.** Store로 올리지 않는다.

재검토 조건: 두 번째 View가 같은 필터를 요구하는 순간 `domain/weatherRules.js`의 `filterCities()`로 승격.

### 5.5 관통 규칙

1. 파생 데이터는 저장하지 않고 계산한다.
2. 도메인 로직은 데이터 파일에 얹지 않는다(수명이 다르다).
3. 원본 값과 표시 값을 같은 자리에 두지 않는다(표시 값은 다시 계산에 못 쓴다).
4. 소비자가 하나면 소비자가 갖는다. 승격은 두 번째 소비자가 생길 때.

---

## 6. 로딩과 오류 상태의 소유권

### 왜 지금 필요한가

live 코드에는 로딩·오류가 없다(목업이 동기 데이터라 필요 없었음). API로 바꾸면 "아직 값이 없음"과 "값이 없음(결과 0건)"을 구분해야 한다. 이 구분에 실패한 실제 사례: 백업본이 통신 실패를 `console.error`만 하고 목록을 빈 배열로 남겨, 화면에 "검색 결과 없음"이 뜬다.

### 로딩 상태 위치

> **Store별로 두되, 그 안에서 요청 단위 키로 나눈다**(`listStatus`/`detailStatus` 등).

boolean이 아니라 **4-상태 문자열**(`idle`/`loading`/`success`/`error`)인 이유: boolean은 "아직 요청 안 함"과 "요청 끝남"을 구분하지 못해 첫 진입 화면을 결정할 수 없다.

### 오류 상태 구조

```js
ErrorState = { type: string, retryable: boolean, at: number, message?: string }
```

`type`으로 처리가 갈린다(인증 만료=이동, 네트워크=재시도, 로그인 실패=재입력). `message`는 선택 필드 — Store가 문구를 자유 조립하면 화면마다 갈린다(빈 결과 문구가 이미 두 벌인 것과 같은 실패를 반복하지 않기 위해). `type → 문구` 매핑은 `domain/errors.js` 한 곳에만 둔다.

### 서비스 오류 유형 매핑

| 서비스 유형 | `type` | 소유 Store | `retryable` |
| --- | --- | --- | --- |
| 도시 없음 | `CITY_NOT_FOUND` | `weatherStore.detailError` | false |
| API/네트워크 실패 | `API_ERROR`/`NETWORK_ERROR` | 요청 낸 Store | true |
| 로그인 실패 | `AUTH_FAILED` | `authStore.loginError` | false |
| 인증 만료 | `AUTH_EXPIRED` | `authStore` | false |
| 잘못된 URL | — | **Store 아님**(라우터가 처리) | — |
| 즐겨찾기 저장 실패 | `FAVORITE_SAVE_FAILED` | `favoriteStore.saveError` | true |

### 컴포넌트 반영 규칙

1. 컴포넌트/View는 `try/catch`로 API 오류를 처리하지 않는다. Store가 오류를 상태로 바꾸고 화면은 읽어서 분기만 한다.
2. 빈 결과와 오류를 같은 문구로 처리하지 않는다.
3. 재시도 버튼은 `retryable`만 보고 결정한다(`type` 나열 금지 — `WeatherBadge`의 7단 체인과 같은 실패를 반복하지 않기 위해).
4. 로딩 중에도 이전 성공 데이터는 지우지 않는다(먼저 비우면 갱신 실패 시 있던 데이터까지 사라짐).

---

## 7. 데이터 흐름 규칙

### 흐름도

```text
api/ → stores/ → composables/ → views/ → components/
        (아래로: 데이터)              (위로: action 호출 / emit)
```

계층 건너뛰기: Store→View 허용, Store→Component 조건부(2.5), api→View 금지(현재 세 View가 mock을 각각 import하는 것이 이 위반의 결과), Component→api 절대 금지.

### props 계약

camelCase 선언/kebab-case 바인딩. 객체 통째(도메인 개체 자체를 표현 — `WeatherCard`의 `cityItem`) vs 스칼라 분해(값만 필요 — `WeatherBadge`의 4개 스칼라, 덕분에 예보 데이터에도 재사용 가능). 양방향 계약(값 prop+이벤트)의 값 prop은 `required: true`(`SearchBar.currentQuery`가 현재 `default:''`인데 실제로는 필수라 부모가 바인딩 안 하면 입력창이 조용히 고장난다). **props로 넘기는 값에 단위 문자열을 붙이지 않는다**(비교·검증이 깨진다).

### emits 계약

kebab-case, `동사-명사`(발생한 사실, DOM 조작명 금지), **페이로드 1개**(여러 값은 객체 하나로), **자식이 문구를 만들지 않는다**.

`WeatherCard.vue:25`의 5개 위치 인자가 반례다 — 수신부가 앞 4개를 버리는 코드를 쓰고(`(name,status,humidity,windSpeed,id) => handleDetailJump(id)`), `WeatherParent.vue:93`은 시그니처가 달라 `id`가 조용히 유실된다.

```js
// 규칙에 맞는 형태
emit('request-detail', cityItem.id)
```

이름 변경: `select-card`→`select-city`, `click-detail`→`request-detail`(DOM 조작명이 아니라 발생한 사실을 이름으로).

### Store 변경은 action을 거친다

읽기는 직접 접근 허용, 쓰기는 반드시 action. Pinia setup store는 문법적으로 직접 대입이 가능하므로 사람이 지켜야 하는 규칙이다. 이유는 변경 지점 추적 — 위험 판정 임계값이 4벌로 흩어져 추적이 안 된 것과 같은 실패를 막는다.

### 단방향 흐름의 예외(3가지만 허용)

1. 부품이 부모 판단에 안 쓰이는 로컬 UI 상태(열림/닫힘, 포커스).
2. 부품 존재 이유가 전역 상태 하나뿐(`UnitToggler`).
3. `v-model`(폼 컨트롤, 상태 주인이 같은 컴포넌트 안).

`provide`/`inject`는 채택하지 않는다 — 현재 깊이가 최대 4단이라 props 배관이 실제로 고통스럽지 않고, 값의 출처가 템플릿에서 사라지면 추적 비용이 늘어난다.

### 반응성 유지

state/getter를 구조 분해할 때 `storeToRefs`를 쓴다. `const { unit } = useConfigStore()`는 그 시점 값을 복사해 이후 갱신이 반영되지 않는다 — 오류 없이 화면만 멈춰서 원인 찾기 어렵다.

---

## 8. 라우팅 구현 기준

### 현재 라우트 `[현재]`

| 경로 | name | 컴포넌트 | 인증 |
| --- | --- | --- | --- |
| `/` | `WeatherHome` | static import | 불필요 |
| `/about` | `WeatherAbout` | lazy | 불필요 |
| `/weather/alerts` | `WeatherAlerts` | lazy | 불필요 |
| `/weather/:cityId` | `WeatherDetail` | lazy | 불필요 |
| `/:pathMatch(.*)*` | `NotFound` | lazy | 불필요 |

정적 라우트를 동적 라우트보다 먼저 선언한다(`alerts`가 `:cityId`로 매칭되지 않게). `createWebHistory()` 인자(base URL) 복구 여부는 배포 계획 확정 후 `[결정 필요]`.

### 경로 설계 규칙

소문자+하이픈, 컬렉션은 복수형, 동사 금지(경로는 자원 위치이지 동작이 아님), 이동은 **`name` 기준**으로 한다. 현재 대부분이 문자열 경로 조립(`` `/weather/${id}` ``)이라 경로를 바꾸면 전체 grep이 필요해진다.

### params vs query

판별 질문: "그 값을 지우면 이 화면은 무엇을 보여주는가?" 답이 "아무것도"면 params(`cityId`), "전체를"이면 query(`search`, `status`).

### 검색 상태-URL 동기화

현재(`WeatherHomeView.vue:31-36`)는 타이핑마다 `router.push`로 히스토리가 쌓인다(주석도 "현재 큰 의미없음"이라 인정). 복원 주석("KeepAlive를 적용해야만 동작함")은 사실과 반대다.

| 항목 | 결정 |
| --- | --- |
| 상태 주인 | 로컬 ref. URL은 사본 |
| URL 반영 | `router.replace` |
| 반영 시점 | 300ms 디바운스 |
| 복원 | `setup` 본문에서 초기값 설정. `onMounted` 미사용 |
| KeepAlive | 사용하지 않는다(상태 주인이 셋으로 늘어남 — URL/로컬ref/캐시) |

### Navigation Guard 책임 범위

| 담당 | 책임 |
| --- | --- |
| `authStore` | 로그인 여부·권한 판단 |
| Guard | 판단 결과로 통과/리다이렉트만 결정 |
| View | 화면 내 조건부 표시 |

토큰 파싱을 Guard 안에 직접 두지 않는 이유: 같은 판단이 화면(로그인 버튼 표시 등)에서도 필요해져 두 벌이 된다 — 위험 판정이 함수와 템플릿으로 이원화돼 문구와 어긋난 실패를 반복하지 않기 위해서다. 라우트별 요구사항은 `meta`에 선언(`beforeEach`가 읽음).

### 잘못된 파라미터 진입 처리 위치

> **View에서 처리한다. Guard로 올리지 않는다.**

이유: (1) Guard가 도메인 지식(유효 도시 목록)을 갖게 되고, API 전환 후 비동기 검사에 라우팅이 묶인다. (2) Guard는 통과/차단 두 값뿐이라 로딩/정상/없음/실패 네 상태를 표현 못 한다.

함께 확정: 파라미터 조회는 `onMounted`가 아니라 `computed`/`watch(() => route.params.cityId)`로 한다(현재는 마운트 1회뿐이라 `/weather/city_01→city_02` 직접 이동 시 갱신 안 됨 — 상세 화면에 "다음 도시" 링크가 생기는 순간 버그가 된다).

### 앱 셸 구조

> 네비게이션과 `<RouterView/>`는 `App.vue`에 각각 한 번만 존재한다.

현재 2벌씩 있어 매칭된 컴포넌트가 항상 2개 인스턴스로 마운트된다(`onMounted`가 2중 실행, 두 검색창의 URL 반영이 어긋남, 404 카드가 2개 뜸). 이 정리를 10절 1단계에 둔다.

---

## 9. API 계층

### 호출 방향

> Store는 axios를 직접 호출하지 않는다. 반드시 `api/` 모듈을 거친다.

```text
Component → View → Store → api/weatherApi.js → api/client.js(axios) → 외부 서버
```

현재 참고자료 상태가 이 규칙 없이 무엇이 번지는지 보여준다: API 키가 3개 파일에 각각 하드코딩, 같은 엔드포인트 문자열이 파일마다 다르게 조립.

### 파일 구조 `[예정]`

```text
src/api/
├─ client.js       axios 인스턴스 1개, baseURL/timeout/인터셉터
├─ weatherApi.js    날씨 호출 + 응답→도메인 모델 변환
├─ authApi.js
└─ mock/weatherMock.js
```

도메인 단위로 분리(메서드별/화면별 아님) — 화면별로 나누면 `WeatherAlertView`가 Home에서 갈라져 나온 것처럼(day3-2) 화면이 합쳐지거나 갈라질 때 api 파일도 같이 움직여야 한다.

### 공통 처리

기본 URL/타임아웃/공통 헤더/토큰 첨부는 `client.js`에. 쿼리는 axios `params` 옵션(문자열 보간 금지). 오류 정규화는 응답 인터셉터에서 `{ type, message, status }` 형태로 통일.

### Mock → API 교체 경계

> **교체 경계는 도메인 모델이다. 수정 파일은 `api/` 안으로 제한한다.**

현재는 세 View가 mock을 각각 import하고 각자 다르게 다룬다(ref로 감싸기/computed 안에서 필터/lookup map+단위 문자열화). 이 상태로 교체하면 세 파일을 열어야 하고 같은 수정을 세 번 반복할 수 없다.

**도메인 모델**(교체 후에도 불변): `id`, `name`, `temp`(섭씨, 단위 문자열 금지), `status`, `humidity`(%), `windSpeed`(m/s). `temp`를 섭씨 원본으로 고정하는 이유는 화씨 변환이 표시 계층 일이기 때문(5.2).

### 어댑터 책임

> 변환은 `api/weatherApi.js` 안에서 한다. Store와 View는 변환된 값만 받는다.

어댑터가 하는 일: 필드명 맞추기, 타입 맞추기, 기본값 채우기. 하지 않는 일: 필터링·정렬·위험 판정·문구 생성. `id`는 앱 내부 값을 유지(외부 API를 바꿔도 `/weather/:cityId` URL이 유지되게).

### 비밀값 규칙

키는 소스에 쓰지 않는다. `.env.local` + `import.meta.env.VITE_*`, 참조는 `client.js` 한 곳. `.gitignore`에 `.env*` 추가.

> **이미 커밋된 키는 `.env`로 옮기는 것만으로 안전해지지 않는다. git 이력에 남으므로 재발급이 필요하다.**

Vite의 `VITE_` 접두 변수는 빌드물에 그대로 노출된다 — 브라우저에 노출돼도 감당 가능한 키만 프런트엔드에 둔다.

---

## 10. 마이그레이션 계획

각 단계는 그 단계만 끝내고 멈춰도 앱이 동작하는 상태로 끝난다.

| 순서 | 작업 | 완료 판정 | 선행 |
| --- | --- | --- | --- |
| 1 | App.vue 단일 앱 셸화(과제1~3 섹션 제거, 네비·RouterView 1벌로) | 화면당 네비 1개, RouterView 1개 | 없음 |
| 2 | weatherStore 신설, 세 View의 mock 직접 import 제거, emit 페이로드 정리 | 어디에도 mock import 없음 | 1 |
| 3 | 위험 판정 로직을 domain/으로 분리 | 임계값이 한 곳에만 존재 | 2 |
| 4 | 단위 변환 연결 | 토글이 실제 화면 숫자를 바꿈 | 2 |
| 5 | 로딩·오류 상태 도입(mock 기준) | 강제 오류 상태에서 오류 화면이 뜸 | 2 |
| 6 | api/ 계층 신설, mock→API 교체 | Store/View 안 고치고 데이터 출처 교체 가능 | 3, 5 |
| 7 | 인증과 Navigation Guard | 보호 라우트에 비로그인 진입 시 리다이렉트 | 6 |
| 8 | 디자인 토큰 적용 | 색·간격 리터럴이 토큰 참조로 교체 | 1, 4, 5 |

**순서 근거 요지**: 1단계가 먼저인 이유는 검증 수단(브라우저 수동 확인)부터 확보해야 하기 때문 — 지금은 같은 화면이 2벌 떠서 "바뀐 것"과 "인스턴스 차이"를 구분할 수 없다. 2단계가 3·4·5·6의 공통 전제인 이유는 넷 다 "데이터 진입 지점이 하나"라는 조건을 요구하기 때문. 3이 4보다 앞인 이유는 단위 변환을 붙일 때 "판정도 바뀌는가"를 정해야 하는데 그 결정을 반영할 판정 규칙이 이미 한 곳에 모여 있어야 하기 때문. 5가 6보다 앞인 이유는 API를 먼저 붙이면 오류 UI를 미루게 되고(참고자료가 실제로 그 상태) mock 상태에서 먼저 만들어두면 6단계가 데이터 출처만 바꾸는 작업이 되기 때문.

### 목표 디렉터리 구조

```text
src/
├─ App.vue                  [현재→수정] 앱 셸 1벌
├─ router/index.js          [현재] + Guard [예정]
├─ api/                     [예정] client / weatherApi / authApi / mock
├─ domain/weatherRules.js   [예정] 판정 규칙 단일 소스
├─ stores/                  configStore[현재], weatherStore/favoriteStore/authStore[예정]
├─ composables/             [예정] useTemperature, useWeatherSearch
├─ views/                   Weather*View.vue[현재] + About/NotFound
├─ components/
│  ├─ common/               BaseDashboardCard, SearchBar, StatusBar
│  └─ weather/               WeatherList, WeatherCard, WeatherBadge, UnitToggler
├─ practices/                [예정] 학습 산출물 격리 위치
└─ assets/
```

`common/`과 `weather/`를 가르는 기준은 도메인 의존 여부(2절과 동일).

---

## 11. 정리 대상

### 규모 `[현재]`

`src/` 파일 104, `.vue` 74, 도달 가능 16, 도달 불가 58(78.4%), 백업 변형 19(전부 git 추적 중).

### 처리 방침

방침은 **삭제/격리(이동)/유지/gitignore** 중 선택. 학습 산출물은 기록 가치가 있으므로 기본값을 삭제로 두지 않는다.

| 대상 | 개수 | 방침 | 이유 |
| --- | --- | --- | --- |
| `components/practices/` | 50 | **격리** → `src/practices/` | 강의 실습 산출물, 학습 계보(`App.vue.1st~3rd`)가 참조. 삭제하면 계보가 끊김 |
| 스캐폴딩(`HelloWorld` 등) | 8 | **삭제** | 본인 작성 아님, `npm create vue`로 재생성 가능 |
| 미연결 View(`HomeView`, `AboutView`) | 2 | **삭제** | `WeatherAboutView`와 이름이 헷갈려 잘못된 파일을 열게 만든다 |
| `stores/counter.js` | 1 | **격리** | 삭제하면 `StoreCounter.vue` import가 깨짐. `stores/`에 두면 도메인 목록이 오염됨 |
| `App.vue` 과제1~3 섹션 | 3 | **제거**(섹션만, 컴포넌트는 격리) | 10절 1단계 |
| `components/exercise/` 폴더명 | — | **재편** → `common/`+`weather/` | 이름이 "실습용"인데 서비스 UI가 들어 있음 |

### 백업 변형 파일(19개) 세부 판단

| 부류 | 방침 | 이유 |
| --- | --- | --- |
| 완전 중복(`.old` = `.autoGenerate` 등) | **삭제** | 이미 다른 이름으로 존재, 되살릴 가치 없음 |
| 구현 참고자료(`*.afterAxios`, `WeatherCard.vue.afterStore`) | **유지+이동** `docs/reference/`, 확장자 정상화 | 4·6단계에서 실제로 참고할 자료. 단, `WeatherCard.vue.afterStore`는 확장자 문제로 lint 대상에서 빠져 있어 `props` 미대입 등 결함이 검사 없이 남아 있다(그대로 복사하면 `ReferenceError`) |
| 학습 계보 기록(`.1st/.2nd/.3rd` 등) | **유지** | practices 이동 시 함께 |

### 앞으로 백업을 만드는 방식

> 파일 복사 방식의 수동 백업을 더 만들지 않는다. 단계별 스냅샷은 git 커밋으로 남긴다.

수동 백업이 이미 한 번 실패했다 — `router/index.js.old`는 "직전 상태"를 남기려 했으나 실제로는 스캐폴딩 원본이 복사됐다. git은 이 검증을 자동으로 한다.

### 정리하지 않기로 한 것

| 대상 | 결정 | 이유 |
| --- | --- | --- |
| `weather*.png`(루트) | 유지 | README가 참조하는 제출 산출물 |
| `element-plus` 의존성 | 유지 | 실제 등록됨. 서비스 화면 적용 여부는 design 문서 소관 |
| `assets/practice.css`(미로딩) | 이번 범위 아님 | 살릴지 폐기할지는 design 문서 결정 |
| `.prettierrc` vs `.editorconfig` line-length 불일치 | `[결정 필요]` | 실행을 막지 않음 |
| `@` 별칭 vs 상대경로 혼용 | `[결정 필요]` | 파일 이동(2·6단계) 완료 후 한 번에 통일 |

---

## 요약 — 핵심 결정

| 결정 | 이유 |
| --- | --- |
| composable/domain 계층 신설 | 반응형 재사용 로직과 순수 규칙이 갈 곳이 없어 4벌까지 복제됐다 |
| Store는 도메인 단위로 분리, setup store 문법 통일 | 화면 단위 분리는 지금 문제(세 View가 mock 직접 참조)를 이름만 바꿔 재현한다 |
| Store 서열: authStore/weatherStore(독립) → favoriteStore(단방향 참조) | 순환 참조를 설계상 불가능하게 만든다 |
| 온도 변환은 domain 함수 + composable, Store엔 안 둠 | 컴포넌트별 복사(이미 실패)와 원본 소실(Store getter 변환) 둘 다 피한다 |
| 위험 판정 로직을 domain/weatherRules.js로 단일화 | 데이터 파일 수명과 규칙 수명이 다르다 |
| emit payload는 최소 식별자 1개, 위치 인자 금지 | 5개 인자 중 4개가 버려지고 1개는 조용히 유실되고 있다 |
| 로딩은 Store별+요청단위 4-상태, 오류는 `{type,retryable}` 구조체 | boolean은 idle/loading을 구분 못하고, 문자열 오류는 화면이 분기할 수 없다 |
| 검색 URL 반영은 replace+디바운스, KeepAlive 미사용 | push는 히스토리를 오염시키고, KeepAlive는 상태 주인을 셋으로 늘린다 |
| 잘못된 파라미터는 View에서, Guard로 올리지 않음 | Guard는 4가지 화면 상태를 표현할 수 없다 |
| 학습 산출물은 삭제 아닌 격리 | 학습 계보 가치가 있고, 삭제하면 참조가 깨진다 |

## [결정 필요] 목록

| 항목 |
| --- |
| `authStore.token` 저장 위치(메모리/localStorage/쿠키) — 백엔드 확보 후 |
| `favoriteStore` 로그인 시 로컬↔서버 병합 규칙 |
| `createWebHistory()` base URL 복구 여부 — 배포 계획 확정 후 |
| `@` 별칭 vs 상대경로 통일 규칙 — 파일 이동 완료 후 |
