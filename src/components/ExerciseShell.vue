<template>
  <section class="exercise-shell max-w-5xl mx-auto mt-2 space-y-2 px-2 md:px-4">
    <div class="text-center">
      <h2 class="text-lg font-bold">{{ title }}</h2>
      <p v-if="instructions" class="text-gray-600 text-sm leading-snug">{{ instructions }}</p>
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  instructions: String,
  characterImg: String,
  levelTitle: String,
  stageLabel: String,
  stars: Number,
  points: Number
})
</script>

<style scoped>
.exercise-shell {
  font-family: 'Andika', 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.035em;
}

.exercise-shell h2 {
  font-weight: 600;
}
</style>
