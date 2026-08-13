<script setup>
// 사진이 없을 때가 기본이다 — 이니셜·기본 아이콘으로 자리를 유지한다(design_architecture.md 4.5).
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  photoUrl: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md'
    validator: (v) => ['sm', 'md'].includes(v),
  },
})

const initial = computed(() => (props.name ? props.name.trim().charAt(0) : '🐾'))
</script>

<template>
  <span class="dog-avatar" :class="[`size-${size}`, { 'has-photo': photoUrl }]">
    <img v-if="photoUrl" :src="photoUrl" :alt="`${name} 사진`" />
    <span v-else aria-hidden="true">{{ initial }}</span>
  </span>
</template>

<style scoped>
.dog-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--color-primary-surface);
  color: var(--color-primary);
  font-weight: 700;
  overflow: hidden;
}
.dog-avatar.size-md {
  width: 40px;
  height: 40px;
  font-size: var(--font-size-md);
}
.dog-avatar.size-sm {
  width: 28px;
  height: 28px;
  font-size: var(--font-size-sm);
}
.dog-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
