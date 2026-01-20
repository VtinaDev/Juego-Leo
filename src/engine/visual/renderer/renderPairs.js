import * as PIXI from 'pixi.js'
import { gsap } from 'gsap'
import { prepareStage } from './utils'

const MODE_CONFIG = {
  synonyms: {
    leftKey: 'word',
    rightKey: 'synonym',
    title: 'Une cada palabra con su sinónimo',
    rightColor: 0xdbeafe
  },
  pair_synonyms: {
    leftKey: 'word',
    rightKey: 'match',
    title: 'Une cada palabra con su sinónimo',
    rightColor: 0xdbeafe
  },
  antonyms: {
    leftKey: 'word',
    rightKey: 'antonym',
    title: 'Une la palabra con su antónimo',
    rightColor: 0xfce7f3
  },
  pair_antonyms: {
    leftKey: 'word',
    rightKey: 'match',
    title: 'Une la palabra con su antónimo',
    rightColor: 0xfce7f3
  },
  singular_plural: {
    leftKey: 'singular',
    rightKey: 'plural',
    title: 'Relaciona singular con plural',
    rightColor: 0xede9fe
  }
}

export function renderPairs(app, exercise, { onAnswer, mode } = {}) {
  prepareStage(app)

  const resolvedMode = mode || exercise?.type || 'synonyms'
  const config = MODE_CONFIG[resolvedMode] ?? MODE_CONFIG.synonyms
  const titleStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 28,
    fill: '#1f2937'
  })

  const itemStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#0f172a'
  })

  const title = new PIXI.Text(config.title, titleStyle)
  title.x = 40
  title.y = 36
  app.stage.addChild(title)

  const pairs = exercise.pairs ?? []

  const leftColumn = []
  const rightColumn = []

  pairs.forEach((pair, idx) => {
    const leftValue = pair[config.leftKey]
    const rightValue = pair[config.rightKey]
    if (leftValue) leftColumn.push({ value: leftValue, id: `${exercise.id}-left-${idx}` })
    if (rightValue) rightColumn.push({ value: rightValue, id: `${exercise.id}-right-${idx}` })
  })

  shuffleArray(rightColumn)

  const selected = {
    left: null,
    right: null
  }

  const createItem = (data, x, y, backgroundColor) => {
    const container = new PIXI.Container()
    container.interactive = true
    container.buttonMode = true
    container.x = x
    container.y = y

    const background = new PIXI.Graphics()
    background.beginFill(backgroundColor)
    background.drawRoundedRect(0, 0, 280, 56, 16)
    background.endFill()

    const label = new PIXI.Text(data.value, itemStyle)
    label.x = 14
    label.y = 16

    container.addChild(background, label)
    container.alpha = 0
    container.meta = { data, background }
    return container
  }

  leftColumn.forEach((item, idx) => {
    const node = createItem(item, 40, 120 + idx * 80, 0xe2e8f0)
    node.on('pointertap', () => {
      if (selected.left?.id === item.id) {
        selected.left.background.tint = 0xe2e8f0
        selected.left = null
        return
      }
      if (selected.left) selected.left.background.tint = 0xe2e8f0
      selected.left = node.meta
      node.meta.background.tint = 0x93c5fd
      tryEmitPair()
    })
    app.stage.addChild(node)
    gsap.to(node, { alpha: 1, duration: 0.3, delay: 0.05 * idx })
  })

  rightColumn.forEach((item, idx) => {
    const node = createItem(item, 380, 120 + idx * 80, config.rightColor ?? 0xdbeafe)
    node.on('pointertap', () => {
      if (selected.right?.id === item.id) {
        selected.right.background.tint = config.rightColor ?? 0xdbeafe
        selected.right = null
        return
      }
      if (selected.right) selected.right.background.tint = config.rightColor ?? 0xdbeafe
      selected.right = node.meta
      node.meta.background.tint = 0x67e8f9
      tryEmitPair()
    })
    app.stage.addChild(node)
    gsap.to(node, { alpha: 1, duration: 0.3, delay: 0.05 * idx })
  })

  const tryEmitPair = () => {
    if (!selected.left || !selected.right) return
    onAnswer?.(
      {
        left: selected.left.data.value,
        right: selected.right.data.value,
        leftId: selected.left.data.id,
        rightId: selected.right.data.id
      },
      { focusTarget: null }
    )
    if (selected.left) selected.left.background.tint = 0xe2e8f0
    if (selected.right) selected.right.background.tint = config.rightColor ?? 0xdbeafe
    selected.left = null
    selected.right = null
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export default renderPairs
