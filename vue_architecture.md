# 서비스 설계 기준

## 1. 문서 목적

본 문서는 `SKALA Vue Weather Service`의 기능, 화면, 컴포넌트, 상태 관리 및 라우팅을 일관된 기준으로 설계하기 위한 기준을 정의한다.

현재 프로젝트는 **목업 → Composition API → Component 분리 → Props/Emits → Vue Router**까지 구현되어 있으며, 이후 **Pinia를 활용한 전역 상태 관리와 API 연동** 단계로 확장할 예정이다.

따라서 단순히 기능을 추가하는 방식에서 벗어나, 기능이 증가하더라도 코드의 책임과 데이터 흐름을 추적할 수 있도록 서비스의 구조적 기준을 먼저 정의한다.

---

# 2. 현재 시점에서 서비스 설계를 도입하는 이유

현재까지의 개발은 Vue의 주요 기능을 학습하고 실제 날씨 서비스를 구현하는 과정에서 자연스럽게 기능과 컴포넌트를 추가하는 방식으로 진행되었다.

초기에는 기능이 적기 때문에 이러한 방식으로도 충분히 관리할 수 있다.

그러나 서비스 규모가 커지면 다음과 같은 문제가 발생한다.

```text
기능 증가
   ↓
Component 증가
   ↓
데이터 전달 증가
   ↓
Props / Emits 증가
   ↓
Router 증가
   ↓
여러 화면에서 동일한 상태 사용
   ↓
상태의 주인이 불명확해짐
   ↓
수정 영향 범위 증가
   ↓
오류 추적 어려움
```

특히 이후 로그인, 즐겨찾기, 날씨 데이터, 단위 설정, 예보, 대기질 등의 기능이 추가되면 하나의 데이터를 여러 화면에서 공유하게 된다.

예를 들어 `현재 선택된 도시`가 다음 화면에서 모두 필요할 수 있다.

```text
WeatherHomeView
WeatherDetailView
WeatherAlertView
FavoritesView
ForecastView
```

이때 단순히 부모 → 자식 → 자식의 방식으로 데이터를 전달하면 **Props Drilling**이 발생하고, 반대로 모든 데이터를 무분별하게 전역 상태로 만들면 **상태 관리의 복잡성**이 증가한다.

따라서 Pinia를 적용하기 전에 **어떤 데이터를 어디에서 관리해야 하는지에 대한 설계 기준을 먼저 정의한다.**

> **기능을 구현하기 위한 코드보다, 기능이 늘어났을 때에도 구조가 유지되는 기준을 먼저 만든다.**

---

# 3. 서비스의 핵심 컨셉

본 서비스는 일반적인 날씨 정보 제공 서비스에 그치지 않고,

> **날씨 정보를 사용자의 행동 결정에 연결하는 서비스**

를 지향한다.

단순한 정보 전달은 다음과 같다.

```text
현재 기온: 28℃
습도: 40%
날씨: 맑음
```

본 서비스에서는 이를 다음 단계로 확장한다.

```text
날씨 데이터
    ↓
날씨 상태 분석
    ↓
위험 요소 판단
    ↓
사용자에게 의미 있는 정보 제공
    ↓
추천 행동 제시
```

예:

```text
기온 33℃
습도 높음
자외선 높음
     ↓
폭염 위험
     ↓
외출 시 주의
수분 섭취 권장
장시간 야외활동 주의
```

따라서 이후 새로운 기능을 추가할 때도 다음 질문을 기준으로 판단한다.

> **"이 기능이 사용자의 날씨 이해 또는 행동 결정에 실질적인 도움을 주는가?"**

---

# 4. 기능 설계 기준

기능은 단순히 화면 단위로 나열하지 않고 **사용자의 행동 흐름**을 기준으로 정의한다.

## 4.1 핵심 기능

### 날씨 확인

- 현재 날씨 확인
- 지역별 날씨 확인
- 날씨별 지역 현황 확인
- 상세 날씨 확인

