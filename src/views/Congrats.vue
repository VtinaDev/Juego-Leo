<template>
  <section class="congrats-shell">
    <div class="confetti confetti-a" />
    <div class="confetti confetti-b" />
    <div class="confetti confetti-c" />
    <div v-if="isGameCompleted" class="confetti-rain" aria-hidden="true">
      <span
        v-for="piece in finalConfettiPieces"
        :key="piece.id"
        class="confetti-piece"
        :style="pieceStyle(piece)"
      />
    </div>

    <div class="congrats-card">
      <div class="congrats-body">
        <div class="congrats-info">
          <p class="lead flex items-center justify-start gap-3 text-left">
            ¡Sigue la aventura!
            <img src="/icons/celebration.png" alt="Celebración" class="celebration-icon" />
          </p>

          <div class="pill" :style="{ borderColor: levelColor }">
            {{ levelLabel }} · Etapa {{ stageNumber }} de {{ totalStages }}
          </div>

          <div v-if="isGameCompleted" class="final-banner">
            🎉 ¡Completaste el último nivel! ¡Gran trabajo!
          </div>

          <div class="stars" v-if="earnedStars > 0">
            <img
              v-for="n in 3"
              :key="n"
              class="star-img star-img-lg"
              :class="{ active: n <= earnedStars }"
              src="/icons/star.PNG"
              alt="Estrella"
            />
            <p class="stars-label">Estrellas obtenidas</p>
          </div>

          <div class="actions">
            <button
              class="btn btn-ghost icon-only"
              type="button"
              @click="repeatStage"
              aria-label="Volver"
              :style="{ borderColor: levelColor }"
            >
              <img src="/icons/back.PNG" alt="Volver" class="icon-img" />
            </button>
            <button
              class="btn btn-primary icon-only"
              type="button"
              @click="goToNextStage"
              :aria-label="primaryLabel"
              :style="{ borderColor: levelColor }"
            >
              <img src="/icons/next.PNG" alt="Siguiente" class="icon-img" />
            </button>
          </div>

          <p v-if="!hasNextStage" class="hint">
            Ya completaste todas las etapas de este nivel. ¡Elige otro desafío!
          </p>
        </div>

        <div v-if="characterImage" class="congrats-avatar">
          <img :src="characterImage" :alt="levelLabel" loading="lazy" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import Perezoso from '../assets/characters/Perezoso.png'
import Zorro from '../assets/characters/Zorro.png'
import Mono from '../assets/characters/Mono.png'
import Elefante from '../assets/characters/Elefante.png'
import ElefanteGraduado from '../assets/characters/Elefante-graduado.png'

const route = useRoute()
const router = useRouter()
const game = useGameStore()

game.load?.()

function parseNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const levelNumber = computed(() => parseNumber(route.query.level, 1))
const stageNumber = computed(() => parseNumber(route.query.stage, 1))
const totalFromQuery = computed(() => parseNumber(route.query.totalStages, 0))
const starsFromQuery = computed(() => parseNumber(route.query.stars, 0))

const levelMeta = computed(() =>
  (game.levelTimeline || []).find((item) => item.levelId === levelNumber.value)
)

const stageLabel = computed(() => {
  const fromQuery = route.query.stageTitle
  if (fromQuery && typeof fromQuery === 'string') return fromQuery
  return `Etapa ${stageNumber.value}`
})

const totalStages = computed(() => {
  const storeTotal = game.getLevelProgress?.(levelNumber.value)?.totalStages ?? 0
  return storeTotal || totalFromQuery.value || stageNumber.value
})

const hasNextStage = computed(() => stageNumber.value < totalStages.value)
const nextStage = computed(() => (hasNextStage.value ? stageNumber.value + 1 : null))

const levelLabel = computed(() => levelMeta.value?.levelName ?? `Nivel ${levelNumber.value}`)
const levelColor = computed(() => levelMeta.value?.color ?? '#2563eb')
const primaryLabel = computed(() =>
  hasNextStage.value ? 'Ir a la siguiente etapa' : 'Explorar niveles'
)
const isGameCompleted = computed(
  () => route.query.completedGame === '1' || (levelNumber.value === 5 && !hasNextStage.value)
)
const finalConfettiPieces = computed(() =>
  Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: (i % 12) * 0.18,
    duration: 3.4 + Math.random() * 2,
    color: ['#f97316', '#22c55e', '#0ea5e9', '#eab308', '#f472b6'][i % 5],
    rotation: Math.random() * 360
  }))
)

function pieceStyle(piece) {
  return {
    left: `${piece.left}%`,
    animationDelay: `${piece.delay}s`,
    animationDuration: `${piece.duration}s`,
    background: piece.color,
    transform: `rotate(${piece.rotation}deg)`
  }
}
const characterImage = computed(() => {
  const map = {
    1: Perezoso,
    2: Zorro,
    3: Mono,
    4: Mono,
    5: ElefanteGraduado
  }
  return map[levelNumber.value] || Perezoso
})

