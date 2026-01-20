import * as PIXI from 'pixi.js'
import { prepareStage, createDomInput, centerDomOverlay, createAudioControl } from './utils'

export function renderAudioQuestionAnswer(app, exercise, { onSubmit, onPlayAudio } = {}) {
  prepareStage(app)

  const questionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#0f172a',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const question = new PIXI.Text(exercise.question ?? '', questionStyle)
  question.x = 40
  question.y = 36
  app.stage.addChild(question)

  const { control: audioControl, fallbackLabel } = createAudioControl({
    audio: exercise.audio,
    onPlayAudio,
    label: '▶ Escuchar pregunta',
    disabledLabel: '🔈 Escuchar pregunta',
    x: 40,
    y: 120,
    width: 260,
    activeColor: 0x0ea5e9
  })
  app.stage.addChild(audioControl)
  if (fallbackLabel) {
    fallbackLabel.y = audioControl.y + audioControl.height + 8
    app.stage.addChild(fallbackLabel)
  }

  const textarea = createDomInput(app, {
    multiline: true,
    placeholder: 'Escribe tu respuesta completa...'
  })
  if (textarea) {
    textarea.style.height = '120px'
    textarea.style.resize = 'vertical'
  }
  centerDomOverlay(app, textarea, fallbackLabel ? '60%' : '55%')

  const submitButton = new PIXI.Container()
  submitButton.interactive = true
  submitButton.buttonMode = true
  submitButton.x = 40
  submitButton.y = fallbackLabel ? fallbackLabel.y + fallbackLabel.height + 24 : 220

  const submitBg = new PIXI.Graphics()
  submitBg.beginFill(0x2563eb)
  submitBg.drawRoundedRect(0, 0, 220, 64, 20)
  submitBg.endFill()

  const submitLabel = new PIXI.Text('Responder', new PIXI.TextStyle({ fontFamily: 'Poppins', fontSize: 24, fill: '#fff' }))
  submitLabel.x = 48
  submitLabel.y = 18

  submitButton.addChild(submitBg, submitLabel)
  app.stage.addChild(submitButton)

  const emitAnswer = () => {
    const value = textarea?.value?.trim() ?? ''
    if (!value) return
    onSubmit?.(value, { focusTarget: submitButton, payload: value })
  }

  submitButton.on('pointertap', emitAnswer)

  if (textarea) {
    textarea.value = ''
    textarea.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'enter') {
        event.preventDefault()
        emitAnswer()
      }
    })
  }
}

export default renderAudioQuestionAnswer
