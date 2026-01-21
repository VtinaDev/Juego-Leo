<template>
  <section class="grid md:grid-cols-2 gap-6 items-center relative overflow-hidden">
    <div v-if="showConfetti" class="home-confetti" aria-hidden="true">
      <span
        v-for="piece in confettiPieces"
        :key="piece.id"
        class="confetti-dot"
        :style="confettiStyle(piece)"
      />
    </div>
    <div class="space-y-4 relative z-10">
      <h1 class="text-5xl font-extrabold leading-tight">Aprende a leer jugando</h1>
      <p class="text-lg text-emerald-700 font-semibold">¡Hola! ¿Listo para la aventura? ¡Vamos al mapa!</p>
      <h2 class="text-xl text-slate-600 leading-relaxed">
        Empieza por el Nivel 1 (gratis) y desbloquea el resto con la suscripción.
      </h2>
      <div class="flex gap-2">
        <RouterLink
          to="/mapview"
          class="btn btn-primary btn-home-primary w-44 justify-center"
          :class="{ 'btn-cta-pulse': pulseCta }"
          @click="handlePlayClick"
        >¡Juega ahora!</RouterLink>
        <RouterLink to="/subscribe" class="btn btn-primary btn-home-primary w-44 justify-center">Suscríbete</RouterLink>
      </div>
    </div>
    <div class="flex justify-center relative z-10">
      <img
        src="/home.characters.PNG"
        alt="Personajes de Juego & Leo"
        class="w-full max-w-md drop-shadow-lg hero-characters"
        loading="lazy"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { playSfx } from '../utils/sfx'

const showConfetti = ref(false)
const pulseCta = ref(false)
const prefersReducedMotion = ref(false)
const confettiPieces = Array.from({ length: 14 }, (_, idx) => ({
  id: idx,
  left: 6 + Math.random() * 88,
  delay: (idx % 5) * 0.12,
  duration: 1.8 + Math.random() * 0.8,
  color: ['#22c55e', '#facc15', '#38bdf8', '#f472b6'][idx % 4],
  size: 8 + Math.random() * 6
}))

onMounted(() => {
  if (typeof window === 'undefined') return
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersReducedMotion.value) {
    showConfetti.value = true
    setTimeout(() => {
      showConfetti.value = false
    }, 2200)
  }
})

function handlePlayClick() {
  playSfx('cta')
  if (prefersReducedMotion.value) return
  pulseCta.value = true
  setTimeout(() => {
    pulseCta.value = false
  }, 420)
}

function confettiStyle(piece) {
  return {
    left: `${piece.left}%`,
    width: `${piece.size}px`,
    height: `${piece.size}px`,
    background: piece.color,
    animationDelay: `${piece.delay}s`,
    animationDuration: `${piece.duration}s`
  }
}
</script>

<style scoped>
.home-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.confetti-dot {
  position: absolute;
  top: -10%;
  border-radius: 9999px;
  opacity: 0.9;
  animation: confettiFall linear forwards;
}
@keyframes confettiFall {
  0% {
    transform: translateY(-10%) rotate(0deg) scale(0.9);
    opacity: 0.9;
  }
  100% {
    transform: translateY(110vh) rotate(160deg) scale(1);
    opacity: 0;
  }
}
.btn-cta-pulse {
  animation: ctaPulse 0.4s ease;
}
@keyframes ctaPulse {
  0% {
    transform: translateY(0) scale(1);
  }
  35% {
    transform: translateY(-2px) scale(1.04);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
.hero-characters {
  animation: heroFloat 3.4s ease-in-out infinite;
}
@keyframes heroFloat {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .home-confetti,
  .hero-characters,
  .btn-cta-pulse {
    animation: none;
  }
}
</style>
