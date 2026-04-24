<template>
  <section class="habitat-map">
    <header v-if="!isMobile" class="map-header">
      <div class="map-header-main">
        <p class="map-eyebrow">Mapa de aventura</p>
        <h1>{{ currentZone?.levelName || 'Escuela mágica' }}</h1>
        <p class="map-sub-desktop">{{ currentZone?.themeTitle || 'Siguiente misión disponible' }}</p>
      </div>
    </header>

    <section
      v-if="isMobile"
      ref="mobileTrackRef"
      class="mobile-map-track"
      aria-label="Mapa deslizante de hábitats"
    >
      <article
        v-for="habitat in enrichedHabitats"
        :key="`mobile-${habitat.id}`"
        :ref="(el) => setMobileSlideRef(el, habitat.id)"
        class="mobile-habitat-slide"
        :class="{
          'mobile-habitat-slide--active': habitat.id === mobileVisibleHabitatId,
          'mobile-habitat-slide--next': habitat.id === mobileFocusHabitatId,
          'mobile-habitat-slide--locked': !habitat.unlocked
        }"
      >
        <div class="mobile-habitat-content">
          <div class="mobile-character-wrap">
            <img v-if="habitat.character" :src="habitat.character" :alt="habitat.levelName" />
            <span v-else class="node-icon">{{ habitat.icon }}</span>
          </div>

          <p class="mobile-habitat-eyebrow">{{ habitat.themeTitle }}</p>
          <h2 class="mobile-habitat-title">{{ habitat.levelName }}</h2>
          <p class="mobile-habitat-description">{{ habitat.description }}</p>

          <div class="mobile-progress-wrap" :aria-label="`Progreso de ${habitat.levelName}`">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${progressPercent(habitat)}%` }"></div>
            </div>
            <p class="progress-label">{{ progressSummary(habitat) }}</p>
          </div>

          <div class="mobile-actions">
            <button
              v-if="nextHabitatId(habitat.id)"
              type="button"
              class="mobile-next-icon tap-pop"
              @click="scrollToHabitat(nextHabitatId(habitat.id), 'smooth')"
              aria-label="Siguiente hábitat"
            >
              <img src="/icons/next.PNG" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    </section>

    <div v-else class="map-canvas" :style="mapCanvasStyle">
      <div class="map-meadow" aria-hidden="true"></div>

      <!-- NODOS -->
      <div
        v-for="(habitat, index) in enrichedHabitats"
        :key="habitat.id"
        class="map-node"
        tabindex="0"
        :class="[nodeClass(habitat, index), { 'map-node--pulse': recentlyUnlocked === habitat.id }]"
        :style="nodeStyle(habitat.coords)"
        @mouseenter="handleHabitatHover(habitat.id)"
        @focus="handleHabitatHover(habitat.id)"
      >
        <div class="node-label">
          <p class="node-title">{{ habitat.levelName }}</p>
          <p class="node-progress">
            {{ habitat.progress.completedStages }}/{{ habitat.progress.totalStages }} etapas
          </p>
        </div>

        <RouterLink
          v-if="habitat.unlocked"
          :to="`/game/${habitat.id}/${habitat.progress.nextStage}`"
          class="node-icon-wrap tap-pop"
          :style="{ borderColor: habitat.color }"
          @click="handleMapTap($event)"
        >
          <img v-if="habitat.character" :src="habitat.character" :alt="habitat.levelName" />
          <span v-else class="node-icon">{{ habitat.icon }}</span>
        </RouterLink>

        <div v-else class="node-icon-wrap locked" :style="{ borderColor: habitat.color }">
          <img v-if="habitat.character" :src="habitat.character" :alt="habitat.levelName" />
          <span v-else class="node-icon">{{ habitat.icon }}</span>
        </div>

        <div class="node-progress-wrap" :aria-label="`Progreso de ${habitat.levelName}`">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${progressPercent(habitat)}%` }"></div>
          </div>
          <p class="progress-label">{{ progressSummary(habitat) }}</p>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'
