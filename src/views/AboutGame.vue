<template>
  <section class="about-wrapper" aria-labelledby="about-title">
    <div class="about-inner">
      <div class="about-feature">
        <div class="about-header-card">
          <div class="about-visual-pane">
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
              <figure class="about-hero-figure">
                <img src="/images/about/about-tablet.png" alt="Niña usando una tablet para aprender en casa" class="about-hero-img" />
              </figure>
            </div>
          </div>

          <header class="about-header">
            <h1 id="about-title">¿De qué trata <br>Juego & Leo?</h1>
            <p class="about-lead">
              Juego &amp; Leo es una herramienta educativa digital, pensada para mentes neurodivergentes, con la finalidad de acompañar a niñas y niños en sus primeros pasos de lectura.
              Diseñamos cada actividad para que el aprendizaje sea amable, progresivo y con refuerzo positivo.
            </p>
            <RouterLink class="btn btn-primary about-btn" to="/subscribe">Prueba gratis 7 días</RouterLink>
          </header>
        </div>
      </div>

      <div class="about-details">
        <div class="about-grid">
          <div class="about-dialog">
            <div class="about-dialog-character" aria-hidden="true">
              <img :src="characterImages.fox" alt="" />
            </div>
            <article class="about-bubble full-card full-card-1">
              <h2>¿Qué es?</h2>
              <p>
                Una plataforma lúdica con rutas de ejercicios cortos. Combina texto, audio y apoyo visual para guiar al niño y
                reducir la frustración mientras aprende a leer.
              </p>
            </article>
          </div>

          <div class="about-dialog about-dialog--reverse">
            <div class="about-dialog-character" aria-hidden="true">
              <img :src="characterImages.bear" alt="" />
            </div>
            <article class="about-bubble audience-card">
              <h2>¿A quién acompaña?</h2>
              <ul>
                <li>Niños y niñas desde 4 años que inician lectura.</li>
                <li>Peques con dislexia, TDAH u otras dificultades de aprendizaje.</li>
                <li>Familias que buscan una práctica segura y guiada.</li>
              </ul>
            </article>
          </div>

          <div class="about-dialog">
            <div class="about-dialog-character" aria-hidden="true">
              <img :src="characterImages.monkey" alt="" />
            </div>
            <article class="about-bubble stacked-card stacked-card-1">
              <h2>Cómo funciona</h2>
              <ol>
                <li>Empieza con niveles básicos y avanza paso a paso.</li>
                <li>Repetimos con variaciones suaves para consolidar sin aburrir.</li>
                <li>Feedback positivo y errores mínimos para aumentar la confianza.</li>
              </ol>
            </article>
          </div>

          <div class="about-dialog about-dialog--reverse">
            <div class="about-dialog-character" aria-hidden="true">
              <img :src="ElephantCharacter" alt="" />
            </div>
            <article class="about-bubble stacked-card stacked-card-2">
              <h2>Metodología</h2>
              <ul>
                <li>Lectura silábica y fonética con apoyo auditivo.</li>
                <li>Comprensión lectora con frases e historias breves.</li>
                <li>Memoria visual y asociación con imágenes claras.</li>
                <li>Ejercicios graduados: palabras → frases → comprensión.</li>
              </ul>
            </article>
          </div>

          <div class="about-dialog">
            <div class="about-dialog-character" aria-hidden="true">
              <img :src="characterImages.sloth" alt="" />
            </div>
            <article class="about-bubble full-card full-card-2">
              <h2>Seguridad y bienestar</h2>
              <ul>
                <li>Sesiones cortas para evitar fatiga.</li>
                <li>Sin publicidad ni compras dentro de la app.</li>
                <li>Controles parentales y progreso local.</li>
              </ul>
            </article>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
const ElephantCharacter = '/images/characters/elephant.png'
const characterImages = {
  fox: '/images/characters/fox.png',
  bear: '/images/characters/bear.png',
  monkey: '/images/characters/monkey.png',
  sloth: '/images/characters/sloth.png'
}
</script>

