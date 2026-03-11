<template>
  <p class="text-2xl md:text-3xl leading-relaxed reading-phrase">
    <span
      v-for="(part, i) in normalizedParts"
      :key="`seg-${i}-${part.text}`"
      :class="syllableClass(part, i)"
    >
      {{ part.text }}
    </span>
  </p>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  // formato sugerido: [{ text: 'ca', isGap: false }, { text: ' ', isGap: true }, ...]
  segments: { type: Array, default: () => [] },
  highlight: { type: Number, default: -1 },
  jumpMode: { type: Boolean, default: false }
})

const normalizedParts = computed(() => {
  if (Array.isArray(props.segments) && props.segments.length) {
    return props.segments.map((segment) => ({
      text: String(segment?.text ?? ''),
      isGap: Boolean(segment?.isGap)
    }))
  }

  // Compatibilidad: si no llegan segmentos, usa el texto completo como una sola pieza.
  return [{ text: String(props.text || ''), isGap: false }]
})

function syllableClass(part, idx) {
  if (part.isGap) return 'reading-syllable reading-syllable--gap'
  const classes = ['reading-syllable']
  if (idx === props.highlight) {
    classes.push(props.jumpMode ? 'reading-syllable--jump' : 'reading-syllable--active')
  }
  return classes
}
</script>

<style scoped>
.reading-phrase {
  font-size: clamp(1.2rem, 2.6vw, 1.6rem);
  line-height: 1.35;
  font-weight: 700;
  color: #0f172a;
  padding: 0;
  margin: 0;
  text-align: left;
  white-space: pre-wrap;
  flex: 1;
}

.reading-syllable {
  display: inline-block;
  border-bottom: 2px solid transparent;
  transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
}

.reading-syllable--active {
  border-bottom-color: #f59e0b;
  background: rgba(255, 243, 196, 0.85);
  color: #b45309;
  border-radius: 10px;
  padding: 2px 4px;
}

.reading-syllable--jump {
  border-bottom-color: transparent;
  background: transparent;
  color: #b45309;
  animation: syllableJump 0.52s ease-out;
}

.reading-syllable--gap {
  border-bottom-color: transparent;
  padding: 0;
}

@keyframes syllableJump {
  0% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-8px) scale(1.07);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reading-syllable--jump {
    animation: none;
  }
}
</style>
