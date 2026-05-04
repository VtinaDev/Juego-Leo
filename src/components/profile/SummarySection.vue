<template>
  <section class="summary-grid" aria-label="Resumen de aprendizaje">
    <article class="summary-card summary-card--primary">
      <p class="summary-label">Próximo paso</p>
      <h2 v-if="hasProgress && currentLevel">
        {{ currentLevel.levelName }}
      </h2>
      <h2 v-else>Primera aventura</h2>
      <p class="summary-text">
        <template v-if="hasProgress && currentLevel">
          Etapa {{ currentLevel.progress.nextStage }} de {{ currentLevel.progress.totalStages }}.
        </template>
        <template v-else>
          Empieza el primer ejercicio para descubrir las fortalezas del niño ✨
        </template>
      </p>
      <RouterLink class="btn btn-primary" :to="continueRoute">Continuar aprendizaje</RouterLink>
    </article>

    <article class="summary-card">
      <p class="summary-label">Logros</p>
      <div class="metric-row">
        <div class="metric">
          <strong>{{ stars }}</strong>
          <span>estrellas</span>
        </div>
        <div class="metric">
          <strong>{{ points }}</strong>
          <span>puntos</span>
        </div>
      </div>
      <p class="summary-text">
        {{ hasProgress ? 'Cada sesión suma evidencia para adaptar la ruta.' : 'Los logros aparecerán cuando complete ejercicios.' }}
      </p>
    </article>
  </section>
</template>

<script setup>
defineProps({
  stars: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  currentLevel: { type: Object, default: null },
  hasProgress: { type: Boolean, default: false },
  continueRoute: { type: String, default: '/mapview' }
})
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  gap: 1rem;
}

.summary-card {
  display: grid;
  align-content: start;
  gap: 0.8rem;
  padding: clamp(1rem, 3vw, 1.35rem);
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07);
}

.summary-card--primary {
  background: linear-gradient(135deg, #f8fafc, #eef9e8);
}

.summary-label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #2f7d47;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.65rem;
}

.summary-text {
  margin: 0;
  color: #475569;
  font-size: 1.05rem;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.metric {
  min-height: 104px;
  display: grid;
  place-items: center;
  gap: 0.2rem;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-align: center;
}

.metric strong {
  color: #13210f;
  font-size: 2.2rem;
  line-height: 1;
}

.metric span {
  color: #64748b;
  font-weight: 800;
}

@media (max-width: 760px) {
  .summary-grid,
  .metric-row {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
  }
}
</style>
