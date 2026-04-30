<template>
  <section class="grid gap-6">
    <div class="card space-y-3">
      <h2 class="text-2xl font-bold">Cuenta</h2>
      <div class="grid md:grid-cols-2 gap-3">
        <label class="block">
          <span>Email</span>
          <input v-model.trim="authForm.email" type="email" inputmode="email" class="w-full px-4 py-3 border rounded-2xl" />
        </label>
        <label class="block">
          <span>Contraseña</span>
          <input v-model.trim="authForm.password" type="password" class="w-full px-4 py-3 border rounded-2xl" />
        </label>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn btn-primary" type="button" @click="handleRegister" :disabled="auth.isAuthenticated || auth.loading">Crear cuenta</button>
        <button class="btn btn-secondary" type="button" @click="handleLogin" :disabled="auth.isAuthenticated || auth.loading">Iniciar sesión</button>
        <button class="btn btn-ghost" type="button" @click="handleLogout" :disabled="!auth.isAuthenticated || auth.loading">Cerrar sesión</button>
        <span v-if="authStatus" class="text-emerald-700 font-semibold">{{ authStatus }}</span>
        <span v-else-if="authError" class="text-red-600 font-semibold">{{ authError }}</span>
      </div>
      <p v-if="loginRequiredNotice" class="text-red-600 font-semibold">
        {{ loginRequiredNotice }}
      </p>
      <p class="text-sm text-slate-600">
        Inicia sesión para guardar el perfil y generar informes de la evolución de aprendizaje.
      </p>
    </div>

    <div class="card space-y-3">
      <h2 class="text-2xl font-bold">Perfil del niño</h2>
      <label class="block">
        <span>Nombre</span>
        <input v-model="child.name" class="w-full px-4 py-3 border rounded-2xl" />
      </label>
      <label class="block">
        <span>Fecha de nacimiento</span>
        <input v-model="child.birthdate" type="date" class="w-full px-4 py-3 border rounded-2xl" />
      </label>
      <div class="flex items-center gap-3">
        <button class="btn btn-primary" type="button" @click="save" :disabled="profile.loading">Guardar</button>
        <button class="btn btn-secondary" type="button" @click="handleReport" :disabled="!auth.isAuthenticated || profile.loading">
          Generar informe
        </button>
        <p v-if="successMessage" class="text-emerald-700 font-semibold">{{ successMessage }}</p>
        <p v-else-if="errorMessage" class="text-red-600 font-semibold">{{ errorMessage }}</p>
        <p v-else-if="reportMessage" class="text-emerald-700 font-semibold">{{ reportMessage }}</p>
      </div>
      <div v-if="auth.isAuthenticated && reportShown" class="report-summary" aria-live="polite">
        <h3 class="text-lg font-bold mb-2">Resumen para el informe</h3>
        <p class="text-slate-700 mb-1"><strong>Niñ@:</strong> {{ summary.childName || 'Sin nombre' }}</p>
        <p class="text-slate-700 mb-1"><strong>Nacimiento:</strong> {{ summary.birthdate || '—' }}</p>
        <p class="text-slate-700 mb-2">
          <strong>Progreso general:</strong> {{ summary.stars }} estrellas · {{ summary.points }} puntos
        </p>
        <p class="text-slate-700 mb-2">
          <strong>Estado actual:</strong> {{ progressState.label }}
        </p>
        <p class="text-slate-700 mb-2">
          <strong>Avance total:</strong> {{ progressState.completedStages }}/{{ progressState.totalStages }}
          etapas ({{ progressState.percent }}%)
        </p>
        <p class="text-slate-700 mb-3"><strong>Observación:</strong> {{ summary.observation }}</p>
        <div>
          <p class="font-semibold text-slate-800 mb-1">Niveles recientes</p>
          <ul class="report-levels">
            <li v-for="item in recentLevels" :key="item.levelId">
              <span class="level-name">{{ item.levelName }}</span>
              <span class="level-progress">Etapa {{ item.progress.completedStages }}/{{ item.progress.totalStages }}</span>
              <span v-if="item.progress.lastStage" class="level-date">Última sesión: {{ formatDate(item.progress.lastStage.completedAt) }}</span>
            </li>
            <li v-if="!recentLevels.length" class="text-slate-500">Aún no hay sesiones registradas.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card grid md:grid-cols-2 gap-4">
      <div>
        <h3 class="text-xl font-bold mb-2">Resumen</h3>
        <p>Estrellas: <strong>{{ game.stars }}</strong></p>
        <p>Puntos: <strong>{{ game.points }}</strong></p>
      </div>
      <div>
        <h3 class="text-xl font-bold mb-2">Progreso actual</h3>
        <p v-if="currentLevel">
          {{ currentLevel.levelName }} · etapa {{ currentLevel.progress.nextStage }} de
          {{ currentLevel.progress.totalStages }}
        </p>
        <p v-else>¡Aún no has comenzado una aventura!</p>
      </div>
    </div>

    <div class="card">
      <h3 class="text-xl font-bold mb-3">Informe pedagógico</h3>
      <p class="mb-4 text-slate-700">
        Precisión global: <strong>{{ formatPercent(learningTotals.accuracy) }}</strong>
        · Ejercicios resueltos: <strong>{{ learningTotals.exercises }}</strong>
      </p>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-bold text-slate-800 mb-2">Fortalezas</h4>
          <ul class="report-levels">
            <li v-for="item in strongestSubtypes" :key="`strong-${item.subtype}`">
              <span class="level-name">{{ subtypeLabel(item.subtype) }}</span>
              <span class="level-progress">{{ formatPercent(item.accuracy) }} precisión</span>
            </li>
            <li v-if="!strongestSubtypes.length" class="text-slate-500">Aún no hay datos suficientes.</li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-slate-800 mb-2">Áreas a reforzar</h4>
          <ul class="report-levels">
            <li v-for="item in weakestSubtypes" :key="`weak-${item.subtype}`">
              <span class="level-name">{{ subtypeLabel(item.subtype) }}</span>
              <span class="level-progress">
                {{ formatPercent(item.accuracy) }} precisión · {{ item.avgAttempts.toFixed(1) }} intentos/ejercicio
              </span>
            </li>
            <li v-if="!weakestSubtypes.length" class="text-slate-500">Aún no hay datos suficientes.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-xl font-bold mb-4">Mapa personalizado</h3>
      <ul class="timeline">
        <li v-for="item in timeline" :key="item.levelId">
          <div class="timeline-icon" :style="{ background: item.color }">{{ item.icon }}</div>
          <div>
            <p class="timeline-level">{{ item.levelName }}</p>
            <p class="timeline-progress">
              Etapa {{ item.progress.completedStages }}/{{ item.progress.totalStages }}
            </p>
            <p class="timeline-note" v-if="item.progress.lastStage">
              Última sesión: {{ formatDate(item.progress.lastStage.completedAt) }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
game.load()

const profile = useProfileStore()
profile.loadProfile()
const auth = useAuthStore()
auth.load()

const child = reactive({
  name: '',
  birthdate: ''
})

const successMessage = ref('')
const errorMessage = ref('')
const authStatus = ref('')
const authError = ref('')
const authForm = reactive({
  email: '',
  password: ''
})
const reportMessage = ref('')
const reportShown = ref(false)
const loginRequiredNotice = computed(() =>
  route.query.loginRequired === '1' && !auth.isAuthenticated
    ? 'Debes iniciar sesión primero para jugar.'
    : ''
)

const recentLevels = computed(() => {
  return [...(timeline.value || [])]
    .sort((a, b) => {
      const aTime = new Date(a?.progress?.lastStage?.completedAt ?? 0).getTime()
      const bTime = new Date(b?.progress?.lastStage?.completedAt ?? 0).getTime()
      return bTime - aTime
    })
    .filter((item) => item?.progress?.completedStages > 0 || item?.progress?.lastStage)
    .slice(0, 3)
})

const progressState = computed(() => {
  const levels = timeline.value || []
  const totalStages = levels.reduce((sum, item) => sum + Number(item?.progress?.totalStages || 0), 0)
  const completedStages = levels.reduce((sum, item) => sum + Number(item?.progress?.completedStages || 0), 0)
  const current = currentLevel.value || levels[levels.length - 1]
  const percent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

  let label = 'Sin iniciar'
  if (totalStages > 0 && completedStages >= totalStages) {
    label = 'Juego completado'
  } else if (completedStages > 0) {
    label = `En progreso: ${current?.levelName || 'Nivel'} · etapa ${current?.progress?.nextStage || 1} de ${current?.progress?.totalStages || 1}`
  }

  return {
    label,
    completedStages,
    totalStages,
    percent
  }
})

const summary = computed(() => {
  const observation = buildObservation(recentLevels.value)
  return {
    childName: child.name || profile.childName || '',
    birthdate: child.birthdate || profile.childBirthdate || '',
    stars: game.stars ?? 0,
    points: game.points ?? 0,
    observation
  }
})

const timeline = computed(() => game.levelTimeline)
const currentLevel = computed(() => timeline.value.find((item) => item.progress.percent < 1))
const learningInsights = computed(() => game.learningInsights || { totals: {}, weakest: [], strongest: [] })
const learningTotals = computed(() => learningInsights.value.totals || { accuracy: 0, exercises: 0 })
const weakestSubtypes = computed(() => learningInsights.value.weakest || [])
const strongestSubtypes = computed(() => learningInsights.value.strongest || [])

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' }).format(new Date(date))
}

