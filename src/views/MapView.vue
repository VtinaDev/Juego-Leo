<template>
  <section class="map-view">
    <header class="map-view__header">
      <p class="map-view__eyebrow">Mapa de niveles</p>
      <h1>Elige tu próxima aventura</h1>
      <p>Explora cada hábitat, consigue estrellas y entra en todas las etapas disponibles.</p>
      <div class="map-view__summary" aria-label="Resumen de progreso">
        <strong>{{ exerciseTotal }} ejercicios activos</strong>
        <span>{{ completedStagesTotal }} de {{ stageTotal }} etapas completadas</span>
        <span>{{ unlockedTotal }} niveles desbloqueados</span>
      </div>
    </header>

    <div class="map-view__carousel" :class="{ 'map-view__carousel--reduced': prefersReducedMotion }">
      <div class="map-view__track">
        <HabitatCard
          v-for="(level, index) in carouselLevels"
          :key="`${level.id}-${index}`"
          :level="level"
          class="map-view__card"
          :style="{ '--card-index': index }"
          :aria-hidden="index >= levels.length ? 'true' : undefined"
          :inert="index >= levels.length ? '' : undefined"
          @enter="handleEnter"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import HabitatCard from '../components/map/HabitatCard.vue'
import { useGameStore } from '../store/gameStore'
import { useBillingStore } from '../store/billingStore'
import { getLevelDefinition } from '../engine/logic/utils/validateTemplates'
import SlothCharacter from '../assets/characters/Sloth.png'
import BearCharacter from '../assets/characters/Bear.png'
import FoxCharacter from '../assets/characters/Fox.png'
import MonkeyCharacter from '../assets/characters/Mono.png'

const router = useRouter()
const game = useGameStore()
const billing = useBillingStore()
game.load?.()
billing.load?.()
const prefersReducedMotion = ref(false)
let motionQueryList = null

const levelBlueprint = [
  {
    id: 'sloth',
    levelId: 1,
    characterName: 'Oso perezoso',
    habitatDescription: 'El árbol',
    habitat: '/images-optimized/habitats/sloth-tree.webp',
    character: SlothCharacter,
    fallbackTitle: 'Árbol de la Calma'
  },
  {
    id: 'fox',
    levelId: 2,
    characterName: 'Zorro',
    habitatDescription: 'La Madriguera',
    habitat: '/images-optimized/habitats/fox-burrow.webp',
    character: FoxCharacter,
    fallbackTitle: 'Madriguera de Palabras'
  },
  {
    id: 'bear',
    levelId: 3,
    characterName: 'Oso',
    habitatDescription: 'El bosque de Miel',
    habitat: '/images-optimized/habitats/bear-honey.webp',
    character: BearCharacter,
    fallbackTitle: 'Bosque de la Miel'
  },
  {
    id: 'monkey',
    levelId: 4,
    characterName: 'Mono',
    habitatDescription: 'Mundo lianas',
    habitat: '/images-optimized/habitats/monkey-jungle.webp',
    character: MonkeyCharacter,
    fallbackTitle: 'Jungla de las Letras'
  },
  {
    id: 'elephant',
    levelId: 5,
    characterName: 'Elefante',
    habitatDescription: 'La escuela mágica',
    habitat: '/images-optimized/habitats/elephant-school.webp',
    character: '/images-optimized/characters/elephant.webp',
    fallbackTitle: 'Escuela del Elefante Sabio'
  }
]

const levels = computed(() => {
  return levelBlueprint.map((entry, index) => {
    const def = getLevelDefinition(String(entry.levelId))
    const progress = game.getLevelProgress(entry.levelId)
    const planUnlock = billing.canAccessLevel?.(entry.levelId) ?? true
    const prev = levelBlueprint[index - 1]
    const previousComplete = !prev
      ? true
      : game.getLevelProgress(prev.levelId).completedStages >= game.getLevelProgress(prev.levelId).totalStages

    const locked = !planUnlock || !previousComplete
    const stageTitle = def?.meta?.levelName || entry.fallbackTitle
    const stars = Math.min(3, Number(progress?.completedStages || 0))
    const totalStages = Number(progress?.totalStages || 0)
    const completedStages = Number(progress?.completedStages || 0)
    const percent = totalStages ? Math.round((completedStages / totalStages) * 100) : 0
    const complete = totalStages > 0 && completedStages >= totalStages
    const current = !locked && !complete
    const rewards = [
      stars > 0
        ? {
            id: 'stars',
            stars: Array.from({ length: stars }, (_, starIndex) => starIndex + 1),
            label: `${stars} estrellas obtenidas`
          }
        : null
    ].filter(Boolean)

    return {
      ...entry,
      title: stageTitle,
      description: def?.meta?.description || `${entry.characterName}: ${entry.habitatDescription}.`,
      stars,
      locked,
      complete,
      current,
      progressPercent: percent,
      completedStages,
      rewards,
      stageTotal: totalStages,
      statusLabel: locked ? 'Bloqueado' : complete ? 'Completado' : 'Disponible',
      progressLabel: `${completedStages}/${totalStages || 1} etapas`,
      route: `/game/${entry.levelId}/${progress.nextStage}`,
      stages: getStageLinks(entry.levelId, def, progress, locked)
    }
  })
})

const exerciseTotal = computed(() => {
  return levels.value.reduce((total, level) => {
    return total + level.stages.reduce((acc, stage) => acc + stage.count, 0)
  }, 0)
})

