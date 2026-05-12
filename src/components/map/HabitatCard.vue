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

    <div v-if="level.stages?.length" class="habitat-card__stages" aria-label="Etapas disponibles">
      <component
        :is="stage.locked ? 'button' : 'RouterLink'"
        v-for="stage in level.stages"
        :key="stage.id"
        class="stage-chip"
        :class="{
          'stage-chip--current': stage.current,
          'stage-chip--complete': stage.complete,
          'stage-chip--locked': stage.locked
        }"
        :to="stage.locked ? undefined : stage.route"
        :disabled="stage.locked"
        type="button"
      >
        <span>Etapa {{ stage.number }}</span>
        <strong>{{ stage.title }}</strong>
        <small>{{ stage.count }} ejercicios</small>
      </component>
    </div>
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
  width: var(--habitat-card-width, clamp(220px, 72vw, 280px));
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f2f8ff 100%);
  box-shadow: none;
  padding: 0.72rem;
  display: grid;
  gap: 0.72rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  outline: none;
  animation: cardIn 0.45s ease both;
}

.habitat-card:not(.habitat-card--locked) {
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.22);
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
  box-shadow: 0 18px 28px rgba(34, 197, 94, 0.32);
}

.habitat-card--locked {
  opacity: 0.72;
  filter: grayscale(0.16);
}

.habitat-card--locked:hover,
.habitat-card--locked:focus-visible {
  transform: none;
  box-shadow: none;
}

.habitat-card__stages {
  display: grid;
  gap: 0.5rem;
}

.stage-chip {
  display: grid;
  gap: 0.12rem;
  min-height: 58px;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #fffdf3;
  color: #1f2937;
  text-align: left;
  text-decoration: none;
  box-shadow: 0 7px 14px rgba(15, 23, 42, 0.06);
}

.stage-chip span {
  color: #2f7d47;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.stage-chip strong {
  font-size: 0.9rem;
  line-height: 1.15;
}

.stage-chip small {
  color: #64748b;
  font-weight: 800;
}

.stage-chip--current {
  border-color: rgba(47, 125, 71, 0.45);
  background: #ecfdf5;
}

.stage-chip--complete {
  background: #f0fdf4;
}

.stage-chip--locked {
  cursor: not-allowed;
  opacity: 0.68;
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

@media (max-width: 767px) {
  .habitat-card {
    width: 100%;
    border-radius: 20px;
  }

  .habitat-card__media {
    aspect-ratio: 2 / 1;
  }

  .habitat-card__stages {
    gap: 0.42rem;
  }

  .stage-chip {
    min-height: 52px;
    padding: 0.48rem 0.58rem;
  }

  .stage-chip strong {
    font-size: 0.86rem;
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
