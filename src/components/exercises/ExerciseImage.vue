<template>
  <figure class="exercise-image" :class="{ 'exercise-image--empty': !src }">
    <OptimizedImage
      :src="src"
      :alt="alt"
      :fallback-label="fallbackLabel"
      aspect-ratio="16 / 10"
      object-fit="contain"
      class="exercise-image__img"
    />
  </figure>
</template>

<script setup>
import OptimizedImage from '../ui/OptimizedImage.vue'

defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: 'Exercise illustration' },
  fallbackLabel: { type: String, default: 'Ilustración no disponible' }
})
</script>

<style scoped>
.exercise-image {
  width: min(100%, 320px);
  min-height: clamp(120px, 20vh, 170px);
  max-height: min(180px, 28vh);
  border-radius: var(--square-image-radius, 25px);
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  box-shadow: none;
}

.exercise-image__img {
  width: 100%;
  height: 100%;
  padding: 0.25rem;
  box-sizing: border-box;
  border-radius: var(--square-image-radius, 25px);
}
</style>
