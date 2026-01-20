<template>
  <section class="habitat-map">
    <header class="map-header">
      <div>
        <h1>Escuela mágica</h1>
        <p class="sub">
          Explora cada territorio y sigue tu ruta del tesoro.
        </p>
      </div>
      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot legend-dot-active" />
          Etapa actual
        </div>
        <div class="legend-item">
          <span class="legend-dot legend-dot-done" />
          Hábitat completado
        </div>
      </div>
    </header>

    <div class="map-canvas" :style="mapCanvasStyle">

      <!-- 🌤️ CAPA DE NUBES EN PARALLAX -->
      <div class="cloud-layer">
        <div class="cloud cloud-a"></div>
        <div class="cloud cloud-b"></div>
        <div class="cloud cloud-c"></div>
        <div class="cloud cloud-d"></div>
        <div class="cloud cloud-e"></div>
        <div class="cloud cloud-f"></div>
        <div class="cloud cloud-g"></div>
      </div>

      <!-- PATH DEL MAPA -->
      <svg class="map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          :points="pathPoints"
          fill="none"
          stroke="#d9b48c"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="2 1.4"
        />
      </svg>

      <!-- HÁBITATS -->
      <div
        v-for="habitat in enrichedHabitats"
        :key="`bg-${habitat.id}`"
        class="habitat-bg"
        :style="habitatStyle(habitat)"
        aria-hidden="true"
      />

      <!-- NODOS -->
      <div
        v-for="(habitat, index) in enrichedHabitats"
        :key="habitat.id"
        class="map-node"
        tabindex="0"
        :class="nodeClass(habitat, index)"
        :style="nodeStyle(habitat.coords)"
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
          class="node-icon-wrap"
          :style="{ borderColor: habitat.color }"
        >
          <img v-if="habitat.character" :src="habitat.character" :alt="habitat.levelName" />
          <span v-else class="node-icon">{{ habitat.icon }}</span>
        </RouterLink>

        <div v-else class="node-icon-wrap locked" :style="{ borderColor: habitat.color }">
          <img v-if="habitat.character" :src="habitat.character" :alt="habitat.levelName" />
          <span v-else class="node-icon">{{ habitat.icon }}</span>
        </div>

        <span class="node-base" :style="{ backgroundColor: habitat.color }" />
      </div>
    </div>

  </section>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import { getLevelDefinition, listLevels } from '../engine/logic/utils/validateTemplates'
import Perezoso from '../assets/characters/Perezoso.png'
import Zorro from '../assets/characters/Zorro.png'
import Mono from '../assets/characters/Mono.png'
import Elefante from '../assets/characters/Elefante.png'
import ElefanteGraduado from '../assets/characters/Elefante-graduado.png'
import HabitatArbol from '../assets/habitat/arbol.PNG'
import HabitatMadriguera from '../assets/habitat/madriguera.PNG'
import HabitatIsla from '../assets/habitat/isla_lianas.PNG'
import HabitatSantuario from '../assets/habitat/santuario.PNG'
import HabitatEscuela from '../assets/habitat/escuela.PNG'

// Todas las imágenes del mapa deben estar en /src/assets/habitat
const HABITAT_IMAGES = {
  arbol: HabitatArbol,
  madriguera: HabitatMadriguera,
  isla: HabitatIsla,
  santuario: HabitatSantuario,
  escuela: HabitatEscuela
}

// Definición estática de los hábitats para cada nivel
const HABITATS = {
  1: {
    title: 'El árbol',
    description: 'Donde habita el Oso Perezoso.',
    background: HABITAT_IMAGES.arbol,
    coords: { x: 14, y: 78 },
    pathIndex: 0
  },
  2: {
    title: 'Valle Anaranjado',
    description: 'La madriguera creativa del Zorro Astuto.',
    background: HABITAT_IMAGES.madriguera,
    coords: { x: 32, y: 50 },
    pathIndex: 1
  },
  3: {
    title: 'Isla de Lianas',
    description: 'Árboles altos y tambores para el Mono Curioso.',
    background: HABITAT_IMAGES.isla,
    coords: { x: 52, y: 74 },
    pathIndex: 2
  },
  4: {
    title: 'Santuario azul',
    description: 'Biblioteca acuática del Mono Avanzado.',
    background: HABITAT_IMAGES.santuario,
    coords: { x: 72, y: 46 },
    pathIndex: 3
  },
  5: {
    title: 'La Escuela',
    description: 'La meta final del Elefante Sabiondo.',
    background: HABITAT_IMAGES.escuela,
    coords: { x: 90, y: 60 },
    pathIndex: 4
  }
}

const LEVEL_CHARACTERS = {
  1: Perezoso,
  2: Zorro,
  3: Mono,
  4: Elefante,
  5: ElefanteGraduado
}

const game = useGameStore()
game.load?.()

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
    const previousComplete = index === 0 ? true : result[index - 1]?.progress.percent === 1
    const unlocked = index === 0 || previousComplete
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
      background: theme.background ?? '',
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