function formatPercent(value) {
  const num = Number(value || 0)
  return `${Math.round(num * 100)}%`
}

function subtypeLabel(subtype) {
  return String(subtype || 'general')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildObservation(levels = []) {
  const stars = game.stars ?? 0
  const points = game.points ?? 0
  const latest = levels[0]
  const levelId = latest?.levelId || 1
  const levelName = latest?.levelName || 'nivel inicial'
  const stage = latest?.progress?.nextStage || 1
  const completeness = latest?.progress?.completedStages || 0
  const total = latest?.progress?.totalStages || 1

  const pace = points > 1200 ? 'avance sostenido' : points > 500 ? 'buen ritmo' : 'ritmo inicial'
  const focus =
    completeness / Math.max(1, total) >= 0.8
      ? 'mantuvo constancia en la última etapa'
      : 'requiere apoyo para cerrar la etapa actual'

  const levelNotes = {
    1: 'Refuerza conciencia fonológica y reconocimiento de letras base.',
    2: 'Trabaja sílabas directas y velocidad lectora con control.',
    3: 'Integra sílabas trabadas y comprensión de frases cortas.',
    4: 'Practica lectura fluida y vocabulario ampliado.',
    5: 'Consolida comprensión y entonación en textos más largos.'
  }

  const note = levelNotes[levelId] || 'Continúa desarrollando comprensión y confianza lectora.'

  return `Ha reunido ${stars} estrellas y ${points} puntos; ${pace}. Actualmente en ${levelName}, etapa ${stage}; ${focus}. En este nivel: ${note}`
}

watch(
  () => game.child,
  (value) => {
    if (!value) return
    if (!child.name) child.name = value.name || ''
    if (!child.birthdate) child.birthdate = value.birthdate || ''
  },
  { deep: true, immediate: true }
)

watch(
  () => [profile.childName, profile.childBirthdate],
  ([name, birthdate]) => {
    child.name = name || child.name
    child.birthdate = birthdate || child.birthdate
  },
  { immediate: true }
)

onMounted(async () => {
  if (!child.name) child.name = profile.childName || game.child?.name || ''
  if (!child.birthdate) child.birthdate = profile.childBirthdate || game.child?.birthdate || ''
  if (!authForm.email) authForm.email = auth.userEmail || ''
  if (loginRequiredNotice.value) authError.value = loginRequiredNotice.value
  
  if (auth.isAuthenticated) {
    await profile.loadProfile()
    await game.loadProgressFromSupabase()
  }
})

function redirectToPendingPlay() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (!redirect) return
  router.push(redirect)
}