const earnedStars = computed(() => {
  const stageData = game.stages?.[levelNumber.value]?.[stageNumber.value]
  if (stageData?.stars !== undefined) return stageData.stars
  return Math.min(3, Math.max(0, starsFromQuery.value))
})

function goToNextStage() {
  if (!hasNextStage.value) {
    goToLevels()
    return
  }

  router.push(`/game/${levelNumber.value}/${nextStage.value}`)
}

function repeatStage() {
  router.push({
    path: `/game/${levelNumber.value}/${stageNumber.value}`,
    query: {
      ...route.query,
      rerun: Date.now()
    }
  })
}

function goToLevels() {
  router.push({ name: 'Levels' })
}
</script>

<style scoped>
.congrats-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2.5rem 1.25rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.5)),
    url('@/views/fondo-congrats.PNG');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.congrats-card {
  position: relative;
  z-index: 1;
  max-width: 520px;
  width: min(92vw, 540px);
  background: rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(12px);
  color: #4a2f1a;
  border-radius: 22px;
  padding: 1.6rem 1.3rem;
  border: 2px solid rgba(240, 232, 220, 0.8);
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
}

.congrats-body {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.congrats-info {
  flex: 1 1 260px;
  text-align: left;
}

.eyebrow {
  display: inline-block;
  padding: 0.35rem 0.8rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: #c7d2fe;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 0.75rem;
}

h1 {
  font-size: clamp(2rem, 5vw, 2.6rem);
  margin: 0 0 0.5rem;
  color: inherit;
}

.lead {
  margin: 0 0 1.4rem;
  color: inherit;
  font-size: 1.6rem;
  font-weight: 800;
  text-align: left;
}
.celebration-icon {
  width: 48px;
  height: 48px;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e0f2fe;
  color: inherit;
  font-weight: 700;
  font-size: 1.1rem;
}
.stars {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.4rem 0 0.6rem;
}
.star-img {
  width: 46px;
  height: 46px;
  opacity: 0.25;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.22));
}
.star-img.active {
  opacity: 1;
}
.stars-label {
  margin-left: 0.6rem;
  color: inherit;
  font-weight: 500;
  font-size: 1.05rem;
}
.congrats-avatar {
  margin: 0 auto;
  width: 140px;
  height: 140px;
  display: grid;
  place-items: center;
  position: relative;
}
.congrats-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 28px rgba(15, 23, 42, 0.3));
  animation: avatarFloat 4s ease-in-out infinite;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.8rem 0 0.4rem;
}
.actions .btn {
  min-width: 0;
  min-height: 0;
  padding: 0.8rem 1.6rem;
  font-size: 1rem;
}
.actions .btn-ghost {
  padding: 0.8rem 1.4rem;
}
.actions .icon-only {
  min-width: 58px;
  min-height: 58px;
  padding: 0;
  border-radius: 14px;
  background: transparent;
  box-shadow: none;
  border: 1px solid transparent;
}
.actions .icon-only:hover {
  background: transparent;
  box-shadow: none;
  transform: none;
}
.actions .icon-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.hint {
  margin-top: 0.6rem;
  color: inherit;
  font-size: 0.95rem;
}

.confetti {
  position: absolute;
  inset: -10%;
  background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0 1%, transparent 40%),
    radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.12) 0 1%, transparent 38%),
    radial-gradient(circle at 60% 80%, rgba(255, 255, 255, 0.1) 0 1.4%, transparent 32%);
  opacity: 0.55;
  filter: blur(1px);
}

.confetti-a {
  transform: rotate(6deg);
}

.confetti-b {
  transform: rotate(-8deg);
  mix-blend-mode: screen;
}

.confetti-c {
  animation: confettiPulse 6s ease-in-out infinite;
  mix-blend-mode: screen;
}

.confetti-rain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}
.confetti-piece {
  position: absolute;
  top: -12%;
  width: 10px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.9;
  animation-name: confettiFall, confettiSpin;
  animation-timing-function: ease-in, linear;
  animation-iteration-count: infinite;
}
.final-banner {
  margin-top: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  background: #fff7ed;
  border: 1px solid rgba(234, 179, 8, 0.35);
  color: #92400e;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

@keyframes avatarFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes confettiPulse {
  0%, 100% {
    opacity: 0.35;
    transform: scale(1);
  }
  50% {
    opacity: 0.65;
    transform: scale(1.04);
  }
}
@keyframes confettiFall {
  0% {
    transform: translateY(-10vh);
  }
  100% {
    transform: translateY(110vh);
  }
}
@keyframes confettiSpin {
  0% {
    rotate: 0deg;
  }
  100% {
    rotate: 360deg;
  }
}

@media (max-width: 640px) {
  .congrats-card {
    padding: 2rem 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
