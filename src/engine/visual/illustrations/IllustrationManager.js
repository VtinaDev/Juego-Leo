const CACHE_KEY = 'jl_illustrations_cache_v1'
const FALLBACK_IMAGES = [
  '/images/habitats/Fondo.PNG',
  '/images/habitats/escuela.PNG',
  'https://placehold.co/680x360/93c5fd/0f172a?text=Juego+%26+Leo',
  'https://placehold.co/680x360/fcd34d/0f172a?text=Ilustración',
  'https://placehold.co/680x360/6ee7b7/14532d?text=Aprendemos'
]

export class IllustrationManager {
  constructor() {
    this.cache = this.loadCache()
  }

  loadCache() {
    if (typeof window === 'undefined') return {}
    try {
      const raw = window.localStorage.getItem(CACHE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch (error) {
      console.warn('No se pudo cargar la caché de ilustraciones.', error)
      return {}
    }
  }

  saveCache() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache))
    } catch (error) {
      console.warn('No se pudo guardar la caché de ilustraciones.', error)
    }
  }

  async ensureIllustration(exercise, { level, subtype } = {}) {
    if (!exercise) return null

    if (exercise.image) {
      return { src: exercise.image, source: 'template' }
    }

    const cached = this.cache[exercise.id]
    if (cached) {
      return { src: cached.src, source: cached.source || 'cache' }
    }

    const prompt = this.composePrompt(exercise, { level, subtype })
    const imageUrl = await this.requestIllustration({
      prompt,
      level,
      subtype,
      meta: exercise.visual || {}
    })

    if (imageUrl) {
      this.cache[exercise.id] = { src: imageUrl, source: 'ai', updatedAt: Date.now() }
      this.saveCache()
      return { src: imageUrl, source: 'ai' }
    }

    const fallback = this.randomFallback()
    return fallback ? { src: fallback, source: 'fallback' } : null
  }

  composePrompt(exercise, { level, subtype } = {}) {
    if (exercise.visual?.prompt) return exercise.visual.prompt
    const parts = []
    if (level) parts.push(`Nivel ${level}`)
    if (subtype) parts.push(`Tipo ${subtype}`)
    if (exercise.question) parts.push(`Pregunta: ${exercise.question}`)
    if (exercise.sentence) parts.push(`Oración: ${exercise.sentence}`)
    if (exercise.options) parts.push(`Opciones: ${exercise.options?.slice(0, 2).join(', ')}`)
    if (exercise.imageHint) parts.push(`Referencia: ${exercise.imageHint}`)
    return parts.join(' | ')
  }

  async requestIllustration(payload) {
    const endpoint = import.meta.env.VITE_ILLUSTRATION_ENDPOINT
    if (!endpoint) {
      return this.randomFallback()
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_ILLUSTRATION_TOKEN || ''}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.warn('No se pudo generar la ilustración vía API.', await response.text())
        return this.randomFallback()
      }

      const data = await response.json()
      return data?.image || data?.imageUrl || this.randomFallback()
    } catch (error) {
      console.error('Error al solicitar ilustración:', error)
      return this.randomFallback()
    }
  }

  randomFallback() {
    return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]
  }
}

export const illustrationManager = new IllustrationManager()

export default illustrationManager
