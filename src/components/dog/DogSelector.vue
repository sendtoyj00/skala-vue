<script setup>
// 앱 전체에 하나뿐이므로 셸 헤더에서 Store를 직접 참조한다(vue_architecture.md 2.4 —
// "같은 화면에 여러 인스턴스가 뜨는가?"에 No이므로 Store 직접 참조가 적합).
// 개체가 1마리면 표시만 하고 조작 요소를 만들지 않는다(design_architecture.md 4.5).
import { computed } from 'vue'
import { useDogStore } from '@/stores/dogStore'
import DogAvatar from './DogAvatar.vue'

const dogStore = useDogStore()

const hasMultiple = computed(() => dogStore.dogs.length > 1)
</script>

<template>
  <div v-if="dogStore.hasProfile" class="dog-selector">
    <DogAvatar :name="dogStore.activeDog?.name" size="sm" />

    <!-- 개체 1마리 — 표시만, 조작 요소 없음 -->
    <span v-if="!hasMultiple" class="dog-name-static">{{ dogStore.activeDog?.name }}</span>

    <!-- 개체 2마리 이상(F-29, P2) — 전환 허용 -->
    <label v-else class="dog-name-select-wrap">
      <span class="visually-hidden">기준 반려견 선택</span>
      <select
        class="dog-name-select"
        :value="dogStore.activeDog?.id"
        @change="dogStore.setActiveDog($event.target.value)"
      >
        <option v-for="dog in dogStore.dogsWithTraits" :key="dog.id" :value="dog.id">{{ dog.name }}</option>
      </select>
    </label>

    <RouterLink to="/dogs" class="manage-link">프로필 관리</RouterLink>
  </div>
  <RouterLink v-else to="/dogs" class="dog-selector onboarding-link">🐕 반려견 등록하기</RouterLink>
</template>

<style scoped>
.dog-selector {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}
.dog-name-static {
  font-weight: 700;
  color: var(--color-text);
}
.dog-name-select-wrap {
  display: inline-flex;
}
.dog-name-select {
  font-size: var(--font-size-sm);
  font-weight: 700;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  min-height: 32px;
}
.manage-link {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-decoration: underline;
}
.onboarding-link {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
