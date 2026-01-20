import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderPunctuationGame(app, exercise, { onAnswer } = {}) {
  prepareStage(app)

  const titleStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 30,
    fill: '#0f172a'
  })

  const sentenceStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 32,
    fill: '#1d4ed8',
    wordWrap: true,
    wordWrapWidth: 680
  })

  const optionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#1e293b'
  })

  const title = new PIXI.Text('Elige el signo correcto para la frase', titleStyle)
  title.x = 40
  title.y = 48
  title.alpha = 0
  app.stage.addChild(title)

  const sentenceBox = new PIXI.Container()
  sentenceBox.x = 40
  sentenceBox.y = 110

  const bg = new PIXI.Graphics()
  bg.beginFill(0xe2e8f0)
  bg.drawRoundedRect(0, 0, 720, 120, 30)
  bg.endFill()

  const sentence = new PIXI.Text(exercise.sentence ?? '', sentenceStyle)
  sentence.x = 24
  sentence.y = 34

  sentenceBox.addChild(bg, sentence)
  sentenceBox.alpha = 0
  app.stage.addChild(sentenceBox)

  const baseY = sentenceBox.y + 150

  exercise.options?.forEach((option, idx) => {
    const button = new PIXI.Container()
    button.interactive = true
    button.buttonMode = true
    button.x = 40 + idx * 140
    button.y = baseY

    const buttonBg = new PIXI.Graphics()
    buttonBg.beginFill(0xf8fafc)
    buttonBg.drawRoundedRect(0, 0, 120, 100, 24)
    buttonBg.endFill()

    const label = new PIXI.Text(option, optionStyle)
    label.x = 42
    label.y = 30

    button.addChild(buttonBg, label)
    button.alpha = 0

    button.on('pointertap', () => {
      onAnswer?.(option, { focusTarget: button })
      gsap.fromTo(button, { alpha: 1 }, { alpha: 0.7, yoyo: true, repeat: 1, duration: 0.2 })
    })

    app.stage.addChild(button)
    gsap.to(button, { alpha: 1, duration: 0.35, delay: 0.08 * (idx + 1), ease: 'power1.out' })
  })

  gsap.to(title, { alpha: 1, duration: 0.35 })
  gsap.to(sentenceBox, { alpha: 1, duration: 0.35, delay: 0.1 })
}

export default renderPunctuationGame
