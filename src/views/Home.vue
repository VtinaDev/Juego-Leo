<template>
  <div class="home">
    <section class="hero-stage">
      <div class="hero-art" :style="heroBackgroundStyle" role="img" aria-label="Escenario mágico de Juego y Leo">
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
              lectura inicial y necesidades de apoyo.
            </p>

            <div class="hero-tags-shell">
              <p class="hero-tags-label">Áreas:</p>
              <div class="hero-tags" aria-label="Áreas clave">
                <span class="hero-tag hero-tag--blue">Lectura</span>
                <span class="hero-tag hero-tag--violet">Dislexia</span>
                <span class="hero-tag hero-tag--green">TDA</span>
                <span class="hero-tag hero-tag--pink">TDAH</span>
                <span class="hero-tag hero-tag--amber">DI</span>
              </div>
            </div>

          </div>

          <div class="hero-visual">
            <section
              class="hero-character-panel"
              aria-label="Personajes de aventura"
            >
              <RouterLink
                class="hero-character-feature"
                to="/mapview"
                aria-label="Ver todos los personajes en el mapa"
                @click="handlePlayClick"
              >
                <span
                  class="hero-character-main-card hero-character-feature-bg"
                  :style="{ '--hero-feature-bg-image': `url('${activeHeroCharacter.habitat}')` }"
                  aria-hidden="true"
                />

                <span class="hero-character-fan" aria-hidden="true">
                  <span
                    v-for="(item, index) in heroCharacters"
                    :key="`fan-${item.id}`"
                    class="hero-character-fan-card"
                    :class="[
                      `hero-character-fan-card--${item.id}`,
                      { 'is-active': index === activeHeroCharacterIndex }
                    ]"
                    :style="heroFanCardStyle(index)"
                  >
                    <span
                      class="hero-character-fan-bg"
                      :style="{ backgroundImage: `url('${item.habitat}')` }"
                    />
                    <img :src="item.character" :alt="item.name" />
                  </span>
                </span>

                <span class="hero-character-glow" aria-hidden="true" />

                <img
                  :key="activeHeroCharacter.id"
                  class="hero-character-img"
                  :src="activeHeroCharacter.character"
                  :alt="activeHeroCharacter.name"
                />

                <span class="hero-character-meta">
                  <span>{{ activeHeroCharacter.name }}</span>
                  <small>{{ activeHeroCharacter.world }}</small>
                </span>

                <span class="hero-character-cue">
                  Ver todos
                </span>
              </RouterLink>
            </section>

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
      <AboutGameSection />
      <MethodologySection />
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { playSfx } from '../utils/sfx'
import { playMusic, unlockAudio, playVoiceCue } from '../engine/audio/audioManager'
import { useAudioSettings } from '../composables/useAudioSettings'
import MethodologySection from '../components/home/MethodologySection.vue'
import BenefitsBlock from '../components/home/BenefitsBlock.vue'
import AboutGameSection from '../components/home/AboutGameSection.vue'

const showConfetti = ref(false)
const pulseCta = ref(false)
const prefersReducedMotion = ref(false)
const confettiCanSound = ref(false)
const activeHeroCharacterIndex = ref(0)
let heroWorldTimer = null

const heroCharacters = [
  {
    id: 'monkey',
    name: 'Mono',
    world: 'Selva de lianas',
    character: '/images/characters/monkey.png',
    habitat: '/images/habitats/monkey-jungle-current.png'
  },
  {
    id: 'sloth',
    name: 'Oso perezoso',
    world: 'Árbol lector',
    character: '/images/characters/sloth.png',
    habitat: '/images/habitats/sloth-tree.png'
  },
  {
    id: 'fox',
    name: 'Zorro',
    world: 'Madriguera mágica',
    character: '/images/characters/fox.png',
    habitat: '/images/habitats/fox-burrow.png'
  },
  {
    id: 'bear',
    name: 'Oso',
    world: 'Bosque de miel',
    character: '/images/characters/bear.png',
    habitat: '/images/habitats/bear-honey-current.png'
  },
  {
    id: 'elephant',
    name: 'Elefante',
    world: 'Escuela alegre',
    character: '/images/characters/elephant.png',
    habitat: '/images/habitats/elephant-school-current.png'
  }
]

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
const activeHeroCharacter = computed(() => heroCharacters[activeHeroCharacterIndex.value] || heroCharacters[0])
const heroBackgroundStyle = computed(() => ({
  backgroundImage: `
    radial-gradient(circle at 18% 16%, rgba(255, 245, 184, 0.86) 0%, rgba(255, 245, 184, 0) 36%),
    radial-gradient(circle at 82% 12%, rgba(255, 252, 218, 0.82) 0%, rgba(255, 252, 218, 0) 34%),
    linear-gradient(180deg, #fff7cf 0%, #fff1b8 46%, #fff9de 100%)
  `
}))

