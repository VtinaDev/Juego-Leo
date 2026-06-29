<template>
  <figure
    class="optimized-image"
    :class="{ 'optimized-image--failed': failed || !src }"
    :style="frameStyle"
  >
    <picture v-if="src && !failed" class="optimized-image__picture">
      <source v-if="webpSrc" :srcset="webpSrc" type="image/webp" />
      <img
        :src="src"
        :alt="alt"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'auto'"
        decoding="async"
        class="optimized-image__img"
        :style="{ objectFit }"
        @error="failed = true"
        @load="loaded = true"
      />
    </picture>
    <figcaption v-else class="optimized-image__fallback">
      <span class="optimized-image__fallback-icon" aria-hidden="true"></span>
      <span>{{ fallbackLabel }}</span>
    </figcaption>
  </figure>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fallbackLabel: { type: String, default: 'Imagen no disponible' },
  aspectRatio: { type: String, default: '4 / 3' },
  objectFit: { type: String, default: 'contain' },
  eager: { type: Boolean, default: false }
})

const failed = ref(false)
const loaded = ref(false)

const frameStyle = computed(() => ({
  aspectRatio: props.aspectRatio
}))

const webpSrc = computed(() => {
  const raw = String(props.src || '').trim()
  if (!raw.startsWith('/images/')) return ''
  if (!/\.(png|jpe?g)$/i.test(raw)) return ''
  return raw.replace(/^\/images\//, '/images-optimized/').replace(/\.(png|jpe?g)$/i, '.webp')
})

watch(
  () => props.src,
  () => {
    failed.value = false
    loaded.value = false
  }
)
</script>

<style scoped>
.optimized-image {
  width: 100%;
  max-width: 100%;
  margin: 0;
  display: grid;
  place-items: center;
  overflow: visible;
  background: transparent;
  box-sizing: border-box;
  border-radius: var(--square-image-radius, 25px);
}

.optimized-image *,
.optimized-image *::before,
.optimized-image *::after {
  box-sizing: border-box;
}

.optimized-image__picture {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: inherit;
}

.optimized-image__img {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: block;
  object-position: center;
  border-radius: inherit;
}

.optimized-image__fallback {
  width: 100%;
  min-height: 100%;
  display: grid;
  place-items: center;
  gap: 0.45rem;
  padding: 1rem;
  color: var(--color-text-muted, #64748b);
  font-family: var(--font-readable, 'Lexend', 'Segoe UI', sans-serif);
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  border-radius: var(--square-image-radius, 25px);
  background: var(--surface-soft, #f8fafc);
}

.optimized-image__fallback-icon {
  width: 38px;
  height: 30px;
  border: 3px solid currentColor;
  border-radius: 8px;
  position: relative;
  opacity: 0.58;
}

.optimized-image__fallback-icon::before {
  content: '';
  position: absolute;
  left: 6px;
  bottom: 5px;
  width: 20px;
  height: 14px;
  border-radius: 5px 5px 0 0;
  background: currentColor;
  clip-path: polygon(0 100%, 38% 35%, 58% 62%, 76% 28%, 100% 100%);
}

.optimized-image__fallback-icon::after {
  content: '';
  position: absolute;
  right: 6px;
  top: 5px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}
</style>
