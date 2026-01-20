<template>
  <dialog ref="dlg" class="p-0 rounded-2xl w-full max-w-md" aria-modal="true" @cancel.prevent="close">
    <div class="card">
      <h3 class="text-xl font-bold mb-2">Necesitas suscripción</h3>
      <p class="mb-4">Activa la prueba de 7 días o suscríbete para desbloquear este nivel.</p>
      <div class="flex gap-2">
        <RouterLink to="/subscribe" class="btn btn-primary" @click="close">Ver planes</RouterLink>
        <button class="btn" type="button" @click="close">Cerrar</button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref } from 'vue'

const dlg = ref(null)

function open() {
  dlg.value?.showModal()
}

function close() {
  dlg.value?.close()
}

defineExpose({ open, close })
</script>