async function save() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!auth.isAuthenticated) {
    errorMessage.value = 'Inicia sesión o regístrate para guardar el perfil.'
    return
  }
  const name = child.name?.trim?.() || ''
  const birthdate = child.birthdate || ''
  if (name.length < 2) {
    errorMessage.value = 'El nombre debe tener al menos 2 caracteres.'
    return
  }
  if (birthdate && new Date(birthdate) > new Date()) {
    errorMessage.value = 'La fecha no puede ser futura.'
    return
  }

  const ok = await profile.saveProfile({ name, birthdate })
  if (!ok) {
    errorMessage.value = profile.error || 'No se pudo guardar el perfil.'
    return
  }
  game.setChild({ name, birthdate })
  successMessage.value = 'Guardado'
}

async function handleRegister() {
  authStatus.value = ''
  authError.value = ''

  const ok = await auth.register(authForm.email, authForm.password)
  if (ok) {
    authStatus.value = auth.isAuthenticated
      ? `Cuenta creada: ${auth.userEmail}`
      : 'Cuenta creada. Revisa tu correo para confirmar el acceso.'
    authForm.password = ''
    if (auth.isAuthenticated) {
      await profile.loadProfile()
      await game.loadProgressFromSupabase()
      redirectToPendingPlay()
    }
  } else {
    authError.value = auth.error
  }
}


