<script setup>
// 프로필 편집 전용. 파라미터 조회는 onMounted가 아니라 computed로 한다(vue_architecture.md 8.7)
// — 상세→상세 직접 이동 시 갱신되지 않는 버그를 구조적으로 막는다.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDogStore } from '@/stores/dogStore'
import DogProfileForm from '@/components/dog/DogProfileForm.vue'

const route = useRoute()
const router = useRouter()
const dogStore = useDogStore()

const dogId = computed(() => route.params.dogId)
const dog = computed(() => dogStore.dogs.find((d) => d.id === dogId.value) ?? null)

function handleSubmit(profile) {
  dogStore.updateDog(dogId.value, profile)
  router.push({ name: 'DogList' })
}

function handleRemove() {
  dogStore.removeDog(dogId.value)
  router.push({ name: 'DogList' })
}
</script>

<template>
  <div class="dashboard-wrapper">
    <RouterLink to="/dogs" class="back-link">← 목록으로</RouterLink>

    <div v-if="dog">
      <p class="page-eyebrow">Dogs</p>
      <h1 class="page-title">{{ dog.name }} 프로필 수정</h1>
      <DogProfileForm :initial="dog" submit-label="저장하기" @submit-profile="handleSubmit" @cancel="router.push({ name: 'DogList' })" />
      <button class="remove-btn" @click="handleRemove">이 프로필 삭제</button>
    </div>
    <p v-else class="not-found">프로필을 찾을 수 없어요.</p>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-decoration: none;
}
.remove-btn {
  margin-top: var(--space-5);
  min-height: 44px;
  width: 100%;
  padding: var(--space-2);
  background: var(--color-danger-surface);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
}
.not-found {
  color: var(--color-text-muted);
}
</style>
