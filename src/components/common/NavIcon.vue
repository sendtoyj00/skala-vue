<script setup>
// 사이드바 내비 전용 라인 아이콘 세트. 이모티콘 대신 획 굵기가 통일된 오리지널 SVG를 쓴다 —
// 폰트마다 렌더링이 달라지는 이모티콘보다 어떤 환경에서도 동일하게 보이고, 브랜드 톤(currentColor)을
// 그대로 물려받는다.
defineProps({
  name: {
    type: String,
    required: true,
    validator: (v) => ['paw', 'dog', 'cloud', 'alert', 'book', 'leaf'].includes(v),
  },
  size: {
    type: [Number, String],
    default: 20,
  },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'paw'">
      <circle cx="12" cy="15.5" r="4.4" />
      <circle cx="5.3" cy="9.5" r="2.2" />
      <circle cx="9.6" cy="5.2" r="2.4" />
      <circle cx="14.4" cy="5.2" r="2.4" />
      <circle cx="18.7" cy="9.5" r="2.2" />
    </template>

    <template v-else-if="name === 'dog'">
      <circle cx="12" cy="13" r="5.2" />
      <path d="M8.2 8.6 6 4l3 3.2" />
      <path d="M15.8 8.6 18 4l-3 3.2" />
      <circle cx="10" cy="12.6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12.6" r="0.6" fill="currentColor" stroke="none" />
      <path d="M10.3 15.6c.6.6 2.8.6 3.4 0" />
    </template>

    <template v-else-if="name === 'cloud'">
      <path
        d="M7.5 17.5h9.3a3.7 3.7 0 0 0 .5-7.36 5.2 5.2 0 0 0-10 1.36 4 4 0 0 0 .2 6z"
      />
    </template>

    <template v-else-if="name === 'alert'">
      <path d="M12 4.2 21 19.5H3z" />
      <line x1="12" y1="10" x2="12" y2="14.2" />
      <circle cx="12" cy="16.8" r="0.55" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'book'">
      <rect x="5" y="3.6" width="14" height="16.8" rx="2.2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </template>

    <template v-else-if="name === 'leaf'">
      <path d="M6 18.5C6 10 12 4 20 4c0 8.5-6 14.5-14 14.5z" />
      <path d="M6.6 18c2-4.3 5.2-7.6 9.3-9.6" />
    </template>
  </svg>
</template>
