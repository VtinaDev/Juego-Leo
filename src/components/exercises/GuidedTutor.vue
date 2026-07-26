<template>
  <section v-if="step" class="guided-tutor-card" :class="stepClass">
    <div class="guided-tutor-card__character" aria-hidden="true">
      <img :src="characterImg" alt="" />
    </div>
    <div class="guided-tutor-card__bubble" role="status" aria-live="polite">
      <button
        class="guided-tutor-card__audio"
        type="button"
        :aria-label="`Repetir: ${message}`"
        @click="$emit('play')"
      >
        <img :src="ICONS.audio" alt="" aria-hidden="true" />
      </button>
      <span class="guided-tutor-card__message">{{ message }}</span>
      <div v-if="safeConceptItems.length" class="guided-tutor-card__concepts" aria-label="Mini lección visual">
        <span
          v-for="item in safeConceptItems"
          :key="item.label"
          class="guided-tutor-card__concept"
          :class="`guided-tutor-card__concept--${item.tone || 'sky'}`"
        >
          <span aria-hidden="true">{{ item.icon }}</span>
          <strong>{{ item.label }}</strong>
          <small v-if="item.note">{{ item.note }}</small>
        </span>
      </div>
      <div class="guided-tutor-card__dots" aria-hidden="true">
        <span
          v-for="(_, stepIdx) in steps"
          :key="`tutor-step-${stepIdx}`"
          :class="{ active: stepIdx === stepIndex }"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { ICONS } from '../../constants/icons'

const props = defineProps({
  characterImg: { type: String, required: true },
  step: { type: Object, default: null },
  steps: { type: Array, default: () => [] },
  stepIndex: { type: Number, default: 0 },
  conceptItems: { type: Array, default: () => [] }
})

defineEmits(['play'])

const message = computed(() => props.step?.message || props.step?.label || '')
const safeConceptItems = computed(() => Array.isArray(props.conceptItems) ? props.conceptItems : [])
const stepClass = computed(() => {
  const key = String(props.step?.key || 'default').replace(/[^a-z0-9_-]/gi, '')
  return `guided-tutor-card--${key || 'default'}`
})
</script>