const fanSlots = [0, 1, -1, 2, -2]

onMounted(() => {
  if (typeof window === 'undefined') return

  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion.value) {
    showConfetti.value = true
    setTimeout(() => {
      showConfetti.value = false
    }, 2200)

    heroWorldTimer = window.setInterval(() => {
      activeHeroCharacterIndex.value = (activeHeroCharacterIndex.value + 1) % heroCharacters.length
    }, 3600)
  }

  if (musicEnabled.value) {
    playMusic(introTrack)
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

function heroFanCardStyle(index) {
  const count = heroCharacters.length
  const distance = (index - activeHeroCharacterIndex.value + count) % count
  const slot = fanSlots[distance] ?? 0
  const depth = count - Math.abs(slot)

  return {
    '--fan-x': `${slot * 88}px`,
    '--fan-y': `${Math.abs(slot) * 16}px`,
    '--fan-rotate': `${slot * 12}deg`,
    '--fan-scale': `${1.14 - Math.abs(slot) * 0.035}`,
    '--fan-z': depth
  }
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
  if (heroWorldTimer) {
    window.clearInterval(heroWorldTimer)
    heroWorldTimer = null
  }
})
</script>

<style scoped>
.home {
  position: relative;
  min-height: 108vh;
  overflow-x: hidden;
}

.hero-stage {
  position: relative;
  width: 100%;
  min-height: 108vh;
  margin: 0;
}

.hero-art {
  position: relative;
  min-height: 108vh;
  overflow: hidden;
  background-color: #fff7cf;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  transition: background-image 0.7s ease, background-position 0.7s ease;
}

.hero-grid {
  --hero-card-height: clamp(430px, 42vw, 500px);
  position: relative;
  z-index: 2;
  min-height: 108vh;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 500px));
  justify-content: center;
  align-items: center;
  gap: clamp(0.85rem, 2.4vw, 1.7rem) clamp(1rem, 3vw, 2rem);
  padding:
    clamp(7rem, 12vw, 9rem)
    clamp(1rem, 4vw, 3rem)
    clamp(3rem, 5vw, 4rem);
}