### 날씨 판단

- 위험 날씨 확인
- 위험 지역 확인
- 날씨 상태 분석
- 추천 행동 확인

### 날씨 정보 확장

- 일주일 예보
- 대기질
- 지역 검색
- 도시 비교

### 개인화

- 즐겨찾기 도시
- 로그인
- 로그아웃
- 회원가입
- 아이디/비밀번호 찾기
- 마이페이지

### 서비스 정보

- 서비스 이용 안내
- 서비스 소개
- 데이터 제공 정보

---

# 5. 기능 우선순위 기준

모든 기능을 동일한 수준으로 개발하지 않는다.

기능은 다음 기준으로 우선순위를 판단한다.

| 기준        | 질문                                        |
| ----------- | ------------------------------------------- |
| 핵심성      | 서비스의 핵심 목적과 직접적으로 연결되는가? |
| 사용성      | 사용자가 자주 사용할 기능인가?              |
| 연결성      | 다른 기능과 자연스럽게 연결되는가?          |
| 재사용성    | 여러 화면에서 활용되는 데이터/기능인가?     |
| 구현 복잡도 | 구현 비용에 비해 가치가 충분한가?           |
| 확장성      | 향후 API나 Backend와 연결하기 쉬운가?       |

우선적으로 구현할 기능은 다음과 같이 구성한다.

```text
1순위
현재 날씨
지역 검색
상세 날씨
위험 날씨
추천 정보

2순위
예보
대기질
즐겨찾기
지역 비교

3순위
회원 기능
개인화
추가 분석 기능
```

---

# 6. 화면(View) 설계 기준

`views`는 URL과 직접 연결되는 **페이지 단위 컴포넌트**로 정의한다.

현재 프로젝트의 View 구조를 기반으로 다음과 같이 확장한다.

```text
views/
├── WeatherHomeView.vue      [구현 완료] "/"
├── WeatherDetailView.vue    [구현 완료] "/weather/:cityId"
├── WeatherAlertView.vue     [구현 완료] "/weather/alerts"
├── WeatherAboutView.vue     [구현 완료] "/about"
├── NotFoundView.vue         [구현 완료] "/:pathMatch(.*)*"
├── WeatherForecastView.vue  [예정]
├── AirQualityView.vue       [예정]
├── FavoritesView.vue        [예정]
├── LoginView.vue            [예정]
├── SignupView.vue           [예정]
└── MyPageView.vue           [예정]
```

> 참고: 프로젝트 초기 스캐폴딩 시 생성된 `HomeView.vue`, `AboutView.vue`는 라우터(`router/index.js`)에 연결되어 있지 않은 미사용 파일이며, 위 목록의 `WeatherHomeView.vue` / `WeatherAboutView.vue`가 이를 대체한다.

### View의 책임

View는 세부적인 UI를 직접 모두 구현하기보다,

> **"하나의 화면을 구성하고 필요한 Component와 상태를 조합하는 역할"**

을 담당한다.

현재 `WeatherHomeView`의 실제 컴포지션은 다음과 같다.

```text
WeatherHomeView
│
├── BaseDashboardCard
│   └── SearchBar (도시 검색)
├── BaseDashboardCard
│   └── SearchBar (날씨 상태 검색)
├── BaseDashboardCard
│   └── WeatherList
│       └── WeatherCard
│           └── WeatherBadge
└── StatusBar
```

