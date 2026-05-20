export const AUDIO_EXPERIENCE = Object.freeze({
  audience: 'children_neurodivergent_4_10',
  tone: {
    intent: 'motivador, optimista, infantil y calmado',
    sentenceMaxWords: 12,
    avoid: ['culpa', 'prisa', 'castigo', 'error fuerte']
  },
  voice: {
    lang: 'es-ES',
    rate: 0.74,
    pitch: 1,
    playbackRate: 1,
    volume: 0.88
  },
  music: {
    volume: 0.34
  },
  sfx: {
    volume: 0.5,
    throttleMs: 140,
    profiles: {
      click: { gain: 0.45 },
      correct: { gain: 0.58 },
      wrong: { gain: 0.22 },
      unlock: { gain: 0.5 },
      celebration: { gain: 0.55 },
      confetti: { gain: 0.55 },
      animal: { gain: 0.46 }
    }
  },
  haptics: {
    retryMs: 35
  }
})

export const AUDIO_COPY = Object.freeze({
  retryFirst: 'Casi. Respira y prueba otra vez.',
  retrySecond: 'Vamos paso a paso.',
  retryNext: 'Estoy contigo. Mira una pista y seguimos.',
  success: '¡Muy bien!',
  noAudio: 'Lee con calma. El audio de esta actividad no está listo.'
})

export function resolveCalmRetryMessage(exercise, attemptNumber = 1) {
  if (attemptNumber <= 1) return AUDIO_COPY.retryFirst
  if (attemptNumber === 2) return exercise?.hint || AUDIO_COPY.retrySecond
  return exercise?.hint || AUDIO_COPY.retryNext
}

export function resolveSfxGain(name = 'click') {
  const normalizedName = name === 'error' ? 'wrong' : name
  const profiles = AUDIO_EXPERIENCE.sfx.profiles
  if (profiles[normalizedName]) return profiles[normalizedName].gain
  if (['sloth', 'fox', 'monkey', 'elephant'].includes(normalizedName)) return profiles.animal.gain
  return profiles.click.gain
}
