const APP_VOICE_BASE_PATH = '/audio/app-voice'

let activeAppVoiceAudio = null
let playbackSessionId = 0

function normalizeLocalAudioPath(value = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const clean = raw.split('?')[0].split('#')[0].replace(/\\/g, '/')
  if (!/\.mp3$/i.test(clean)) return ''
  if (clean.startsWith('/audio/')) return clean
  if (clean.startsWith('audio/')) return `/${clean}`
  return ''
}

function normalizeFilename(filename = '') {
  const raw = String(filename || '').trim()
  if (!raw) return ''
  const clean = raw.split('?')[0].split('#')[0]
  const basename = clean.replace(/\\/g, '/').split('/').pop()
  if (!basename || !/\.mp3$/i.test(basename)) return ''
  return basename
}

function resolveAudioSources(filename = '') {
  const normalizedFilename = normalizeFilename(filename)
  if (!normalizedFilename) return []

  const originalPath = normalizeLocalAudioPath(filename)
  if (originalPath?.startsWith(`${APP_VOICE_BASE_PATH}/`)) return [originalPath]

  return [`${APP_VOICE_BASE_PATH}/${encodeURIComponent(normalizedFilename)}`]
}

export function stopAppVoiceAudio() {
  playbackSessionId += 1
  if (!activeAppVoiceAudio) return
  activeAppVoiceAudio.pause()
  activeAppVoiceAudio.currentTime = 0
  activeAppVoiceAudio = null
}

export async function playAppVoiceAudio(filename, options = {}) {
  const sources = resolveAudioSources(filename)
  if (!sources.length || typeof Audio === 'undefined') {
    options.onEnd?.()
    return false
  }

  if (options.interrupt !== false) {
    stopAppVoiceAudio()
  }

  const sessionId = ++playbackSessionId
  const volume = Math.min(Math.max(Number(options.volume ?? 1), 0), 1)

  for (const [index, src] of sources.entries()) {
    if (sessionId !== playbackSessionId) return false

    const played = await new Promise((resolve) => {
      const audio = new Audio(src)
      let settled = false

      const finishStart = (result) => {
        if (settled) return
        settled = true
        resolve(result)
      }

      audio.preload = 'auto'
      audio.volume = volume
      activeAppVoiceAudio = audio

      audio.onplaying = () => {
        if (sessionId !== playbackSessionId) {
          audio.pause()
          audio.currentTime = 0
          finishStart(false)
          return
        }
        finishStart(true)
      }
      audio.onended = () => {
        if (activeAppVoiceAudio === audio) activeAppVoiceAudio = null
        if (sessionId === playbackSessionId) options.onEnd?.()
      }
      audio.onerror = () => {
        if (activeAppVoiceAudio === audio) activeAppVoiceAudio = null
        finishStart(false)
      }

      audio.play().then(() => {
        if (sessionId !== playbackSessionId) {
          audio.pause()
          audio.currentTime = 0
          finishStart(false)
          return
        }
        finishStart(true)
      }).catch((error) => {
        if (activeAppVoiceAudio === audio) activeAppVoiceAudio = null
        const blockedByAutoplay = error?.name === 'NotAllowedError'
        if (blockedByAutoplay) {
          console.warn('[audioPlayer] El navegador bloqueó el audio hasta una interacción del usuario.', error)
          finishStart(false)
          return
        }
        finishStart(false)
      })
    })

    if (played) return true
    if (index < sources.length - 1) continue
  }

  if (sessionId === playbackSessionId) {
    console.warn(`[audioPlayer] Audio local no disponible: ${normalizeFilename(filename)}`)
    options.onEnd?.()
  }
  return false
}
