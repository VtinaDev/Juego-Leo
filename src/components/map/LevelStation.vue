<template>
  <div class="level-station" :class="{ 'is-locked': locked }">
    <div class="level-station__head">
      <h3>{{ title }}</h3>
      <span v-if="locked" class="level-station__lock" aria-label="Nivel bloqueado">🔒 Bloqueado</span>
      <span v-else class="level-station__status">Disponible</span>
    </div>

    <p class="level-station__description">{{ description }}</p>

    <div class="level-station__stars" :aria-label="`Progreso de ${stars} de 3 estrellas`">
      <span
        v-for="idx in 3"
        :key="idx"
        class="star"
        :class="{ 'star--filled': idx <= stars }"
        aria-hidden="true"
      >
        ★
      </span>
    </div>

    <button class="level-station__btn" :disabled="locked" type="button" @click="$emit('enter')">
      {{ locked ? 'Bloqueado' : 'Entrar' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  stars: { type: Number, default: 0 },
  locked: { type: Boolean, default: false }
})

defineEmits(['enter'])
</script>

<style scoped>
.level-station {
  display: grid;
  gap: 0.55rem;
}

.level-station__head {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  align-items: flex-start;
}

.level-station__head h3 {
  margin: 0;
  font-size: clamp(1rem, 2.3vw, 1.2rem);
  color: #163d66;
  line-height: 1.18;
}

.level-station__status {
  font-size: 0.75rem;
  font-weight: 800;
  color: #0f766e;
  background: #ccfbf1;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  white-space: nowrap;
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
  margin: 0;
  color: #2b587d;
  font-size: 0.92rem;
  line-height: 1.35;
}

.level-station__stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 1rem;
  color: #cbd5e1;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
}

.star--filled {
  color: #f59e0b;
}

.level-station__btn {
  margin-top: 0.2rem;
  border: none;
  border-radius: 12px;
  min-height: 40px;
  font-weight: 800;
  font-size: 0.94rem;
  color: #fff;
  background: linear-gradient(160deg, #bcef86 0%, #74c522 52%, #15803d 100%);
  box-shadow: 0 8px 14px rgba(132, 197, 34, 0.32);
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.level-station__btn:hover:enabled,
.level-station__btn:focus-visible:enabled {
  transform: translateY(-2px);
  filter: brightness(1.04);
  box-shadow: 0 12px 18px rgba(126, 197, 34, 0.4);
}

.level-station__btn:disabled {
  background: linear-gradient(160deg, #cbd5e1 0%, #94a3b8 100%);
  box-shadow: none;
  cursor: not-allowed;
  color: #1e293b;
}
</style>