const pathPoints = computed(() => {
  const pts = enrichedHabitats.value
    .map((h) => `${h.coords.x},${h.coords.y}`)
    .join(' ')
  return pts
})

const childName = computed(() => game.child?.name || '')
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
  background: 'linear-gradient(to bottom, #cfe9ff 0%, #b8f6c2 50%, #7edc8d 100%)',
  boxShadow: 'inset 0 0 40px rgba(34, 139, 34, 0.26)',
  backgroundColor: '#cfe9ff'
}))

function nodeStyle(coords) {
  return {
    left: `${coords.x}%`,
    top: `${coords.y}%`
  }
}

function habitatStyle(habitat) {
  const size = 36
  const background = getHabitatBackground(habitat)
  if (!background) {
    return { display: 'none' }
  }
  return {
    left: `${habitat.coords.x}%`,
    top: `${habitat.coords.y}%`,
    width: `${size}%`,
    height: `${size}%`,
    backgroundImage: background,
    filter: 'drop-shadow(0 12px 24px rgba(15,23,42,0.25))',
    opacity: 0.9
  }
}

function resolveAsset(path) {
  if (!path) return ''
  if (/^(https?:|data:)/i.test(path)) return path
  if (path.startsWith('/')) return path
  if (/^images\//i.test(path)) return '/' + path.replace(/^\//, '')
  if (/^\/?public\//i.test(path)) return '/' + path.replace(/^\/?public\//i, '')
  return '/' + path.replace(/^\//, '')
}

function buildSvgBackground({ primary = '#0ea5e9', secondary = '#14b8a6', accent = '#f8fafc' }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${primary}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${secondary}" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bg)"/>
    <circle cx="80" cy="80" r="40" fill="${accent}" opacity="0.2"/>
    <circle cx="320" cy="70" r="50" fill="${accent}" opacity="0.18"/>
    <polygon points="200,40 240,160 160,160" fill="${accent}" opacity="0.3"/>
    <polygon points="80,200 130,340 30,340" fill="${accent}" opacity="0.35"/>
    <polygon points="320,210 370,360 270,360" fill="${accent}" opacity="0.35"/>
  </svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const HABITAT_ART = {
  1: buildSvgBackground({ primary: '#0f172a', secondary: '#0ea5e9', accent: '#a7f3d0' }),
  2: buildSvgBackground({ primary: '#9a3412', secondary: '#f97316', accent: '#fed7aa' }),
  3: buildSvgBackground({ primary: '#4c1d95', secondary: '#7c3aed', accent: '#ddd6fe' }),
  4: buildSvgBackground({ primary: '#0ea5e9', secondary: '#1e3a8a', accent: '#bfdbfe' }),
  5: buildSvgBackground({ primary: '#111827', secondary: '#2563eb', accent: '#fcd34d' })
}

function getHabitatBackground(habitat) {
  const resolved = resolveAsset(habitat.background)
  if (resolved) return `url(${resolved})`
  return HABITAT_ART[habitat.id] || HABITAT_ART[1]
}

function nodeClass(habitat, index) {
  return {
    active: habitat.unlocked && habitat.progress.percent < 1,
    locked: !habitat.unlocked,
    complete: habitat.isComplete || (index === 0 && habitat.progress.percent === 1)
  }
}

function formatDate(date) {
  if (!date) return 'Reciente'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(date))
}
</script>

<style scoped>

/* same styles as previous map (copy from Levels) */
.habitat-map {
  padding: 0;
  color: #0f172a;
  font-family: 'Baloo 2', 'Comic Sans MS', 'Segoe UI', sans-serif;
  position: relative;
  min-height: 100vh;
}
.map-header {
  position: absolute;
  inset: 1rem 1rem auto 1rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0;
  border-radius: 0;
  background: transparent;
  backdrop-filter: none;
  z-index: 4;
  color: #1f4d2d;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: #94a3b8;
}
.map-header h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0;
  color: #1f4d2d;
}
.sub {
  max-width: 540px;
  color: #2f5f3a;
}
.legend {
  display: none;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #475569;
}
.legend-dot {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  display: inline-block;
  background: #cbd5f5;
}
.legend-dot-active {
  background: #facc15;
}
.legend-dot-done {
  background: #34d399;
}
.map-canvas {
  position: relative;
  height: 70vh;
  border-radius: 24px;
  overflow: hidden;
}
.map-path {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.cloud-layer {
  position: absolute;
  inset: 0 0 auto 0;
  height: 120px;
  pointer-events: none;
  overflow: hidden;
}
/* 🌤️ NUBES EN PARALLAX */
.cloud-layer {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130%;
  height: 220px;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
}

.cloud {
  position: absolute;
  top: -30px;
  width: 200px;
  height: 70px;
  background: radial-gradient(circle at 40% 50%, rgba(255,255,255,0.95), rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.05));
  border-radius: 60px;
  filter: blur(0.8px);
  opacity: 0.9;
}

/* FORMAS DE ALGODÓN SUAVE */
.cloud::before,
.cloud::after {
  content: "";
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.cloud::before {
  width: 130px;
  height: 60px;
  top: -22px;
  left: 20px;
}

.cloud::after {
  width: 100px;
  height: 50px;
  top: 5px;
  left: 90px;
}

/* Velocidades diferentes para efecto parallax */
.cloud-a {
  left: 3%;
  top: 0;
  width: 180px;
  height: 64px;
  border-radius: 68px;
  animation: drift-a 16s linear infinite alternate;
}

.cloud-b {
  top: 52px;
  width: 240px;
  height: 86px;
  border-radius: 88px;
  left: 68%;
  animation: drift-b 24s linear infinite alternate-reverse;
}

.cloud-c {
  top: 138px;
  width: 160px;
  height: 58px;
  border-radius: 60px;
  left: 14%;
  animation: drift-c 20s linear infinite alternate;
}

.cloud-d {
  top: 90px;
  width: 220px;
  height: 78px;
  border-radius: 90px;
  left: 82%;
  animation: drift-d 26s linear infinite alternate-reverse;
}

.cloud-e {
  top: -10px;
  width: 190px;
  height: 58px;
  border-radius: 70px;
  left: 40%;
  animation: drift-e 30s linear infinite alternate-reverse;
}

.cloud-f {
  top: -120px;
  left: 25%;
  width: 110px;
  height: 48px;
  border-radius: 58px;
  opacity: 0.65;
  animation: drift-f 22s linear infinite alternate;
}

.cloud-g {
  top: -140px;
  left: 72%;
  width: 100px;
  height: 46px;
  border-radius: 50px;
  opacity: 0.55;
  animation: drift-g 24s linear infinite alternate-reverse;
}

/* ANIMACIONES */
@keyframes drift-a {
  0% { transform: translate3d(-30%, -4px, 0); }
  50% { transform: translate3d(0, 4px, 0); }
  100% { transform: translate3d(28%, -4px, 0); }
}

@keyframes drift-b {
  0% { transform: translate3d(-18%, 3px, 0); }
  50% { transform: translate3d(0, -6px, 0); }
  100% { transform: translate3d(22%, 3px, 0); }
}

@keyframes drift-c {
  0% { transform: translate3d(-24%, -3px, 0); }
  50% { transform: translate3d(0, 4px, 0); }
  100% { transform: translate3d(24%, -3px, 0); }
}

@keyframes drift-d {
  0% { transform: translate3d(-20%, 3px, 0); }
  50% { transform: translate3d(0, -3px, 0); }
  100% { transform: translate3d(20%, 3px, 0); }
}

@keyframes drift-e {
  0% { transform: translate3d(-22%, 2px, 0); }
  50% { transform: translate3d(0, -5px, 0); }
  100% { transform: translate3d(22%, 2px, 0); }
}

@keyframes drift-f {
  0% { transform: translate3d(-18%, -2px, 0); }
  50% { transform: translate3d(0, 3px, 0); }
  100% { transform: translate3d(18%, -2px, 0); }
}

@keyframes drift-g {
  0% { transform: translate3d(-16%, 1px, 0); }
  50% { transform: translate3d(0, -3px, 0); }
  100% { transform: translate3d(16%, 1px, 0); }
}

.map-bg-layer {
  position: absolute;
  inset: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.habitat-bg {
  position: absolute;
  transform: translate(-50%, -50%);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.92;
  border-radius: 28px;
  pointer-events: none;
  transition: filter 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.habitat-bg:hover {
  filter: drop-shadow(0 16px 28px rgba(15, 23, 42, 0.3));
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.02);
}
.map-node {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 132px;
  z-index: 2;
  pointer-events: auto;
}
.map-node:hover .node-label,
.map-node:focus-within .node-label {
  opacity: 1;
  transform: translate(-50%, -140%);
}
.node-icon-wrap {
  width: 118px;
  height: 118px;
  border-radius: 24px;
  background: transparent;
  display: grid;
  place-items: center;
  box-shadow: none;
  transition: transform 0.25s ease, filter 0.25s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 2;
}
.node-icon-wrap::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 28px;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.35), rgba(250, 204, 21, 0));
  opacity: 0;
  filter: blur(6px);
  transition: opacity 0.3s ease;
  z-index: 0;
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
  width: 88%;
  height: 88%;
  object-fit: contain;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.25));
  position: relative;
  z-index: 1;
}
.node-label {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -110%);
  background: #ffffff;
  color: #0f172a;
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
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
  animation: glow 2.5s ease-in-out infinite;
}
.map-node.active .node-icon-wrap::before {
  opacity: 1;
}
.map-node.active .node-icon-wrap img {
  filter: drop-shadow(0 12px 26px rgba(250, 204, 21, 0.55));
}
.map-node.locked {
  opacity: 0.6;
}
@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(250, 204, 21, 0.6);
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

@media (max-width: 768px) {
  .map-canvas {
    height: 100vh;
  }
  .map-node {
    width: 120px;
  }
  .map-header {
    flex-direction: column;
  }
}

</style>
