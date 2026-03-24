<template>
  <p v-if="status !== 'idle'" class="exercise-feedback" :class="feedbackClass" role="status" aria-live="polite">
    {{ feedbackText }}
  </p>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'idle' // idle | success | error
  },
  successText: {
    type: String,
    default: '¡Muy bien!'
  },
  errorText: {
    type: String,
    default: 'Inténtalo otra vez con calma.'
  }
})

const feedbackText = computed(() => {
  if (props.status === 'success') return props.successText
  if (props.status === 'error') return props.errorText
  return ''
})

const feedbackClass = computed(() => {
  if (props.status === 'success') return 'exercise-feedback--success'
  if (props.status === 'error') return 'exercise-feedback--error'
  return ''
})
</script>

<style scoped>
.exercise-feedback {
  width: min(100%, 680px);
  margin: 0.35rem auto 0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 1.02rem;
  line-height: 1.4;
  font-weight: 700;
  text-align: center;
  border: 1px solid transparent;
}

.exercise-feedback--success {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.exercise-feedback--error {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}
</style>
