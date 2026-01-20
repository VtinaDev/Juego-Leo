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
  if (isSpeaking.value) {
    stop()
    emit('tts-end')
    return
  }

  const text = resolvedText.value
  const hasTTSSupport = isTTSSupported()
  const ttsConfig = (props.exercise && (props.exercise as any).tts) || {}

  if (text && hasTTSSupport) {
    emit('tts-start')
    await speak(text, {
      lang: props.lang || ttsConfig.lang,
      rate: props.rate ?? ttsConfig.rate,
      pitch: props.pitch ?? ttsConfig.pitch,
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
      const audio = new Audio(props.audioSrc)
      audio.play().catch(() => null)
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
  border-radius: 12px;
  border: 2px solid rgba(14, 165, 233, 0.35);
  background: linear-gradient(135deg, #e0f2fe, #c7d2fe);
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.2);
  font-size: 1.2rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.audio-button:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 12px 22px rgba(14, 165, 233, 0.28);
  background: linear-gradient(135deg, #bfdbfe, #c7d2fe);
}
.audio-button:active {
  transform: translateY(0);
  box-shadow: 0 5px 12px rgba(15, 23, 42, 0.14);
}
.audio-button__icon {
  width: 38px;
  height: 38px;
  display: block;
  object-fit: contain;
  pointer-events: none;
}
</style>
