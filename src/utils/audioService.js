let audioActual = null
let objectUrlActual = null

function limpiarAudioActual() {
  if (audioActual) {
    audioActual.pause()
    audioActual.currentTime = 0
    audioActual = null
  }

  if (objectUrlActual) {
    URL.revokeObjectURL(objectUrlActual)
    objectUrlActual = null
  }
}

export async function reproducirFrase(frase) {
  try {
    const texto = String(frase ?? '').trim()

    if (!texto) {
      throw new Error('No hay texto para generar audio.')
    }

    const respuesta = await fetch('/api/generar-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ texto })
    })

    if (!respuesta.ok) {
      throw new Error(`Error al generar audio: ${respuesta.status}`)
    }

    const audioBlob = await respuesta.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    limpiarAudioActual()

    const audio = new Audio(audioUrl)
    audioActual = audio
    objectUrlActual = audioUrl

    audio.onended = () => {
      limpiarAudioActual()
    }

    audio.onerror = () => {
      limpiarAudioActual()
      console.error('No se pudo reproducir el audio generado.')
    }

    await audio.play()
    return audio
  } catch (error) {
    console.error('Error en reproducirFrase:', error)
    throw error
  }
}

export default {
  reproducirFrase
}
