<template>
  <section class="ai-lab">
    <h1>AI Content Lab</h1>

    <label for="json-input" class="label">Exercise Batch JSON</label>
    <textarea
      id="json-input"
      v-model="rawJson"
      class="json-input"
      placeholder='Paste JSON here. Example: { "exercises": [ ... ] }'
    />

    <div class="actions">
      <button type="button" @click="handleGenerateMockBatch">Generate Mock Batch</button>
      <button type="button" @click="handleValidate">Validate</button>
      <button type="button" @click="handleDownload" :disabled="!canDownload">Download JSON</button>
    </div>

    <div class="result-panel">
      <h2>Validation Result</h2>
      <p><strong>Status:</strong> {{ validationStatus }}</p>

      <p v-if="parseError" class="error">{{ parseError }}</p>

      <ul v-if="batchErrors.length" class="error-list">
        <li v-for="(err, idx) in batchErrors" :key="`batch-${idx}`">{{ err }}</li>
      </ul>

      <div v-if="exerciseResults.length" class="exercise-results">
        <div
          v-for="result in exerciseResults"
          :key="result.index"
          class="exercise-result"
        >
          <p>
            <strong>Exercise {{ result.index + 1 }}</strong>
            <span v-if="result.valid"> - OK</span>
            <span v-else> - Invalid</span>
          </p>
          <ul v-if="result.errors.length" class="error-list">
            <li v-for="(err, i) in result.errors" :key="`err-${result.index}-${i}`">{{ err }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AIReadingExercise } from '../lib/ai/schemas/exerciseSchema'
import { validateGeneratedExercise } from '../lib/ai/utils/validateGeneratedExercise'
import { downloadJson } from '../lib/ai/utils/downloadJson'
import { MockLLMClient } from '../lib/ai/clients/MockLLMClient'

type ExerciseValidationView = {
  index: number
  valid: boolean
  errors: string[]
}

const rawJson = ref('')
const parseError = ref('')
const batchErrors = ref<string[]>([])
const exerciseResults = ref<ExerciseValidationView[]>([])
const parsedExercises = ref<AIReadingExercise[]>([])

const allValid = computed(() => {
  return exerciseResults.value.length > 0 && exerciseResults.value.every((result) => result.valid)
})

const canDownload = computed(() => allValid.value && parsedExercises.value.length > 0)

const validationStatus = computed(() => {
  if (parseError.value) return 'Invalid JSON'
  if (!exerciseResults.value.length) return 'Pending'
  return allValid.value ? 'Valid batch' : 'Batch has errors'
})

function resetValidationState() {
  parseError.value = ''
  batchErrors.value = []
  exerciseResults.value = []
  parsedExercises.value = []
}

function extractExercises(payload: unknown): AIReadingExercise[] {
  if (Array.isArray(payload)) {
    return payload as AIReadingExercise[]
  }

  if (payload && typeof payload === 'object') {
    const maybeBatch = payload as { exercises?: unknown }
    if (Array.isArray(maybeBatch.exercises)) {
      return maybeBatch.exercises as AIReadingExercise[]
    }
  }

  return []
}

function handleValidate() {
  resetValidationState()

  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson.value)
  } catch {
    parseError.value = 'Invalid JSON format. Check syntax and try again.'
    return
  }

  const exercises = extractExercises(parsed)
  if (!exercises.length) {
    batchErrors.value.push('No exercises found. Provide an array or an object with "exercises" array.')
    return
  }

  parsedExercises.value = exercises

  exerciseResults.value = exercises.map((exercise, index) => {
    const result = validateGeneratedExercise(exercise)
    return {
      index,
      valid: result.valid,
      errors: result.errors
    }
  })
}

function handleDownload() {
  if (!canDownload.value) return
  downloadJson({ exercises: parsedExercises.value }, 'ai-generated-exercises.json')
}

async function handleGenerateMockBatch() {
  resetValidationState()
  const client = new MockLLMClient()
  const response = await client.generateStructuredJson({
    user: 'Generate a sample batch of reading exercises for children.'
  })
  rawJson.value = JSON.stringify(response.data, null, 2)
}
</script>

<style scoped>
.ai-lab {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.json-input {
  width: 100%;
  min-height: 260px;
  resize: vertical;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

button {
  padding: 0.55rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.result-panel {
  margin-top: 1.25rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.error {
  color: #b91c1c;
  font-weight: 600;
}

.error-list {
  margin: 0.4rem 0 0;
  padding-left: 1.2rem;
  color: #b91c1c;
}

.exercise-results {
  margin-top: 0.8rem;
}

.exercise-result {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.6rem;
  margin-top: 0.6rem;
}
</style>
