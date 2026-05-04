<template>
  <section class="card learning-report" aria-labelledby="learning-report-title">
    <div class="section-head">
      <div>
        <p class="section-kicker">Informe pedagógico</p>
        <h2 id="learning-report-title">Lectura del progreso</h2>
      </div>
      <div class="report-pill">
        {{ hasInsights ? `${learningTotals.exercises} ejercicios` : 'Primeros pasos' }}
      </div>
    </div>

    <p class="report-intro">
      {{ introText }}
    </p>

    <div class="report-columns">
      <article>
        <h3>Fortalezas</h3>
        <ul class="insight-list">
          <li v-for="item in strongestItems" :key="`strong-${item.subtype}`">
            <strong>{{ item.label }}</strong>
            <span>{{ item.tone }}</span>
            <small>{{ item.detail }}</small>
          </li>
          <li v-if="!strongestItems.length" class="empty-insight">
            Empieza el primer ejercicio para descubrir las fortalezas del niño ✨
          </li>
        </ul>
      </article>

      <article>
        <h3>Próximo apoyo</h3>
        <ul class="insight-list">
          <li v-for="item in weakestItems" :key="`weak-${item.subtype}`">
            <strong>{{ item.label }}</strong>
            <span>{{ item.tone }}</span>
            <small>{{ item.detail }}</small>
          </li>
          <li v-if="!weakestItems.length" class="empty-insight">
            Cuando haya más sesiones, aquí aparecerán recomendaciones concretas.
          </li>
        </ul>
      </article>
    </div>

    <div v-if="reportShown" class="report-summary" aria-live="polite">
      <h3>Resumen para compartir</h3>
      <p><strong>Niñ@:</strong> {{ summary.childName || 'Sin nombre' }}</p>
      <p><strong>Nacimiento:</strong> {{ summary.birthdate || 'Sin fecha' }}</p>
      <p><strong>Progreso:</strong> {{ summary.stars }} estrellas · {{ summary.points }} puntos</p>
      <p><strong>Estado actual:</strong> {{ progressState.label }}</p>
      <p>
        <strong>Avance total:</strong> {{ progressState.completedStages }}/{{ progressState.totalStages }}
        etapas ({{ progressState.percent }}%)
      </p>
      <p><strong>Observación:</strong> {{ summary.observation }}</p>

      <div class="recent-levels">
        <p class="recent-levels__title">Niveles recientes</p>
        <ul>
          <li v-for="item in recentLevels" :key="item.levelId">
            <span>{{ item.levelName }}</span>
            <small>Etapa {{ item.progress.completedStages }}/{{ item.progress.totalStages }}</small>
          </li>
          <li v-if="!recentLevels.length">Aún no hay sesiones registradas.</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hasProgress: { type: Boolean, default: false },
  hasInsights: { type: Boolean, default: false },
  learningTotals: { type: Object, default: () => ({ accuracy: 0, exercises: 0 }) },
  strongestItems: { type: Array, default: () => [] },
  weakestItems: { type: Array, default: () => [] },
  reportShown: { type: Boolean, default: false },
  summary: { type: Object, default: () => ({}) },
  progressState: { type: Object, default: () => ({}) },
  recentLevels: { type: Array, default: () => [] }
})

const introText = computed(() => {
  if (!props.hasProgress) return 'Empieza el primer ejercicio para descubrir las fortalezas del niño ✨'
  if (!props.hasInsights) return 'Ya hay progreso guardado. Completa más ejercicios para afinar el informe.'
  const accuracy = Number(props.learningTotals.accuracy || 0)
  if (accuracy >= 0.85) return 'El desempeño muestra mucha seguridad. Conviene mantener desafíos breves y frecuentes.'
  if (accuracy >= 0.6) return 'Hay una base positiva. La ruta puede alternar práctica y pequeños retos.'
  return 'Está empezando su aprendizaje ✨ Lo más importante es sostener confianza y repetición amable.'
})
</script>

<style scoped>
.learning-report {
  display: grid;
  gap: 1rem;
}

.section-head {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.section-kicker {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #2f7d47;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  color: #0f172a;
  font-size: 1.55rem;
}

h3 {
  color: #1e293b;
  font-size: 1.1rem;
}

.report-pill {
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  background: #eef9e8;
  color: #2f7d47;
  font-weight: 800;
}

.report-intro {
  color: #475569;
  font-size: 1.08rem;
}

.report-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.report-columns article {
  display: grid;
  gap: 0.65rem;
}

.insight-list,
.recent-levels ul {
  list-style: none;
  display: grid;
  gap: 0.55rem;
  padding: 0;
  margin: 0;
}

.insight-list li,
.recent-levels li {
  display: grid;
  gap: 0.15rem;
  padding: 0.75rem 0.85rem;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.07);
}

.insight-list strong {
  color: #0f172a;
}

.insight-list span {
  color: #334155;
  font-weight: 700;
}

.insight-list small,
.recent-levels small {
  color: #64748b;
}

.empty-insight {
  color: #475569;
  font-weight: 700;
}

.report-summary {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  border-radius: 16px;
  background: #fffaf0;
  border: 1px solid rgba(212, 161, 67, 0.28);
}

.recent-levels {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.recent-levels__title {
  font-weight: 800;
  color: #0f172a;
}

@media (max-width: 760px) {
  .section-head,
  .report-columns {
    grid-template-columns: 1fr;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
