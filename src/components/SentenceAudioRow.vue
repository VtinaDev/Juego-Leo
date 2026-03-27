<template>
  <div
    v-if="displayText"
    class="sentence-audio-row"
    :class="[rowClass, { 'is-centered': alignCenter }]"
  >
    <p :class="[textClass, { 'text-center': alignCenter }]">
      <slot>{{ displayText }}</slot>
    </p>
    <AudioButton
      class="sentence-audio-btn"
      :exercise="exercise"
      :narration-text="spokenText"
      :audio-src="audioSrc"
      :lang="lang"
      :rate="rate"
      :pitch="pitch"
      :aria-label="ariaLabel"
      @fallback-audio="(src) => $emit('fallback-audio', src)"
      @tts-start="$emit('tts-start')"
      @tts-end="$emit('tts-end')"
      @tts-boundary="(event) => $emit('tts-boundary', event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AudioButton from './AudioButton.vue'

const props = defineProps({
  text: { type: String, default: '' },
  speakText: { type: String, default: '' },
  audioSrc: { type: String, default: '' },
  exercise: { type: Object, default: null },
  textClass: { type: String, default: 'sentence-audio-text' },
  rowClass: { type: String, default: '' },
  alignCenter: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Escuchar frase' },
  lang: { type: String, default: undefined },
  rate: { type: Number, default: undefined },
  pitch: { type: Number, default: undefined }
})

function sanitizeSpeakText(raw = '') {
  const cleaned = raw.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim()
  // Si el texto viene como letras separadas por espacios, se maneja en preferExerciseAnswerIfSpelled.
  return cleaned
}

const BLANK_REGEX = /_{3,}/g
const displayText = computed(() => props.text?.trim() || '')
const spokenText = computed(() => {
  const candidate = props.speakText?.trim() ? props.speakText : displayText.value
  const withAnswer = fillWithCorrectIfBlank(candidate || '', props.exercise)
  const corrected = preferExerciseAnswerIfSpelled(withAnswer, props.exercise)
  return sanitizeSpeakText(corrected)
})

function fillWithCorrectIfBlank(text: string, exercise: any) {
  if (!text || !exercise) return text
  if (!BLANK_REGEX.test(text)) return text
  const replacement = (exercise.correct || exercise.answer || '').toString().trim()
  if (!replacement) return text
  return text.replace(BLANK_REGEX, replacement)
}

function preferExerciseAnswerIfSpelled(text: string, exercise: any) {
  const correct = (exercise?.correct || exercise?.answer || '').toString().trim()
  if (!correct) return text
  // Detect textos como "s o p a" (letras separadas)
  const lettersOnly = text.replace(/\s+/g, '')
  const isSpelled = /^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])+$/u.test(lettersOnly) && text.includes(' ')
  if (isSpelled) {
    // Si el deletreo no iguala la longitud de la respuesta, usa la palabra completa
    if (lettersOnly.length !== correct.replace(/\s+/g, '').length) {
      return correct
    }
    // Si iguala, igualmente preferimos la palabra completa para apoyo auditivo
    return correct
  }
  return text
}
</script>

<style scoped>
.sentence-audio-row {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  justify-content: flex-start;
  font-family: var(--font-readable, 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif);
}
.sentence-audio-row.is-centered {
  justify-content: center;
}
.sentence-audio-text {
  margin: 0;
  font-weight: 750;
  font-size: clamp(1.2rem, 4.9vw, 1.5rem);
  line-height: 1.56;
  color: #0f172a;
  text-wrap: balance;
  max-width: 26ch;
}
.sentence-audio-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}
@media (max-width: 640px) {
  .sentence-audio-row {
    gap: 0.5rem;
  }
  .sentence-audio-btn {
    width: 42px;
    height: 42px;
  }
}
</style>
