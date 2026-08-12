# Day 3 — WeatherComposition.vue 컴포넌트 분리

`WeatherComposition.vue`(상태 · 로직 · 마크업이 한 파일에 모여있는 버전)를 여러 컴포넌트로 쪼갠 작업 기록. 무엇을, 어떤 기준으로, 어떤 순서로 나눴는지와 이유를 남겼다.

## 최종 구조

```
WeatherParent.vue            상태/로직 소유자 (컨테이너)
├─ BaseDashboardCard.vue     레이아웃 껍데기 (slot만 있음)
│   └─ SearchBar.vue         도시 검색 입력 (범용화됨)
├─ BaseDashboardCard.vue
│   └─ SearchBar.vue         날씨 상태 검색 입력 (같은 컴포넌트 재사용)
├─ BaseDashboardCard.vue
│   ├─ (위험 필터 체크박스)   — 부모 템플릿에 인라인 유지
│   └─ WeatherList.vue       목록 순회 + 빈 결과 상태
│       └─ WeatherCard.vue   리스트 아이템 (카드 1개)
│           └─ WeatherBadge.vue  온도/추천 뱃지 규칙
└─ StatusBar.vue             하단 알림 문구
```

## 분리 기준

컴포넌트 경계를 정할 때 4가지 질문을 기준으로 했다.

1. **상태/로직 소유권** — 이 조각이 반응형 상태(`ref`/`computed`/`watch`)를 스스로 가져야 하는 지 혹은 부모가 준 데이터를 그리기만 해도 되는 지
   → 상태를 갖는 건 `WeatherParent` 하나뿐이고, 나머지는 전부 `props`로 받아 `emit`으로 올리는 무상태(presentational) 컴포넌트다.
2. **반복되는 시각적 뼈대** — 데이터와 무관하게 스타일/구조만 반복되는지?
   → `BaseDashboardCard`. props/emit이 전혀 없어 첫번째로 안전하게 뗄 수 있었다.
3. **`v-for`로 반복되는 리스트 아이템** — 배열의 원소 하나를 그리는 단위인지?
   → `WeatherCard`(카드 한 장), 그리고 카드들을 순회하며 빈 상태까지 책임지는 `WeatherList`.
4. **복잡한 조건부 규칙이 독립적으로 존재** — 하나의 컴포넌트가 "레이아웃"과 "판정 로직" 두 책임을 동시에 갖고 있지 않은지?
   → `WeatherCard` 안에 있던 7단짜리 `v-if/v-else-if` 뱃지 판정 체인을 `WeatherBadge`로 분리해, `WeatherCard`는 카드 레이아웃만, `WeatherBadge`는 추천 규칙만 갖게 했다.

추가로 컴포넌트를 "새로 만들지 않기로" 판단한 기준도 있었다.

- **똑같이 생긴 UI가 2번 나오면, 새 컴포넌트보다 기존 컴포넌트를 범용화** — 도시 검색창과 날씨 상태 검색창은 구조가 동일해서 `SearchBar`를 복제하지 않고 `label`/`placeholder`/`hint-label` prop을 추가해 재사용했다.
- **로직이 한 줄이라 유지** — 위험 날씨 필터 체크박스는 `v-model` 한 줄뿐이라 별도 컴포넌트로 만들지 않고 `WeatherParent` 템플릿에 인라인으로 남겼다. (과설계 방지)

## 작업 순서

리스크가 낮은 것부터, 상태 의존성이 낮은 것부터 뗐다.

