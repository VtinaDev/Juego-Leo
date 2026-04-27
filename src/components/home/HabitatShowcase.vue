<template>
  <section class="habitat-showcase" aria-label="Explora hábitats y personajes">
    <div class="showcase-wave" aria-hidden="true"></div>

    <div class="showcase-inner">
      <header class="showcase-header">
        <p class="showcase-kicker">Mundo de aventura</p>
        <h2>Entra a la jungla mágica</h2>
      </header>

      <div class="showcase-character-wrap">
        <div :key="`scene-${activeHabitat.id}`" class="showcase-character-scene" :style="sceneStyle(activeHabitat)">
          <figure :key="activeHabitat.id" class="showcase-character">
            <img
              :src="resolvedCharacter(activeHabitat)"
              :alt="`Personaje de ${activeHabitat.title}`"
              loading="lazy"
              @error="onCharacterError(activeHabitat)"
            />
            <figcaption>{{ activeHabitat.title }}</figcaption>
          </figure>
        </div>
      </div>

      <div class="showcase-carousel" :class="{ 'is-reduced-motion': prefersReducedMotion }">
        <div class="showcase-track">
          <article
            v-for="(item, index) in habitatLoop"
            :key="`${item.id}-${index}`"
            class="showcase-card"
            tabindex="0"
            :aria-label="`${item.title} - tarjeta ${index + 1}`"
          >
            <div class="showcase-card-media">
              <img
                :src="resolvedHabitat(item)"
                :alt="item.title"
                loading="lazy"
                @error="onHabitatError(item)"
              />
              <img
                class="showcase-card-character"
                :src="resolvedCharacter(item)"
                :alt="`Personaje de ${item.title}`"
                loading="lazy"
                @error="onCharacterError(item)"
              />
            </div>
            <p class="showcase-card-title">{{ item.title }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Elefante from '../../assets/characters/Elefante_graduado.png'
import Mono from '../../assets/characters/Mono.png'
import Oso from '../../assets/characters/Oso.png'
import Perezoso from '../../assets/characters/Perezoso.png'
import Zorro from '../../assets/characters/Zorro.png'

const habitats = [
  {
    id: 'monkey-jungle',
    title: 'Mundo lianas',
    image: '/images/habitats/monkey-jungle.png',
    character: Mono
  },
  {
    id: 'sloth-tree',
    title: 'El árbol',
    image: '/images/habitats/sloth-tree.png',
    character: Perezoso
  },
  {
    id: 'fox-burrow',
    title: 'La Madriguera',
    image: '/images/habitats/fox-burrow.png',
    character: Zorro
  },
  {
    id: 'bear-honey',
    title: 'El bosque de Miel',
    image: '/images/habitats/bear-honey.png',
    character: Oso
  },
  {
    id: 'elephant-school',
    title: 'La escuela mágica',
    image: '/images/habitats/elephant-school.png',
    character: Elefante
  }
]

const habitatFallbacks = {
  'monkey-jungle': '/images/habitats/isla_lianas.PNG',
  'sloth-tree': '/images/habitats/arbol.PNG',
  'fox-burrow': '/images/habitats/madriguera.PNG',
  'bear-honey': '/images/habitats/santuario.PNG',
  'elephant-school': '/images/habitats/escuela.PNG'
}

const characterFallbacks = {
  'monkey-jungle': Mono,
  'sloth-tree': Perezoso,
  'fox-burrow': Zorro,
  'bear-honey': Oso,
  'elephant-school': Elefante
}

const prefersReducedMotion = ref(false)
const activeIndex = ref(0)
const brokenHabitat = ref(new Set())
const brokenCharacter = ref(new Set())

let cycleTimer = null
let motionQueryList = null

const habitatLoop = computed(() => [...habitats, ...habitats])
const activeHabitat = computed(() => habitats[activeIndex.value] || habitats[0])

function startCycle() {
  if (cycleTimer || prefersReducedMotion.value) return
  cycleTimer = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % habitats.length
  }, 2500)
}

function stopCycle() {
  if (!cycleTimer) return
  clearInterval(cycleTimer)
  cycleTimer = null
}

function handleMotionChange(event) {
  prefersReducedMotion.value = Boolean(event.matches)
  if (prefersReducedMotion.value) {
    stopCycle()
    return
  }
  startCycle()
}

function resolvedHabitat(item) {
  if (brokenHabitat.value.has(item.id)) return habitatFallbacks[item.id] || item.image
  return item.image
}

function resolvedCharacter(item) {
  if (brokenCharacter.value.has(item.id)) return characterFallbacks[item.id] || item.character
  return item.character
}

function onHabitatError(item) {
  brokenHabitat.value.add(item.id)
  brokenHabitat.value = new Set(brokenHabitat.value)
}

function onCharacterError(item) {
  brokenCharacter.value.add(item.id)
  brokenCharacter.value = new Set(brokenCharacter.value)
}

