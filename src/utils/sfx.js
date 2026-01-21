import { loadSettings } from './settings'

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (audioCtx) return audioCtx
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    return audioCtx
  } catch (error) {
    console.warn('⚠️ AudioContext no disponible', error)
    return null
  }
}

function playTone(frequency = 680, durationMs = 180, volume = 0.08) {
  const settings = loadSettings()
  if (!settings.sfx) return
  const ctx = getAudioContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.value = frequency
  gain.gain.value = volume

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start()
  const durationSec = Math.max(0.05, durationMs / 1000)
  oscillator.stop(ctx.currentTime + durationSec)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => null)
  }
}

export function playSfx(type = 'cta') {
  if (type === 'unlock') {
    playTone(560, 180, 0.08)
    setTimeout(() => playTone(820, 160, 0.07), 140)
    return
  }
  playTone(520, 200, 0.08)
}

export default { playSfx }
