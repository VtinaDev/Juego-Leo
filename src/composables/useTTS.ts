import { onBeforeUnmount, ref } from 'vue'
import { getAudioSettings, playVoice, stopVoice } from '../engine/audio/audioManager'

export interface TTSSpeakOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  onBoundary?: (event: Event) => void
}

const isSpeaking = ref(false)

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && typeof fetch !== 'undefined'
}

export function useTTS() {
  async function speak(text: string, options: TTSSpeakOptions = {}): Promise<void> {
    const normalized = String(text || '').trim()
    if (!normalized || !isTTSSupported()) return

    stop()

    const audioSettings = getAudioSettings()
    if (!audioSettings.voiceEnabled) return

    isSpeaking.value = true
    playVoice(normalized, {
      interrupt: true,
      volume: options.volume,
      onEnd: () => {
        isSpeaking.value = false
      }
    })
  }

  function stop() {
    stopVoice()
    isSpeaking.value = false
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
