<template>
  <section class="map-view">
    <header class="map-view__header">
      <p class="map-view__eyebrow">Mapa de niveles</p>
      <h1>Elige tu próxima aventura</h1>
      <p>Explora cada hábitat, consigue estrellas y desbloquea nuevos retos.</p>
    </header>

    <div class="map-view__rail" :class="{ 'map-view__rail--reduced': prefersReducedMotion }">
      <HabitatCard
        v-for="level in levels"
        :key="level.id"
        :level="level"
        class="map-view__card"
        @enter="handleEnter"
      />
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
    habitat: '/images/habitats/sloth-tree.png',
    character: '/images/characters/sloth.png',
    fallbackTitle: 'Árbol de la Calma'
  },
  {
    id: 'fox',
    levelId: 2,
    characterName: 'Zorro',
    habitatDescription: 'La Madriguera',
    habitat: '/images/habitats/fox-burrow.png',
    character: '/images/characters/fox.png',
    fallbackTitle: 'Madriguera de Palabras'
  },
  {
    id: 'bear',
    levelId: 3,
    characterName: 'Oso',
    habitatDescription: 'El bosque de Miel',
    habitat: '/images/habitats/bear-honey.png',
    character: '/images/characters/bear.png',
    fallbackTitle: 'Bosque de la Miel'
  },
  {
    id: 'monkey',
    levelId: 4,
    characterName: 'Mono',
    habitatDescription: 'Mundo lianas',
    habitat: '/images/habitats/monkey-jungle.png',
    character: '/images/characters/monkey.png',
    fallbackTitle: 'Jungla de las Letras'
  },
  {
    id: 'elephant',
    levelId: 5,
    characterName: 'Elefante',
    habitatDescription: 'La escuela mágica',
    habitat: '/images/habitats/elephant-school.png',
    character: '/images/characters/elephant.png',
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

    return {
      ...entry,
      title: stageTitle,
      description: `${entry.characterName}: ${entry.habitatDescription}.`,
      stars,
      locked,
      route: `/game/${entry.levelId}/${progress.nextStage}`
    }
  })
})

function onMotionChange(event) {
  prefersReducedMotion.value = Boolean(event.matches)
}

function handleEnter(level) {
  if (!level || level.locked) return
  router.push(level.route).catch(() => {})
}

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
    radial-gradient(circle at 8% 10%, rgba(250, 204, 21, 0.2) 0, transparent 42%),
    radial-gradient(circle at 92% 8%, rgba(147, 250, 96, 0.2) 0, transparent 45%),
    linear-gradient(180deg, #f0ffdf 0%, #f7fcff 50%, #ffffff 100%);
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

.map-view__rail {
  width: min(1200px, 100%);
  margin: 0 auto;
  display: flex;
  gap: clamp(0.7rem, 2.8vw, 1.2rem);
  overflow-x: auto;
  padding: 0.6rem 0.2rem 1rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.map-view__rail::-webkit-scrollbar {
  height: 8px;
}

.map-view__rail::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.35);
  border-radius: 999px;
}

.map-view__card {
  scroll-snap-align: center;
}

@media (min-width: 980px) {
  .map-view__rail {
    overflow: visible;
    display: grid;
    grid-template-columns: repeat(3, minmax(280px, 1fr));
    align-items: stretch;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-view,
  .map-view__rail {
    scroll-behavior: auto;
  }
}
</style>
