<template>
  <section class="methodology-section" aria-labelledby="methodology-title">
    <div class="methodology-inner">
      <header class="methodology-header">
        <h2 id="methodology-title">¿Cómo aprende tu hijo en Juego &amp; Leo?</h2>
        <p class="methodology-subtitle">
          Una metodología diseñada para respetar el ritmo de cada niño y reducir la frustración al aprender a leer.
        </p>
      </header>

      <div
        class="methodology-carousel"
        aria-label="Información sobre Juego y Leo"
        @mouseenter="pauseCarousel"
        @mouseleave="startCarousel"
        @focusin="pauseCarousel"
        @focusout="startCarousel"
      >
        <button
          class="methodology-carousel__arrow methodology-carousel__arrow--prev"
          type="button"
          aria-label="Ver información anterior"
          @click="showPreviousSlide"
        >
          ‹
        </button>

        <div class="methodology-carousel__viewport">
          <div class="methodology-carousel__track" :style="carouselTrackStyle">
            <article
              v-for="slide in carouselSlides"
              :key="slide.id"
              class="methodology-carousel__slide"
            >
              <div class="methodology-carousel__character" aria-hidden="true">
                <img :src="slide.image" alt="" loading="lazy" />
              </div>
              <div class="methodology-carousel__bubble">
                <h3>{{ slide.title }}</h3>
                <p v-if="slide.text">{{ slide.text }}</p>
                <component :is="slide.ordered ? 'ol' : 'ul'" v-else>
                  <li v-for="item in slide.items" :key="item">{{ item }}</li>
                </component>
              </div>
            </article>
          </div>
        </div>

        <button
          class="methodology-carousel__arrow methodology-carousel__arrow--next"
          type="button"
          aria-label="Ver información siguiente"
          @click="showNextSlide"
        >
          ›
        </button>

        <div class="methodology-carousel__dots" aria-label="Diapositivas de información">
          <button
            v-for="(slide, index) in carouselSlides"
            :key="`methodology-dot-${slide.id}`"
            class="methodology-carousel__dot"
            :class="{ 'is-active': index === activeSlideIndex }"
            type="button"
            :aria-label="`Ver ${slide.title}`"
            :aria-current="index === activeSlideIndex ? 'true' : undefined"
            @click="goToSlide(index)"
          ></button>
        </div>
      </div>

      <div class="methodology-grid" role="list">
        <article v-for="item in items" :key="item.title" class="methodology-card" role="listitem">
          <div class="methodology-icon" aria-hidden="true">
            <img :src="item.icon" :alt="`Icono ${item.title}`" class="methodology-icon-img" loading="lazy" />
          </div>
          <h3 class="methodology-card-title">{{ item.title }}</h3>
          <p class="methodology-card-text">{{ item.text }}</p>
        </article>
      </div>

      <p class="methodology-note">
        Diseñado especialmente para niños con dislexia, TDAH y dificultades de aprendizaje.
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ICONS } from '../../constants/icons'

const characterImages = {
  fox: '/images/characters/fox.png',
  bear: '/images/characters/bear.png',
  monkey: '/images/characters/monkey.png',
  elephant: '/images/characters/elephant.png',
  sloth: '/images/characters/sloth.png'
}

const carouselSlides = [
  {
    id: 'what',
    image: characterImages.fox,
    title: '¿Qué es?',
    text: 'Una plataforma lúdica con rutas de ejercicios cortos. Combina texto, audio y apoyo visual para guiar al niño y reducir la frustración mientras aprende a leer.'
  },
  {
    id: 'audience',
    image: characterImages.bear,
    title: '¿A quién acompaña?',
    items: [
      'Niños y niñas desde 4 años que inician lectura.',
      'Peques con dislexia, TDAH u otras dificultades de aprendizaje.',
      'Familias que buscan una práctica segura y guiada.'
    ]
  },
  {
    id: 'how',
    image: characterImages.monkey,
    title: 'Cómo funciona',
    ordered: true,
    items: [
      'Empieza con niveles básicos y avanza paso a paso.',
      'Repetimos con variaciones suaves para consolidar sin aburrir.',
      'Feedback positivo y errores mínimos para aumentar la confianza.'
    ]
  },
  {
    id: 'method',
    image: characterImages.elephant,
    title: 'Metodología',
    items: [
      'Lectura silábica y fonética con apoyo auditivo.',
      'Comprensión lectora con frases e historias breves.',
      'Memoria visual y asociación con imágenes claras.',
      'Ejercicios graduados: palabras, frases y comprensión.'
    ]
  },
  {
    id: 'wellbeing',
    image: characterImages.sloth,
    title: 'Seguridad y bienestar',
    items: [
      'Sesiones cortas para evitar fatiga.',
      'Sin publicidad ni compras dentro de la app.',
      'Controles parentales y progreso local.'
    ]
  }
]

const activeSlideIndex = ref(0)
let carouselTimer = null

const carouselTrackStyle = computed(() => ({
  transform: `translateX(-${activeSlideIndex.value * 100}%)`
}))

