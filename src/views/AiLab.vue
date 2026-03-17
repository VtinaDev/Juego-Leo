<template>
  <section class="ai-lab">
    <h1>AI Content Lab</h1>

    <div class="config-grid">
      <label>
        <span>Age Range</span>
        <select v-model="selectedAgeRange">
          <option value="4-6">4-6</option>
          <option value="6-8">6-8</option>
          <option value="8-10">8-10</option>
        </select>
      </label>

      <label>
        <span>Skill</span>
        <select v-model="selectedSkillType">
          <option
            v-for="skill in availableSkills"
            :key="skill"
            :value="skill"
          >
            {{ skill }}
          </option>
        </select>
      </label>

      <label>
        <span>Difficulty</span>
        <select v-model="selectedDifficulty">
          <option
            v-for="difficulty in availableDifficulties"
            :key="difficulty"
            :value="difficulty"
          >
            {{ difficulty }}
          </option>
        </select>
      </label>

      <label>
        <span>Exercise Count</span>
        <input v-model.number="exerciseCount" type="number" min="1" max="20" />
      </label>
    </div>

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
      <span class="filename-hint">Suggested file: {{ suggestedFilename }}</span>
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
import { computed, ref, watch } from 'vue'
import type {
  AIReadingExercise,
  AIReadingExerciseBatch,
  AgeRange,
  SkillType,
  Difficulty
} from '../lib/ai/schemas/exerciseSchema'
import { validateGeneratedExercise } from '../lib/ai/utils/validateGeneratedExercise'
import { downloadJson } from '../lib/ai/utils/downloadJson'
import { MockLLMClient } from '../lib/ai/clients/MockLLMClient'
import { AGE_PRESETS } from '../lib/ai/utils/agePresets'
import { buildBatchFilename } from '../lib/ai/utils/buildBatchFilename'

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
const selectedAgeRange = ref<AgeRange>('6-8')
const selectedSkillType = ref<SkillType>('reading_comprehension')
const selectedDifficulty = ref<Difficulty>('easy')
const exerciseCount = ref(3)
const selectedPreset = computed(() => AGE_PRESETS[selectedAgeRange.value])
const availableSkills = computed(() => selectedPreset.value.allowedSkills)
const availableDifficulties = computed(() => selectedPreset.value.allowedDifficulty)

const allValid = computed(() => {
  return exerciseResults.value.length > 0 && exerciseResults.value.every((result) => result.valid)
})

const canDownload = computed(() => allValid.value && parsedExercises.value.length > 0)
const suggestedFilename = computed(() =>
  buildBatchFilename({
    ageRange: selectedAgeRange.value,
    skillType: selectedSkillType.value,
    difficulty: selectedDifficulty.value,
    sequenceNumber: 1
  })
)

const validationStatus = computed(() => {
  if (parseError.value) return 'Invalid JSON'
  if (!exerciseResults.value.length) return 'Pending'
  return allValid.value ? 'Valid batch' : 'Batch has errors'
})

watch(
  selectedAgeRange,
  () => {
    if (!availableSkills.value.includes(selectedSkillType.value)) {
      selectedSkillType.value = availableSkills.value[0]
    }
    if (!availableDifficulties.value.includes(selectedDifficulty.value)) {
      selectedDifficulty.value = availableDifficulties.value[0]
    }
  },
  { immediate: true }
)

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
  downloadJson({ exercises: parsedExercises.value }, suggestedFilename.value)
}

async function handleGenerateMockBatch() {
  resetValidationState()
  const client = new MockLLMClient()
  const response = await client.generateStructuredJson({
    user: 'Generate a sample batch of reading exercises for children.'
  })

  const sourceExercises = extractExercises(response.data)
  const safeCount = Math.max(1, Math.min(20, Number(exerciseCount.value) || 1))
  exerciseCount.value = safeCount

  const remappedExercises: AIReadingExercise[] = Array.from({ length: safeCount }, (_, index) => {
    const template = sourceExercises[index % sourceExercises.length] || {
      id: `mock-ex-${index + 1}`,
      ageRange: selectedAgeRange.value,
      title: `Mock Exercise ${index + 1}`,
      text: 'Texto de ejemplo.',
      question: '¿Cuál es la respuesta correcta?',
      options: ['Opción A', 'Opción B'],
      correctAnswer: 'Opción A',
      skillType: selectedSkillType.value,
      difficulty: selectedDifficulty.value
    }

    return {
      ...template,
      id: `${template.id}-${index + 1}`,
      ageRange: selectedAgeRange.value,
      skillType: selectedSkillType.value,
      difficulty: selectedDifficulty.value
    }
  })

  const batch: AIReadingExerciseBatch = { exercises: remappedExercises }
  rawJson.value = JSON.stringify(batch, null, 2)
}
</script>

<style scoped>
.ai-lab {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.config-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
}

.config-grid select,
.config-grid input {
  padding: 0.45rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
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
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.filename-hint {
  font-size: 0.9rem;
  color: #334155;
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
