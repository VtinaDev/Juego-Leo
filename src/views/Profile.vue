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
      <div class="flex items-center gap-3">
        <button class="btn btn-primary" type="button" @click="save">Guardar</button>
        <p v-if="successMessage" class="text-emerald-700 font-semibold">{{ successMessage }}</p>
        <p v-else-if="errorMessage" class="text-red-600 font-semibold">{{ errorMessage }}</p>
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
  birthdate: ''
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

onMounted(() => {
  if (!child.name) child.name = profile.childName || game.child?.name || ''
  if (!child.birthdate) child.birthdate = profile.childBirthdate || game.child?.birthdate || ''
})

function save() {
  errorMessage.value = ''
  successMessage.value = ''
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

  profile.saveProfile({ name, birthdate })
  game.setChild({ name, birthdate })
  successMessage.value = 'Guardado'
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
