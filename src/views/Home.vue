<template>
  <div class="home-bg relative overflow-hidden" :style="{ '--home-bg': `url(${habitatBg})` }">
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
      <p class="text-2xl text-emerald-700 font-semibold">¡Hola! ¿Listo para la aventura? ¡Vamos al mapa!</p>
      <h2 class="text-xl text-slate-600 leading-relaxed">
        para niños a partir de 4 años en adelante. Especialmente pensada para dislexia, TDAH y fatiga cognitiva.
      </h2>
      <div class="flex gap-2 flex-wrap items-center">
        <RouterLink
          to="/mapview"
          class="btn btn-sound w-44 justify-center whitespace-nowrap"
          :class="{ 'btn-cta-pulse': pulseCta }"
          @click="handlePlayClick"
        >¡Juega ahora!</RouterLink>
        <RouterLink
          to="/subscribe"
          class="btn btn-sound w-44 justify-center whitespace-nowrap"
        >Prueba 7 días gratis</RouterLink>
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
  <BenefitsBlock />
  <MethodologySection />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { playSfx } from '../utils/sfx'
import { playMusic, stopMusic, unlockAudio, playVoice } from '../engine/audio/audioManager'
import { VOICE_PRESET } from '../engine/audio/voiceProfile'
import { useAudioSettings } from '../composables/useAudioSettings'
import habitatBg from '../assets/habitat/Fondo.PNG'
import MethodologySection from '../components/home/MethodologySection.vue'
import BenefitsBlock from '../components/home/BenefitsBlock.vue'

const showConfetti = ref(false)
const pulseCta = ref(false)
const prefersReducedMotion = ref(false)
const confettiCanSound = ref(false)
const confettiPieces = Array.from({ length: 14 }, (_, idx) => ({
  id: idx,
  left: 6 + Math.random() * 88,
  delay: (idx % 5) * 0.12,
  duration: 1.8 + Math.random() * 0.8,
  color: ['#22c55e', '#facc15', '#38bdf8', '#f472b6'][idx % 4],
  size: 8 + Math.random() * 6
}))

const { musicEnabled, voiceEnabled } = useAudioSettings()
const homeNarration =
  'Aprende a leer jugando. Hola, ¿listo para la aventura? Vamos al mapa. Empieza por el Nivel uno gratis y desbloquea el resto con la suscripción.'
const introTrack = 'intro'

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

watch(
  () => showConfetti.value,
  (active) => {
    if (!active) return
    if (prefersReducedMotion.value) return
    unlockAudio()
    playSfx('confetti')
  }
)

function handlePlayClick() {
  playSfx('cta')
  unlockAudio()
  confettiCanSound.value = true
  if (musicEnabled.value) {
    playMusic(introTrack)
  }
  triggerConfettiSound()
  if (prefersReducedMotion.value) return
  pulseCta.value = true
  setTimeout(() => {
    pulseCta.value = false
  }, 420)
}

function triggerConfettiSound() {
  if (prefersReducedMotion.value) return
  unlockAudio()
  showConfetti.value = true
  setTimeout(() => {
    showConfetti.value = false
  }, 3200)
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

function handleHomeNarration() {
  unlockAudio()
  playSfx('click')
  if (voiceEnabled.value) {
    playVoice(homeNarration, { rate: VOICE_PRESET.rate, pitch: VOICE_PRESET.pitch, lang: VOICE_PRESET.lang })
  }
}

onBeforeUnmount(() => {
  // Dejamos que la música continúe al navegar a otras vistas
})
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
.audio-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.audio-icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.18);
}

.audio-icon-btn:focus-visible {
  outline: 2px solid #22c55e;
  outline-offset: 2px;
}
.home-bg {
  position: relative;
  min-height: 80vh;
  background: transparent;
}
.home-bg::before {
  content: none;
}
.home-bg > * {
  position: relative;
  z-index: 1;
}
</style>