<style scoped>
.guided-tutor-card {
  width: min(100%, 760px);
  margin: 0 auto 0.35rem;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: end;
  gap: 0;
  animation: tutorFadeIn 0.28s ease both;
}
.guided-tutor-card__character {
  width: 124px;
  height: 124px;
  display: grid;
  place-items: end center;
  background: transparent;
  z-index: 2;
  animation: tutorIdle 2.8s ease-in-out infinite;
}
.guided-tutor-card__character img {
  width: 118px;
  height: 118px;
  object-fit: contain;
  filter: drop-shadow(0 12px 16px rgba(15, 23, 42, 0.18));
}
.guided-tutor-card__bubble {
  position: relative;
  min-height: 94px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 0.65rem;
  margin-left: -10px;
  margin-bottom: 18px;
  padding: 0.8rem 0.95rem 0.52rem 1.35rem;
  border-radius: 24px;
  background: #ffffff;
  border: 2px solid rgba(14, 165, 233, 0.22);
  box-shadow: 0 10px 0 rgba(14, 165, 233, 0.14), 0 16px 26px rgba(15, 23, 42, 0.1);
}
.guided-tutor-card__bubble::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 38px;
  width: 22px;
  height: 22px;
  background: #ffffff;
  border-left: 2px solid rgba(14, 165, 233, 0.22);
  border-bottom: 2px solid rgba(14, 165, 233, 0.22);
  transform: rotate(45deg);
}
.guided-tutor-card__audio {
  position: relative;
  z-index: 1;
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 16px;
  background: #fff7d6;
  box-shadow: 0 10px 18px rgba(245, 158, 11, 0.2);
  animation: tutorAudioPulse 1.9s ease-in-out infinite;
}
.guided-tutor-card__audio img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.guided-tutor-card__message {
  white-space: pre-line;
  min-width: 0;
  position: relative;
  z-index: 1;
  color: #0f172a;
  font-size: clamp(1.45rem, 5.6vw, 2.15rem);
  font-weight: 900;
  line-height: 1.08;
  text-wrap: balance;
  overflow-wrap: anywhere;
  word-break: normal;
}
.guided-tutor-card--act .guided-tutor-card__message {
  font-size: clamp(1.2rem, 4.4vw, 1.72rem);
  line-height: 1.16;
}
.guided-tutor-card__concepts {
  grid-column: 1 / -1;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
  margin-top: 0.72rem;
}
.guided-tutor-card__concept {
  min-width: 0;
  display: grid;
  justify-items: center;
  gap: 0.1rem;
  padding: 0.46rem 0.42rem;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid rgba(14, 165, 233, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
  text-align: center;
}
.guided-tutor-card__concept > span {
  color: var(--concept-accent, #0f766e);
  font-size: clamp(0.78rem, 3.3vw, 0.95rem);
  font-weight: 950;
  line-height: 1;
}
.guided-tutor-card__concept strong {
  color: var(--concept-title, #0f172a);
  font-size: clamp(0.84rem, 3.7vw, 1.02rem);
  line-height: 1;
}
.guided-tutor-card__concept small {
  color: var(--concept-note, #64748b);
  font-size: clamp(0.68rem, 3vw, 0.8rem);
  font-weight: 800;
  line-height: 1.05;
}
.guided-tutor-card__concept--amber {
  --concept-accent: #ea580c;
  --concept-title: #b45309;
  --concept-note: #c2410c;
  background: #fff7ed;
  border-color: rgba(251, 146, 60, 0.36);
}
.guided-tutor-card__concept--green {
  --concept-accent: #16a34a;
  --concept-title: #15803d;
  --concept-note: #0f766e;
  background: #f0fdf4;
  border-color: rgba(34, 197, 94, 0.34);
}
.guided-tutor-card__concept--blue {
  --concept-accent: #0284c7;
  --concept-title: #2563eb;
  --concept-note: #0891b2;
  background: #eff6ff;
  border-color: rgba(56, 189, 248, 0.34);
}
.guided-tutor-card__dots {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-top: 0.45rem;
}
.guided-tutor-card__dots span {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #cbd5e1;
}
.guided-tutor-card__dots span.active {
  width: 24px;
  background: #38bdf8;
}
@keyframes tutorFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes tutorIdle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
@keyframes tutorAudioPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.07);
  }
}
@media (prefers-reduced-motion: reduce) {
  .guided-tutor-card,
  .guided-tutor-card__character,
  .guided-tutor-card__audio {
    animation: none;
  }
}
@media (max-width: 768px) {
  .guided-tutor-card {
    grid-template-columns: 82px minmax(0, 1fr);
    width: 100%;
  }
  .guided-tutor-card__character,
  .guided-tutor-card__character img {
    width: 90px;
    height: 90px;
  }
  .guided-tutor-card__bubble {
    min-height: 74px;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    margin-left: -6px;
    margin-bottom: 10px;
    padding: 0.62rem 0.66rem 0.42rem 1rem;
    border-radius: 18px;
  }
  .guided-tutor-card__message {
    min-width: 0;
    font-size: clamp(1.18rem, 6vw, 1.65rem);
    overflow-wrap: anywhere;
  }
  .guided-tutor-card--act .guided-tutor-card__message {
    font-size: clamp(1.02rem, 5vw, 1.35rem);
    line-height: 1.18;
  }
  .guided-tutor-card__audio {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(245, 158, 11, 0.16);
  }
  .guided-tutor-card__audio img {
    width: 28px;
    height: 28px;
  }
  .guided-tutor-card__concepts {
    gap: 0.32rem;
    margin-top: 0.6rem;
  }
  .guided-tutor-card__concept {
    padding: 0.4rem 0.24rem;
    border-radius: 14px;
  }
}
</style>
