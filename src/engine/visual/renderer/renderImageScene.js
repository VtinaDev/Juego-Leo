import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderImageScene(app, exercise) {
  prepareStage(app)

  const container = new PIXI.Container()
  container.alpha = 0

  const background = new PIXI.Graphics()
  background.beginFill(0xf8fafc)
  background.drawRoundedRect(0, 0, 880, 520, 32)
  background.endFill()
  background.x = 10
  background.y = 40
  container.addChild(background)

  if (exercise.image) {
    const texture = PIXI.Texture.from(exercise.image)
    const sprite = new PIXI.Sprite(texture)
    sprite.anchor.set(0.5)
    sprite.x = app.renderer.width / 2
    sprite.y = app.renderer.height / 2

    const scale = Math.min(760 / sprite.texture.width, 360 / sprite.texture.height, 1)
    sprite.scale.set(scale)
    container.addChild(sprite)
  }

  if (exercise.caption) {
    const caption = new PIXI.Text(exercise.caption, {
      fontFamily: 'Poppins',
      fontSize: 28,
      fill: '#1f2937',
      wordWrap: true,
      wordWrapWidth: 760,
      align: 'center'
    })
    caption.anchor.set(0.5, 0)
    caption.x = app.renderer.width / 2
    caption.y = 440
    container.addChild(caption)
  }

  app.stage.addChild(container)
  gsap.to(container, { alpha: 1, duration: 0.4, ease: 'power1.out' })
}

export default renderImageScene
