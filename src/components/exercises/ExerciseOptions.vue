<template>
  <div class="exercise-options" role="group" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="optionKey(option)"
      class="exercise-options__button"
      type="button"
      @click="$emit('select', option)"
    >
      {{ optionLabel(option) }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  options: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: 'Exercise options' }
})

defineEmits(['select'])

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
  gap: 0.85rem;
}

.exercise-options__button {
  width: 100%;
  min-height: 64px;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 2px solid #cfd8e3;
  background: #ffffff;
  color: #0f172a;
  font-size: clamp(1.05rem, 2.2vw, 1.18rem);
  line-height: 1.35;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
}

.exercise-options__button:hover {
  border-color: #0ea5e9;
  background: #f7fcff;
}

.exercise-options__button:focus-visible {
  outline: 3px solid #0ea5e9;
  outline-offset: 2px;
}

.exercise-options__button:active {
  transform: translateY(1px);
}
</style>
