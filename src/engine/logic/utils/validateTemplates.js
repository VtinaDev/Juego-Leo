// -------------------------------------------------------------
//  VALIDATE TEMPLATES — versión compatible con Vite + Node
// -------------------------------------------------------------

import templatesManifest from '../data/templates.json'

let manifest = templatesManifest ?? {}

// -------------------------------------------------------------
//  LÓGICA DEL VALIDADOR (idéntica a tu versión funcional)
// -------------------------------------------------------------

function warnDuplicateStageImages(levelKey, levelConfig) {
  if (typeof window === 'undefined') return
  if (!import.meta?.env?.DEV) return
  const order = Array.isArray(levelConfig.order)
    ? levelConfig.order
    : Object.keys(levelConfig.subtypes ?? {})
  let previousImage = null
  order.forEach((subtypeKey, idx) => {
    const firstImage = levelConfig.subtypes?.[subtypeKey]?.[0]?.image || null
    if (firstImage && previousImage && firstImage === previousImage) {
      console.warn(
        `[Juego Leo] Imagen repetida entre las etapas ${idx} y ${idx + 1} del nivel ${levelKey}: ${firstImage}`
      )
    }
    if (firstImage) {
      previousImage = firstImage
    }
  })
}

if (typeof window !== 'undefined' && import.meta?.env?.DEV && manifest) {
  Object.entries(manifest).forEach(([levelKey, levelConfig]) => warnDuplicateStageImages(levelKey, levelConfig))
}

const REQUIRED_FIELDS_BY_TYPE = {
  question_sentence: [['question', 'prompt', 'sentence'], 'options', ['correct', 'answer']],
  complete_sentence: [['prompt', 'question', 'sentence'], 'options', ['correct', 'answer']],
  order_sentence: ['words', ['correct', 'correctOrder']],
  multiple_choice: [['question', 'prompt'], 'options', ['correct', 'answer']],
  pair_synonyms: ['pairs'],
  pair_antonyms: ['pairs'],
  UNSCRAMBLE_WORD: ['letters', ['solution', 'answer', 'correct']],
  COMPLETE_WORD: [['solution', 'answer', 'correct'], ['prompt', 'question', 'instruction']],
  CHOOSE_CORRECT_WORD: [['question', 'prompt'], 'options', ['correct', 'answer']],
  SYLLABLE_ORDER: ['syllables', ['correctOrder', 'solution']],
  IMAGE_WORD_MATCH: [['image', 'prompt'], 'options', ['correct', 'answer']],
  READ_AND_ANSWER: [['text', 'context', 'reading'], 'options', ['correct', 'answer']],
  PUZZLE_ORDER: [['segments', 'pieces'], ['correctOrder', 'solution']],
  synonyms: ['pairs'],
  antonyms: ['pairs'],
  sentence_selection: [['prompt', 'question', 'instruction'], 'options', ['correct', 'answer']],
  audio_question: [['question', 'prompt'], 'options', ['correct', 'answer']],
  read_with_audio: ['text'],
  audio_choice: [['question', 'prompt'], 'options', ['correct', 'answer']],
  audio_write: [['instruction', 'prompt', 'fallbackText'], ['answer', 'expectedAnswer']],
  text_write: [['instruction', 'prompt'], ['answer', 'answerPattern']],
  tense_classify: [['sentence', 'prompt'], 'options', ['correct', 'answer']],
  singular_plural: ['pairs'],
  describe_image: [['instruction', 'prompt', 'question'], 'options', ['correct', 'answer']],
  accent_game: ['word', 'syllables', 'correctSyllable', 'accentType'],
  accent_classify: ['word', 'accentType'],
  accent_drag: ['word', 'syllables', 'correctSyllable'],
  punctuation_game: ['sentence', 'options', ['correct', 'answer']],
  final_exam: [['question', 'prompt'], 'options', ['correct', 'answer']]
}

const DEFAULT_HOOKS = Object.freeze({
  onCorrect: 'celebrate',
  onError: 'gentleRetry'
})