.hero-content {
  width: min(100%, 500px);
  height: var(--hero-card-height);
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-visual {
  width: min(100%, 500px);
  height: var(--hero-card-height);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(0.5rem, 1.2vw, 0.85rem);
}

.hero-character-panel {
  position: relative;
  width: min(100%, 500px);
  min-height: 0;
  flex: 0 1 calc(100% - 76px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-character-feature {
  position: relative;
  isolation: isolate;
  display: block;
  width: 100%;
  min-height: clamp(310px, 32vw, 382px);
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  transform: translateY(0);
  transition:
    min-height 0.28s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  text-decoration: none;
}

.hero-character-feature:hover {
  transform: translateY(-4px) scale(1.01);
  filter: saturate(1.05) brightness(1.03);
  box-shadow: none;
}

.hero-character-feature:active {
  transform: translateY(7px) scale(0.99);
  box-shadow: none;
}

.hero-character-feature-bg {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 2;
  width: clamp(218px, 23vw, 286px);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 0;
  border-radius: 24px;
  background: #d9f8ff;
  box-shadow:
    0 16px 26px rgba(27, 75, 91, 0.18),
    0 0 26px rgba(255, 235, 132, 0.44),
    0 0 44px rgba(94, 234, 212, 0.28),
    inset 0 2px 0 rgba(255, 255, 255, 0.72),
    inset 0 -10px 22px rgba(255, 255, 255, 0.14);
  transform: translateX(-50%) rotate(-0.6deg);
  transform-origin: 50% 100%;
  transition: transform 0.45s ease, filter 0.45s ease, box-shadow 0.45s ease;
  animation: heroCardGlow 2.8s ease-in-out infinite;
}

.hero-character-feature-bg::before,
.hero-character-feature-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-character-feature-bg::before {
  z-index: 0;
  background-image: var(--hero-feature-bg-image);
  background-size: cover;
  background-position: center 35%;
  opacity: 1;
  filter: saturate(1.04) brightness(1.02);
  mix-blend-mode: normal;
}

.hero-character-feature-bg::after {
  content: none;
}

.hero-character-feature:hover .hero-character-feature-bg {
  transform: translateX(-50%) rotate(0.4deg) scale(1.035);
  box-shadow:
    0 20px 30px rgba(27, 75, 91, 0.2),
    0 0 34px rgba(255, 238, 122, 0.6),
    0 0 58px rgba(56, 189, 248, 0.34),
    inset 0 2px 0 rgba(255, 255, 255, 0.78),
    inset 0 -10px 22px rgba(255, 255, 255, 0.18);
}

.hero-character-feature::before {
  content: none;
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 3;
  width: clamp(218px, 23vw, 286px);
  aspect-ratio: 3 / 4;
  border-radius: 24px;
  background:
    radial-gradient(circle at 24% 14%, rgba(255, 255, 255, 0.58) 0 6%, transparent 15%),
    radial-gradient(circle at 82% 18%, rgba(255, 242, 155, 0.52) 0 7%, transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.03) 38%, rgba(66, 126, 158, 0.16));
  transform: translateX(-50%) rotate(-0.6deg);
  filter: drop-shadow(0 0 18px rgba(255, 244, 170, 0.26));
  animation: heroCardShine 3.2s ease-in-out infinite;
  pointer-events: none;
}

.hero-character-feature::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 1;
  width: 52%;
  height: 10%;
  border-radius: 999px;
  background: radial-gradient(ellipse, rgba(26, 68, 65, 0.32) 0%, rgba(26, 68, 65, 0) 70%);
  transform: translateX(-50%);
  animation: heroCharacterShadow 3.4s ease-in-out infinite;
  pointer-events: none;
}

.hero-character-fan {
  position: absolute;
  inset: 0 2% 4%;
  z-index: 0;
  pointer-events: none;
}

.hero-character-fan-card {
  position: absolute;
  left: 50%;
  bottom: 4%;
  width: clamp(132px, 14.5vw, 184px);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 0;
  border-radius: 18px;
  background: #d9f8ff;
  box-shadow:
    0 12px 24px rgba(27, 75, 91, 0.16),
    inset 0 2px 0 rgba(255, 255, 255, 0.62);
  opacity: 0.96;
  transform:
    translateX(calc(-50% + var(--fan-x)))
    translateY(var(--fan-y))
    rotate(var(--fan-rotate))
    scale(var(--fan-scale));
  transform-origin: 50% 100%;
  z-index: var(--fan-z);
  transition:
    transform 0.78s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.42s ease,
    filter 0.42s ease;
}

.hero-character-fan-card--monkey {
  --fan-pastel-a: rgba(186, 255, 104, 0.92);
  --fan-pastel-b: rgba(110, 238, 151, 0.86);
  --fan-pastel-c: rgba(255, 225, 122, 0.76);
  --fan-pastel-start: rgba(224, 255, 155, 0.9);
  --fan-pastel-mid: rgba(150, 244, 175, 0.8);
  --fan-pastel-end: rgba(255, 234, 150, 0.78);
  --fan-glow: rgba(124, 210, 45, 0.34);
}

.hero-character-fan-card--sloth {
  --fan-pastel-a: rgba(140, 246, 228, 0.92);
  --fan-pastel-b: rgba(132, 207, 255, 0.86);
  --fan-pastel-c: rgba(193, 171, 255, 0.78);
  --fan-pastel-start: rgba(188, 255, 240, 0.9);
  --fan-pastel-mid: rgba(174, 222, 255, 0.8);
  --fan-pastel-end: rgba(212, 197, 255, 0.78);
  --fan-glow: rgba(74, 190, 242, 0.32);
}

.hero-character-fan-card--fox {
  --fan-pastel-a: rgba(255, 184, 126, 0.92);
  --fan-pastel-b: rgba(255, 232, 111, 0.86);
  --fan-pastel-c: rgba(255, 153, 190, 0.76);
  --fan-pastel-start: rgba(255, 219, 176, 0.9);
  --fan-pastel-mid: rgba(255, 239, 154, 0.8);
  --fan-pastel-end: rgba(255, 187, 211, 0.78);
  --fan-glow: rgba(255, 142, 66, 0.34);
}

.hero-character-fan-card--bear {
  --fan-pastel-a: rgba(255, 216, 90, 0.94);
  --fan-pastel-b: rgba(255, 173, 130, 0.86);
  --fan-pastel-c: rgba(163, 239, 130, 0.76);
  --fan-pastel-start: rgba(255, 237, 153, 0.9);
  --fan-pastel-mid: rgba(255, 202, 159, 0.8);
  --fan-pastel-end: rgba(198, 247, 166, 0.78);
  --fan-glow: rgba(255, 190, 58, 0.36);
}

.hero-character-fan-card--elephant {
  --fan-pastel-a: rgba(184, 162, 255, 0.94);
  --fan-pastel-b: rgba(135, 214, 255, 0.86);
  --fan-pastel-c: rgba(255, 164, 224, 0.76);
  --fan-pastel-start: rgba(218, 205, 255, 0.9);
  --fan-pastel-mid: rgba(177, 228, 255, 0.8);
  --fan-pastel-end: rgba(255, 197, 235, 0.78);
  --fan-glow: rgba(144, 111, 255, 0.34);
}

.hero-character-fan-card.is-active {
  opacity: 0;
  filter: blur(1px) saturate(0.9);
}

.hero-character-fan-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 36%;
  opacity: 1;
  filter: saturate(1.04) brightness(1.02);
  mix-blend-mode: normal;
  z-index: 0;
}

