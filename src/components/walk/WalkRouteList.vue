<script setup>
import { ref } from 'vue'
import WalkRouteCard from './WalkRouteCard.vue'
import RouteMapView from './RouteMapView.vue'

defineProps({
  routes: { type: Array, required: true },
  selectedRouteId: { type: String, default: null },
  center: { type: Object, required: true }, // {lat, lon}
})

const emit = defineEmits(['select'])

const showMap = ref(false)

function toggleMap() {
  showMap.value = !showMap.value
}
</script>

<template>
  <section class="route-section" aria-labelledby="route-section-title">
    <div class="section-header">
      <h2 id="route-section-title">오늘의 산책 경로</h2>
      <el-button size="small" round @click="toggleMap">
        {{ showMap ? '지도 접기' : '🗺️ 지도에서 경로 보기' }}
      </el-button>
    </div>

    <RouteMapView v-if="showMap" :center="center" :routes="routes" :selected-route-id="selectedRouteId" />

    <div class="route-list">
      <WalkRouteCard
        v-for="route in routes"
        :key="route.id"
        :route="route"
        :is-selected="route.id === selectedRouteId"
        @select="(id) => emit('select', id)"
      />
    </div>
  </section>
</template>

<style scoped>
.route-section {
  margin-bottom: var(--space-4);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.section-header h2 {
  margin: 0;
  font-size: var(--font-size-md);
}
.route-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
