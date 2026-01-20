import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderSentenceSelection(app, exercise, { onAnswer } = {}) {
  prepareStage(app)

  const promptStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 26,
    fill: '#1d4ed8',
    wordWrap: true,
    wordWrapWidth: 640
  })

  const prompt = new PIXI.Text(exercise.prompt ?? 'Elige la frase correcta.', promptStyle)
  prompt.x = 40
  prompt.y = 48
  prompt.alpha = 0
  app.stage.addChild(prompt)

  const baseY = prompt.y + prompt.height + 40

  exercise.options?.forEach((option, idx) => {
    const card = new PIXI.Container()
    card.interactive = true
    card.buttonMode = true
    card.x = 40
    card.y = baseY + idx * 120

    const bg = new PIXI.Graphics()
    bg.beginFill(0xe2e8f0)
    bg.drawRoundedRect(0, 0, 700, 100, 30)
    bg.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 26
    label.y = 26

    card.addChild(bg, label)
    card.alpha = 0

    card.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: card })
      gsap.fromTo(card, { alpha: 1 }, { alpha: 0.7, yoyo: true, repeat: 1, duration: 0.2 })
    })

    app.stage.addChild(card)
    gsap.to(card, { alpha: 1, duration: 0.35, delay: 0.06 * (idx + 1), ease: 'power1.out' })
  })

  gsap.to(prompt, { alpha: 1, duration: 0.35 })
}

export default renderSentenceSelection
