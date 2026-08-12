# Day 3-4 — 컨셉 전환(범용 날씨 → 반려견 산책 판정) + 디자인 토큰 확립 + 로딩/오류 상태 배치

3일차 제출본(Pinia 배치까지 끝난 상태) 대비 변경점만 기록한다. 이번 작업은 새 기능을 얹은 게 아니라 **설계 문서 3종을 먼저 개정하고, 그 문서가 정한 범위만큼만 코드를 옮긴** 것이다. 범위는 `vue_architecture.md` 10절 마이그레이션 계획의 **1~2단계**(`domain/walkRules.js` 신설 + `WalkVerdictCard` 1개를 홈 상단에 하드코딩 배치)와 **8~9단계에 해당하는 디자인 토큰·로딩/오류 상태 정착**으로 한정했다. 견종 프로필 입력, 지면온도 실측, 라우트 재편, API 계층은 이번 범위 밖이다.

## 작업 순서

1. **설계 문서 3종 개정** — `service_architecture.md`(컨셉 전환) / `design_architecture.md`(토큰·강조 위계) / `vue_architecture.md`(계층·마이그레이션 계획)
2. **디자인 토큰 확립** — `base.css`를 색상 리터럴 0건 상태로 재작성
3. **도메인 로직 신설** — `src/domain/walkRules.js`
4. **`WalkVerdictCard` 배치** — `WeatherHomeView.vue` 상단에 검증용 하드코딩 프로필로 연결
5. **강조 위계 재조정** — `WeatherCard`/`WeatherBadge`/`WeatherList`에 `emphasis` prop 도입
6. **로딩/오류 상태 실제 연결** — `ErrorState.vue`/`WeatherCardSkeleton.vue` 신설, 세 View에 배치
7. **소비처 없는 Store 삭제** — `favoriteStore.js`/`authStore.js` 제거
8. **레이아웃 CSS 정리** — `exercise.css` → `layout.css` 개명, 죽은 규칙 폐기
9. **검증**

## 1. 설계 문서 3종 개정 — 컨셉 전환

### 왜 바꿨는가 (`service_architecture.md` 1.1~1.4)

기존 컨셉("지금 밖에 나가도 되는지 대신 판단해 주는 날씨 서비스")은 주어가 비어 있어 **어떤 기능이든 채택 근거를 댈 수 있었다**(예: 대기질 기능의 채택 근거가 "판단 근거 추가"라는 동어반복이었음). 판정 구조(입력→판정→행동 권고) 자체는 유지한 채 대상만 **반려견 산책 가능 여부**로 좁혔다 — 피벗이 아니라 상속이다. "범용 판정 + 견주 모드" 하이브리드는 판정 주체가 둘이 되고 화면당 최강 강조 1개 규칙([design_architecture.md] 2.6)을 어겨 채택하지 않았다(1.4).

### 신규 기능 등급 (`service_architecture.md` 3.4)

F-23(산책 가능 판정) ~ F-29(다견 대상 전환)를 새 기능으로 추가하고, 기존 F-01~F-22는 "승계 기능"으로 재분류했다. 이번 배치 범위에 실제로 코드가 반영된 것은 **F-23(산책 판정)만**이며, 나머지(F-25 지면온도, F-27 프로필, F-28 견종 정규화 등)는 `[예정]`으로 문서에만 존재한다.

### 문서 구조 변화

세 문서 모두 절 번호를 하위 항목까지 세분화(`1.` → `1.1/1.2/…`)하고 각 항목에 `[현재]`/`[예정]`/`[결정 필요]` 상태 표기를 달았다. `design_architecture.md`는 "2.5 지면온도의 예외 취급", "4.2 WalkVerdictCard", "5.3 신규 — 산책 단계 색"이, `vue_architecture.md`는 "4.5 dogStore", "5.2 산책 판정의 소유권", "8.2 목표 라우트"가 새로 생겼다.

## 2. 디자인 토큰 확립 — `base.css` 전면 재작성

기존 `base.css`는 Vue 스캐폴딩 기본 팔레트(`--vt-c-*`)를 그대로 썼다. 이를 **역할 이름 기반 토큰**으로 교체했다(`design_architecture.md` 5.1 — `--color-red`가 아니라 `--color-danger`로 지어, 임계값이 바뀌어 위험 배정이 달라져도 변수명을 다시 지을 필요가 없게 함).

| 구분 | 내용 |
| --- | --- |
| 색 | `surface`/`border`/`text`(중립), `danger`/`warning`/`safe`/`info`(의미색, 채움+표면 쌍), `primary`(브랜드 대용), **`walk-good`/`walk-caution`/`walk-limited`/`walk-unsafe`(산책 4단계 — 위험도 축과 다른 별도 축이라 danger/warning/safe를 재사용하지 않음, 1차 잠정치)** |
| 타이포 | `--font-sans`, `--font-size-xs~2xl`(7단계) |
| 간격 | `--space-1~8`(4px 배수 스케일) |
| 반경/그림자 | `--radius-sm/md/lg/full`, `--shadow-sm/md` |

