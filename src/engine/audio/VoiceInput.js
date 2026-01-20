const DEFAULT_LANG = 'es-ES'

export class VoiceInput {
  constructor({ lang = DEFAULT_LANG } = {}) {
    this.lang = lang
    this.support = detectBrowserSupport()
    this.recognition = null
    this.isListening = false

    if (this.support === 'browser') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.lang = this.lang
      this.recognition.continuous = false
      this.recognition.interimResults = false
    }
  }

  async listen(onResult, onError) {
    if (this.support === 'capacitor') {
      await ensureCapacitorPermission().catch((err) => {
        onError?.(err?.message || 'Permiso de micrófono denegado')
        return Promise.reject(err)
      })
      return startCapacitorRecognition(onResult, onError, this.lang)
    }

    if (!this.recognition) {
      onError?.('Reconocimiento de voz no disponible en este dispositivo.')
      return
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (transcript) onResult?.(transcript)
      this.isListening = false
    }

    this.recognition.onerror = (event) => {
      onError?.(event.error)
      this.isListening = false
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    this.recognition.start()
    this.isListening = true
  }

  stop() {
    if (this.support === 'capacitor') {
      stopCapacitorRecognition()
      this.isListening = false
      return
    }
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }
}

function detectBrowserSupport() {
  if (typeof window === 'undefined') return null
  const hasBrowserRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  if (hasBrowserRecognition) return 'browser'
  if (window.Capacitor?.isNativePlatform?.()) return 'capacitor'
  return null
}

let capacitorPlugin = null

async function ensureCapacitorPermission() {
  if (!window.Capacitor?.Plugins) throw new Error('Capacitor no disponible')
  capacitorPlugin =
    capacitorPlugin || window.Capacitor.Plugins?.SpeechRecognition || (await importCapacitorPlugin())
  if (!capacitorPlugin?.requestPermission) return
  const granted = await capacitorPlugin.requestPermission()
  if (!granted?.granted && !granted?.status === 'granted') {
    throw new Error('Permiso de micrófono no concedido')
  }
}

async function startCapacitorRecognition(onResult, onError, lang) {
  if (!capacitorPlugin) return
  try {
    await capacitorPlugin.start({
      locale: lang,
      partialResults: false,
      prompt: 'Habla ahora',
      popup: false
    })
    capacitorPlugin.addListener('partialResults', () => {})
    capacitorPlugin.addListener('result', (event) => {
      const transcript = event?.matches?.[0]
      if (transcript) onResult?.(transcript.trim())
      stopCapacitorRecognition()
    })
  } catch (error) {
    onError?.(error?.message || 'Error en reconocimiento')
  }
}

function stopCapacitorRecognition() {
  capacitorPlugin?.stop?.()
}

async function importCapacitorPlugin() {
  try {
    const module = await import('@capacitor-community/speech-recognition')
    return module?.SpeechRecognition
  } catch (error) {
    console.warn('No se pudo cargar el plugin de SpeechRecognition:', error)
    return null
  }
}

export default VoiceInput
