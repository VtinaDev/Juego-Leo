<template>
<p class="text-2xl md:text-3xl leading-relaxed">
<span v-for="(s, i) in parts" :key="i" :class="i === highlight ? 'bg-amarillo rounded px-1' : ''">{{ s }}</span>
</p>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
text: { type: String, required: true }, // usar guiones para separar sílabas: "ca-sa"
highlight: { type: Number, default: -1 }
})
const parts = computed(() => props.text.split('-'))
</script>
