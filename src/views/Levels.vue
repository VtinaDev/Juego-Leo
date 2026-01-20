<template>
  <section class="p-6 text-center">
    <h1 class="text-3xl font-bold mb-6">Selecciona tu nivel</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="(level, idx) in levels"
        :key="level.id"
        class="card level-card p-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
        :class="{
          'opacity-100': level.unlocked,
          'opacity-50 cursor-not-allowed': !level.unlocked
        }"
        :style="{
          backgroundImage: level.background ? `url(${level.background})` : '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }"
      >
        <div class="level-avatar mx-auto mb-3">
          <img
            v-if="level.image && typeof level.image === 'string'"
            :src="level.image"
            :alt="`Personaje ${level.name}`"
            loading="lazy"
            @error="onImageError(idx)"
          />
        </div>

        <div class="level-tooltip">
          <div class="tooltip-text">
            <p class="tooltip-title">{{ level.name }}</p>
            <p class="tooltip-desc">{{ level.description }}</p>
          </div>
        </div>

        <RouterLink
          v-if="level.unlocked"
          :to="`/game/${level.id}/1`"
          class="btn btn-primary rounded-full justify-center"
          :style="{
            backgroundColor: '#facc15',
            borderColor: '#eab308',
            color: '#0f172a'
          }"
        >
          Jugar
        </RouterLink>

        <button
          v-else
          class="btn bg-gray-300 text-gray-500 rounded-full justify-center"
          type="button"
          disabled
        >
          🔒 Bloqueado
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import Perezoso from '../assets/characters/Perezoso.png'
import Zorro from '../assets/characters/Zorro.png'
import Mono from '../assets/characters/Mono.png'
import Elefante from '../assets/characters/Elefante.png'
import ElefanteGraduado from '../assets/characters/Elefante-graduado.png'
import FondoArbol from '../assets/background/arbol.PNG'
import FondoCueva from '../assets/background/cueva.PNG'
import FondoIsla from '../assets/background/isla.PNG'
import FondoAgua from '../assets/background/agua.PNG'
import FondoEscuela from '../assets/background/escuela.PNG'

// Usa una imagen existente como respaldo para evitar 404 en build
const fallbackImage = Perezoso

const levels = ref([
  {
    id: 1,
    name: 'Oso Perezoso',
    description: 'Lectura guiada y reconocimiento de palabras',
    image: Perezoso,
    background: FondoArbol,
    color: '#10b981',
    unlocked: true
  },
  {
    id: 2,
    name: 'Zorro Astuto',
    description: 'Formación de frases y comprensión lectora',
    image: Zorro,
    background: FondoCueva,
    color: '#f97316',
    unlocked: true
  },
  {
    id: 3,
    name: 'Mono Listo',
    description: 'Ejercicios de vocabulario y sonidos',
    image: Mono,
    background: FondoIsla,
    color: '#8b5cf6',
    unlocked: true
  },
  {
    id: 4,
    name: 'Elefante Sabiondo',
    description: 'Completa oraciones y lecturas más largas',
    image: Elefante,
    background: FondoAgua,
    color: '#3b82f6',
    unlocked: true
  },
  {
    id: 5,
    name: 'Safari Maestro',
    description: 'Redacción creativa, tiempos verbales y comprensión avanzada',
    image: ElefanteGraduado,
    background: FondoEscuela,
    color: '#ef4444',
    unlocked: true
  }
])

function onImageError(index) {
  const level = levels.value[index]
  if (!level) return
  level.image = fallbackImage
}
</script>

<style scoped>
.level-avatar {
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(239, 246, 255, 0.6));
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.65);
  position: relative;
  box-shadow: 0 12px 35px rgba(37, 99, 235, 0.15);
}

.level-avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid rgba(59, 130, 246, 0.15);
  opacity: 0.4;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.25);
  animation: haloPulse 4s ease-in-out infinite;
}

.level-avatar img {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
  animation: avatarFloat 4.5s ease-in-out infinite;
}

.card:hover .level-avatar img {
  transform: translateY(-6px) scale(1.05);
}

.card:hover .level-avatar::after {
  opacity: 1;
}

.level-card {
  position: relative;
  border: none;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  justify-content: center;
  padding-top: 1.25rem;
  padding-bottom: 3.5rem;
}
.level-tooltip {
  position: absolute;
  left: 50%;
  bottom: 0.75rem;
  opacity: 0;
  transform: translate(-50%, 6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}
.level-card:hover .level-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}
.tooltip-text {
  display: inline-block;
  background: rgba(255, 255, 255, 0.7);
  color: #0f172a;
  padding: 0.45rem 0.65rem;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  font-size: 0.85rem;
  min-width: 220px;
  text-align: center;
  border: 1px solid rgba(15, 23, 42, 0.08);
}
.tooltip-title {
  margin: 0;
  font-weight: 800;
  font-size: 0.95rem;
}
.tooltip-desc {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: #0f172acc;
}
.level-card .btn {
  min-height: 44px;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  width: auto;
  min-width: 150px;
  align-self: center;
  background: #facc15;
  border-color: #eab308;
  color: #0f172a !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.65);
  transform: translateY(0);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.level-card .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.level-card .btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

@keyframes avatarFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes haloPulse {
  0%,
  100% {
    opacity: 0.2;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 28px rgba(59, 130, 246, 0.35);
  }
}
</style>
