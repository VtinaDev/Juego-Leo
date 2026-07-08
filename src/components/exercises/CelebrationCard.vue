<template>
  <section class="celebration-card" role="status" aria-live="polite">
    <div class="celebration-card__character" aria-hidden="true">
      <img :src="characterImg" alt="" />
    </div>
    <div class="celebration-card__content">
      <div class="celebration-card__stars" aria-hidden="true">
        <img v-for="idx in 3" :key="idx" :src="ICONS.star" alt="" />
      </div>
      <p>{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
import { ICONS } from '../../constants/icons'

defineProps({
  characterImg: { type: String, required: true },
  message: { type: String, default: '¡Muy bien!' }
})
</script>

<style scoped>
.celebration-card {
  width: min(100%, 520px);
  margin: 0 auto 0.75rem;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
  border: 2px solid rgba(132, 204, 22, 0.3);
  box-shadow: 0 14px 24px rgba(34, 197, 94, 0.14);
  animation: celebrationEnter 0.34s ease both;
}
.celebration-card__character {
  width: 82px;
  height: 82px;
  display: grid;
  place-items: center;
}
.celebration-card__character img {
  width: 82px;
  height: 82px;
  object-fit: contain;
  filter: drop-shadow(0 9px 14px rgba(15, 23, 42, 0.16));
  animation: characterCelebrate 0.8s ease both;
}
.celebration-card__content {
  display: grid;
  gap: 0.2rem;
}
.celebration-card__stars {
  display: inline-flex;
  align-items: center;
  gap: 0.18rem;
}
.celebration-card__stars img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: drop-shadow(0 6px 10px rgba(249, 158, 11, 0.28));
}
.celebration-card p {
  margin: 0;
  color: #163300;
  font-size: clamp(1.25rem, 5vw, 1.75rem);
  font-weight: 950;
  line-height: 1.1;
}
@keyframes celebrationEnter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes characterCelebrate {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  45% {
    transform: rotate(-4deg) scale(1.08);
  }
  75% {
    transform: rotate(3deg) scale(1.04);
  }
}
@media (prefers-reduced-motion: reduce) {
  .celebration-card,
  .celebration-card__character img {
    animation: none;
  }
}
</style>
