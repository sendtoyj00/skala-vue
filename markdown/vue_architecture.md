# Vue 구현 아키텍처 기준

> "무엇을 왜"는 [service_architecture.md](./service_architecture.md), "어떻게 보이는가"는 [design_architecture.md](./design_architecture.md)가 답한다. 이 문서는 **어디에 구현할 것인가**에만 답한다: 계층·상태 위치·Store 설계·로직 소유권·데이터 흐름·라우팅·API 계층·마이그레이션.

세 문서 역할 분담:

| 파일 | 답하는 질문 |
| --- | --- |
| [service_architecture.md](./service_architecture.md) | 무엇을, 왜 만드는가 |
| [design_architecture.md](./design_architecture.md) | 어떻게 보여줄 것인가 |
| **vue_architecture.md** (이 문서) | 어디에 구현할 것인가 |

경계: "노령견은 가능 시간이 짧다"(서비스) / "산책 단계는 4색이 단조 증가한다"(디자인) / "판정은 `useWalkVerdict`가 `weatherStore`와 `dogStore`를 결합해 만든다"(이 문서).

상태 표기: `[현재]`(file:line 근거 필수) / `[예정]` / `[결정 필요]`.

---

## 1. 현재 구조 실태 `[현재]`

`src/` 전체 파일 **95개**, `.vue` **66개**. 라이브 엔트리(`main.js → App.vue → router/index.js`)에서 실제 도달하는 `.vue`는 **14개**다.

| 성격 | 위치 | 개수 |
| --- | --- | --- |
| 서비스 코드 | `App.vue`, `views/*`, `components/common/*`, `components/weather/*` | `.vue` 14 |
| 도메인·상태 | `stores/`, `domain/`, `composables/`, `router/` | js 7 |
| 학습 실습 코드 | `components/practices/**`, `src/practices/**` | `.vue` 51 |
| 백업 변형 | `*.vue.*`, `*.js.*` | 15 (전부 git 추적 중) |

직전 개정 대비 변화: 학습 산출물 격리와 스캐폴딩 삭제가 진행돼 도달 불가 파일이 58 → 51로 줄었다. 다만 **격리가 절반만 끝났다** — `components/practices/`와 `src/practices/`가 동시에 존재한다(11절).

### 완료된 마이그레이션 `[현재]`

직전 개정의 10절 계획 중 다음이 완료됐다:

| 단계 | 작업 | 근거 |
| --- | --- | --- |
| 1 | App.vue 단일 앱 셸화 | `App.vue` — 네비 1벌, `RouterView` 1개 |
| 2 | weatherStore 신설, View의 mock 직접 import 제거 | `weatherStore.js:10`, 세 View가 store를 참조 |
| 3 | 위험 판정을 domain/으로 분리 | `weatherRules.js:4-11` — 임계값이 상수 1곳 |
| 4 | 단위 변환 연결 | `useTemperature.js:10-12` — 토글이 실제 화면 숫자를 바꾼다 |
| 5 | 로딩·오류 상태 도입 | `weatherStore.js:11-12`, `ErrorState.vue`, `WeatherCardSkeleton.vue` |
| 8 | 디자인 토큰 적용 | `base.css:5-58` — 라이브 컴포넌트에 색 리터럴 0건 |

미완료: 6단계(api/ 계층), 7단계(인증). 컨셉 전환으로 계획 자체를 재작성한다(10절).

### 컨셉 전환으로 되돌아간 것

직전 개정에서 배치만 해둔 `favoriteStore`/`authStore`는 **삭제됐다.** 소비 컴포넌트가 0개인 상태로 남아 있었고, 이 문서가 스스로 반면교사로 든 F-09 실패 패턴("store는 완성됐는데 소비처가 안 붙어 완성된 것처럼 보이지만 동작 안 하는 기능")과 같은 상태였기 때문이다.

새 컨셉에서 인증은 P2로 내려갔고([service_architecture.md](./service_architecture.md) 3.3), 즐겨찾기는 반복 대상이 도시에서 개체로 옮겨가며 대체됐다. 두 Store를 지금 되살리지 않는다.

> 소비처 없는 Store를 미리 만들지 않는다. 배치를 확정하는 것과 파일을 만드는 것은 다른 일이다.

---

## 2. 계층 정의와 책임 경계

### 2.1 계층 목록

| # | 계층 | 정의 | 위치 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | View | 라우트 1개에 대응하는 화면. 조립과 화면 전용 상태만 | `src/views/` | `[현재]` |
| 2 | Component | 화면 조각. props 받아 그리고 이벤트를 올림 | `src/components/{common,weather,dog,walk}/` | `[현재/예정]` |
| 3 | composable | 반응형 재사용 로직, **계층 간 데이터 결합** | `src/composables/` | `[현재]` |
| 4 | Store | 라우트를 넘어 공유되는 상태의 주인 | `src/stores/` | `[현재]` |
| 5 | Router | URL↔화면 매핑, URL에 남는 상태 | `src/router/` | `[현재]` |
| 6 | API 클라이언트 | HTTP 요청/응답, 오류 정규화 | `src/api/` | `[예정]` |
| 7 | 도메인 로직 | Vue를 모르는 순수 함수와 상수 | `src/domain/` | `[현재]` |

### 2.2 의존 방향

```text
View → Component → composable → Store → API 클라이언트 → 도메인 로직
```

> 각 계층은 아래 계층만 안다. 위쪽을 알게 되는 순간, 아래 계층은 그 화면 전용 부품이 된다.

