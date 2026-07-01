<template>
  <div class="level-station" :class="{ 'is-locked': locked }">
    <div class="level-station__head">
      <div>
        <span class="level-station__number">Nivel {{ levelNumber }}</span>
        <h3>{{ title }}</h3>
      </div>
      <span v-if="locked" class="level-station__lock" aria-label="Nivel bloqueado">Bloqueado</span>
    </div>

    <p class="level-station__description">{{ description }}</p>

    <button class="level-station__btn" :disabled="locked" type="button" @click="$emit('enter')">
      {{ locked ? 'Bloqueado' : '¡Vamos!' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  stars: { type: Number, default: 0 },
  locked: { type: Boolean, default: false },
  levelNumber: { type: Number, default: 1 },
  progressLabel: { type: String, default: '0/1 etapas' },
  stageCount: { type: Number, default: 1 }
})

defineEmits(['enter'])
</script>

<style scoped>
.level-station {
  display: grid;
  gap: 0.36rem;
}

.level-station__head {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  align-items: flex-start;
}

.level-station__number {
  display: inline-flex;
  margin-bottom: 0.12rem;
  color: #166534;
  font-size: 0.66rem;
  font-weight: 900;
  text-transform: uppercase;
}

.level-station__head h3 {
  margin: 0;
  font-size: clamp(0.92rem, 2.1vw, 1.08rem);
  color: #123524;
  line-height: 1.18;
}

.level-station__lock {
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  background: #e2e8f0;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  white-space: nowrap;
}

.level-station__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin: 0;
  color: #3f5f4a;
  font-size: 0.82rem;
  line-height: 1.28;
}

.level-station__btn {
  margin-top: 0.12rem;
  border: none;
  border-radius: 10px;
  min-height: 36px;
  font-weight: 800;
  font-size: 0.88rem;
  color: #1f3d0d;
  background: #92c237;
  box-shadow: 0 8px 14px rgba(132, 204, 22, 0.24);
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.level-station__btn:hover:enabled,
.level-station__btn:focus-visible:enabled {
  transform: translateY(-2px);
  filter: brightness(1.03);
  box-shadow: 0 12px 18px rgba(132, 204, 22, 0.32);
}

.level-station__btn:disabled {
  background: linear-gradient(160deg, #cbd5e1 0%, #94a3b8 100%);
  box-shadow: none;
  cursor: not-allowed;
  color: #1e293b;
}
</style>
