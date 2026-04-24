<template>
  <div class="exercise-options" role="group" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="optionKey(option)"
      :class="[
        'exercise-options__button',
        {
          'exercise-options__button--pressed': pressedOptionKey === optionKey(option),
          'exercise-options__button--correct': status === 'ok' && isCorrectOption(option),
          'exercise-options__button--incorrect': status === 'fail' && selectedOptionKey === optionKey(option) && !isCorrectOption(option)
        }
      ]"
      type="button"
      @pointerdown="pressedOptionKey = optionKey(option)"
      @pointerup="pressedOptionKey = null"
      @pointercancel="pressedOptionKey = null"
      @mouseleave="pressedOptionKey = null"
      @mouseenter="$emit('preview', option)"
      @focus="$emit('preview', option)"
      @click="handleSelect(option)"
    >
      {{ optionLabel(option) }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  options: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: 'Exercise options' },
  status: { type: String, default: 'pending' },
  correctAnswers: { type: Array, default: () => [] }
})

const emit = defineEmits(['select', 'preview'])
const pressedOptionKey = ref(null)
const selectedOptionKey = ref(null)

function optionLabel(option) {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option)
  }
  if (!option || typeof option !== 'object') {
    return ''
  }
  return (
    option.label || option.text || option.word || option.title || option.value || option.answer || ''
  )
}

function optionKey(option) {
  const label = optionLabel(option)
  return label || JSON.stringify(option)
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

const normalizedCorrectAnswers = computed(() => {
  const list = Array.isArray(props.correctAnswers) ? props.correctAnswers : []
  return new Set(list.map(normalize).filter(Boolean))
})

function isCorrectOption(option) {
  const labels = [
    optionLabel(option),
    option?.correct,
    option?.answer,
    option?.expectedAnswer
  ]
  return labels.some((entry) => normalizedCorrectAnswers.value.has(normalize(entry)))
}

function handleSelect(option) {
  selectedOptionKey.value = optionKey(option)
  emit('select', option)
}

watch(
  () => props.options,
  () => {
    selectedOptionKey.value = null
  }
)
</script>

<style scoped>
.exercise-options {
  width: min(100%, 760px);
  margin: 0 auto;
  display: grid;
  gap: 0.95rem;
  font-family: var(--font-readable, 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif);
}

.exercise-options__button {
  width: 100%;
  min-height: 68px;
  padding: 1.05rem 1.1rem;
  border-radius: 16px;
  border: 2px solid #b7cee6;
  background: linear-gradient(180deg, #f7fbff 0%, #e8f3ff 100%);
  color: #0f172a;
  font-size: clamp(1.24rem, 4.9vw, 1.46rem);
  line-height: 1.5;
  font-weight: 750;
  text-align: center;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.75);
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
  transform: scale(1);
}

.exercise-options__button:hover {
  border-color: #0ea5e9;
  background: linear-gradient(180deg, #ffffff 0%, #d9ecff 100%);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.exercise-options__button:focus-visible {
  outline: 3px solid #0ea5e9;
  outline-offset: 2px;
}

.exercise-options__button:active {
  transform: scale(0.95);
}

.exercise-options__button--pressed {
  transform: scale(0.95);
}

.exercise-options__button--correct {
  border-color: #b8d956;
  background: linear-gradient(135deg, #c5ef5f 0%, #d8f86d 45%, #ffe27a 100%);
  color: #0f172a;
  box-shadow: 0 10px 20px rgba(197, 239, 95, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.exercise-options__button--incorrect {
  border-color: #ea7a14;
  background: linear-gradient(180deg, #ffb347 0%, #ff7a00 100%);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(234, 122, 20, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
</style>