const MAX_EXERCISES_PER_SUBTYPE = 4
const MIN_EXERCISES_PER_LEVEL = 8
const globalIdRegistry = new Set()

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function ensureHooks(exercise) {
  if (!exercise.onCorrect) exercise.onCorrect = DEFAULT_HOOKS.onCorrect
  if (!exercise.onError) exercise.onError = DEFAULT_HOOKS.onError
}

function assignIfMissing(target, primaryKey, candidates) {
  if (hasValue(target[primaryKey])) return
  for (const key of candidates) {
    if (hasValue(target[key])) {
      target[primaryKey] = target[key]
      return
    }
  }
}

function harmonizeExercise(exercise, subtype) {
  assignIfMissing(exercise, 'type', [subtype])
  assignIfMissing(exercise, 'prompt', ['question', 'sentence', 'instruction'])
  assignIfMissing(exercise, 'question', ['prompt'])
  assignIfMissing(exercise, 'sentence', ['prompt'])
  assignIfMissing(exercise, 'correct', ['answer', 'expectedAnswer'])
  assignIfMissing(exercise, 'answer', ['correct', 'expectedAnswer'])
  assignIfMissing(exercise, 'expectedAnswer', ['answer', 'correct'])
  assignIfMissing(exercise, 'correctOrder', ['correct'])

  if (!('audio' in exercise)) exercise.audio = null
  if (!('image' in exercise)) exercise.image = null
  if (!('background' in exercise)) exercise.background = null
  if (!('allowRetry' in exercise)) exercise.allowRetry = true
  if (!('maxAttempts' in exercise)) exercise.maxAttempts = Infinity
  if (!('feedbackStyle' in exercise)) exercise.feedbackStyle = 'calm'
  if (!('progressiveHints' in exercise)) exercise.progressiveHints = true
  if (!('calmFeedback' in exercise)) exercise.calmFeedback = true
  if (!('structuredLearning' in exercise)) exercise.structuredLearning = true
  if (!('teachBeforeAssess' in exercise)) exercise.teachBeforeAssess = true

  if (Array.isArray(exercise.pairs)) {
    exercise.pairs = exercise.pairs.map((pair, idx) => {
      if (!isPlainObject(pair)) return pair
      return { id: pair.id ?? `${exercise.id}-pair-${idx + 1}`, ...pair }
    })
  }
}

function requirementSatisfied(exercise, requirement) {
  if (Array.isArray(requirement)) {
    return requirement.some(field => hasValue(exercise[field]))
  }
  return hasValue(exercise[requirement])
}

function getSupportModes(exercise) {
  const modes = new Set()
  if (exercise.image || exercise.emoji || exercise.background) modes.add('visual')
  if (exercise.audio || exercise.fallbackText || exercise.narrationText) modes.add('auditivo')
  if (
    Array.isArray(exercise.options) ||
    Array.isArray(exercise.words) ||
    Array.isArray(exercise.letters) ||
    Array.isArray(exercise.syllables) ||
    Array.isArray(exercise.segments) ||
    Array.isArray(exercise.pieces) ||
    Array.isArray(exercise.pairs)
  ) {
    modes.add('manipulativo')
  }
  return [...modes]
}

// -------------------------------------------------------------
//  VALIDACIÓN COMPLETA
// -------------------------------------------------------------

