<template>
<div class="space-y-3">
<label class="block text-lg">{{ prompt }}</label>
<input
v-model="text"
type="text"
class="w-full px-4 py-3 border rounded-2xl"
:placeholder="placeholder"
@keyup.enter="check"
/>
<div class="flex gap-3">
<button class="btn" type="button" @click="clear">Borrar</button>
<button class="btn btn-primary" type="button" @click="check">Continuar</button>
</div>
</div>
</template>


<script setup>
import { ref } from 'vue'
const props = defineProps({
prompt: { type: String, default: 'Escribe la palabra que falta' },
answer: { type: String, required: true },
placeholder: { type: String, default: 'Escribe aquí' }
})
const emit = defineEmits(['result'])
const text = ref('')
function check() { emit('result', text.value.trim().toLowerCase() === props.answer.trim().toLowerCase()) }
function clear() { text.value = '' }
</script>
