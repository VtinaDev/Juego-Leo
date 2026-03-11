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
  choose: '/audio/voice/exercise-listen.mp3',
  listen: '/audio/voice/exercise-listen.mp3',
  read: '/audio/voice/exercise-read.mp3',
  breath: '/audio/voice/exercise-try-again.mp3',
  retry: '/audio/voice/exercise-try-again.mp3',
  success: '/audio/voice/exercise-succes.mp3',
  positive1: '/audio/voice/positive1.mp3',
  positive2: '/audio/voice/positive2.mp3',
  positive3: '/audio/voice/positive3.mp3',

  // Hyphenated semantic keys used in VOICE_PRODUCTION_GUIDE / production docs.
  'home-welcome': '/audio/voice/home-welcome.mp3',
  'home-start': '/audio/voice/home-start.mp3',
  'exercise-listen': '/audio/voice/exercise-listen.mp3',
  'exercise-read': '/audio/voice/exercise-read.mp3',
  'exercise-success': '/audio/voice/exercise-succes.mp3',
  'exercise-try-again': '/audio/voice/exercise-try-again.mp3',
  'positive-1': '/audio/voice/positive1.mp3',
  'positive-2': '/audio/voice/positive2.mp3',
  'positive-3': '/audio/voice/positive3.mp3',
  'calm-breath': '/audio/voice/exercise-try-again.mp3'
}

export const VOICE_CUE_FALLBACKS = {
  start: 'intro',
  choose: 'listen',
  listen: 'read',
  read: 'listen',
  retry: 'breath',
  success: 'positive',
  positive: 'success',
  'home-start': 'home-welcome',
  'exercise-choose': 'exercise-listen',
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