### 2.3 폴더 구조 규칙

> 도메인 지식을 알아야 하는 컴포넌트와, 몰라도 되는 컴포넌트를 같은 폴더에 두지 않는다.

판별 질문: "이 컴포넌트를 다른 서비스에 그대로 옮길 수 있는가?"

| 폴더 | 아는 것 | 소속 컴포넌트 |
| --- | --- | --- |
| `components/common/` | 아무 도메인도 모른다 | `BaseDashboardCard`, `SearchBar`, `StatusBar`, `ErrorState`, `WeatherCardSkeleton` `[현재]` |
| `components/weather/` | 날씨 필드명·위험 규칙 | `WeatherCard`, `WeatherList`, `WeatherBadge`, `UnitToggler` `[현재]` |
| `components/dog/` | 반려견 필드명·특성 축 | `DogProfileForm`, `DogSelector`, `DogAvatar` `[예정]` |
| `components/walk/` | **날씨와 반려견을 동시에** 안다 | `WalkVerdictCard`, `WalkWindowTimeline`, `PawTempIndicator`, `WalkChecklist` `[예정]` |

**`walk/`를 `weather/`에 합치지 않는 이유**: 판별 질문에 걸린다. `WalkVerdictCard`는 날씨만으로도, 반려견만으로도 성립하지 않는 제3의 도메인이다. `weather/`에 두면 날씨 컴포넌트가 반려견 필드를 알게 되어 의존 방향이 흐려진다.

나누는 시점 규칙은 유지한다 — 같은 폴더에 성격이 다른 컴포넌트가 각각 3개 이상 쌓이면 나눈다. `dog/`와 `walk/`는 처음부터 각각 3개 이상이 예정돼 있으므로 신설 시점에 분리한다.

`WeatherCardSkeleton`이 `common/`에 있는 이유: 이름에 Weather가 들어가지만 실제로는 회색 사각형 3개를 그릴 뿐 날씨 필드를 모른다. **이름이 아니라 아는 것으로 판정한다.**

### 2.4 Component가 Store를 직접 참조해도 되는가

**조건부 허용.** 판별 질문: "같은 화면에 여러 인스턴스가 뜨고 각각 다른 값을 보여야 하는가?" Yes면 props, No면 Store 직접 참조 가능.

| 컴포넌트 | 방식 | 판정 |
| --- | --- | --- |
| `UnitToggler` `[현재]` | Store 직접 | 적합(앱 전체에 하나뿐) |
| `DogSelector` `[예정]` | Store 직접 | 적합(앱 전체에 하나뿐 — 셸 헤더) |
| `WeatherCard` `[현재]` | props(`cityItem`) | 적합(목록에 8개 인스턴스) |
| `WalkVerdictCard` `[예정]` | **props(`verdict`)** | 적합 — 5.2 참조 |
| `SearchBar` `[현재]` | props+emit | 적합(같은 화면에 2인스턴스) |

`WalkVerdictCard`가 Store를 직접 읽지 않는 이유: 판정은 Store가 아니라 composable이 만든다(5.2). 또한 지역 목록에서 지역별 판정을 여러 장 보여줄 가능성이 있어 "인스턴스마다 다른 값" 조건에 걸린다.

---

## 3. 상태 배치 결정 기준

### 3.1 결정 트리

```text
새 상태
 ① URL에 남아야 하는가(새로고침·공유·뒤로가기 복원)?  Yes → Router(params/query)
 ② 하나의 View 안에서 끝나는가?                      Yes → 로컬 ref
 ③ 부모-자식 2단계 안에서 전달되는가?                 Yes → props/emits
 ④ 라우트 넘어 살아야 하거나 형제 화면이 공유하는가?    Yes → Pinia Store
                                                    No  → provide/inject(사용처 0건)
```

### 3.2 "일단 Pinia에 넣기"를 막는 규칙

> Store에 올리려면 "현재 이 값을 읽는 두 번째 라우트가 존재한다"를 file:line으로 댈 수 있어야 한다. 대지 못하면 로컬 ref.

`stores/counter.js`가 반례 표본이었고(현재 `src/practices/counter.js`로 격리됨), `favoriteStore`/`authStore`가 같은 이유로 삭제됐다(1절).

### 3.3 현재 상태 전수 판정

| 상태 | 현재 위치 | 결정 위치 | 근거 |
| --- | --- | --- | --- |
| 도시·날씨 목록 | `weatherStore.cities` `[현재]` | 유지 | 세 라우트가 같은 목록을 읽는다 |
| 로딩·오류 | `weatherStore.listStatus/listError` `[현재]` | 유지 | 6절 |
| 선택 도시 | `route.params.cityId` `[현재]` | Router params 유지 | 링크 공유·새로고침 복원 |
| 검색어 | 로컬 ref + URL query 사본 `[현재]` | 유지 | `WeatherHomeView.vue:20-35` |
| 온도 단위 | `configStore.unit` `[현재]` | 유지 + 영속 `[예정]` | 8절 |
| 위험 판정 결과 | 계산 `[현재]` | **상태로 두지 않음** | 원본에서 항상 계산 가능 |
| **반려견 프로필** | 없음 | `dogStore` `[예정]` | 모든 라우트가 읽는다. 영속 필요 |
| **대상 개체 id** | 없음 | `dogStore.activeDogId` `[예정]` | 4.4 |
| **산책 판정 결과** | 없음 | **상태로 두지 않음** — composable 계산 | 5.2 |
| **예보** | 없음 | `weatherStore.forecast` `[예정]` | 타임라인·판정이 함께 읽는다 |
| 상태 메시지(StatusBar) | View 로컬 ref `[현재]` | 유지 | 화면을 벗어나면 의미가 없다 |

