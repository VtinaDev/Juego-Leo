import {
  DEFAULT_AUDIO_SETTINGS,
  MUSIC_SOURCES,
  SFX_SOURCES,
  STORAGE_KEY,
  VOICE_SOURCES,
  VOICE_CUE_FALLBACKS
} from './sounds'
import { VOICE_PRESET, pickPreferredVoice } from './voiceProfile'

let settings = { ...DEFAULT_AUDIO_SETTINGS }
let unlocked = false
let musicAudio = null
let musicSourceKey = null
const sfxCache = new Map()
const sfxLastPlayed = new Map()
let audioCtx = null
let cachedVoiceName = null
const SAFE_SFX_GAIN = 0.75
const SFX_THROTTLE_MS = 140
let activeVoiceAudio = null
let queuedVoiceCue = null

// Legacy-style manager used by useAudio.js
export class AudioManager {
  constructor() {
    this.audio = null
    this.playListeners = []
    this.stopListeners = []
    this.errorListeners = []
  }

  onPlay(cb) {
    if (cb) this.playListeners.push(cb)
  }
  onStop(cb) {
    if (cb) this.stopListeners.push(cb)
  }
  onError(cb) {
    if (cb) this.errorListeners.push(cb)
  }

  play(src, { volume = 1, loop = false, onEnd } = {}) {
    if (!src) return
    unlockAudio()
    try {
      if (this.audio) {
        this.audio.pause()
        this.audio = null
      }
      const audio = new Audio(src)
      audio.loop = loop
      audio.volume = volume
      audio.onended = () => {
        this.stopListeners.forEach((fn) => fn())
        onEnd?.()
      }
      audio.onerror = (err) => {
        this.errorListeners.forEach((fn) => fn(err))
        onEnd?.(err)
      }
      this.audio = audio
      audio.play().then(() => {
        this.playListeners.forEach((fn) => fn())
      }).catch((err) => {
        this.errorListeners.forEach((fn) => fn(err))
        onEnd?.(err)
      })
    } catch (err) {
      this.errorListeners.forEach((fn) => fn(err))
      onEnd?.(err)
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
    this.audio = null
    this.stopListeners.forEach((fn) => fn())
  }
}

function loadFromStorage() {
  if (typeof window === 'undefined') return { ...DEFAULT_AUDIO_SETTINGS }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { ...DEFAULT_AUDIO_SETTINGS }
    const parsed = JSON.parse(saved)
    const merged = { ...DEFAULT_AUDIO_SETTINGS, ...parsed }
    // Sanear valores corruptos
    const clamp = (v, min, max, fallback) =>
      Number.isFinite(v) && v >= min && v <= max ? v : fallback
    merged.musicVolume = clamp(merged.musicVolume, 0, 1, DEFAULT_AUDIO_SETTINGS.musicVolume)
    merged.sfxVolume = clamp(merged.sfxVolume, 0, 1, DEFAULT_AUDIO_SETTINGS.sfxVolume)
    merged.voiceVolume = clamp(merged.voiceVolume, 0, 1, DEFAULT_AUDIO_SETTINGS.voiceVolume)
    merged.musicEnabled = merged.musicEnabled !== false
    merged.sfxEnabled = merged.sfxEnabled !== false
    merged.voiceEnabled = merged.voiceEnabled !== false
    return merged
  } catch (err) {
    console.warn('No se pudieron leer los ajustes de audio', err)
    return { ...DEFAULT_AUDIO_SETTINGS }
  }
}

function ensureNotMuted(current) {
  const hasVolumes =
    current.musicVolume > 0.05 || current.sfxVolume > 0.05 || current.voiceVolume > 0.05
  const hasAnyEnabled = current.musicEnabled || current.sfxEnabled || current.voiceEnabled
  if (hasVolumes && hasAnyEnabled) return current
  // Si todo estaba en cero/deshabilitado, restablecer a defaults
  const reset = { ...DEFAULT_AUDIO_SETTINGS }
  persist(reset)
  return reset
}

function persist(next) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    console.warn('No se pudieron guardar los ajustes de audio', err)
  }
}

export function getAudioSettings() {
  return { ...settings }
}

export function updateAudioSettings(partial = {}) {
  settings = { ...settings, ...partial }
  persist(settings)
  if (musicAudio) {
    musicAudio.volume = settings.musicVolume
    if (!settings.musicEnabled) stopMusic()
  }
}

export function setVolumes({ musicVolume, sfxVolume, voiceVolume } = {}) {
  const next = {
    musicVolume: musicVolume ?? settings.musicVolume,
    sfxVolume: sfxVolume ?? settings.sfxVolume,
    voiceVolume: voiceVolume ?? settings.voiceVolume
  }
  updateAudioSettings(next)
}

export function setAudioEnabled(type, enabled) {
  if (!['music', 'sfx', 'voice'].includes(type)) return
  updateAudioSettings({
    [`${type}Enabled`]: enabled
  })
}

