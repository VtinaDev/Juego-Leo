export const SFX_SOURCES = {
  click: '/audio/sfx/click.wav',
  correct: '/audio/sfx/correct.wav',
  wrong: '/audio/sfx/wrong.wav',
  unlock: '/audio/sfx/unlock.wav',
  sloth: '/audio/sfx/sloth.wav',
  fox: '/audio/sfx/fox.wav',
  monkey: '/audio/sfx/monkey.wav',
  elephant: '/audio/sfx/elephant.wav',
  confetti: '/audio/sfx/confetti.wav'
}

export const MUSIC_SOURCES = {
  intro: '/audio/music/intro.wav',
  nature: '/audio/music/nature.wav'
}

export const VOICE_SOURCES = {
  // Legacy keys kept for compatibility with the current game flow.
  intro: '/audio/voice/home-welcome.mp3',
  start: '/audio/voice/home-start.mp3',
  breath: '/audio/voice/exercise-try-again.mp3',
  retry: '/audio/voice/exercise-try-again.mp3',
  success: '/audio/voice/exercise-succes.mp3',
  positive1: '/audio/voice/positive1.mp3',
  positive2: '/audio/voice/positive2.mp3',
  positive3: '/audio/voice/positive3.mp3',

  // Hyphenated semantic keys used in VOICE_PRODUCTION_GUIDE / production docs.
  'home-welcome': '/audio/voice/home-welcome.mp3',
  'home-start': '/audio/voice/home-start.mp3',
  'exercise-success': '/audio/voice/exercise-succes.mp3',
  'exercise-try-again': '/audio/voice/exercise-try-again.mp3',
  'select-image-word': '/audio/voice/exercises/select-image-word.mp3',
  'choose-correct-word': '/audio/voice/exercises/choose-correct-word.mp3',
  'start-with-article': '/audio/voice/exercises/start-with-article.mp3',
  'put-el-first': '/audio/voice/exercises/put-el-first.mp3',
  'subject-first-then-action': '/audio/voice/exercises/subject-first-then-action.mp3',
  'natural-subject-verb-order': '/audio/voice/exercises/natural-subject-verb-order.mp3',
  'l1-cs-1': '/audio/voice/exercises/l1-cs-1.mp3',
  'l1-cs-2': '/audio/voice/exercises/l1-cs-2.mp3',
  'l1-cs-3': '/audio/voice/exercises/l1-cs-3.mp3',
  'l1-cs-4': '/audio/voice/exercises/l1-cs-4.mp3',
  'l1-cs-5': '/audio/voice/exercises/l1-cs-5.mp3',
  'l1-cs-6': '/audio/voice/exercises/l1-cs-6.mp3',
  'l1-cs-7': '/audio/voice/exercises/l1-cs-7.mp3',
  'l1-cs-8': '/audio/voice/exercises/l1-cs-8.mp3',
  'l1-fs-1': '/audio/voice/exercises/l1-fs-1.mp3',
  'l1-fs-2': '/audio/voice/exercises/l1-fs-2.mp3',
  'l1-fs-3': '/audio/voice/exercises/l1-fs-3.mp3',
  'l1-fs-4': '/audio/voice/exercises/l1-fs-4.mp3',
  'l1-rwa-1': '/audio/voice/exercises/l1-rwa-1.mp3',
  'l1-rwa-2': '/audio/voice/exercises/l1-rwa-2.mp3',
  'l1-rwa-3': '/audio/voice/exercises/l1-rwa-3.mp3',
  'l1-rwa-4': '/audio/voice/exercises/l1-rwa-4.mp3',
  'l1-voc-1': '/audio/voice/exercises/l1-voc-1.mp3',
  'l1-voc-2': '/audio/voice/exercises/l1-voc-2.mp3',
  'l1-voc-3': '/audio/voice/exercises/l1-voc-3.mp3',
  'l1-voc-4': '/audio/voice/exercises/l1-voc-4.mp3',
  'l1-voc-5': '/audio/voice/exercises/l1-voc-5.mp3',
  'l1-voc-6': '/audio/voice/exercises/l1-voc-6.mp3',
  'l1-assoc-1': '/audio/voice/exercises/l1-assoc-1.mp3',
  'l1-assoc-2': '/audio/voice/exercises/l1-assoc-2.mp3',
  'l1-assoc-3': '/audio/voice/exercises/l1-assoc-3.mp3',
  'l1-assoc-4': '/audio/voice/exercises/l1-assoc-4.mp3',
  'l1-assoc-5': '/audio/voice/exercises/l1-assoc-5.mp3',
  'positive-1': '/audio/voice/positive1.mp3',
  'positive-2': '/audio/voice/positive2.mp3',
  'positive-3': '/audio/voice/positive3.mp3',
  'calm-breath': '/audio/voice/exercise-try-again.mp3'
}

export const VOICE_CUE_FALLBACKS = {
  start: 'intro',
  retry: 'breath',
  success: 'positive',
  positive: 'success',
  'home-start': 'home-welcome',
  'exercise-success': 'success',
  'exercise-try-again': 'retry',
  'calm-breath': 'retry'
}

export const STORAGE_KEY = 'juegoLeo_audioSettings'

export const DEFAULT_AUDIO_SETTINGS = {
  musicEnabled: true,
  sfxEnabled: true,
  voiceEnabled: true,
  // Volúmenes base más suaves para reducir fatiga auditiva
  musicVolume: 0.42,
  sfxVolume: 0.58,
  voiceVolume: 0.88
}