import { useBillingStore } from '../store/billingStore'
import { getLevelDefinition, listLevels } from '../engine/logic/utils/validateTemplates'
import { playSfx } from '../utils/sfx'
import { playMusic, stopMusic } from '../engine/audio/audioManager'
import Perezoso from '../assets/characters/Perezoso.png'
import Zorro from '../assets/characters/Zorro.png'
import Oso from '../assets/characters/Oso.png'
import Mono from '../assets/characters/Mono.png'
import Elefante_graduado from '../assets/characters/Elefante_graduado.png'

// Definición estática de los hábitats para cada nivel
const HABITATS = {
  1: {
    title: 'El árbol',
    coords: { x: 28, y: 40 }
  },
  2: {
    title: 'Valle Anaranjado',
    coords: { x: 53, y: 43 }
  },
  3: {
    title: 'Isla de Lianas',
    coords: { x: 66, y: 58 }
  },
  4: {
    title: 'Santuario azul',
    coords: { x: 61, y: 84 }
  },
  5: {
    title: 'La Escuela',
    description: 'La meta final.',
    coords: { x: 28, y: 86 }
  }
}

const LEVEL_CHARACTERS = {
  1: Perezoso,
  2: Zorro,
  3: Oso,
  4: Mono,
  5: Elefante_graduado,
}

const HABITAT_SFX = {
  1: 'sloth',
  2: 'fox',
  3: 'bear',
  4: 'monkey',
  5: 'elephant'
}

const game = useGameStore()
game.load?.()
const billing = useBillingStore()
billing.load?.()
const profile = useProfileStore()
profile.loadProfile?.()
const recentlyUnlocked = ref(null)
const unlockStatus = ref(new Map())
const isMobile = ref(false)
const mobileTrackRef = ref(null)
const mobileSlides = ref({})
const previousMobileFocusId = ref(null)
const mobileVisibleHabitatId = ref(null)
let unlockTimer = null
const lastHoverSound = new Map()
let mediaQueryList = null
let mobileScrollRaf = null

const levelIds = listLevels()
  .map(Number)
  .filter((n) => Number.isFinite(n) && n > 0)
  .sort((a, b) => a - b)
  .concat(
    listLevels().length === 0 ? [1, 2, 3, 4, 5] : []
  )

const enrichedHabitats = computed(() => {
  const result = []
  levelIds.forEach((id, index) => {
    const def = getLevelDefinition(String(id))
    const meta = def?.meta ?? {}
    const theme = HABITATS[id] ?? {}
    const progress = game.getLevelProgress(id)
    const unlockedByPlan = billing.canAccessLevel?.(id) ?? true
    const unlocked = unlockedByPlan
    const isComplete = progress.percent === 1
    const cta = isComplete ? 'Revivir aventura' : unlocked ? 'Continuar' : 'Bloqueado'
    const progressLabel = isComplete ? 'Completado' : progress.nextStage
    result.push({
      id,
      icon: meta.icon ?? '🪄',
      character: LEVEL_CHARACTERS[id] || null,
      levelName: meta.levelName ?? `Nivel ${id}`,
      description: theme.description ?? meta.description ?? 'Explora este hábitat mágico.',
      color: meta.color ?? '#2563eb',
      themeTitle: theme.title ?? meta.animal ?? 'Hábitat mágico',
      coords: theme.coords ?? { x: 15 + index * 18, y: 50 + (index % 2 === 0 ? -15 : 15) },
      progress,
      progressLabel,
      unlocked,
      isComplete,
      cta
    })
  })
  return result
})

const mobileFocusHabitatId = computed(() => {
  const firstInProgress = enrichedHabitats.value.find((h) => h.unlocked && h.progress.percent < 1)
  if (firstInProgress) return firstInProgress.id

  const firstUnlocked = enrichedHabitats.value.find((h) => h.unlocked)
  if (firstUnlocked) return firstUnlocked.id

  return enrichedHabitats.value[0]?.id ?? null
})

const currentZone = computed(() => {
  const visibleId = mobileVisibleHabitatId.value
  if (visibleId) {
    const byVisible = enrichedHabitats.value.find((habitat) => habitat.id === visibleId)
    if (byVisible) return byVisible
  }
  return enrichedHabitats.value.find((habitat) => habitat.id === mobileFocusHabitatId.value) || enrichedHabitats.value[0] || null
})

