<template>
  <section class="max-w-5xl mx-auto mt-2 space-y-2 px-2 md:px-4">
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
