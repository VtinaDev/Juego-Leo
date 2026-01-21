<template>
  <section class="grid gap-6">
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
      <label class="block">
        <span>Email</span>
        <input
          v-model="child.email"
          type="email"
          inputmode="email"
          class="w-full px-4 py-3 border rounded-2xl"
          placeholder="familia@correo.com"
        />
      </label>
      <div class="flex items-center gap-3">
        <button class="btn btn-primary" type="button" @click="save">Guardar</button>
        <p v-if="successMessage" class="text-emerald-700 font-semibold">{{ successMessage }}</p>
        <p v-else-if="errorMessage" class="text-red-600 font-semibold">{{ errorMessage }}</p>
      </div>
      <button
        v-if="child.email"
        class="btn btn-ghost w-full justify-center"
        type="button"
        @click="sendMailto"
      >
        Enviar resumen por email
      </button>
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
        <div v-if="progressSnapshot" class="mt-3 text-sm text-slate-600 space-y-1">
          <p class="font-semibold text-slate-800">Registro guardado:</p>
          <p>Estrellas: {{ progressSnapshot.stars }} · Puntos: {{ progressSnapshot.points }}</p>
          <p>Etapa: {{ progressSnapshot.stageLabel }}</p>
          <p>Última actualización: {{ formatDate(progressSnapshot.updatedAt) }}</p>
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
import { useGameStore } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'

const game = useGameStore()
game.load()

const profile = useProfileStore()
profile.loadProfile()

const child = reactive({
  name: '',
  birthdate: '',
  email: ''
})

const successMessage = ref('')
const errorMessage = ref('')

const timeline = computed(() => game.levelTimeline)
const currentLevel = computed(() => timeline.value.find((item) => item.progress.percent < 1))

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' }).format(new Date(date))
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
watch(
  () => profile.childEmail,
  (value) => {
    child.email = value || child.email
  },
  { immediate: true }
)

onMounted(() => {
  if (!child.name) child.name = profile.childName || game.child?.name || ''
  if (!child.birthdate) child.birthdate = profile.childBirthdate || game.child?.birthdate || ''
  if (!child.email) child.email = profile.childEmail || ''
})

function save() {
  errorMessage.value = ''
  successMessage.value = ''
  const name = child.name?.trim?.() || ''
  const birthdate = child.birthdate || ''
  const email = child.email?.trim?.() || ''
  if (name.length < 2) {
    errorMessage.value = 'El nombre debe tener al menos 2 caracteres.'
    return
  }
  if (birthdate && new Date(birthdate) > new Date()) {
    errorMessage.value = 'La fecha no puede ser futura.'
    return
  }
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errorMessage.value = 'Ingresa un email válido.'
    return
  }

  const progressSnapshot = buildSnapshot()

  profile.saveProfile({ name, birthdate, email, progressSnapshot })
  game.setChild({ name, birthdate })
  successMessage.value = 'Guardado'
}

const progressSnapshot = computed(() => profile.progressSnapshot)

function buildSnapshot() {
  const snapshotLevel = currentLevel.value
  return {
    stars: game.stars || 0,
    points: game.points || 0,
    stageLabel: snapshotLevel
      ? `${snapshotLevel.levelName} · etapa ${snapshotLevel.progress.nextStage}/${snapshotLevel.progress.totalStages}`
      : 'Sin aventuras todavía',
    updatedAt: new Date().toISOString()
  }
}

function sendMailto() {
  if (!child.email) return
  const snapshot = buildSnapshot()
  const body = encodeURIComponent(
    `Hola,\n\nAquí está tu progreso en Juego-Leo:\n- Estrellas: ${snapshot.stars}\n- Puntos: ${snapshot.points}\n- ${snapshot.stageLabel}\n\n¡Sigue jugando!`
  )
  window.location.href = `mailto:${child.email}?subject=Progreso%20en%20Juego-Leo&body=${body}`
}
</script>

<style scoped>
.timeline {
  display: grid;
  gap: 1rem;
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
