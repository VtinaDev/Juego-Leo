<template>
  <section>
    <h1 class="text-3xl font-extrabold mb-6">Suscripción</h1>
    <p class="text-lg text-slate-600 mb-4">
      Elige un plan para activar la versión demo y cuéntanos a dónde avisarte cuando lancemos los pagos.
    </p>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="card">
        <h3 class="text-xl font-bold">Prueba</h3>
        <p class="text-sm" v-if="billing.trialActive">
          Prueba activa · {{ billing.trialDaysLeft }} días restantes
        </p>
        <p class="text-sm" v-else-if="billing.trialExpired">Prueba finalizada</p>
        <p class="text-sm" v-else>7 días gratuitos</p>
        <button
          class="btn btn-primary mt-3"
          type="button"
          :disabled="trialButtonDisabled"
          @click="openTrial"
        >
          {{ trialButtonLabel }}
        </button>
      </div>
      <div class="card">
        <h3 class="text-xl font-bold">Mensual</h3>
        <p class="text-sm">8,99 €/mes</p>
        <button class="btn btn-primary mt-3" type="button" @click="openDemo('monthly')">
          Suscribirme
        </button>
      </div>
      <div class="card">
        <h3 class="text-xl font-bold">Anual</h3>
        <p class="text-sm">49,99 €/año</p>
        <button class="btn btn-primary mt-3" type="button" @click="openDemo('annual')">
          Suscribirme
        </button>
      </div>
      <div class="card">
        <h3 class="text-xl font-bold">Vitalicia</h3>
        <p class="text-sm">89,99 € pago único</p>
        <button class="btn btn-primary mt-3" type="button" @click="openDemo('lifetime')">
          Comprar
        </button>
      </div>
    </div>

    <p class="mt-6 text-sm text-gray-600">
      Mock local: los pagos reales (Stripe/PayPal) se integrarán más adelante.
    </p>

    <div v-if="billing.demoPlanActive" class="demo-badge" role="status">
      <span class="badge-dot" aria-hidden="true" />
      Demo premium activo · {{ demoLabel }}
    </div>

    <div v-if="showModal" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Versión demo</p>
            <h2 class="modal-title">Los pagos se integrarán más adelante</h2>
            <p class="modal-subtitle">Déjanos tu email y te avisaremos.</p>
          </div>
          <button class="modal-close" type="button" aria-label="Cerrar" @click="closeModal">×</button>
        </header>

        <label class="block space-y-1">
          <span class="text-sm text-slate-700">Email de contacto</span>
          <input
            v-model.trim="email"
            type="email"
            inputmode="email"
            class="w-full px-4 py-3 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            placeholder="peques@familia.com"
            @keyup.enter="saveEmail"
          />
        </label>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="saved" class="text-sm text-emerald-700 font-semibold">¡Gracias! Te avisaremos.</p>

        <div class="modal-actions">
          <button class="btn btn-primary justify-center" type="button" @click="saveEmail">Guardar</button>
          <button class="btn btn-ghost justify-center" type="button" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBillingStore } from '../store/billingStore'

const billing = useBillingStore()
billing.load()

const email = ref('')
const showModal = ref(false)
const saved = ref(false)
const error = ref('')
const selectedPlan = ref(null)

const demoLabel = computed(() => {
  if (!billing.demoPlanActive) return ''
  const names = {
    trial: 'Prueba activa',
    monthly: 'Plan mensual',
    annual: 'Plan anual',
    lifetime: 'Plan vitalicio'
  }
  return names[billing.demoPlanId] || 'Plan demo'
})

const trialButtonDisabled = computed(() => billing.trialActive || billing.trialExpired)
const trialButtonLabel = computed(() => {
  if (billing.trialActive) return 'Prueba en curso'
  if (billing.trialExpired) return 'Prueba finalizada'
  return 'Activar prueba'
})

onMounted(() => {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem('juegoLeo_waitlist_email')
  if (stored) email.value = stored
})

function openTrial() {
  const started = billing.startTrial()
  if (!started) return
  selectedPlan.value = 'trial'
  saved.value = false
  error.value = ''
  showModal.value = true
}

function openDemo(planId) {
  billing.startDemoPlan(planId)
  selectedPlan.value = planId
  saved.value = false
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveEmail() {
  error.value = ''
  saved.value = false
  const value = email.value
  const isValid = /\S+@\S+\.\S+/.test(value)
  if (!isValid) {
    error.value = 'Ingresa un email válido'
    return
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('juegoLeo_waitlist_email', value)
  }
  saved.value = true
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: grid;
  place-items: center;
  padding: 1rem;
  backdrop-filter: blur(2px);
  z-index: 50;
}
.modal-card {
  width: min(520px, 95vw);
  background: #ffffff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(15, 23, 42, 0.06);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.modal-eyebrow {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #22c55e;
  font-weight: 800;
  margin: 0;
}
.modal-title {
  font-size: 1.3rem;
  margin: 0.2rem 0;
  color: #0f172a;
}
.modal-subtitle {
  margin: 0;
  color: #475569;
}
.modal-close {
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.demo-badge {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(120deg, #dcfce7, #bbf7d0);
  color: #14532d;
  font-weight: 700;
}
.badge-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.25);
  animation: badgePulse 1.8s ease-in-out infinite;
}
@keyframes badgePulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}
</style>
