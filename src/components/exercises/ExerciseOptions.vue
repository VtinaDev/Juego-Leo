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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--font-readable, 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif);
}

.exercise-options__button {
  width: auto;
  min-width: clamp(96px, 24vw, 180px);
  max-width: min(100%, 320px);
  min-height: 56px;
  padding: 0.68rem 1.05rem;
  border-radius: 18px;
  border: 2px solid rgba(14, 165, 233, 0.22);
  background: #ffffff;
  color: #0f172a;
  font-size: clamp(1.14rem, 4.4vw, 1.38rem);
  line-height: 1.18;
  font-weight: 900;
  text-align: center;
  box-shadow: 0 8px 0 rgba(14, 165, 233, 0.16), 0 13px 20px rgba(15, 23, 42, 0.1);
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
  transform: scale(1);
}

.exercise-options__button:hover {
  border-color: #0ea5e9;
  background: #f8fdff;
  transform: translateY(-2px);
  box-shadow: 0 10px 0 rgba(14, 165, 233, 0.18), 0 16px 24px rgba(14, 165, 233, 0.16);
}

.exercise-options__button:focus-visible {
  outline: 3px solid #0ea5e9;
  outline-offset: 2px;
}

.exercise-options__button:active {
  transform: translateY(5px) scale(0.99);
  box-shadow: 0 3px 0 rgba(14, 165, 233, 0.18), 0 8px 12px rgba(15, 23, 42, 0.1);
}

.exercise-options__button--pressed {
  transform: translateY(5px) scale(0.99);
  box-shadow: 0 3px 0 rgba(14, 165, 233, 0.18), 0 8px 12px rgba(15, 23, 42, 0.1);
}

.exercise-options__button--correct {
  border-color: rgba(132, 204, 22, 0.42);
  background: #f0fdf4;
  color: #0f172a;
  box-shadow: 0 8px 0 rgba(132, 204, 22, 0.22), 0 14px 22px rgba(132, 204, 22, 0.18);
}

.exercise-options__button--incorrect {
  border-color: rgba(245, 158, 11, 0.42);
  background: #fff8db;
  color: #334155;
  box-shadow: 0 8px 0 rgba(245, 158, 11, 0.18), 0 14px 22px rgba(245, 158, 11, 0.12);
}

@media (max-width: 640px) {
  .exercise-options {
    gap: 0.55rem;
  }
  .exercise-options__button {
    min-width: min(46%, 170px);
    min-height: 52px;
    padding: 0.58rem 0.72rem;
  }
}
</style>
