<template>
  <section class="benefits" aria-labelledby="benefits-title">
    <div class="benefits-inner">
      <div class="benefits-card-banner">
        <h2 id="benefits-title">Aprender a leer puede ser divertido.</h2>
        <p class="banner-sub">
          Sesiones cortas, guiadas y sin presión, pensadas para el ritmo de cada niño.
        </p>
      </div>

      <div class="benefits-grid" role="list">
        <article v-for="item in benefitItems" :key="item.title" class="benefit-card" role="listitem">
          <span class="benefit-icon" aria-hidden="true">
            <img :src="item.icon" :alt="`Icono ${item.title}`" class="benefit-icon-img" loading="lazy" />
          </span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ICONS } from '../../constants/icons'

const benefitItems = [
  {
    title: 'Sin presión',
    text: 'Sin tiempo límite, sin comparaciones y con reintentos suaves.',
    icon: ICONS.profile
  },
  {
    title: '10–15 minutos',
    text: 'Sesiones breves para evitar fatiga y mantener la atención.',
    icon: ICONS.clock
  },
  {
    title: 'Paso a paso',
    text: 'Progresión gradual: letras, sílabas, palabras y comprensión.',
    icon: ICONS.puzzle
  }
]
</script>

<style scoped>
.benefits {
  padding: 2.5rem 1rem 3rem;
  background: #ffffff;
}

.benefits-inner {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 1.6rem;
}

.benefits-card-banner {
  background: transparent;
  border-radius: 0;
  padding: 0 clamp(0.2rem, 2vw, 0.6rem);
  text-align: center;
  box-shadow: none;
}

.benefits-card-banner h2 {
  margin: 0;
  font-weight: 900;
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
  color: #0f172a;
}

.banner-sub {
  margin: 0.35rem auto 0;
  color: #1f3b17;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 720px;
}

.benefits-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  isolation: isolate;
}

.benefit-card {
  position: relative;
  z-index: 0;
  background: rgba(241, 245, 249, 0.86);
  border: 1px solid rgba(135, 197, 34, 0.5);
  border-radius: 16px;
  padding: 1.1rem 1rem;
  box-shadow: none;
  backdrop-filter: blur(1px);
  display: grid;
  gap: 0.4rem;
  text-align: left;
  cursor: pointer;
  transform: scale(1);
  transform-origin: center;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background-color 0.24s ease;
  will-change: transform;
}

.benefit-card:hover,
.benefit-card:focus-within {
  z-index: 4;
  transform: translateY(-12px) scale(1.16);
  border-color: rgba(140, 197, 34, 0.95);
  background: #ffffff;
  box-shadow: 0 24px 48px rgba(129, 197, 34, 0.34);
}

.benefit-card:active {
  transform: translateY(-8px) scale(1.12);
  box-shadow: 0 20px 40px rgba(132, 197, 34, 0.32);
}

.benefit-icon {
  width: 3.15rem;
  height: 3.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.benefit-icon-img {
  width: 82%;
  height: 82%;
  object-fit: contain;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.18));
}

.benefit-card h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.benefit-card p {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  font-size: 0.98rem;
}

@media (min-width: 640px) {
  .benefits-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .benefits-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .benefit-card {
    transition: none;
  }

  .benefit-card:hover,
  .benefit-card:focus-within,
  .benefit-card:active {
    transform: none;
    box-shadow: none;
  }
}
</style>
