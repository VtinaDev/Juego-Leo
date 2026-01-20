import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

export function renderOrderSentence(app, exercise, { onAnswer } = {}) {
  prepareStage(app)

  const titleStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#1f2937'
  })

  const tokenStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#0f172a'
  })

  const selectionStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 26,
    fill: '#2563eb'
  })

  const prompt = new PIXI.Text('Ordena las palabras', titleStyle)
  prompt.x = 40
  prompt.y = 36
  app.stage.addChild(prompt)

  const selectedLabel = new PIXI.Text('Tu frase:', selectionStyle)
  selectedLabel.x = 40
  selectedLabel.y = 320
  app.stage.addChild(selectedLabel)

  const selectedText = new PIXI.Text('', new PIXI.TextStyle({ fontFamily: 'Poppins', fontSize: 24, fill: '#64748b' }))
  selectedText.x = 40
  selectedText.y = 360
  app.stage.addChild(selectedText)

  const resetButton = new PIXI.Text('⟲ Reiniciar', new PIXI.TextStyle({ fontFamily: 'Poppins', fontSize: 22, fill: '#ef4444' }))
  resetButton.x = 40
  resetButton.y = 420
  resetButton.interactive = true
  resetButton.buttonMode = true
  resetButton.on('pointertap', () => {
    selection.length = 0
    usedIndices.clear()
    updateSelection()
    tokens.forEach((token) => {
      token.background.tint = 0xf1f5f9
    })
  })
  app.stage.addChild(resetButton)

  const selection = []
  const usedIndices = new Set()
  const tokens = []

  const updateSelection = () => {
    selectedText.text = selection.join(' ')
    if (selection.length === exercise.words.length) {
      onAnswer?.([...selection], { focusTarget: selectedText, payload: [...selection] })
    }
  }

  exercise.words?.forEach((word, idx) => {
    const token = new PIXI.Container()
    token.x = 40 + (idx % 4) * 180
    token.y = 140 + Math.floor(idx / 4) * 80
    token.interactive = true
    token.buttonMode = true

    const background = new PIXI.Graphics()
    background.beginFill(0xf1f5f9)
    background.drawRoundedRect(0, 0, 160, 56, 18)
    background.endFill()

    const label = new PIXI.Text(word, tokenStyle)
    label.x = 12
    label.y = 16

    token.addChild(background, label)
    token.background = background

    token.on('pointertap', () => {
      if (usedIndices.has(idx)) {
        usedIndices.delete(idx)
        token.background.tint = 0xf1f5f9
        const position = selection.indexOf(word)
        if (position > -1) selection.splice(position, 1)
        updateSelection()
        return
      }
      usedIndices.add(idx)
      selection.push(word)
      token.background.tint = 0xbfdbfe
      updateSelection()
    })

    tokens.push(token)
    token.alpha = 0
    app.stage.addChild(token)

    gsap.to(token, {
      alpha: 1,
      duration: 0.3,
      delay: 0.05 * idx,
      ease: 'power1.out'
    })
  })
}

export default renderOrderSentence
