import {
  DEFAULT_AUDIO_SETTINGS,
  MUSIC_SOURCES,
  SFX_SOURCES,
  STORAGE_KEY,
  VOICE_CUE_FALLBACKS,
  VOICE_SOURCES
} from './sounds'
import { AUDIO_EXPERIENCE, resolveSfxGain } from './audioExperience.js'
import { playAppVoiceAudio, stopAppVoiceAudio } from '../../utils/audioPlayer.js'

let settings = { ...DEFAULT_AUDIO_SETTINGS }
let unlocked = false
let musicAudio = null
const sfxCache = new Map()
const sfxLastPlayed = new Map()
let audioCtx = null
let activeVoiceToken = 0
let pendingMusicStart = null
let pendingVoiceStart = null
let musicUnlockListenersAttached = false
let voiceUnlockListenersAttached = false

const SAFE_SFX_GAIN = 0.75
const SFX_THROTTLE_MS = AUDIO_EXPERIENCE.sfx.throttleMs

export class AudioManager {
  constructor() {
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

  play(src, { volume = 1, onEnd } = {}) {
    return playVoice(src, { volume, onEnd })
  }

  stop() {
    stopVoice()
    this.stopListeners.forEach((fn) => fn())
  }
}

function clamp(v, min, max, fallback) {
  return Number.isFinite(v) && v >= min && v <= max ? v : fallback
}

function loadFromStorage() {
  if (typeof window === 'undefined') return { ...DEFAULT_AUDIO_SETTINGS }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { ...DEFAULT_AUDIO_SETTINGS }
    const merged = { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) }
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

function persist(next) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    console.warn('No se pudieron guardar los ajustes de audio', err)
  }
}

function ensureNotMuted(current) {
  const hasVolumes =
    current.musicVolume > 0.05 || current.sfxVolume > 0.05 || current.voiceVolume > 0.05
  const hasAnyEnabled = current.musicEnabled || current.sfxEnabled || current.voiceEnabled
  if (hasVolumes && hasAnyEnabled) return current
  const reset = { ...DEFAULT_AUDIO_SETTINGS }
  persist(reset)
  return reset
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
  updateAudioSettings({
    musicVolume: musicVolume ?? settings.musicVolume,
    sfxVolume: sfxVolume ?? settings.sfxVolume,
    voiceVolume: voiceVolume ?? settings.voiceVolume
  })
}

export function setAudioEnabled(type, enabled) {
  if (!['music', 'sfx', 'voice'].includes(type)) return
  updateAudioSettings({ [`${type}Enabled`]: enabled })
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
  if (typeof Audio === 'undefined') return
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
  const tones = { click: 760, correct: 980, wrong: 240, unlock: 520 }
  const now = ctx.currentTime
  const duration = kind === 'wrong' ? 0.22 : 0.12
  gain.gain.setValueAtTime(Math.min(0.16, settings.sfxVolume * resolveSfxGain(kind)), now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.frequency.value = tones[kind] || 620
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration)
}

export function playSfx(name = 'click') {
  if (!settings.sfxEnabled || typeof Audio === 'undefined') return
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
  cached.volume = Math.min(settings.sfxVolume * SAFE_SFX_GAIN * resolveSfxGain(name), 0.82)
  cached.play().then(() => sfxCache.set(name, cached)).catch(() => beepFallback(name))
}

export function playMusic(keyOrSrc = 'intro', { loop = true, fadeMs = 280 } = {}) {
  if (!settings.musicEnabled || typeof Audio === 'undefined') return
  unlockAudio()
  stopMusic(0)
  const src = resolveMusicSrc(keyOrSrc)
  if (!src) return
  const audio = new Audio(src)
  audio.loop = loop
  const targetVolume = settings.musicVolume
  audio.volume = fadeMs > 0 ? 0 : targetVolume
  audio.play().then(() => {
    clearPendingMusicStart()
    if (fadeMs <= 0) return
    const steps = 10
    const stepTime = Math.max(12, Math.round(fadeMs / steps))
    let current = 0
    const interval = setInterval(() => {
      current += 1
      audio.volume = Math.min(targetVolume, (targetVolume * current) / steps)
      if (current >= steps) clearInterval(interval)
    }, stepTime)
  }).catch(() => {
    schedulePendingMusicStart({ keyOrSrc, loop, fadeMs })
  })
  musicAudio = audio
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
  const startVolume = audio.volume
  let currentStep = 0
  const interval = setInterval(() => {
    currentStep += 1
    audio.volume = Math.max(0, startVolume * (1 - currentStep / steps))
    if (currentStep >= steps) {
      clearInterval(interval)
      audio.pause()
      musicAudio = null
    }
  }, stepTime)
}

