export const APP_VOICE_BASE_ROUTE = '/audio/app-voice'
export const EXERCISE_VOICE_BASE_ROUTE = APP_VOICE_BASE_ROUTE

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

  return `${EXERCISE_VOICE_BASE_ROUTE}/${slugifyAudioId(id)}.mp3`
}

export function resolveExerciseAudioRoute(exercise = {}) {
  if (Object.prototype.hasOwnProperty.call(exercise, 'audio')) {
    return toAppVoiceRoute(exercise.audio)
  }
  return getCanonicalExerciseAudioRoute(exercise)
}

export function toAppVoiceRoute(route = '') {
  const normalized = normalizeText(route)
  if (!normalized) return ''
  if (normalized.startsWith(`${APP_VOICE_BASE_ROUTE}/`)) return normalized
  const filename = normalized.split('?')[0].split('#')[0].replace(/\\/g, '/').split('/').pop()
  if (!filename || !/\.mp3$/i.test(filename)) return normalized
  return `${APP_VOICE_BASE_ROUTE}/${filename}`
}