const carouselLevels = computed(() => [...levels.value, ...levels.value])

function getStageLinks(levelId, def, progress, locked) {
  const subtypes = def?.subtypes || {}
  const order = Array.isArray(def?.order) && def.order.length ? def.order : Object.keys(subtypes)

  return order.map((subtype, index) => {
    const stageNumber = index + 1
    const title = def?.stageMeta?.[subtype]?.title || formatSubtypeLabel(subtype)
    return {
      id: `${levelId}-${stageNumber}`,
      number: stageNumber,
      title,
      count: Array.isArray(subtypes[subtype]) ? subtypes[subtype].length : 0,
      route: `/game/${levelId}/${stageNumber}`,
      locked,
      complete: Number(progress?.completedStages || 0) >= stageNumber,
      current: Number(progress?.nextStage || 1) === stageNumber
    }
  })
}

function formatSubtypeLabel(value) {
  return String(value || 'Ejercicios')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function onMotionChange(event) {
  prefersReducedMotion.value = Boolean(event.matches)
}

function handleEnter(level) {
  if (!level || level.locked) return
  router.push(level.route).catch(() => {})
}

const stageTotal = computed(() => levels.value.reduce((total, level) => total + level.stageTotal, 0))
const completedStagesTotal = computed(() => levels.value.reduce((total, level) => total + level.completedStages, 0))
const unlockedTotal = computed(() => levels.value.filter((level) => !level.locked).length)

onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return

  motionQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQueryList.matches
  motionQueryList.addEventListener?.('change', onMotionChange)
})

onBeforeUnmount(() => {
  motionQueryList?.removeEventListener?.('change', onMotionChange)
})
</script>

<style scoped>
.map-view {
  min-height: 100dvh;
  padding: clamp(5.6rem, 9vw, 7rem) clamp(0.9rem, 3vw, 2rem) clamp(1.6rem, 4vw, 2.5rem);
  background:
    radial-gradient(circle at 10% 12%, rgba(250, 204, 21, 0.36) 0%, rgba(250, 204, 21, 0) 44%),
    radial-gradient(circle at 88% 10%, rgba(132, 204, 22, 0.34) 0%, rgba(132, 204, 22, 0) 46%),
    radial-gradient(circle at 50% 78%, rgba(132, 204, 22, 0.2) 0%, rgba(132, 204, 22, 0) 52%),
    linear-gradient(180deg, #ecfccb 0%, #fef9c3 38%, #f0fdf4 72%, #ffffff 100%);
}

.map-view__header {
  max-width: 820px;
  margin: 0 auto clamp(1.1rem, 3vw, 1.8rem);
  text-align: center;
}

.map-view__eyebrow {
  margin: 0 0 0.4rem;
  font-size: 0.78rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  font-weight: 900;
  color: #0369a1;
}

.map-view__header h1 {
  margin: 0;
  color: #0f3560;
  font-size: clamp(1.4rem, 4.6vw, 2.25rem);
  line-height: 1.1;
}

.map-view__header p {
  margin: 0.6rem auto 0;
  max-width: 62ch;
  font-size: 0.98rem;
  color: #2f5f86;
  line-height: 1.4;
}

.map-view__summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.map-view__summary > * {
  display: inline-flex;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: #ffffff;
  color: #166534;
  box-shadow: 0 8px 18px rgba(22, 101, 52, 0.12);
  font-size: 0.86rem;
  font-weight: 900;
}

.map-view__summary span {
  color: #1e5a86;
}

.map-view__carousel {
  --card-w: clamp(280px, 72vw, 390px);
  --track-gap: clamp(1rem, 3vw, 1.45rem);
  width: 100vw;
  margin: 0 calc(50% - 50vw);
  overflow: hidden;
  padding: 1rem 0 1.45rem;
}

.map-view__track {
  display: flex;
  align-items: stretch;
  gap: var(--track-gap);
  width: max-content;
  padding-inline: max(1.2rem, calc((100vw - var(--card-w)) / 2));
  animation: mapCardsLoop 34s linear infinite;
}

.map-view__card {
  --habitat-card-width: var(--card-w);
  flex: 0 0 var(--habitat-card-width);
  max-width: var(--habitat-card-width);
  transform-origin: center center;
  transition: transform 0.25s ease, filter 0.24s ease;
  will-change: transform;
}

.map-view__carousel:hover .map-view__track,
.map-view__carousel:focus-within .map-view__track {
  animation-play-state: paused;
}

.map-view__carousel--reduced {
  overflow-x: auto;
  padding-bottom: 1rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-color: rgba(37, 99, 235, 0.7) rgba(148, 163, 184, 0.22);
  scrollbar-width: auto;
}

.map-view__carousel--reduced .map-view__track {
  width: max-content;
  animation: none;
}

@media (max-width: 767px) {
  .map-view {
    padding-top: 5.2rem;
  }

  .map-view__header {
    text-align: left;
  }

  .map-view__summary {
    justify-content: flex-start;
  }

  .map-view__carousel {
    --card-w: min(335px, 84vw);
    padding-block: 0.75rem 1.1rem;
  }
}

@media (min-width: 980px) {
  .map-view__carousel {
    --card-w: clamp(330px, 30vw, 390px);
    --track-gap: 1.45rem;
  }
}

@keyframes mapCardsLoop {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - (var(--track-gap) / 2)));
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-view__carousel {
    overflow-x: auto;
    scroll-behavior: auto;
  }

  .map-view__track {
    animation: none;
  }
}
</style>