export function initAudioSettings() {
  settings = ensureNotMuted(loadFromStorage())
  return settings
}

function ensureAudioContext() {
  if (audioCtx || typeof window === 'undefined') return audioCtx
  if (typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') {
    return null
  }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function forceAudibleSettings() {
  // Si todo está deshabilitado o volúmenes a 0, recupera defaults
  const allDisabled = !settings.musicEnabled && !settings.sfxEnabled && !settings.voiceEnabled
  const tooQuiet =
    settings.musicVolume < 0.05 && settings.sfxVolume < 0.05 && settings.voiceVolume < 0.05
  if (allDisabled || tooQuiet) {
    updateAudioSettings({ ...DEFAULT_AUDIO_SETTINGS })
    settings = { ...DEFAULT_AUDIO_SETTINGS }
  }
}

export function unlockAudio() {
  if (unlocked) return
  unlocked = true
  try {
    const ctx = ensureAudioContext()
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => null)
    forceAudibleSettings()
  } catch (err) {
    console.warn('No se pudo inicializar AudioContext', err)
  }
}

export function preloadSfx(map = SFX_SOURCES) {
  Object.entries(map).forEach(([name, src]) => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.load()
    sfxCache.set(name, audio)
  })
}

function resolveMusicSrc(keyOrSrc) {
  if (!keyOrSrc) return null
  if (keyOrSrc in MUSIC_SOURCES) return MUSIC_SOURCES[keyOrSrc]
  return keyOrSrc
}

function beepFallback(kind = 'click') {
  const ctx = ensureAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const tones = {
    click: 760,
    correct: 980,
    wrong: 240,
    unlock: 520
  }
  const freq = tones[kind] || 620
  osc.frequency.value = freq
  const now = ctx.currentTime
  const duration = kind === 'wrong' ? 0.22 : 0.12
  const startGain = Math.min(0.18, settings.sfxVolume * 0.2)
  gain.gain.setValueAtTime(startGain, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration)
}

export function playSfx(name = 'click') {
  if (!settings.sfxEnabled) return
  unlockAudio()
  const src = SFX_SOURCES[name] || SFX_SOURCES.click
  if (!src) {
    beepFallback(name)
    return
  }
  const now = Date.now()
  const last = sfxLastPlayed.get(name) || 0
  if (now - last < SFX_THROTTLE_MS) return
  sfxLastPlayed.set(name, now)
  const cached = sfxCache.get(name) || new Audio(src)
  cached.currentTime = 0
  cached.volume = Math.min(settings.sfxVolume * SAFE_SFX_GAIN, 0.85)
  cached.play().then(() => {
    sfxCache.set(name, cached)
  }).catch(() => {
    beepFallback(name)
  })
}

export function playMusic(keyOrSrc = 'intro', { loop = true, fadeMs = 280 } = {}) {
  if (!settings.musicEnabled) return
  unlockAudio()
  stopMusic(0)
  const src = resolveMusicSrc(keyOrSrc)
  if (!src) return
  const audio = new Audio(src)
  audio.loop = loop
  const targetVolume = settings.musicVolume
  audio.volume = fadeMs > 0 ? 0 : targetVolume
  audio.play().then(() => {
    if (fadeMs > 0) {
      const steps = 10
      const stepTime = Math.max(12, Math.round(fadeMs / steps))
      let current = 0
      const interval = setInterval(() => {
        current += 1
        audio.volume = Math.min(targetVolume, (targetVolume * current) / steps)
        if (current >= steps) clearInterval(interval)
      }, stepTime)
    }
  }).catch(() => null)
  musicAudio = audio
  musicSourceKey = keyOrSrc
}

export function stopMusic(fadeMs = 180) {
  if (!musicAudio) return
  const audio = musicAudio
  if (fadeMs <= 0) {
    audio.pause()
    musicAudio = null
    return
  }
  const steps = 8
  const stepTime = Math.max(10, Math.round(fadeMs / steps))
  let currentStep = 0
  const startVolume = audio.volume
  const interval = setInterval(() => {
    currentStep += 1
    const nextVolume = startVolume * (1 - currentStep / steps)
    audio.volume = Math.max(0, nextVolume)
    if (currentStep >= steps) {
      clearInterval(interval)
      audio.pause()
      musicAudio = null
    }
  }, stepTime)
}

function pickVoice(voices = [], lang = 'es-ES') {
  const normalizedLang = (lang || '').toLowerCase()
  const base = normalizedLang.split('-')[0]
  const candidates = voices.filter((v) => (v.lang || '').toLowerCase().startsWith(base))
  const childHints = ['child', 'kids', 'kid', 'niñ', 'young', 'little', 'peque', 'girl', 'chica', 'nena']
  const femaleHints = ['female', 'woman', 'mujer', 'feminine', 'femenina']

  const score = (v) => {
    const name = (v.name || '').toLowerCase()
    let s = 0
    if (childHints.some((h) => name.includes(h))) s += 4
    if (femaleHints.some((h) => name.includes(h))) s += 2
    return s
  }
  if (candidates.length === 0) return null
  return [...candidates].sort((a, b) => score(b) - score(a))[0] || candidates[0]
}

