import { Howl } from 'howler'

const SOUND_DEFS = {
  correct: {
    src: ['/audio/sfx/correct.wav'],
    volume: 0.7
  },
  error: {
    src: ['/audio/sfx/wrong.wav'],
    volume: 0.4
  },
  celebration: {
    src: ['/audio/sfx/confetti.wav'],
    volume: 0.7
  },
  gentleVoice: {
    src: ['/audio/voice/exercise-try-again.mp3'],
    volume: 0.6
  }
}

const registry = new Map()

function createHowl(name) {
  const config = SOUND_DEFS[name]
  if (!config) return null
  const howl = new Howl({
    preload: true,
    html5: false,
    ...config
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
    const howl = resolveHowl(name)
    if (!howl) return
    if (typeof volume === 'number') {
      howl.volume(volume)
    }
    if (typeof rate === 'number') {
      howl.rate(rate)
    }
    howl.play()
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
