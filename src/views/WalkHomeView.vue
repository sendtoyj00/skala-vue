<script setup>
// 판정 전용 홈(P0). 광고는 산책 판정 화면에 절대 배치할 수 없다(service_architecture.md 10절) —
// 목록·판정이 한 화면에 있으면 목록에 넣을 광고 슬롯을 둘 합법적인 자리가 없었다.
//
// dogStore 도입으로 결합 로직을 useWalkVerdict composable로 승격했다(vue_architecture.md 5.2).
// PLACEHOLDER_DOG 하드코딩은 삭제됐다 — 프로필이 없으면 범용 판정 대신 온보딩을 보여준다
// (service_architecture.md 4.6, design_architecture.md 6.2).
//
// 대시보드 배치(2차 개편): 로직은 그대로, 템플릿만 히어로 배너 + 좌측 메인 컬럼 + 우측 사이드
// 컬럼 그리드로 재구성한다(레퍼런스 대시보드 구조).
import { useDogStore } from '@/stores/dogStore'
import { useWalkVerdict } from '@/composables/useWalkVerdict'
import { useWalkRoutes } from '@/composables/useWalkRoutes'
import { findBreedById } from '@/domain/breeds'
import DogAvatar from '../components/dog/DogAvatar.vue'
import WalkVerdictCard from '../components/walk/WalkVerdictCard.vue'
import PawTempIndicator from '../components/walk/PawTempIndicator.vue'
import WalkWindowTimeline from '../components/walk/WalkWindowTimeline.vue'
import LocationBadge from '../components/walk/LocationBadge.vue'
import RiskFactorPanel from '../components/walk/RiskFactorPanel.vue'
import BestWalkTimeChips from '../components/walk/BestWalkTimeChips.vue'
import WalkAlertToggle from '../components/walk/WalkAlertToggle.vue'
import WalkRouteList from '../components/walk/WalkRouteList.vue'
import WalkLogQuickAdd from '../components/walk/WalkLogQuickAdd.vue'
import WalkChecklist from '../components/walk/WalkChecklist.vue'

// 영속 상태 복원은 App.vue 셸에서 한 번만 한다(중복 복원은 값 자체는 같아 무해하지만
// "복원은 어디서 하는가"에 답이 둘이 되는 것을 피한다).
const dogStore = useDogStore()

const { activeDog, myCityWeather, coords, geo, groundTemp, verdict, airQuality, forecastStatus, forecastWindows, bestWindowRanges, nextAvailableTime, nextGoodWindowAt } = useWalkVerdict()

const { routes, selectedRouteId, selectedRoute, selectRoute } = useWalkRoutes(coords, verdict, groundTemp)

// P2 — 판정 근거. 접어두더라도 접혀 있다는 표시는 남긴다. 감추지 않는다(design_architecture.md 2.4).
const REASON_LABELS = {
  GROUND_TEMP: '지면 온도',
  RAIN_STORM: '강수',
  WIND: '풍속',
  HEAT_HUMID: '기온·습도',
  HEAT: '기온',
  AIR_QUALITY: '대기질',
}

const AGE_LABEL = { puppy: '유견', adult: '성견', senior: '노령견' }

