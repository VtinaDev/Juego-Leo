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

    <div class="mt-4 flex gap-3 justify-center">
      <button
        class="dd-icon-btn dd-icon-btn--reset"
        type="button"
        @click="reset"
        aria-label="Reiniciar"
        title="Reiniciar"
      >
        <img src="/icons/next.PNG" alt="" aria-hidden="true" />
      </button>
      <button
        v-if="!hideSubmit"
        class="dd-icon-btn"
        type="button"
        @click="check"
        aria-label="Continuar"
        title="Continuar"
      >
        <img src="/icons/next.PNG" alt="" aria-hidden="true" />
      </button>
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

<style scoped>
.dd-icon-btn {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15);
}

.dd-icon-btn img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.dd-icon-btn--reset img {
  transform: rotate(180deg);
}

.dd-icon-btn:active {
  transform: scale(0.95);
}
</style>