.hero-character-fan-card::before,
.hero-character-fan-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-character-fan-card::before {
  content: none;
}

.hero-character-fan-card::after {
  z-index: 3;
  background: linear-gradient(0deg, rgba(30, 64, 54, 0.14), rgba(255, 255, 255, 0));
}

.hero-character-fan-card img {
  position: absolute;
  left: 50%;
  bottom: 7%;
  z-index: 2;
  width: 70%;
  max-height: 70%;
  object-fit: contain;
  transform: translateX(-50%);
  filter: drop-shadow(0 7px 8px rgba(15, 23, 42, 0.18));
}

.hero-character-glow {
  display: none;
}

.hero-character-img {
  position: absolute;
  left: 50%;
  bottom: 9%;
  z-index: 5;
  width: clamp(176px, 20vw, 252px);
  max-height: 76%;
  object-fit: contain;
  transform: translateX(-50%);
  transform-origin: 50% 85%;
  filter:
    drop-shadow(0 18px 18px rgba(15, 23, 42, 0.22))
    drop-shadow(0 0 18px rgba(255, 244, 170, 0.34));
  animation:
    heroCharacterFeaturePop 0.72s cubic-bezier(0.2, 0.9, 0.2, 1),
    heroCharacterFeatureFloat 3.4s ease-in-out 0.72s infinite;
}

.hero-character-meta {
  position: absolute;
  left: 50%;
  bottom: clamp(0.65rem, 1.4vw, 0.85rem);
  z-index: 6;
  display: grid;
  gap: 0.15rem;
  max-width: 48%;
  text-align: left;
  color: #173b61;
  transform: translateX(calc(-50% - 34px));
  pointer-events: none;
}

.hero-character-meta span {
  width: fit-content;
  max-width: 100%;
  padding: 0.44rem 0.68rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 9px 18px rgba(28, 72, 96, 0.16);
  font-size: clamp(0.86rem, 1.5vw, 1.02rem);
  font-weight: 900;
}

.hero-character-meta small {
  width: fit-content;
  max-width: 100%;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  background: rgba(255, 239, 176, 0.9);
  box-shadow: 0 7px 14px rgba(28, 72, 96, 0.12);
  color: #6c4b15;
  font-size: 0.72rem;
  font-weight: 800;
}

.hero-character-cue {
  position: absolute;
  left: calc(50% + 38px);
  top: clamp(0.5rem, 1.1vw, 0.75rem);
  z-index: 6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 86px;
  min-height: 36px;
  padding: 0.44rem 0.72rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff7bf 0%, #ffd773 100%);
  box-shadow:
    0 6px 0 #e8a957,
    0 12px 18px rgba(62, 92, 118, 0.18),
    inset 0 2px 0 rgba(255, 255, 255, 0.7);
  color: #7a4a11;
  font-size: 0.78rem;
  font-weight: 900;
  pointer-events: none;
}

