import { createRouter, createWebHistory } from 'vue-router'
import WalkHomeView from '../views/WalkHomeView.vue'

// 정적 라우트를 동적 라우트보다 먼저 선언한다(alerts가 :cityId로 매칭되지 않게) — 유지.
// / 는 판정(WalkHome)으로 교체되고, 지역 목록은 /weather로 강등된다(마이그레이션 7단계,
// vue_architecture.md 8.2 목표 라우트). 링크는 지우지 않는다 — 강등이지 폐기가 아니다.
const routes = [
  {
    path: '/',
    name: 'WalkHome',
    component: WalkHomeView,
  },
  {
    path: '/weather',
    name: 'WeatherHome',
    component: () => import('../views/WeatherHomeView.vue'),
  },
  {
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    path: '/weather/alerts',
    name: 'WeatherAlerts',
    component: () => import('../views/WeatherAlertView.vue'),
  },
  {
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  // dogStore 선행 완료 — 8.2절 목표 라우트 실제 배치. 정적 라우트(/dogs)를 동적 라우트
  // (/dogs/:dogId)보다 먼저 선언한다(8.3).
  {
    path: '/dogs',
    name: 'DogList',
    component: () => import('../views/DogListView.vue'),
  },
  {
    path: '/dogs/:dogId',
    name: 'DogProfile',
    component: () => import('../views/DogProfileView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
