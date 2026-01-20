import * as PIXI from 'pixi.js'
import { getParticleSystem } from './ParticleSystem'

const DEFAULT_COLORS = [0xf97316, 0xfacc15, 0x34d399, 0x60a5fa, 0xa855f7, 0xf472b6]

export const ConfettiEmitter = {
  emit(stage, { count = 28, spread = 820, originY = 80, colors = DEFAULT_COLORS } = {}) {
    const system = getParticleSystem(stage)
    if (!system) return

    const effectiveWidth = stage && stage.width > 0 ? stage.width : spread
    const effectiveHeight = stage && stage.height > 0 ? stage.height : 600

    for (let i = 0; i < count; i += 1) {
      const graphic = new PIXI.Graphics()
      const color = colors[i % colors.length]
      graphic.beginFill(color)
      graphic.drawRoundedRect(0, 0, 10, 10, 2)
      graphic.endFill()

      graphic.x = effectiveWidth * Math.random()
      graphic.y = originY * Math.random()
      graphic.rotation = Math.random() * Math.PI

      const drift = (Math.random() - 0.5) * 2
      const fallSpeed = 2 + Math.random() * 3
      const spin = (Math.random() - 0.5) * 0.3

      system.add(graphic, (display, delta) => {
        display.y += fallSpeed * delta
        display.x += drift * delta
        display.rotation += spin * delta

        if (display.y > effectiveHeight + 40) {
          return false
        }
        return true
      })
    }
  }
}

export default ConfettiEmitter
