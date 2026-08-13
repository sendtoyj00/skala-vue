<script setup>
// 판정 전용 홈(P0). 마이그레이션 7단계(vue_architecture.md 10절) — WeatherHomeView에 함께
// 있던 WalkVerdictCard를 분리한다. 분리 이유는 디자인 규칙만이 아니라 광고 정책이기도 하다:
// 광고는 산책 판정 화면에 절대 배치할 수 없는데(service_architecture.md 10절), 목록·판정이
// 한 화면에 있으면 목록에 넣을 광고 슬롯을 둘 합법적인 자리가 없었다.
//
// dogStore 도입으로 결합 로직을 useWalkVerdict composable로 승격했다(vue_architecture.md 5.2).
// PLACEHOLDER_DOG 하드코딩은 삭제됐다 — 프로필이 없으면 범용 판정 대신 온보딩을 보여준다
// (service_architecture.md 4.6, design_architecture.md 6.2).
import { useDogStore } from '@/stores/dogStore'
import { useWalkVerdict } from '@/composables/useWalkVerdict'
import { useWalkRoutes } from '@/composables/useWalkRoutes'
import WalkVerdictCard from '../components/walk/WalkVerdictCard.vue'
import PawTempIndicator from '../components/walk/PawTempIndicator.vue'
import WalkWindowTimeline from '../components/walk/WalkWindowTimeline.vue'
import LocationBadge from '../components/walk/LocationBadge.vue'
import RiskFactorPanel from '../components/walk/RiskFactorPanel.vue'
import BestWalkTimeChips from '../components/walk/BestWalkTimeChips.vue'
import WalkRouteList from '../components/walk/WalkRouteList.vue'
import WalkChecklist from '../components/walk/WalkChecklist.vue'

// 영속 상태 복원은 App.vue 셸에서 한 번만 한다(중복 복원은 값 자체는 같아 무해하지만
// "복원은 어디서 하는가"에 답이 둘이 되는 것을 피한다).
const dogStore = useDogStore()

const {
  activeDog,
  myCityWeather,
  coords,
  geo,
  groundTemp,
  verdict,
  forecastStatus,
  forecastWindows,
  bestWindowRanges,
  nextAvailableTime,
} = useWalkVerdict()

const { routes, selectedRouteId, selectRoute } = useWalkRoutes(coords, verdict, groundTemp)

// P2 — 판정 근거. 접어두더라도 접혀 있다는 표시는 남긴다. 감추지 않는다(design_architecture.md 2.4).
const REASON_LABELS = {
  GROUND_TEMP: '지면 온도',
  RAIN_STORM: '강수',
  WIND: '풍속',
  HEAT_HUMID: '기온·습도',
  HEAT: '기온',
}
</script>

