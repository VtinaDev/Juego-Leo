<template>
  <button
    class="audio-button"
    type="button"
    :aria-pressed="isSpeaking"
    :aria-label="isSpeaking ? 'Detener narración' : 'Reproducir audio'"
    @click="handleClick"
  >
    <span v-if="isSpeaking">⏸️</span>
    <img
      v-else
      src="/icons/audio.PNG"
      alt=""
      class="audio-button__icon"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, ref } from 'vue'
import { getAudioSettings, playSfx, playVoice, stopVoice, unlockAudio } from '../engine/audio/audioManager'
import { getExerciseNarrationText } from '../utils/getExerciseNarrationText'

const props = defineProps<{
  exercise?: any
  narrationText?: string | null
  audioSrc?: string | null
  lang?: string
  rate?: number
  pitch?: number
}>()

const emit = defineEmits<{
  (e: 'fallback-audio', src: string): void
  (e: 'tts-start'): void
  (e: 'tts-end'): void
  (e: 'tts-boundary', event: SpeechSynthesisEvent): void
}>()

const isSpeaking = ref(false)
const instance = getCurrentInstance()

const resolvedText = computed(() => {
  if (props.narrationText) return props.narrationText
  return getExerciseNarrationText(props.exercise)
})

async function handleClick() {
  unlockAudio()
  playSfx('click')
  const audioSettings = getAudioSettings()
  if (!audioSettings.voiceEnabled) return

  if (isSpeaking.value) {
    stopVoice()
    isSpeaking.value = false
    emit('tts-end')
    return
  }

  const normalizedAudioSrc = normalizeAudioSrc(props.audioSrc || '')
  if (normalizedAudioSrc) {
    isSpeaking.value = true
    emit('tts-start')
    emit('fallback-audio', normalizedAudioSrc)
    const hasListener =
      !!instance?.vnode?.props &&
      ('onFallback-audio' in (instance.vnode.props as Record<string, unknown>) ||
        'onFallbackAudio' in (instance.vnode.props as Record<string, unknown>))

    if (!hasListener) {
      playVoice(normalizedAudioSrc, {
        onEnd: () => {
          isSpeaking.value = false
          emit('tts-end')
        }
      })
      return
    }
    // Si el padre maneja la reproducción, desactiva el estado visual local.
    setTimeout(() => {
      isSpeaking.value = false
      emit('tts-end')
    }, 120)
    return
  }

  const text = resolvedText.value
  if (text) {
    // En producción playVoice(text) queda deshabilitado por AudioManager.
    isSpeaking.value = true
    emit('tts-start')
    playVoice(text, {
      lang: props.lang,
      rate: props.rate,
      pitch: props.pitch,
      onEnd: () => {
        isSpeaking.value = false
        emit('tts-end')
      }
    })
    return
  }
}

function normalizeAudioSrc(value: string): string {
  const src = String(value || '').trim()
  if (!src) return ''
  if (/^(https?:|data:)/i.test(src)) return src
  if (src.startsWith('/')) return src
  return `/${src.replace(/^\/+/, '')}`
}

onBeforeUnmount(() => {
  stopVoice()
  isSpeaking.value = false
})
</script>

<style scoped>
.audio-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid rgba(219, 143, 75, 0.55);
  border-radius: 999px;
  background: linear-gradient(145deg, #ffe29a 0%, #ffc982 55%, #f0b572 100%);
  box-shadow: 0 8px 16px rgba(240, 177, 114, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.65);
  font-size: 1.2rem;
  transition: transform 0.15s ease;
}
.audio-button:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 10px 20px rgba(240, 177, 114, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.72);
}
.audio-button:active {
  transform: translateY(0);
}
.audio-button:focus-visible {
  outline: none;
}
.audio-button__icon {
  width: 38px;
  height: 38px;
  display: block;
  object-fit: contain;
  pointer-events: none;
}
</style>
