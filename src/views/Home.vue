<template>
  <div class="home">
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
          <div class="hero-content relative z-10">
            <p class="hero-eyebrow">APRENDE A LEER JUGANDO</p>

            <h1 class="hero-title">
              ¡Hola!<br />
              ¿Listo para la aventura?<br /> ¡Vamos al mapa!
            </h1>

            <p class="hero-description">
              Para niños a partir de 4 años en adelante. Especialmente pensada para
              dislexia, TDAH y fatiga cognitiva.
            </p>

            <div class="hero-tags-shell">
              <p class="hero-tags-label">Áreas:</p>
              <div class="hero-tags" aria-label="Áreas clave">
                <span class="hero-tag hero-tag--blue">Lectura</span>
                <span class="hero-tag hero-tag--violet">Dislexia</span>
                <span class="hero-tag hero-tag--pink">TDAH</span>
              </div>
            </div>

            <div class="hero-device-actions">
              <RouterLink
                to="/subscribe"
                class="btn btn-sound hero-btn hero-btn--soft whitespace-nowrap"
              >
                Prueba
              </RouterLink>

              <RouterLink
                to="/mapview"
                class="btn btn-sound hero-btn hero-btn--accent whitespace-nowrap"
                :class="{ 'btn-cta-pulse': pulseCta }"
                @click="handlePlayClick"
              >
                ¡Juega!
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="home-learn-sections">
      <BenefitsBlock />
      <MethodologySection />
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { playSfx } from '../utils/sfx'
import { playMusic, unlockAudio, playVoiceCue } from '../engine/audio/audioManager'
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
    if (!active || prefersReducedMotion.value) return
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
.home {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.hero-stage {
  position: relative;
  width: 100%;
  min-height: 100vh;
  margin: 0;
}

.hero-art {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background-image: url('/background_home.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

.hero-grid {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: grid;
  align-items: center;
  padding:
    clamp(5.5rem, 10vw, 7.5rem)
    clamp(1rem, 4vw, 3rem)
    clamp(2rem, 4vw, 3rem);
}

.hero-content {
  width: min(100%, 500px);
  padding: clamp(0.85rem, 1.7vw, 1.2rem);
  border-radius: 24px;
  background: rgba(236, 241, 245, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.45);
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
}

.hero-eyebrow {
  display: inline-block;
  margin: 0 0 0.8rem;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #48657c;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  padding: 0.4rem 0.78rem;
}

.hero-title {
  margin: 0;
  color: #173b61;
  font-size: clamp(1.2rem, 5vw, 3.1rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.hero-description {
  margin: 1rem 0 0;
  color: #27556f;
  max-width: 38ch;
  font-size: clamp(0.9rem, 1.45vw, 1.02rem);
  line-height: 1.5;
}

.hero-tags-shell {
  width: fit-content;
  max-width: 100%;
  margin-top: 1rem;
  padding: 0.75rem 0.8rem;
  border-radius: 16px;
  border: 1px dashed rgba(100, 116, 139, 0.45);
  background: rgba(226, 232, 240, 0.75);
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

.hero-device-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.7rem, 1.5vw, 1rem);
  width: min(100%, 430px);
  margin-top: 1rem;
}

.hero-btn {
  width: 100%;
  min-width: 0;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  line-height: 1.1;
  padding: 0.7rem 0.8rem;
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

.home-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
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

.home-learn-sections {
  position: relative;
  z-index: 2;
  margin-top: 0;
  background: #ffffff;
  padding-top: 0;
}

.home-learn-sections :deep(.methodology-section) {
  margin-top: 0;
}

@media (prefers-reduced-motion: reduce) {
  .confetti-dot,
  .btn-cta-pulse {
    animation: none;
  }
}

@media (max-width: 768px) {
  .hero-stage,
  .hero-art,
  .hero-grid {
    min-height: 100dvh;
  }

  .hero-art {
    background-image: url('/home-background-mobile.png');
    background-size: cover;
    background-position: center top;
    background-color: #d6ebff;
  }

  .hero-grid {
    padding:
      5.8rem
      1rem
      2rem;
  }

  .hero-content {
    margin-inline: auto;
    text-align: center;
  }

  .hero-description {
    margin-inline: auto;
  }

  .hero-tags-shell {
    margin-inline: auto;
  }

  .hero-tags {
    justify-content: center;
  }

  .hero-title {
    font-size: clamp(1.9rem, 8vw, 2.9rem);
  }

  .hero-device-actions {
    width: min(100%, 420px);
  }

  .home-learn-sections {
    padding-top: 0;
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
