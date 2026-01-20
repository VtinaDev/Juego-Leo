import { ref } from 'vue'
import celebrate from '../gsap/celebrations'

const MIN_COOLDOWN = 800

export function useCelebration() {
  const lastCelebration = ref(0)

  function triggerCelebration(meta = {}) {
    const now = Date.now()
    if (now - lastCelebration.value < MIN_COOLDOWN) return
    lastCelebration.value = now

    const {
      app = meta.app ?? null,
      target = meta.target ?? meta.focusTarget ?? null,
      canvas = meta.canvas ?? document.getElementById('game-canvas'),
      intensity = meta.intensity ?? 1,
      palette = meta.palette
    } = meta

    celebrate({ app, sprite: target, canvas, intensity, palette })
  }

  return { triggerCelebration }
}

export default useCelebration