---

## 4. Pinia Store 설계

### 4.1 분리 기준

> Store는 도메인 단위로 나눈다. 화면 단위로 나누지 않는다.

| Store | 도메인 | 상태 |
| --- | --- | --- |
| `configStore` | 앱 표시 설정 | `[현재]` |
| `weatherStore` | 날씨 데이터 | `[현재]` |
| `dogStore` | 반려견 프로필 | `[예정]` |

**산책 판정 전용 Store를 만들지 않는다.** 판정은 저장할 상태가 아니라 두 Store를 결합한 파생값이므로 composable이 담당한다(5.2). `walkStore`를 만들면 원본 갱신마다 판정도 갱신해야 하고, 하나라도 놓치면 "28도인데 폭염 경보"류의 어긋남이 생긴다.

### 4.2 문법 통일 `[현재]`

> 모든 Store는 setup store(`defineStore(id, () => {...})`)로 작성한다.

state=`ref`, getter=`computed`, action=일반 함수, 마지막에 `return`으로 노출. 소비는 점 표기 직접 접근(`store.unit`). 구조 분해가 필요하면 `storeToRefs`를 쓴다.

### 4.3 configStore `[현재]`

| 구분 | 이름 | 근거 |
| --- | --- | --- |
| state | `unit` | `configStore.js:7` |
| getter | `unitSymbol`, `unitLabel` | `configStore.js:10-16` |
| action | `toggleUnit()` | `configStore.js:19-21` |

`[예정]`: localStorage 복원(`restoreUnit`). **변환 공식은 Store에 두지 않는다**(5.1).

### 4.4 weatherStore `[현재→확장]`

| 구분 | 이름 | 상태 | 근거 |
| --- | --- | --- | --- |
| state | `cities` | `[현재]` | `weatherStore.js:10` — 원본 단위(섭씨) |
| state | `listStatus` / `listError` | `[현재]` | `weatherStore.js:11-12` |
| getter | `dangerCityList` | `[현재]` | `weatherStore.js:15` |
| getter | `findCityById(id)` | `[현재]` | `weatherStore.js:17-19` |
| action | `loadCityWeather()` / `refreshCityWeather()` | `[현재]` | `weatherStore.js:23-39` |
| state | `forecast` / `forecastStatus` / `forecastError` | `[예정]` | 요청 단위로 분리(6.2) |
| action | `loadForecast(cityId)` | `[예정]` | F-26의 데이터 원천 |

**예보 상태를 목록 상태와 분리하는 이유**: 예보만 실패하고 현재 관측은 성공할 수 있다. 하나의 `status`로 묶으면 부분 실패를 표현할 수 없어 판정까지 오류 화면으로 덮인다([design_architecture.md](./design_architecture.md) 6.4).

### 4.5 dogStore `[예정]`

| 구분 | 이름 | 설명 |
| --- | --- | --- |
| state | `dogs` | `DogProfile[]` — 견종명을 저장하되 판정은 특성만 본다 |
| state | `activeDogId` | 명시적으로 선택한 개체(없으면 null) |
| getter | `activeDog` | `activeDogId`가 없으면 `mostVulnerableDog`로 대체 |
| getter | `mostVulnerableDog` | 서비스 문서 4.7 — 다견 기본 판정 대상 |
| getter | `hasProfile` | 초기 상태 분기용(8절) |
| action | `addDog` / `updateDog` / `removeDog` | 프로필 CRUD |
| action | `setActiveDog(dogId)` | 개체 전환 |
| action | `restoreDogs()` | localStorage 복원 |

`activeDog`가 fallback을 갖는 이유: 다견 전환(F-29)은 P2라 나중에 만들어도 되지만, 그 전까지도 판정 대상이 정해져야 한다. getter가 fallback을 흡수하면 소비처는 `activeDogId`의 존재 여부를 몰라도 된다.

`addDog`/`updateDog`를 나누고 `toggleFavorite` 같은 단일 진입점을 두지 않는 이유: 서비스 규칙이 등록과 수정을 다른 행위로 정의한다(등록은 온보딩, 수정은 프로필 화면). 즐겨찾기와 달리 "이미 있는지" 판정이 호출부에 복제되지 않는다.

### 4.6 Store 간 의존 규칙

```text
서열 0(독립)   configStore   weatherStore   dogStore
```

> 셋 다 독립이다. 참조가 필요한 결합은 Store가 아니라 composable에서 한다.

직전 개정은 `favoriteStore → authStore` 단방향 참조를 허용했다(쓰기 전제조건 검사). 새 컨셉에는 그런 관계가 없다 — 프로필은 로그인 없이 저장되므로([service_architecture.md](./service_architecture.md) 7절) 쓰기 전 검사할 다른 Store가 없다.

> 쓰기의 전제 조건은 Store 안에서 검사하고, 읽기의 데이터 결합은 composable에서 한다.

이 규칙 덕분에 Store 간 순환 참조가 설계상 불가능하다.

### 4.7 Store에 두면 안 되는 것

파생 데이터(재계산 누락 위험 — 산책 판정·지면온도·특성 4축이 전부 해당) / 표시용 문자열·단위 접미사(비교·정렬이 불가능해진다) / 화면 전용 일시 상태 / API 키.