watch(
  () => enrichedHabitats.value.map((h) => ({ id: h.id, unlocked: h.unlocked })),
  (current) => {
    if (!current?.length) return
    if (!unlockStatus.value.size) {
      const baseline = new Map()
      current.forEach((item) => baseline.set(item.id, item.unlocked))
      unlockStatus.value = baseline
      return
    }
    const updated = new Map(unlockStatus.value)
    current.forEach((item) => {
      const wasUnlocked = updated.get(item.id)
      updated.set(item.id, item.unlocked)
      const wasTracked = wasUnlocked !== undefined
      if (item.unlocked && (wasUnlocked === false || (!wasTracked && unlockStatus.value.size))) {
        triggerUnlockFx(item.id)
      }
    })
    unlockStatus.value = updated
  },
  { deep: true, immediate: true }
)

const childName = computed(() => profile.childName || game.child?.name || '')
const childInitials = computed(() => (childName.value ? childName.value[0]?.toUpperCase() : '⭐'))

const activityLog = computed(() => {
  const entries = []
  for (const [levelId, stages] of Object.entries(game.stages || {})) {
    const def = getLevelDefinition(levelId)
    const levelName = def?.meta?.levelName ?? `Nivel ${levelId}`
    const icon = def?.meta?.icon ?? '⭐'
    Object.values(stages || {}).forEach((stage) => {
      if (!stage?.done) return
      entries.push({
        id: `${levelId}-${stage.stage}`,
        levelName,
        icon,
        stage: stage.stage,
        result: { ok: stage.ok, total: stage.total },
        completedAt: stage.completedAt
      })
    })
  }
  return entries.sort((a, b) => new Date(b.completedAt ?? 0) - new Date(a.completedAt ?? 0)).slice(0, 8)
})

const mapCanvasStyle = computed(() => ({
  background: 'linear-gradient(180deg, var(--color-sky) 0%, var(--color-sky) 48%, #a3df77 49%, #9bd76d 100%)',
  boxShadow: 'none',
  backgroundColor: 'var(--color-sky)'
}))

function triggerUnlockFx(id) {
  recentlyUnlocked.value = id
  playSfx('unlock')
  if (unlockTimer) {
    clearTimeout(unlockTimer)
  }
  unlockTimer = setTimeout(() => {
    recentlyUnlocked.value = null
  }, 1800)
}

function nodeStyle(coords) {
  return {
    left: `${coords.x}%`,
    top: `${coords.y}%`
  }
}

function setMobileSlideRef(el, habitatId) {
  if (!habitatId) return
  if (el) {
    mobileSlides.value[habitatId] = el
    return
  }
  delete mobileSlides.value[habitatId]
}

function nextHabitatId(currentId) {
  const index = enrichedHabitats.value.findIndex((h) => h.id === currentId)
  if (index < 0 || index + 1 >= enrichedHabitats.value.length) return null
  return enrichedHabitats.value[index + 1].id
}

function scrollToHabitat(habitatId, behavior = 'smooth') {
  const node = mobileSlides.value[habitatId]
  if (!node) return
  node.scrollIntoView({ inline: 'center', block: 'nearest', behavior })
}

function handleMapTap(event) {
  if (event?.currentTarget?.classList) {
    event.currentTarget.classList.remove('is-tapped')
    requestAnimationFrame(() => {
      event.currentTarget.classList.add('is-tapped')
      setTimeout(() => event.currentTarget?.classList?.remove('is-tapped'), 170)
    })
  }
}

function resolveSlideFocusFromScroll() {
  const track = mobileTrackRef.value
  if (!track) return
  const centerX = track.scrollLeft + track.clientWidth / 2
  let nearestId = null
  let nearestDistance = Number.POSITIVE_INFINITY
  Object.entries(mobileSlides.value).forEach(([id, node]) => {
    if (!node) return
    const nodeCenter = node.offsetLeft + node.offsetWidth / 2
    const distance = Math.abs(centerX - nodeCenter)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestId = Number(id)
    }
  })
  if (nearestId) {
    mobileVisibleHabitatId.value = nearestId
  }
}

