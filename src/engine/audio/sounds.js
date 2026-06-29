import { AUDIO_COPY, AUDIO_EXPERIENCE } from './audioExperience.js'

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
  intro: '/audio/music/intro-music.mp3',
  nature: '/audio/music/intro-music.mp3'
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

export const VOICE_SOURCES = {
  intro: '/audio/app-voice/home-welcome.mp3',
  start: '/audio/app-voice/home-start.mp3',
  breath: '/audio/app-voice/exercise-try-again.mp3',
  retry: '/audio/app-voice/exercise-try-again.mp3',
  success: '/audio/app-voice/exercise-succes.mp3',
  positive: '/audio/app-voice/exercise-succes.mp3',
  positive1: '/audio/app-voice/positive1.mp3',
  positive2: '/audio/app-voice/positive2.mp3',
  positive3: '/audio/app-voice/positive3.mp3',
  'home-welcome': '/audio/app-voice/home-welcome.mp3',
  'home-start': '/audio/app-voice/home-start.mp3',
  'exercise-success': '/audio/app-voice/exercise-succes.mp3',
  'exercise-try-again': '/audio/app-voice/exercise-try-again.mp3',
  'calm-breath': '/audio/app-voice/exercise-try-again.mp3',
  'l2-ps-2': '/audio/app-voice/l2-ps-2.mp3'
}

export const STORAGE_KEY = 'juegoLeo_audioSettings'

export const DEFAULT_AUDIO_SETTINGS = {
  musicEnabled: true,
  sfxEnabled: true,
  voiceEnabled: true,
  // Volúmenes base más suaves para reducir fatiga auditiva
  musicVolume: AUDIO_EXPERIENCE.music.volume,
  sfxVolume: AUDIO_EXPERIENCE.sfx.volume,
  voiceVolume: AUDIO_EXPERIENCE.voice.volume
}
