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
                  :style="{ backgroundImage: `url('${activeHeroCharacter.habitat}')` }"
                  aria-hidden="true"
                />

                <span class="hero-character-fan" aria-hidden="true">
                  <span
                    v-for="(item, index) in heroCharacters"
                    :key="`fan-${item.id}`"
                    class="hero-character-fan-card"
                    :class="{ 'is-active': index === activeHeroCharacterIndex }"
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
    linear-gradient(90deg, rgba(236, 252, 203, 0.82) 0%, rgba(254, 249, 195, 0.56) 48%, rgba(240, 253, 244, 0.42) 100%),
    url('${activeHeroCharacter.value.habitat}')
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
    '--fan-x': `${slot * 72}px`,
    '--fan-y': `${Math.abs(slot) * 14}px`,
    '--fan-rotate': `${slot * 11}deg`,
    '--fan-scale': `${1.08 - Math.abs(slot) * 0.04}`,
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
  background-color: #ecfccb;
  background-size: cover, cover;
  background-position: center center, center 38%;
  background-repeat: no-repeat;
  transition: background-image 0.7s ease, background-position 0.7s ease;
}

.hero-grid {
  --hero-card-height: clamp(360px, 38vw, 430px);
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
  flex: 0 1 calc(100% - 86px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-character-feature {
  position: relative;
  isolation: isolate;
  display: block;
  width: 100%;
  min-height: clamp(258px, 28vw, 326px);
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
  width: clamp(176px, 19vw, 232px);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.88);
  border-radius: 24px;
  background-size: cover;
  background-position: center 35%;
  box-shadow:
    0 14px 24px rgba(27, 75, 91, 0.16),
    inset 0 2px 0 rgba(255, 255, 255, 0.66);
  transform: translateX(-50%) rotate(-0.6deg);
  transform-origin: 50% 100%;
  transition: transform 0.45s ease, filter 0.45s ease;
}

.hero-character-feature:hover .hero-character-feature-bg {
  transform: translateX(-50%) rotate(0.4deg) scale(1.02);
}

.hero-character-feature::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 3;
  width: clamp(176px, 19vw, 232px);
  aspect-ratio: 3 / 4;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.02) 38%, rgba(66, 126, 158, 0.18)),
    radial-gradient(circle at 16% 14%, rgba(255, 255, 255, 0.62) 0 7%, transparent 8%),
    radial-gradient(circle at 84% 22%, rgba(255, 238, 152, 0.5) 0 8%, transparent 9%);
  transform: translateX(-50%) rotate(-0.6deg);
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
  width: clamp(112px, 12.5vw, 158px);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.82);
  border-radius: 18px;
  background: #d9f8ff;
  box-shadow:
    0 10px 18px rgba(27, 75, 91, 0.14),
    inset 0 2px 0 rgba(255, 255, 255, 0.62);
  opacity: 0.88;
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

.hero-character-fan-card.is-active {
  opacity: 0;
  filter: blur(1px) saturate(0.9);
}

.hero-character-fan-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 36%;
}

.hero-character-fan-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0) 40%),
    linear-gradient(0deg, rgba(30, 64, 54, 0.14), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.hero-character-fan-card img {
  position: absolute;
  left: 50%;
  bottom: 7%;
  width: 70%;
  max-height: 70%;
  object-fit: contain;
  transform: translateX(-50%);
  filter: drop-shadow(0 7px 8px rgba(15, 23, 42, 0.18));
}

.hero-character-glow {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 4;
  width: clamp(176px, 19vw, 232px);
  aspect-ratio: 3 / 4;
  border-radius: 24px;
  background:
    radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.38) 0 8%, transparent 22%),
    radial-gradient(circle at 74% 27%, rgba(255, 244, 170, 0.26) 0 9%, transparent 24%);
  transform: translateX(-50%) rotate(-0.6deg);
  animation: heroCharacterSparkle 4.8s ease-in-out infinite;
  pointer-events: none;
}

.hero-character-img {
  position: absolute;
  left: 50%;
  bottom: 8%;
  z-index: 5;
  width: clamp(148px, 17vw, 212px);
  max-height: 72%;
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
  margin-top: 0;
  padding-bottom: 0.25rem;
}

.hero-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  justify-content: center;
  min-height: 56px;
  font-weight: 900;
  font-size: clamp(0.95rem, 1.4vw, 1.08rem);
  line-height: 1.1;
  padding: 0.76rem 0.9rem 0.84rem;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.84);
  letter-spacing: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.58);
  box-shadow:
    0 10px 0 var(--hero-btn-edge),
    0 16px 24px rgba(66, 98, 120, 0.22),
    inset 0 2px 0 rgba(255, 255, 255, 0.72),
    inset 0 -2px 0 rgba(255, 255, 255, 0.24);
  transform: translateY(0);
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
}

.hero-btn::after {
  content: '';
  position: absolute;
  inset: 3px 5px auto;
  height: 42%;
  border-radius: 15px 15px 12px 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0));
  mix-blend-mode: screen;
  pointer-events: none;
}

.hero-btn::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 11px;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 13px 7px 0 rgba(255, 255, 255, 0.48);
  pointer-events: none;
}

.hero-btn--soft {
  --hero-btn-edge: #f3b84f;
  background:
    radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.72) 0 10%, transparent 11%),
    linear-gradient(180deg, #fff2a7 0%, #ffd76f 55%, #ffbd72 100%);
  color: #8a4b13 !important;
}

.hero-btn--accent {
  --hero-btn-edge: #65a7df;
  background:
    radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.72) 0 10%, transparent 11%),
    linear-gradient(180deg, #c9f3ff 0%, #8edbff 55%, #9bbcff 100%);
  color: #17507c !important;
}

.hero-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 13px 0 var(--hero-btn-edge),
    0 20px 28px rgba(66, 98, 120, 0.24),
    inset 0 2px 0 rgba(255, 255, 255, 0.78),
    inset 0 -2px 0 rgba(255, 255, 255, 0.28);
  filter: saturate(1.04) brightness(1.03);
}

.hero-btn:active {
  transform: translateY(6px) scale(0.99);
  box-shadow:
    0 4px 0 var(--hero-btn-edge),
    0 8px 16px rgba(66, 98, 120, 0.18),
    inset 0 2px 0 rgba(255, 255, 255, 0.62),
    inset 0 -1px 0 rgba(255, 255, 255, 0.24);
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
  padding-top: 0;
}

.home-learn-sections :deep(.methodology-section) {
  margin-top: 0;
}

@media (prefers-reduced-motion: reduce) {
  .confetti-dot,
  .btn-cta-pulse,
  .hero-character-img,
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
      7.2rem
      1rem
      3.2rem;
    gap: 0.35rem;
  }

  .hero-content {
    height: auto;
    margin-inline: auto;
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
    min-height: clamp(250px, 72vw, 318px);
  }

  .hero-character-feature-bg,
  .hero-character-feature::before,
  .hero-character-glow {
    width: clamp(158px, 50vw, 208px);
    border-radius: 22px;
  }

  .hero-character-img {
    width: clamp(132px, 42vw, 184px);
    max-height: 70%;
  }

  .hero-character-fan {
    inset: 0 0 5%;
  }

  .hero-character-fan-card {
    width: clamp(84px, 27vw, 116px);
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
    width: min(100%, 420px);
    padding-bottom: 0.3rem;
  }

  .home-learn-sections {
    padding-top: 0;
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