function clearPendingMusicStart() {
  pendingMusicStart = null
  if (!musicUnlockListenersAttached || typeof window === 'undefined') return
  window.removeEventListener('pointerdown', retryPendingMusicStart)
  window.removeEventListener('keydown', retryPendingMusicStart)
  musicUnlockListenersAttached = false
}

function clearPendingVoiceStart() {
  pendingVoiceStart = null
  if (!voiceUnlockListenersAttached || typeof window === 'undefined') return
  window.removeEventListener('pointerdown', retryPendingVoiceStart)
  window.removeEventListener('keydown', retryPendingVoiceStart)
  voiceUnlockListenersAttached = false
}

function schedulePendingMusicStart(payload) {
  pendingMusicStart = payload
  if (musicUnlockListenersAttached || typeof window === 'undefined') return
  musicUnlockListenersAttached = true
  window.addEventListener('pointerdown', retryPendingMusicStart, { passive: true })
  window.addEventListener('keydown', retryPendingMusicStart)
}

function schedulePendingVoiceStart(payload) {
  pendingVoiceStart = payload
  if (voiceUnlockListenersAttached || typeof window === 'undefined') return
  voiceUnlockListenersAttached = true
  window.addEventListener('pointerdown', retryPendingVoiceStart, { passive: true })
  window.addEventListener('keydown', retryPendingVoiceStart)
}

function retryPendingMusicStart() {
  if (!pendingMusicStart) {
    clearPendingMusicStart()
    return
  }
  const request = { ...pendingMusicStart }
  clearPendingMusicStart()
  playMusic(request.keyOrSrc, { loop: request.loop, fadeMs: request.fadeMs })
}

function retryPendingVoiceStart() {
  if (!pendingVoiceStart) {
    clearPendingVoiceStart()
    return
  }
  const request = { ...pendingVoiceStart }
  clearPendingVoiceStart()
  playVoice(request.filenameOrKey, request.options)
}

function slugifyVoiceKey(value = '') {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function filenameFromValue(value = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/\.mp3(\?.*)?$/i.test(raw)) {
    return raw.split('?')[0].split('#')[0].replace(/\\/g, '/').split('/').pop()
  }
  const mapped = VOICE_SOURCES[raw] || VOICE_SOURCES[raw.toLowerCase()]
  if (mapped) return filenameFromValue(mapped)
  const slug = slugifyVoiceKey(raw)
  return slug ? `${slug}.mp3` : ''
}

export function resolveVoiceFilename(value = '') {
  return filenameFromValue(value)
}

function cancelBrowserSpeechSynthesis() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
  } catch (err) {
    console.warn('[audioManager] No se pudo cancelar la síntesis de voz del navegador:', err)
  }
}

export function playVoice(filenameOrKey = '', options = {}) {
  unlockAudio()
  cancelBrowserSpeechSynthesis()
  if (options.forceVoiceEnabled === true && (!settings.voiceEnabled || settings.voiceVolume < 0.05)) {
    updateAudioSettings({
      voiceEnabled: true,
      voiceVolume: Math.max(settings.voiceVolume, DEFAULT_AUDIO_SETTINGS.voiceVolume)
    })
  }
  if (!settings.voiceEnabled || !filenameOrKey) {
    options.onEnd?.()
    return null
  }

  if (options.interrupt !== false) stopVoice()

  const filename = filenameFromValue(filenameOrKey)
  if (!filename) {
    console.warn('[audioManager] No hay archivo de voz local para:', filenameOrKey)
    options.onEnd?.()
    return null
  }

  const token = ++activeVoiceToken
  playAppVoiceAudio(filename, {
    ...options,
    interrupt: false,
    volume: options.volume ?? settings.voiceVolume,
    onEnd: () => {
      if (token === activeVoiceToken) clearPendingVoiceStart()
      options.onEnd?.()
    }
  }).then((played) => {
    if (!played && token === activeVoiceToken && options.retryOnUnlock !== false) {
      schedulePendingVoiceStart({
        filenameOrKey,
        options: { ...options, retryOnUnlock: false }
      })
    }
  })

  return null
}

export function playVoiceCue(key, options = {}) {
  const normalized = String(key || '').trim().toLowerCase()
  if (!normalized) {
    options.onEnd?.()
    return
  }

  const fallbackKey = VOICE_CUE_FALLBACKS[normalized]
  const filename = VOICE_SOURCES[normalized] || (fallbackKey ? VOICE_SOURCES[fallbackKey] : '') || options.filenameFallback
  if (!filename) {
    console.warn('[audioManager] Cue de voz sin MP3 local:', normalized)
    options.onEnd?.()
    return
  }
  playVoice(filename, { ...options, interrupt: true })
}

export function stopVoice() {
  activeVoiceToken += 1
  clearPendingVoiceStart()
  cancelBrowserSpeechSynthesis()
  stopAppVoiceAudio()
}

initAudioSettings()
preloadSfx()
