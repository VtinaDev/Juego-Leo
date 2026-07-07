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
    <div class="habitat-card__media">
      <img class="habitat-card__background" :src="level.habitat" :alt="`Hábitat ${level.title}`" loading="lazy" />
      <span class="habitat-card__overlay" aria-hidden="true"></span>
      <div v-if="level.rewards?.length" class="habitat-card__rewards" aria-label="Recompensas obtenidas">
        <span
          v-for="reward in level.rewards"
          :key="reward.id"
          class="habitat-card__reward"
          :aria-label="reward.label"
          :title="reward.label"
        >
          <template v-if="reward.stars?.length">
            <img
              v-for="star in reward.stars"
              :key="star"
              src="/icons/star.PNG"
              alt=""
              aria-hidden="true"
            />
          </template>
          <span v-else>{{ reward.text || reward.icon }}</span>
        </span>
      </div>
      <span class="habitat-card__glow" aria-hidden="true"></span>
      <img
        class="habitat-card__character"
        :src="level.character"
        :alt="`Personaje ${level.characterName}`"
        :style="characterStyle(level)"
        loading="lazy"
      />
    </div>

    <div class="habitat-card__body">
      <div class="habitat-card__meta" aria-label="Estado del nivel">
        <span>{{ level.locked ? 'Bloqueado' : level.complete ? 'Completado' : 'Ya disponible' }}</span>
        <span>{{ level.progressLabel }}</span>
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

function characterStyle(level) {
  const scale = level.characterScale || 1
  return {
    '--character-width-percent': `${58 * scale}%`,
    '--character-width-max': `${176 * scale}px`,
    '--character-max-height': `${88 * scale}%`,
    '--character-mobile-width-percent': `${54 * scale}%`,
    '--character-mobile-width-max': `${158 * scale}px`,
    '--character-mobile-max-height': `${86 * scale}%`,
    '--character-bottom': level.characterBottom || '0',
    '--character-mobile-bottom': level.characterMobileBottom || level.characterBottom || '0'
  }
}
</script>

<style scoped>
.habitat-card {
  position: relative;
  isolation: isolate;
  width: var(--habitat-card-width, clamp(240px, 74vw, 300px));
  aspect-ratio: var(--habitat-card-aspect, auto);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
  padding: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0;
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  outline: none;
  animation: cardIn 0.45s ease both;
  animation-delay: calc(var(--card-index, 0) * 70ms);
}

.habitat-card__background,
.habitat-card__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.habitat-card__background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 38%;
  transition: transform 0.7s ease, filter 0.35s ease;
}

.habitat-card__overlay {
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 38%, rgba(15, 23, 42, 0.22) 100%),
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0) 54%);
}

.habitat-card__media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 11;
  background: #d9f99d;
}

.habitat-card__media::after {
  content: none;
}

.habitat-card__glow {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: -34%;
  width: 74%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(220, 252, 231, 0.78) 0%, rgba(34, 197, 94, 0) 70%);
  transform: translateX(-50%);
  animation: habitatGlow 2.8s ease-in-out infinite;
}

.habitat-card__rewards {
  position: absolute;
  top: 0.62rem;
  right: 0.62rem;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 0.28rem;
}

.habitat-card__reward {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  min-width: 30px;
  height: 30px;
  padding: 0 0.34rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.72);
  color: #365314;
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.08);
}

.habitat-card__reward strong {
  font-size: 0.72rem;
}

.habitat-card__reward img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.habitat-card__character {
  position: absolute;
  left: 50%;
  bottom: var(--character-bottom, 0);
  width: min(var(--character-width-percent, 66%), var(--character-width-max, 190px));
  max-height: var(--character-max-height, 96%);
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(15, 23, 42, 0.18));
  transform: translateX(-50%);
  animation: characterIdle 2.8s ease-in-out infinite;
  z-index: 3;
}

.habitat-card__body {
  display: grid;
  gap: 0.58rem;
  padding: 0.82rem 0.82rem 0.76rem;
  background: #ffffff;
}

.habitat-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  align-items: center;
  justify-content: space-between;
}

.habitat-card__meta span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  border-radius: 999px;
  padding: 0.28rem 0.58rem;
  background: #f0fdf4;
  color: #166534;
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
}

.habitat-card__meta span:first-child {
  background: #fff7ed;
  color: #9a3412;
}

.habitat-card:hover,
.habitat-card:focus-visible {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.16);
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

.habitat-card--locked:hover,
.habitat-card--locked:focus-visible {
  transform: none;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
}

.habitat-card__stages {
  margin: 0 0.82rem 0.82rem;
  overflow: hidden;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.habitat-card__stages-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 44px;
  padding: 0.5rem 0.62rem;
  color: #14532d;
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
  color: #4b7c5a;
  font-size: 0.72rem;
  font-weight: 900;
}

.habitat-card__stages-toggle em {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #166534;
  font-style: normal;
  font-weight: 900;
  transition: transform 0.18s ease;
}

.habitat-card__stages[open] .habitat-card__stages-toggle em {
  transform: rotate(180deg);
}

.habitat-card__stages-toggle:hover,
.habitat-card__stages-toggle:focus-visible {
  background: rgba(255, 255, 255, 0.32);
}

:deep(.level-station) {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

:deep(.level-station__number) {
  margin-bottom: 0.2rem;
  color: #64748b;
  letter-spacing: 0.02em;
}

:deep(.level-station__head h3) {
  color: #111827;
  font-size: clamp(1rem, 2.4vw, 1.18rem);
}

:deep(.level-station__description) {
  color: #475569;
  font-size: 0.84rem;
  line-height: 1.35;
}

:deep(.level-station__btn) {
  min-height: 42px;
  border-radius: 999px;
  background: #92c237;
  color: #173b0a;
  box-shadow: none;
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
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
  color: #1f2937;
  text-align: left;
  text-decoration: none;
  box-shadow: none;
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
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
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
  border-color: rgba(34, 197, 94, 0.4);
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
    border-radius: 8px;
  }

  .habitat-card__media {
    aspect-ratio: 16 / 10;
  }

  .habitat-card__character {
    bottom: var(--character-mobile-bottom, var(--character-bottom, 0));
    width: min(var(--character-mobile-width-percent, 58%), var(--character-mobile-width-max, 170px));
    max-height: var(--character-mobile-max-height, 98%);
  }

  .habitat-card__glow {
    width: 64%;
  }

  .habitat-card__stages {
    border-radius: 8px;
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