async function handleLogin() {
  authStatus.value = ''
  authError.value = ''
  const ok = await auth.login(authForm.email, authForm.password)
  if (ok) {
    authStatus.value = `Sesión iniciada: ${auth.userEmail}`
    authForm.password = ''
    await profile.loadProfile()
    await game.loadProgressFromSupabase()
    redirectToPendingPlay()
  } else authError.value = auth.error
}

async function handleLogout() {
  await auth.logout()
  profile.clearProfile()
  game.resetGame()
  authStatus.value = ''
  authError.value = auth.error
  successMessage.value = ''
  reportMessage.value = ''
  reportShown.value = false
}

function handleReport() {
  reportMessage.value = ''
  errorMessage.value = ''
  if (!auth.isAuthenticated) {
    errorMessage.value = 'Inicia sesión para generar un informe.'
    return
  }
  // Simulación de informe: se crea un JSON de progreso.
  const report = {
    generatedAt: new Date().toISOString(),
    child: {
      name: child.name || profile.childName,
      birthdate: child.birthdate || profile.childBirthdate
    },
    progress: timeline.value,
    currentState: progressState.value,
    learningInsights: learningInsights.value,
    stars: game.stars,
    points: game.points,
    observation: summary.value.observation
  }
  try {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'informe-juego-leo.json'
    a.click()
    URL.revokeObjectURL(url)
    reportMessage.value = 'Informe generado (JSON)'
    reportShown.value = true
  } catch (e) {
    errorMessage.value = 'No se pudo generar el informe.'
  }
}
</script>

<style scoped>
.timeline {
  display: grid;
  gap: 1rem;
}
.btn {
  min-height: 48px;
  min-width: 140px;
}

.report-summary {
  margin-top: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.report-levels {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.4rem;
}
.report-levels li {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  background: #ffffff;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
}
.level-name {
  font-weight: 700;
  color: #0f172a;
}
.level-progress,
.level-date {
  color: #475569;
  font-size: 0.93rem;
}
.timeline li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: #f8fafc;
}
.timeline-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  color: #0f172a;
}
.timeline-level {
  font-weight: 600;
}
.timeline-progress {
  font-size: 0.95rem;
  color: #475569;
}
.timeline-note {
  font-size: 0.85rem;
  color: #94a3b8;
}
</style>
