<template>
  <section class="survey" aria-labelledby="survey-title">
    <div class="survey__top">
      <div>
        <p class="survey__kicker">Encuesta de aprendizaje</p>
        <h3 id="survey-title">{{ currentStep.title }}</h3>
      </div>
      <div class="survey__counter">{{ stepIndex + 1 }} / {{ steps.length }}</div>
    </div>

    <div class="survey__progress" aria-hidden="true">
      <span :style="{ width: progressWidth }"></span>
    </div>

    <p class="survey__intro">{{ currentStep.description }}</p>

    <div v-if="currentStep.id === 'child'" class="survey__panel">
      <div class="form-grid">
        <label>
          <span>Nombre del niño/a</span>
          <input
            :value="childName"
            class="form-input"
            autocomplete="given-name"
            @input="$emit('update:childName', $event.target.value)"
          />
        </label>

        <label>
          <span>Fecha de nacimiento</span>
          <input
            :value="childBirthdate"
            type="date"
            class="form-input"
            @input="$emit('update:childBirthdate', $event.target.value)"
          />
        </label>
      </div>
    </div>

    <div v-else-if="currentStep.id === 'level'" class="survey__panel">
      <div class="question-block">
        <p class="question-block__title">Nivel educativo</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in educationLevelOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.educationLevel, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.educationLevel, option.value)"
            @click="updateProfileField('educationLevel', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.educationLevel, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>

      <div class="question-block">
        <p class="question-block__title">Nivel lector actual</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in readingLevelOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.readingLevel, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.readingLevel, option.value)"
            @click="updateProfileField('readingLevel', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.readingLevel, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentStep.id === 'needs'" class="survey__panel">
      <div class="option-grid">
        <button
          v-for="(option, index) in learningNeedOptions"
          :key="option.value"
          type="button"
          :class="choiceClass(index, selectedLearningNeeds, option.value)"
          :aria-pressed="isSelected(selectedLearningNeeds, option.value)"
          @click="toggleLearningNeed(option.value)"
        >
          <span class="choice-button__mark" aria-hidden="true">
            {{ isSelected(selectedLearningNeeds, option.value) ? '✓' : '' }}
          </span>
          <span class="choice-button__label">{{ option.label }}</span>
        </button>
      </div>

      <label v-if="selectedLearningNeeds.includes(OTHER_NEED_VALUE)" class="other-need">
        <span>Especifica otra necesidad de apoyo</span>
        <input
          :value="otherLearningNeed"
          class="form-input"
          type="text"
          autocomplete="off"
          @input="$emit('update:otherLearningNeed', $event.target.value)"
        />
      </label>
    </div>

    <div v-else-if="currentStep.id === 'pace'" class="survey__panel">
      <div class="question-block">
        <p class="question-block__title">Tiempo de atención aproximado</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in attentionSpanOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.attentionSpan, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.attentionSpan, option.value)"
            @click="updateProfileField('attentionSpan', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.attentionSpan, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>

      <div class="question-block">
        <p class="question-block__title">Ritmo de aprendizaje</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in learningPaceOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.learningPace, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.learningPace, option.value)"
            @click="updateProfileField('learningPace', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.learningPace, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentStep.id === 'habits'" class="survey__panel">
      <div class="question-block">
        <p class="question-block__title">Comportamiento durante actividades</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in behaviorOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.behaviorTraits, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.behaviorTraits, option.value)"
            @click="toggleProfileArray('behaviorTraits', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.behaviorTraits, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>

      <div class="question-block">
        <p class="question-block__title">Hábitos de práctica</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in habitOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.habits, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.habits, option.value)"
            @click="toggleProfileArray('habits', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.habits, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="survey__panel">
      <div class="question-block">
        <p class="question-block__title">Gustos e intereses</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in interestOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.interests, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.interests, option.value)"
            @click="toggleProfileArray('interests', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.interests, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>

      <div class="question-block">
        <p class="question-block__title">Apoyos recomendados</p>
        <div class="option-grid">
          <button
            v-for="(option, index) in supportPreferenceOptions"
            :key="option.value"
            type="button"
            :class="choiceClass(index, safeLearningProfile.supportPreferences, option.value)"
            :aria-pressed="isSelected(safeLearningProfile.supportPreferences, option.value)"
            @click="toggleProfileArray('supportPreferences', option.value)"
          >
            <span class="choice-button__mark" aria-hidden="true">
              {{ isSelected(safeLearningProfile.supportPreferences, option.value) ? '✓' : '' }}
            </span>
            <span class="choice-button__label">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="survey__nav">
      <button class="survey-button survey-button--ghost" type="button" :disabled="stepIndex === 0" @click="previousStep">
        Anterior
      </button>
      <button class="survey-button survey-button--primary" type="button" @click="nextStep">
        {{ isLastStep ? 'Listo' : 'Siguiente' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  NO_NEEDS_VALUE,
  OTHER_NEED_VALUE,
  attentionSpanOptions,
  behaviorOptions,
  educationLevelOptions,
  habitOptions,
  interestOptions,
  learningNeedOptions,
  learningPaceOptions,
  normalizeLearningProfile,
  readingLevelOptions,
  supportPreferenceOptions
} from '../../data/onboardingQuestionnaire'

const props = defineProps({
  childName: { type: String, default: '' },
  childBirthdate: { type: String, default: '' },
  selectedLearningNeeds: { type: Array, default: () => [] },
  otherLearningNeed: { type: String, default: '' },
  learningProfile: { type: Object, default: () => ({}) },
  showChildFields: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:childName',
  'update:childBirthdate',
  'update:selectedLearningNeeds',
  'update:otherLearningNeed',
  'update:learningProfile'
])

const allSteps = [
  {
    id: 'child',
    title: 'Primero, conocemos al niño/a',
    description: 'Estos datos ayudan a ajustar la ruta inicial por edad.'
  },
  {
    id: 'level',
    title: '¿En qué punto de lectura está?',
    description: 'Elige el nivel educativo y lo que ya puede leer con comodidad.'
  },
  {
    id: 'needs',
    title: 'Necesidades de apoyo',
    description: 'Selecciona solo lo que quieras que la app tenga en cuenta. No hacemos diagnósticos.'
  },
  {
    id: 'pace',
    title: 'Ritmo y atención',
    description: 'Esto ayuda a decidir la duración de las sesiones y la dificultad inicial.'
  },
  {
    id: 'habits',
    title: 'Cómo aprende mejor',
    description: 'Cuéntanos cómo suele comportarse cuando practica lectura.'
  },
  {
    id: 'interests',
    title: 'Gustos y apoyos',
    description: 'Usaremos estas preferencias para que las actividades resulten más cercanas.'
  }
]

const stepIndex = ref(0)
const steps = computed(() => (props.showChildFields ? allSteps : allSteps.filter((step) => step.id !== 'child')))
const currentStep = computed(() => steps.value[stepIndex.value] || steps.value[0])
const isLastStep = computed(() => stepIndex.value >= steps.value.length - 1)
const progressWidth = computed(() => `${((stepIndex.value + 1) / steps.value.length) * 100}%`)
const safeLearningProfile = computed(() => normalizeLearningProfile(props.learningProfile))

function previousStep() {
  stepIndex.value = Math.max(0, stepIndex.value - 1)
}

function nextStep() {
  stepIndex.value = isLastStep.value ? 0 : stepIndex.value + 1
}

function isSelected(selected, value) {
  return Array.isArray(selected) ? selected.includes(value) : selected === value
}

function choiceClass(index, selected, value) {
  return [
    'choice-button',
    `choice-button--${(index % 5) + 1}`,
    { 'is-selected': isSelected(selected, value) }
  ]
}

function toggleLearningNeed(value) {
  const checked = !isSelected(props.selectedLearningNeeds, value)

  if (value === NO_NEEDS_VALUE && checked) {
    emit('update:selectedLearningNeeds', [NO_NEEDS_VALUE])
    emit('update:otherLearningNeed', '')
    return
  }

  const selected = new Set(props.selectedLearningNeeds)
  selected.delete(NO_NEEDS_VALUE)

  if (checked) selected.add(value)
  else selected.delete(value)

  if (value === OTHER_NEED_VALUE && !checked) {
    emit('update:otherLearningNeed', '')
  }

  emit('update:selectedLearningNeeds', [...selected])
}

function updateProfileField(field, value) {
  emit('update:learningProfile', {
    ...safeLearningProfile.value,
    [field]: value
  })
}

function toggleProfileArray(field, value) {
  const selected = new Set(safeLearningProfile.value[field] || [])
  const checked = !selected.has(value)

  if (checked) selected.add(value)
  else selected.delete(value)

  emit('update:learningProfile', {
    ...safeLearningProfile.value,
    [field]: [...selected]
  })
}
</script>

<style scoped>
.survey {
  display: grid;
  gap: 0.9rem;
  padding: clamp(1rem, 2.5vw, 1.25rem);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 222, 123, 0.45), transparent 28%),
    radial-gradient(circle at 92% 8%, rgba(172, 232, 251, 0.5), transparent 26%),
    linear-gradient(180deg, #fffdf4 0%, #ffffff 100%);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
}

