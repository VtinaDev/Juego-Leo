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
      <span class="habitat-card__overlay" aria-hidden="true"></span>
      <span class="habitat-card__glow" aria-hidden="true"></span>
      <div
        class="habitat-card__habitat-scene"
        :style="{ backgroundImage: `url('${level.habitat}')` }"
      >
        <span class="habitat-card__level-pill habitat-card__level-pill--floating">
          Nivel {{ level.levelId }} · {{ level.locked ? 'Bloqueado' : level.complete ? '🏆 Completado' : 'Disponible' }}
        </span>
        <span
          v-if="level.stars"
          class="habitat-card__stars-pill habitat-card__stars-pill--floating"
          :aria-label="`${level.stars} estrellas obtenidas`"
        >
          <img
            v-for="star in level.stars"
            :key="star"
            :src="ICONS.star"
            alt=""
            aria-hidden="true"
          />
        </span>
        <img
          class="habitat-card__character"
          :src="level.character"
          :alt="`Personaje ${level.characterName}`"
          :style="characterStyle(level)"
          loading="lazy"
        />
        <div class="habitat-card__bottom">
          <div class="habitat-card__footer">
            <div class="habitat-card__level-copy">
              <strong>{{ level.title }}</strong>
              <p>{{ level.description }}</p>
            </div>
            <button
              class="habitat-card__image-btn"
              :disabled="level.locked"
              type="button"
              @click.stop="$emit('enter', level)"
            >
              {{ level.locked ? 'Bloqueado' : '¡Vamos!' }}
            </button>
          </div>

        </div>
      </div>

      <div v-if="level.stages?.length" class="habitat-card__level-progress">
        <p>
          <strong>Tu progreso</strong>
          <span>{{ level.completedStages }}/{{ level.stageTotal }} etapas completadas</span>
        </p>
        <nav class="habitat-card__stage-circles" aria-label="Etapas del nivel">
          <component
            :is="stage.locked ? 'span' : 'RouterLink'"
            v-for="stage in level.stages"
            :key="stage.id"
            :to="stage.locked ? undefined : stage.route"
            :class="{
              'is-complete': stage.complete,
              'is-current': stage.current,
              'is-locked': stage.locked
            }"
            :aria-label="`Etapa ${stage.number}: ${stage.title}`"
            :data-tooltip="`Etapa ${stage.number}: ${stage.title} · ${
              stage.complete
                ? `${stage.count} ejercicios`
                : stage.current
                  ? 'Etapa actual'
                  : stage.locked
                    ? 'Bloqueada'
                    : `${stage.count} ejercicios`
            }`"
            :tabindex="stage.locked ? 0 : undefined"
          >
            {{ stage.number }}
          </component>
        </nav>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ICONS } from '../../constants/icons'

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
    '--character-width-percent': `${50 * scale}%`,
    '--character-width-max': `${172 * scale}px`,
    '--character-max-height': `${56 * scale}%`,
    '--character-mobile-width-percent': `${48 * scale}%`,
    '--character-mobile-width-max': `${158 * scale}px`,
    '--character-mobile-max-height': `${54 * scale}%`,
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
  height: var(--habitat-media-height, 100dvh);
  min-height: var(--habitat-media-height, 100dvh);
  aspect-ratio: var(--habitat-card-aspect, auto);
  border-radius: 0;
  overflow: hidden;
  background: var(--map-hero-background, #fff7cf);
  box-shadow: none;
  padding: 0;
  display: block;
  gap: 0;
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  outline: none;
  animation: cardIn 0.45s ease both;
  animation-delay: calc(var(--card-index, 0) * 70ms);
}

.habitat-card__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.habitat-card__overlay {
  z-index: 1;
  background: radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 46%);
}

.habitat-card__media {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  overflow: hidden;
  min-height: var(--habitat-media-height, 420px);
  height: var(--habitat-media-height, 100dvh);
  padding: 0.75rem 0;
  background: var(--map-hero-background, #fff7cf);
}

.habitat-card__media::after {
  content: none;
}

.habitat-card__glow {
  display: none;
}

.habitat-card__habitat-scene {
  position: relative;
  z-index: 2;
  flex: 0 1 auto;
  width: clamp(290px, min(36vw, calc((100dvh - 130px) * 0.6667)), 400px);
  min-height: 0;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border: 0;
  border-radius: 24px;
  background-color: #d9f8ff;
  background-position: center 35%;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow:
    0 16px 26px rgba(27, 75, 91, 0.18),
    inset 0 2px 0 rgba(255, 255, 255, 0.72),
    inset 0 -10px 22px rgba(255, 255, 255, 0.14);
  transform: rotate(-0.6deg);
}

.habitat-card__rewards {
  display: none;
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
  top: 45%;
  bottom: auto;
  width: min(calc(var(--character-width-percent, 66%) * 1.24), calc(var(--character-width-max, 190px) * 1.3));
  max-height: var(--character-max-height, 96%);
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(15, 23, 42, 0.18));
  transform: translate(-50%, -50%);
  animation: characterIdle 2.8s ease-in-out infinite;
  z-index: 3;
}

.habitat-card__image-btn {
  position: static;
  z-index: 5;
  flex: 0 0 auto;
  min-width: 96px;
  min-height: 34px;
  padding: 0.4rem 0.72rem;
  border: none;
  border-radius: 999px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 950;
  line-height: 1;
  box-shadow:
    0 5px 0 #73b72a,
    0 10px 16px rgba(115, 183, 42, 0.26),
    inset 0 2px 0 rgba(255, 255, 255, 0.66);
  transform: none;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
}

.habitat-card__image-btn:hover:enabled,
.habitat-card__image-btn:focus-visible:enabled {
  transform: translateY(-2px);
  filter: brightness(1.03) saturate(1.04);
  box-shadow:
    0 7px 0 #73b72a,
    0 14px 18px rgba(115, 183, 42, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.72);
}

.habitat-card__image-btn:active:enabled {
  transform: translateY(4px);
  box-shadow:
    0 2px 0 #73b72a,
    0 7px 12px rgba(115, 183, 42, 0.24),
    inset 0 2px 0 rgba(255, 255, 255, 0.58);
}

.habitat-card__image-btn:disabled {
  background: linear-gradient(160deg, #cbd5e1 0%, #94a3b8 100%);
  color: #1e293b;
  box-shadow: none;
  cursor: not-allowed;
}

.habitat-card__meta {
  display: none;
}

.habitat-card__meta span {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 999px;
  padding: 0.24rem 0.48rem;
  background: #f0fdf4;
  color: #166534;
  font-size: 0.66rem;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.08);
}

.habitat-card__meta span:first-child {
  background: #fff7ed;
  color: #9a3412;
}

.habitat-card:hover,
.habitat-card:focus-visible {
  transform: none;
  box-shadow: none;
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
  box-shadow: none;
}

.habitat-card__stages {
  position: relative;
  z-index: 6;
  flex: 0 1 auto;
  width: clamp(260px, min(30vw, calc((100dvh - 250px) * 0.6667)), 360px);
  margin: 0;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.48);
  border: 2px solid rgba(240, 232, 220, 0.8);
  min-height: 0;
  max-height: none;
  display: flex;
  flex-direction: column;
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(14px) saturate(1.06);
  transform: none;
}

.habitat-card__stages[open] {
  max-height: min(32dvh, 280px);
}

.habitat-card__stages-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.48rem;
  min-height: 54px;
  padding: 0.58rem 0.68rem;
  color: #334155;
  cursor: pointer;
  list-style: none;
  outline: none;
  touch-action: manipulation;
  user-select: none;
}

.habitat-card__stages-toggle::-webkit-details-marker {
  display: none;
}

.habitat-card__stages-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.45rem, 2vw, 0.8rem);
  min-width: 0;
  flex: 1 1 auto;
  width: auto;
}

.habitat-card__stages-title {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.habitat-card__stages-title strong {
  overflow: hidden;
  font-size: 0.9rem;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.habitat-card__stages-title small {
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 900;
}

.habitat-card__bottom {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  left: 0.75rem;
  z-index: 5;
  display: grid;
  gap: 0.35rem;
}

.habitat-card__footer {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem;
  border: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(14px) saturate(1.08);
  -webkit-backdrop-filter: blur(14px) saturate(1.08);
}

.habitat-card__level-copy {
  display: grid;
  flex: 1 1 auto;
  gap: 0.18rem;
  min-width: 0;
}

.habitat-card__level-copy strong {
  color: #0f3560;
  font-size: 0.88rem;
  line-height: 1.15;
}

.habitat-card__level-copy p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #475569;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.habitat-card__level-progress {
  z-index: 6;
  display: grid;
  width: clamp(290px, min(36vw, calc((100dvh - 130px) * 0.6667)), 400px);
  gap: 0.18rem;
}

.habitat-card__level-progress p {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0;
  color: #0f3560;
}

.habitat-card__level-progress p strong {
  font-size: 0.86rem;
  font-weight: 950;
  text-shadow: none;
}

.habitat-card__level-progress p span {
  color: #475569;
  font-size: 0.7rem;
  font-weight: 900;
  text-shadow: none;
}

.habitat-card__stage-circles {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  overflow: visible;
  padding: 0.12rem 0.15rem;
}

.habitat-card__stage-circles > * {
  position: relative;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 50%;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(145deg, #bbf7d0, #3b82f6) border-box;
  color: #166534;
  font-size: 0.78rem;
  font-weight: 950;
  text-decoration: none;
  box-shadow: none;
}

.habitat-card__stage-circles > *::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 0.55rem);
  left: 50%;
  z-index: 20;
  width: max-content;
  max-width: min(230px, 72vw);
  padding: 0.5rem 0.65rem;
  border-radius: 9px;
  background: #ffffff;
  color: #334155;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1.3;
  text-align: center;
  white-space: normal;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 4px);
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.habitat-card__stage-circles > *:hover::after,
.habitat-card__stage-circles > *:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.habitat-card__stage-circles > .is-complete {
  background:
    linear-gradient(#bef264, #bef264) padding-box,
    linear-gradient(145deg, #d9f99d, #4d7c0f) border-box;
  color: #365314;
}

.habitat-card__stage-circles > .is-current {
  background:
    linear-gradient(#60a5fa, #60a5fa) padding-box,
    linear-gradient(145deg, #bfdbfe, #1d4ed8) border-box;
  color: #ffffff;
  box-shadow: none;
}

.habitat-card__stage-circles > .is-locked {
  background:
    linear-gradient(#e2e8f0, #e2e8f0) padding-box,
    linear-gradient(145deg, #f8fafc, #64748b) border-box;
  color: #94a3b8;
}

.habitat-card__hud {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.32rem;
  min-width: max-content;
}

.habitat-card__level-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.88);
  color: #14532d;
  font-size: 0.64rem;
  font-weight: 950;
  line-height: 1;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.12);
}

.habitat-card__level-pill {
  padding: 0 0.5rem;
  color: #9a3412;
  background: rgba(255, 247, 237, 0.92);
}

.habitat-card__level-pill--floating {
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  z-index: 5;
  min-width: max-content;
  transform: none;
  backdrop-filter: blur(8px);
}

.habitat-card__stars-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.08rem;
}

.habitat-card__stars-pill img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.habitat-card__stars-pill--floating {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 5;
}

.habitat-card__stages-toggle em {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.72);
  color: #475569;
  font-style: normal;
  font-weight: 900;
  pointer-events: none;
  transition: transform 0.18s ease;
}

.habitat-card__stages[open] .habitat-card__stages-toggle em {
  transform: rotate(180deg);
}

.habitat-card__stages-toggle:hover,
.habitat-card__stages-toggle:focus-visible {
  background: rgba(255, 255, 255, 0.48);
}

.habitat-card__stages-content {
  min-height: 0;
  padding: 0.28rem 0.82rem 0.85rem;
  overflow-y: auto;
  scrollbar-width: thin;
}

.habitat-card__section-title {
  margin: 0.58rem 0 0.42rem;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 950;
}

.habitat-card__progress-steps {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.18rem 0 0.45rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.habitat-card__progress-steps::-webkit-scrollbar {
  display: none;
}

.habitat-card__progress-steps span {
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 950;
}

.habitat-card__progress-steps span.is-complete {
  background: #bef264;
  color: #365314;
}

.habitat-card__progress-steps span.is-current {
  background: #60a5fa;
  color: #ffffff;
}

:deep(.level-station) {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  gap: 0.3rem;
}

:deep(.level-station__head) {
  display: none;
}

:deep(.level-station__number) {
  margin-bottom: 0.12rem;
  color: #64748b;
  letter-spacing: 0.02em;
  font-size: 0.62rem;
}

:deep(.level-station__head h3) {
  color: #111827;
  font-size: 0.98rem;
  line-height: 1.12;
}

:deep(.level-station__description) {
  display: none;
}

:deep(.level-station__btn) {
  min-height: 34px;
  border-radius: 999px;
  background: #92c237;
  color: #173b0a;
  box-shadow: none;
  font-size: 0.8rem;
  padding: 0.42rem 0.62rem;
}

.habitat-card__stage-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.15rem 0 0.2rem;
  min-height: 0;
  max-height: none;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
}

.stage-chip {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  grid-template-rows: auto;
  justify-items: start;
  align-items: center;
  column-gap: 0.65rem;
  flex: 0 0 auto;
  width: 100%;
  min-height: 58px;
  padding: 0.55rem 0.7rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.8);
  color: #1f2937;
  text-align: left;
  text-decoration: none;
  box-shadow: none;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.stage-chip::after {
  content: '';
  position: absolute;
  right: 0.55rem;
  bottom: 0.3rem;
  left: 0.55rem;
  height: 5px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, #84cc16, #bef264) left center / var(--stage-chip-progress, 0%) 100% no-repeat,
    #e2e8f0;
  transition: background-size 0.35s ease;
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
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 0.72rem;
  font-weight: 900;
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.74),
    0 6px 12px rgba(15, 23, 42, 0.16);
}

.stage-chip strong {
  width: 100%;
  font-size: 0.72rem;
  line-height: 1.3;
  white-space: normal;
  overflow-wrap: anywhere;
}

.stage-chip small {
  color: #64748b;
  font-size: 0.56rem;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}

.stage-chip--current {
  border-color: rgba(250, 204, 21, 0.9);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: none;
  transform: translateY(-2px);
}

.stage-chip--current span {
  background: #facc15;
  color: #713f12;
  animation: stagePulse 1.6s ease-in-out infinite;
}

.stage-chip--complete {
  border-color: rgba(148, 163, 184, 0.42);
  background: rgba(255, 255, 255, 0.94);
  color: #294e07;
  box-shadow: none;
}

.stage-chip--complete span {
  background: #d9f99d;
  color: #365314;
  box-shadow: none;
}

.stage-chip--complete small {
  color: #365314;
}

.stage-chip--locked {
  cursor: not-allowed;
  opacity: 0.74;
  background: rgba(226, 232, 240, 0.8);
  filter: grayscale(0.18);
}

.stage-chip--locked span {
  background: #cbd5e1;
  color: #475569;
}

.stage-chip--upcoming {
  display: none;
  pointer-events: none;
}

@keyframes characterIdle {
  0%,
  100% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, calc(-50% - 6px));
  }
}

@keyframes characterHello {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(0);
  }
  35% {
    transform: translate(-50%, calc(-50% - 10px)) rotate(-4deg) scale(1.04);
  }
  70% {
    transform: translate(-50%, calc(-50% - 5px)) rotate(4deg) scale(1.02);
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

@keyframes stagePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 3px rgba(255, 255, 255, 0.74),
      0 6px 12px rgba(15, 23, 42, 0.16),
      0 0 0 rgba(250, 204, 21, 0);
  }
  50% {
    transform: scale(1.08);
    box-shadow:
      0 0 0 3px rgba(255, 255, 255, 0.84),
      0 8px 14px rgba(15, 23, 42, 0.18),
      0 0 16px rgba(250, 204, 21, 0.56);
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
    border-radius: 0;
  }

  .habitat-card__stages[open] {
    max-height: 50%;
  }

  .habitat-card__stage-list {
    max-height: none;
  }

  .habitat-card__media {
    min-height: var(--habitat-media-height, 400px);
    height: var(--habitat-media-height, 100dvh);
  }

  .habitat-card__character {
    top: 45%;
    bottom: auto;
    width: min(calc(var(--character-mobile-width-percent, 58%) * 1.2), calc(var(--character-mobile-width-max, 170px) * 1.22));
    max-height: var(--character-mobile-max-height, 98%);
  }

  .habitat-card__glow {
    width: 64%;
  }

  .habitat-card__habitat-scene {
    top: 50%;
    width: clamp(245px, 78vw, 310px);
    border-radius: 22px;
  }

  .habitat-card__stages {
    top: auto;
    bottom: 0.65rem;
    width: calc(100% - 1rem);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.58);
    backdrop-filter: blur(12px) saturate(1.04);
  }

  .habitat-card__stages-toggle {
    min-height: 54px;
    padding: 0.5rem 0.55rem;
  }

  .habitat-card__stages-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.3rem;
  }

  .habitat-card__stages-title strong {
    font-size: 0.86rem;
  }

  .habitat-card__stages-title small {
    font-size: 0.6rem;
  }

  .habitat-card__hud {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 0.24rem;
    min-width: 0;
  }

  .habitat-card__level-pill {
    min-height: 22px;
    font-size: 0.56rem;
  }

  .habitat-card__level-pill {
    padding: 0 0.36rem;
  }

  .habitat-card__level-pill--floating {
    top: 0.6rem;
    left: 0.6rem;
  }

  .habitat-card__stars-pill img {
    width: 21px;
    height: 21px;
  }

  .habitat-card__stars-pill--floating {
    top: 0.6rem;
    right: 0.6rem;
  }

  .stage-chip {
    min-height: 56px;
    padding: 0.5rem 0.58rem 0.78rem;
  }

  .stage-chip strong {
    font-size: 0.58rem;
  }

  .stage-chip small {
    font-size: 0.52rem;
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

  .stage-chip--current span {
    animation: none;
  }
}
</style>
