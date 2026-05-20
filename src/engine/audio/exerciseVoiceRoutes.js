export const EXERCISE_VOICE_BASE_ROUTE = '/audio/voice/exercises'

function normalizeText(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function slugifyAudioId(value = '') {
  return normalizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getExerciseLevel(exercise = {}) {
  const explicitLevel = Number(exercise.level ?? exercise.levelId ?? exercise.levelNumber)
  if (Number.isFinite(explicitLevel) && explicitLevel > 0) return explicitLevel

  const idLevel = String(exercise.id || '').match(/^L(\d+)[-_]/i)
  if (idLevel) return Number(idLevel[1])

  return null
}

export function getCanonicalExerciseAudioRoute(exercise = {}) {
  const id = normalizeText(exercise.id)
  const level = getExerciseLevel(exercise)
  if (!id || !level) return normalizeText(exercise.audio)

  return `${EXERCISE_VOICE_BASE_ROUTE}/L${level}/${slugifyAudioId(id)}.mp3`
}

export function resolveExerciseAudioRoute(exercise = {}) {
  return getCanonicalExerciseAudioRoute(exercise) || normalizeText(exercise.audio)
}
