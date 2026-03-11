<template>
  <div class="store-badges" :class="layoutClass">
    <button
      type="button"
      class="badge"
      aria-label="Disponible en Google Play"
      @click="emit('show-demo', 'Google Play')"
    >
      <div class="badge-icon badge-icon--google" aria-hidden="true">
        <svg viewBox="0 0 512 512" role="img" class="google">
          <path fill="#4285F4" d="M96 52c-14 8-24 24-24 42v324c0 18 10 34 24 42l190-204z" />
          <path fill="#34A853" d="m286 256 84 90 66-37c16-9 16-33 0-42z" />
          <path fill="#FBBC04" d="m286 256 84-90 66 37c16 9 16 33 0 42z" />
          <path fill="#1A73E8" d="M96 52c4-2 8-4 13-4 6 0 13 2 18 5l233 128-74 75z" />
          <path fill="#EA4335" d="M115 455c-5 3-12 5-18 5-5 0-9-1-13-3l190-201 74 75z" />
        </svg>
      </div>
      <div class="badge-text">
        <span class="badge-kicker">DISPONIBLE EN</span>
        <span class="badge-title">Google Play</span>
      </div>
    </button>

    <button
      type="button"
      class="badge"
      aria-label="Consíguelo en App Store"
      @click="emit('show-demo', 'App Store')"
    >
      <div class="badge-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img" class="apple">
          <path
            fill="currentColor"
            d="M19.67 13.34c-.03-3.24 2.65-4.79 2.77-4.87-1.51-2.2-3.85-2.5-4.68-2.54-1.99-.2-3.89 1.18-4.9 1.18-.99 0-2.56-1.15-4.21-1.12-2.17.03-4.17 1.26-5.29 3.19-2.26 3.93-.58 9.72 1.61 12.9 1.06 1.53 2.32 3.24 3.98 3.18 1.6-.07 2.2-1.03 4.12-1.03 1.92 0 2.46 1.03 4.11 1 1.7-.03 2.77-1.56 3.82-3.1 1.2-1.75 1.69-3.45 1.72-3.54-.04-.02-3.29-1.26-3.33-5.35zM16.66 4.57c.86-1.05 1.44-2.5 1.28-3.97-1.24.05-2.74.83-3.63 1.88-.8.94-1.49 2.44-1.31 3.87 1.38.11 2.8-.7 3.66-1.78z"
          />
        </svg>
      </div>
      <div class="badge-text">
        <span class="badge-kicker">Consíguelo en</span>
        <span class="badge-title">App Store</span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'home' }
})

const emit = defineEmits(['show-demo'])

const layoutClass = computed(() => ({
  'store-badges--home': props.variant === 'home'
}))
</script>

<style scoped>
.store-badges {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.store-badges--home {
  justify-content: center;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #0b0b0b;
  color: #fff;
  padding: 10px 14px;
  border-radius: 14px;
  min-height: 48px;
  min-width: 172px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.badge:focus-visible {
  outline: 2px solid #22c55e;
  outline-offset: 3px;
}
.badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.22);
  filter: brightness(1.05);
}
.badge:active {
  transform: scale(0.98);
}
.badge-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 2px;
}
.badge-icon svg {
  width: 26px;
  height: 26px;
  display: block;
  shape-rendering: geometricPrecision;
  overflow: visible;
}
.badge-icon--google {
  background: transparent;
  border-radius: 0;
  padding: 0;
}
.badge-icon svg.apple {
  width: 22px;
  height: 22px;
}
.badge-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  text-align: left;
}
.badge-kicker {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e5e7eb;
}
.badge-title {
  font-size: 15px;
  font-weight: 700;
}
@media (max-width: 640px) {
  .store-badges {
    flex-direction: column;
  }
  .badge {
    width: 100%;
    justify-content: center;
  }
}
</style>
