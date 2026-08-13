<script setup>
// 프로필 목록. 첫 방문 온보딩(흐름 A)과 다견 관리(흐름 D)를 모두 이 화면이 담당한다.
// dogStore 선행(vue_architecture.md 8.2 목표 라우트).
import { ref } from 'vue'
import { useDogStore } from '@/stores/dogStore'
import { findBreedById } from '@/domain/breeds'
import DogAvatar from '@/components/dog/DogAvatar.vue'
import DogProfileForm from '@/components/dog/DogProfileForm.vue'

// 영속 상태 복원은 App.vue 셸에서 한 번만 한다.
const dogStore = useDogStore()
const showForm = ref(false)

const AGE_LABEL = { puppy: '유견', adult: '성견', senior: '노령견' }

function breedName(dog) {
  return findBreedById(dog.breedId)?.name ?? '견종 미등록'
}

function handleSubmit(profile) {
  dogStore.addDog(profile)
  showForm.value = false
}
</script>

<template>
  <div class="dashboard-wrapper">
    <p class="page-eyebrow">Dogs</p>
    <h1 class="page-title">반려견 프로필</h1>
    <p class="page-desc">여기 등록한 특성이 산책 판정을 맞춤으로 만듭니다.</p>

    <!-- 초기 상태(프로필 없음) — 오류·빈 결과와 다른 문구, 온보딩 유도(design_architecture.md 6.2) -->
    <div v-if="!dogStore.hasProfile && !showForm" class="onboarding">
      <p class="onboarding-icon" aria-hidden="true">🐕</p>
      <p class="onboarding-text">아직 등록된 반려견이 없어요.<br />견종·연령·체중만 알려주시면 바로 맞춤 판정을 시작할 수 있어요.</p>
      <button class="add-btn" @click="showForm = true">반려견 등록하기</button>
    </div>

    <ul v-if="dogStore.hasProfile" class="dog-list">
      <li v-for="dog in dogStore.dogsWithTraits" :key="dog.id" class="dog-row">
        <RouterLink :to="`/dogs/${dog.id}`" class="dog-row-link">
          <DogAvatar :name="dog.name" />
          <span class="dog-info">
            <span class="dog-name">
              {{ dog.name }}
              <span v-if="dog.id === dogStore.activeDog?.id" class="active-tag">기준 개체</span>
            </span>
            <span class="dog-meta">{{ breedName(dog) }} · {{ AGE_LABEL[dog.ageClass] }} · {{ dog.weightKg }}kg</span>
          </span>
        </RouterLink>
        <button
          v-if="dog.id !== dogStore.activeDog?.id"
          class="use-btn"
          @click="dogStore.setActiveDog(dog.id)"
        >
          기준으로
        </button>
      </li>
    </ul>

    <button v-if="dogStore.hasProfile && !showForm" class="add-btn add-btn-secondary" @click="showForm = true">
      + 다른 반려견 추가
    </button>

    <section v-if="showForm" class="form-section">
      <h2>{{ dogStore.hasProfile ? '반려견 추가' : '반려견 등록' }}</h2>
      <DogProfileForm submit-label="등록하기" @submit-profile="handleSubmit" />
    </section>
  </div>
</template>

<style scoped>
h1 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-1);
}
.page-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-5);
}
.onboarding {
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
.onboarding-text {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-4);
}
.add-btn {
  min-height: 44px;
  padding: var(--space-3) var(--space-6);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
}
.add-btn-secondary {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px dashed var(--color-border);
  width: 100%;
  margin-bottom: var(--space-4);
}
.dog-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.dog-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}
.dog-row-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  text-decoration: none;
  color: inherit;
  min-height: 44px;
}
.dog-info {
  display: flex;
  flex-direction: column;
}
.dog-name {
  font-weight: 700;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.active-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background: var(--color-primary-surface);
  color: var(--color-primary);
}
.dog-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.use-btn {
  min-height: 44px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-xs);
  cursor: pointer;
  white-space: nowrap;
}
.form-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
.form-section h2 {
  font-size: var(--font-size-md);
  margin: 0 0 var(--space-3);
}
</style>
