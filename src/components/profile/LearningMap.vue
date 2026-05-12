<template>
  <section class="card learning-map" aria-labelledby="learning-map-title">
    <div class="section-head">
      <div>
        <p class="section-kicker">Mapa personalizado</p>
        <h2 id="learning-map-title">Ruta de aprendizaje</h2>
      </div>
      <RouterLink class="btn btn-primary" :to="continueRoute">Continuar aprendizaje</RouterLink>
    </div>

    <p v-if="!hasProgress" class="map-empty">
      Empieza el primer ejercicio para descubrir las fortalezas del niño ✨
    </p>

    <ol class="level-track">
      <li
        v-for="item in timeline"
        :key="item.levelId"
        class="level-card"
        :class="{ 'level-card--current': item.levelId === currentLevelId }"
      >
        <div class="level-card__character" :style="{ '--level-color': item.color }">
          <img
            :src="characterForLevel(item.levelId).src"
            :alt="characterForLevel(item.levelId).alt"
            loading="lazy"
          />
        </div>
        <div class="level-card__body">
          <div class="level-card__head">
            <h3>{{ item.levelName }}</h3>
            <span>{{ Math.round(item.progress.percent * 100) }}%</span>
          </div>
          <div class="progress-bar" aria-hidden="true">
            <span :style="{ width: `${Math.round(item.progress.percent * 100)}%` }" />
          </div>
          <p>
            <strong v-if="item.levelId === currentLevelId">Etapa actual:</strong>
            <strong v-else>Avance:</strong>
            {{ item.progress.completedStages }}/{{ item.progress.totalStages }}
          </p>
          <small v-if="item.progress.lastStage">
            Última sesión: {{ formatDate(item.progress.lastStage.completedAt) }}
          </small>
          <div class="level-card__stages" aria-label="Etapas del nivel">
            <RouterLink
              v-for="stage in stageLinks(item)"
              :key="stage.id"
              class="stage-pill"
              :class="{
                'stage-pill--current': stage.current,
                'stage-pill--complete': stage.complete
              }"
              :to="stage.route"
            >
              <span>{{ stage.number }}</span>
              <strong>{{ stage.title }}</strong>
              <small>{{ stage.count }}</small>
            </RouterLink>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { getLevelDefinition } from '../../engine/logic/utils/validateTemplates'

defineProps({
  timeline: { type: Array, default: () => [] },
  currentLevelId: { type: Number, default: 1 },
  hasProgress: { type: Boolean, default: false },
  continueRoute: { type: String, default: '/mapview' },
  formatDate: { type: Function, default: (value) => value || 'Sin sesiones todavía' }
})

const levelCharacters = {
  1: { src: '/images/characters/sloth.png', alt: 'Oso perezoso del nivel 1' },
  2: { src: '/images/characters/fox.png', alt: 'Zorro del nivel 2' },
  3: { src: '/images/characters/bear.png', alt: 'Oso del nivel 3' },
  4: { src: '/images/characters/monkey.png', alt: 'Mono del nivel 4' },
  5: { src: '/images/characters/elephant.png', alt: 'Elefante del nivel 5' }
}

function characterForLevel(levelId) {
  return levelCharacters[Number(levelId)] || levelCharacters[1]
}

function stageLinks(item) {
  const def = getLevelDefinition(String(item?.levelId || 1))
  const subtypes = def?.subtypes || {}
  const order = Array.isArray(def?.order) && def.order.length ? def.order : Object.keys(subtypes)
  const completedStages = Number(item?.progress?.completedStages || 0)
  const nextStage = Number(item?.progress?.nextStage || 1)

  return order.map((subtype, index) => {
    const number = index + 1
    return {
      id: `${item.levelId}-${number}`,
      number,
      title: def?.stageMeta?.[subtype]?.title || formatSubtypeLabel(subtype),
      count: Array.isArray(subtypes[subtype]) ? subtypes[subtype].length : 0,
      route: `/game/${item.levelId}/${number}`,
      complete: completedStages >= number,
      current: nextStage === number
    }
  })
}

function formatSubtypeLabel(value) {
  return String(value || 'Ejercicios')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
</script>

<style scoped>
.learning-map {
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

.map-empty {
  color: #475569;
  font-size: 1.05rem;
  font-weight: 700;
}

.level-track {
  list-style: none;
  display: grid;
  gap: 0.8rem;
  padding: 0;
  margin: 0;
}

.level-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
  padding: 0.9rem;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.07);
}

.level-card--current {
  background: #fffaf0;
  border-color: rgba(212, 161, 67, 0.35);
  box-shadow: inset 4px 0 0 #f3c85d;
}

.level-card__character {
  width: 4.2rem;
  height: 4.2rem;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.2)),
    color-mix(in srgb, var(--level-color, #7fc86c) 34%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.level-card__character img {
  width: 92%;
  height: 92%;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 5px 7px rgba(15, 23, 42, 0.22));
}

.level-card__body {
  display: grid;
  gap: 0.35rem;
}

.level-card__head {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
}

.level-card__head h3 {
  color: #0f172a;
  font-size: 1.05rem;
}

.level-card__head span {
  color: #2f7d47;
  font-weight: 900;
}

.progress-bar {
  height: 0.65rem;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7fc86c, #f3c85d);
}

.level-card p,
.level-card small {
  color: #64748b;
}

.level-card__stages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.25rem, 1fr));
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.stage-pill {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.45rem;
  align-items: center;
  min-height: 42px;
  padding: 0.45rem 0.55rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: #ffffff;
  color: #1f2937;
  text-decoration: none;
}

.stage-pill span {
  width: 1.6rem;
  height: 1.6rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.78rem;
  font-weight: 900;
}

.stage-pill strong {
  overflow: hidden;
  color: #334155;
  font-size: 0.82rem;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-pill small {
  font-size: 0.75rem;
  font-weight: 900;
}

.stage-pill--current {
  border-color: rgba(47, 125, 71, 0.42);
  background: #ecfdf5;
}

.stage-pill--complete span {
  background: #bbf7d0;
  color: #166534;
}

@media (max-width: 760px) {
  .section-head {
    align-items: stretch;
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .level-card {
    grid-template-columns: 1fr;
  }

  .level-card__stages {
    grid-template-columns: 1fr;
  }

  .stage-pill strong {
    white-space: normal;
  }
}
</style>
