<template>
  <div>
    <p class="mb-3 text-lg">{{ prompt }}</p>
    <div class="flex flex-wrap gap-2 mb-4" role="list">
      <button
        v-for="(w, idx) in pool"
        :key="idx"
        class="btn btn-secondary"
        type="button"
        @click="take(idx)"
      >
        {{ w }}
      </button>
    </div>

    <div class="card min-h-[72px] flex items-center gap-2" aria-live="polite">
      <span
        v-for="(w, i) in answer"
        :key="i"
        class="px-3 py-2 bg-azul text-white rounded-2xl"
      >
        {{ w }}
      </span>
    </div>

    <div class="mt-4 flex gap-3">
      <button class="btn" type="button" @click="reset">Reiniciar</button>
      <button v-if="!hideSubmit" class="btn btn-primary" type="button" @click="check">Continuar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  prompt: { type: String, default: 'Ordena las palabras' },
  words: { type: Array, required: true }, // array de palabras desordenadas
  correct: { type: Array, required: true }, // orden correcto
  hideSubmit: { type: Boolean, default: false }
})

const emit = defineEmits(['result'])

const pool = ref([...props.words])
const answer = ref([])

function take(idx) {
  const word = pool.value[idx]
  if (!word) return
  answer.value.push(word)
  pool.value.splice(idx, 1)
}

function reset() {
  pool.value = [...props.words]
  answer.value = []
}

function check() {
  const normalize = (value) => String(value ?? '').trim().toLowerCase()
  const ok =
    answer.value.length === props.correct.length &&
    answer.value.every((word, idx) => normalize(word) === normalize(props.correct[idx]))
  emit('result', ok)
}

watch(
  () => props.words,
  (words) => {
    pool.value = [...words]
    answer.value = []
  }
)
</script>
