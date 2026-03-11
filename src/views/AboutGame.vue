<template>
  <section class="about-wrapper" aria-labelledby="about-title">
    <div class="about-inner">
      <div class="about-hero-clouds">
        <div class="hero-confetti" aria-hidden="true">
          <span class="confetti-piece"></span>
          <span class="confetti-piece"></span>
          <span class="confetti-piece"></span>
          <span class="confetti-piece"></span>
          <span class="confetti-piece"></span>
          <span class="confetti-piece"></span>
          <span class="confetti-piece"></span>
          <span class="confetti-piece"></span>
        </div>
        <span class="hero-cloud cloud-a" aria-hidden="true"></span>
        <span class="hero-cloud cloud-b" aria-hidden="true"></span>
        <span class="hero-cloud cloud-c" aria-hidden="true"></span>
        <span class="hero-cloud cloud-d" aria-hidden="true"></span>
        <figure class="about-hero-figure">
          <img src="/images/about/about-tablet.png" alt="Niña usando una tablet para aprender en casa" class="about-hero-img" />
        </figure>
      </div>

      <div class="about-header-card">
        <header class="about-header">
          <h1 id="about-title">Sobre el juego</h1>
          <p class="about-lead">
            Juego &amp; Leo es una herramienta educativa digital que acompaña a niñas y niños en sus primeros pasos de lectura.
            Diseñamos cada actividad para que el aprendizaje sea amable, progresivo y con refuerzo positivo.
          </p>
        </header>
      </div>

      <div class="about-grid">
        <article class="about-card full-card full-card-1">
          <h2>¿Qué es?</h2>
          <p>
            Una plataforma lúdica con rutas de ejercicios cortos. Combina texto, audio y apoyo visual para guiar al niño y
            reducir la frustración mientras aprende a leer.
          </p>
        </article>

        <article class="about-card audience-card">
          <h2>¿A quién acompaña?</h2>
          <ul>
            <li>Niños y niñas desde 4 años que inician lectura.</li>
            <li>Peques con dislexia, TDAH u otras dificultades de aprendizaje.</li>
            <li>Familias que buscan una práctica segura y guiada.</li>
          </ul>
        </article>

        <article class="about-card stacked-card stacked-card-1">
          <h2>Cómo funciona</h2>
          <ol>
            <li>Empieza con niveles básicos y avanza paso a paso.</li>
            <li>Repetimos con variaciones suaves para consolidar sin aburrir.</li>
            <li>Feedback positivo y errores mínimos para aumentar la confianza.</li>
          </ol>
        </article>

        <article class="about-card stacked-card stacked-card-2">
          <h2>Metodología</h2>
          <ul>
            <li>Lectura silábica y fonética con apoyo auditivo.</li>
            <li>Comprensión lectora con frases e historias breves.</li>
            <li>Memoria visual y asociación con imágenes claras.</li>
            <li>Ejercicios graduados: palabras → frases → comprensión.</li>
          </ul>
        </article>

        <article class="about-card full-card full-card-2">
          <h2>Seguridad y bienestar</h2>
          <ul>
            <li>Sesiones cortas para evitar fatiga.</li>
            <li>Sin publicidad ni compras dentro de la app.</li>
            <li>Controles parentales y progreso local.</li>
          </ul>
        </article>
      </div>

      <div class="about-cta">
        <RouterLink class="btn btn-primary about-btn" to="/subscribe">Empieza la prueba de 7 días</RouterLink>
        <button class="btn btn-ghost about-btn" type="button" aria-disabled="true" disabled>
          Descargar folleto (próximamente)
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.about-wrapper {
  padding: 0 0 3rem;
  color: #0f172a;
  background: #ffffff;
}

.about-inner {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-header-card {
  background: #ffe572;
  border-radius: 22px;
  padding: 1.25rem 1rem;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
  margin-top: -1rem;
  z-index: 2;
  position: relative;
  width: min(94%, 880px);
  margin-left: auto;
  margin-right: auto;
}

.about-header {
  text-align: center;
  display: grid;
  gap: 0.75rem;
}

.about-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
}

