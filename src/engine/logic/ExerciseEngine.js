import { ref, computed, watch, unref, isRef } from 'vue'
import { getLevelDefinition } from './utils/validateTemplates.js'
import { useAudio } from '../audio/useAudio'
import { SoundService } from '../audio/SoundService'
import { AUDIO_COPY, resolveCalmRetryMessage } from '../audio/audioExperience.js'
import { useCelebration } from '../visual/hooks/useCelebration'
import { useFeedback } from '../visual/hooks/useFeedback'
import { useReinforcementVoice } from '../visual/hooks/useReinforcementVoice'
import { CelebrationController } from '../visual/gsap/CelebrationController'


let soundsPreloaded = false

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value ?? null))
}

function normalizeString(value) {
  return String(value ?? '').trim().toLowerCase()
}

function isArrayEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false
  }
  return a.every((item, idx) => normalizeString(item) === normalizeString(b[idx]))
}

function evaluateAnswer(exercise, answer) {
  if (!exercise) return false

  if (exercise.validator && typeof exercise.validator === 'function') {
    try {
      return !!exercise.validator(answer, exercise)
    } catch (err) {
      console.warn('[ExerciseEngine] validator custom lanzó un error', err)
    }
  }

  if (exercise.correct !== undefined) {
    if (Array.isArray(exercise.correct)) {
      const expected = exercise.correct
      const received = Array.isArray(answer) ? answer : [answer]
      return isArrayEqual(expected, received)
    }
    return normalizeString(answer) === normalizeString(exercise.correct)
  }

  if (exercise.answer !== undefined) {
    return normalizeString(answer) === normalizeString(exercise.answer)
  }

  if (exercise.expectedAnswer !== undefined) {
    return normalizeString(answer) === normalizeString(exercise.expectedAnswer)
  }

  if (exercise.answerPattern) {
    const attempt = Array.isArray(answer) ? answer.join(' ') : String(answer ?? '')
    const pattern = String(exercise.answerPattern)
    return normalizeString(attempt).includes(normalizeString(pattern))
  }

  if (exercise.correctOrder) {
    const expected = Array.isArray(exercise.correctOrder) ? exercise.correctOrder : []
    const received = Array.isArray(answer) ? answer : [answer]
    return isArrayEqual(expected, received)
  }

  if (exercise.correctSyllable && exercise.accentType) {
    if (typeof answer === 'object' && answer !== null) {
      return (
        normalizeString(answer.syllable) === normalizeString(exercise.correctSyllable) &&
        normalizeString(answer.accentType ?? answer.type) === normalizeString(exercise.accentType)
      )
    }
  }

  // Nuevos tipos
  if (exercise.type === 'UNSCRAMBLE_WORD') {
    const expected = normalizeString(exercise.solution ?? exercise.correct ?? exercise.answer)
    const received = normalizeString(
      Array.isArray(answer) ? answer.join('') : typeof answer === 'string' ? answer : ''
    )
    return expected && received === expected
  }

  if (exercise.type === 'COMPLETE_WORD') {
    const expected = normalizeString(exercise.solution ?? exercise.correct ?? exercise.answer)
    const received = normalizeString(typeof answer === 'string' ? answer : '')
    return expected && received === expected
  }

  if (exercise.type === 'CHOOSE_CORRECT_WORD') {
    const expected = normalizeString(exercise.correct ?? exercise.answer)
    const received = normalizeString(answer)
    return expected && received === expected
  }

  if (exercise.type === 'SYLLABLE_ORDER') {
    const expected = Array.isArray(exercise.correctOrder) ? exercise.correctOrder.map(normalizeString) : []
    const received = Array.isArray(answer) ? answer.map(normalizeString) : []
    return expected.length > 0 && isArrayEqual(expected, received)
  }

  if (exercise.type === 'PUZZLE_ORDER') {
    const expected = Array.isArray(exercise.correctOrder)
      ? exercise.correctOrder.map(normalizeString)
      : Array.isArray(exercise.solution)
      ? exercise.solution.map(normalizeString)
      : []
    const received = Array.isArray(answer) ? answer.map(normalizeString) : []
    return expected.length > 0 && isArrayEqual(expected, received)
  }

  if (exercise.type === 'IMAGE_WORD_MATCH') {
    const expected = normalizeString(exercise.correct ?? exercise.answer ?? exercise.word)
    const received = normalizeString(answer)
    return expected && received === expected
  }

  if (exercise.type === 'READ_AND_ANSWER') {
    const expected = normalizeString(exercise.correct ?? exercise.answer)
    const received = normalizeString(answer)
    return expected && received === expected
  }

  if (exercise.pairs) {
    if (!answer || typeof answer !== 'object') return false
    const { left, right } = answer
    return exercise.pairs.some((pair) => {
      if (!pair) return false
      const leftKeys = ['word', 'singular', 'statement']
      const rightKeys = ['synonym', 'antonym', 'plural', 'response', 'match']
      const expectedLeft = leftKeys.map((key) => pair[key]).find((value) => value !== undefined)
      const expectedRight = rightKeys.map((key) => pair[key]).find((value) => value !== undefined)
      return (
        normalizeString(left) === normalizeString(expectedLeft) &&
        normalizeString(right) === normalizeString(expectedRight)
      )
    })
  }

  return false
}

