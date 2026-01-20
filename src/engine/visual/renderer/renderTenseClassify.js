import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderTenseClassify(app, exercise, { onAnswer } = {}) {
  prepareStage(app)

  const sentenceStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 32,
    fill: '#111827',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 26,
    fill: '#f97316'
  })

  const contextStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 22,
    fill: '#6b7280'
  })

  const sentence = new PIXI.Text(exercise.sentence ?? '', sentenceStyle)
  sentence.x = 40
  sentence.y = 60
  sentence.alpha = 0
  app.stage.addChild(sentence)

  if (exercise.context) {
    const context = new PIXI.Text(`Pista: ${exercise.context}`, contextStyle)
    context.x = 40
    context.y = 160
    context.alpha = 0
    app.stage.addChild(context)
    gsap.to(context, { alpha: 1, duration: 0.3, delay: 0.2 })
  }

  exercise.options?.forEach((option, idx) => {
    const card = new PIXI.Container()
    card.interactive = true
    card.buttonMode = true
    card.x = 60
    card.y = 220 + idx * 80

    const bg = new PIXI.Graphics()
    bg.beginFill(0xffedd5)
    bg.drawRoundedRect(0, 0, 360, 64, 20)
    bg.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 24
    label.y = 16

    card.addChild(bg, label)
    card.alpha = 0

    card.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: card })
    })

    app.stage.addChild(card)
    gsap.to(card, { alpha: 1, duration: 0.35, delay: 0.1 * (idx + 1), ease: 'power1.out' })
  })

  gsap.to(sentence, { alpha: 1, duration: 0.3 })
}

export default renderTenseClassify
