import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { toTraits } from '@/domain/breeds'

// 반려견 프로필의 단일 출처(vue_architecture.md 4.5, service_architecture.md 5절).
// 로그인 없이 localStorage로 완전히 동작한다(service_architecture.md 7절) — 로그인 시 서버
// 동기화는 [결정 필요]로 남는다.
//
// 판정 함수는 이 Store를 직접 읽지 않는다. 두 Store(weather×dog)의 결합은
// composables/useWalkVerdict.js가 담당한다(vue_architecture.md 5.2) — Store 간 참조를 만들면
// 순환 참조가 설계상 가능해진다.

const STORAGE_KEY = 'walssi.dogs.v1'
const ACTIVE_ID_KEY = 'walssi.activeDogId.v1'

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장 실패(용량 초과·프라이빗 모드 등)는 화면 동작을 막지 않는다 — 조용히 무시한다.
  }
}

// 다견 기본 판정 대상 = 가장 취약한 개체(service_architecture.md 4.7). 취약 축(단두종·이중모·
// 유노령·소형)이 많을수록 점수가 높다 — walkRules.js의 isVulnerable(boolean)보다 다견 정렬에는
// 더 세밀한 점수가 필요해 이 파일에 별도로 둔다(판정 자체에는 쓰이지 않는, 정렬 전용 값).
function vulnerabilityScore(traits) {
  let score = 0
  if (traits.brachycephalic) score += 2
  if (traits.coatType === 'double') score += 1
  if (traits.ageClass !== 'adult') score += 2
  if (traits.weightClass === 'small') score += 1
  return score
}

export const useDogStore = defineStore('dog', () => {
  // state
  const dogs = ref([])
  const activeDogId = ref(null)

  // getters
  const hasProfile = computed(() => dogs.value.length > 0)

  const dogsWithTraits = computed(() =>
    dogs.value.map((dog) => ({
      ...dog,
      traits: toTraits(dog.breedId, dog.ageClass, dog.weightKg, dog.traitsOverride),
    })),
  )

  const mostVulnerableDog = computed(() => {
    if (dogsWithTraits.value.length === 0) return null
    return [...dogsWithTraits.value].sort(
      (a, b) => vulnerabilityScore(b.traits) - vulnerabilityScore(a.traits),
    )[0]
  })

  // activeDogId가 없거나 삭제된 개체를 가리키면 최취약 개체로 대체한다 — 소비처가
  // activeDogId의 존재 여부를 몰라도 되게 한다(vue_architecture.md 4.5).
  const activeDog = computed(() => {
    if (activeDogId.value) {
      const found = dogsWithTraits.value.find((d) => d.id === activeDogId.value)
      if (found) return found
    }
    return mostVulnerableDog.value
  })

  // actions
  function addDog(profile) {
    const id = `dog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    dogs.value.push({
      id,
      name: profile.name?.trim() || '이름 없음',
      breedId: profile.breedId,
      ageClass: profile.ageClass,
      weightKg: profile.weightKg ?? null,
      traitsOverride: profile.traitsOverride ?? {},
    })
    if (dogs.value.length === 1) activeDogId.value = id
    return id
  }

  function updateDog(dogId, patch) {
    const target = dogs.value.find((d) => d.id === dogId)
    if (!target) return
    Object.assign(target, patch)
  }

  function removeDog(dogId) {
    dogs.value = dogs.value.filter((d) => d.id !== dogId)
    if (activeDogId.value === dogId) activeDogId.value = null
  }

  function setActiveDog(dogId) {
    activeDogId.value = dogId
  }

  function restoreDogs() {
    const savedDogs = loadFromStorage(STORAGE_KEY)
    if (Array.isArray(savedDogs)) dogs.value = savedDogs
    const savedActiveId = loadFromStorage(ACTIVE_ID_KEY)
    if (savedActiveId) activeDogId.value = savedActiveId
  }

  // 영속성(vue_architecture.md 4.8) — pinia-plugin-persistedstate 미설치이므로 watch로 직접
  // 구현한다. deep watch로 CRUD 전부를 커버한다.
  watch(dogs, (value) => saveToStorage(STORAGE_KEY, value), { deep: true })
  watch(activeDogId, (value) => saveToStorage(ACTIVE_ID_KEY, value))

  return {
    dogs,
    activeDogId,
    hasProfile,
    dogsWithTraits,
    mostVulnerableDog,
    activeDog,
    addDog,
    updateDog,
    removeDog,
    setActiveDog,
    restoreDogs,
  }
})
