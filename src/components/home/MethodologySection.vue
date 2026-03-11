<template>
  <section class="methodology-section" aria-labelledby="methodology-title">
    <div class="methodology-inner">
      <header class="methodology-header">
        <h2 id="methodology-title">¿Cómo aprende tu hijo en Juego &amp; Leo?</h2>
        <p class="methodology-subtitle">
          Una metodología diseñada para respetar el ritmo de cada niño y reducir la frustración al aprender a leer.
        </p>
      </header>

      <div class="methodology-grid" role="list">
        <article v-for="item in items" :key="item.title" class="methodology-card" role="listitem">
          <div class="methodology-icon" aria-hidden="true">{{ item.icon }}</div>
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
const items = [
  {
    icon: '🧠',
    title: 'Aprendizaje con calma',
    text: 'Ejercicios cortos y claros que evitan la sobrecarga y la fatiga cognitiva.'
  },
  {
    icon: '🔁',
    title: 'Repetición que da seguridad',
    text: 'Repetimos las actividades con pequeñas variaciones para reforzar sin aburrir.'
  },
  {
    icon: '🎯',
    title: 'Error mínimo, más confianza',
    text: 'El juego guía al niño para reducir errores y aumentar la sensación de logro.'
  },
  {
    icon: '🧩',
    title: 'Lectura paso a paso',
    text: 'Desde palabras simples hasta frases y comprensión lectora, sin saltos bruscos.'
  },
  {
    icon: '🔊',
    title: 'Apoyo visual y auditivo',
    text: 'Imágenes claras y opción de audio para facilitar la comprensión y la atención.'
  }
]
</script>

<style scoped>
.methodology-section {
  margin-top: 2.5rem;
}

.methodology-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.methodology-header h2 {
  font-size: 1.9rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.methodology-subtitle {
  margin: 0.5rem auto 1.5rem;
  max-width: 820px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.55;
}

.methodology-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.methodology-card {
  background: #f8f7e8;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  padding: 1.1rem 1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.methodology-icon {
  font-size: 1.8rem;
  line-height: 1;
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

@media (min-width: 640px) {
  .methodology-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
</style>