1. **`BaseDashboardCard`** — props/emit 없음. 구조만 바꾸는 작업이라 로직을 건드릴 위험이 없어 첫번째로 먼저 진행.
2. **`WeatherCard`** — `v-for` 블록을 통째로 떼어 `cityItem` prop 하나로 경계를 좁힘. `select-card`/`click-detail` 이벤트 계약을 이 시점에 확정.
3. **`SearchBar`** — `currentQuery` prop + `update-query` emit으로 "props down, events up" 계약을 명시적으로 세움. 부모의 `searchQuery`와 자식의 `:value`/`@input`이 정확히 왕복하는지 확인이 필요해 카드보다 뒤에 진행.
4. **`WeatherParent`로 조립** — 세 컴포넌트를 import하고 남은 상태/로직(`ref`, `computed`, `watch`, `showDetail`)은 유지한 채 템플릿만 컴포넌트 태그로 교체. (여기까지는 도시 검색만 있는 축소 버전)
5. **추가 분리: `StatusBar` / `WeatherBadge` / `WeatherList`** — 4번 결과물을 다시 살펴보며 "아직 어디에도 안 들어간 것"(하단 알림 문구)과 "기존 컴포넌트가 책임을 2개 이상 가진 곳"(카드 안의 뱃지 판정 체인, 부모 템플릿의 v-for+빈 상태)을 찾아 추가로 분리.
6. **`WeatherComposition.vue` 기능 전체 이식** — 지금까지는 `WeatherParent`가 도시 검색만 지원에서 추가로 날씨 상태 검색(`statusQuery`), 위험 날씨 필터(`showDangerOnly`), 8개 도시 전체 데이터, 2단 `computed` 체인(`filteredWeatherList` → `displayWeatherList`)을 기능 추가.

각 단계마다 개발 서버를 띄워 브라우저에서 렌더링/클릭/입력 동작을 확인한 뒤 다음 단계로 넘어갔다.

## 파일별 변경 요약

| 파일                      | 변경 내용                                                                                                                                                                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StatusBar.vue` (신규)    | `message` prop만 받아 하단 알림바 렌더링. 상태 없음.                                                                                                                                                                                                                                                           |
| `WeatherBadge.vue` (신규) | `status`/`temp`/`humidity`/`windSpeed` prop으로 온도감 뱃지 + 활동 추천 문구 계산. `WeatherCard`의 조건부 렌더링 책임을 분리해서 가져옴.                                                                                                                                                                       |
| `WeatherList.vue` (신규)  | `list` prop을 순회하며 `WeatherCard` 렌더링, 빈 결과 메시지("😭 조건에 맞는 날씨가 없습니다.") 처리, `select-card`/`click-detail` 이벤트를 그대로 상위로 전달.                                                                                                                                                 |
| `WeatherCard.vue`         | 인라인 뱃지 로직을 `WeatherBadge`로 교체. 습도/바람 표시(`item.humidity`, `item.windSpeed`) 복원, 상세보기 emit에 humidity/windSpeed 포함.                                                                                                                                                                     |
| `SearchBar.vue`           | `label`/`placeholder`/`hintLabel` prop 추가로 범용화. 도시 검색과 날씨 상태 검색 두 곳에서 재사용.                                                                                                                                                                                                             |
| `WeatherParent.vue`       | `weatherList`를 8개 도시 전체 데이터로 복원. `statusQuery`, `showDangerOnly` 상태와 `filteredWeatherList`→`displayWeatherList` computed 체인, `showDangerOnly` watch 로그 복원. 템플릿에 상태 검색용 `SearchBar` 추가, `list-header`(제목+위험 필터 체크박스) 추가, `WeatherList`에 `displayWeatherList` 연결. |

## 검증 방법

`npm run dev`로 로컬 서버를 띄운 뒤 브라우저에서 다음을 확인:

- 도시 검색 / 날씨 상태 검색 입력 시 목록이 올바르게 필터링되는지
- 위험 날씨만 보기 체크박스로 목록이 좁혀지는지 ("폭우" 검색 + 위험 필터 동시 적용 시 제주/포항만 남는 것까지 확인)
- 카드 클릭 시 하단 `StatusBar` 문구가 갱신되는지
- 상세보기 클릭 시 습도/바람 세기가 포함된 알림창이 뜨는지
- 콘솔에 에러 없이 `watch`/`watchEffect` 로그가 정상 출력되는지
