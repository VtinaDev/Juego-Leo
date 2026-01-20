<template>
  <div class="space-y-3">
    <p class="text-lg">{{ prompt }}</p>
    <canvas
      ref="cv"
      class="bg-white rounded-2xl border shadow-soft touch-none"
      :width="width"
      :height="height"
      role="img"
      aria-label="Lienzo de trazado"
    ></canvas>
    <div class="flex gap-3">
      <button class="btn" type="button" @click="reset">Borrar</button>
      <button class="btn btn-primary" type="button" @click="check">Continuar</button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  prompt: { type: String, default: 'Traza la letra siguiendo la guía' },
  width: { type: Number, default: 320 },
  height: { type: Number, default: 240 },
  minStroke: { type: Number, default: 400 }
})

const emit = defineEmits(['result'])

const cv = ref(null)
let ctx = null
let drawing = false
let lastPoint = null
let strokeLength = 0
const cleanupFns = []

function getRelativePoint(event) {
  const canvas = cv.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()

  if ('touches' in event && event.touches.length > 0) {
    const t = event.touches[0]
    return { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }

  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function startDrawing(event) {
  event.preventDefault()
  const point = getRelativePoint(event)
  if (!ctx || !point) return
  drawing = true
  lastPoint = point
}

function draw(event) {
  if (!drawing) return
  event.preventDefault()
  const point = getRelativePoint(event)
  if (!ctx || !point || !lastPoint) return

  ctx.beginPath()
  ctx.moveTo(lastPoint.x, lastPoint.y)
  ctx.lineTo(point.x, point.y)
  ctx.stroke()

  strokeLength += Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y)
  lastPoint = point
}

function stopDrawing(event) {
  if (event) event.preventDefault()
  drawing = false
  lastPoint = null
}

function reset() {
  if (!ctx || !cv.value) return
  ctx.clearRect(0, 0, cv.value.width, cv.value.height)
  strokeLength = 0
  emit('result', false)
}

function check() {
  emit('result', strokeLength >= props.minStroke)
}

function addListener(type, handler, options) {
  const canvas = cv.value
  if (!canvas) return
  canvas.addEventListener(type, handler, options)
  cleanupFns.push(() => canvas.removeEventListener(type, handler, options))
}

onMounted(() => {
  if (!cv.value) return

  ctx = cv.value.getContext('2d')
  if (!ctx) return

  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#60A5FA'

  addListener('pointerdown', startDrawing)
  addListener('pointermove', draw)
  addListener('pointerup', stopDrawing)
  addListener('pointerleave', stopDrawing)
  addListener('pointercancel', stopDrawing)
  addListener('touchstart', startDrawing, { passive: false })
  addListener('touchmove', draw, { passive: false })
  addListener('touchend', stopDrawing)
  addListener('touchcancel', stopDrawing)
})

onBeforeUnmount(() => {
  cleanupFns.forEach((fn) => fn())
  cleanupFns.length = 0
  ctx = null
})
</script>
