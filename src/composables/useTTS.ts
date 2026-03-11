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
  const { voice, name } = pickPreferredVoice(voices, lang, cachedVoiceName || undefined)
  if (voice) cachedVoiceName = name || cachedVoiceName
  return voice
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

  const lang = options.lang || VOICE_PRESET.lang
  utterance.lang = lang
  // Voz infantil alegre: clara y animada, sin sonar acelerada
  utterance.rate = options.rate ?? VOICE_PRESET.rate
  utterance.pitch = options.pitch ?? VOICE_PRESET.pitch
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
