<template>
  <section class="card auth-section" aria-labelledby="auth-title">
    <div class="auth-copy">
      <p class="section-kicker">Acceso familiar</p>
      <h1 id="auth-title">Entrar en Juego & Leo</h1>
      <p>Inicia sesión para guardar el avance, ver informes y continuar la ruta de lectura.</p>
    </div>

    <form class="auth-form" @submit.prevent>
      <label>
        <span>Email</span>
        <input
          :value="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          class="form-input"
          @input="$emit('update:email', $event.target.value)"
        />
      </label>
      <label>
        <span>Contraseña</span>
        <input
          :value="password"
          type="password"
          autocomplete="current-password"
          class="form-input"
          @input="$emit('update:password', $event.target.value)"
        />
      </label>
      <button
        class="forgot-password"
        type="button"
        :disabled="loading"
        @click="$emit('reset-password')"
      >
        ¿Olvidaste la contraseña?
      </button>
      <p v-if="status" class="state-message state-message--ok state-message--reset" role="status">
        {{ status }}
      </p>
      <button
        v-if="showResendConfirmation"
        class="forgot-password"
        type="button"
        :disabled="loading"
        @click="$emit('resend-confirmation')"
      >
        Reenviar correo de confirmación
      </button>

      <LearningQuestionnaire
        show-child-fields
        :child-name="childName"
        :child-birthdate="childBirthdate"
        :selected-learning-needs="selectedLearningNeeds"
        :other-learning-need="otherLearningNeed"
        :learning-profile="learningProfile"
        @update:child-name="$emit('update:childName', $event)"
        @update:child-birthdate="$emit('update:childBirthdate', $event)"
        @update:selected-learning-needs="$emit('update:selectedLearningNeeds', $event)"
        @update:other-learning-need="$emit('update:otherLearningNeed', $event)"
        @update:learning-profile="$emit('update:learningProfile', $event)"
      />

      <div class="auth-actions">
        <button class="btn btn-primary" type="button" :disabled="loading" @click="$emit('login')">
          Iniciar sesión
        </button>
        <button class="btn btn-secondary" type="button" :disabled="loading" @click="$emit('register')">
          Crear cuenta
        </button>
      </div>

      <p v-if="error || loginRequiredNotice" class="state-message state-message--error">
        {{ error || loginRequiredNotice }}
      </p>
    </form>
  </section>
</template>

<script setup>
import LearningQuestionnaire from './LearningQuestionnaire.vue'

defineProps({
  email: { type: String, default: '' },
  password: { type: String, default: '' },
  childName: { type: String, default: '' },
  childBirthdate: { type: String, default: '' },
  selectedLearningNeeds: { type: Array, default: () => [] },
  otherLearningNeed: { type: String, default: '' },
  learningProfile: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  status: { type: String, default: '' },
  error: { type: String, default: '' },
  loginRequiredNotice: { type: String, default: '' },
  showResendConfirmation: { type: Boolean, default: false }
})

defineEmits([
  'update:email',
  'update:password',
  'update:childName',
  'update:childBirthdate',
  'update:selectedLearningNeeds',
  'update:otherLearningNeed',
  'update:learningProfile',
  'login',
  'register',
  'reset-password',
  'resend-confirmation'
])
</script>

<style scoped>
.auth-section {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(280px, 1fr);
  gap: clamp(1rem, 3vw, 2rem);
  align-items: start;
}

.section-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #2f7d47;
}

.auth-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.05;
  color: #17220f;
}

.auth-copy p {
  margin: 0.75rem 0 0;
  color: #475569;
  font-size: 1.1rem;
}

.auth-form {
  display: grid;
  gap: 0.85rem;
}

.auth-form label {
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

.forgot-password {
  justify-self: start;
  min-height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #2f7d47;
  font: inherit;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}

.forgot-password:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.auth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.state-message {
  margin: 0;
  font-weight: 800;
}

.state-message--reset {
  padding: 0.85rem 1rem;
  border: 1px solid rgba(4, 120, 87, 0.22);
  border-radius: 16px;
  background: #ecfdf5;
}

.state-message--ok {
  color: #047857;
}

.state-message--error {
  color: #dc2626;
}

@media (max-width: 760px) {
  .auth-section {
    grid-template-columns: 1fr;
  }

  .auth-actions .btn {
    width: 100%;
  }

}
</style>
