import { onBeforeUnmount, ref } from 'vue'

export interface TTSSpeakOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  onBoundary?: (event: SpeechSynthesisEvent) => void
}

const isSpeaking = ref(false)

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  return window.speechSynthesis ?? null
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = getSpeechSynthesis()
    if (!synth) {
      resolve([])
      return
    }

    const voices = synth.getVoices()
    if (voices && voices.length > 0) {
      resolve(voices)
      return
    }

    let attempts = 0
    const maxAttempts = 3

    const tryResolve = () => {
      const list = synth.getVoices() || []
      attempts += 1
      if (list.length > 0 || attempts >= maxAttempts) {
        resolve(list)
      } else {
        window.setTimeout(tryResolve, 150)
      }
    }

    const timer = window.setTimeout(() => resolve(synth.getVoices() || []), 1200)
    synth.addEventListener(
      'voiceschanged',
      () => {
        window.clearTimeout(timer)
        resolve(synth.getVoices() || [])
      },
      { once: true }
    )

    tryResolve()
  })
}

function pickVoice(voices: SpeechSynthesisVoice[], lang = 'es-ES'): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null
  const normalizedLang = lang.toLowerCase()
  const baseLang = normalizedLang.split('-')[0]

  const spanishVoices = voices.filter((v) => {
    const voiceLang = (v.lang || '').toLowerCase()
    return voiceLang.startsWith(baseLang)
  })

  const femaleHints = [
    'niña',
    'girl',
    'female',
    'woman',
    'nena',
    'chica',
    'lady',
    'mujer'
  ]
  const childHints = ['kids', 'kid', 'niño', 'niñ', 'child', 'chico', 'young', 'teen', 'joven', 'peque', 'little']
  const softHints = ['soft', 'calm', 'natural', 'fun', 'happy', 'alegre', 'diver', 'sweet']
  const spanishHints = ['español', 'espanol', 'castilian', 'castellano', 'latam', 'mex', 'mx', 'es-']
  const maleHints = ['male', 'man', 'hombre', 'masc']

  const scoreVoice = (voice: SpeechSynthesisVoice) => {
    const lower = voice.name.toLowerCase()
    let score = 0
    if (femaleHints.some((p) => lower.includes(p))) score += 4
    if (childHints.some((p) => lower.includes(p))) score += 3
    if (softHints.some((p) => lower.includes(p))) score += 1
    if (spanishHints.some((p) => lower.includes(p))) score += 1
    if (maleHints.some((p) => lower.includes(p))) score -= 4
    return score
  }

  if (spanishVoices.length > 0) {
    const sorted = [...spanishVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))
    const top = sorted[0]
    if (top && scoreVoice(top) >= 0) return top
    return top || spanishVoices[0]
  }

  return null
}

export function useTTS() {
  let currentUtterance: SpeechSynthesisUtterance | null = null

  async function speak(text: string, options: TTSSpeakOptions = {}): Promise<void> {
    if (!text || !isTTSSupported()) return
    stop()

    const synth = getSpeechSynthesis()
    if (!synth) return

    const utterance = new SpeechSynthesisUtterance(text)
    const voices = await waitForVoices()

  const lang = options.lang || 'es-ES'
  utterance.lang = lang
  utterance.rate = options.rate ?? 0.92
  utterance.pitch = options.pitch ?? 1.2
  utterance.volume = options.volume ?? 1

    const voice = pickVoice(voices, lang)
    if (voice) utterance.voice = voice

    currentUtterance = utterance
    isSpeaking.value = true

    await new Promise<void>((resolve) => {
      utterance.onboundary = (event) => {
        options.onBoundary?.(event)
      }
      utterance.onend = () => {
        isSpeaking.value = false
        resolve()
      }
      utterance.onerror = () => {
        isSpeaking.value = false
        resolve()
      }
      synth.speak(utterance)
    })
  }

  function stop() {
    const synth = getSpeechSynthesis()
    if (!synth) return
    if (synth.speaking) {
      synth.cancel()
    }
    isSpeaking.value = false
    currentUtterance = null
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    isSpeaking,
    speak,
    stop
  }
}
