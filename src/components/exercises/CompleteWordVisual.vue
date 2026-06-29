<template>
  <section
    class="complete-word-visual"
    :class="{ 'complete-word-visual--speech-bubble': letterStyle === 'speech-bubble' }"
    aria-label="Completar palabra"
  >
    <div v-if="imageSrc" class="complete-word-visual__image-wrap">
      <img
        :src="imageSrc"
        :alt="imageAlt || targetWord || 'Ilustración'"
        class="complete-word-visual__image"
      />
    </div>

    <div class="complete-word-visual__slots" aria-label="Palabra incompleta">
      <button
        v-for="(slot, idx) in slots"
        :key="`slot-${idx}`"
        class="complete-word-visual__slot"
        :class="{
          'complete-word-visual__slot--blank': slot.type === 'blank',
          'complete-word-visual__slot--filled': slot.type === 'blank' && values[slot.blankIndex]
        }"
        type="button"
        :aria-label="slot.type === 'blank' ? 'Hueco de letra' : `Letra ${slot.char}`"
        disabled
      >
        {{ slot.type === 'blank' ? values[slot.blankIndex] || '' : slot.char }}
      </button>
    </div>

    <div class="complete-word-visual__letters" aria-label="Letras disponibles">
      <button
        v-for="(letter, idx) in letters"
        :key="`letter-${idx}-${letter}`"
        class="complete-word-visual__letter"
        :class="{ 'complete-word-visual__letter--square-yellow': letterStyle === 'square-yellow' }"
        type="button"
        @click="$emit('select-letter', letter)"
      >
        {{ letter }}
      </button>
    </div>

    <div class="complete-word-visual__actions">
      <button class="btn btn-primary" type="button" @click="$emit('submit')">
        Confirmar
      </button>
      <button class="btn btn-secondary" type="button" aria-label="Reiniciar letras" @click="$emit('reset')">
        Reiniciar
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  imageSrc: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  targetWord: { type: String, default: '' },
  slots: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  letters: { type: Array, default: () => [] },
  letterStyle: { type: String, default: 'default' }
})

defineEmits(['select-letter', 'submit', 'reset'])
</script>

<style scoped>
.complete-word-visual {
  width: min(100%, 760px);
  margin: 0 auto;
  display: grid;
  justify-items: center;
  gap: 0.7rem;
}
.complete-word-visual__image-wrap {
  width: min(100%, 230px);
  max-height: min(165px, 24vh);
  display: grid;
  place-items: center;
  overflow: hidden;
}
.complete-word-visual__image {
  width: 100%;
  max-height: min(165px, 24vh);
  object-fit: contain;
  border-radius: var(--square-image-radius, 25px);
  animation: wordImageFloat 2.4s ease-in-out infinite;
}
.complete-word-visual__slots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
  min-height: 76px;
}
.complete-word-visual__slot {
  width: clamp(58px, 14vw, 76px);
  height: clamp(64px, 15vw, 82px);
  display: grid;
  place-items: center;
  border: none;
  border-bottom: 8px solid #334155;
  border-radius: 18px 18px 12px 12px;
  background: #ffffff;
  color: #0f172a;
  font-size: clamp(2rem, 8vw, 3rem);
  line-height: 1;
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.1);
  opacity: 1;
}
.complete-word-visual__slot--blank {
  background: #eefcff;
  border-bottom-color: #0ea5e9;
}
.complete-word-visual__slot--filled {
  background: #fff7d6;
  border-bottom-color: #f59e0b;
  animation: letterPop 0.22s ease;
}
.complete-word-visual__letters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.65rem;
  padding: 0.75rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}
.complete-word-visual__letter {
  min-width: 70px;
  min-height: 70px;
  padding: 0.45rem 0.85rem;
  border: 2px solid #f9a8d4;
  border-radius: 999px;
  background: linear-gradient(180deg, #fce7f3 0%, #f9a8d4 100%);
  color: #4a044e;
  font-size: clamp(2rem, 8vw, 2.75rem);
  line-height: 1;
  font-weight: 950;
  text-transform: uppercase;
  box-shadow: 0 9px 0 #be5a95, 0 14px 22px rgba(190, 90, 149, 0.24);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.complete-word-visual__letter:hover {
  transform: translateY(-2px) scale(1.04);
}
.complete-word-visual__letter:active {
  transform: translateY(4px) scale(0.98);
  box-shadow: 0 4px 0 #be5a95, 0 8px 14px rgba(190, 90, 149, 0.22);
}
.complete-word-visual__letter--square-yellow {
  width: 74px;
  height: 74px;
  min-width: 74px;
  min-height: 74px;
  padding: 0;
  border-color: rgba(14, 165, 233, 0.22);
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 10px 0 rgba(14, 165, 233, 0.14), 0 16px 26px rgba(15, 23, 42, 0.1);
}
.complete-word-visual__letter--square-yellow:active {
  box-shadow: 0 5px 0 rgba(14, 165, 233, 0.14), 0 10px 18px rgba(15, 23, 42, 0.1);
}
.complete-word-visual--speech-bubble .complete-word-visual__slot,
.complete-word-visual--speech-bubble .complete-word-visual__letter {
  border: 2px solid rgba(14, 165, 233, 0.22);
  border-radius: 24px;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 10px 0 rgba(14, 165, 233, 0.14), 0 16px 26px rgba(15, 23, 42, 0.1);
}
.complete-word-visual--speech-bubble .complete-word-visual__slot--blank {
  background: #ffffff;
}
.complete-word-visual--speech-bubble .complete-word-visual__slot--filled {
  background: #fff7d6;
  border-color: rgba(245, 158, 11, 0.42);
}
.complete-word-visual--speech-bubble .complete-word-visual__letter:active {
  transform: translateY(4px) scale(0.98);
  box-shadow: 0 5px 0 rgba(14, 165, 233, 0.14), 0 10px 18px rgba(15, 23, 42, 0.1);
}
.complete-word-visual__actions {
  width: min(100%, 560px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  align-items: center;
}
@keyframes wordImageFloat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
  }
}
@keyframes letterPop {
  0% {
    transform: scale(0.86);
  }
  70% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .complete-word-visual__image,
  .complete-word-visual__slot--filled {
    animation: none;
  }
}
@media (max-width: 768px) {
  .complete-word-visual {
    gap: 0.65rem;
  }
  .complete-word-visual__image-wrap {
    width: min(100%, 190px);
    max-height: min(135px, 20vh);
  }
  .complete-word-visual__image {
    max-height: min(135px, 20vh);
  }
  .complete-word-visual__letter {
    min-width: 62px;
    min-height: 62px;
  }
  .complete-word-visual__actions {
    grid-template-columns: 1fr;
  }
}
</style>
