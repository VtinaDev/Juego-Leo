<template>
  <section id="sobre-el-juego" class="home-about" aria-labelledby="home-about-title">
    <div class="home-about__inner">
      <div class="home-about__content">
        <p class="home-about__eyebrow">Sobre el juego</p>
        <h2 id="home-about-title">Lectura guiada, amable y paso a paso.</h2>
        <p>
          Juego &amp; Leo acompaña los primeros pasos de lectura con ejercicios cortos,
          apoyo visual, voz infantil y refuerzo positivo para mantener la confianza.
        </p>

        <div class="home-about__points" aria-label="Características principales">
          <span>Sin presión</span>
          <span>Apoyo visual</span>
          <span>Progreso gradual</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-about {
  min-height: clamp(520px, 78vh, 760px);
  padding: clamp(3rem, 8vw, 5.5rem) 1rem;
  display: grid;
  place-items: center;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  scroll-margin-top: 5rem;
}

.home-about__inner {
  width: min(100%, 760px);
  margin: 0 auto;
}

.home-about__content {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.8rem;
  padding: clamp(1.3rem, 3vw, 2rem);
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.68);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.16);
  text-align: center;
  backdrop-filter: blur(14px) saturate(1.08);
}

.home-about__eyebrow {
  margin: 0;
  color: #166534;
  font-size: 0.76rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-about__content h2 {
  margin: 0;
  max-width: 680px;
  color: #173b61;
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 950;
  line-height: 1.08;
}

.home-about__content p:not(.home-about__eyebrow) {
  margin: 0 auto;
  max-width: 680px;
  color: #334155;
  font-size: 1rem;
  line-height: 1.55;
}

.home-about__points {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.home-about__points span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0.36rem 0.68rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #24571f;
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: 0 7px 14px rgba(22, 101, 52, 0.08);
}
</style>