.hero-eyebrow {
  display: inline-block;
  margin: 0 0 0.8rem;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #48657c;
  background: transparent;
  border-radius: 0;
  padding: 0;
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
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 12px 24px rgba(34, 197, 94, 0.1);
  backdrop-filter: blur(14px) saturate(1.08);
  -webkit-backdrop-filter: blur(14px) saturate(1.08);
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

.hero-tag--green {
  background: #22a36b;
}

.hero-tag--pink {
  background: #e475cd;
}

.hero-tag--amber {
  background: #d28a16;
}

.hero-device-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.55rem, 1.1vw, 0.78rem);
  width: min(100%, 280px);
  margin-top: clamp(0.72rem, 1.35vw, 1.05rem);
  padding-bottom: 0;
}

.hero-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  justify-content: center;
  min-height: 54px;
  font-weight: 900;
  font-size: clamp(0.82rem, 1.08vw, 0.94rem);
  line-height: 1.1;
  padding: 0.72rem 0.78rem 0.78rem;
  border-radius: 999px;
  border: 3px solid transparent;
  letter-spacing: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.58);
  --hero-btn-edge: #e8a957;
  --hero-btn-shadow: rgba(62, 92, 118, 0.18);
  background:
    linear-gradient(180deg, #fff7bf 0%, #ffd773 100%) padding-box,
    linear-gradient(135deg, #fff9c9 0%, #f3b64e 52%, #c97928 100%) border-box;
  color: #7a4a11 !important;
  box-shadow:
    0 6px 0 var(--hero-btn-edge),
    0 12px 18px var(--hero-btn-shadow),
    inset 0 2px 0 rgba(255, 255, 255, 0.7);
  transform: translateY(0);
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
}

.hero-btn::after {
  content: none;
}

.hero-btn::before {
  content: none;
}

.hero-btn--soft {
  --hero-btn-edge: #73b72a;
  --hero-btn-shadow: rgba(115, 183, 42, 0.28);
  background:
    linear-gradient(180deg, #ecff9f 0%, #bff14f 56%, #8fd12e 100%) padding-box,
    linear-gradient(135deg, #f7ffc9 0%, #8ed43a 52%, #477f13 100%) border-box;
  color: #27520c !important;
}

.hero-btn--accent {
  --hero-btn-edge: #1aa896;
  --hero-btn-shadow: rgba(26, 168, 150, 0.28);
  background:
    linear-gradient(180deg, #c7fff1 0%, #66e8d1 56%, #27c8b0 100%) padding-box,
    linear-gradient(135deg, #e1fff8 0%, #20cbb2 52%, #08766d 100%) border-box;
  color: #064f4a !important;
}

.hero-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 8px 0 var(--hero-btn-edge),
    0 16px 22px var(--hero-btn-shadow),
    inset 0 2px 0 rgba(255, 255, 255, 0.78);
  filter: saturate(1.04) brightness(1.03);
}

.hero-btn:active {
  transform: translateY(5px) scale(0.99);
  box-shadow:
    0 2px 0 var(--hero-btn-edge),
    0 7px 13px var(--hero-btn-shadow),
    inset 0 2px 0 rgba(255, 255, 255, 0.62);
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

@keyframes heroCharacterPop {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.86) rotate(-3deg);
  }
  70% {
    opacity: 1;
    transform: translateY(-4px) scale(1.05) rotate(2deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

@keyframes heroCharacterFeaturePop {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(18px) scale(0.86) rotate(-3deg);
  }
  70% {
    opacity: 1;
    transform: translateX(-50%) translateY(-4px) scale(1.05) rotate(2deg);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1) rotate(0deg);
  }
}

@keyframes heroCharacterSway {
  0%,
  100% {
    transform: translateY(0) rotate(-1.2deg) scale(1);
  }
  50% {
    transform: translateY(-8px) rotate(1.2deg) scale(1.025);
  }
}

@keyframes heroCharacterFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes heroCharacterFeatureFloat {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(-1deg) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(-10px) rotate(1deg) scale(1.025);
  }
}

@keyframes heroCharacterShadow {
  0%,
  100% {
    opacity: 0.72;
    transform: translateX(-50%) scaleX(1);
  }
  50% {
    opacity: 0.45;
    transform: translateX(-50%) scaleX(0.82);
  }
}

@keyframes heroCardGlow {
  0%,
  100% {
    filter: brightness(1) saturate(1);
    box-shadow:
      0 16px 26px rgba(27, 75, 91, 0.18),
      0 0 26px rgba(255, 235, 132, 0.44),
      0 0 44px rgba(94, 234, 212, 0.28),
      inset 0 2px 0 rgba(255, 255, 255, 0.72),
      inset 0 -10px 22px rgba(255, 255, 255, 0.14);
  }
  50% {
    filter: brightness(1.07) saturate(1.08);
    box-shadow:
      0 18px 28px rgba(27, 75, 91, 0.2),
      0 0 34px rgba(255, 238, 122, 0.58),
      0 0 62px rgba(94, 234, 212, 0.36),
      inset 0 2px 0 rgba(255, 255, 255, 0.78),
      inset 0 -10px 22px rgba(255, 255, 255, 0.18);
  }
}

@keyframes heroCardShine {
  0%,
  100% {
    opacity: 0.86;
    filter: drop-shadow(0 0 14px rgba(255, 244, 170, 0.22));
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 0 22px rgba(255, 244, 170, 0.38));
  }
}

@keyframes heroCharacterSparkle {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.98);
  }
  50% {
    opacity: 0.72;
    transform: scale(1.02);
  }
}

