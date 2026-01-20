import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage, createAudioControl } from './utils'

export function renderAudioQuestion(app, exercise, { onAnswer, onPlayAudio } = {}) {
  prepareStage(app)

  const questionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const contextStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 22,
    fill: '#475569',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 26,
    fill: '#0ea5e9'
  })

  const question = new PIXI.Text(exercise.question ?? 'Escucha y responde.', questionStyle)
  question.x = 40
  question.y = 48
  question.alpha = 0
  app.stage.addChild(question)

  const { control: audioControl, fallbackLabel } = createAudioControl({
    audio: exercise.audio,
    onPlayAudio,
    label: '▶ Escuchar historia',
    disabledLabel: '🔈 Escuchar historia',
    x: 40,
    y: question.y + question.height + 24,
    width: 260,
    activeColor: 0x0ea5e9
  })
  app.stage.addChild(audioControl)

  let optionsBaseY = audioControl.y + audioControl.height + 40

  if (fallbackLabel) {
    fallbackLabel.y = audioControl.y + audioControl.height + 8
    app.stage.addChild(fallbackLabel)
    optionsBaseY = fallbackLabel.y + fallbackLabel.height + 32
  }

  if (exercise.context) {
    const context = new PIXI.Text(exercise.context, contextStyle)
    context.x = 40
    context.y = optionsBaseY
    context.alpha = 0
    app.stage.addChild(context)
    optionsBaseY = context.y + context.height + 28
    gsap.to(context, { alpha: 1, duration: 0.35, delay: 0.1 })
  }

  exercise.options?.forEach((option, idx) => {
    const btn = new PIXI.Container()
    btn.interactive = true
    btn.buttonMode = true
    btn.x = 60
    btn.y = optionsBaseY + idx * 74

    const bg = new PIXI.Graphics()
    bg.beginFill(0xe0f2fe)
    bg.drawRoundedRect(0, 0, 640, 60, 18)
    bg.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 20
    label.y = 16

    btn.addChild(bg, label)
    btn.alpha = 0

    btn.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: btn })
      gsap.fromTo(btn, { alpha: 1 }, { alpha: 0.7, yoyo: true, repeat: 1, duration: 0.2 })
    })

    app.stage.addChild(btn)
    gsap.to(btn, { alpha: 1, duration: 0.35, delay: 0.09 * (idx + 1), ease: 'power1.out' })
  })

  gsap.to(question, { alpha: 1, duration: 0.35 })
}

export default renderAudioQuestion
