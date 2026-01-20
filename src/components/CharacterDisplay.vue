<template>
  <div class="flex items-center gap-3">
    <img
      :src="img"
      :alt="altText"
      class="w-24 h-24 object-contain select-none character-bounce"
      draggable="false"
    />
    <div>
      <p class="text-lg font-bold">{{ title }}</p>
      <p class="text-sm text-gray-600">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  img: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  alt: { type: String, default: '' }
})

const altText = computed(() => props.alt || props.title || 'Personaje')
</script>

<style scoped>
.character-bounce {
  animation: characterBounce 3s ease-in-out infinite;
}

@keyframes characterBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  55% {
    transform: translateY(0);
  }
  70% {
    transform: translateY(-6px);
  }
  85% {
    transform: translateY(0);
  }
}
</style>