function formatSubtypeLabel(subtype) {
  return subtype
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function resolveLearningPhase(orderIndex) {
  const phaseIndex = Math.min(Math.max(Number(orderIndex) || 1, 1), 5)
  const phases = {
    1: {
      key: 'mini_learning',
      label: 'Aprende',
      prompt: 'Mira y escucha la idea principal antes de elegir.'
    },
    2: {
      key: 'guided_example',
      label: 'Ejemplo',
      prompt: 'Fíjate en el ejemplo y busca una opción parecida.'
    },
    3: {
      key: 'supported_practice',
      label: 'Practica con ayuda',
      prompt: 'Usa la pista, la imagen o las piezas para responder.'
    },
    4: {
      key: 'independent_practice',
      label: 'Practica',
      prompt: 'Responde con calma, paso a paso.'
    },
    5: {
      key: 'variation_repetition',
      label: 'Repite',
      prompt: 'Ahora repite la habilidad con una pequeña variación.'
    }
  }
  return phases[phaseIndex]
}

function resolveSupportModes(exercise) {
  const modes = []
  if (exercise?.image || exercise?.emoji || exercise?.background) modes.push('visual')
  if (exercise?.audio || exercise?.fallbackText || exercise?.narrationText) modes.push('auditivo')
  if (
    Array.isArray(exercise?.options) ||
    Array.isArray(exercise?.words) ||
    Array.isArray(exercise?.letters) ||
    Array.isArray(exercise?.syllables) ||
    Array.isArray(exercise?.segments) ||
    Array.isArray(exercise?.pieces) ||
    Array.isArray(exercise?.pairs)
  ) {
    modes.push('manipulativo')
  }
  if (exercise?.prompt || exercise?.question || exercise?.instruction || exercise?.text || exercise?.sentence) {
    modes.push('textual')
  }
  return modes
}

function resolveStageFromTemplates(level, stage) {
  const levelConfig = getLevelDefinition(String(level))
  if (!levelConfig) {
    throw new Error(`No hay configuración para el nivel ${level}`)
  }

  const order = Array.isArray(levelConfig.order)
    ? levelConfig.order
    : Object.keys(levelConfig.subtypes ?? {})

  if (!order.length) {
    throw new Error(`Nivel ${level} no tiene subtipos configurados.`)
  }

  const stageIndex = Math.min(Math.max(Number(stage) - 1, 0), order.length - 1)
  const subtypeKey = order[stageIndex]
  const exercises = deepClone(levelConfig.subtypes?.[subtypeKey] ?? [])
  const stageMeta = levelConfig.stageMeta?.[subtypeKey] ?? {}
  const levelMeta = levelConfig.meta ?? {}

  exercises.forEach((exercise, idx) => {
    exercise.type = exercise.type ?? subtypeKey
    exercise.subtype = subtypeKey
    exercise.level = level
    exercise.stageIndex = stageIndex + 1
    exercise.orderIndex = idx + 1
    exercise.levelMeta = levelMeta
    exercise.stageMeta = stageMeta
    exercise.learningPhase = exercise.learningPhase ?? resolveLearningPhase(idx + 1)
    exercise.supportModes = exercise.supportModes ?? resolveSupportModes(exercise)
  })

  const stageTitle = stageMeta.title ?? `${levelMeta.levelName ?? 'Etapa'} · ${formatSubtypeLabel(subtypeKey)}`

  return {
    stageIndex,
    totalStages: order.length,
    subtype: subtypeKey,
    stageMeta,
    levelMeta: {
      ...levelMeta,
      totalStages: order.length
    },
    meta: {
      title: stageTitle,
      description: stageMeta.goal ?? levelMeta.description ?? '',
      animal: levelMeta.animal ?? '',
      icon: levelMeta.icon ?? '',
      color: levelMeta.color ?? '#64748b',
      stars: levelMeta.stars ?? 0,
      stageLabel: `${stageIndex + 1} / ${order.length}`
    },
    exercises
  }
}

export function useExerciseEngine(options = {}) {
  const levelRef = isRef(options.level) ? options.level : ref(options.level ?? 1)
  const stageRef = isRef(options.stage) ? options.stage : ref(options.stage ?? 1)
  const autoLoad = options.autoLoad ?? true
  const canAccessLevel = options.canAccessLevel
  const onAccessDenied = options.onAccessDenied ?? (() => {})
  const onStageComplete = options.onStageComplete ?? (() => {})
  const rewardService = options.rewardService

  if (!soundsPreloaded && typeof window !== 'undefined') {
    SoundService.preload()
    soundsPreloaded = true
  }

  const { triggerCelebration: runCelebration } = useCelebration()
  const { showFeedback } = useFeedback()
  const { playPositive, playPositiveAndWait, playEncouragement } = useReinforcementVoice()
  const audio = useAudio()

  const loading = ref(false)
  const allowed = ref(true)
  const error = ref(false)
  const errorMessage = ref('')

  const meta = ref({})
  const exercises = ref([])
  const exerciseResults = ref([])
  const index = ref(0)
  const lastResult = ref(null)
  const progressiveFeedback = ref({
    level: 0,
    message: ''
  })
  const stageSummary = ref(null)
  const stageContext = ref({
    levelMeta: null,
    stageMeta: null,
    subtype: null,
    stageIndex: 0,
    totalStages: 0
  })

  const canAdvance = ref(false)

  const current = computed(() => exercises.value[index.value] ?? null)
  const total = computed(() => exercises.value.length)
  const currentResult = computed(() => exerciseResults.value[index.value] ?? null)
  const currentStatus = computed(() => currentResult.value?.status ?? 'pending')
  const currentImage = computed(() => current.value?.image ?? null)
  const currentAudio = computed(() => current.value?.audio ?? null)

  const isListening = audio.isListening
  const isPlaying = audio.isPlaying

  let loadToken = 0
  let autoAdvanceToken = 0
  let autoAdvanceDelayTimer = null

  function cancelPendingAutoAdvance() {
    autoAdvanceToken += 1
    if (autoAdvanceDelayTimer) {
      clearTimeout(autoAdvanceDelayTimer)
      autoAdvanceDelayTimer = null
    }
  }

  function resetResults(exerciseCount) {
    exerciseResults.value = Array.from({ length: exerciseCount }, () => ({
      status: 'pending',
      attempts: 0,
      helpLevel: 0,
      feedbackMessage: '',
      updatedAt: null
    }))
    index.value = 0
    stageSummary.value = null
    lastResult.value = null
    progressiveFeedback.value = { level: 0, message: '' }
    canAdvance.value = false
  }

  async function loadStage() {
    cancelPendingAutoAdvance()
    const level = Number(unref(levelRef) ?? 1)
    const stage = Number(unref(stageRef) ?? 1)
    const token = ++loadToken

    loading.value = true
    error.value = false
    errorMessage.value = ''

    try {
      allowed.value = canAccessLevel ? !!canAccessLevel(level) : true
      if (!allowed.value) {
        onAccessDenied({ level, stage })
        meta.value = { title: 'Contenido bloqueado' }
        exercises.value = []
        resetResults(0)
        return
      }

      const stageData = resolveStageFromTemplates(level, stage)
      if (token !== loadToken) return

      meta.value = stageData.meta ?? {}
      exercises.value = stageData.exercises ?? []
      stageContext.value = {
        levelMeta: stageData.levelMeta,
        stageMeta: stageData.stageMeta,
        subtype: stageData.subtype,
        stageIndex: stageData.stageIndex,
        totalStages: stageData.totalStages
      }
      resetResults(exercises.value.length)
    } catch (err) {
      if (token !== loadToken) return
      console.error('[ExerciseEngine] Error al cargar la etapa:', err)
      error.value = true
      errorMessage.value = err?.message ?? 'No se pudo cargar el contenido.'
      meta.value = { title: 'Contenido no disponible' }
      exercises.value = []
      resetResults(0)
    } finally {
      if (token === loadToken) {
        loading.value = false
      }
    }
  }

  function stopAllMedia() {
    audio.stopAudio()
    audio.stopListening()
  }

  function triggerCelebration(meta = {}) {
    runCelebration({
      app: meta.app ?? null,
      target: meta.focusTarget ?? meta.target ?? null,
      canvas: meta.canvas ?? null,
      intensity: meta.intensity ?? 1,
      palette: meta.palette
    })
  }

  function triggerFeedback(meta = {}) {
    const message = meta.message ?? AUDIO_COPY.retryFirst
    showFeedback({
      app: meta.app ?? null,
      target: meta.focusTarget ?? meta.target ?? null,
      message
    })
  }

  function applyStatus(entry, meta = {}) {
    if (!entry || entry.status === 'pending') {
      canAdvance.value = false
      lastResult.value = null
      return
    }

    lastResult.value = entry.status

    const isCleared = entry.status === 'ok' || entry.status === 'skipped'
    canAdvance.value = isCleared

    if (entry.status === 'ok') {
      progressiveFeedback.value = { level: 0, message: '' }
      if (meta.triggerCelebration) {
        triggerCelebration(meta)
      }
      if (meta.playPositive !== false) {
        playPositive()
      }
    } else if (entry.status === 'fail' && meta.showFeedback !== false) {
      progressiveFeedback.value = {
        level: entry.helpLevel ?? meta.helpLevel ?? 1,
        message: entry.feedbackMessage || meta.message || AUDIO_COPY.retryFirst
      }
      triggerFeedback({ ...meta, message: progressiveFeedback.value.message })
      if (meta.playEncouragement === true) {
        playEncouragement()
      }
    }
  }

  function recordResult(status, meta = {}) {
    const entry = exerciseResults.value[index.value]
    if (!entry) return

    const previousStatus = entry.status
    if (meta.incrementAttempt) {
      entry.attempts = (entry.attempts ?? 0) + 1
    }

    entry.status = status
    entry.helpLevel = status === 'fail' ? meta.helpLevel ?? entry.helpLevel ?? 0 : 0
    entry.feedbackMessage = status === 'fail' ? meta.feedbackMessage ?? entry.feedbackMessage ?? '' : ''
    entry.updatedAt = new Date().toISOString()
    applyStatus(entry, meta)

    if (status === 'ok' && meta.awardPoints && previousStatus !== 'ok') {
      const points = typeof meta.points === 'number' ? meta.points : 10
      rewardService?.addPoints?.(points)
    }
  }

  function checkAnswer(answer, meta = {}) {
    const exercise = current.value
    if (!exercise) return false

    const ok = evaluateAnswer(exercise, answer)

    if (ok) {
      const shouldAutoAdvance = meta.autoAdvance ?? true
      const waitPositiveCue = shouldAutoAdvance && (meta.awaitPositiveCue ?? true) && meta.playPositive !== false

      recordResult('ok', {
        ...meta,
        playPositive: waitPositiveCue ? false : meta.playPositive,
        awardPoints: meta.awardPoints ?? true,
        incrementAttempt: true,
        triggerCelebration: true,
        showFeedback: false
      })

      if (shouldAutoAdvance) {
        const runToken = ++autoAdvanceToken
        const delayMs = meta.advanceDelay ?? 450
        let scheduled = false

        const scheduleAdvance = () => {
          if (scheduled || runToken !== autoAdvanceToken) return
          scheduled = true
          if (autoAdvanceDelayTimer) clearTimeout(autoAdvanceDelayTimer)
          autoAdvanceDelayTimer = setTimeout(() => {
            if (runToken !== autoAdvanceToken) return
            autoAdvanceDelayTimer = null
            advance()
          }, delayMs)
        }

        if (waitPositiveCue) {
          playPositiveAndWait({ timeoutMs: meta.maxCueWaitMs ?? 2200 }).then(() => {
            scheduleAdvance()
          })
        } else {
          scheduleAdvance()
        }
      }
    } else {
      const attempts = exerciseResults.value[index.value]?.attempts ?? 0
      const nextAttempt = attempts + 1
      const helpLevel = Math.min(nextAttempt, 3)
      const message = resolveCalmRetryMessage(exercise, nextAttempt)
      progressiveFeedback.value = {
        level: helpLevel,
        message
      }

      recordResult('fail', {
        ...meta,
        incrementAttempt: true,
        triggerCelebration: false,
        showFeedback: true,
        playEncouragement: nextAttempt > 1,
        helpLevel,
        feedbackMessage: message,
        message
      })
    }

    return ok
  }

  function skip(meta = {}) {
    if (!current.value) return
    recordResult('skipped', {
      ...meta,
      incrementAttempt: false,
      triggerCelebration: false,
      showFeedback: false
    })
    advance()
  }

  function repeat() {
    const entry = exerciseResults.value[index.value]
    if (!entry) return
    entry.status = 'pending'
    entry.updatedAt = null
    entry.attempts = 0
    entry.helpLevel = 0
    entry.feedbackMessage = ''
    progressiveFeedback.value = { level: 0, message: '' }
    applyStatus(entry)
  }

  function goTo(idx) {
    if (idx < 0 || idx >= exercises.value.length) return
    cancelPendingAutoAdvance()
    stopAllMedia()
    index.value = idx
    progressiveFeedback.value = { level: 0, message: '' }
    const entry = exerciseResults.value[index.value]
    applyStatus(entry)
  }

  function prev() {
    if (index.value === 0) {
      applyStatus(exerciseResults.value[0])
      return
    }
    goTo(index.value - 1)
  }

  function advance() {
    if (index.value < exercises.value.length - 1) {
      goTo(index.value + 1)
    } else {
      finishStage()
    }
  }

  function next() {
    if (!current.value) {
      finishStage()
      return
    }
    advance()
  }

  function buildSummary() {
    const totalExercises = exercises.value.length
    const summaryAccumulator = exerciseResults.value.reduce(
      (acc, result) => {
        if (!result) return acc
        const status = result.status ?? 'pending'
        acc[status] = (acc[status] ?? 0) + 1
        return acc
      },
      { ok: 0, fail: 0, skipped: 0, pending: 0 }
    )

    const okCount = summaryAccumulator.ok ?? 0
    const accuracy = totalExercises > 0 ? okCount / totalExercises : 0
    let stars = 1
    if (accuracy === 1) stars = 3
    else if (accuracy >= 0.6) stars = 2

    const levelNumber = Number(unref(levelRef) ?? 1)
    const stageNumber = Number(unref(stageRef) ?? 1)
    const context = stageContext.value ?? {}

    return {
      level: levelNumber,
      stage: stageNumber,
      total: totalExercises,
      ok: okCount,
      fail: summaryAccumulator.fail ?? 0,
      skipped: summaryAccumulator.skipped ?? 0,
      pending: summaryAccumulator.pending ?? 0,
      accuracy,
      stars,
      score: okCount * 10,
      completedAt: new Date().toISOString(),
      stageMeta: context.stageMeta ?? null,
      levelMeta: context.levelMeta ?? null,
      subtype: context.subtype ?? null,
      stageIndex: context.stageIndex ?? stageNumber,
      totalStages: context.totalStages ?? exercises.value.length,
      results: exerciseResults.value.map((result, idx) => ({
        index: idx + 1,
        status: result?.status ?? 'pending',
        attempts: result?.attempts ?? 0,
        helpLevel: result?.helpLevel ?? 0,
        updatedAt: result?.updatedAt ?? null
      }))
    }
  }

  function finishStage() {
    stopAllMedia()
    const summary = buildSummary()
    stageSummary.value = summary
    CelebrationController.play({
      level: summary.level,
      stage: summary.stage,
      summary,
      stageContext: stageContext.value,
      meta: meta.value
    })
    onStageComplete(summary)
    return summary
  }

  function playCurrentAudio({ onEnd, volume, loop } = {}) {
    const src = currentAudio.value
    if (!src) return
    audio.playAudio(src, { onEnd, volume, loop })
  }

  function listenForVoice(onResult, options = {}) {
    const exercise = current.value
    if (!exercise || exercise.mode !== 'voice') {
      console.warn('[ExerciseEngine] listenForVoice llamado en ejercicio sin modo voz.')
      return
    }
    audio.listenForAnswer(onResult, options)
  }

  watch(
    () => [Number(unref(levelRef) ?? 1), Number(unref(stageRef) ?? 1)],
    () => {
      if (autoLoad) {
        loadStage()
      }
    },
    { immediate: autoLoad, deep: false }
  )

  return {
    level: levelRef,
    stage: stageRef,
    loading,
    allowed,
    error,
    errorMessage,
    meta,
    exercises,
    exerciseResults,
    index,
    total,
    current,
    currentStatus,
    currentResult,
    progressiveFeedback,
    currentImage,
    currentAudio,
    canNext: computed(() => canAdvance.value && current.value !== null),
    lastResult,
    stageSummary,
    stageContext,
    isListening,
    isPlaying,
    loadStage,
    checkAnswer,
    recordResult,
    skip,
    repeat,
    next,
    prev,
    goTo,
    finishStage,
    playCurrentAudio,
    playExerciseAudio: playCurrentAudio,
    listenForVoice,
    stopAllMedia
  }
}

// ------------ Helpers para cargar templates.json desde el motor ------------

export function loadLevel(level) {
  return getLevelDefinition(String(level))
}

export function loadStage(level, stage) {
  return resolveStageFromTemplates(level, stage)
}

export function getCurrentExercise(engineInstance) {
  return engineInstance?.current?.value ?? null
}

export function nextExercise(engineInstance) {
  if (!engineInstance?.next) return null
  engineInstance.next()
  return engineInstance.current?.value ?? null
}

export function previousExercise(engineInstance) {
  if (!engineInstance?.prev) return null
  engineInstance.prev()
  return engineInstance.current?.value ?? null
}

export function startLevel(level) {
  return loadStage(level, 1)
}

export function finishLevel(level) {
  const def = loadLevel(level)
  const total = Array.isArray(def?.order) ? def.order.length : 0
  return loadStage(level, total || 1)
}

// ------------ Funciones de prueba manual (no se ejecutan automáticamente) ------------

export function testLevelOrder() {
  const levels = ['1', '2', '3', '4', '5']
  const result = {}
  levels.forEach((lvl) => {
    const def = loadLevel(lvl)
    const order = def?.order || []
    result[lvl] = { hasOrder: Array.isArray(order) && order.length > 0, order }
  })
  return result
}

export function testSubtypeMapping() {
  const levels = ['1', '2', '3', '4', '5']
  const result = {}
  levels.forEach((lvl) => {
    const def = loadLevel(lvl)
    result[lvl] = Object.keys(def?.subtypes || {})
  })
  return result
}

export function testExerciseFlattening() {
  const levels = ['1', '2', '3', '4', '5']
  const report = {}
  levels.forEach((lvl) => {
    const def = loadLevel(lvl)
    let total = 0
    Object.values(def?.subtypes || {}).forEach((list) => {
      total += (list || []).length
    })
    report[lvl] = total
  })
  return report
}

export function testMissingAudioFallback() {
  const levels = ['1', '2', '3', '4', '5']
  const report = {}
  levels.forEach((lvl) => {
    const def = loadLevel(lvl)
    const missing = []
    Object.values(def?.subtypes || {}).forEach((list) => {
      (list || []).forEach((ex) => {
        if (!ex.audio) missing.push(ex.id)
      })
    })
    report[lvl] = missing
  })
  return report
}

export function testMissingImageFallback() {
  const levels = ['1', '2', '3', '4', '5']
  const report = {}
  levels.forEach((lvl) => {
    const def = loadLevel(lvl)
    const missing = []
    Object.values(def?.subtypes || {}).forEach((list) => {
      (list || []).forEach((ex) => {
        if (!ex.image) missing.push(ex.id)
      })
    })
    report[lvl] = missing
  })
  return report
}

export default useExerciseEngine
