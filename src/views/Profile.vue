<template>
  <section class="profile-page">
    <div v-if="!auth.initialized" class="card profile-loading" role="status">
      Cargando cuenta...
    </div>

    <AuthSection
      v-else-if="!isLoggedIn"
      v-model:email="authForm.email"
      v-model:password="authForm.password"
      v-model:child-name="child.name"
      v-model:child-birthdate="child.birthdate"
      v-model:selected-learning-needs="child.learningNeeds"
      v-model:other-learning-need="child.otherLearningNeed"
      v-model:learning-profile="child.learningProfile"
      :loading="auth.loading"
      :status="authStatus"
      :error="authError"
      :login-required-notice="loginRequiredNotice"
      @login="handleLogin"
      @register="handleRegister"
    />

    <template v-else>
      <header class="profile-hero">
        <div>
          <p class="profile-kicker">Panel familiar</p>
          <h1>Hola de nuevo 👋</h1>
          <p>
            Sigue el ritmo de lectura, revisa fortalezas y acompaña el próximo paso de
            {{ child.name || profile.childName || 'tu peque' }}.
          </p>
        </div>
        <div class="profile-hero__actions">
          <RouterLink class="btn btn-primary" :to="continueLearningRoute">Continuar aprendizaje</RouterLink>
          <button class="btn btn-ghost" type="button" :disabled="auth.loading" @click="handleLogout">
            Cerrar sesión
          </button>
        </div>
      </header>

      <ChildProfileForm
        v-model:name="child.name"
        v-model:birthdate="child.birthdate"
        v-model:selected-learning-needs="child.learningNeeds"
        v-model:other-learning-need="child.otherLearningNeed"
        v-model:learning-profile="child.learningProfile"
        :loading="profile.loading"
        :success-message="successMessage"
        :error-message="errorMessage"
        :report-message="reportMessage"
        @save="save"
        @report="handleReport"
      />

      <SummarySection
        :stars="game.stars"
        :points="game.points"
        :current-level="currentLevel"
        :has-progress="hasProgress"
        :continue-route="continueLearningRoute"
      />

      <LearningReport
        :has-progress="hasProgress"
        :has-insights="hasInsights"
        :learning-totals="learningTotals"
        :strongest-items="strongestReportItems"
        :weakest-items="weakestReportItems"
        :report-shown="reportShown"
        :summary="summary"
        :progress-state="progressState"
        :recent-levels="recentLevels"
      />

      <LearningMap
        :timeline="timeline"
        :current-level-id="currentLevel?.levelId"
        :has-progress="hasProgress"
        :continue-route="continueLearningRoute"
        :format-date="formatDate"
      />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthSection from '../components/profile/AuthSection.vue'
import ChildProfileForm from '../components/profile/ChildProfileForm.vue'
import LearningMap from '../components/profile/LearningMap.vue'
import LearningReport from '../components/profile/LearningReport.vue'
import SummarySection from '../components/profile/SummarySection.vue'
import {
  OTHER_NEED_VALUE,
  createEmptyLearningProfile,
  normalizeLearningProfile
} from '../data/onboardingQuestionnaire'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
game.load()

const profile = useProfileStore()
const auth = useAuthStore()
auth.load()