### 4.8 영속성

| 상태 | 영속 | 저장소 |
| --- | --- | --- |
| `configStore.unit` | 필요 | localStorage `[예정]` |
| `dogStore.dogs` | **필요** | localStorage `[예정]` / 로그인 시 서버 `[결정 필요]` |
| `dogStore.activeDogId` | 필요 | localStorage `[예정]` |
| `weatherStore.cities` / `forecast` | 불필요 | — (시간 의존 데이터, 저장하면 어제 값이 먼저 보인다) |

`pinia-plugin-persistedstate` 미설치이므로 각 Store 안에서 `watch` + `localStorage`로 직접 구현한다.

> **프로필 영속화는 되돌리기 비용이 급증하는 지점이다.** 사용자 데이터가 기기에 쌓이기 시작하면 컨셉 되돌림이 사실상 불가능해진다(10절).

---

## 5. 로직 소유권 결정

### 5.1 원칙

반응성이 필요하면 composable, 필요 없으면 domain으로 나눈다.

| 로직 | 위치 | 이유 |
| --- | --- | --- |
| 위험 날씨 판정 | `domain/weatherRules.js` `[현재]` | 인자 하나로 boolean, 반응형 불필요 |
| 온도 변환 | `domain/temperature.js` `[현재]` | 순수 계산 |
| **산책 판정** | `domain/walkRules.js` `[예정]` | 순수 함수. 입력 3개로 구조체 반환 |
| **지면온도 추정** | `domain/groundTemp.js` `[예정]` | 순수 계산 |
| **견종→특성 변환** | `domain/breeds.js` `[예정]` | 순수 매핑 |
| 단위 표시 | `composables/useTemperature.js` `[현재]` | `configStore` 구독 필요 |
| **판정 결합** | `composables/useWalkVerdict.js` `[예정]` | 두 Store 구독 필요 |

### 5.2 산책 판정의 소유권 — 이 문서의 핵심 결정

판정은 `weather` × `dog` 결합이다. 네 선택지를 비교한다:

| 안 | 문제 |
| --- | --- |
| (a) `weatherStore` getter | 날씨 Store가 반려견을 알게 된다. 의존 방향 위반 |
| (b) `dogStore` getter | 반대 방향으로 같은 문제 |
| (c) `walkStore` 신설 | 파생값을 저장하게 되어 원본 갱신 시 동기화 누락 위험(4.7) |
| (d) 컴포넌트가 각자 결합 | **이미 실패한 방식** — 직전 프로젝트에서 온도 변환 공식이 두 컴포넌트에 복사됐고, 위험 판정은 4벌까지 늘었다 |

> **(e) 채택.** `domain/walkRules.js`가 순수 판정 함수를, `composables/useWalkVerdict.js`가 두 Store를 구독해 결합한다.

```text
weatherStore.cities ┐
dogStore.activeDog  ┼→ useWalkVerdict() → computed<WalkVerdict> → WalkVerdictCard(props)
domain/groundTemp   ┘
```

composable이 결합을 담당하는 근거는 4.6의 규칙("읽기의 데이터 결합은 composable에서")이며, 이 규칙은 직전 개정에서 `favoriteStore → weatherStore` 참조를 금지할 때 이미 세워둔 것이다. 대상만 바뀌었을 뿐 규칙은 그대로 적용된다.

### 5.3 판정 함수의 형태

```js
// domain/walkRules.js — Vue를 모른다
export function assessWalk(weather, traits, groundTemp) {
  // returns { level, maxMinutes, reasons: [{code, threshold, actual}] }
}
```

| 규칙 | 이유 |
| --- | --- |
| 임계값은 named 상수로 이 파일 한 곳에 | 숫자 리터럴이 화면 문구와 어긋난 이력이 있다(`weatherRules.js:5`는 50인데 직전 화면 문구는 60이었다) |
| 화면은 임계값을 타이핑하지 않고 상수를 import | `WeatherAlertView.vue:10`이 이미 이 방식이다 |
| 템플릿에서 `v-if` 체인으로 판정하지 않는다 | 단위 테스트가 불가능하고 순서를 바꾸면 조용히 다른 결과가 난다 |
| `reasons`는 배열 | 조건 N개에 문구 N개. 조합 전용 분기를 만들지 않는다 |

### 5.4 견종 변환의 격리

> 판정 함수는 견종 이름을 모른다. `domain/breeds.js`만 안다.

```text
breedId → breeds.js → DogTraits(4축) → walkRules.js
```

이 경계가 무너지면 견종 수만큼 분기가 늘어난다([service_architecture.md](./service_architecture.md) 4.4). `walkRules.js`가 `breedId`를 인자로 받지 않는 것으로 이를 구조적으로 막는다.

### 5.5 검색 필터링 `[현재]`

소비자가 `WeatherHomeView` 하나뿐이므로 그 View의 computed에 둔다(`WeatherHomeView.vue:39-51`). 재검토 조건: 두 번째 View가 같은 필터를 요구하는 순간 domain으로 승격.

### 5.6 관통 규칙

1. 파생 데이터는 저장하지 않고 계산한다.
2. 도메인 로직은 데이터 파일에 얹지 않는다(수명이 다르다).
3. 원본 값과 표시 값을 같은 자리에 두지 않는다.
4. 소비자가 하나면 소비자가 갖는다. 승격은 두 번째 소비자가 생길 때.
5. **두 도메인의 결합은 어느 한쪽 Store가 아니라 composable이 한다.**

