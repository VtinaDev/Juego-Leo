<template>
  <section class="benefits" aria-labelledby="benefits-title">
    <div class="benefits-inner">
      <div class="benefits-card-banner">
        <h2 id="benefits-title">Aprender a leer puede ser tranquilo.</h2>
        <p class="banner-sub">
          Sesiones cortas, guiadas y sin presión, pensadas para el ritmo de cada niño.
        </p>
      </div>

      <div class="benefits-grid" role="list">
        <article class="benefit-card" role="listitem">
          <span class="benefit-icon" aria-hidden="true">🧘</span>
          <h3>Sin presión</h3>
          <p>Sin tiempo límite, sin comparaciones y con reintentos suaves.</p>
        </article>

        <article class="benefit-card" role="listitem">
          <span class="benefit-icon" aria-hidden="true">⏱️</span>
          <h3>10–15 minutos</h3>
          <p>Sesiones breves para evitar fatiga y mantener la atención.</p>
        </article>

        <article class="benefit-card" role="listitem">
          <span class="benefit-icon" aria-hidden="true">🧩</span>
          <h3>Paso a paso</h3>
          <p>Progresión gradual: letras, sílabas, palabras y comprensión.</p>
        </article>
      </div>

    </div>
  </section>
</template>

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
  background: linear-gradient(135deg, #d9f3e6, #cdeff2);
  border-radius: 20px;
  padding: clamp(1.2rem, 3vw, 1.8rem);
  text-align: center;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

.benefits-card-banner h2 {
  margin: 0;
  font-weight: 900;
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
  color: #0f172a;
}

.banner-sub {
  margin: 0.35rem auto 0;
  color: #334155;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 720px;
}

.benefits-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.benefit-card {
  background: #f9fbf7;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 1.1rem 1rem;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 0.4rem;
  text-align: left;
}

.benefit-icon {
  font-size: 2rem;
  line-height: 1;
  display: inline-block;
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
</style>