function stopActiveVoiceAudio() {
  if (!activeVoiceAudio) return
  activeVoiceAudio.pause()
  activeVoiceAudio.currentTime = 0
  activeVoiceAudio = null
}

function isVoiceBusy() {
  const htmlAudioBusy =
    !!activeVoiceAudio &&
    !activeVoiceAudio.paused &&
    !activeVoiceAudio.ended

  if (htmlAudioBusy) return true
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  return window.speechSynthesis.speaking || window.speechSynthesis.pending
}

function maybePlayQueuedVoiceCue() {
  if (!queuedVoiceCue || isVoiceBusy()) return
  const next = queuedVoiceCue
  queuedVoiceCue = null
  playVoiceCue(next.key, { ...next.options, queueIfBusy: false })
}

export function playVoice(textOrSrc = '', options = {}) {
  if (!settings.voiceEnabled) return
  unlockAudio()
  if (!textOrSrc) return

  const interrupt = options.interrupt !== false
  if (interrupt) {
    stopActiveVoiceAudio()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  const isUrl = typeof textOrSrc === 'string' && /^https?:\/\//i.test(textOrSrc)
  const isAsset = typeof textOrSrc === 'string' && textOrSrc.startsWith('/')

  if (isUrl || isAsset) {
    const audio = new Audio(textOrSrc)
    audio.volume = settings.voiceVolume
    activeVoiceAudio = audio
    audio.onended = () => {
      if (activeVoiceAudio === audio) activeVoiceAudio = null
      options.onEnd?.()
      maybePlayQueuedVoiceCue()
    }
    audio.onerror = () => {
      if (activeVoiceAudio === audio) activeVoiceAudio = null
      options.onEnd?.()
      maybePlayQueuedVoiceCue()
    }
    audio.play().catch(() => {
      if (activeVoiceAudio === audio) activeVoiceAudio = null
      options.onEnd?.()
      maybePlayQueuedVoiceCue()
    })
    return audio
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(textOrSrc)
  const lang = options.lang || VOICE_PRESET.lang
  utterance.lang = lang
  // Voz infantil alegre: clara, animada pero sin acelerar en exceso
  utterance.rate = options.rate ?? VOICE_PRESET.rate
  utterance.pitch = options.pitch ?? VOICE_PRESET.pitch
  utterance.volume = settings.voiceVolume

  const voices = synth.getVoices()
  const { voice, name } = pickPreferredVoice(voices, lang, cachedVoiceName)
  if (voice) {
    utterance.voice = voice
    cachedVoiceName = name
  }

  utterance.onend = () => {
    options.onEnd?.()
    maybePlayQueuedVoiceCue()
  }
  utterance.onerror = () => {
    options.onEnd?.()
    maybePlayQueuedVoiceCue()
  }

  if (interrupt) synth.cancel()
  synth.speak(utterance)
  return utterance
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function resolveVoiceCueSrc(key = '') {
  const normalized = String(key || '').trim().toLowerCase()
  if (!normalized) return null

  const exact = VOICE_SOURCES[normalized]
  if (exact) return exact

  const pattern = new RegExp(`^${escapeRegExp(normalized)}(?:[_-]?\\d+)$`)
  const variants = Object.entries(VOICE_SOURCES)
    .filter(([name]) => pattern.test(name))
    .map(([, src]) => src)

  if (!variants.length) return null
  const index = Math.floor(Math.random() * variants.length)
  return variants[index]
}

export function playVoiceCue(key, options = {}) {
  const normalized = String(key || '').trim().toLowerCase()
  if (!normalized) return

  const queueIfBusy = options.queueIfBusy !== false
  if (queueIfBusy && isVoiceBusy()) {
    queuedVoiceCue = { key: normalized, options }
    return
  }

  const primarySrc = resolveVoiceCueSrc(normalized)
  if (primarySrc) {
    playVoice(primarySrc, { ...options, interrupt: false })
    return
  }

  const fallbackKey = VOICE_CUE_FALLBACKS[normalized]
  const fallbackSrc = fallbackKey ? resolveVoiceCueSrc(fallbackKey) : null
  if (fallbackSrc) {
    playVoice(fallbackSrc, { ...options, interrupt: false })
    return
  }

  if (options.textFallback) {
    playVoice(options.textFallback, options)
  }
}

export function stopVoice() {
  queuedVoiceCue = null
  stopActiveVoiceAudio()
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}

initAudioSettings()
preloadSfx()
