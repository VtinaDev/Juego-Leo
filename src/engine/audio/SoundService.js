import { Howl } from 'howler'

const SOUND_DEFS = {
  correct: {
    src: ['/audio/sfx/correct.wav'],
    volume: 0.7
  },
  error: {
    src: ['/audio/sfx/wrong.wav'],
    volume: 0.18
  },
  celebration: {
    src: ['/audio/sfx/confetti.wav'],
    volume: 0.7
  }
}

const registry = new Map()

function createHowl(name) {
  const config = SOUND_DEFS[name]
  if (!config) return null
  const howl = new Howl({
    preload: true,
    html5: false,
    ...config,
    onloaderror: (_id, error) => {
      console.warn(`[SoundService] No se pudo cargar ${name}`, error)
    },
    onplayerror: (_id, error) => {
      console.warn(`[SoundService] No se pudo reproducir ${name}`, error)
    }
  })
  registry.set(name, howl)
  return howl
}

function resolveHowl(name) {
  if (registry.has(name)) {
    return registry.get(name)
  }
  return createHowl(name)
}

export const SoundService = {
  preload(names = Object.keys(SOUND_DEFS)) {
    names.forEach((name) => {
      resolveHowl(name)
    })
  },

  play(name, { volume, rate } = {}) {
    try {
      const howl = resolveHowl(name)
      if (!howl) return null
      if (typeof volume === 'number') {
        howl.volume(volume)
      }
      if (typeof rate === 'number') {
        howl.rate(rate)
      }
      return howl.play()
    } catch (error) {
      console.warn(`[SoundService] No se pudo reproducir ${name}`, error)
      return null
    }
  },

  stop(name) {
    const howl = registry.get(name)
    howl?.stop()
  },

  fade(name, to, duration = 300) {
    const howl = registry.get(name)
    if (!howl) return
    howl.fade(howl.volume(), to, duration)
  },

  setMute(muted) {
    Howl.mute(Boolean(muted))
  }
}

export default SoundService