다크 모드 값도 전 토큰에 대해 함께 정의했다. 이후 모든 컴포넌트(`BaseDashboardCard`/`StatusBar`/`UnitToggler`/`WeatherBadge`/`WeatherCard`/`WeatherList`/`NotFoundView`/`WeatherAboutView`/`WeatherAlertView`/`WeatherDetailView`)의 색·간격·반경 리터럴을 전부 이 토큰 참조로 교체했다 — 라이브 컴포넌트에 색 리터럴 0건.

## 3. 도메인 로직 신설 — `src/domain/walkRules.js`

Vue를 모르는 순수 함수로, 판정 함수는 이 파일 1곳에만 존재한다(`service_architecture.md` 4.1). 견종 이름 자체는 모르며(견종→특성 변환은 `[예정]`인 `domain/breeds.js` 몫), `traits`(단두종 여부·피모 타입·체중군·연령군)와 `weather`, `groundTempCelsius`를 입력받는다.

- **임계값**: `GROUND_TEMP_UNSAFE=51℃` / `GROUND_TEMP_CAUTION=44℃`(피부 화상 역학 고전 참조치 Henriques 1947 + AKC/AAHA 소비자 가이드 + 국내 정책브리핑 교차 검증), `AIR_TEMP_CAUTION=29℃`(AKC·AAHA 공동 가이드), `HUMID_THRESHOLD=80%`(캐닌 열스트레스 연구 공통 소견). 모두 사람/소비자 가이드 기반 1차 근거이며 수의학 원저로 교체하는 것은 `[결정 필요]`로 남겨뒀다.
- **판정 로직**: `assessWalk({ weather, traits, groundTempCelsius })` → `{ level, maxMinutes, reasons }`. `level`은 `good/caution/limited/unsafe` 4단계로 단조 상승(`escalate`)하며, 취약 개체(단두종·이중모·비성견)는 같은 조건에서 한 단계 더 보수적으로 판정한다. `reasons`는 조건 1건당 1개, 우선순위(지면온도 > 강수·강풍 > 기온·습도)로 push 후 최대 2개까지만 반환한다 — 조합 전용 문구를 만들지 않아 조건이 늘어도 분기가 배로 늘지 않는다.
- **문구**: `getWalkAdvice(verdict)`가 `reasons`를 아이콘+지시문으로 변환한다. 위험 0건이어도 "지금 산책하기 좋아요!" 문구 1개는 항상 노출해 판정이 돌았다는 것을 확인시킨다. "괜찮습니다" 같은 단정적 문구는 쓰지 않는다(`service_architecture.md` 11절 — 수의학적 판단 배제).

## 4. `WalkVerdictCard` 배치 — `WeatherHomeView.vue`

마이그레이션 1~2단계 검증 목적으로, 홈 화면 최상단에 배치했다. **판정 문구가 실제로 쓸모 있는지 확인하는 것이 목적**이라 프로필·위치·지면온도는 전부 하드코딩했고(`PLACEHOLDER_DOG`), 각각의 정식 자리(3단계 `dogStore`, 5단계 `domain/groundTemp.js`, 위치 연동)로 옮기는 것은 다음 단계로 명시적으로 미뤘다.

- 지면온도 실측 API(기상청 도로기상관측자료)는 고속도로 366개 관측점뿐이라 커버리지가 부족해, 날씨 상태별 오프셋으로 추정하는 `estimateGroundTempPlaceholder()`를 임시로 뒀다 — `groundTemp.js`가 생기면 이 함수는 삭제되고 "실측 우선, 없으면 추정으로 폴백"하는 이중 구조로 교체된다.
- `WalkVerdictCard.vue`(신규, `components/walk/`)는 화면에서 **유일하게 배경이 채워진 요소**로 설계했다(`design_architecture.md` 2.6, 4.2 — 이 화면의 최강 강조). 판정 결과(`verdict`)는 객체 통째로 전달한다 — `level`/`maxMinutes`/`reasons`가 함께 움직이는 하나의 결과라 분해해서 넘기면 서로 어긋난 조합이 타입상 가능해지기 때문(`vue_architecture.md` 7.2).

## 5. 강조 위계 재조정 — `emphasis` prop

`WalkVerdictCard`가 화면의 최강 강조를 가져가면서, 기존에 목록의 위험 배지·좌측 빨간 테두리가 같은 화면에서 또 한 번 최강 강조를 주장하던 문제가 생겼다. `WeatherList → WeatherCard → WeatherBadge`에 `emphasis: 'primary' | 'muted'` prop을 관통시켜, 홈 화면 목록만 `emphasis="muted"`로 강등했다(위험 배지는 배경 채움 없는 무채색 텍스트로, 좌측 테두리는 회색으로 대체). 경보·상세 화면은 기존 `primary`를 유지해 그대로 위험을 강조한다.

