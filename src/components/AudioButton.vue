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
import { computed, getCurrentInstance, onBeforeUnmount } from 'vue'
import { useTTS, isTTSSupported } from '../composables/useTTS'
import { getAudioSettings, playSfx, playVoice, unlockAudio } from '../engine/audio/audioManager'
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

const { speak, stop, isSpeaking } = useTTS()
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
    stop()
    emit('tts-end')
    return
  }

  const text = resolvedText.value
  const hasTTSSupport = isTTSSupported()

  if (text && hasTTSSupport) {
    emit('tts-start')
    await speak(text, {
      lang: props.lang,
      rate: props.rate,
      pitch: props.pitch,
      volume: audioSettings.voiceVolume,
      onBoundary: (event) => emit('tts-boundary', event)
    })
    emit('tts-end')
    return
  }

  if (props.audioSrc) {
    emit('fallback-audio', props.audioSrc)
    const hasListener =
      !!instance?.vnode?.props &&
      ('onFallback-audio' in (instance.vnode.props as Record<string, unknown>) ||
        'onFallbackAudio' in (instance.vnode.props as Record<string, unknown>))

    if (!hasListener) {
      playVoice(props.audioSrc)
    }
  }
}

onBeforeUnmount(() => {
  stop()
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
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  font-size: 1.2rem;
  transition: transform 0.15s ease;
}
.audio-button:hover {
  transform: translateY(-1px) scale(1.03);
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
