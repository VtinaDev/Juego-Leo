import * as PIXI from 'pixi.js'

export function prepareStage(app) {
  if (!app?.stage) return
  app.stage.removeChildren()
  cleanupDomOverlays(app)
}

export function cleanupDomOverlays(app) {
  const container = app?.view?.parentElement
  if (!container) return
  container.querySelectorAll('[data-render-overlay="true"]').forEach((node) => node.remove())
}

export function createDomInput(app, { type = 'text', placeholder = '', multiline = false } = {}) {
  const container = app?.view?.parentElement
  if (!container) return null

  const input = multiline ? document.createElement('textarea') : document.createElement('input')
  input.setAttribute('data-render-overlay', 'true')
  input.style.position = 'absolute'
  input.style.zIndex = '10'
  input.style.pointerEvents = 'auto'
  input.style.left = '50%'
  input.style.transform = 'translateX(-50%)'
  input.style.width = '70%'
  input.style.maxWidth = '620px'
  input.style.fontSize = '20px'
  input.style.padding = '12px 16px'
  input.style.borderRadius = '14px'
  input.style.border = '2px solid rgba(37, 99, 235, 0.35)'
  input.style.outline = 'none'
  input.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.12)'
  input.style.background = 'rgba(255, 255, 255, 0.95)'
  input.style.color = '#1f2933'
  input.style.fontFamily = 'Poppins, sans-serif'
  input.placeholder = placeholder
  if (!multiline) input.type = type

  container.style.position = 'relative'
  container.appendChild(input)

  requestAnimationFrame(() => {
    input?.focus?.()
  })

  return input
}

export function centerDomOverlay(app, element, top = '65%') {
  if (!element) return
  element.style.top = top
}

function parseColor(color, fallback = 0x94a3b8) {
  if (typeof color === 'number') return color
  if (typeof color === 'string' && color.startsWith('#')) {
    const hex = parseInt(color.replace('#', ''), 16)
    if (!Number.isNaN(hex)) return hex
  }
  return fallback
}

export function createAudioControl({
  audio,
  onPlayAudio,
  label = '🔊 Escuchar',
  disabledLabel = '🔈 Escuchar',
  fallbackText = 'Sin audio disponible, lee la frase tú mismo 🪄',
  x = 40,
  y = 60,
  width = 240,
  height = 72,
  activeColor = 0x2563eb,
  disabledColor = 0x9ca3af
} = {}) {
  const container = new PIXI.Container()
  container.x = x
  container.y = y

  const hasAudio = typeof audio === 'string' && audio.length > 0

  const background = new PIXI.Graphics()
  background.beginFill(hasAudio ? activeColor : disabledColor)
  background.drawRoundedRect(0, 0, width, height, 22)
  background.endFill()

  const labelStyle = new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#ffffff'
  })

  const textLabel = new PIXI.Text(hasAudio ? label : disabledLabel, labelStyle)
  textLabel.x = 24
  textLabel.y = height / 2 - textLabel.height / 2

  container.addChild(background, textLabel)

  let fallbackLabel = null

  if (hasAudio) {
    container.interactive = true
    container.buttonMode = true
    container.on('pointertap', () => {
      if (typeof onPlayAudio === 'function') {
        onPlayAudio(audio)
      } else {
        const element = new Audio(audio)
        element.play().catch(() => null)
      }
      container.alpha = 0.72
      setTimeout(() => {
        container.alpha = 1
      }, 180)
    })
  } else if (fallbackText) {
    fallbackLabel = new PIXI.Text(fallbackText, new PIXI.TextStyle({
      fontFamily: 'Poppins',
      fontSize: 20,
      fill: '#475569',
      wordWrap: true,
      wordWrapWidth: width + 120
    }))
    fallbackLabel.x = x
    fallbackLabel.y = y + height + 12
  }

  return { control: container, fallbackLabel }
}

export function createFallbackCard({
  width = 360,
  height = 240,
  color = '#64748b',
  icon = '🪄',
  title = 'Imagina la escena',
  subtitle = 'Sin imagen disponible'
} = {}) {
  const container = new PIXI.Container()

  const background = new PIXI.Graphics()
  background.beginFill(parseColor(color))
  background.drawRoundedRect(0, 0, width, height, 28)
  background.endFill()

  const iconText = new PIXI.Text(icon, new PIXI.TextStyle({ fontSize: 64 }))
  iconText.x = width / 2 - iconText.width / 2
  iconText.y = height / 2 - iconText.height

  const titleText = new PIXI.Text(title, new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 24,
    fill: '#ffffff',
    align: 'center',
    wordWrap: true,
    wordWrapWidth: width - 40
  }))
  titleText.x = width / 2 - titleText.width / 2
  titleText.y = iconText.y + iconText.height + 12

  const subtitleText = new PIXI.Text(subtitle, new PIXI.TextStyle({
    fontFamily: 'Poppins',
    fontSize: 18,
    fill: '#e2e8f0',
    align: 'center',
    wordWrap: true,
    wordWrapWidth: width - 40
  }))
  subtitleText.x = width / 2 - subtitleText.width / 2
  subtitleText.y = titleText.y + titleText.height + 4

  container.addChild(background, iconText, titleText, subtitleText)
  return container
}