<style scoped>
.about-wrapper {
  padding: 0 0 3rem;
  color: #0f172a;
  background: transparent;
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

.about-feature {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.about-header-card {
  background: #ffe572;
  border-radius: 22px;
  padding: 0;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
  z-index: 2;
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
}

.about-visual-pane {
  min-height: 260px;
  border-bottom: 1px dashed rgba(148, 116, 19, 0.28);
  background: #ffe572;
}

.about-header {
  text-align: left;
  display: grid;
  gap: 0.75rem;
  align-content: center;
  padding: 1.4rem 1.2rem;
}

.about-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
}

.about-lead {
  margin: 0;
  max-width: 880px;
  color: #475569;
  line-height: 1.6;
  font-size: 1.05rem;
}

.about-details {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.25rem 0;
  animation: tutorFadeIn 0.28s ease both;
}

.about-grid {
  display: grid;
  gap: 1.15rem;
  grid-template-columns: 1fr;
  padding-top: 1rem;
}

.about-dialog {
  display: grid;
  grid-template-columns: 106px minmax(0, 1fr);
  align-items: end;
}

.about-dialog--reverse {
  grid-template-columns: minmax(0, 1fr) 106px;
}

.about-dialog-character {
  width: 116px;
  height: 116px;
  display: grid;
  place-items: end center;
  z-index: 2;
  animation: tutorIdle 2.8s ease-in-out infinite;
}

.about-dialog-character img {
  width: 114px;
  height: 114px;
  object-fit: contain;
  filter: drop-shadow(0 12px 16px rgba(15, 23, 42, 0.18));
}

.about-dialog--reverse .about-dialog-character {
  grid-column: 2;
  grid-row: 1;
}

.about-hero-clouds {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
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

.about-hero-figure {
  margin: 0;
  width: 100%;
  height: 100%;
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
@keyframes tutorFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes tutorIdle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.about-hero-img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: none;
  min-height: 260px;
  object-fit: cover;
  object-position: center;
}

.about-bubble {
  position: relative;
  width: min(100%, 540px);
  min-height: 0;
  background: #ffffff;
  border: 2px solid rgba(14, 165, 233, 0.22);
  border-radius: 24px;
  padding: 0.75rem 0.72rem 0.7rem 0.78rem;
  margin-left: -8px;
  margin-right: auto;
  margin-bottom: 12px;
  box-shadow: 0 10px 0 rgba(14, 165, 233, 0.14), 0 16px 26px rgba(15, 23, 42, 0.1);
  display: grid;
  align-content: center;
  gap: 0.3rem;
  transform-origin: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.about-bubble:hover {
  transform: scale(1.025);
  box-shadow: 0 12px 0 rgba(14, 165, 233, 0.16), 0 20px 32px rgba(15, 23, 42, 0.14);
}

.about-dialog--reverse .about-bubble {
  grid-column: 1;
  grid-row: 1;
  margin-right: -8px;
  margin-left: auto;
}

.about-bubble::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 38px;
  width: 22px;
  height: 22px;
  background: #ffffff;
  border-left: 2px solid rgba(14, 165, 233, 0.22);
  border-bottom: 2px solid rgba(14, 165, 233, 0.22);
  transform: rotate(45deg);
}

.about-dialog--reverse .about-bubble::before {
  right: -12px;
  left: auto;
  border-right: 2px solid rgba(14, 165, 233, 0.22);
  border-left: 0;
}

.about-bubble h2 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 1.08rem;
  font-weight: 900;
  color: #0f172a;
}

.about-bubble p,
.about-bubble ul,
.about-bubble ol {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #334155;
  line-height: 1.55;
  font-size: 0.97rem;
  padding-left: 0.9rem;
}

.about-inline-img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.about-bubble ul,
.about-bubble ol {
  display: grid;
  gap: 0.35rem;
}

.about-btn {
  width: fit-content;
  min-width: 220px;
  text-transform: uppercase;
}

@media (min-width: 640px) {
  .about-hero-img {
    min-height: 320px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-details,
  .about-dialog-character {
    animation: none;
  }

  .about-bubble {
    transition: none;
  }

  .about-bubble:hover {
    transform: none;
  }
}

@media (min-width: 900px) {
  .about-header-card {
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  }

  .about-visual-pane {
    min-height: 380px;
    border-right: 1px dashed rgba(148, 116, 19, 0.28);
    border-bottom: 0;
  }

  .about-header {
    padding: 2rem;
  }

  .about-header h1 {
    font-size: 2.35rem;
  }

  .about-lead {
    font-size: 1.1rem;
  }

  .about-grid {
    gap: 1.35rem;
    padding-top: 1.5rem;
  }

  .about-dialog {
    grid-template-columns: 152px minmax(0, 1fr);
  }

  .about-dialog--reverse {
    grid-template-columns: minmax(0, 1fr) 152px;
  }

  .about-dialog-character {
    width: 166px;
    height: 166px;
  }

  .about-dialog-character img {
    width: 160px;
    height: 160px;
  }

  .about-bubble {
    width: min(100%, 500px);
    margin-left: -16px;
    margin-bottom: 24px;
    padding: 0.8rem 0.82rem 0.75rem 0.9rem;
  }

  .about-dialog--reverse .about-bubble {
    margin-right: -16px;
  }
}

</style>
