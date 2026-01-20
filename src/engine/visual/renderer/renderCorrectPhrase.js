import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderCorrectPhrase(app, exercise, { onAnswer } = {}) {
  prepareStage(app)

  const titleStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 700
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 26,
    fill: '#2563eb',
    wordWrap: true,
    wordWrapWidth: 640
  })

  const title = new PIXI.Text(exercise.prompt ?? 'Selecciona la frase correcta', titleStyle)
  title.x = 40
  title.y = 36
  app.stage.addChild(title)

  exercise.options?.forEach((option, idx) => {
    const card = new PIXI.Container()
    card.interactive = true
    card.buttonMode = true
    card.x = 60
    card.y = 140 + idx * 120

    const background = new PIXI.Graphics()
    background.beginFill(0xeef2ff)
    background.drawRoundedRect(0, 0, 680, 100, 18)
    background.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 22
    label.y = 20

    card.addChild(background, label)
    card.alpha = 0

    card.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: card })
    })

    app.stage.addChild(card)
    gsap.to(card, { alpha: 1, duration: 0.35, delay: 0.1 * (idx + 1), ease: 'power1.out' })
  })
}

export default renderCorrectPhrase
