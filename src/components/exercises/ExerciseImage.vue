<template>
  <figure class="exercise-image" :class="{ 'exercise-image--empty': !src || failed }">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      class="exercise-image__img"
      @error="failed = true"
    />
    <figcaption v-else class="exercise-image__fallback">
      <span class="exercise-image__fallback-icon" aria-hidden="true">🖼️</span>
      <span>{{ fallbackLabel }}</span>
    </figcaption>
  </figure>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: 'Exercise illustration' },
  fallbackLabel: { type: String, default: 'Ilustración no disponible' }
})

const failed = ref(false)

watch(
  () => props.src,
  () => {
    failed.value = false
  }
)
</script>

<style scoped>
.exercise-image {
  width: min(100%, 460px);
  min-height: 200px;
  border-radius: 14px;
  border: 1px solid #cfd8e3;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.exercise-image__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  padding: 0.4rem;
}

.exercise-image__fallback {
  min-height: 180px;
  width: 100%;
  display: grid;
  place-items: center;
  gap: 0.35rem;
  color: #334155;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  padding: 1rem;
}

.exercise-image__fallback-icon {
  font-size: 1.4rem;
}
</style>
