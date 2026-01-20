import * as PIXI from 'pixi.js'
import { prepareStage, createDomInput, centerDomOverlay, createAudioControl } from './utils'

export function renderAudioWrite(app, exercise, { onSubmit, onPlayAudio } = {}) {
  prepareStage(app)

  const instructionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const instruction = new PIXI.Text(exercise.instruction ?? '', instructionStyle)
  instruction.x = 40
  instruction.y = 36
  app.stage.addChild(instruction)

  const { control: audioControl, fallbackLabel } = createAudioControl({
    audio: exercise.audio,
    onPlayAudio,
    label: '▶ Reproducir',
    disabledLabel: '🔈 Escuchar',
    x: 40,
    y: 120
  })
  app.stage.addChild(audioControl)
  if (fallbackLabel) {
    fallbackLabel.y = audioControl.y + audioControl.height + 12
    app.stage.addChild(fallbackLabel)
  }

  const input = createDomInput(app, {
    type: 'text',
    placeholder: 'Escribe tu respuesta aquí'
  })
  centerDomOverlay(app, input, '55%')

  const submitButton = new PIXI.Container()
  submitButton.interactive = true
  submitButton.buttonMode = true
  submitButton.x = 40
  submitButton.y = fallbackLabel ? fallbackLabel.y + fallbackLabel.height + 24 : 220

  const submitBg = new PIXI.Graphics()
  submitBg.beginFill(0x2563eb)
  submitBg.drawRoundedRect(0, 0, 220, 64, 20)
  submitBg.endFill()

  const submitLabel = new PIXI.Text('Comprobar', new PIXI.TextStyle({ fontFamily: 'Poppins', fontSize: 24, fill: '#fff' }))
  submitLabel.x = 40
  submitLabel.y = 18

  submitButton.addChild(submitBg, submitLabel)
  app.stage.addChild(submitButton)

  const emitAnswer = () => {
    const value = input?.value?.trim() ?? ''
    if (!value) return
    onSubmit?.(value, { focusTarget: submitButton, payload: value })
  }

  submitButton.on('pointertap', emitAnswer)

  if (input) {
    input.value = ''
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        emitAnswer()
      }
    })
  }
}

export default renderAudioWrite
