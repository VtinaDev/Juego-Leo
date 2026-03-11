<template>
  <div class="flex items-center gap-3" :aria-label="ariaLabel">
    <button
      class="btn btn-primary"
      type="button"
      @click="toggle"
      :aria-pressed="playing"
      :aria-label="playing ? 'Pausar audio' : 'Reproducir audio'"
    >
      {{ playing ? 'Pausa' : 'Escuchar' }}
    </button>
    <div v-if="duration > 0" class="text-sm" aria-live="polite">
      {{ time }} / {{ total }}
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Howl } from 'howler'

const props = defineProps({
  src: { type: String, required: true },
  rate: { type: Number, default: 1 },
  autoplay: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Reproductor de audio' }
})

const emit = defineEmits(['play', 'pause', 'ended', 'progress'])

const playing = ref(false)
const position = ref(0)
const duration = ref(0)

let sound = null
let tickHandle = null

const format = (seconds) =>
  new Date(Math.max(seconds, 0) * 1000).toISOString().substring(14, 19)

const time = computed(() => format(Math.floor(position.value)))
const total = computed(() => format(Math.floor(duration.value)))

function attachSound() {
  cleanupSound()

  sound = new Howl({ src: [props.src], html5: true })
  if (Number.isFinite(props.rate) && props.rate > 0) {
    sound.rate(props.rate)
  }
  sound.on('play', () => {
    playing.value = true
    duration.value = sound.duration()
    emit('play')
  })
  sound.on('pause', () => {
    playing.value = false
    position.value = sound.seek() || 0
    emit('pause')
  })
  sound.on('end', () => {
    playing.value = false
    position.value = duration.value
    emit('ended')
  })

  if (props.autoplay) {
    sound.once('load', () => sound.play())
    if (sound.state() === 'loaded') {
      sound.play()
    }
  }
}

function startTick() {
  stopTick()
  tickHandle = window.setInterval(() => {
    if (sound && playing.value) {
      const nextPosition = Number(sound.seek() || 0)
      position.value = nextPosition
      const totalDuration = Number(duration.value || sound.duration() || 0)
      const progress = totalDuration > 0 ? Math.min(1, Math.max(0, nextPosition / totalDuration)) : 0
      emit('progress', {
        position: nextPosition,
        duration: totalDuration,
        progress
      })
    }
  }, 120)
}

function stopTick() {
  if (tickHandle) {
    window.clearInterval(tickHandle)
    tickHandle = null
  }
}

function cleanupSound() {
  if (sound) {
    sound.off()
    sound.unload()
    sound = null
  }
  playing.value = false
  position.value = 0
  duration.value = 0
}

function toggle() {
  if (!sound) return
  playing.value ? sound.pause() : sound.play()
}

onMounted(() => {
  attachSound()
  startTick()
})

onBeforeUnmount(() => {
  stopTick()
  cleanupSound()
})

watch(
  () => props.src,
  () => {
    attachSound()
  }
)

watch(
  () => props.rate,
  (nextRate) => {
    if (!sound || !Number.isFinite(nextRate) || nextRate <= 0) return
    sound.rate(nextRate)
  }
)
</script>
