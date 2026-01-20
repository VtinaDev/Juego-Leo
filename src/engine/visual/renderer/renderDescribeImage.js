import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage, createFallbackCard } from './utils'

export function renderDescribeImage(app, exercise, { onAnswer } = {}) {
  prepareStage(app)

  const instructionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#2563eb',
    wordWrap: true,
    wordWrapWidth: 600
  })

  const instruction = new PIXI.Text(exercise.instruction ?? 'Describe la imagen', instructionStyle)
  instruction.x = 40
  instruction.y = 24
  instruction.alpha = 0
  app.stage.addChild(instruction)

  if (exercise.image) {
    const texture = PIXI.Texture.from(exercise.image)
    const sprite = new PIXI.Sprite(texture)
    sprite.x = 40
    sprite.y = 90
    sprite.width = 360
    sprite.height = 240
    sprite.alpha = 0
    sprite.roundPixels = true

    const mask = new PIXI.Graphics()
    mask.beginFill(0xffffff)
    mask.drawRoundedRect(0, 0, 360, 240, 22)
    mask.endFill()

    mask.x = sprite.x
    mask.y = sprite.y
    sprite.mask = mask

    app.stage.addChild(sprite, mask)
    gsap.to(sprite, { alpha: 1, duration: 0.4 })
  } else {
    const fallback = createFallbackCard({
      width: 360,
      height: 240,
      color: exercise.levelMeta?.color ?? '#93c5fd',
      icon: exercise.levelMeta?.icon ?? '🪄',
      title: exercise.levelMeta?.animal ?? 'Animal sabio',
      subtitle: 'Imagina la escena descrita'
    })
    fallback.x = 40
    fallback.y = 90
    fallback.alpha = 0
    app.stage.addChild(fallback)
    gsap.to(fallback, { alpha: 1, duration: 0.4 })
  }

  exercise.options?.forEach((option, idx) => {
    const card = new PIXI.Container()
    card.interactive = true
    card.buttonMode = true
    card.x = 440
    card.y = 120 + idx * 120

    const bg = new PIXI.Graphics()
    bg.beginFill(0xe2e8f0)
    bg.drawRoundedRect(0, 0, 360, 100, 20)
    bg.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 20
    label.y = 20

    card.addChild(bg, label)
    card.alpha = 0

    card.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: card })
    })

    app.stage.addChild(card)
    gsap.to(card, { alpha: 1, duration: 0.35, delay: 0.08 * (idx + 1), ease: 'power1.out' })
  })

  gsap.to(instruction, { alpha: 1, duration: 0.3 })
}

export default renderDescribeImage
