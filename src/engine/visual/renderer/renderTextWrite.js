import * as PIXI from 'pixi.js'
import { prepareStage, createDomInput, centerDomOverlay } from './utils'

export function renderTextWrite(app, exercise, { onSubmit } = {}) {
  prepareStage(app)

  const instructionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const hintStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 20,
    fill: '#475569',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const instruction = new PIXI.Text(exercise.instruction ?? 'Escribe tu respuesta:', instructionStyle)
  instruction.x = 40
  instruction.y = 48
  app.stage.addChild(instruction)

  const input = createDomInput(app, {
    type: 'text',
    placeholder: exercise.placeholder ?? 'Escribe aquí tu respuesta...'
  })
  centerDomOverlay(app, input, '55%')

  const submitButton = new PIXI.Container()
  submitButton.interactive = true
  submitButton.buttonMode = true
  submitButton.x = 40
  submitButton.y = 210

  const submitBg = new PIXI.Graphics()
  submitBg.beginFill(0x2563eb)
  submitBg.drawRoundedRect(0, 0, 220, 64, 20)
  submitBg.endFill()

  const submitLabel = new PIXI.Text('Enviar', new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#ffffff'
  }))
  submitLabel.x = 72
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

  if (exercise.hint) {
    const hint = new PIXI.Text(exercise.hint, hintStyle)
    hint.x = 40
    hint.y = submitButton.y + submitBg.height + 16
    app.stage.addChild(hint)
  }
}

export default renderTextWrite
