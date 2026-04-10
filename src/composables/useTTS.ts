import { onBeforeUnmount, ref } from 'vue'

export interface TTSSpeakOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  onBoundary?: (event: SpeechSynthesisEvent) => void
}

import { VOICE_PRESET, pickPreferredVoice } from '../engine/audio/voiceProfile'

const isSpeaking = ref(false)
let cachedVoiceName: string | null = null

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
    const maxAttempts = 8

    const tryResolve = () => {
      const list = synth.getVoices() || []
      attempts += 1
      if (list.length > 0 || attempts >= maxAttempts) {
        resolve(list)
      } else {
        window.setTimeout(tryResolve, 180)
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

function normalizeNarrationText(text = ''): string {
  return String(text || '')
    .replace(/[_*#~`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitIntoReadableChunks(text = ''): string[] {
  const normalized = normalizeNarrationText(text)
  if (!normalized) return []
  const chunks = normalized
    .split(/(?<=[.!?;:])\s+/)
    .flatMap((sentence) => sentence.split(/(?<=,)\s+/))
    .map((part) => part.trim())
    .filter(Boolean)

  // Evita frases excesivamente largas para mantener atención y comprensión.
  return chunks.flatMap((chunk) => {
    if (chunk.length <= 95) return [chunk]
    const words = chunk.split(' ')
    const out: string[] = []
    let buffer = ''
    for (const word of words) {
      const next = buffer ? `${buffer} ${word}` : word
      if (next.length > 85 && buffer) {
        out.push(buffer)
        buffer = word
      } else {
        buffer = next
      }
    }
    if (buffer) out.push(buffer)
    return out
  })
}

function pickVoice(voices: SpeechSynthesisVoice[], lang = 'es-ES'): SpeechSynthesisVoice | null {
  const { voice, name } = pickPreferredVoice(voices, lang, cachedVoiceName || undefined)
  if (voice) cachedVoiceName = name || cachedVoiceName
  return voice
}

export function useTTS() {
  let currentUtterance: SpeechSynthesisUtterance | null = null
  let cancelled = false

  async function speak(text: string, options: TTSSpeakOptions = {}): Promise<void> {
    if (!text || !isTTSSupported()) return
    stop()

    const synth = getSpeechSynthesis()
    if (!synth) return

    const voices = await waitForVoices()
    const chunks = splitIntoReadableChunks(text)
    if (!chunks.length) return

    const lang = options.lang || VOICE_PRESET.lang
    const voice = pickVoice(voices, lang)

    cancelled = false
    isSpeaking.value = true

    for (const chunk of chunks) {
      if (cancelled) break
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = lang
      utterance.rate = options.rate ?? VOICE_PRESET.rate
      utterance.pitch = options.pitch ?? VOICE_PRESET.pitch
      utterance.volume = options.volume ?? 1
      if (voice) utterance.voice = voice
      currentUtterance = utterance

      await new Promise<void>((resolve) => {
        utterance.onboundary = (event) => {
          options.onBoundary?.(event)
        }
        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
        synth.speak(utterance)
      })

      if (!cancelled) {
        await new Promise((resolve) => window.setTimeout(resolve, 80))
      }
    }

    isSpeaking.value = false
    currentUtterance = null
  }

  function stop() {
    cancelled = true
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
