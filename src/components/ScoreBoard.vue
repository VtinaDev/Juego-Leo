<template>
  <div class="scoreboard">
    <div class="metric metric-star">
      <img class="metric-icon" src="/icons/star.PNG" alt="Estrellas" />
      <strong class="metric-value">{{ stars }}</strong>
    </div>
    <div class="metric metric-trophy">
      <img class="metric-icon" src="/icons/trophy.png" alt="Trofeo" />
      <strong class="metric-value">{{ points }}</strong>
    </div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  stars: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  label: { type: String, default: '' }
})
</script>

<style scoped>
.scoreboard {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-family: 'Baloo 2', 'Comic Sans MS', 'Segoe UI', sans-serif;
}
.metric {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.metric-icon {
  width: 28px;
  height: 28px;
  animation: pulse 1.8s ease-in-out infinite;
  object-fit: contain;
}
.metric-value {
  font-size: 1.5rem;
  color: #0f172a;
}
.label {
  font-size: 0.95rem;
  color: #475569;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.1) translateY(-2px);
  }
}
</style>
