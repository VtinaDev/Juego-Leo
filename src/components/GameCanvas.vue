<template>
  <div ref="mount" id="game-canvas">
    <div id="feedback" class="feedback"></div>
  </div>
</template>

<script setup>
import * as PIXI from 'pixi.js'
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { renderExercise } from '@/engine/visual/renderer'
import { useExerciseEngine } from '@/engine/logic/ExerciseEngine'
import { useIllustration } from '@/engine/visual/hooks/useIllustration'
import Perezoso from '@/assets/characters/Perezoso.png'
import Zorro from '@/assets/characters/Zorro.png'
import Mono from '@/assets/characters/Mono.png'
import Elefante from '@/assets/characters/Elefante.png'
import ElefanteGraduado from '@/assets/characters/Elefante-graduado.png'

const props = defineProps({
  exercise: { type: Object, default: null },
  handlers: {
    type: Object,
    default: () => ({})
  },
  level: {
    type: [String, Number],
    default: null
  },
  subtype: {
    type: String,
    default: null
  }
})

const mount = ref(null)
let app = null
let introTimeout = null
const engine = ref(null)

const isEngineMode = computed(() => !props.exercise && props.level !== null && props.subtype)
const activeExercise = computed(() => {
  if (isEngineMode.value) {
    return engine.value?.current.value ?? null
  }
  return props.exercise
})

const illustrationMeta = computed(() => {
  if (!isEngineMode.value) return {}
  return {
    level: props.level,
    subtype: props.subtype
  }
})

const { illustration, status: illustrationStatus } = useIllustration(activeExercise, illustrationMeta)
const levelCharacters = {
  1: Perezoso,
  2: Zorro,
  3: Mono,
  4: Mono,
  5: ElefanteGraduado
}

function fallbackIllustration(exercise) {
  const level = exercise?.level || props.level || 1
  return levelCharacters[level] || Perezoso
}

function ensureApp() {
  if (app) return
  app = new PIXI.Application({
    width: 900,
    height: 600,
    background: '#ffffff',
    antialias: true,
    resolution: window.devicePixelRatio || 1
  })
  if (mount.value) {
    mount.value.appendChild(app.view)
  }
}

function renderWithHandlers(exercise) {
  renderExercise(app, exercise, selectHandlers(exercise))
}

function selectHandlers(exercise) {
  if (isEngineMode.value && engine.value) {
    const activeEngine = engine.value
    return {
      onAnswer: (value, meta = {}) => activeEngine.checkAnswer(value, meta),
      onSubmit: (value, meta = {}) => activeEngine.checkAnswer(value, meta),
      onPlayAudio: (src, onEnd) => {
        if (src) {
          const audio = new Audio(src)
          audio.addEventListener('ended', () => onEnd?.())
          audio.play().catch(() => onEnd?.())
          return
        }
        activeEngine.playCurrentAudio?.({ onEnd })
        onEnd?.()
      }
    }
  }

  return {
    onAnswer: (value, meta = {}) => props.handlers.onAnswer?.(value, { ...meta, app }),
    onSubmit: (value, meta = {}) => props.handlers.onSubmit?.(value, { ...meta, app }),
    onPlayAudio: (src, onEnd) => {
      if (props.handlers.onPlayAudio) {
        props.handlers.onPlayAudio(src, onEnd)
        return
      }
      if (!src) return
      const audio = new Audio(src)
      audio.addEventListener('ended', () => onEnd?.())
      audio.play().catch(() => null)
    }
  }
}

function renderCurrent(exercise) {
  if (!app || !exercise) return
  if (!exercise.type) {
    console.error('Ejercicio sin tipo definido. Verifica templates.json.')
    return
  }

  if (introTimeout) {
    clearTimeout(introTimeout)
    introTimeout = null
  }

  const illustrationSrc = exercise.image || illustration.value || fallbackIllustration(exercise)
  const decorated = illustrationSrc ? { ...exercise, image: illustrationSrc } : exercise

  if (illustrationSrc && exercise.type !== 'image_scene' && illustrationStatus.value === 'ready') {
    renderExercise(app, {
      type: 'image_scene',
      image: illustrationSrc,
      caption: exercise.prompt || exercise.question || exercise.sentence
    })
    introTimeout = setTimeout(() => renderWithHandlers(decorated), 1400)
    return
  }

  if (illustrationStatus.value === 'loading') {
    renderExercise(app, {
      type: 'image_scene',
      image: illustrationSrc,
      caption: 'Generando ilustración...'
    })
    introTimeout = setTimeout(() => renderWithHandlers(decorated), 800)
    return
  }

  renderWithHandlers(decorated)
}

onMounted(() => {
  ensureApp()
  initializeEngineIfNeeded()
  renderCurrent(activeExercise.value)
})

watch(
  () => activeExercise.value?.id,
  () => {
    ensureApp()
    renderCurrent(activeExercise.value)
  }
)

watch(
  () => illustration.value,
  () => {
    if (!activeExercise.value) return
    ensureApp()
    renderCurrent(activeExercise.value)
  }
)

watch(
  () => illustrationStatus.value,
  () => {
    if (!activeExercise.value) return
    ensureApp()
    renderCurrent(activeExercise.value)
  }
)

watch(
  () => [props.level, props.subtype],
  ([lvl, sub]) => {
    if (!isEngineMode.value || !lvl || !sub) return
    initializeEngine(lvl, sub)
  }
)

function initializeEngineIfNeeded() {
  if (!isEngineMode.value || engine.value) return
  initializeEngine(props.level, props.subtype)
}

function initializeEngine(level, subtype) {
  if (!level || !subtype) return
  engine.value?.stopAudio?.()
  engine.value?.stopListening?.()
  engine.value = useExerciseEngine(String(level), subtype)
}

onBeforeUnmount(() => {
  if (introTimeout) {
    clearTimeout(introTimeout)
    introTimeout = null
  }
  engine.value?.stopAudio?.()
  engine.value?.stopListening?.()
  app?.destroy(true, true)
  app = null
})
</script>

<style scoped>
#game-canvas {
  width: 100%;
  min-height: 420px;
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: radial-gradient(circle at top, #f8fafc, #e0f2fe);
}

.feedback {
  position: absolute;
  top: 12px;
  right: 24px;
  padding: 10px 16px;
  border-radius: 9999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  font-family: 'Baloo 2', 'Comic Sans MS', 'Segoe UI', sans-serif;
  font-size: 16px;
  pointer-events: none;
  opacity: 0;
}
</style>
