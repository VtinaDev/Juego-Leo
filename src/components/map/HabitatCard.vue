<template>
  <article class="habitat-card" :class="{ 'habitat-card--locked': level.locked }" tabindex="0">
    <div class="habitat-card__media">
      <img class="habitat-card__bg" :src="level.habitat" :alt="`Hábitat ${level.title}`" loading="lazy" />
      <img class="habitat-card__character" :src="level.character" :alt="`Personaje ${level.id}`" loading="lazy" />
    </div>

    <LevelStation
      :title="level.title"
      :description="level.description"
      :stars="level.stars"
      :locked="level.locked"
      @enter="$emit('enter', level)"
    />
  </article>
</template>

<script setup>
import LevelStation from './LevelStation.vue'

defineProps({
  level: {
    type: Object,
    required: true
  }
})

defineEmits(['enter'])
</script>

<style scoped>
.habitat-card {
  width: clamp(220px, 72vw, 280px);
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f2f8ff 100%);
  border: 2px solid rgba(147, 197, 253, 0.45);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.13);
  padding: 0.72rem;
  display: grid;
  gap: 0.72rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  outline: none;
  animation: cardIn 0.45s ease both;
}

.habitat-card__media {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  aspect-ratio: 1.44 / 1;
  background: #dbeafe;
}

.habitat-card__bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.habitat-card__character {
  position: absolute;
  right: 4%;
  bottom: 0;
  width: 45%;
  max-width: 130px;
  object-fit: contain;
  filter: drop-shadow(0 9px 12px rgba(15, 23, 42, 0.2));
  animation: characterIdle 2.8s ease-in-out infinite;
}

.habitat-card:hover,
.habitat-card:focus-visible {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 18px 28px rgba(15, 23, 42, 0.2);
}

.habitat-card--locked {
  opacity: 0.72;
  filter: grayscale(0.16);
}

.habitat-card--locked:hover,
.habitat-card--locked:focus-visible {
  transform: none;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.13);
}

@keyframes characterIdle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@media (min-width: 920px) {
  .habitat-card {
    width: auto;
    min-width: 0;
  }
}

@keyframes cardIn {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .habitat-card,
  .habitat-card__character {
    animation: none;
    transition: none;
  }
}
</style>
