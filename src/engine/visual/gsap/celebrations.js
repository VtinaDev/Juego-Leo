import { gsap } from 'gsap'
import { ConfettiEmitter } from '../particles/ConfettiEmitter'
import { SoundService } from '../../audio/SoundService'

function pulseCanvas({ target, intensity }) {
  if (!target) return
  gsap.fromTo(
    target,
    { filter: 'brightness(1)' },
    {
      filter: 'brightness(1.08)',
      duration: 0.28 * intensity,
      yoyo: true,
      repeat: 1,
      ease: 'power1.out'
    }
  )
}

function bounceSprite(sprite, intensity) {
  if (!sprite) return
  gsap.to(sprite, {
    y: sprite.y - 22 * intensity,
    duration: 0.34,
    yoyo: true,
    repeat: 1,
    ease: 'back.out(2)'
  })
}

export function celebrate({ app, sprite, canvas, intensity = 1, palette } = {}) {
  SoundService.play('celebration')
  SoundService.play('correct')

  if (app?.stage) {
    ConfettiEmitter.emit(app.stage, {
      count: Math.round(20 * intensity),
      colors: palette
    })
  }

  pulseCanvas({ target: canvas ?? document.getElementById('game-canvas'), intensity })
  bounceSprite(sprite, intensity)
}

export default celebrate