function onMobileTrackScroll() {
  if (mobileScrollRaf) return
  mobileScrollRaf = requestAnimationFrame(() => {
    mobileScrollRaf = null
    resolveSlideFocusFromScroll()
  })
}

function handleHabitatHover(id) {
  const soundKey = HABITAT_SFX[id]
  if (!soundKey) return
  const now = Date.now()
  const last = lastHoverSound.get(id) || 0
  if (now - last < 650) return
  lastHoverSound.set(id, now)
  playSfx(soundKey)
}

function nodeClass(habitat, index) {
  return {
    active: habitat.unlocked && habitat.progress.percent < 1,
    locked: !habitat.unlocked,
    complete: habitat.isComplete || (index === 0 && habitat.progress.percent === 1)
  }
}

function progressPercent(habitat) {
  const done = Number(habitat?.progress?.completedStages) || 0
  const total = Number(habitat?.progress?.totalStages) || 1
  return Math.max(0, Math.min(100, (done / total) * 100))
}

function progressSummary(habitat) {
  const done = Number(habitat?.progress?.completedStages) || 0
  const total = Number(habitat?.progress?.totalStages) || 0
  return `${done}/${total} etapas`
}

function formatDate(date) {
  if (!date) return 'Reciente'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(date))
}

function updateViewportMode() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    isMobile.value = false
    return
  }
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
}

onMounted(() => {
  updateViewportMode()
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryList = window.matchMedia('(max-width: 768px)')
    mediaQueryList.addEventListener?.('change', updateViewportMode)
  }
  window.addEventListener('resize', updateViewportMode, { passive: true })
  playMusic('nature', { loop: true })
})

onBeforeUnmount(() => {
  if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf)
  mobileScrollRaf = null
  mobileTrackRef.value?.removeEventListener?.('scroll', onMobileTrackScroll)
  mediaQueryList?.removeEventListener?.('change', updateViewportMode)
  window.removeEventListener('resize', updateViewportMode)
  stopMusic(200)
})

watch(
  () => [isMobile.value, mobileFocusHabitatId.value, enrichedHabitats.value.length],
  ([mobile, focusId]) => {
    if (!mobile || !focusId) return
    const focusChanged = previousMobileFocusId.value !== focusId
    previousMobileFocusId.value = focusId
    const behavior = focusChanged ? 'smooth' : 'auto'
    if (!mobileVisibleHabitatId.value) {
      mobileVisibleHabitatId.value = focusId
    }
    setTimeout(() => {
      scrollToHabitat(focusId, behavior)
      resolveSlideFocusFromScroll()
    }, 20)
  },
  { immediate: true }
)

watch(
  () => mobileTrackRef.value,
  (track, previous) => {
    previous?.removeEventListener?.('scroll', onMobileTrackScroll)
    if (!track) return
    track.addEventListener('scroll', onMobileTrackScroll, { passive: true })
    setTimeout(resolveSlideFocusFromScroll, 40)
  },
  { immediate: true }
)
</script>

<style scoped>

/* same styles as previous map (copy from Levels) */
.habitat-map {
  padding: 0;
  color: #0f172a;
  font-family: var(--font-readable, 'Lexend', 'Baloo 2', 'Segoe UI', sans-serif);
  position: relative;
  min-height: 100vh;
}

.map {
  background-image: url('/images/map-background.png');
}

