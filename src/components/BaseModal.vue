<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        class="modal-backdrop"
        role="presentation"
        @click.self="handleClose"
      >
        <div
          class="modal-sheet"
          role="dialog"
          :aria-label="ariaLabel"
          aria-modal="true"
          ref="panel"
          tabindex="0"
          @keydown.esc.prevent="handleClose"
        >
          <button type="button" class="modal-close" @click="handleClose" aria-label="Cerrar modal">×</button>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  ariaLabel: { type: String, default: 'Diálogo' }
})

const emit = defineEmits(['update:modelValue', 'close'])

const open = computed(() => props.modelValue)
const panel = ref(null)

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function trapFocus(e) {
  if (!open.value || !panel.value) return
  const focusable = panel.value.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])')
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      last.focus()
      e.preventDefault()
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus()
      e.preventDefault()
    }
  }
}

watch(open, (val) => {
  if (val) {
    requestAnimationFrame(() => panel.value?.focus())
    document.addEventListener('keydown', trapFocus)
  } else {
    document.removeEventListener('keydown', trapFocus)
  }
})

onMounted(() => {
  if (open.value) document.addEventListener('keydown', trapFocus)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', trapFocus)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  z-index: 50;
}
.modal-sheet {
  position: relative;
  background: #fff;
  color: #0f172a;
  border-radius: 18px;
  padding: 18px 20px 16px;
  min-width: min(90vw, 420px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.18);
  outline: none;
}
.modal-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #475569;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
