<template>
  <section class="exercise-layout" :aria-label="ariaLabel">
    <header class="exercise-layout__header">
      <slot name="header" />
    </header>

    <div class="exercise-layout__media" v-if="$slots.media">
      <slot name="media" />
    </div>

    <div class="exercise-layout__prompt">
      <slot name="prompt" />
    </div>

    <div class="exercise-layout__content">
      <slot />
    </div>

    <footer class="exercise-layout__footer" v-if="$slots.footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup>
defineProps({
  ariaLabel: {
    type: String,
    default: 'Exercise layout'
  }
})
</script>

<style scoped>
.exercise-layout {
  width: min(100%, 880px);
  margin: 0 auto;
  padding: 1.15rem;
  border-radius: 18px;
  border: 1px solid #d6e0ea;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 1.1rem;
  font-family: var(--font-readable, 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif);
}

.exercise-layout__header,
.exercise-layout__footer {
  display: flex;
  justify-content: center;
}

.exercise-layout__media {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  border-radius: 12px;
  background: #f8fafc;
  padding: 0.4rem;
}

.exercise-layout__prompt {
  display: flex;
  justify-content: center;
}

.exercise-layout__content {
  display: grid;
  gap: 1rem;
}

@media (max-width: 640px) {
  .exercise-layout {
    padding: 0.8rem;
    border-radius: 12px;
  }

  .exercise-layout__media {
    min-height: 140px;
  }
}
</style>
