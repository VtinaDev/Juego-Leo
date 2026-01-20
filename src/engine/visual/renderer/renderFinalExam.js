import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderFinalExam(app, exercise, { onAnswer } = {}) {
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
    fill: '#1d4ed8'
  })

  const prompt = new PIXI.Text(exercise.question ?? 'Responde la pregunta final.', promptStyle)
  prompt.x = 40
  prompt.y = 52
  prompt.alpha = 0
  app.stage.addChild(prompt)

  const baseY = prompt.y + prompt.height + 40

  exercise.options?.forEach((option, idx) => {
    const container = new PIXI.Container()
    container.interactive = true
    container.buttonMode = true
    container.x = 40
    container.y = baseY + idx * 90

    const bg = new PIXI.Graphics()
    bg.beginFill(0xe0f2fe)
    bg.drawRoundedRect(0, 0, 700, 80, 22)
    bg.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 24
    label.y = 22

    container.addChild(bg, label)
    container.alpha = 0

    container.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: container })
      gsap.fromTo(container, { alpha: 1 }, { alpha: 0.7, yoyo: true, repeat: 1, duration: 0.2 })
    })

    app.stage.addChild(container)
    gsap.to(container, { alpha: 1, duration: 0.35, delay: 0.08 * (idx + 1) })
  })

  gsap.to(prompt, { alpha: 1, duration: 0.35 })
}

export default renderFinalExam
