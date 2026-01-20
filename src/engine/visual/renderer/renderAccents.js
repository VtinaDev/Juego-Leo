import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage, createAudioControl } from './utils'

const TYPE_OPTIONS = ['Aguda', 'Grave', 'Esdrújula']

export function renderAccents(app, exercise, { onAnswer, onPlayAudio } = {}) {
  prepareStage(app)

  const titleStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#0f172a'
  })

  const hintStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 22,
    fill: '#6b7280',
    wordWrap: true,
    wordWrapWidth: 720
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#0f172a'
  })

  const title = new PIXI.Text('Arrastra la tilde y clasifica la palabra', titleStyle)
  title.x = 40
  title.y = 32
  app.stage.addChild(title)

  if (exercise.rule) {
    const rule = new PIXI.Text(`Regla: ${exercise.rule}`, hintStyle)
    rule.x = 40
    rule.y = 80
    app.stage.addChild(rule)
  }

  const { control: audioControl, fallbackLabel } = createAudioControl({
    audio: exercise.audio,
    onPlayAudio,
    label: '▶ Escuchar palabra',
    disabledLabel: '🔈 Escuchar palabra',
    x: 40,
    y: 140,
    width: 260,
    activeColor: 0x14b8a6
  })
  app.stage.addChild(audioControl)
  if (fallbackLabel) {
    fallbackLabel.y = audioControl.y + audioControl.height + 8
    app.stage.addChild(fallbackLabel)
  }

  const wordStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 42,
    fill: '#1d4ed8'
  })

  const wordText = new PIXI.Text(exercise.word ?? '', wordStyle)
  wordText.x = 40
  wordText.y = (fallbackLabel ? fallbackLabel.y + fallbackLabel.height : audioControl.y + audioControl.height) + 12
  app.stage.addChild(wordText)

  const selections = {
    syllable: null,
    type: null
  }

  const emitIfReady = (focusTarget) => {
    if (selections.syllable && selections.type) {
      onAnswer?.(
        { syllable: selections.syllable, type: selections.type },
        { focusTarget, payload: { ...selections } }
      )
    }
  }

  // Syllable buttons
  const syllableTitle = new PIXI.Text('Selecciona la sílaba con tilde', new PIXI.TextStyle({ fontFamily: 'Poppins', fontSize: 24, fill: '#1d4ed8' }))
  syllableTitle.x = 40
  syllableTitle.y = wordText.y + wordText.height + 16
  app.stage.addChild(syllableTitle)

  const syllableButtons = []
  const syllableBaseY = syllableTitle.y + 50

  ;(exercise.syllables ?? []).forEach((syllable, idx) => {
    const button = new PIXI.Container()
    button.interactive = true
    button.buttonMode = true
    button.x = 40 + idx * 180
    button.y = syllableBaseY

    const bg = new PIXI.Graphics()
    bg.beginFill(0xe2e8f0)
    bg.drawRoundedRect(0, 0, 160, 60, 18)
    bg.endFill()

    const label = new PIXI.Text(syllable, optionStyle)
    label.x = 18
    label.y = 16

    button.addChild(bg, label)
    button.alpha = 0
    button.meta = { bg, value: syllable }

    button.on('pointertap', () => {
      syllableButtons.forEach((btn) => (btn.meta.bg.tint = 0xe2e8f0))
      button.meta.bg.tint = 0xbfdbfe
      selections.syllable = syllable
      emitIfReady(button)
    })

    app.stage.addChild(button)
    syllableButtons.push(button)
    gsap.to(button, { alpha: 1, duration: 0.35, delay: 0.05 * (idx + 1) })
  })

  // Type classification
  const typeTitle = new PIXI.Text('Clasifica la palabra', new PIXI.TextStyle({ fontFamily: 'Poppins', fontSize: 24, fill: '#1d4ed8' }))
  typeTitle.x = 40
  const typeBaseY = syllableBaseY + 120
  typeTitle.y = typeBaseY - 44
  app.stage.addChild(typeTitle)

  const typeButtons = []
  TYPE_OPTIONS.forEach((option, idx) => {
    const button = new PIXI.Container()
    button.interactive = true
    button.buttonMode = true
    button.x = 40 + idx * 200
    button.y = typeBaseY

    const bg = new PIXI.Graphics()
    bg.beginFill(0xfaf5ff)
    bg.drawRoundedRect(0, 0, 180, 64, 20)
    bg.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 24
    label.y = 18

    button.addChild(bg, label)
    button.alpha = 0
    button.meta = { bg, value: option }

    button.on('pointertap', () => {
      typeButtons.forEach((btn) => (btn.meta.bg.tint = 0xfaf5ff))
      button.meta.bg.tint = 0xd8b4fe
      selections.type = option
      emitIfReady(button)
    })

    app.stage.addChild(button)
    typeButtons.push(button)
    gsap.to(button, { alpha: 1, duration: 0.35, delay: 0.08 * (idx + 1) })
  })
}

export default renderAccents