function sceneStyle(item) {
  const fallback = habitatFallbacks[item.id] || item.image
  return {
    backgroundImage: `linear-gradient(180deg, rgba(191, 219, 254, 0.18), rgba(15, 23, 42, 0.08)), url('${item.image}'), url('${fallback}')`
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  motionQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQueryList.matches
  motionQueryList.addEventListener?.('change', handleMotionChange)
  startCycle()
})

onBeforeUnmount(() => {
  stopCycle()
  motionQueryList?.removeEventListener?.('change', handleMotionChange)
})
</script>

<style scoped>
.habitat-showcase {
  position: relative;
  background: linear-gradient(180deg, #fcffe7 0%, #f7fbff 62%, #ffffff 100%);
  padding: 2.4rem clamp(1rem, 4vw, 2.5rem) 2.8rem;
  overflow: hidden;
}

.showcase-wave {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 18px;
  background:
    linear-gradient(-45deg, #78d4ff 8px, transparent 0) 0 0 / 16px 16px repeat-x,
    linear-gradient(45deg, #78d4ff 8px, transparent 0) 8px 0 / 16px 16px repeat-x;
  opacity: 0.92;
}

.showcase-inner {
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  margin: 0 auto;
}

.showcase-header {
  text-align: center;
  margin-bottom: 0.9rem;
}

.showcase-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: #67a103;
  text-transform: uppercase;
}

.showcase-header h2 {
  margin: 0;
  font-size: clamp(1.3rem, 3.6vw, 2.1rem);
  color: #0f2f4e;
  line-height: 1.15;
}

.showcase-character-wrap {
  display: grid;
  place-items: center;
  margin: 0.9rem 0 1.2rem;
}

.showcase-character-scene {
  width: min(100%, 1040px);
  min-height: clamp(190px, 28vw, 300px);
  border-radius: 28px;
  border: 2px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 16px 30px rgba(250, 204, 21, 0.28);
  background-size: cover, cover, cover;
  background-position: center, center, center;
  background-repeat: no-repeat;
  display: grid;
  place-items: center;
  padding: clamp(0.85rem, 2.1vw, 1.5rem) 1rem;
  animation: sceneFadeIn 0.65s ease;
}

.showcase-character {
  margin: 0;
  width: clamp(170px, 33vw, 280px);
  display: grid;
  gap: 0.45rem;
  justify-items: center;
  animation: characterScaleIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.showcase-character img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  filter: drop-shadow(0 14px 22px rgba(15, 23, 42, 0.22));
  animation: characterFloat 3.2s ease-in-out infinite;
}

.showcase-character figcaption {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f3d66;
}

.showcase-carousel {
  --card-w: clamp(220px, 72vw, 280px);
  --track-gap: clamp(0.8rem, 2.5vw, 1.25rem);
  transform: rotate(-4deg);
  transform-origin: center;
}

.showcase-track {
  display: flex;
  gap: var(--track-gap);
  width: max-content;
  animation: showcaseLoop 24s linear infinite;
}

.showcase-card {
  width: var(--card-w);
  border-radius: 24px;
  padding: 0.8rem 0.8rem 0.95rem;
  background: linear-gradient(180deg, #ffffff 0%, #fffff3 100%);
  border: 2px solid rgba(253, 253, 147, 0.44);
  box-shadow: 0 10px 20px rgba(250, 204, 21, 0.24);
  transform: rotate(2deg);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  outline: none;
}

.showcase-card-media {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, #c9edff 0%, #bde8ff 44%, #b1ecbb 100%);
  aspect-ratio: 1.45 / 1;
}

.showcase-card-media > img:first-child {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.showcase-card-character {
  position: absolute;
  right: 4%;
  bottom: 0;
  width: 42%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  filter: drop-shadow(0 8px 12px rgba(15, 23, 42, 0.2));
}

.showcase-card-title {
  margin: 0.7rem 0 0;
  font-size: 1rem;
  font-weight: 800;
  color: #12385c;
}

.showcase-card:hover,
.showcase-card:focus-visible {
  transform: rotate(2deg) translateY(-8px) scale(1.03);
  box-shadow: 0 18px 30px rgba(250, 204, 21, 0.34);
}

.showcase-card:focus-visible {
  border-color: rgba(37, 99, 235, 0.72);
}

.is-reduced-motion {
  transform: none;
}

.is-reduced-motion .showcase-track {
  animation: none;
  width: auto;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.is-reduced-motion .showcase-card {
  transform: none;
}

@keyframes characterScaleIn {
  0% {
    transform: translateY(14px) scale(0.76);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes sceneFadeIn {
  0% {
    opacity: 0.38;
    transform: scale(0.985);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes characterFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes showcaseLoop {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - (var(--track-gap) / 2)));
  }
}

@media (min-width: 920px) {
  .showcase-carousel {
    --card-w: clamp(300px, 30vw, 370px);
    --track-gap: 1.4rem;
  }

  .showcase-character {
    width: clamp(220px, 24vw, 320px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .showcase-character-scene,
  .showcase-character,
  .showcase-character img,
  .showcase-track {
    animation: none;
  }
}
</style>
