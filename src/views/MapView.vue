<template>
  <section class="map-view">
    <div class="map-view__carousel" aria-label="Mundos disponibles">
      <button
        class="map-view__arrow map-view__arrow--prev"
        type="button"
        :disabled="activeLevelIndex === 0"
        aria-label="Ver mundo anterior"
        @click="goToLevel(activeLevelIndex - 1)"
      >
        ‹
      </button>

      <div ref="trackRef" class="map-view__track" tabindex="0" @scroll.passive="handleCarouselScroll">
        <HabitatCard
          v-for="(level, index) in levels"
          :key="`${level.id}-${index}`"
          :level="level"
          class="map-view__card"
          :style="{ '--card-index': index, '--habitat-gradient': level.habitatGradient }"
          @enter="handleEnter"
        />
      </div>

      <button
        class="map-view__arrow map-view__arrow--next"
        type="button"
        :disabled="activeLevelIndex === levels.length - 1"
        aria-label="Ver siguiente mundo"
        @click="goToLevel(activeLevelIndex + 1)"
      >
        ›
      </button>

    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import HabitatCard from '../components/map/HabitatCard.vue'
import { useGameStore } from '../store/gameStore'
import { useBillingStore } from '../store/billingStore'
import { getLevelDefinition } from '../engine/logic/utils/validateTemplates'

const BearCharacter = '/images/characters/bear.png'
const ElephantCharacter = '/images/characters/elephant.png'
const FoxCharacter = '/images/characters/fox.png'
const MonkeyCharacter = '/images/characters/monkey.png'
const SlothCharacter = '/images/characters/sloth.png'

const habitatImages = {
  sloth: '/images/habitats/sloth-tree.png',
  fox: '/images/habitats/fox-burrow.png',
  bear: '/images/habitats/bear-honey-current.png',
  monkey: '/images/habitats/monkey-jungle-current.png',
  elephant: '/images/habitats/elephant-school-current.png'
}

const router = useRouter()
const game = useGameStore()
const billing = useBillingStore()
game.load?.()
billing.load?.()
const activeLevelIndex = ref(0)
const trackRef = ref(null)
let scrollRaf = 0

