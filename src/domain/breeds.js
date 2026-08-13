// 견종 → 특성 4축(DogTraits) 변환. Vue를 모르는 순수 매핑이며 walkRules.js는 이 파일을
// 거치지 않고는 견종 이름을 볼 수 없다(service_architecture.md 4.4, vue_architecture.md 5.4).
//
// 판정 함수는 견종 이름을 모른다 — 200종을 직접 매핑하면 조건이 늘수록 분기가 기하급수로
// 늘어난다. 견종은 여기서 4개 축(단두종·모질·체중대·연령대)으로 환원된 뒤에만 walkRules.js에
// 도달한다.
//
// [결정 필요](service_architecture.md 6절): 견종 마스터 데이터의 출처·라이선스, weightClass
// 경계값(kg). 지금은 최소 집합을 번들 상수로 둔다(9.3 "최소 집합은 상수로 번들에 포함").

export const AGE_CLASSES = ['puppy', 'adult', 'senior']
export const WEIGHT_CLASSES = ['small', 'medium', 'large']
export const COAT_TYPES = ['single', 'double']

// 미등록 견종의 기본값(안전 쪽으로 기울이지 않는 "중립" 기본값 — 취약 축은 개별 축 선택으로
// 사용자가 직접 보정한다). service_architecture.md 4.4 "오류가 아니라 기본값 + 안내".
export const DEFAULT_TRAITS = {
  brachycephalic: false,
  coatType: 'single',
  weightClass: 'medium',
  ageClass: 'adult',
}

// 변환표는 한 곳에만 둔다(service_architecture.md 4.4). 최소 집합 — 국내에서 자주 검색되는
// 견종 위주로 시작하고, /breeds 엔드포인트(vue_architecture.md 9.3)가 생기면 이 상수는
// "네트워크 실패 시 폴백"으로 격하된다.
export const BREED_LIST = [
  { id: 'poodle_small', name: '푸들(소형)', brachycephalic: false, coatType: 'double', weightClass: 'small' },
  { id: 'maltese', name: '말티즈', brachycephalic: false, coatType: 'single', weightClass: 'small' },
  { id: 'pomeranian', name: '포메라니안', brachycephalic: false, coatType: 'double', weightClass: 'small' },
  { id: 'bichon', name: '비숑 프리제', brachycephalic: false, coatType: 'double', weightClass: 'small' },
  { id: 'shih_tzu', name: '시츄', brachycephalic: true, coatType: 'single', weightClass: 'small' },
  { id: 'pug', name: '퍼그', brachycephalic: true, coatType: 'single', weightClass: 'small' },
  { id: 'french_bulldog', name: '프렌치 불독', brachycephalic: true, coatType: 'single', weightClass: 'medium' },
  { id: 'english_bulldog', name: '불독', brachycephalic: true, coatType: 'single', weightClass: 'medium' },
  { id: 'jindo', name: '진돗개', brachycephalic: false, coatType: 'double', weightClass: 'medium' },
  { id: 'corgi', name: '웰시코기', brachycephalic: false, coatType: 'double', weightClass: 'medium' },
  { id: 'beagle', name: '비글', brachycephalic: false, coatType: 'single', weightClass: 'medium' },
  { id: 'border_collie', name: '보더콜리', brachycephalic: false, coatType: 'double', weightClass: 'medium' },
  { id: 'golden_retriever', name: '골든 리트리버', brachycephalic: false, coatType: 'double', weightClass: 'large' },
  { id: 'labrador', name: '래브라도 리트리버', brachycephalic: false, coatType: 'double', weightClass: 'large' },
  { id: 'siberian_husky', name: '시베리안 허스키', brachycephalic: false, coatType: 'double', weightClass: 'large' },
  { id: 'mixed', name: '믹스견 / 직접 선택', brachycephalic: false, coatType: 'single', weightClass: 'medium' },
]

export function findBreedById(breedId) {
  return BREED_LIST.find((b) => b.id === breedId) ?? null
}

// weightClass 경계값(kg) — [결정 필요](service_architecture.md 6절)로 남은 항목의 잠정치.
// 실측 체중이 있으면 견종 기본값보다 우선한다 — 같은 견종이라도 개체 편차가 크다.
export function weightKgToClass(weightKg) {
  if (weightKg == null || Number.isNaN(weightKg)) return null
  if (weightKg < 10) return 'small'
  if (weightKg <= 25) return 'medium'
  return 'large'
}

// breedId + ageClass + weightKg(직접 실측, 견종표보다 우선) → DogTraits 4축.
// traitsOverride가 있으면 축 단위로 덮어쓴다 — 믹스견·특이 개체는 변환표가 틀릴 수 있고
// "사용자가 자기 개를 가장 잘 안다"(service_architecture.md 6절 traitsOverride 근거).
export function toTraits(breedId, ageClass, weightKg, traitsOverride = {}) {
  const breed = findBreedById(breedId)
  const base = breed
    ? { brachycephalic: breed.brachycephalic, coatType: breed.coatType, weightClass: breed.weightClass }
    : { brachycephalic: DEFAULT_TRAITS.brachycephalic, coatType: DEFAULT_TRAITS.coatType, weightClass: DEFAULT_TRAITS.weightClass }

  const weightClass = weightKgToClass(weightKg) ?? base.weightClass

  return {
    ...base,
    weightClass,
    ageClass: ageClass && AGE_CLASSES.includes(ageClass) ? ageClass : DEFAULT_TRAITS.ageClass,
    ...traitsOverride,
  }
}

export function isKnownBreed(breedId) {
  return findBreedById(breedId) !== null
}