---

## 6. 로딩과 오류 상태의 소유권

### 6.1 현재 구현 `[현재]`

`weatherStore.listStatus`가 4-상태 문자열(`idle`/`loading`/`success`/`error`)이고, 세 View가 이를 읽어 스켈레톤·오류·정상을 분기한다.

boolean이 아니라 4-상태인 이유: boolean은 "아직 요청 안 함"과 "요청 끝남"을 구분하지 못해 첫 진입 화면을 결정할 수 없다.

### 6.2 요청 단위 분리 `[예정]`

> Store별로 두되, 그 안에서 요청 단위 키로 나눈다.

| 요청 | 상태 키 | 실패 시 화면 |
| --- | --- | --- |
| 현재 관측 | `listStatus` `[현재]` | 판정 불가 — 전체 오류 |
| 예보 | `forecastStatus` `[예정]` | **타임라인만 접기, 판정은 유지** |
| 견종 마스터 | `breedsStatus` `[예정]` | 번들 최소 집합으로 폴백 |

### 6.3 오류 상태 구조

```js
ErrorState = { type: string, retryable: boolean, at: number, message?: string }
```

`type`으로 처리가 갈린다. `type → 문구` 매핑은 `domain/errors.js` `[예정]` 한 곳에만 둔다 — Store가 문구를 자유 조립하면 화면마다 갈린다.

| 서비스 유형 | `type` | 소유 | `retryable` |
| --- | --- | --- | --- |
| 도시 없음 | `CITY_NOT_FOUND` | `weatherStore` | false |
| API/네트워크 실패 | `API_ERROR`/`NETWORK_ERROR` | 요청 낸 Store | true |
| 예보 조회 실패 | `FORECAST_ERROR` | `weatherStore.forecastError` | true |
| 견종 미등록 | — | **오류 아님**(빈 상태) | — |
| 프로필 없음 | — | **오류 아님**(초기 상태) | — |
| 잘못된 URL | — | Store 아님(라우터) | — |

**"프로필 없음"과 "견종 미등록"을 오류 목록에 넣지 않는 것이 중요하다.** 오류로 다루면 첫 방문자가 빨간 화면을 본다([design_architecture.md](./design_architecture.md) 6.2).

### 6.4 컴포넌트 반영 규칙

1. 컴포넌트/View는 `try/catch`로 API 오류를 처리하지 않는다. Store가 오류를 상태로 바꾸고 화면은 읽어서 분기만 한다.
2. 빈 결과·초기 상태·오류를 같은 문구로 처리하지 않는다.
3. 재시도 버튼은 `retryable`만 보고 결정한다(`type` 나열 금지). `ErrorState.vue`가 이미 `retryable` prop으로 분기한다.
4. 로딩 중에도 이전 성공 데이터는 지우지 않는다.
5. **부분 실패는 해당 영역만 접는다**(6.2).

---

## 7. 데이터 흐름 규칙

### 7.1 흐름도

```text
api/ → stores/ → composables/ → views/ → components/
        (아래로: 데이터)              (위로: action 호출 / emit)
                    ↑
              domain/ (모든 계층에서 import 가능한 순수 함수)
```

`domain/`을 어느 계층에서든 import할 수 있는 이유: Vue를 모르고 상태를 갖지 않으므로 방향성을 만들지 않는다. 실제로 `WeatherCard.vue:4`(Component)와 `weatherStore.js:4`(Store)가 같은 `isDangerWeather`를 각각 import한다.

계층 건너뛰기: Store→View 허용, Store→Component 조건부(2.4), api→View 금지, Component→api 절대 금지.

### 7.2 props 계약

camelCase 선언/kebab-case 바인딩. 객체 통째(도메인 개체 자체 — `cityItem`, `verdict`, `dog`) vs 스칼라 분해(값만 필요). 양방향 계약의 값 prop은 `required: true`. **props로 넘기는 값에 단위 문자열을 붙이지 않는다.**

`WalkVerdict`를 통째로 넘기는 이유: `level`/`maxMinutes`/`reasons`가 함께 움직이는 하나의 판정 결과다. 분해해서 넘기면 셋이 어긋난 조합(level은 unsafe인데 maxMinutes가 15)이 타입상 가능해진다.

### 7.3 emits 계약

kebab-case, `동사-명사`(발생한 사실, DOM 조작명 금지), **페이로드 1개**, **자식이 문구를 만들지 않는다**.

현재 `WeatherCard.vue:14`가 `request-detail`로 `cityId` 하나만 넘긴다 — 직전의 5개 위치 인자 방식이 정정된 상태다. 신규 컴포넌트도 같은 규칙을 따른다: `select-dog`(dogId), `submit-profile`(profile 객체 1개).

### 7.4 Store 변경은 action을 거친다

읽기는 직접 접근 허용, 쓰기는 반드시 action. Pinia setup store는 문법적으로 직접 대입이 가능하므로 사람이 지켜야 하는 규칙이다.

### 7.5 반응성 유지

state/getter를 구조 분해할 때 `storeToRefs`를 쓴다. `const { unit } = useConfigStore()`는 그 시점 값을 복사해 이후 갱신이 반영되지 않는다 — 오류 없이 화면만 멈춰서 원인 찾기가 어렵다.

`useWalkVerdict`가 반환하는 값은 반드시 `computed`여야 한다. 함수 호출 시점의 스냅샷을 반환하면 날씨가 갱신되거나 개체를 전환해도 판정이 그대로 남는다 — **이 서비스에서 낡은 판정은 잘못된 안심으로 이어진다.**

