<template>
  <article
    class="habitat-card"
    :class="{
      'habitat-card--locked': level.locked,
      'habitat-card--complete': level.complete,
      'habitat-card--current': level.current
    }"
    tabindex="0"
    @keydown.self.enter.prevent="$emit('enter', level)"
    @keydown.self.space.prevent="$emit('enter', level)"
  >
    <img class="habitat-card__background" :src="level.habitat" :alt="`Hábitat ${level.title}`" loading="lazy" />
    <span class="habitat-card__overlay" aria-hidden="true"></span>
    <div class="habitat-card__media">
      <span class="habitat-card__glow" aria-hidden="true"></span>
      <img
        class="habitat-card__character"
        :src="level.character"
        :alt="`Personaje ${level.characterName}`"
        loading="lazy"
      />
      <span class="habitat-card__level">Nivel {{ level.levelId }}</span>
      <span class="habitat-card__badge">{{ level.statusLabel }}</span>
    </div>

    <LevelStation
      :title="level.title"
      :description="level.description"
      :stars="level.stars"
      :locked="level.locked"
      :level-number="level.levelId"
      :progress-label="level.progressLabel"
      :stage-count="level.stageTotal"
      @enter="$emit('enter', level)"
    />

    <div class="habitat-card__progress" aria-hidden="true">
      <span :style="{ width: `${level.progressPercent}%` }"></span>
    </div>

    <details v-if="level.stages?.length" class="habitat-card__stages">
      <summary class="habitat-card__stages-toggle">
        <span>
          <strong>Etapas</strong>
          <small>{{ level.completedStages }}/{{ level.stageTotal }} completadas</small>
        </span>
        <em aria-hidden="true">⌄</em>
      </summary>

      <div class="habitat-card__stage-list" aria-label="Etapas disponibles">
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
          <span>{{ stage.complete ? '✓' : stage.current ? '●' : stage.number }}</span>
          <strong>{{ stage.title }}</strong>
          <small>{{ stage.count }}</small>
        </component>
      </div>
    </details>
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
  position: relative;
  isolation: isolate;
  width: var(--habitat-card-width, clamp(220px, 72vw, 280px));
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.28);
  box-shadow: none;
  padding: 0.72rem;
  display: grid;
  gap: 0.72rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  outline: none;
  animation: cardIn 0.45s ease both;
  animation-delay: calc(var(--card-index, 0) * 70ms);
}

.habitat-card:not(.habitat-card--locked) {
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.22);
}

.habitat-card__background,
.habitat-card__overlay {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
}

.habitat-card__background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease, filter 0.35s ease;
}

.habitat-card__overlay {
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(15, 23, 42, 0.22) 100%),
    linear-gradient(0deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.12));
}

.habitat-card__media {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  aspect-ratio: 1.44 / 1;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
}

.habitat-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0) 42%, rgba(15, 23, 42, 0.36) 100%);
  pointer-events: none;
}

.habitat-card__glow {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: -18%;
  width: 56%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(254, 240, 138, 0.8) 0%, rgba(250, 204, 21, 0) 70%);
  transform: translateX(-50%);
  animation: habitatGlow 2.8s ease-in-out infinite;
}

.habitat-card__character {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: min(48%, 140px);
  object-fit: contain;
  filter: drop-shadow(0 9px 12px rgba(15, 23, 42, 0.2));
  transform: translateX(-50%);
  animation: characterIdle 2.8s ease-in-out infinite;
  z-index: 1;
}

.habitat-card__level,
.habitat-card__badge {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  border-radius: 999px;
  padding: 0.28rem 0.58rem;
  font-size: 0.76rem;
  font-weight: 900;
  line-height: 1;
}

.habitat-card__level {
  left: 0.6rem;
  top: 0.6rem;
  background: rgba(255, 255, 255, 0.88);
  color: #0f3560;
}

.habitat-card__badge {
  right: 0.6rem;
  bottom: 0.6rem;
  background: rgba(22, 163, 74, 0.92);
  color: #ffffff;
}

.habitat-card:hover,
.habitat-card:focus-visible {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 18px 28px rgba(34, 197, 94, 0.32);
}