function goToSlide(index) {
  activeSlideIndex.value = (index + carouselSlides.length) % carouselSlides.length
  restartCarousel()
}

function showNextSlide() {
  goToSlide(activeSlideIndex.value + 1)
}

function showPreviousSlide() {
  goToSlide(activeSlideIndex.value - 1)
}

function pauseCarousel() {
  if (!carouselTimer) return
  window.clearInterval(carouselTimer)
  carouselTimer = null
}

function startCarousel() {
  if (typeof window === 'undefined' || carouselTimer) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  carouselTimer = window.setInterval(() => {
    activeSlideIndex.value = (activeSlideIndex.value + 1) % carouselSlides.length
  }, 4200)
}

function restartCarousel() {
  pauseCarousel()
  startCarousel()
}

onMounted(startCarousel)
onBeforeUnmount(pauseCarousel)

const items = [
  {
    icon: ICONS.brain,
    title: 'Aprendizaje con calma',
    text: 'Ejercicios cortos y claros que evitan la sobrecarga y la fatiga cognitiva.'
  },
  {
    icon: ICONS.repeat,
    title: 'Repetición que da seguridad',
    text: 'Repetimos las actividades con pequeñas variaciones para reforzar sin aburrir.'
  },
  {
    icon: ICONS.correct,
    title: 'Error mínimo, más confianza',
    text: 'El juego guía al niño para reducir errores y aumentar la sensación de logro.'
  },
  {
    icon: ICONS.puzzle,
    title: 'Lectura paso a paso',
    text: 'Desde palabras simples hasta frases y comprensión lectora, sin saltos bruscos.'
  },
  {
    icon: ICONS.audio,
    title: 'Apoyo visual y auditivo',
    text: 'Imágenes claras y opción de audio para facilitar la comprensión y la atención.'
  }
]
</script>

<style scoped>
.methodology-section {
  margin-top: clamp(4rem, 8vw, 6.5rem);
}

.methodology-inner {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.methodology-header h2 {
  font-size: 1.9rem;
  font-weight: 800;
  color: #0f172a;
  margin: clamp(1.5rem, 4vw, 3rem) 0 0;
}

.methodology-subtitle {
  margin: 0.5rem auto 1.5rem;
  max-width: 820px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.55;
}

.methodology-carousel {
  position: relative;
  width: min(100%, 1040px);
  margin: 0 auto clamp(3.5rem, 7vw, 5.5rem);
  padding: 0 2.25rem 2.3rem;
}

.methodology-carousel__viewport {
  overflow: hidden;
  border-radius: 24px;
}

.methodology-carousel__track {
  display: flex;
  transition: transform 0.55s ease;
  will-change: transform;
}

.methodology-carousel__slide {
  flex: 0 0 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  align-items: end;
  justify-content: center;
  padding: 0.25rem 0;
}

.methodology-carousel__arrow {
  position: absolute;
  top: 50%;
  z-index: 4;
  width: 36px;
  height: 36px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(34, 197, 94, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #173b61;
  font-size: 2rem;
  font-weight: 950;
  line-height: 1;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(10px);
  transform: translateY(-50%);
  transition: transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
}

.methodology-carousel__arrow--prev {
  left: 0;
}

.methodology-carousel__arrow--next {
  right: 0;
}

.methodology-carousel__arrow:hover,
.methodology-carousel__arrow:focus-visible {
  background: #ffffff;
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.18);
  transform: translateY(-50%) scale(1.04);
}

.methodology-carousel__dots {
  position: absolute;
  right: 0;
  bottom: 0.25rem;
  left: 0;
  display: flex;
  justify-content: center;
  gap: 0.45rem;
}

.methodology-carousel__dot {
  width: 0.62rem;
  height: 0.62rem;
  border: 0;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.58);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.14);
  transition: transform 0.16s ease, background 0.16s ease, width 0.16s ease;
}

.methodology-carousel__dot.is-active {
  width: 1.5rem;
  background: #27c8b0;
}

.methodology-carousel__dot:hover,
.methodology-carousel__dot:focus-visible {
  transform: scale(1.08);
}

.methodology-carousel__character {
  width: 110px;
  height: 110px;
  display: grid;
  place-items: end center;
  z-index: 2;
  animation: methodologyCarouselIdle 2.8s ease-in-out infinite;
}

.methodology-carousel__character img {
  width: 108px;
  height: 108px;
  object-fit: contain;
  filter: none;
}

.methodology-carousel__bubble {
  position: relative;
  width: min(100%, 650px);
  min-height: 120px;
  margin: 0 auto 12px -8px;
  padding: 0.95rem 1rem 0.9rem 1.05rem;
  border: 2px solid rgba(14, 165, 233, 0.22);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: none;
  text-align: left;
}

.methodology-carousel__bubble::before {
  content: '';
  position: absolute;
  left: -11px;
  top: 35px;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-left: 2px solid rgba(14, 165, 233, 0.22);
  border-bottom: 2px solid rgba(14, 165, 233, 0.22);
  transform: rotate(45deg);
}

