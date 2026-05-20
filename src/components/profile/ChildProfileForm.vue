<template>
  <section class="card child-form" aria-labelledby="child-profile-title">
    <div class="section-head">
      <div>
        <p class="section-kicker">Perfil del niño</p>
        <h2 id="child-profile-title">Datos para personalizar la ruta</h2>
      </div>
      <button class="btn btn-primary" type="button" :disabled="loading" @click="$emit('save')">
        Guardar
      </button>
    </div>

    <div class="form-grid">
      <label>
        <span>Nombre</span>
        <input
          :value="name"
          class="form-input"
          autocomplete="given-name"
          @input="$emit('update:name', $event.target.value)"
        />
      </label>
      <label>
        <span>Fecha de nacimiento</span>
        <input
          :value="birthdate"
          type="date"
          class="form-input"
          @input="$emit('update:birthdate', $event.target.value)"
        />
      </label>
    </div>

    <LearningQuestionnaire
      :selected-learning-needs="selectedLearningNeeds"
      :other-learning-need="otherLearningNeed"
      :learning-profile="learningProfile"
      @update:selected-learning-needs="$emit('update:selectedLearningNeeds', $event)"
      @update:other-learning-need="$emit('update:otherLearningNeed', $event)"
      @update:learning-profile="$emit('update:learningProfile', $event)"
      @complete="$emit('save')"
    />

    <div class="form-actions">
      <button class="btn btn-secondary" type="button" :disabled="loading" @click="$emit('report')">
        Generar informe
      </button>
      <p v-if="successMessage" class="state-message state-message--ok">{{ successMessage }}</p>
      <p v-else-if="errorMessage" class="state-message state-message--error">{{ errorMessage }}</p>
      <p v-else-if="reportMessage" class="state-message state-message--ok">{{ reportMessage }}</p>
    </div>
  </section>
</template>

<script setup>
import LearningQuestionnaire from './LearningQuestionnaire.vue'

defineProps({
  name: { type: String, default: '' },
  birthdate: { type: String, default: '' },
  selectedLearningNeeds: { type: Array, default: () => [] },
  otherLearningNeed: { type: String, default: '' },
  learningProfile: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  successMessage: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  reportMessage: { type: String, default: '' }
})

defineEmits([
  'update:name',
  'update:birthdate',
  'update:selectedLearningNeeds',
  'update:otherLearningNeed',
  'update:learningProfile',
  'save',
  'report'
])
</script>

<style scoped>
.child-form {
  display: grid;
  gap: 1rem;
}

.section-head {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.section-kicker {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #2f7d47;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.55rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
  color: #334155;
}

.form-input {
  width: 100%;
  min-height: 54px;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 16px;
  background: #fff;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.state-message {
  margin: 0;
  font-weight: 800;
}

.state-message--ok {
  color: #047857;
}

.state-message--error {
  color: #dc2626;
}

@media (max-width: 760px) {
  .section-head,
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
  }
}
</style>
