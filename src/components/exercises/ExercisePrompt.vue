<template>
  <div class="exercise-prompt" role="group" :aria-label="ariaLabel">
    <p v-if="eyebrow" class="exercise-prompt__eyebrow">{{ eyebrow }}</p>
    <h2 class="exercise-prompt__title">{{ title }}</h2>
    <p v-if="instruction" class="exercise-prompt__instruction">
      <span class="exercise-prompt__cue" aria-hidden="true">{{ cueIcon }}</span>
      <span>{{ instruction }}</span>
    </p>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  instruction: { type: String, default: '' },
  cueIcon: { type: String, default: '👉' },
  ariaLabel: { type: String, default: 'Exercise prompt' }
})
</script>

<style scoped>
.exercise-prompt {
  width: min(100%, 680px);
  margin: 0 auto;
  text-align: center;
  display: grid;
  gap: 0.72rem;
  font-family: var(--font-readable, 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif);
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
  font-size: clamp(1.4rem, 5.8vw, 2rem);
  line-height: 1.56;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.01em;
  max-width: 22ch;
  margin-inline: auto;
  text-wrap: balance;
}

.exercise-prompt__instruction {
  margin: 0;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.38rem;
  font-size: clamp(1.02rem, 3.8vw, 1.2rem);
  line-height: 1.58;
  color: #1e293b;
  max-width: 26ch;
  margin-inline: auto;
}

.exercise-prompt__cue {
  font-size: 1.05em;
  transform: translateY(0.06em);
}
</style>
