<script setup>
// 프로필 입력 폼. 필수 3개(견종·연령대·체중)를 먼저 보여주고 선택 항목(이름·사진)은 접어둔다
// (design_architecture.md 3.3 DogProfileView 배치 요지 — 온보딩 이탈 지점을 줄인다).
// 믹스견은 4축을 사용자가 직접 선택할 수 있게 한다(service_architecture.md 4.4 "믹스견" 결정).
import { reactive, computed } from 'vue'
import { BREED_LIST, AGE_CLASSES, COAT_TYPES } from '@/domain/breeds'

const props = defineProps({
  initial: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: '등록하기',
  },
})

const emit = defineEmits(['submit-profile', 'cancel'])

const AGE_LABEL = { puppy: '유견(1세 미만)', adult: '성견(1~7세)', senior: '노령견(7세 이상)' }
const COAT_LABEL = { single: '단모(홑겹)', double: '이중모' }

const form = reactive({
  name: props.initial?.name ?? '',
  breedId: props.initial?.breedId ?? BREED_LIST[0].id,
  ageClass: props.initial?.ageClass ?? 'adult',
  weightKg: props.initial?.weightKg ?? null,
  brachycephalic: props.initial?.traitsOverride?.brachycephalic ?? false,
  coatType: props.initial?.traitsOverride?.coatType ?? '',
})

const isMixed = computed(() => form.breedId === 'mixed')

function handleSubmit() {
  if (!form.ageClass || form.weightKg == null || form.weightKg <= 0) return

  const traitsOverride = {}
  if (isMixed.value) {
    traitsOverride.brachycephalic = form.brachycephalic
    if (form.coatType) traitsOverride.coatType = form.coatType
  }

  emit('submit-profile', {
    name: form.name,
    breedId: form.breedId,
    ageClass: form.ageClass,
    weightKg: Number(form.weightKg),
    traitsOverride,
  })
}
</script>

<template>
  <form class="dog-profile-form" @submit.prevent="handleSubmit">
    <!-- 필수 1: 견종 -->
    <div class="field">
      <label for="dog-breed">견종</label>
      <select id="dog-breed" v-model="form.breedId" required>
        <option v-for="breed in BREED_LIST" :key="breed.id" :value="breed.id">{{ breed.name }}</option>
      </select>
      <p v-if="isMixed" class="field-hint">믹스견은 아래에서 특성을 직접 선택할 수 있어요.</p>
    </div>

    <div v-if="isMixed" class="field field-sub">
      <span class="field-sublabel">단두종인가요?</span>
      <label class="inline-check">
        <input type="checkbox" v-model="form.brachycephalic" />
        코가 짧고 납작한 편이에요(단두종)
      </label>
      <span class="field-sublabel">털 종류</span>
      <select v-model="form.coatType">
        <option value="">모르겠어요(기본값 사용)</option>
        <option v-for="type in COAT_TYPES" :key="type" :value="type">{{ COAT_LABEL[type] }}</option>
      </select>
    </div>

    <!-- 필수 2: 연령대 -->
    <div class="field">
      <label for="dog-age">연령대</label>
      <select id="dog-age" v-model="form.ageClass" required>
        <option v-for="age in AGE_CLASSES" :key="age" :value="age">{{ AGE_LABEL[age] }}</option>
      </select>
    </div>

    <!-- 필수 3: 체중 -->
    <div class="field">
      <label for="dog-weight">체중(kg)</label>
      <input id="dog-weight" v-model.number="form.weightKg" type="number" min="0.5" max="90" step="0.1" required placeholder="예: 6.5" />
    </div>

    <!-- 선택 항목 — 접어둔다 -->
    <details class="optional-fields">
      <summary>이름 등 선택 항목 (선택)</summary>
      <div class="field">
        <label for="dog-name">이름</label>
        <input id="dog-name" v-model="form.name" type="text" placeholder="예: 초코" />
      </div>
      <p class="field-hint">사진 등록은 다음 업데이트에서 지원할 예정이에요.</p>
    </details>

    <div class="form-actions">
      <button type="submit" class="submit-btn">{{ submitLabel }}</button>
      <button v-if="initial" type="button" class="cancel-btn" @click="emit('cancel')">취소</button>
    </div>
  </form>
</template>

<style scoped>
.dog-profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.field label,
.field-sublabel {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text);
}
.field select,
.field input[type='text'],
.field input[type='number'] {
  padding: var(--space-2);
  min-height: 44px;
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
}
.field-sub {
  padding: var(--space-3);
  background: var(--color-surface-sunken);
  border-radius: var(--radius-md);
}
.inline-check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  min-height: 44px;
}
.inline-check input {
  width: 20px;
  height: 20px;
}
.field-hint {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.optional-fields {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
}
.optional-fields summary {
  cursor: pointer;
  padding: var(--space-2) 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  min-height: 44px;
  display: flex;
  align-items: center;
}
.optional-fields .field {
  margin: var(--space-2) 0;
}
.form-actions {
  display: flex;
  gap: var(--space-3);
}
.submit-btn,
.cancel-btn {
  min-height: 44px;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--font-size-sm);
  cursor: pointer;
}
.submit-btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  flex: 1;
}
.cancel-btn {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
</style>
