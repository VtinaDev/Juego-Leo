<template>
  <section class="map-view">
    <header class="map-view__header">
      <p class="map-view__eyebrow">Mapa de niveles</p>
      <h1>Elige tu próxima aventura</h1>
      <p>Explora cada hábitat, consigue estrellas y desbloquea nuevos retos.</p>
    </header>

    <div ref="railRef" class="map-view__rail" :class="{ 'map-view__rail--reduced': prefersReducedMotion }">
      <HabitatCard
        v-for="(level, index) in levels"
        :key="level.id"
        :ref="(el) => setCardRef(el, index)"
        :level="level"
        class="map-view__card"
        @enter="handleEnter"
      />
    </div>

    <button v-if="levels.length > 1" class="map-view__swipe-cta" type="button" @click="scrollToNextLevel">
      Deslizar niveles ↔
    </button>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const railRef = ref(null)
const cardRefs = ref([])
let motionQueryList = null
let rafId = 0

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

function setCardRef(el, index) {
  if (!el) {
    cardRefs.value[index] = null
    return
  }
  cardRefs.value[index] = el
}

function resetCardScale() {
  cardRefs.value.forEach((card) => {
    if (!card) return
    card.style.setProperty('--card-scale', '1')
    card.style.setProperty('--card-lift', '0px')
  })
}

function updateCardScaleByCenter() {
  const rail = railRef.value
  if (!rail || prefersReducedMotion.value) {
    resetCardScale()
    return
  }

  const hasHorizontalCarousel = rail.scrollWidth > rail.clientWidth + 4
  if (!hasHorizontalCarousel) {
    resetCardScale()
    return
  }

  const railRect = rail.getBoundingClientRect()
  const railCenter = railRect.left + railRect.width / 2
  const maxDistance = Math.max(railRect.width / 2, 1)

  cardRefs.value.forEach((card) => {
    if (!card) return
    const cardRect = card.getBoundingClientRect()
    const cardCenter = cardRect.left + cardRect.width / 2
    const normalizedDistance = Math.min(Math.abs(cardCenter - railCenter) / maxDistance, 1)
    const proximity = 1 - normalizedDistance

    const scale = 0.98 + proximity * 0.16
    const lift = -proximity * 10

    card.style.setProperty('--card-scale', scale.toFixed(3))
    card.style.setProperty('--card-lift', `${lift.toFixed(1)}px`)
  })
}

function getCenteredCardIndex(cards, railCenter) {
  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    const distance = Math.abs(center - railCenter)
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = index
    }
  })

  return bestIndex
}

function queueScaleUpdate() {
  if (rafId) return
  rafId = window.requestAnimationFrame(() => {
    rafId = 0
    updateCardScaleByCenter()
  })
}

function onMotionChange(event) {
  prefersReducedMotion.value = Boolean(event.matches)
  if (prefersReducedMotion.value) {
    resetCardScale()
    return
  }
  queueScaleUpdate()
}

function handleEnter(level) {
  if (!level || level.locked) return
  router.push(level.route).catch(() => {})
}

function scrollToNextLevel() {
  const rail = railRef.value
  if (!rail) return
  const cards = cardRefs.value.filter(Boolean)
  if (cards.length < 2) return

  const railRect = rail.getBoundingClientRect()
  const railCenter = railRect.left + railRect.width / 2
  const currentIndex = getCenteredCardIndex(cards, railCenter)
  const nextIndex = (currentIndex + 1) % cards.length
  const behavior = prefersReducedMotion.value ? 'auto' : 'smooth'

  cards[nextIndex].scrollIntoView({
    behavior,
    inline: 'center',
    block: 'nearest'
  })
}

watch(
  () => levels.value.length,
  () => {
    nextTick(() => {
      queueScaleUpdate()
    })
  }
)

onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return

  motionQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQueryList.matches
  motionQueryList.addEventListener?.('change', onMotionChange)

  railRef.value?.addEventListener('scroll', queueScaleUpdate, { passive: true })
  window.addEventListener('resize', queueScaleUpdate, { passive: true })

  nextTick(() => {
    queueScaleUpdate()
  })
})

onBeforeUnmount(() => {
  motionQueryList?.removeEventListener?.('change', onMotionChange)
  railRef.value?.removeEventListener('scroll', queueScaleUpdate)
  window.removeEventListener('resize', queueScaleUpdate)
  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
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

.map-view__rail {
  width: 100vw;
  margin: 0 calc(50% - 50vw);
  display: flex;
  gap: clamp(0.7rem, 3.2vw, 1.2rem);
  overflow-x: auto;
  padding: 0.6rem clamp(0.8rem, 4vw, 1.1rem) 1rem;
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
  --habitat-card-width: calc(100vw - clamp(1.6rem, 8vw, 2.6rem));
  flex: 0 0 var(--habitat-card-width);
  max-width: var(--habitat-card-width);
  scroll-snap-align: center;
  transform: translateY(var(--card-lift, 0px)) scale(var(--card-scale, 1));
  transform-origin: center center;
  transition: transform 0.2s ease;
  will-change: transform;
}

.map-view__rail--reduced .map-view__card {
  transform: none !important;
  transition: none;
}

.map-view__swipe-cta {
  display: flex;
  width: fit-content;
  margin: 0.25rem auto 0;
  border: none;
  border-radius: 999px;
  min-height: 44px;
  padding: 0.7rem 1.15rem;
  font-weight: 900;
  font-size: 0.9rem;
  letter-spacing: 0.01em;
  color: #0b3c67;
  background: linear-gradient(180deg, #fde68a 0%, #facc15 55%, #eab308 100%);
  box-shadow: 0 10px 16px rgba(217, 119, 6, 0.28);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.map-view__swipe-cta:hover,
.map-view__swipe-cta:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 14px 22px rgba(217, 119, 6, 0.34);
  filter: brightness(1.02);
}

@media (min-width: 980px) {
  .map-view__rail {
    width: min(1200px, 100%);
    margin: 0 auto;
    overflow: visible;
    display: grid;
    grid-template-columns: repeat(3, minmax(280px, 1fr));
    align-items: stretch;
  }

  .map-view__card {
    --habitat-card-width: auto;
    flex: initial;
    max-width: none;
    transform: none;
  }

  .map-view__swipe-cta {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-view,
  .map-view__rail {
    scroll-behavior: auto;
  }
}
</style>