---

## 8. 라우팅 구현 기준

### 8.1 현재 라우트 `[현재]`

| 경로 | name | 인증 |
| --- | --- | --- |
| `/` | `WeatherHome` | 불필요 |
| `/about` | `WeatherAbout` | 불필요 |
| `/weather/alerts` | `WeatherAlerts` | 불필요 |
| `/weather/:cityId` | `WeatherDetail` | 불필요 |
| `/:pathMatch(.*)*` | `NotFound` | 불필요 |

### 8.2 목표 라우트 `[예정]`

| 경로 | name | 화면 | 변경 |
| --- | --- | --- | --- |
| `/` | `WalkHome` | 산책 판정 | **신규 — 홈 교체** |
| `/timeline` | `WalkTimeline` | 시간대별 적합도 | 신규 |
| `/dogs` | `DogList` | 프로필 목록 | 신규 |
| `/dogs/:dogId` | `DogProfile` | 프로필 편집 | 신규 |
| `/weather` | `WeatherHome` | 지역 목록 | **`/`에서 이동(강등)** |
| `/weather/alerts` | `WeatherAlerts` | 산책 불가 지역 | 유지·재정의 |
| `/weather/:cityId` | `WeatherDetail` | 지역 상세 | 유지 |
| `/about` | `WeatherAbout` | 소개 | 유지 |
| `/:pathMatch(.*)*` | `NotFound` | — | 유지 |

정적 라우트를 동적 라우트보다 먼저 선언한다(`alerts`가 `:cityId`로 매칭되지 않게) `[현재]`.

**`/`를 교체하되 `/weather`를 남기는 이유**: 지역 목록은 폐기가 아니라 강등이다(P2). 경로를 지우면 기존 링크가 깨지고, 강등된 기능도 여전히 동작해야 한다.

### 8.3 경로 설계 규칙

소문자+하이픈, 컬렉션은 복수형(`/dogs`), 동사 금지, 이동은 **`name` 기준**. 현재 `WeatherHomeView.vue:62`·`WeatherAlertView.vue`가 `router.push({name, params})`를 쓴다 — 문자열 경로 조립을 하지 않는다.

### 8.4 params vs query

판별 질문: "그 값을 지우면 이 화면은 무엇을 보여주는가?" 답이 "아무것도"면 params(`cityId`, `dogId`), "전체를"이면 query(`search`).

**`activeDogId`를 URL에 두지 않는 이유**: 개체 전환은 공유·복원 대상이 아니라 사용자 설정이다. URL에 두면 링크를 공유받은 사람이 남의 개 기준 판정을 보게 된다. localStorage가 옳은 위치다(4.8).

### 8.5 검색 상태-URL 동기화 `[현재]`

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 상태 주인 | 로컬 ref, URL은 사본 | `WeatherHomeView.vue:22-23` |
| URL 반영 | `router.replace` | `WeatherHomeView.vue:30` — push는 타이핑마다 히스토리를 쌓는다 |
| 반영 시점 | 300ms 디바운스 | `WeatherHomeView.vue:27-35` — 한글 IME 조합 중 글자가 URL에 박히는 것을 막는다 |
| 복원 | `setup` 본문에서 초기값 설정 | `onMounted` 미사용 |
| KeepAlive | 사용하지 않는다 | 상태 주인이 셋으로 늘어난다 |

### 8.6 Navigation Guard `[예정]`

새 컨셉에서 **인증 Guard는 필요 없다.** 모든 라우트가 비로그인으로 동작한다([service_architecture.md](./service_architecture.md) 7절).

프로필 유무로 리다이렉트하지도 **않는다**:

> 프로필 없음은 화면 안에서 온보딩으로 처리한다. Guard로 올리지 않는다.

이유는 직전 개정이 "잘못된 파라미터는 View에서 처리한다"고 결정한 것과 같다 — (1) Guard가 도메인 지식을 갖게 되고, (2) Guard는 통과/차단 두 값뿐이라 로딩/초기/정상/실패 네 상태를 표현할 수 없다.

### 8.7 파라미터 변화 대응 `[현재]`

파라미터 조회는 `onMounted`가 아니라 `computed`로 한다(`WeatherDetailView.vue:19`). 상세→상세 직접 이동 시 갱신되지 않는 버그를 구조적으로 막는다.

---

## 9. API 계층 `[예정]`

### 9.1 호출 방향

> Store는 axios를 직접 호출하지 않는다. 반드시 `api/` 모듈을 거친다.

```text
Component → View → composable → Store → api/weatherApi.js → api/client.js(axios) → 외부 서버
```

### 9.2 파일 구조

```text
src/api/
├─ client.js        axios 인스턴스 1개, baseURL/timeout/인터셉터
├─ weatherApi.js    현재 관측 + 예보 호출, 응답→도메인 모델 변환
├─ breedsApi.js     견종 마스터
└─ mock/
   ├─ weatherMock.js
   └─ breedsMock.js
```

도메인 단위로 분리한다(메서드별/화면별 아님) — 화면별로 나누면 화면이 합쳐지거나 갈릴 때 api 파일도 같이 움직여야 한다.

### 9.3 Mock → API 교체 경계

> **교체 경계는 도메인 모델이다. 수정 파일은 `api/` 안으로 제한한다.**