.habitat-card:hover .habitat-card__background,
.habitat-card:focus-visible .habitat-card__background,
.habitat-card--current .habitat-card__background {
  transform: scale(1.06);
  filter: saturate(1.08);
}

.habitat-card:hover .habitat-card__character,
.habitat-card:focus-visible .habitat-card__character {
  animation: characterHello 0.75s ease-in-out;
}

.habitat-card--locked {
  opacity: 0.72;
  filter: grayscale(0.16);
}

.habitat-card--locked .habitat-card__badge {
  background: rgba(100, 116, 139, 0.92);
}

.habitat-card--complete .habitat-card__badge {
  background: rgba(245, 158, 11, 0.94);
}

.habitat-card__progress {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.46);
  border: 1px solid rgba(255, 255, 255, 0.42);
}

.habitat-card__progress span {
  display: block;
  height: 100%;
  min-width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #facc15 0%, #22c55e 100%);
  transition: width 0.25s ease;
}

.habitat-card--locked:hover,
.habitat-card--locked:focus-visible {
  transform: none;
  box-shadow: none;
}

.habitat-card__stages {
  overflow: hidden;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.habitat-card__stages-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 48px;
  padding: 0.58rem 0.68rem;
  color: #0f3560;
  cursor: pointer;
  list-style: none;
  outline: none;
}

.habitat-card__stages-toggle::-webkit-details-marker {
  display: none;
}

.habitat-card__stages-toggle span {
  display: grid;
  gap: 0.08rem;
}

.habitat-card__stages-toggle strong {
  font-size: 0.9rem;
  line-height: 1;
}

.habitat-card__stages-toggle small {
  color: #2f7d47;
  font-size: 0.72rem;
  font-weight: 900;
}

.habitat-card__stages-toggle em {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.13);
  color: #0369a1;
  font-style: normal;
  font-weight: 900;
  transition: transform 0.18s ease;
}

.habitat-card__stages[open] .habitat-card__stages-toggle em {
  transform: rotate(180deg);
}

.habitat-card__stages-toggle:hover,
.habitat-card__stages-toggle:focus-visible {
  background: #f8fafc;
}

:deep(.level-station) {
  padding: 0.72rem;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
}

.habitat-card__stage-list {
  display: grid;
  gap: 0.42rem;
  padding: 0 0.58rem 0.58rem;
}

.stage-chip {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.42rem 0.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: #ffffff;
  color: #1f2937;
  text-align: left;
  text-decoration: none;
  box-shadow: 0 7px 14px rgba(15, 23, 42, 0.06);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.stage-chip:hover:not(.stage-chip--locked),
.stage-chip:focus-visible:not(.stage-chip--locked) {
  transform: translateY(-1px);
  border-color: rgba(47, 125, 71, 0.36);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.1);
}

.stage-chip span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.12);
  color: #0369a1;
  font-size: 0.78rem;
  font-weight: 900;
}

.stage-chip strong {
  overflow: hidden;
  font-size: 0.84rem;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-chip small {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
}

.stage-chip--current {
  border-color: rgba(47, 125, 71, 0.45);
  background: #f0fdf4;
}

.stage-chip--complete {
  background: #ffffff;
}

.stage-chip--locked {
  cursor: not-allowed;
  opacity: 0.68;
}

@keyframes characterIdle {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-6px);
  }
}

@keyframes characterHello {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(0);
  }
  35% {
    transform: translateX(-50%) translateY(-10px) rotate(-4deg) scale(1.04);
  }
  70% {
    transform: translateX(-50%) translateY(-5px) rotate(4deg) scale(1.02);
  }
}

@keyframes habitatGlow {
  0%,
  100% {
    opacity: 0.5;
    transform: translateX(-50%) scale(0.92);
  }
  50% {
    opacity: 0.9;
    transform: translateX(-50%) scale(1.08);
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
    border-radius: 14px;
  }

  .stage-chip {
    min-height: 42px;
    padding: 0.38rem 0.46rem;
  }

  .stage-chip strong {
    font-size: 0.86rem;
  }
}

@keyframes cardIn {
  0% {
    opacity: 0;
    filter: blur(3px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .habitat-card,
  .habitat-card__character,
  .habitat-card__glow {
    animation: none;
    transition: none;
  }
}
</style>
