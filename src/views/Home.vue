<template>
  <div class="home-bg relative overflow-hidden">
  <section class="hero-stage">
    <div class="hero-art" role="img" aria-label="Escenario mágico de Juego y Leo">
    <div v-if="showConfetti" class="home-confetti" aria-hidden="true">
      <span
        v-for="piece in confettiPieces"
        :key="piece.id"
        class="confetti-dot"
        :style="confettiStyle(piece)"
      />
    </div>
    <div class="hero-grid">
      <div class="hero-content space-y-4 relative z-10">
        <p class="hero-eyebrow">NUNCA DEJES DE APRENDER</p>
        <h1 class="text-5xl font-extrabold leading-tight">Aprende a leer<br>jugando</h1>
        <p class="text-2xl text-slate-600 font-semibold">¡Hola! ¿Listo para la aventura? ¡Vamos al mapa!</p>
        <h2 class="text-xl text-slate-600 leading-relaxed">
          para niños a partir de 4 años en adelante. Especialmente pensada para dislexia, TDAH y fatiga cognitiva.
        </h2>
        <div class="hero-tags-shell">
          <p class="hero-tags-label">Áreas:</p>
          <div class="hero-tags" aria-label="Áreas clave">
            <span class="hero-tag hero-tag--blue">Lectura</span>
            <span class="hero-tag hero-tag--violet">Dislexia</span>
            <span class="hero-tag hero-tag--pink">TDAH</span>
          </div>
        </div>
      </div>
      <div class="hero-device-wrap">
        <div class="hero-device">
          <img
            src="/home.characters.PNG"
            alt="Personajes de Juego & Leo"
            class="hero-device-image"
            loading="eager"
          />
          <div class="hero-device-actions">
            <RouterLink
              to="/subscribe"
              class="btn btn-sound hero-btn hero-btn--soft whitespace-nowrap"
            >Prueba</RouterLink>
            <RouterLink
              to="/mapview"
              class="btn btn-sound hero-btn hero-btn--accent whitespace-nowrap"
              :class="{ 'btn-cta-pulse': pulseCta }"
              @click="handlePlayClick"
            >¡Juega!</RouterLink>
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
  <BenefitsBlock />
  <MethodologySection />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { playSfx } from '../utils/sfx'
import { playMusic, stopMusic, unlockAudio, playVoiceCue } from '../engine/audio/audioManager'
import { useAudioSettings } from '../composables/useAudioSettings'
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
    playVoiceCue('home-welcome')
  }
}

onBeforeUnmount(() => {
  // Dejamos que la música continúe al navegar a otras vistas
})
</script>

<style scoped>
.home-bg {
  position: relative;
  min-height: 100vh;
  padding: 0;
  background: var(--color-sky);
}
.hero-stage {
  position: relative;
  width: 100%;
  margin: 0;
}
.hero-art {
  position: relative;
  overflow: hidden;
  border-radius: 0;
  min-height: min(86vh, 760px);
  background: linear-gradient(180deg, var(--color-sky) 0%, var(--color-sky) 58%, #9bd76d 58%, #9bd76d 100%);
  box-shadow: none;
}
.hero-art::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120px 44px at 13% 13%, rgba(255, 255, 255, 0.78) 0 38%, transparent 42%),
    radial-gradient(96px 36px at 20% 15%, rgba(255, 255, 255, 0.72) 0 38%, transparent 42%),
    radial-gradient(110px 40px at 72% 12%, rgba(255, 255, 255, 0.78) 0 38%, transparent 42%),
    radial-gradient(90px 34px at 79% 14%, rgba(255, 255, 255, 0.72) 0 38%, transparent 42%),
    radial-gradient(102px 38px at 52% 20%, rgba(255, 255, 255, 0.66) 0 38%, transparent 42%);
}
.hero-art::after {
  content: '';
  position: absolute;
  left: -4%;
  right: -4%;
  bottom: -56px;
  height: 130px;
  border-radius: 50%;
  background: var(--color-sky);
}
.hero-grid {
  position: relative;
  z-index: 1;
  min-height: min(86vh, 760px);
  display: grid;
  grid-template-columns: 1.02fr 0.98fr;
  align-items: center;
  gap: clamp(1rem, 2.8vw, 2.6rem);
  padding: clamp(1rem, 3vw, 2.4rem);
}
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
.hero-content {
  width: min(100%, 680px);
  padding-inline: clamp(0.7rem, 1.4vw, 1rem);
}
.hero-content h1 {
  color: #173b61;
  font-size: clamp(2.1rem, 5vw, 3.9rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
}
.hero-content h2 {
  color: #27556f;
  max-width: 44ch;
  font-size: clamp(1rem, 1.7vw, 1.2rem);
}
.hero-content p {
  color: #09745d;
}
.hero-eyebrow {
  display: inline-block;
  margin: 0;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #4b6d86;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  padding: 0.38rem 0.75rem;
}
.hero-tags-shell {
  width: fit-content;
  max-width: 100%;
  margin-top: 0.65rem;
  padding: 0.7rem 0.75rem;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.2);
}
.hero-tags-label {
  margin: 0 0 0.45rem;
  font-size: 0.8rem;
  color: #42637a;
  font-weight: 700;
}
.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding-top: 0.4rem;
}
.hero-tag {
  font-size: 0.76rem;
  line-height: 1;
  font-weight: 800;
  color: #fff;
  border-radius: 999px;
  padding: 0.45rem 0.72rem;
  letter-spacing: 0.02em;
}
.hero-tag--blue {
  background: #4b8dff;
}
.hero-tag--violet {
  background: #7a66f5;
}
.hero-tag--pink {
  background: #e475cd;
}
.hero-device-wrap {
  display: flex;
  justify-content: center;
}
.hero-device {
  width: min(92vw, 560px);
  border-radius: 30px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.06));
  box-shadow:
    0 24px 36px rgba(15, 23, 42, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
  overflow: hidden;
  backdrop-filter: blur(1px);
  position: relative;
  aspect-ratio: 4 / 3;
}
.hero-device-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.hero-device-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.42));
}
.hero-btn {
  width: 100%;
  min-width: 0;
  justify-content: center;
  font-weight: 800;
  font-size: 1.02rem;
  line-height: 1.1;
  padding: 0.5rem 0.7rem;
  min-height: 0;
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.16);
}
.hero-btn--soft {
  background: linear-gradient(180deg, #ffde5c 0%, #f4c946 100%);
  color: #ffffff !important;
}
.hero-btn--accent {
  background: linear-gradient(180deg, #67b2ff 0%, #2f80ff 100%);
  color: #ffffff !important;
}
@media (prefers-reduced-motion: reduce) {
  .home-confetti,
  .btn-cta-pulse {
    animation: none;
  }
}
@media (max-width: 768px) {
  .hero-art {
    border-radius: 0;
  }
  .hero-grid {
    min-height: 100dvh;
    grid-template-columns: 1fr;
    align-content: center;
    padding: 1rem 0.9rem 2.1rem;
    gap: 1rem;
  }
  .hero-content {
    order: 2;
    text-align: center;
    margin-inline: auto;
  }
  .hero-tags-shell {
    margin-inline: auto;
  }
  .hero-content h1 {
    font-size: clamp(1.75rem, 8.3vw, 2.55rem);
  }
  .hero-content h2 {
    margin-inline: auto;
  }
  .hero-tags {
    justify-content: center;
  }
  .hero-device {
    width: min(96vw, 500px);
  }
  .hero-device-image {
    height: 100%;
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
</style>