현재 `weatherStore.js:3`이 `weatherMockData`를 직접 import한다. 6단계에서 이 한 줄만 `api/weatherApi.js` 호출로 바뀌고, **Store의 action 이름·시그니처와 View는 전혀 바뀌지 않는다** — 그렇게 되도록 `loadCityWeather()`를 지금 형태로 만들어 뒀다(`weatherStore.js:22` 주석).

**도메인 모델**(교체 후에도 불변): `id`, `name`, `temp`(섭씨, 단위 문자열 금지), `status`, `humidity`(%), `windSpeed`(m/s), 그리고 신규 `statusCode`.

### 9.4 어댑터 책임

하는 일: 필드명 맞추기, 타입 맞추기, 기본값 채우기.
하지 않는 일: 필터링·정렬·**판정**·문구 생성.

지면온도는 어댑터가 만들지 않는다 — API가 주지 않는 추정값이므로 `domain/groundTemp.js`가 계산한다. 어댑터가 계산하면 "서버가 준 값"처럼 보이게 되고, 이는 서비스 문서 4.2의 표기 원칙과 충돌한다.

### 9.5 비밀값 규칙

키는 소스에 쓰지 않는다. `.env.local` + `import.meta.env.VITE_*`, 참조는 `client.js` 한 곳. `.gitignore`에 `.env*` 추가.

> **이미 커밋된 키는 `.env`로 옮기는 것만으로 안전해지지 않는다. git 이력에 남으므로 재발급이 필요하다.**

`VITE_` 접두 변수는 빌드물에 그대로 노출된다 — 브라우저에 노출돼도 감당 가능한 키만 프런트엔드에 둔다.

---

## 10. 마이그레이션 계획

각 단계는 그 단계만 끝내고 멈춰도 앱이 동작하는 상태로 끝난다.

| 순서 | 작업 | 완료 판정 | 선행 | 되돌리기 비용 |
| --- | --- | --- | --- | --- |
| 1 | `domain/walkRules.js` — 판정 출력을 boolean→`{level, maxMinutes, reasons}` | 임계값이 한 곳, 단위 테스트 가능 | — | **파일 1개** |
| 2 | `WalkVerdictCard` 1개를 홈 상단에(고정 프로필로 하드코딩) | 판정 문구가 화면에 뜬다 | 1 | 컴포넌트 1개 |
| 3 | `domain/breeds.js` + `DogProfileForm` + `dogStore`(메모리) | 견종 입력이 판정을 바꾼다 | 2 | 중간 |
| 4 | **프로필 localStorage 영속** | 새로고침 후에도 유지 | 3 | **여기부터 사실상 확정** |
| 5 | `domain/groundTemp.js` + `PawTempIndicator` | 추정 지면온도가 판정에 반영 | 1 | 중간 |
| 6 | 예보 mock + `WalkWindowTimeline` | "다음 가능 시각"이 표시됨 | 4 | 중간 |
| 7 | 라우트 재편(`/`→판정, `/weather`로 목록 이동) | 기존 링크가 깨지지 않음 | 6 | 낮음 |
| 8 | `api/` 계층 신설, mock→API 교체 | Store/View를 안 고치고 데이터 출처 교체 | 6 | 낮음 |
| 9 | 산책 단계 색 토큰 + 다크 값 | 리터럴 0건, AA 통과 | 2 | 낮음 |
| 10 | 접근성 마감(`focus-visible`, `label for`, 헤딩 순서) | 키보드로 전 조작 가능 | 7 | 낮음 |

### 순서 근거

**1~2를 먼저 하는 이유**: 판정 문구가 실제로 쓸모 있는지 눈으로 확인하기 전에는 그 뒤의 모든 작업이 추측이다. 두 단계는 되돌리기 비용이 거의 0이므로, 여기서 멈추고 컨셉을 재검토할 수 있다.

**4를 분기점으로 표시한 이유**: 사용자 데이터가 기기에 쌓이기 시작하면 컨셉 되돌림에 마이그레이션이 필요해진다. 1~3단계까지는 파일 몇 개를 지우면 이전 상태로 복귀한다.

**5가 1에 의존하되 3과 독립인 이유**: 지면온도는 견종과 무관한 환경값이라 프로필 없이도 계산·표시할 수 있다. 병렬 진행이 가능하다.

**8(API)을 6(예보 mock) 뒤에 두는 이유**: 직전 개정에서 확립한 원칙 — API를 먼저 붙이면 오류 UI를 미루게 된다. mock 상태에서 화면 분기를 먼저 만들어두면 8단계가 데이터 출처만 바꾸는 작업이 된다. 5단계(로딩·오류)를 그렇게 처리해 실제로 효과를 봤다(1절).

### 목표 디렉터리 구조

```text
src/
├─ App.vue                  [현재→수정] 셸에 DogSelector·면책·푸터 추가
├─ router/index.js          [현재→재편] 8.2
├─ api/                     [예정] client / weatherApi / breedsApi / mock
├─ domain/
│  ├─ weatherRules.js       [현재] 역할 축소 — 판정의 입력 하나
│  ├─ temperature.js        [현재]
│  ├─ walkRules.js          [예정] 산책 판정 단일 소스
│  ├─ groundTemp.js         [예정] 지면온도 추정
│  ├─ breeds.js             [예정] 견종→특성 4축
│  └─ errors.js             [예정] type→문구 매핑
├─ stores/                  configStore[현재], weatherStore[현재], dogStore[예정]
├─ composables/
│  ├─ useTemperature.js     [현재]
│  └─ useWalkVerdict.js     [예정] weather × dog 결합
├─ views/                   Walk*[예정] + Dog*[예정] + Weather*[현재] + NotFound[현재]
├─ components/
│  ├─ common/               [현재] 5개
│  ├─ weather/              [현재] 4개
│  ├─ dog/                  [예정] 3개
│  └─ walk/                 [예정] 4개
├─ practices/               [현재] 학습 산출물 격리 위치
└─ assets/                  base.css[현재] layout.css[현재] main.css[현재]
```

