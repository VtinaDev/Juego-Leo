import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage, createAudioControl } from './utils'

export function renderAudioChoice(app, exercise, { onAnswer, onPlayAudio } = {}) {
  prepareStage(app)

  const questionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 700
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 26,
    fill: '#0284c7'
  })

  const question = new PIXI.Text(exercise.question ?? '', questionStyle)
  question.x = 40
  question.y = 188
  question.alpha = 0
  app.stage.addChild(question)

  const { control: audioControl, fallbackLabel } = createAudioControl({
    audio: exercise.audio,
    onPlayAudio,
    label: '▶ Escuchar',
    disabledLabel: '🔈 Escuchar',
    x: 40,
    y: 60
  })

  app.stage.addChild(audioControl)
  if (fallbackLabel) {
    app.stage.addChild(fallbackLabel)
    question.y = fallbackLabel.y + fallbackLabel.height + 24
  }

  const baseY = question.y + 80

  exercise.options?.forEach((option, idx) => {
    const button = new PIXI.Container()
    button.interactive = true
    button.buttonMode = true
    button.x = 60
    button.y = baseY + idx * 72

    const background = new PIXI.Graphics()
    background.beginFill(0xe0f2fe)
    background.drawRoundedRect(0, 0, 600, 56, 18)
    background.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 20
    label.y = 14

    button.addChild(background, label)
    button.alpha = 0

    button.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: button })
    })

    app.stage.addChild(button)

    gsap.to(button, { alpha: 1, duration: 0.35, delay: 0.1 * (idx + 1), ease: 'power1.out' })
  })

  gsap.to(question, { alpha: 1, duration: 0.3 })
}

export default renderAudioChoice