.map-view {
  background-image: url('/images/map-background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.map-header {
  position: absolute;
  inset: auto clamp(0.9rem, 2.2vw, 1.6rem) clamp(4.2rem, 8.5vw, 5.6rem) auto;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  z-index: 4;
  color: #0f172a;
}
.map-header-main {
  display: grid;
  gap: 0.12rem;
  justify-items: start;
  text-align: left;
  padding: 0.68rem 0.85rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(248, 251, 255, 0.72);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(3px);
}
.map-eyebrow {
  margin: 0;
  font-size: 0.78rem;
  color: #334155;
  font-weight: 700;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: #94a3b8;
}
.map-header h1 {
  font-size: clamp(1.05rem, 3.2vw, 1.55rem);
  margin: 0;
  color: #0f172a;
  line-height: 1.2;
}
.sub {
  margin: 0;
  max-width: 540px;
  color: #334155;
  font-size: 0.92rem;
}
.map-sub-desktop {
  margin: 0;
  max-width: min(48ch, 100%);
  color: #334155;
  font-size: 0.92rem;
  line-height: 1.4;
  text-align: left;
}

.mobile-map-track {
  min-height: calc(100dvh - 92px);
  display: flex;
  gap: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-top: 110px;
  background-image: url('/images/map-background-mobile.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-color: #ace8fb;
  box-shadow: none;
}
.mobile-map-track::-webkit-scrollbar {
  height: 0;
}
.mobile-habitat-slide {
  position: relative;
  min-width: 100vw;
  width: 100vw;
  min-height: calc(100dvh - 92px);
  scroll-snap-align: center;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0.8rem 0.9rem;
  transition: transform 0.36s ease, opacity 0.36s ease, filter 0.36s ease;
  opacity: 0.84;
  transform: scale(0.975);
  filter: saturate(0.9);
}
.mobile-habitat-slide--active {
  opacity: 1;
  transform: scale(1);
  filter: saturate(1);
}
.mobile-habitat-slide--next .mobile-character-wrap {
  animation: none;
}
.mobile-habitat-content {
  position: relative;
  z-index: 1;
  width: min(100%, 560px);
  border-radius: 0;
  border: none;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
  padding: 0.9rem 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.62rem;
}
.mobile-habitat-eyebrow {
  margin: 0;
  align-self: flex-start;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 247, 205, 0.95);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #3f4f1b;
}
.mobile-habitat-title {
  margin: 0;
  font-size: clamp(1.5rem, 5.6vw, 2rem);
  color: #14532d;
  text-shadow: none;
  line-height: 1.2;
}
.mobile-habitat-description {
  margin: 0;
  color: rgb(20, 90, 20);
  font-size: 0.98rem;
  line-height: 1.45;
}
.mobile-character-wrap {
  position: relative;
  align-self: center;
  width: 236px;
  height: 236px;
  border-radius: 0;
  background: transparent;
  border: none;
  display: grid;
  place-items: center;
  box-shadow: none;
}
.mobile-character-wrap img {
  width: 126%;
  height: 126%;
  object-fit: contain;
  animation: float 3.8s ease-in-out infinite;
  filter: drop-shadow(0 12px 24px rgba(15, 23, 42, 0.35));
}
.mobile-progress-wrap,
.node-progress-wrap {
  margin-top: 0.4rem;
  width: min(100%, 220px);
  align-self: center;
  display: grid;
  gap: 0.3rem;
}
.progress-track {
  width: 100%;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(241, 245, 249, 0.98) 0%, rgba(226, 232, 240, 0.96) 100%);
  border: 1px solid rgba(15, 23, 42, 0.12);
  overflow: hidden;
  box-shadow: inset 0 2px 3px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.14);
}
.progress-fill {
  position: relative;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #65a30d 0%, #a3e635 45%, #fde047 100%);
  box-shadow:
    inset 0 -2px 2px rgba(133, 77, 14, 0.28),
    inset 0 1px 1px rgba(255, 255, 255, 0.35),
    0 0 8px rgba(163, 230, 53, 0.6),
    0 0 16px rgba(250, 204, 21, 0.4);
  transition: width 0.25s ease;
}
.progress-fill::after {
  content: '';
  position: absolute;
  inset: 1px 3px auto 3px;
  height: 42%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}