---

## 11. 정리 대상

### 규모 `[현재]`

`src/` 파일 95, `.vue` 66, 라이브 도달 14, 학습 실습 51, 백업 변형 15(전부 git 추적 중).

### 미완료 항목

| 대상 | 개수 | 방침 | 이유 |
| --- | --- | --- | --- |
| **`components/practices/`** | 42 | **`src/practices/`로 이동** | 격리가 절반만 끝났다. 두 곳에 나뉘어 있어 "실습 코드가 어디 있는가"에 답이 둘이다 |
| `src/practices/` | 9 | 유지 | 이미 옳은 위치 |
| `App.vue.autoGenerated`, `App.vue.exercise`, `router/index.js.autoGenerate`, `router/index.js.exercise` | 4 | **삭제** | 스캐폴딩 원본 복사본. git 이력이 같은 역할을 한다 |
| `views/*.vue.before*` / `*.after*` | 6 | **`docs/reference/`로 이동**, 확장자 정상화 | 8단계에서 실제 참고할 axios 연동 자료. 단, 확장자 문제로 lint 대상에서 빠져 결함이 검사 없이 남아 있다 |
| `practices/**/*.vue.answer` / `.question` | 2 | 유지 | 학습 계보. practices와 함께 이동 |
| `weather-intro/App.vue.1st~3rd` | 3 | 유지 | 학습 계보 기록 |

### 앞으로 백업을 만드는 방식

> 파일 복사 방식의 수동 백업을 더 만들지 않는다. 단계별 스냅샷은 git 커밋으로 남긴다.

수동 백업은 이미 한 번 실패했다 — `router/index.js.autoGenerate`와 `.exercise`가 "직전 상태"를 남기려 했으나 실제로는 스캐폴딩 원본이 복사돼 되돌릴 수 없다. git은 이 검증을 자동으로 한다.

### 정리하지 않기로 한 것

| 대상 | 결정 | 이유 |
| --- | --- | --- |
| `assets/practice.css` | 유지 | `practices/weather-intro/App.vue.1st~3rd`가 참조한다 |
| `element-plus` 의존성 | `[결정 필요]` | 라이브 화면에서 사용처가 없다. 실습 컴포넌트만 쓴다면 제거 후보 |
| `@` 별칭 vs 상대경로 혼용 | `[결정 필요]` | 현재 View는 상대경로, store/domain은 `@`. 파일 이동(10절 7단계) 완료 후 한 번에 통일 |
| `weather*.png` | 유지 | README가 참조하는 제출 산출물 |

---

## 요약 — 핵심 결정

| 결정 | 이유 |
| --- | --- |
| `dog/`와 `walk/` 폴더를 신설한다 | `walk/`는 날씨만으로도 반려견만으로도 성립하지 않는 제3 도메인이다 |
| 산책 판정 Store를 만들지 않고 composable이 결합한다 | 파생값 저장은 동기화 누락을, Store 간 참조는 의존 방향 위반을 만든다 |
| 세 Store가 전부 독립이다 | 결합을 composable로 몰면 순환 참조가 설계상 불가능해진다 |
| `walkRules.js`는 `breedId`를 인자로 받지 않는다 | 견종 수만큼 분기가 늘어나는 것을 구조적으로 막는다 |
| 지면온도는 어댑터가 아니라 domain에서 계산한다 | 어댑터가 만들면 "서버가 준 값"처럼 보인다 |
| 예보 상태를 목록 상태와 분리한다 | 예보만 실패했을 때 판정까지 오류 화면으로 덮이는 것을 막는다 |
| `useWalkVerdict`는 반드시 `computed`를 반환한다 | 낡은 판정이 화면에 남으면 잘못된 안심으로 이어진다 |
| 프로필 유무를 Guard로 처리하지 않는다 | Guard는 통과/차단 두 값뿐이라 네 가지 화면 상태를 표현할 수 없다 |
| `activeDogId`를 URL에 두지 않는다 | 링크 공유받은 사람이 남의 개 기준 판정을 보게 된다 |
| 마이그레이션 4단계(프로필 영속)를 되돌림 분기점으로 명시 | 1~3단계까지는 파일 삭제로 이전 컨셉에 복귀할 수 있다 |
| 소비처 없는 Store를 미리 만들지 않는다 | `favoriteStore`/`authStore`가 그 상태로 남아 삭제됐다 |

## [결정 필요] 목록

| 항목 | 확정 시점 |
| --- | --- |
| `dogStore.dogs` 로컬↔서버 병합 상세(서버 우선으로 방향만 확정) | 백엔드 확보 후 |
| `element-plus` 유지 여부 — 라이브 사용처 0건 | 11절 정리 시 |
| `@` 별칭 vs 상대경로 통일 규칙 | 10절 7단계 완료 후 |
| `createWebHistory()` base URL | 배포 계획 확정 후 |
| 견종 마스터를 번들 상수로 둘지 API로 받을지(최소 집합은 번들 확정) | 10절 8단계 |
