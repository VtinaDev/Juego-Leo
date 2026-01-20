import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderCompleteSentence(app, exercise, { onAnswer } = {}) {
  prepareStage(app)

  const questionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#2563eb'
  })

  const question = new PIXI.Text(exercise.question ?? '', questionStyle)
  question.x = 40
  question.y = 40
  question.alpha = 0
  app.stage.addChild(question)

  exercise.options?.forEach((option, idx) => {
    const button = new PIXI.Container()
    button.interactive = true
    button.buttonMode = true
    button.x = 60 + (idx % 2) * 320
    button.y = 150 + Math.floor(idx / 2) * 70

    const background = new PIXI.Graphics()
    background.beginFill(0xe2e8f0)
    background.drawRoundedRect(0, 0, 280, 56, 18)
    background.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 18
    label.y = 14

    button.addChild(background, label)
    button.alpha = 0

    button.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: button })
    })

    app.stage.addChild(button)

    gsap.to(button, {
      alpha: 1,
      duration: 0.35,
      delay: 0.1 * (idx + 1),
      ease: 'power1.out'
    })
  })

  gsap.to(question, { alpha: 1, duration: 0.25, ease: 'power1.out' })
}

export default renderCompleteSentence