export function validateTemplates({ verbose = true } = {}) {
  globalIdRegistry.clear()

  if (!manifest || typeof manifest !== 'object') {
    console.error('❌ Manifest inválido')
    return { valid: false, summary: [] }
  }

  const summaries = []
  let valid = true

  for (const [levelKey, levelConfig] of Object.entries(manifest)) {
    if (!isPlainObject(levelConfig)) {
      console.error(`❌ Nivel ${levelKey} no tiene config válida.`)
      valid = false
      continue
    }

    const subtypes = levelConfig.subtypes
    if (!isPlainObject(subtypes)) {
      console.error(`❌ Nivel ${levelKey} carece de subtypes.`)
      valid = false
      continue
    }

    const order = Array.isArray(levelConfig.order)
      ? levelConfig.order
      : Object.keys(subtypes)

    const levelExerciseTotal = order.reduce((acc, subtypeKey) => {
      const list = subtypes[subtypeKey]
      return acc + (Array.isArray(list) ? list.length : 0)
    }, 0)

    if (levelExerciseTotal < MIN_EXERCISES_PER_LEVEL) {
      summaries.push({
        level: levelKey,
        stage: 0,
        subtype: '__level_content__',
        count: levelExerciseTotal,
        warnings: [
          `Nivel ${levelKey} tiene ${levelExerciseTotal} ejercicios. Objetivo pedagógico mínimo: ${MIN_EXERCISES_PER_LEVEL}.`
        ],
        errors: []
      })
    }

    order.forEach((subtypeKey, stageIndex) => {
      const exercises = subtypes[subtypeKey]
      if (!Array.isArray(exercises)) {
        console.error(`❌ ${levelKey}/${subtypeKey} debe ser un array.`)
        valid = false
        return
      }

      const subtypeSummary = {
        level: levelKey,
        stage: stageIndex + 1,
        subtype: subtypeKey,
        count: exercises.length,
        warnings: [],
        errors: []
      }

      if (exercises.length > MAX_EXERCISES_PER_SUBTYPE) {
        subtypeSummary.warnings.push(
          `${levelKey}/${subtypeKey} tiene ${exercises.length} ejercicios (máx: ${MAX_EXERCISES_PER_SUBTYPE}).`
        )
      }

      exercises.forEach((exercise, index) => {
        if (!isPlainObject(exercise)) {
          subtypeSummary.errors.push(`Ejercicio ${index + 1} inválido.`)
          valid = false
          return
        }

        const contextId = exercise.id ?? `${levelKey}/${subtypeKey}[${index}]`

        if (!exercise.id) {
          subtypeSummary.errors.push(`Falta ID en ${contextId}`)
          valid = false
        } else if (globalIdRegistry.has(exercise.id)) {
          subtypeSummary.errors.push(`ID duplicado: ${exercise.id}`)
          valid = false
        } else {
          globalIdRegistry.add(exercise.id)
        }

        harmonizeExercise(exercise, subtypeKey)
        ensureHooks(exercise)

        if (exercise.progressiveHints !== true) {
          subtypeSummary.warnings.push(`${exercise.id}: progressiveHints debería ser true`)
        }

        if (exercise.calmFeedback !== true) {
          subtypeSummary.warnings.push(`${exercise.id}: calmFeedback debería ser true`)
        }

        if (exercise.structuredLearning !== true) {
          subtypeSummary.warnings.push(`${exercise.id}: structuredLearning debería ser true`)
        }

        if (exercise.teachBeforeAssess !== true) {
          subtypeSummary.warnings.push(`${exercise.id}: teachBeforeAssess debería ser true`)
        }

        const supportModes = getSupportModes(exercise)
        if (supportModes.length < 2) {
          subtypeSummary.warnings.push(
            `${exercise.id}: requiere al menos dos apoyos entre visual, auditivo y manipulativo. Actual: ${supportModes.join(', ') || 'ninguno'}`
          )
        }

        const requirements = REQUIRED_FIELDS_BY_TYPE[exercise.type] ?? []
        requirements.forEach(req => {
          if (!requirementSatisfied(exercise, req)) {
            subtypeSummary.errors.push(
              `${exercise.id}: falta ${Array.isArray(req) ? `[${req.join(', ')}]` : req}`
            )
            valid = false
          }
        })

        if (exercise.options !== undefined && !Array.isArray(exercise.options)) {
          subtypeSummary.errors.push(`${exercise.id}: options debe ser un array`)
          valid = false
        }
      })

      summaries.push(subtypeSummary)

      if (verbose) {
        console.info(
          `Nivel ${levelKey} / ${subtypeKey}: ${exercises.length} ejercicios (⚠️ ${subtypeSummary.warnings.length} | ❌ ${subtypeSummary.errors.length})`
        )
      }
    })
  }

  if (verbose) {
    console.info(`📊 Validación completa: ${valid ? '✅ OK' : '❌ con errores'}`)
  }

  return { valid, summary: summaries }
}

// -------------------------------------------------------------
//  UTILIDADES
// -------------------------------------------------------------

export function getLevelDefinition(level) {
  const entry = manifest?.[level]
  return entry ? JSON.parse(JSON.stringify(entry)) : null
}

export function listLevels() {
  return Object.keys(manifest ?? {})
}

export default validateTemplates