.methodology-carousel__bubble h3 {
  margin: 0 0 0.25rem;
  color: #0f172a;
  font-size: 1.08rem;
  font-weight: 950;
}

.methodology-carousel__bubble p,
.methodology-carousel__bubble ul,
.methodology-carousel__bubble ol {
  margin: 0;
  color: #334155;
  font-size: 0.96rem;
  line-height: 1.52;
}

.methodology-carousel__bubble ul,
.methodology-carousel__bubble ol {
  display: grid;
  gap: 0.32rem;
  padding-left: 1rem;
}

.methodology-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  isolation: isolate;
}

.methodology-card {
  position: relative;
  z-index: 0;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.86);
  border-radius: 22px;
  padding: 1.2rem 1.1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(10px);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  cursor: pointer;
  transform: scale(1);
  transform-origin: center;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background-color 0.24s ease;
  will-change: transform;
}

.methodology-card:hover,
.methodology-card:focus-within {
  z-index: 4;
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(34, 197, 94, 0.58);
  background: #ffffff;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.11);
}

.methodology-card:active {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.09);
}

.methodology-icon {
  width: 3.15rem;
  height: 3.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.methodology-icon-img {
  width: 82%;
  height: 82%;
  object-fit: contain;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.18));
}

.methodology-card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.methodology-card-text {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  font-size: 0.98rem;
}

.methodology-note {
  margin: 1.5rem 0 0;
  color: #6b7280;
  font-size: 0.95rem;
}

@keyframes methodologyCarouselIdle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (min-width: 640px) {
  .methodology-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .methodology-section {
    width: 100%;
    margin-top: 2.5rem;
  }

  .methodology-inner {
    padding-inline: 0.75rem;
  }

  .methodology-header h2 {
    margin-top: 0;
    font-size: clamp(1.35rem, 7vw, 1.7rem);
    line-height: 1.15;
  }

  .methodology-subtitle {
    font-size: 0.95rem;
  }

  .methodology-carousel {
    width: 100%;
    margin-bottom: 2.5rem;
    padding: 0 0 2.25rem;
  }

  .methodology-carousel__viewport {
    width: calc(100% - 2.25rem);
    margin-inline: auto;
    border-radius: 18px;
  }

  .methodology-carousel__slide {
    grid-template-columns: 58px minmax(0, 1fr);
    align-items: center;
  }

  .methodology-carousel__character {
    width: 62px;
    height: 76px;
  }

  .methodology-carousel__character img {
    width: 62px;
    height: 72px;
  }

  .methodology-carousel__bubble {
    width: 100%;
    min-height: 0;
    margin: 0;
    padding: 0.8rem 0.72rem 0.8rem 0.9rem;
    border-radius: 16px;
  }

  .methodology-carousel__bubble::before {
    left: -8px;
    top: 30px;
    width: 14px;
    height: 14px;
  }

  .methodology-carousel__bubble h3 {
    font-size: 1rem;
  }

  .methodology-carousel__bubble p,
  .methodology-carousel__bubble ul,
  .methodology-carousel__bubble ol {
    font-size: 0.86rem;
    line-height: 1.42;
    overflow-wrap: anywhere;
  }

  .methodology-carousel__arrow {
    width: 32px;
    height: 32px;
    font-size: 1.65rem;
  }

  .methodology-carousel__arrow--prev {
    left: -0.25rem;
  }

  .methodology-carousel__arrow--next {
    right: -0.25rem;
  }

  .methodology-grid {
    gap: 0.75rem;
  }

  .methodology-card {
    width: 100%;
    padding: 1rem;
  }
}

@media (min-width: 780px) {
  .methodology-carousel {
    padding-right: 3.4rem;
    padding-left: 3.4rem;
  }

  .methodology-carousel__slide {
    grid-template-columns: 196px minmax(0, 650px);
  }

  .methodology-carousel__character {
    width: 200px;
    height: 200px;
  }

  .methodology-carousel__character img {
    width: 194px;
    height: 194px;
  }

  .methodology-carousel__bubble {
    width: min(100%, 650px);
    min-height: 172px;
    margin-left: -20px;
    margin-bottom: 24px;
    padding: 1.25rem 1.35rem 1.2rem 1.45rem;
  }

  .methodology-carousel__bubble h3 {
    font-size: 1.25rem;
  }

  .methodology-carousel__bubble p,
  .methodology-carousel__bubble ul,
  .methodology-carousel__bubble ol {
    font-size: 1.02rem;
  }
}

@media (min-width: 960px) {
  .methodology-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1180px) {
  .methodology-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .methodology-card,
  .methodology-carousel__track,
  .methodology-carousel__arrow,
  .methodology-carousel__dot {
    transition: none;
  }

  .methodology-carousel__character {
    animation: none;
  }

  .methodology-card:hover,
  .methodology-card:focus-within,
  .methodology-card:active {
    transform: none;
    box-shadow: none;
  }
}
</style>