.survey__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.survey__kicker {
  margin: 0 0 0.15rem;
  color: #2f7d47;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  color: #14210f;
  font-size: clamp(1.35rem, 3vw, 1.85rem);
  line-height: 1.05;
}

.survey__counter {
  min-width: 72px;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: #fcefb4;
  color: #203a00;
  font-weight: 800;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.survey__progress {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6f4df;
  box-shadow: inset 0 2px 4px rgba(15, 23, 42, 0.1);
}

.survey__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8fd47e, #ffde7b);
  transition: width 0.25s ease;
}

.survey__intro {
  margin: 0;
  max-width: 62ch;
  color: #475569;
  line-height: 1.45;
}

.survey__panel {
  display: grid;
  gap: 1.15rem;
  min-height: 280px;
  align-content: start;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: #334155;
  font-weight: 800;
}

.form-input {
  width: 100%;
  min-height: 56px;
  padding: 0.85rem 1rem;
  border: 2px solid rgba(74, 157, 97, 0.18);
  border-radius: 18px;
  background: #fff;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
}

.question-block {
  display: grid;
  gap: 0.65rem;
}

.question-block__title {
  margin: 0;
  color: #26350f;
  font-size: 1.05rem;
  font-weight: 800;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.choice-button {
  position: relative;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 0.58rem;
  align-items: center;
  min-height: 54px;
  padding: 0.62rem 0.72rem;
  border: 2px solid rgba(217, 168, 59, 0.26);
  border-radius: 16px;
  color: #15210f;
  font: inherit;
  font-weight: 800;
  font-size: 0.94rem;
  text-align: left;
  cursor: pointer;
  background: #fcefb4;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  transform: translateY(0);
  transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease, border-color 0.14s ease;
}

.choice-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 14px rgba(15, 23, 42, 0.1);
}