function breedName(dog) {
  return findBreedById(dog?.breedId)?.name ?? '견종 미등록'
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- 초기 상태(프로필 없음) — 오류·빈 결과와 다른 화면. 범용 판정으로 화면을 채우지
         않는다(service_architecture.md 4.6). -->
    <div v-if="!dogStore.hasProfile" class="onboarding-card" v-glow-tilt>
      <span class="onboarding-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="34" height="34">
          <ellipse cx="20" cy="28" rx="10" ry="8" fill="currentColor" />
          <ellipse cx="7" cy="17" rx="4.2" ry="5.2" fill="currentColor" />
          <ellipse cx="15.5" cy="9" rx="4.6" ry="5.6" fill="currentColor" />
          <ellipse cx="24.5" cy="9" rx="4.6" ry="5.6" fill="currentColor" />
          <ellipse cx="33" cy="17" rx="4.2" ry="5.2" fill="currentColor" />
        </svg>
      </span>
      <h1 class="onboarding-title">아직 등록된 반려견이 없어요</h1>
      <p class="onboarding-desc">견종·연령·체중만 알려주시면 우리 아이 기준으로 지금 산책해도 되는지 바로 알려드려요.</p>
      <RouterLink to="/dogs" class="onboarding-cta">반려견 등록하고 판정 시작하기</RouterLink>
    </div>

    <template v-else>
      <div class="dash-head">
        <div>
          <p class="page-eyebrow">🐾 오늘의 산책</p>
          <h1 class="page-title">{{ activeDog?.name }}, 지금 나가도 될까요?</h1>
        </div>
        <LocationBadge :city-name="myCityWeather?.cityName ?? myCityWeather?.name" :source="geo.source.value" :status="geo.status.value" @request="geo.requestLocation" />
      </div>

      <div class="dash-grid">
        <div class="dash-main">
          <WalkVerdictCard
            v-if="verdict && groundTemp && myCityWeather"
            class="hero-card"
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

          <details v-if="verdict" class="reasons-detail" v-glow-tilt>
            <summary>판정 근거 자세히 보기</summary>
            <p v-if="verdict.reasons.length === 0" class="reason-empty">위험 요인이 없어요. 관측값만 표시합니다.</p>
            <div v-else class="reason-row" v-for="(r, i) in verdict.reasons" :key="i">
              <span class="reason-name">{{ REASON_LABELS[r.code] ?? r.code }}</span>
              <span class="reason-nums">{{ r.threshold != null ? `기준 ${r.threshold} · ` : '' }}실측 {{ r.actual }}</span>
            </div>
          </details>

          <!-- 부분 실패: 예보만 실패했을 때 타임라인 자리만 접는다. 판정 영역은 불변이다
               (service_architecture.md 8절, design_architecture.md 6.1). -->
          <div v-if="forecastStatus === 'success' && forecastWindows.length > 0" class="forecast-card" v-glow-tilt>
            <BestWalkTimeChips :ranges="bestWindowRanges" />
            <WalkAlertToggle :next-good-window-at="nextGoodWindowAt" />
            <WalkWindowTimeline :windows="forecastWindows" />
          </div>
          <p v-else-if="forecastStatus === 'error'" class="forecast-error">예보를 불러오지 못했어요. 지금 판정은 그대로 유효합니다.</p>

          <!-- 산책 경로 3종 + 지도(F-33·F-34) -->
          <WalkRouteList v-if="routes.length > 0 && coords" :routes="routes" :selected-route-id="selectedRouteId" :center="coords" @select="selectRoute" />
        </div>

        <aside class="dash-side">
          <!-- 대상 개체 요약 카드 — 다견 가정에서 지금 이 판정이 누구 기준인지 한눈에 보이게 한다. -->
          <div v-if="activeDog" class="dog-card" v-glow-tilt>
            <DogAvatar :name="activeDog.name" size="md" />
            <span class="dog-card-info">
              <span class="dog-card-name">{{ activeDog.name }}</span>
              <span class="dog-card-meta"
                >{{ breedName(activeDog) }} · {{ AGE_LABEL[activeDog.ageClass] }}<template v-if="activeDog.weightKg"> · {{ activeDog.weightKg }}kg</template></span
              >
            </span>
            <RouterLink to="/dogs" class="dog-card-link">관리</RouterLink>
          </div>

          <!-- 산책 위험 요소(F-35) — 판정 근거(위)는 "걸린 조건만", 이 패널은 "4개 축 전부"를
               상시 공개한다. 서로 다른 목적이라 별도 컴포넌트로 둔다. -->
          <RiskFactorPanel v-if="myCityWeather && groundTemp" :weather="myCityWeather" :ground-temp-celsius="groundTemp.celsius" :air-quality="airQuality" />

          <!-- 산책 기록(F-38) — 판정 확인 후 다녀온 시간을 짧게 남긴다 -->
          <WalkLogQuickAdd :dog-id="activeDog?.id" :verdict="verdict" :route-label="selectedRoute?.name" />
        </aside>
      </div>

      <!-- 산책 체크리스트 + 광고(F-36) -->
      <WalkChecklist />

      <!-- F-30 면책 문구는 앱 셸 푸터가 상시 노출한다(App.vue) — 화면마다 반복하지 않는다. -->
    </template>
  </div>
</template>

<style scoped>
/* ── 공통 상태 ───────────────────────────────────────────────────────── */

.loading-note {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 180px;

  color: var(--color-text-muted);
  font-size: var(--font-size-sm);

  background: var(--color-surface);

  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

/* ── 온보딩 ───────────────────────────────────────────────────────────── */

.onboarding-card {
  max-width: 520px;

  margin: var(--space-8) auto 0;
  padding: 40px var(--space-6);

  text-align: center;

  background: var(--color-surface);

  border: 1px solid var(--color-border);

  border-radius: var(--radius-lg);

  box-shadow: 0 10px 30px rgba(38, 50, 56, 0.05);
}

.onboarding-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 72px;
  height: 72px;

  margin-bottom: var(--space-4);

  border-radius: var(--radius-full);

  background: var(--color-primary-surface);
  color: var(--color-primary);
}

.onboarding-title {
  margin: 0 0 var(--space-2);

  font-size: var(--font-size-lg);
  font-weight: 800;

  letter-spacing: -0.02em;
}

.onboarding-desc {
  max-width: 380px;

  margin: 0 auto var(--space-5);

  color: var(--color-text-muted);

  font-size: var(--font-size-sm);
  line-height: 1.7;
}

.onboarding-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 48px;

  padding: var(--space-3) var(--space-6);

  background: var(--color-primary);
  color: var(--color-on-primary);

  border-radius: var(--radius-full);

  font-weight: 700;
  text-decoration: none;

  box-shadow: 0 5px 14px color-mix(in srgb, var(--color-primary) 20%, transparent);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.onboarding-cta:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-primary) 25%, transparent);
}