`WeatherAlert`, `RecommendationCard`는 아직 별도 컴포넌트로 존재하지 않는다. 위험 날씨 안내는 현재 `WeatherAlertView`라는 별도 페이지로만 분리되어 있고([4. 기능 설계 기준](#4-기능-설계-기준)의 "위험 날씨 확인"), 추천 행동 카드는 아직 미구현 상태이며 [예정] 항목이다.

따라서 View가 지나치게 커지면 Component로 분리한다.

---

# 7. Component 설계 기준

Component는 **재사용 가능한 UI 또는 특정 기능의 독립적인 단위**로 정의한다.

현재 프로젝트는 아직 `weather/` / `common/` 폴더 분리 없이 모든 컴포넌트가 `components/exercise/` 한 곳에 있다.

```text
components/
└── exercise/
    ├── BaseDashboardCard.vue   # 대시보드 카드 레이아웃 (common 성격)
    ├── SearchBar.vue           # 검색 입력 (common 성격)
    ├── StatusBar.vue           # 하단 상태 메시지 (common 성격)
    ├── UnitToggler.vue         # ℃/℉ 토글, configStore 연동 (common 성격)
    ├── WeatherCard.vue         # 도시별 날씨 카드 (weather 성격)
    ├── WeatherList.vue         # WeatherCard 목록 렌더링 (weather 성격)
    ├── WeatherBadge.vue        # 날씨 상태 배지 (weather 성격)
    ├── weatherMockData.js      # Mock 데이터
    ├── WeatherMockup.vue       # [학습용] 목업 단계 실습 컴포넌트, App.vue "과제 1"
    ├── WeatherComposition.vue  # [학습용] Composition API 단계 실습 컴포넌트, App.vue "과제 2"
    └── WeatherParent.vue       # [학습용] Props/Emits 단계 실습 컴포넌트, App.vue "과제 3"
```

아래는 향후 목표 구조다. 파일 수가 늘어나 `exercise/` 한 폴더로 책임 구분이 어려워지는 시점에 `weather/`(날씨 도메인)와 `common/`(범용 UI)로 분리한다. `WeatherAlert.vue`, `RecommendationCard.vue`, `ForecastCard.vue`, `FavoriteButton.vue`는 아직 만들어지지 않은 [예정] 컴포넌트다.

```text
components/                     [예정 구조]
├── weather/
│   ├── WeatherCard.vue
│   ├── WeatherList.vue
│   ├── WeatherBadge.vue
│   ├── WeatherAlert.vue        [예정]
│   ├── RecommendationCard.vue  [예정]
│   └── ForecastCard.vue        [예정]
└── common/
    ├── SearchBar.vue
    ├── UnitToggler.vue
    └── FavoriteButton.vue      [예정]
```

### Component의 책임

Component는 가능한 한 다음 원칙을 따른다.

```text
입력
 ↓
Props
 ↓
Component
 ↓
사용자 행동
 ↓
Emits
 ↓
상위 또는 Store
```

즉, Component가 애플리케이션 전체의 상태를 직접 관리하지 않도록 한다.

---

# 8. 데이터 흐름 설계 기준

데이터 흐름은 기본적으로 **단방향 데이터 흐름**을 유지한다.

```text
부모
 ↓ Props
자식
```

자식의 사용자 행동은:

```text
자식
 ↓ Emits
부모
```

예:

```text
WeatherHomeView
      │
      │ :city-item
      ↓
WeatherCard
      │
      │ @select-card
      ↓
WeatherHomeView
```

이를 통해 데이터가 어디에서 내려오고 어디에서 변경되는지 추적할 수 있도록 한다.

---

# 9. 상태 관리 기준

모든 데이터를 Pinia에 저장하지 않는다.

상태의 **사용 범위와 수명**을 기준으로 관리 위치를 결정한다.

| 상태 범위                    | 관리 방법                     |
| ---------------------------- | ----------------------------- |
| 하나의 Component에서만 사용  | Component 내부 `ref/reactive` |
| 부모-자식 간 전달            | Props / Emits                 |
| 깊은 Component 트리에서 공유 | Provide / Inject 고려         |
| 여러 View에서 공유           | Pinia                         |
| 서버에서 가져오는 데이터     | Store/API 계층에서 관리       |
| URL에 의미가 있는 상태       | Router Params / Query         |

### 판단 기준

```text
이 데이터는 어디에서 사용되는가?
        ↓
한 Component?
 → local state

부모 ↔ 자식?
 → Props / Emits

깊은 트리?
 → Provide / Inject

여러 페이지?
 → Pinia

주소로 표현되어야 하는가?
 → Router
```

이 기준을 통해 **"일단 Pinia에 넣기"를 방지한다.**

---

# 10. Pinia Store 설계 기준

전역 상태는 의미가 있는 도메인 단위로 Store를 분리한다.

예:

```text
stores/
├── configStore.js    [구현 완료]
├── weatherStore.js   [예정]
├── favoriteStore.js  [예정]
└── authStore.js      [예정]
```

> 참고: 현재 `stores/`에는 Pinia 스캐폴딩 예제인 `counter.js`도 함께 존재하지만, 이는 본 설계와 무관한 튜토리얼 산출물이므로 위 목록에서 제외한다.

## configStore [구현 완료]

```text
앱 설정
 └── unit (ref, 'celsius' | 'fahrenheit')
      ├── unitSymbol (getter, ℃/℉ 반환)
      └── toggleUnit() (action)
```

현재 `UnitToggler.vue`가 `toggleUnit()`을 호출해 상태를 변경하지만, 날씨 수치를 표시하는 컴포넌트(`WeatherCard`, `WeatherDetailView` 등)는 아직 `unit`/`unitSymbol`을 구독하지 않아 실제 화면의 온도 표시에는 반영되지 않는다. Store의 상태 소유권은 확립되었지만 소비(consume) 지점 연결은 [예정]이다.

## weatherStore [예정]

현재 `weatherMockList`(`components/exercise/weatherMockData.js`)를 `WeatherHomeView`, `WeatherAlertView`, `WeatherDetailView`가 각각 직접 import해서 사용 중이다 ([15. API 연동 기준](#15-api-연동-기준)의 "나쁜 구조"에 해당). weatherStore 도입 시 아래 데이터를 이 세 View가 공유하도록 이관한다.

```text
날씨 데이터
 ├── 도시 목록
 ├── 선택 도시
 ├── 위험 날씨
 └── 추천 정보
```

## favoriteStore [예정]

```text
사용자 즐겨찾기
 └── 즐겨찾기 도시 목록
```

## authStore [예정]

```text
인증
 ├── token
 ├── user
 ├── 로그인 상태
 ├── login()
 └── logout()
```

Store 내부는 기본적으로 다음 구조를 유지한다.

```text
State
 ↓
Getter
 ↓
Action
```

즉,

> **데이터 → 계산 → 변경/행동**

의 역할을 명확히 구분한다.

---

# 11. Router 설계 기준

Router는 **페이지 이동 규칙**을 담당한다.

예:

```text
/                    → WeatherHomeView      [구현 완료]
/weather/:cityId     → WeatherDetailView    [구현 완료]
/weather/alerts      → WeatherAlertView     [구현 완료]
/about               → WeatherAboutView     [구현 완료]
/forecast            → WeatherForecastView  [예정]
/air-quality         → AirQualityView       [예정]
/favorites           → FavoritesView        [예정]
/login               → LoginView            [예정]
/mypage              → MyPageView           [예정]
```

동적 데이터는 URL 구조를 활용한다.

```text
/weather/seoul
/weather/suwon
/weather/busan
```

Router 내부에서는:

```js
/weather/:cityId
```

로 정의하고 View에서는:

```js
route.params.cityId
```

로 사용한다.

검색이나 필터처럼 URL로 공유할 가치가 있는 상태는 Query String을 사용한다.

```text
/weather?search=수원&page=2
```

---

# 12. 인증 및 접근 권한 기준

로그인 여부가 중요한 페이지는 Navigation Guard를 활용한다.

```text
사용자
 ↓
/mypage 접근
 ↓
Navigation Guard
 ↓
로그인 상태 확인
 ├── 로그인 O → 페이지 진입
 └── 로그인 X → LoginView
```

인증 상태 자체는 `authStore`가 관리하고 Router Guard는 **접근 가능 여부를 판단하는 역할**만 담당한다.

즉:

```text
authStore
= "누가 로그인했는가?"

Navigation Guard
= "이 사용자가 이 페이지에 들어갈 수 있는가?"
```

역할을 분리한다.

---

# 13. 상태의 주인 원칙

서비스가 커질수록 가장 중요한 기준이다.

> **모든 상태에는 하나의 명확한 주인을 둔다.**

예:

```text
℃ / ℉
 → configStore

로그인 사용자
 → authStore

즐겨찾기 도시
 → favoriteStore

날씨 데이터
 → weatherStore

검색창 입력값
 → SearchBar 또는 검색 화면
```

하나의 상태를 여러 Component에서 각각 복사해서 관리하지 않는다.

```text
❌ Home의 city
❌ Detail의 city
❌ Alert의 city

        ↓

⭕ weatherStore의 city
```

이 원칙을 통해 상태 불일치 문제를 줄인다.

---

# 14. 데이터 변경 통로 원칙

공유 상태의 변경은 가능한 한 명확한 통로를 사용한다.

```text
Component
   ↓
Store Action
   ↓
State 변경
   ↓
화면 자동 갱신
```

예:

```js
weatherStore.selectCity(city)
```

와 같이 **무엇을 변경했는지 의미가 드러나는 Action**을 사용한다.

단순히 여러 Component에서 Store의 데이터를 직접 수정하는 것보다 변경 지점을 추적하기 쉽도록 설계한다.

---

# 15. API 연동 기준

현재는 Mock Data를 사용하지만 향후 Backend API로 교체할 수 있도록 데이터의 사용 구조를 분리한다.

현재 (weatherStore 도입 전, 실제 구조):

```text
weatherMockData.js
       ↓
WeatherHomeView / WeatherAlertView / WeatherDetailView   ← 각 View가 직접 import
       ↓
Component
```

`WeatherHomeView`, `WeatherAlertView`, `WeatherDetailView`가 각각 `weatherMockData.js`를 개별적으로 import하고 있으며, 이는 아래 "나쁜 구조"에 해당한다. 도시 목록이 세 View에 각각 복사되어 있으므로 [13. 상태의 주인 원칙](#13-상태의-주인-원칙)도 아직 충족되지 않은 상태다.

향후 (weatherStore 도입 후):

```text
weatherMockData.js
       ↓
weatherStore
       ↓
Component / View
```

최종 (Backend API 연동 후):

```text
Backend API
       ↓
API 요청
       ↓
weatherStore
       ↓
Component / View
```

따라서 Component와 View가 Mock Data를 직접 읽도록 만들지 않는다.

### 나쁜 구조 (현재 상태)

```text
WeatherHomeView / WeatherCard
 ↓
weatherMockData.js
```

### 권장 구조 (예정)

```text
WeatherCard
 ↓
weatherStore
 ↓
API / Mock Data
```

이렇게 하면 Mock Data를 실제 API로 교체할 때 Component의 수정 범위를 줄일 수 있다.

---

# 16. UI와 기능의 분리 기준

UI 디자인과 기능 구현은 완전히 분리하지도 않고, 완전히 동시에 확정하지도 않는다.

개발 순서는 다음을 권장한다.

```text
기능 구조
 ↓
화면 배치
 ↓
Component 구조
 ↓
상태 / 데이터 흐름
 ↓
기능 검증
 ↓
디자인 고도화
```

즉 초기 단계에서는 **사용 가능한 배치와 정보 구조를 우선**하고, 핵심 기능이 안정화된 이후 디자인을 세밀하게 조정한다.

이렇게 하면 디자인 변경 때문에 기능 구조를 반복해서 수정하는 비용을 줄일 수 있다.

---

# 17. 기능 추가 판단 기준

새로운 기능을 추가할 때 다음 질문을 순서대로 확인한다.

### ① 서비스 컨셉과 관련 있는가?

```text
날씨 → 사용자 판단/행동
```

과 관련이 있는가?

### ② 기존 기능과 중복되지 않는가?

### ③ 어느 View에 속하는가?

### ④ Component로 분리할 필요가 있는가?

### ⑤ 상태가 필요한가?

### ⑥ 상태의 주인은 누구인가?

### ⑦ 여러 View에서 공유하는가?

### ⑧ Router가 필요한가?

### ⑨ 향후 API로 연결될 수 있는가?

이 과정을 거친 후 구현한다.

---

# 18. 현재 프로젝트에 적용한 구조

## 18.1 현재 실제 구조

```text
src/
│
├── components/
│   └── exercise/                  # weather/common 미분리, 단일 폴더
│       ├── BaseDashboardCard.vue
│       ├── SearchBar.vue
│       ├── StatusBar.vue
│       ├── UnitToggler.vue
│       ├── WeatherCard.vue
│       ├── WeatherList.vue
│       ├── WeatherBadge.vue
│       ├── weatherMockData.js
│       ├── WeatherMockup.vue      # [학습용]
│       ├── WeatherComposition.vue # [학습용]
│       └── WeatherParent.vue      # [학습용]
│
├── views/
│   ├── WeatherHomeView.vue
│   ├── WeatherDetailView.vue
│   ├── WeatherAlertView.vue
│   ├── WeatherAboutView.vue
│   ├── NotFoundView.vue
│   ├── HomeView.vue                # 스캐폴딩 잔재, 라우터 미연결
│   └── AboutView.vue                # 스캐폴딩 잔재, 라우터 미연결
│
├── stores/
│   ├── configStore.js
│   └── counter.js                  # Pinia 스캐폴딩 예제, 본 설계와 무관
│
├── router/
│   └── index.js
│
└── App.vue   # "과제 1~5" 학습 단계가 한 페이지에 순서대로 누적 렌더링되는 중간 상태
```

`App.vue`는 아직 하나의 정돈된 앱 셸이 아니라, 목업 → Composition API → Props/Emits → Router → Store 적용까지 각 학습 단계의 결과물을 섹션별로 쌓아 보여주는 구조다. 실제 라우터 기반 대시보드(`RouterView`)는 "과제 4/5" 섹션에만 있고, `configStore` 연동 네비게이션은 "과제 5" 섹션에만 있다. Section 19의 Backend → Store → View → Component 흐름은 이 "과제 5" 섹션에 한해 부분적으로 성립하며, 아직 App 전체의 유일한 진입 구조는 아니다.

## 18.2 최종 목표 구조

현재 구현된 구조를 기반으로 최종적으로 다음과 같이 확장한다.

```text
src/
│
├── components/
│   ├── common/                      [예정, 현재는 exercise/에 혼재]
│   │   ├── SearchBar.vue
│   │   ├── UnitToggler.vue
│   │   └── FavoriteButton.vue       [예정]
│   │
│   └── weather/                     [예정, 현재는 exercise/에 혼재]
│       ├── WeatherCard.vue
│       ├── WeatherList.vue
│       ├── WeatherBadge.vue
│       ├── WeatherAlert.vue         [예정]
│       ├── RecommendationCard.vue   [예정]
│       └── ForecastCard.vue         [예정]
│
├── views/
│   ├── WeatherHomeView.vue          [구현 완료]
│   ├── WeatherDetailView.vue        [구현 완료]
│   ├── WeatherAlertView.vue         [구현 완료]
│   ├── WeatherAboutView.vue         [구현 완료]
│   ├── NotFoundView.vue             [구현 완료]
│   ├── WeatherForecastView.vue      [예정]
│   ├── AirQualityView.vue           [예정]
│   ├── FavoritesView.vue            [예정]
│   ├── LoginView.vue                [예정]
│   ├── SignupView.vue               [예정]
│   └── MyPageView.vue               [예정]
│
├── stores/
│   ├── configStore.js               [구현 완료]
│   ├── weatherStore.js              [예정]
│   ├── favoriteStore.js             [예정]
│   └── authStore.js                 [예정]
│
├── router/
│   └── index.js
│
└── App.vue                          [예정: 단일 앱 셸로 정리]
```

단, 위 구조는 **최종 목표 구조**이며 실제 구현 과정에서는 기능의 필요성이 확인된 경우에만 파일과 Store를 추가한다.

---

# 19. 전체 아키텍처 기준

최종적으로 다음과 같은 데이터 흐름을 유지한다.

```text
                    ┌──────────────┐
                    │   Backend    │
                    │ Weather API  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │    Store     │
                    │    Pinia     │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │     View     │
                    │   Page UI    │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │  Component   │
                    │   UI 부품    │
                    └──────────────┘
```

사용자 이벤트는 반대 방향으로 전달된다.

```text
사용자
 ↓
Component
 ↓
Emit / Action
 ↓
View / Store
 ↓
State 변경
 ↓
Vue 반응성
 ↓
화면 갱신
```

---

# 20. 설계의 핵심 원칙

본 프로젝트의 설계 원칙은 다음 6가지로 요약한다.

### 1. 목적 우선

> 기능을 추가하기 전에 서비스 목적과 연결되는지 확인한다.

### 2. 책임 분리

> View는 화면을 구성하고, Component는 UI 부품을 담당하며, Store는 공유 상태를 관리한다.

### 3. 상태의 단일 소유

> 하나의 공유 상태에는 명확한 관리 주인을 둔다.

### 4. 데이터 흐름 명확화

> 데이터는 가능한 한 단방향으로 흐르고, 변경은 명확한 통로를 사용한다.

### 5. 필요한 만큼만 전역화

> 모든 상태를 Pinia로 보내지 않고 사용 범위에 따라 관리 위치를 결정한다.

### 6. 교체 가능한 구조

> Mock Data → API, Component → 다른 UI, Router → 새로운 페이지와 같이 향후 변경이 발생해도 수정 범위를 최소화한다.

---

# 21. 개발 단계 기준

현재 프로젝트의 개발 순서는 다음과 같이 정의한다.

```text
[완료]
목업
  ↓
Composition API
  ↓
Component 분리
  ↓
Props / Emits / Slot
  ↓
Vue Router
  ↓
────────────────────
[현재 설계 보강 단계]
서비스 컨셉
  ↓
기능 목록
  ↓
View 구조
  ↓
상태의 주인
  ↓
데이터 흐름
  ↓
────────────────────
[다음 단계]
Pinia Store
  ↓
API 연동
  ↓
인증 / 권한
  ↓
테스트
  ↓
UI 디자인 고도화
  ↓
배포
```

---

## 결론

현재 단계에서 서비스 설계를 추가하는 목적은 **코드를 더 복잡하게 만들기 위한 것이 아니다.**

오히려 앞으로 추가될 기능 때문에 발생할 복잡성을 미리 제한하기 위한 것이다.

현재까지는 Vue의 기능을 중심으로

> **"어떻게 구현하는가?"**

를 학습했다면, 지금부터는

> **"어디에 구현해야 하는가?"**
> **"누가 이 데이터를 책임지는가?"**
> **"이 기능이 다른 기능과 어떻게 연결되는가?"**

를 결정해야 한다.

따라서 **Pinia를 적용하기 전에 서비스 설계를 정리하는 것은 단순한 문서 작업이 아니라, 이후 상태 관리와 API 연동의 기준점을 만드는 과정**이다.

최종적인 설계 방향은 다음 한 문장으로 정리한다.

> **서비스의 목적을 기준으로 기능을 정의하고, 기능을 View와 Component로 분리하며, 공유 상태는 명확한 Store가 소유하고, Router와 API는 각자의 책임에 따라 연결한다.**
