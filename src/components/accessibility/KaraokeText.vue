<template>
  <span v-if="!enabled" class="karaoke-text">
    {{ text }}
  </span>
  <span v-else class="karaoke-text karaoke-text--enabled" :aria-label="ariaLabel">
    <span
      v-for="(segment, idx) in segments"
      :key="`${idx}-${segment.text}`"
      :class="[
        'karaoke-text__segment',
        {
          'karaoke-text__segment--gap': segment.isGap,
          'karaoke-text__segment--active': isActiveSegment(segment)
        }
      ]"
    >
      {{ segment.text }}
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  enabled: { type: Boolean, default: false },
  granularity: { type: String, default: 'word' },
  activeToken: { type: String, default: '' },
  activeIndex: { type: Number, default: -1 }
})

const segments = computed(() =>
  props.granularity === 'syllable'
    ? splitIntoSyllableSegments(props.text)
    : splitIntoWordSegments(props.text)
)

const ariaLabel = computed(() =>
  props.granularity === 'syllable'
    ? 'Texto con apoyo silaba por silaba'
    : 'Texto con apoyo palabra por palabra'
)

function splitIntoWordSegments(text = '') {
  const segments = []
  let wordIndex = 0

  String(text || '').split(/(\s+)/).forEach((part) => {
    if (!part) return
    if (/^\s+$/.test(part)) {
      segments.push({ text: part, isGap: true, wordIndex: -1, token: '' })
      return
    }
    segments.push({
      text: part,
      isGap: false,
      segmentIndex: segments.length,
      wordIndex,
      token: normalizeToken(part)
    })
    wordIndex += 1
  })

  return segments
}

function splitIntoSyllableSegments(text = '') {
  const segments = []
  const vowels = 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ'
  let cursor = 0

  String(text || '').split(/(\s+)/).forEach((part) => {
    if (!part) return
    if (/^\s+$/.test(part)) {
      segments.push({ text: part, isGap: true, segmentIndex: segments.length, wordIndex: -1, token: '' })
      cursor += part.length
      return
    }

    splitWordIntoSyllables(part, vowels).forEach((syllable) => {
      segments.push({
        text: syllable,
        isGap: false,
        segmentIndex: segments.length,
        wordIndex: -1,
        token: normalizeToken(syllable)
      })
    })
    cursor += part.length
  })

  return segments
}

function splitWordIntoSyllables(word = '', vowels = '') {
  const source = String(word || '')
  if (!source) return []

  const normalized = source.toLowerCase()
  const isVowel = (char) => vowels.includes(char)
  const strongVowels = new Set(['a', 'e', 'o', 'á', 'é', 'ó'])
  const inseparableOnsets = new Set([
    'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'tl', 'ch', 'll', 'rr'
  ])

  const breaksDiphthong = (a, b) => {
    if (!a || !b) return true
    const aStrong = strongVowels.has(a)
    const bStrong = strongVowels.has(b)
    if (aStrong && bStrong) return true
    if (a === 'í' || a === 'ú' || b === 'í' || b === 'ú') return true
    return false
  }

  const pieces = []
  let i = 0
  while (i < source.length) {
    let nucleusStart = i
    while (nucleusStart < source.length && !isVowel(normalized[nucleusStart])) nucleusStart += 1
    if (nucleusStart >= source.length) {
      if (pieces.length) pieces[pieces.length - 1] += source.slice(i)
      else pieces.push(source.slice(i))
      break
    }

    let nucleusEnd = nucleusStart
    while (nucleusEnd + 1 < source.length && isVowel(normalized[nucleusEnd + 1])) {
      if (breaksDiphthong(normalized[nucleusEnd], normalized[nucleusEnd + 1])) break
      nucleusEnd += 1
    }

    let nextVowel = nucleusEnd + 1
    while (nextVowel < source.length && !isVowel(normalized[nextVowel])) nextVowel += 1

    if (nextVowel >= source.length) {
      pieces.push(source.slice(i))
      break
    }

    const cluster = source.slice(nucleusEnd + 1, nextVowel)
    const normalizedCluster = normalized.slice(nucleusEnd + 1, nextVowel)
    let splitAt = nextVowel

    if (cluster.length <= 1) {
      splitAt = nucleusEnd + 1
    } else {
      const onset = normalizedCluster.slice(-2)
      splitAt = inseparableOnsets.has(onset) ? nextVowel - 2 : nextVowel - 1
    }

    splitAt = Math.max(nucleusEnd + 1, Math.min(splitAt, nextVowel))
    pieces.push(source.slice(i, splitAt))
    i = splitAt
  }

  return pieces.filter(Boolean)
}

function normalizeToken(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function isActiveSegment(segment) {
  if (!props.enabled || segment.isGap) return false
  if (props.granularity === 'syllable') return segment.segmentIndex === props.activeIndex
  if (props.activeIndex >= 0) return segment.wordIndex === props.activeIndex
  const active = normalizeToken(props.activeToken)
  return Boolean(active && segment.token === active)
}
</script>

<style scoped>
.karaoke-text {
  white-space: pre-wrap;
}

.karaoke-text--enabled {
  word-break: normal;
  overflow-wrap: anywhere;
}

.karaoke-text__segment {
  display: inline;
  border-radius: 0.45em;
  transition: background-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
}

.karaoke-text__segment--active {
  background: #dbeafe;
  color: #0f172a;
  box-shadow: 0 0 0 0.16em rgba(219, 234, 254, 0.85);
}

.karaoke-text__segment--gap {
  box-shadow: none;
}
</style>