<template>
  <div class="dashboard-wrapper">
    <h1 class="visually-hidden">왈씨 — 지금 산책 판정</h1>

    <!-- 초기 상태(프로필 없음) — 오류·빈 결과와 다른 화면. 판정 카드와 같은 높이를 유지해
         레이아웃 이동을 막는다(design_architecture.md 6.1). 범용 판정으로 화면을 채우지
         않는다(service_architecture.md 4.6). -->
    <div v-if="!dogStore.hasProfile" class="onboarding-card">
      <p class="onboarding-icon" aria-hidden="true">🐕</p>
      <p class="onboarding-title">아직 등록된 반려견이 없어요</p>
      <p class="onboarding-desc">
        견종·연령·체중만 알려주시면 우리 아이 기준으로 지금 산책해도 되는지 바로 알려드려요.
      </p>
      <RouterLink to="/dogs" class="onboarding-cta">반려견 등록하고 판정 시작하기</RouterLink>
    </div>

    <template v-else>
      <LocationBadge
        :city-name="myCityWeather?.cityName ?? myCityWeather?.name"
        :source="geo.source.value"
        :status="geo.status.value"
        @request="geo.requestLocation"
      />

      <WalkVerdictCard
        v-if="verdict && groundTemp && myCityWeather"
        :verdict="verdict"
        :dog-label="activeDog?.name"
        :ground-temp-celsius="groundTemp.celsius"
        :ground-temp-is-estimated="groundTemp.isEstimated"
        :air-temp-celsius="myCityWeather.temp"
        :humidity="myCityWeather.humidity"
        :next-available="nextAvailableTime"
      />
      <p v-else class="loading-note">판정을 계산하는 중이에요…</p>

      <PawTempIndicator
        v-if="groundTemp && myCityWeather"
        :ground-temp-celsius="groundTemp.celsius"
        :is-estimated="groundTemp.isEstimated"
        :air-temp-celsius="myCityWeather.temp"
        :basis="groundTemp.basis"
      />

      <details v-if="verdict" class="reasons-detail">
        <summary>판정 근거 자세히 보기</summary>
        <p v-if="verdict.reasons.length === 0" class="reason-empty">
          위험 요인이 없어요. 관측값만 표시합니다.
        </p>
        <div v-else class="reason-row" v-for="(r, i) in verdict.reasons" :key="i">
          <span class="reason-name">{{ REASON_LABELS[r.code] ?? r.code }}</span>
          <span class="reason-nums">{{ r.threshold != null ? `기준 ${r.threshold} · ` : '' }}실측 {{ r.actual }}</span>
        </div>
      </details>

      <!-- 산책 위험 요소(F-35) — 판정 근거(위)는 "걸린 조건만", 이 패널은 "4개 축 전부"를
           상시 공개한다. 서로 다른 목적이라 별도 컴포넌트로 둔다. -->
      <RiskFactorPanel v-if="myCityWeather && groundTemp" :weather="myCityWeather" :ground-temp-celsius="groundTemp.celsius" />

      <!-- 부분 실패: 예보만 실패했을 때 타임라인 자리만 접는다. 판정 영역은 불변이다
           (service_architecture.md 8절, design_architecture.md 6.1). -->
      <template v-if="forecastStatus === 'success' && forecastWindows.length > 0">
        <BestWalkTimeChips :ranges="bestWindowRanges" />
        <WalkWindowTimeline :windows="forecastWindows" />
      </template>
      <p v-else-if="forecastStatus === 'error'" class="forecast-error">
        예보를 불러오지 못했어요. 지금 판정은 그대로 유효합니다.
      </p>

      <!-- 산책 경로 3종 + 지도(F-33·F-34) -->
      <WalkRouteList
        v-if="routes.length > 0 && coords"
        :routes="routes"
        :selected-route-id="selectedRouteId"
        :center="coords"
        @select="selectRoute"
      />

      <!-- 산책 체크리스트 + 광고(F-36) -->
      <WalkChecklist />

      <!-- F-30 면책 문구는 이제 앱 셸 푸터가 상시 노출한다(App.vue) — 화면마다 반복하지 않는다. -->
    </template>
  </div>
</template>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
.loading-note {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.onboarding-card {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}
.onboarding-icon {
  font-size: 40px;
  margin: 0 0 var(--space-3);
}
.onboarding-title {
  font-weight: 700;
  font-size: var(--font-size-md);
  margin: 0 0 var(--space-2);
}
.onboarding-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-5);
}
.onboarding-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: var(--space-3) var(--space-6);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-md);
  font-weight: 700;
  text-decoration: none;
}

.reasons-detail {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  margin-bottom: var(--space-4);
}
.reasons-detail summary {
  cursor: pointer;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 600;
  min-height: 44px;
  display: flex;
  align-items: center;
}
.reason-empty {
  margin: 0;
  padding: 0 var(--space-4) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.reason-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}
.reason-row:last-child {
  padding-bottom: var(--space-3);
}
.reason-name {
  color: var(--color-text-muted);
}

.forecast-error {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-bottom: var(--space-4);
}
</style>