const levelBlueprint = [
  {
    id: 'sloth',
    levelId: 1,
    characterName: 'Oso perezoso',
    habitatDescription: 'El árbol',
    habitat: habitatImages.sloth,
    character: SlothCharacter,
    habitatGradient: 'radial-gradient(circle at 50% 35%, #f7f3d0 0%, #dcebb8 38%, #b8d9ad 72%, #9bc8aa 100%)',
    characterScale: 1,
    characterBottom: '-6%',
    characterMobileBottom: '-8%',
    fallbackTitle: 'Árbol de la Calma'
  },
  {
    id: 'fox',
    levelId: 2,
    characterName: 'Zorro',
    habitatDescription: 'La Madriguera',
    habitat: habitatImages.fox,
    character: FoxCharacter,
    habitatGradient: 'radial-gradient(circle at 50% 34%, #fff1dc 0%, #ffd8c2 38%, #f5b7b1 72%, #e99fb0 100%)',
    characterScale: 1,
    characterBottom: '-4%',
    characterMobileBottom: '-6%',
    fallbackTitle: 'Madriguera de Palabras'
  },
  {
    id: 'bear',
    levelId: 3,
    characterName: 'Oso',
    habitatDescription: 'El bosque de Miel',
    habitat: habitatImages.bear,
    character: BearCharacter,
    habitatGradient: 'radial-gradient(circle at 50% 34%, #fff8d8 0%, #fbe7a8 40%, #e8cf88 72%, #c9d89b 100%)',
    characterScale: 1,
    characterBottom: '-7%',
    characterMobileBottom: '-9%',
    fallbackTitle: 'Bosque de la Miel'
  },
  {
    id: 'monkey',
    levelId: 4,
    characterName: 'Mono',
    habitatDescription: 'Mundo lianas',
    habitat: habitatImages.monkey,
    character: MonkeyCharacter,
    habitatGradient: 'radial-gradient(circle at 50% 34%, #efffd6 0%, #ccecae 38%, #a5d9ad 70%, #84c9b5 100%)',
    characterScale: 1,
    characterBottom: '-3%',
    characterMobileBottom: '-5%',
    fallbackTitle: 'Jungla de las Letras'
  },
  {
    id: 'elephant',
    levelId: 5,
    characterName: 'Elefante',
    habitatDescription: 'La escuela mágica',
    habitat: habitatImages.elephant,
    character: ElephantCharacter,
    habitatGradient: 'radial-gradient(circle at 50% 34%, #f5f0ff 0%, #dcd8f7 38%, #c2d9f4 70%, #a9d7e8 100%)',
    characterScale: 1,
    characterBottom: '-6%',
    characterMobileBottom: '-8%',
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

function getStageLinks(levelId, def, progress, locked) {
  const subtypes = def?.subtypes || {}
  const order = Array.isArray(def?.order) && def.order.length ? def.order : Object.keys(subtypes)

  return order.map((subtype, index) => {
    const stageNumber = index + 1
    const title = def?.stageMeta?.[subtype]?.title || formatSubtypeLabel(subtype)
    const completedStages = Number(progress?.completedStages || 0)
    const nextStage = Number(progress?.nextStage || 1)
    const complete = completedStages >= stageNumber
    const current = !locked && nextStage === stageNumber
    const stageLocked = locked || (!complete && stageNumber > nextStage)

    return {
      id: `${levelId}-${stageNumber}`,
      number: stageNumber,
      title,
      count: Array.isArray(subtypes[subtype]) ? subtypes[subtype].length : 0,
      route: `/game/${levelId}/${stageNumber}`,
      locked: stageLocked,
      complete,
      current
    }
  })
}

function formatSubtypeLabel(value) {
  return String(value || 'Ejercicios')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function handleEnter(level) {
  if (!level || level.locked) return
  router.push(level.route).catch(() => {})
}

function goToLevel(index) {
  const track = trackRef.value
  if (!track || !levels.value.length) return
  const boundedIndex = Math.max(0, Math.min(index, levels.value.length - 1))
  activeLevelIndex.value = boundedIndex
  track.scrollTo({
    left: boundedIndex * track.clientWidth,
    behavior: 'smooth'
  })
}

function handleCarouselScroll() {
  if (scrollRaf) return
  scrollRaf = window.requestAnimationFrame(() => {
    const track = trackRef.value
    if (track?.clientWidth) {
      const nextIndex = Math.round(track.scrollLeft / track.clientWidth)
      activeLevelIndex.value = Math.max(0, Math.min(nextIndex, levels.value.length - 1))
    }
    scrollRaf = 0
  })
}

const stageTotal = computed(() => levels.value.reduce((total, level) => total + level.stageTotal, 0))
const completedStagesTotal = computed(() => levels.value.reduce((total, level) => total + level.completedStages, 0))
const unlockedTotal = computed(() => levels.value.filter((level) => !level.locked).length)

onBeforeUnmount(() => {
  if (scrollRaf) {
    window.cancelAnimationFrame(scrollRaf)
  }
})
</script>

<style scoped>
.map-view {
  --map-hero-background:
    radial-gradient(circle at 18% 16%, rgba(255, 245, 184, 0.86) 0%, rgba(255, 245, 184, 0) 36%),
    radial-gradient(circle at 82% 12%, rgba(255, 252, 218, 0.82) 0%, rgba(255, 252, 218, 0) 34%),
    linear-gradient(180deg, #fff7cf 0%, #fff1b8 46%, #fff9de 100%);
  min-height: 100dvh;
  padding: 0;
  background: var(--map-hero-background);
}

.map-view__header-zone {
  position: fixed;
  top: clamp(9.4rem, 16vw, 10.8rem);
  left: 50%;
  z-index: 18;
  width: min(460px, 100vw);
  height: clamp(5.2rem, 10vw, 6.4rem);
  transform: translateX(-50%);
}

.map-view__header {
  position: fixed;
  top: clamp(9.4rem, 16vw, 10.8rem);
  left: 50%;
  z-index: 19;
  width: min(430px, calc(100vw - 2rem));
  margin: 0;
  padding: clamp(0.42rem, 1vw, 0.56rem) clamp(0.56rem, 1.5vw, 0.76rem);
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(10px);
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(-0.7rem) scale(0.98);
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.map-view__header--visible,
.map-view__header-zone:hover .map-view__header,
.map-view__header-zone:focus-within .map-view__header {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0) scale(1);
}

.map-view__eyebrow {
  margin: 0 0 0.16rem;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 900;
  color: #0369a1;
}

.map-view__header h1 {
  margin: 0;
  color: #0f3560;
  font-size: clamp(1rem, 2.6vw, 1.32rem);
  line-height: 1.1;
}

.map-view__header p {
  margin: 0.24rem auto 0;
  max-width: 48ch;
  font-size: 0.72rem;
  color: #2f5f86;
  line-height: 1.22;
}

.map-view__summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.24rem;
  margin-top: 0.36rem;
}

.map-view__summary > * {
  display: inline-flex;
  padding: 0.24rem 0.44rem;
  border-radius: 999px;
  background: #ffffff;
  color: #166534;
  box-shadow: 0 8px 18px rgba(22, 101, 52, 0.12);
  font-size: 0.62rem;
  font-weight: 900;
}

.map-view__summary span {
  color: #1e5a86;
}

.map-view__carousel {
  --card-w: 100vw;
  --media-h: 100dvh;
  width: 100vw;
  min-height: 100dvh;
  margin: 0;
  overflow: hidden;
  position: relative;
}

.map-view__track {
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 100dvh;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.map-view__track::-webkit-scrollbar {
  display: none;
}

.map-view__card {
  --habitat-card-width: var(--card-w);
  --habitat-media-height: var(--media-h);
  --map-stage-top: clamp(4.85rem, 8.5vw, 5.9rem);
  --map-badge-top: clamp(9.25rem, 15vw, 10.9rem);
  flex: 0 0 var(--habitat-card-width);
  max-width: var(--habitat-card-width);
  min-height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  transform-origin: center center;
  transition: transform 0.25s ease, filter 0.24s ease;
  will-change: transform;
}

.map-view__arrow {
  position: fixed;
  top: 50%;
  z-index: 24;
  display: grid;
  place-items: center;
  width: clamp(42px, 5vw, 54px);
  height: clamp(42px, 5vw, 54px);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #0f3560;
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transform: translateY(-50%);
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
}

.map-view__arrow:hover:enabled,
.map-view__arrow:focus-visible:enabled {
  transform: translateY(-50%) scale(1.06);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.22);
}

.map-view__arrow:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.map-view__arrow--prev {
  left: clamp(0.75rem, 3vw, 1.6rem);
}

.map-view__arrow--next {
  right: clamp(0.75rem, 3vw, 1.6rem);
}

@media (max-width: 767px) {
  .map-view,
  .map-view__carousel,
  .map-view__track {
    width: 100%;
    max-width: 100vw;
  }

  .map-view__header-zone {
    width: min(100vw, 390px);
    top: 8.7rem;
    height: 5.8rem;
  }

  .map-view__header {
    top: 8.7rem;
    width: min(100% - 1rem, 340px);
    padding: 0.36rem 0.46rem;
    text-align: left;
  }

  .map-view__header h1 {
    font-size: 0.92rem;
  }

  .map-view__header p {
    margin-top: 0.2rem;
    font-size: 0.66rem;
    line-height: 1.22;
  }

  .map-view__summary {
    justify-content: flex-start;
    gap: 0.2rem;
    margin-top: 0.28rem;
  }

  .map-view__summary > * {
    padding: 0.2rem 0.32rem;
    font-size: 0.58rem;
  }

  .map-view__carousel {
    --card-w: 100vw;
    --media-h: 100dvh;
  }

  .map-view__card {
    --map-stage-top: 4.55rem;
    --map-badge-top: 8.9rem;
    width: 100vw;
    max-width: 100vw;
    min-width: 100vw;
  }

  .map-view__arrow {
    width: 40px;
    height: 40px;
    font-size: 1.85rem;
  }

  .map-view__arrow--prev {
    left: 0.45rem;
  }

  .map-view__arrow--next {
    right: 0.45rem;
  }
}

@media (max-width: 380px) {
  .map-view__arrow {
    width: 34px;
    height: 34px;
    font-size: 1.6rem;
  }

  .map-view__arrow--prev {
    left: 0.25rem;
  }

  .map-view__arrow--next {
    right: 0.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-view__track {
    scroll-behavior: auto;
  }

  .map-view__arrow {
    transition: none;
  }
}
</style>