## 6. 로딩/오류 상태 실제 연결

`weatherStore.listStatus`/`listError`는 3일차에 이미 store에 존재했지만 화면에 소비되지 않고 있었다. 이번에 신설한 2개 컴포넌트로 세 View 모두에 실제로 연결했다.

| 컴포넌트(신규) | 역할 |
| --- | --- |
| `WeatherCardSkeleton.vue` | `listStatus === 'loading'`일 때 표시. 실제 카드와 같은 padding·radius를 써서 로딩→카드 전환 시 레이아웃이 밀리지 않게 함. `prefers-reduced-motion` 대응 |
| `ErrorState.vue` | `listStatus === 'error'`일 때 표시. "검색 결과 0건"과 "통신 실패"가 같은 문구로 섞이지 않도록 빈 결과(`empty-state`)와 별도 컴포넌트로 분리. `retry` 이벤트로 `weatherStore.refreshCityWeather()` 재호출 |

`WeatherHomeView`/`WeatherAlertView`/`WeatherDetailView` 세 곳 모두 `loading → error → (success) 목록/상세` 순서의 분기 템플릿을 갖게 됐다.

## 7. 소비처 없는 Store 삭제

`favoriteStore.js`/`authStore.js`를 삭제했다. 3일차에는 "뼈대만" 만들어 둔 상태였는데, 소비 컴포넌트가 0개로 남아 있는 것 자체가 `vue_architecture.md`가 반면교사로 드는 실패 패턴("store는 완성됐는데 소비처가 안 붙어 완성된 것처럼 보이지만 동작 안 하는 기능")과 같았다. 새 컨셉에서 인증은 우선순위가 낮아졌고(P2), 즐겨찾기는 반복 대상이 "도시"에서 "개체"로 바뀌며 대체될 예정이라 지금 되살리지 않았다 — **소비처 없는 Store를 미리 만들지 않는다**는 원칙을 재확인했다.

## 8. 레이아웃 CSS 정리

`assets/exercise.css`를 `assets/layout.css`로 개명했다. 실습용 이름("exercise")에 서비스 핵심 레이아웃(네비게이션 바, 대시보드 폭)이 얹혀 있던 것을 내용에 맞는 이름으로 바로잡았고, `App.vue`의 import도 함께 바꿨다. 개명과 함께 실습 잔재였던 죽은 규칙(`.app-container`, `.badge`류, `.btn-detail`, `.weather-card` 등 — 이미 각 컴포넌트로 옮겨져 더는 쓰이지 않는 선택자)은 옮기지 않고 폐기했다. `main.css`도 스캐폴딩 잔재(`.green` 링크 스타일)를 제거하고 `#app` padding을 반응형 토큰으로 교체했다. `index.html`의 `<html lang="">`도 `lang="ko"`로 채웠다.

## 검증

- `base.css`/`layout.css` 기준 라이브 컴포넌트에 색 리터럴 0건 확인
- 홈 화면 최상단에 `WalkVerdictCard`가 렌더링되고, 판정 단계(좋음/주의/제한/위험)에 따라 배경색과 문구·가능 시간이 바뀌는지 확인
- 홈 목록의 위험 카드가 더 이상 배경/좌측 테두리로 경보와 동일한 강조를 갖지 않는지(무채색으로 강등) 확인
- `weatherStore.listStatus`를 `loading`/`error`로 강제했을 때 세 화면 모두 스켈레톤/오류 상태가 표시되고, `ErrorState`의 "다시 시도" 클릭 시 `refreshCityWeather()`가 호출되는지 확인
- `favoriteStore`/`authStore`를 참조하는 코드가 없는지 grep으로 재확인
- `npm run build` 정상 빌드

## 남은 이슈 (다음 작업 후보 — `vue_architecture.md` 10절 마이그레이션 계획 3~10단계)

- `domain/breeds.js` + `DogProfileForm` + `dogStore`(메모리) — 견종 입력이 실제로 판정을 바꾸도록 연결(3단계)
- 프로필 localStorage 영속화(4단계) — 이 시점부터 컨셉을 되돌리는 비용이 커짐
- `domain/groundTemp.js` + `PawTempIndicator` — 지면온도 추정을 `WeatherHomeView`의 임시 함수에서 정식 도메인 함수로 교체(5단계)
- 예보 mock + `WalkWindowTimeline` — "다음 가능 시각" 표시(6단계)
- 라우트 재편(`/` → 산책 판정, `/weather`로 기존 목록 이동, Navigation Guard)(7단계)
- `api/` 계층 신설, mock → API 교체(8단계)
- 산책 단계 색 토큰의 다크 모드 실측 대비비 재검토(현재 1차 잠정치)(9단계)
- 접근성 마감 — `focus-visible`, `label for`, 헤딩 순서(10단계)
- `components/practices/**`(48개) 자체 정리는 이번에도 다루지 않음