@keyframes heroCaptionPulse {
  0%,
  100% {
    transform: translateY(0);
    filter: brightness(1);
  }
  50% {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }
}

.home-learn-sections {
  position: relative;
  z-index: 2;
  margin-top: 0;
  background: #ffffff;
  padding-top: clamp(2.75rem, 6vw, 5rem);
  padding-bottom: clamp(3rem, 7vw, 5.5rem);
  display: grid;
  row-gap: clamp(3.75rem, 8vw, 6.25rem);
}

.home-learn-sections :deep(.methodology-section) {
  margin-top: 0;
}

@media (prefers-reduced-motion: reduce) {
  .confetti-dot,
  .btn-cta-pulse,
  .hero-character-img,
  .hero-character-feature-bg,
  .hero-character-feature::before,
  .hero-character-feature::after,
  .hero-character-glow {
    animation: none;
  }

  .hero-character-fan-card {
    transition: none;
  }
}

@media (max-width: 768px) {
  .hero-stage,
  .hero-art,
  .hero-grid {
    min-height: 112dvh;
  }

  .hero-art {
    background-color: #d6ebff;
  }

  .hero-grid {
    --hero-card-height: auto;
    grid-template-columns: 1fr;
    padding:
      clamp(9.4rem, 28vw, 12rem)
      1rem
      3.2rem;
    gap: 0.85rem;
  }

  .hero-content {
    height: auto;
    margin-inline: auto;
    padding-top: 0.35rem;
    text-align: center;
  }

  .hero-visual {
    width: min(100%, 360px);
    height: auto;
    margin-inline: auto;
    margin-top: 0.8rem;
  }

  .hero-character-panel {
    width: 100%;
    flex: none;
  }

  .hero-character-feature {
    min-height: clamp(292px, 84vw, 368px);
  }

  .hero-character-feature-bg,
  .hero-character-feature::before,
  .hero-character-glow {
    width: clamp(194px, 60vw, 250px);
    border-radius: 22px;
  }

  .hero-character-img {
    width: clamp(158px, 48vw, 214px);
    max-height: 74%;
  }

  .hero-character-fan {
    inset: 0 0 5%;
  }

  .hero-character-fan-card {
    width: clamp(98px, 31vw, 136px);
  }

  .hero-character-meta {
    max-width: 56%;
    transform: translateX(calc(-50% - 22px));
  }

  .hero-character-cue {
    left: calc(50% + 24px);
    min-width: 76px;
    font-size: 0.72rem;
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
    width: min(100%, 260px);
    margin-top: 0.82rem;
    padding-bottom: 0.3rem;
  }

  .hero-btn {
    min-height: 52px;
    font-size: 0.8rem;
    padding: 0.68rem 0.68rem 0.74rem;
    border-radius: 999px;
  }

  .home-learn-sections {
    padding-top: 2.75rem;
    padding-bottom: 3rem;
    row-gap: 3.25rem;
  }
}

@media (min-width: 769px) and (max-width: 1180px) {
  .hero-art {
    background-color: #d6ebff;
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