.progress-label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}
.mobile-actions {
  margin-top: 0.2rem;
  display: flex;
  justify-content: center;
}
.mobile-next-icon {
  width: 84px;
  height: 84px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0;
}
.mobile-next-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: none;
}
.mobile-next-icon:active {
  transform: scale(0.97);
}
.map-canvas {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 760px;
  max-height: none;
  margin: 0;
  border-radius: 0;
  overflow: hidden;
}
.map-meadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url('/images/map-background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.map-node {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 132px;
  z-index: 3;
  pointer-events: auto;
}
.map-node:hover .node-label,
.map-node:focus-within .node-label {
  opacity: 1;
  transform: translate(-50%, -140%);
}
.node-icon-wrap {
  width: 108px;
  height: 108px;
  border-radius: 999px;
  background: transparent;
  display: grid;
  place-items: center;
  box-shadow: none;
  transition: transform 0.25s ease, filter 0.25s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 2;
}
.node-icon-wrap::before {
  content: none;
}
.node-icon-wrap:hover {
  transform: translateY(-6px);
}
.node-icon-wrap.locked {
  opacity: 0.5;
  cursor: default;
}
.node-icon {
  font-size: 3rem;
  animation: float 4s ease-in-out infinite;
}
.node-icon-wrap img {
  width: 82%;
  height: 82%;
  object-fit: contain;
  animation: float 4s ease-in-out infinite;
  filter: none;
  position: relative;
  z-index: 1;
}
.node-label {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -110%);
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  box-shadow: none;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  width: max-content;
  min-width: 160px;
  pointer-events: none;
  text-align: center;
  z-index: 5;
}
.node-title {
  font-weight: 600;
}
.node-progress {
  font-size: 0.85rem;
  color: #475569;
}
.map-node.complete .node-icon-wrap {
  box-shadow: none;
}
.map-node.active .node-icon-wrap {
  animation: none;
  transform: none;
}
.map-node.active .node-icon-wrap::before {
  opacity: 0;
}
.map-node.active .node-icon-wrap img {
  filter: none;
}
.map-node--pulse .node-icon-wrap {
  animation: unlockGlow 1.4s ease;
  box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.35);
}
.map-node.locked {
  opacity: 0.6;
  filter: grayscale(0.2);
}
@keyframes unlockGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.3);
    transform: translateY(-2px) scale(0.96);
  }
  60% {
    box-shadow: 0 0 40px rgba(250, 204, 21, 0.7);
    transform: translateY(-10px) scale(1.04);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
    transform: translateY(0) scale(1);
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.tap-pop {
  transform: scale(1);
}
.tap-pop.is-tapped {
  animation: tapPop 0.18s ease;
}
@keyframes tapPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.log-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}
.log-panel h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.log-list {
  display: grid;
  gap: 0.8rem;
}
.log-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border-radius: 1rem;
  background: #f8fafc;
}
.log-icon {
  width: 42px;
  height: 42px;
  border-radius: 1rem;
  background: #e0e7ff;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}
.log-title {
  font-weight: 600;
}
.log-meta {
  font-size: 0.85rem;
  color: #475569;
}
.log-empty {
  color: #94a3b8;
}

@media (prefers-reduced-motion: reduce) {
  .map-node--pulse .node-icon-wrap {
    animation: none;
  }
  .mobile-habitat-slide,
  .mobile-habitat-slide--next .mobile-character-wrap,
  .tap-pop.is-tapped {
    animation: none;
    transition: none;
    transform: none;
  }
}

@media (max-width: 768px) {
  .habitat-map {
    min-height: 100dvh;
    width: 100%;
    margin: 0;
  }
  .map-header {
    position: relative;
    inset: auto;
    margin: 0.35rem 0.55rem 0;
    padding: 0.5rem 0.62rem;
    gap: 0.44rem;
  }
  .map-canvas {
    height: 100dvh;
    min-height: 640px;
    max-height: none;
    width: 100%;
    border-radius: 0;
  }
  .map-meadow {
    background-image: url('/images/map-background-mobile.png');
    background-size: cover;
    background-position: center top;
    background-color: #ace8fb;
  }
  .map-node {
    width: 88px;
  }
  .node-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 18px;
  }
  .node-label {
    display: none;
  }
  .map-header h1 {
    font-size: clamp(1.2rem, 6.4vw, 1.6rem);
  }
  .sub {
    font-size: 0.88rem;
  }
  .map-sub-desktop { display: none; }
}

@media (max-width: 480px) {
  .map-canvas {
    height: 100dvh;
    min-height: 600px;
  }
  .map-node {
    width: 78px;
  }
  .node-icon-wrap {
    width: 72px;
    height: 72px;
  }
}

</style>
