// src/engine/visual/gsap/imageIntro.js
import { gsap } from 'gsap'
import * as PIXI from 'pixi.js'

export function animateImageIntro(sprite, app) {
  sprite.alpha = 0
  sprite.scale.set(0.8)

  // efecto fade + zoom suave
  gsap.to(sprite, {
    alpha: 1,
    scale: 1,
    duration: 1.2,
    ease: 'power2.out'
  })

  // efecto de brillo mágico
  const glow = new PIXI.Graphics()
  glow.beginFill(0xffffff, 0.2)
  glow.drawCircle(sprite.x, sprite.y, sprite.width * 0.6)
  glow.endFill()
  glow.alpha = 0
  app.stage.addChild(glow)

  gsap.to(glow, {
    alpha: 0.5,
    duration: 0.5,
    yoyo: true,
    repeat: 1,
    onComplete: () => app.stage.removeChild(glow)
  })

  // partículas de bienvenida
  for (let i = 0; i < 10; i++) {
    const particle = new PIXI.Graphics()
    particle.beginFill(0xffd700)
    particle.drawCircle(0, 0, 3)
    particle.endFill()
    particle.x = sprite.x
    particle.y = sprite.y
    app.stage.addChild(particle)

    const angle = Math.random() * Math.PI * 2
    const distance = 40 + Math.random() * 30

    gsap.to(particle, {
      x: sprite.x + Math.cos(angle) * distance,
      y: sprite.y + Math.sin(angle) * distance,
      alpha: 0,
      duration: 1.2,
      ease: 'power1.out',
      onComplete: () => app.stage.removeChild(particle)
    })
  }
}
