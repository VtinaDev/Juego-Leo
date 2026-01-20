import { ref } from 'vue'
import { AudioManager } from './AudioManager'
import { VoiceInput } from './VoiceInput'

const audioManager = new AudioManager()
const voiceInput = typeof window !== 'undefined' ? new VoiceInput() : null

const isPlaying = ref(false)
const isListening = ref(false)
const lastTranscript = ref('')

audioManager.onPlay(() => {
  isPlaying.value = true
})

audioManager.onStop(() => {
  isPlaying.value = false
})

export function useAudio() {
  function playAudio(src, { onEnd, volume, loop } = {}) {
    audioManager.play(src, {
      volume,
      loop,
      onEnd: (err) => {
        isPlaying.value = false
        onEnd?.(err)
      }
    })
  }

  function stopAudio() {
    audioManager.stop()
    isPlaying.value = false
  }

  function listenForAnswer(onResult, { onError, lang } = {}) {
    if (!voiceInput) {
      onError?.('Reconocimiento de voz no disponible.')
      return
    }
    if (lang && voiceInput.lang !== lang) {
      voiceInput.lang = lang
    }

    isListening.value = true
    voiceInput.listen(
      (result) => {
        lastTranscript.value = result
        isListening.value = false
        onResult?.(result)
      },
      (error) => {
        isListening.value = false
        onError?.(error)
      }
    )
  }

  function stopListening() {
    voiceInput?.stop()
    isListening.value = false
  }

  return {
    playAudio,
    stopAudio,
    listenForAnswer,
    stopListening,
    isPlaying,
    isListening,
    lastTranscript
  }
}

export default useAudio
