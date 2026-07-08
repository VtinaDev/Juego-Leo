import { SoundService } from '../../audio/SoundService'
import { ICONS } from '../../../constants/icons'

const LEVEL_CELEBRATIONS = {
  1: {
    title: 'La fuerza tranquila',
    message: '¡Bravo! Has despertado la fuerza del Oso Perezoso.',
    starCount: 1
  },
  2: {
    title: 'Palabras mágicas',
    message: '¡Fantástico! Eres tan astuto como un Zorro.',
    starCount: 2
  },
  3: {
    title: 'Mono curioso',
    message: '¡Asombroso! Ya eres un mono sabio.',
    starCount: 3
  },
  4: {
    title: 'Escritura con magia',
    message: '¡Excelente! Eres un mono muy listo.',
    starCount: 4
  },
  5: {
    title: 'Elefante sabiondo',
    message: '¡Impresionante! Te has convertido en el Elefante Sabiondo.',
    starCount: 5
  }
}

function createOverlay({ title, message, icon, color, diploma, starCount = 0 }) {
  if (typeof document === 'undefined') return null
  const overlay = document.createElement('div')
  overlay.setAttribute('data-celebration', 'true')
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.right = '0'
  overlay.style.bottom = '0'
  overlay.style.display = 'flex'
  overlay.style.flexDirection = 'column'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.background = 'rgba(15, 23, 42, 0.76)'
  overlay.style.zIndex = '9999'
  overlay.style.backdropFilter = 'blur(4px)'

  const card = document.createElement('div')
  card.style.background = '#ffffff'
  card.style.borderRadius = '24px'
  card.style.padding = '32px 48px'
  card.style.boxShadow = '0 20px 60px rgba(15, 23, 42, 0.3)'
  card.style.textAlign = 'center'
  card.style.maxWidth = '420px'
  card.style.fontFamily = 'Poppins, sans-serif'

  const iconEl = document.createElement('div')
  iconEl.style.marginBottom = '12px'
  const isImage = typeof icon === 'string' && (icon.startsWith('/') || icon.startsWith('http'))
  if (isImage) {
    const img = document.createElement('img')
    img.src = icon
    img.alt = 'Celebración'
    img.style.width = '72px'
    img.style.height = '72px'
    img.style.objectFit = 'contain'
    img.style.filter = 'drop-shadow(0 8px 18px rgba(15,23,42,0.3))'
    iconEl.appendChild(img)
  } else {
    iconEl.textContent = icon ?? '🪄'
    iconEl.style.fontSize = '48px'
  }

  const titleEl = document.createElement('h2')
  titleEl.textContent = title
  titleEl.style.fontSize = '24px'
  titleEl.style.margin = '0'
  titleEl.style.color = color ?? '#1d4ed8'

  const messageEl = document.createElement('p')
  messageEl.textContent = message
  messageEl.style.fontSize = '18px'
  messageEl.style.marginTop = '12px'
  messageEl.style.color = '#1f2937'

  card.appendChild(iconEl)
  card.appendChild(titleEl)
  card.appendChild(messageEl)

  if (starCount > 0) {
    const starsEl = document.createElement('div')
    starsEl.style.display = 'inline-flex'
    starsEl.style.alignItems = 'center'
    starsEl.style.justifyContent = 'center'
    starsEl.style.gap = '6px'
    starsEl.style.marginTop = '14px'

    Array.from({ length: starCount }, () => {
      const star = document.createElement('img')
      star.src = ICONS.star
      star.alt = ''
      star.setAttribute('aria-hidden', 'true')
      star.style.width = '34px'
      star.style.height = '34px'
      star.style.objectFit = 'contain'
      star.style.filter = 'drop-shadow(0 6px 10px rgba(249, 158, 11, 0.28))'
      starsEl.appendChild(star)
    })

    card.appendChild(starsEl)
  }

  if (diploma) {
    const diplomaEl = document.createElement('p')
    diplomaEl.textContent = diploma
    diplomaEl.style.marginTop = '16px'
    diplomaEl.style.fontSize = '16px'
    diplomaEl.style.color = '#0f172a'
    card.appendChild(diplomaEl)
  }

  overlay.appendChild(card)
  document.body.appendChild(overlay)
  return overlay
}

function removeExistingOverlay() {
  if (typeof document === 'undefined') return
  document
    .querySelectorAll('[data-celebration="true"]')
    .forEach((node) => node.parentElement?.removeChild(node))
}

class CelebrationControllerImpl {
  play({ level, summary, meta }) {
    if (typeof window === 'undefined') return

    const config = LEVEL_CELEBRATIONS[level] ?? LEVEL_CELEBRATIONS[1]
    const icon = meta?.celebrationIcon ?? ICONS.celebration
    const color = meta?.color ?? '#2563eb'

    removeExistingOverlay()
    SoundService.play('celebration')

    const isDiploma = level === 5 && summary?.stageIndex === summary?.totalStages
    const overlay = createOverlay({
      title: config.title,
      message: isDiploma ? '¡Impresionante! Te has convertido en el Elefante Sabiondo.' : config.message,
      icon,
      color,
      starCount: config.starCount,
      diploma: isDiploma
        ? 'Has completado la Escuela Mágica de los Animales Sabios.'
        : undefined
    })

    if (overlay) {
      setTimeout(() => {
        overlay.style.opacity = '0'
        overlay.style.transition = 'opacity 320ms ease'
        setTimeout(() => {
          overlay.parentElement?.removeChild(overlay)
        }, 360)
      }, isDiploma ? 3200 : 1800)
    }
  }
}

export const CelebrationController = new CelebrationControllerImpl()

export default CelebrationController
