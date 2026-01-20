export class AudioManager {
  constructor() {
    this.current = null
    this.onPlayCallbacks = new Set()
    this.onStopCallbacks = new Set()
  }

  onPlay(cb) {
    if (typeof cb === 'function') this.onPlayCallbacks.add(cb)
    return () => this.onPlayCallbacks.delete(cb)
  }

  onStop(cb) {
    if (typeof cb === 'function') this.onStopCallbacks.add(cb)
    return () => this.onStopCallbacks.delete(cb)
  }

  play(src, { volume = 0.9, loop = false, onEnd } = {}) {
    if (!src) return
    this.stop()

    const audio = createAudio(src, volume, loop)
    if (!audio) return

    audio.onended = () => {
      this.current = null
      onEnd?.()
      this.onStopCallbacks.forEach((cb) => cb())
    }

    audio.play().then(
      () => {
        this.current = audio
        this.onPlayCallbacks.forEach((cb) => cb(audio))
      },
      (err) => {
        console.error('🔈 No se pudo reproducir el audio:', err)
        onEnd?.(err)
      }
    )
  }

  stop() {
    if (this.current) {
      this.current.pause()
      this.current.currentTime = 0
      this.onStopCallbacks.forEach((cb) => cb())
      this.current = null
    }
  }

  pause() {
    this.current?.pause()
  }

  resume() {
    this.current?.play().catch(() => null)
  }
}

function createAudio(src, volume, loop) {
  try {
    const audio = new Audio(src)
    audio.volume = volume
    audio.loop = loop
    audio.preload = 'auto'
    return audio
  } catch (err) {
    console.error('🔈 Error al crear el elemento de audio:', err)
    return null
  }
}

export default AudioManager
