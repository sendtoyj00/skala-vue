# 컴포넌트 분리 기준 (Standard)

`WeatherComposition.vue` 분리 작업에서 실제로 적용한 기준만 정리한다. 검토했지만 채택하지 않은 대안(예: `WeatherFilters.vue`로 검색 상태를 캡슐화하는 안)은 포함하지 않는다.

## 1. 상태는 그 상태를 계산에 실제로 쓰는 컴포넌트가 갖는다

자식 컴포넌트는 로컬 상태 없이 `props`로 받아 그리고, 변경은 `emit`으로 올린다("props down, events up"). 여러 조각의 데이터를 조합해야 하는 계산(`computed`)이 있다면, 그 계산에 필요한 모든 상태는 계산을 수행하는 컴포넌트와 같은 스코프에 둔다.

- **적용 사례**: `weatherList`, `searchQuery`, `statusQuery`, `showDangerOnly`는 전부 `WeatherParent.vue`에 있다. `filteredWeatherList`/`displayWeatherList` computed가 이 값들을 동시에 조합해야 하고, 원본 데이터(`weatherList`)를 부모만 갖고 있기 때문이다. `SearchBar`, `WeatherCard`, `WeatherList`, `WeatherBadge`, `StatusBar`는 모두 로컬 상태가 없는 무상태 컴포넌트다.
- **판단 방법**: "이 상태를 로컬에 두면, 그 값을 필요로 하는 다른 계산까지 또 다른 채널로 올려야 하는가?"라면 로컬에 두지 않는다. 상태가 두 곳에 나뉘어 동기화 문제가 생긴다.

## 2. 데이터와 무관하게 반복되는 시각적 뼈대는 슬롯 컴포넌트로 뗀다

props/emit이 필요 없고 순수하게 레이아웃만 반복되는 부분을 먼저 분리한다. 상태 의존성이 없어 가장 안전하다.

- **적용 사례**: `BaseDashboardCard.vue` — `<slot>`만 있고 어떤 데이터도 알지 못한다.

## 3. `v-for`로 반복되는 단위는 아이템 컴포넌트 + 목록 컴포넌트로 나눈다

배열 원소 하나를 그리는 책임(아이템)과, 배열을 순회하며 빈 상태까지 처리하는 책임(목록)을 분리한다.

- **적용 사례**: `WeatherCard.vue`(카드 한 장) / `WeatherList.vue`(순회 + 빈 결과 메시지 + 이벤트 전달).

## 4. 하나의 컴포넌트가 두 가지 이상의 책임을 가지면 나눈다

레이아웃을 그리는 책임과, 복잡한 조건부 규칙을 판정하는 책임이 한 컴포넌트에 같이 있으면 후자를 분리한다.

- **적용 사례**: `WeatherCard` 안의 7단 `v-if/v-else-if` 뱃지 판정 체인을 `WeatherBadge.vue`로 분리. `WeatherCard`는 카드 레이아웃만, `WeatherBadge`는 온도/습도/바람 기반 추천 규칙만 담당.

## 5. 같은 모양의 UI가 2번 이상 나오면 새 컴포넌트 대신 기존 컴포넌트를 범용화한다

구조가 동일한 UI를 복제해서 새 컴포넌트를 만들지 않는다. 문구·placeholder 등 달라지는 부분만 prop으로 개방해 재사용한다.

- **적용 사례**: 도시 검색과 날씨 상태 검색은 구조가 동일해서 `SearchBar.vue`에 `label`/`placeholder`/`hintLabel` prop을 추가해 두 곳에서 재사용했다.

## 6. 로직이 한 줄 수준이면 컴포넌트로 빼지 않는다

분리 비용(새 파일, props/emit 계약, import)이 로직 복잡도보다 크면 인라인으로 남긴다. 과설계 방지.

- **적용 사례**: 위험 날씨 필터 체크박스(`v-model="showDangerOnly"`)는 로직이 한 줄뿐이라 별도 컴포넌트로 만들지 않고 `WeatherParent` 템플릿에 그대로 뒀다.

## 7. 분리 순서: 상태 의존성이 낮은 것부터, 리스크가 낮은 것부터

1. props/emit이 없는 것 (`BaseDashboardCard`)
2. `v-for` 경계가 뚜렷한 아이템 (`WeatherCard`)
3. 양방향 데이터 계약(props+emit)이 필요한 입력 (`SearchBar`)
4. 부모로 조립 (`WeatherParent`)
5. 조립 결과를 다시 보며 "어디에도 안 속한 조각"과 "책임이 2개 이상인 조각"을 추가로 분리 (`StatusBar`, `WeatherBadge`, `WeatherList`)

## 8. 매 분리 단계마다 브라우저에서 직접 검증한다

컴포넌트를 분리/조립할 때마다 개발 서버를 띄워 실제 렌더링·클릭·입력 동작을 확인한 뒤 다음 단계로 진행한다. 콘솔 에러 유무와 `watch`/`watchEffect` 로그가 의도대로 찍히는지도 함께 확인한다.