const child = reactive({
  name: '',
  birthdate: '',
  learningNeeds: [],
  otherLearningNeed: '',
  learningProfile: createEmptyLearningProfile()
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

const OTHER_LEARNING_NEED = OTHER_NEED_VALUE
const PENDING_ONBOARDING_KEY = 'juego-leo-pending-onboarding'
const learningNeedLabels = {
  attention_difficulty: 'TDA / dificultad de atención',
  adhd: 'TDAH',
  dyslexia: 'Dislexia',
  reading_comprehension_difficulty: 'Dificultades de comprensión lectora',
  sounds_letters_difficulty: 'Dificultades con sonidos o letras',
  sensory_sensitivity: 'Sensibilidad a estímulos visuales o auditivos',
  not_sure_yet: 'No lo sé todavía',
  none_identified: 'Ninguna condición identificada',
  other: 'Otra'
}

const isLoggedIn = computed(() => auth.isAuthenticated)
const timeline = computed(() => game.levelTimeline)
const hasProgress = computed(() => Number(game.points || 0) > 0 || Number(game.stars || 0) > 0)
const currentLevel = computed(() => timeline.value.find((item) => item.progress.percent < 1) || timeline.value[0])
const continueLearningRoute = computed(() => {
  const levelId = currentLevel.value?.levelId || 1
  const stageId = currentLevel.value?.progress?.nextStage || 1
  return `/game/${levelId}/${stageId}`
})
const learningInsights = computed(() => game.learningInsights || { totals: {}, weakest: [], strongest: [] })
const learningTotals = computed(() => learningInsights.value.totals || { accuracy: 0, exercises: 0 })
const hasInsights = computed(() => Number(learningTotals.value.exercises || 0) > 0)
const weakestSubtypes = computed(() => learningInsights.value.weakest || [])
const strongestSubtypes = computed(() => learningInsights.value.strongest || [])
const strongestReportItems = computed(() => strongestSubtypes.value.map(toReportItem))
const weakestReportItems = computed(() => weakestSubtypes.value.map(toReportItem))

const loginRequiredNotice = computed(() =>
  route.query.loginRequired === '1' && !auth.isAuthenticated
    ? 'Inicia sesión para guardar el avance y continuar jugando.'
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
  const current = currentLevel.value || levels[0]
  const percent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

  let label = 'Listo para empezar'
  if (totalStages > 0 && completedStages >= totalStages) {
    label = 'Ruta completada'
  } else if (completedStages > 0) {
    label = `${current?.levelName || 'Nivel actual'} · etapa ${current?.progress?.nextStage || 1} de ${current?.progress?.totalStages || 1}`
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
    learningNeeds: child.learningNeeds || profile.childLearningNeeds || [],
    otherLearningNeed: child.otherLearningNeed || profile.childOtherLearningNeed || '',
    learningProfile: normalizeLearningProfile(child.learningProfile || profile.childLearningProfile),
    stars: game.stars ?? 0,
    points: game.points ?? 0,
    observation
  }
})

function formatDate(date) {
  if (!date) return 'Sin sesiones todavía'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' }).format(new Date(date))
}

function toReportItem(item) {
  return {
    subtype: item.subtype,
    label: subtypeLabel(item.subtype),
    tone: learningTone(item.accuracy),
    detail: learningDetail(item)
  }
}

function learningTone(accuracy) {
  const value = Number(accuracy || 0)
  if (value <= 0) return 'Está empezando su aprendizaje ✨'
  if (value >= 0.85) return 'Domina muy bien este tipo de ejercicios 💪'
  if (value >= 0.6) return 'Avanza con buena seguridad'
  return 'Conviene practicarlo con apoyo cercano'
}

function learningDetail(item) {
  const attempts = Number(item.avgAttempts || 0)
  if (attempts > 2) return 'Puede necesitar más tiempo o pistas antes de responder.'
  if (Number(item.accuracy || 0) >= 0.85) return 'Responde con confianza y pocos intentos.'
  return 'Sigue construyendo confianza paso a paso.'
}

function subtypeLabel(subtype) {
  return String(subtype || 'general')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildObservation(levels = []) {
  if (!hasProgress.value) {
    return 'Empieza el primer ejercicio para descubrir las fortalezas del niño ✨'
  }

  const stars = game.stars ?? 0
  const points = game.points ?? 0
  const latest = levels[0]
  const levelId = latest?.levelId || 1
  const levelName = latest?.levelName || 'nivel inicial'
  const stage = latest?.progress?.nextStage || 1
  const completeness = latest?.progress?.completedStages || 0
  const total = latest?.progress?.totalStages || 1

  const pace = points > 1200 ? 'mantiene un avance muy constante' : points > 500 ? 'progresa con buen ritmo' : 'está dando sus primeros pasos'
  const focus =
    completeness / Math.max(1, total) >= 0.8
      ? 'ya muestra constancia en este nivel'
      : 'puede beneficiarse de sesiones breves y repetidas'

  const levelNotes = {
    1: 'Está reforzando conciencia fonológica y reconocimiento de letras.',
    2: 'Está practicando sílabas directas y velocidad lectora.',
    3: 'Está integrando sílabas trabadas y frases cortas.',
    4: 'Está ampliando fluidez lectora y vocabulario.',
    5: 'Está consolidando comprensión en textos más largos.'
  }

  const note = levelNotes[levelId] || 'Continúa desarrollando comprensión y confianza lectora.'

  return `Ha reunido ${stars} estrellas y ${points} puntos; ${pace}. Ahora está en ${levelName}, etapa ${stage}; ${focus}. ${note}`
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
  () => [
    profile.childName,
    profile.childBirthdate,
    profile.childLearningNeeds,
    profile.childOtherLearningNeed,
    profile.childLearningProfile
  ],
  ([name, birthdate, learningNeeds, otherLearningNeed, learningProfile]) => {
    child.name = name || child.name
    child.birthdate = birthdate || child.birthdate
    child.learningNeeds = [...(learningNeeds || [])]
    child.otherLearningNeed = otherLearningNeed || ''
    child.learningProfile = normalizeLearningProfile(learningProfile)
  },
  { immediate: true }
)

onMounted(async () => {
  if (!child.name) child.name = profile.childName || game.child?.name || ''
  if (!child.birthdate) child.birthdate = profile.childBirthdate || game.child?.birthdate || ''
  if (!child.learningNeeds.length) child.learningNeeds = [...(profile.childLearningNeeds || [])]
  if (!child.otherLearningNeed) child.otherLearningNeed = profile.childOtherLearningNeed || ''
  child.learningProfile = normalizeLearningProfile(child.learningProfile || profile.childLearningProfile)
  if (!authForm.email) authForm.email = auth.userEmail || ''
  if (loginRequiredNotice.value) authError.value = loginRequiredNotice.value

  await hydrateAuthenticatedProfile()
})

watch(isLoggedIn, async (loggedIn) => {
  if (!loggedIn) return
  await hydrateAuthenticatedProfile()
})

async function hydrateAuthenticatedProfile() {
  if (!auth.initialized) await auth.load()
  if (!auth.isAuthenticated) return
  await profile.loadProfile()
  await game.loadProgressFromSupabase()
}

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
  const learningNeeds = normalizeLearningNeeds(child.learningNeeds)
  const otherLearningNeed = child.otherLearningNeed?.trim?.() || ''
  if (learningNeeds.includes(OTHER_LEARNING_NEED) && otherLearningNeed.length < 2) {
    errorMessage.value = 'Especifica la otra necesidad de apoyo o desmarca "Otra".'
    return
  }

  const learningProfile = normalizeLearningProfile(child.learningProfile)
  const ok = await profile.saveProfile({
    name,
    birthdate,
    learningNeeds,
    otherLearningNeed,
    learningProfile
  })
  if (!ok) {
    errorMessage.value = profile.error || 'No se pudo guardar el perfil.'
    return
  }
  child.learningNeeds = [...learningNeeds]
  child.learningProfile = learningProfile
  if (!learningNeeds.includes(OTHER_LEARNING_NEED)) child.otherLearningNeed = ''
  game.setChild({ name, birthdate })
  successMessage.value = 'Perfil guardado 🎉'
}

async function handleRegister() {
  authStatus.value = ''
  authError.value = ''

  const profileValidation = validateOnboardingProfile()
  if (profileValidation) {
    authError.value = profileValidation
    return
  }

  const ok = await auth.register(authForm.email, authForm.password)
  if (ok) {
    const shouldSaveChild = auth.isAuthenticated
    if (shouldSaveChild) {
      const saved = await saveOnboardingProfile()
      if (!saved) {
        authError.value = errorMessage.value || profile.error || 'Cuenta creada, pero no se pudo guardar el cuestionario.'
        return
      }
    } else {
      savePendingOnboardingProfile()
    }
    authStatus.value = auth.isAuthenticated
      ? 'Cuenta creada y cuestionario guardado. ¡Ya podéis empezar! 🎉'
      : 'Cuenta creada. Revisa tu correo para confirmar el acceso.'
    authForm.password = ''
    if (auth.isAuthenticated) {
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
    authStatus.value = 'Hola de nuevo 👋'
    authForm.password = ''
    await profile.loadProfile()
    await restorePendingOnboardingProfile()
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
  const report = {
    generatedAt: new Date().toISOString(),
    child: {
      name: child.name || profile.childName,
      birthdate: child.birthdate || profile.childBirthdate,
      learningNeeds: (child.learningNeeds || []).map((need) => learningNeedLabels[need] || need),
      otherLearningNeed: child.otherLearningNeed || profile.childOtherLearningNeed || '',
      learningProfile: normalizeLearningProfile(child.learningProfile || profile.childLearningProfile)
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
    reportMessage.value = 'Informe generado'
    reportShown.value = true
  } catch (e) {
    errorMessage.value = 'No se pudo generar el informe.'
  }
}

function normalizeLearningNeeds(value) {
  if (!Array.isArray(value)) return []

  const selected = [...new Set(value.filter(Boolean).map(String))]
  if (selected.includes('none_identified')) return ['none_identified']
  return selected
}

function validateOnboardingProfile() {
  const name = child.name?.trim?.() || ''
  if (name.length < 2) return 'Antes de crear la cuenta, escribe el nombre del niño/a.'
  if (child.birthdate && new Date(child.birthdate) > new Date()) {
    return 'La fecha de nacimiento no puede ser futura.'
  }

  const learningNeeds = normalizeLearningNeeds(child.learningNeeds)
  const otherLearningNeed = child.otherLearningNeed?.trim?.() || ''
  if (learningNeeds.includes(OTHER_LEARNING_NEED) && otherLearningNeed.length < 2) {
    return 'Especifica la otra necesidad de apoyo o desmarca "Otra".'
  }

  const learningProfile = normalizeLearningProfile(child.learningProfile)
  if (!learningProfile.educationLevel) return 'Selecciona el nivel educativo.'
  if (!learningProfile.readingLevel) return 'Selecciona el nivel lector actual.'
  if (!learningProfile.attentionSpan) return 'Selecciona el tiempo de atención aproximado.'
  if (!learningProfile.learningPace) return 'Selecciona el ritmo de aprendizaje.'

  return ''
}

async function saveOnboardingProfile() {
  errorMessage.value = ''
  successMessage.value = ''
  const name = child.name?.trim?.() || ''
  const birthdate = child.birthdate || ''
  const learningNeeds = normalizeLearningNeeds(child.learningNeeds)
  const otherLearningNeed = child.otherLearningNeed?.trim?.() || ''
  const learningProfile = normalizeLearningProfile(child.learningProfile)

  const ok = await profile.saveProfile({
    name,
    birthdate,
    learningNeeds,
    otherLearningNeed,
    learningProfile
  })
  if (!ok) {
    errorMessage.value = profile.error || 'No se pudo guardar el cuestionario.'
    return false
  }

  child.learningNeeds = [...learningNeeds]
  child.learningProfile = learningProfile
  if (!learningNeeds.includes(OTHER_LEARNING_NEED)) child.otherLearningNeed = ''
  game.setChild({ name, birthdate })
  clearPendingOnboardingProfile()
  return true
}

function getOnboardingPayload() {
  return {
    email: authForm.email.trim().toLowerCase(),
    name: child.name?.trim?.() || '',
    birthdate: child.birthdate || '',
    learningNeeds: normalizeLearningNeeds(child.learningNeeds),
    otherLearningNeed: child.otherLearningNeed?.trim?.() || '',
    learningProfile: normalizeLearningProfile(child.learningProfile)
  }
}

function savePendingOnboardingProfile() {
  try {
    localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(getOnboardingPayload()))
  } catch (error) {
    // Non-critical: the user can still complete the profile after confirming email.
  }
}

async function restorePendingOnboardingProfile() {
  let pending = null
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_ONBOARDING_KEY) || 'null')
  } catch (error) {
    clearPendingOnboardingProfile()
    return false
  }

  if (!pending || pending.email !== auth.userEmail?.toLowerCase?.()) return false
  if (profile.childId) {
    clearPendingOnboardingProfile()
    return false
  }

  child.name = pending.name || child.name
  child.birthdate = pending.birthdate || child.birthdate
  child.learningNeeds = normalizeLearningNeeds(pending.learningNeeds)
  child.otherLearningNeed = pending.otherLearningNeed || ''
  child.learningProfile = normalizeLearningProfile(pending.learningProfile)

  return saveOnboardingProfile()
}

function clearPendingOnboardingProfile() {
  try {
    localStorage.removeItem(PENDING_ONBOARDING_KEY)
  } catch (error) {
    // Ignore storage cleanup failures.
  }
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 1.25rem;
}

.profile-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: clamp(1.2rem, 3vw, 1.75rem);
  border-radius: 22px;
  background: linear-gradient(135deg, #fff7d7, #e8f7df 55%, #f8fafc);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.profile-kicker {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #2f7d47;
}

.profile-hero h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.05;
  color: #13210f;
}

.profile-hero p {
  margin: 0.55rem 0 0;
  max-width: 62ch;
  color: #475569;
  font-size: 1.05rem;
}

.profile-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}

.profile-loading {
  min-height: 180px;
  display: grid;
  place-items: center;
  color: #475569;
  font-weight: 800;
}

@media (max-width: 760px) {
  .profile-hero {
    grid-template-columns: 1fr;
  }

  .profile-hero__actions {
    justify-content: stretch;
  }

  .profile-hero__actions .btn {
    width: 100%;
  }
}
</style>
