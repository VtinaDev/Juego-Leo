<template>
  <button
    class="audio-button"
    type="button"
    :aria-pressed="isSpeaking"
    :aria-label="isSpeaking ? 'Detener narración' : 'Escuchar'"
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
import { computed, onBeforeUnmount, ref } from 'vue'
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
  (e: 'tts-start'): void
  (e: 'tts-end'): void
  (e: 'tts-boundary', event: SpeechSynthesisEvent): void
}>()

const isSpeaking = ref(false)

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

  const voiceKey = props.audioSrc || props.exercise?.audio || props.exercise?.id || resolvedText.value
  if (voiceKey) {
    isSpeaking.value = true
    emit('tts-start')
    playVoice(voiceKey, {
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
@media (max-width: 768px) {
  .audio-button {
    width: 56px;
    height: 56px;
  }
  .audio-button__icon {
    width: 46px;
    height: 46px;
  }
}
</style>