/* ── 페이지 헤더 ─────────────────────────────────────────────────────── */

.dash-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  flex-wrap: wrap;

  gap: var(--space-4);

  margin-bottom: var(--space-5);
}

.dash-head .page-title {
  margin-bottom: 0;

  font-size: clamp(24px, 3vw, 32px);

  letter-spacing: -0.035em;
}

/* ── 대시보드 ─────────────────────────────────────────────────────────── */

.dash-grid {
  display: grid;

  grid-template-columns: 1fr;

  gap: var(--space-5);

  align-items: start;
}

@media (min-width: 960px) {
  .dash-grid {
    grid-template-columns:
      minmax(0, 1fr)
      320px;
  }
}

.dash-main {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: var(--space-4);
}

.dash-side {
  display: flex;
  flex-direction: column;

  gap: var(--space-4);
}

@media (min-width: 960px) {
  .dash-side {
    position: sticky;

    top: calc(var(--space-8) + 64px);
  }
}

/* ── 반려견 요약 카드 ────────────────────────────────────────────────── */

.dog-card {
  display: flex;
  align-items: center;

  gap: var(--space-3);

  padding: var(--space-3) var(--space-4);

  background: var(--color-surface);

  border: 1px solid var(--color-border);

  border-radius: var(--radius-lg);

  box-shadow: 0 6px 20px rgba(38, 50, 56, 0.045);
}

.dog-card-info {
  display: flex;
  flex-direction: column;

  min-width: 0;
  flex: 1;
}

.dog-card-name {
  font-size: var(--font-size-sm);
  font-weight: 800;
}

.dog-card-meta {
  font-size: var(--font-size-xs);

  color: var(--color-text-muted);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dog-card-link {
  flex-shrink: 0;

  padding: 6px var(--space-3);

  border: 1px solid var(--color-border);

  border-radius: var(--radius-full);

  background: transparent;

  color: var(--color-primary);

  font-size: var(--font-size-xs);
  font-weight: 700;

  text-decoration: none;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.dog-card-link:hover {
  background: var(--color-primary-surface);

  border-color: var(--color-primary);
}

/* ── 예보 영역 ───────────────────────────────────────────────────────── */

.forecast-card {
  padding: var(--space-4);

  background: var(--color-surface);

  border: 1px solid var(--color-border);

  border-radius: var(--radius-lg);

  box-shadow: 0 6px 20px rgba(38, 50, 56, 0.045);
}

.forecast-card > :deep(.best-time),
.forecast-card > :deep(.alert-toggle) {
  margin-bottom: var(--space-3);
}

/* ── 판정 근거 ───────────────────────────────────────────────────────── */

.reasons-detail {
  overflow: hidden;

  margin: 0;

  background: var(--color-surface);

  border: 1px solid var(--color-border);

  border-radius: var(--radius-md);
}

.reasons-detail summary {
  display: flex;
  align-items: center;

  min-height: 46px;

  padding: var(--space-3) var(--space-4);

  cursor: pointer;

  font-size: var(--font-size-sm);
  font-weight: 700;

  color: var(--color-text);
}

.reasons-detail summary:hover {
  background: var(--color-surface-sunken);
}

.reason-empty {
  margin: 0;

  padding: 0 var(--space-4) var(--space-3);

  color: var(--color-text-muted);

  font-size: var(--font-size-sm);
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
  font-weight: 600;
}

.reason-nums {
  text-align: right;

  font-family: var(--font-mono);

  font-size: var(--font-size-xs);

  color: var(--color-text);
}

/* ── 예보 실패 ───────────────────────────────────────────────────────── */

.forecast-error {
  margin: 0;

  padding: var(--space-3) var(--space-4);

  color: var(--color-text-muted);

  background: var(--color-surface-sunken);

  border-radius: var(--radius-md);

  font-size: var(--font-size-xs);
}

/* ── 모바일 ──────────────────────────────────────────────────────────── */

@media (max-width: 959px) {
  .dash-side {
    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    align-items: start;
  }
}

@media (max-width: 620px) {
  .dash-head {
    margin-bottom: var(--space-4);
  }

  .dash-head .page-title {
    font-size: 24px;
  }

  .dash-side {
    grid-template-columns: 1fr;
  }

  .onboarding-card {
    margin-top: var(--space-5);

    padding: var(--space-6) var(--space-4);
  }
}
</style>
