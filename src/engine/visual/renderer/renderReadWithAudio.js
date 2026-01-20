import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage, createAudioControl } from './utils'

export function renderReadWithAudio(app, exercise, { onAnswer, onPlayAudio } = {}) {
  prepareStage(app)

  const instructionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#1e293b',
    fontWeight: '600',
    wordWrap: true,
    wordWrapWidth: 640
  })

  const hintStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 20,
    fill: '#475569',
    wordWrap: true,
    wordWrapWidth: 640
  })

  const instruction = new PIXI.Text(exercise.instruction ?? 'Lee la frase con calma.', instructionStyle)
  instruction.x = 40
  instruction.y = 36
  instruction.alpha = 0
  app.stage.addChild(instruction)

  const { control: audioControl, fallbackLabel } = createAudioControl({
    audio: exercise.audio,
    onPlayAudio,
    label: '▶ Escuchar frase',
    disabledLabel: '🔈 Escuchar frase',
    x: 40,
    y: 120,
    width: 260,
    activeColor: 0x22c55e
  })
  app.stage.addChild(audioControl)
  if (fallbackLabel) {
    fallbackLabel.y = audioControl.y + audioControl.height + 8
    app.stage.addChild(fallbackLabel)
  }

  const textContainer = new PIXI.Container()
  textContainer.x = 40
  textContainer.y = (fallbackLabel ? fallbackLabel.y + fallbackLabel.height : audioControl.y + audioControl.height) + 20

  const background = new PIXI.Graphics()
  background.beginFill(0xf1f5f9)
  background.drawRoundedRect(0, 0, 680, 160, 28)
  background.endFill()

  const textContent = new PIXI.Text(exercise.text ?? '', textStyle)
  textContent.x = 24
  textContent.y = 28

  textContainer.addChild(background, textContent)
  textContainer.alpha = 0
  app.stage.addChild(textContainer)

  const confirmButton = new PIXI.Container()
  confirmButton.interactive = true
  confirmButton.buttonMode = true
  confirmButton.x = 40
  confirmButton.y = textContainer.y + background.height + 32

  const confirmBg = new PIXI.Graphics()
  confirmBg.beginFill(0x2563eb)
  confirmBg.drawRoundedRect(0, 0, 240, 70, 24)
  confirmBg.endFill()

  const confirmLabel = new PIXI.Text('He leído la frase', new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#ffffff'
  }))
  confirmLabel.x = 24
  confirmLabel.y = 20

  confirmButton.addChild(confirmBg, confirmLabel)
  confirmButton.alpha = 0
  app.stage.addChild(confirmButton)

  confirmButton.on('pointertap', () => {
    const value = exercise.correct ?? 'done'
    onAnswer?.(value, {
      focusTarget: confirmButton,
      autoAdvance: true,
      awardPoints: true
    })
    gsap.fromTo(confirmButton, { alpha: 1 }, { alpha: 0.7, yoyo: true, repeat: 1, duration: 0.25 })
  })

  if (exercise.hint) {
    const hint = new PIXI.Text(exercise.hint, hintStyle)
    hint.x = 40
    hint.y = confirmButton.y + confirmBg.height + 16
    hint.alpha = 0
    app.stage.addChild(hint)
    gsap.to(hint, { alpha: 1, duration: 0.4, delay: 0.45 })
  }

  gsap.to(instruction, { alpha: 1, duration: 0.4 })
  gsap.to(textContainer, { alpha: 1, duration: 0.4, delay: 0.1 })
  gsap.to(confirmButton, { alpha: 1, duration: 0.4, delay: 0.2 })
}

export default renderReadWithAudio
