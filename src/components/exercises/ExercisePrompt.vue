<template>
  <div class="exercise-prompt" role="group" :aria-label="ariaLabel">
    <p v-if="eyebrow" class="exercise-prompt__eyebrow">{{ eyebrow }}</p>
    <h2 class="exercise-prompt__title">{{ title }}</h2>
    <p v-if="instruction" class="exercise-prompt__instruction">{{ instruction }}</p>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  instruction: { type: String, default: '' },
  ariaLabel: { type: String, default: 'Exercise prompt' }
})
</script>

<style scoped>
.exercise-prompt {
  width: min(100%, 680px);
  margin: 0 auto;
  text-align: center;
  display: grid;
  gap: 0.55rem;
}

.exercise-prompt__eyebrow {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #075985;
}

.exercise-prompt__title {
  margin: 0;
  font-size: clamp(1.25rem, 2.6vw, 1.7rem);
  line-height: 1.4;
  font-weight: 800;
  color: #0f172a;
}

.exercise-prompt__instruction {
  margin: 0;
  font-size: clamp(1.02rem, 2.1vw, 1.18rem);
  line-height: 1.5;
  color: #1e293b;
}
</style>
