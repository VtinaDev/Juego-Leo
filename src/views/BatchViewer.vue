<template>
  <section class="batch-viewer">
    <h1>Batch Viewer</h1>

    <p v-if="!batchEntries.length">No batches loaded</p>

    <div v-else class="batch-list">
      <article v-for="([batchKey, batch]) in batchEntries" :key="batchKey" class="batch-card">
        <h2>{{ batchKey }}</h2>

        <div v-for="exercise in batch.exercises" :key="exercise.id" class="exercise-card">
          <h3>{{ exercise.title }}</h3>
          <p><strong>Text:</strong> {{ exercise.text }}</p>
          <p><strong>Question:</strong> {{ exercise.question }}</p>

          <p><strong>Options:</strong></p>
          <ul>
            <li v-for="(option, index) in exercise.options" :key="`${exercise.id}-opt-${index}`">
              {{ option }}
            </li>
          </ul>

          <p><strong>Correct Answer:</strong> {{ exercise.correctAnswer }}</p>
          <p><strong>Skill:</strong> {{ exercise.skillType }}</p>
          <p><strong>Difficulty:</strong> {{ exercise.difficulty }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LOCAL_BATCH_REGISTRY } from '../lib/ai/utils/loadLocalExerciseBatch'

const batchEntries = computed(() => Object.entries(LOCAL_BATCH_REGISTRY))
</script>

<style scoped>
.batch-viewer {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.batch-list {
  display: grid;
  gap: 1rem;
}

.batch-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
}

.exercise-card {
  border-top: 1px solid #e2e8f0;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
}

ul {
  margin: 0.4rem 0 0.8rem;
  padding-left: 1.2rem;
}
</style>