.about-lead {
  margin: 0 auto;
  max-width: 880px;
  color: #475569;
  line-height: 1.6;
  font-size: 1.05rem;
}

.about-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.about-hero-clouds {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto -1.8rem;
  padding: 0;
  border-radius: 24px;
  overflow: hidden;
}

.hero-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.confetti-piece {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(145deg, #f87171, #fbbf24);
  border-radius: 999px;
  opacity: 0.85;
  animation: confettiFloat 4.6s ease-in-out infinite;
}
.confetti-piece:nth-child(2) { left: 18%; top: 10%; animation-delay: 0.4s; background: linear-gradient(145deg, #34d399, #22d3ee); }
.confetti-piece:nth-child(3) { left: 48%; top: 6%;  animation-delay: 0.8s; background: linear-gradient(145deg, #c084fc, #60a5fa); }
.confetti-piece:nth-child(4) { left: 72%; top: 14%; animation-delay: 1.2s; background: linear-gradient(145deg, #fbbf24, #f472b6); }
.confetti-piece:nth-child(5) { left: 8%;  top: 36%; animation-delay: 1.6s; background: linear-gradient(145deg, #22c55e, #a3e635); }
.confetti-piece:nth-child(6) { left: 40%; top: 32%; animation-delay: 2.0s; background: linear-gradient(145deg, #fb7185, #f472b6); }
.confetti-piece:nth-child(7) { left: 66%; top: 36%; animation-delay: 2.4s; background: linear-gradient(145deg, #2dd4bf, #38bdf8); }
.confetti-piece:nth-child(8) { left: 88%; top: 18%; animation-delay: 2.8s; background: linear-gradient(145deg, #f59e0b, #fbbf24); }

.hero-cloud {
  position: absolute;
  background: radial-gradient(circle at 40% 50%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.7) 60%, rgba(255, 255, 255, 0.12));
  filter: blur(0.6px);
  border-radius: 60px;
  opacity: 0.9;
  z-index: 0;
}
.hero-cloud::before,
.hero-cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}
.hero-cloud::before {
  width: 60%;
  height: 70%;
  top: -28%;
  left: 12%;
}
.hero-cloud::after {
  width: 50%;
  height: 60%;
  top: 10%;
  left: 46%;
}
.cloud-a { width: 180px; height: 66px; top: 12%; left: 6%; }
.cloud-b { width: 220px; height: 78px; top: 0%; right: 8%; }
.cloud-c { width: 190px; height: 72px; bottom: 6%; left: 18%; }
.cloud-d { width: 210px; height: 76px; bottom: 0%; right: 16%; }

.about-hero-figure {
  margin: 0 auto -1.6rem;
  width: 100%;
  max-width: 900px;
  display: grid;
  place-items: center;
  position: relative;
  z-index: 1;
}
.confetti-piece {
  animation-name: confettiFloat;
}
@keyframes confettiFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.95; }
  50% { transform: translateY(14px) rotate(16deg); opacity: 0.7; }
  100% { transform: translateY(-6px) rotate(-14deg); opacity: 0.9; }
}
.about-hero-img {
  display: block;
  width: min(90vw, 820px);
  height: auto;
  max-height: 340px;
  object-fit: contain;
  object-position: center;
}

.about-card {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 1.2rem 1.1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 0.4rem;
  height: 100%;
}

.about-card h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.about-card p,
.about-card ul,
.about-card ol {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  font-size: 1rem;
  padding-left: 1.1rem;
}

.about-inline-img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.about-card ul,
.about-card ol {
  display: grid;
  gap: 0.35rem;
}

.about-cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.about-btn {
  min-width: 220px;
  text-transform: uppercase;
}

@media (min-width: 640px) {
  .about-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .about-hero-img {
    width: min(90vw, 860px);
  }
}

@media (min-width: 1024px) {
  .about-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
