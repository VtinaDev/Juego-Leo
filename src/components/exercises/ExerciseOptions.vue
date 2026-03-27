<template>
  <div class="exercise-options" role="group" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="optionKey(option)"
      :class="[
        'exercise-options__button',
        { 'exercise-options__button--pressed': pressedOptionKey === optionKey(option) }
      ]"
      type="button"
      @pointerdown="pressedOptionKey = optionKey(option)"
      @pointerup="pressedOptionKey = null"
      @pointercancel="pressedOptionKey = null"
      @mouseleave="pressedOptionKey = null"
      @click="$emit('select', option)"
    >
      {{ optionLabel(option) }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  options: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: 'Exercise options' }
})

defineEmits(['select'])
const pressedOptionKey = ref(null)

function optionLabel(option) {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option)
  }
  if (!option || typeof option !== 'object') {
    return ''
  }
  return (
    option.label || option.text || option.word || option.title || option.value || ''
  )
}

function optionKey(option) {
  const label = optionLabel(option)
  return label || JSON.stringify(option)
}
</script>

<style scoped>
.exercise-options {
  width: min(100%, 700px);
  margin: 0 auto;
  display: grid;
  gap: 0.95rem;
  font-family: var(--font-readable, 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif);
}

.exercise-options__button {
  width: 100%;
  min-height: 60px;
  padding: 0.95rem 1rem;
  border-radius: 16px;
  border: 2px solid #cfd8e3;
  background: #ffffff;
  color: #0f172a;
  font-size: clamp(1.12rem, 4.4vw, 1.3rem);
  line-height: 1.5;
  font-weight: 750;
  text-align: center;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  transform: scale(1);
}

.exercise-options__button:hover {
  border-color: #0ea5e9;
  background: #f7fcff;
  box-shadow: 0 8px 16px rgba(14, 165, 233, 0.16);
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
</style>