.choice-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.08);
}

.choice-button.is-selected {
  border-color: rgba(74, 157, 97, 0.38);
  background: #c9efc3;
  box-shadow: 0 0 0 3px rgba(143, 212, 126, 0.24);
}

.choice-button__mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.58);
  color: #2f7d47;
  font-size: 1rem;
  line-height: 1;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
}

.choice-button__label {
  min-width: 0;
  line-height: 1.1;
}

.other-need {
  max-width: 680px;
}

.survey__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
}

.survey-button {
  min-height: 54px;
  min-width: 150px;
  padding: 0.8rem 1.2rem;
  border: 0;
  border-radius: 18px;
  color: #0f172a;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.survey-button--primary {
  background: linear-gradient(145deg, #8fd47e, #7fc86c);
  color: #fff;
}

.survey-button--ghost {
  background: linear-gradient(145deg, #ffffff, #f8f7e8);
}

.survey-button:disabled {
  cursor: not-allowed;
  filter: grayscale(0.2);
  opacity: 0.55;
  transform: none;
}

@media (max-width: 760px) {
  .survey__top,
  .survey__nav {
    align-items: stretch;
    flex-direction: column;
  }

  .survey__counter {
    width: max-content;
  }

  .form-grid,
  .option-grid {
    grid-template-columns: 1fr;
  }

  .survey-button {
    width: 100%;
  }
}
</style>
