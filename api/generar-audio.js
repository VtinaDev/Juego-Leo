const MAX_TEXT_LENGTH = 4096
const ELEVENLABS_TTS_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

function setCorsHeaders(res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(statusCode).json(payload)
}

function getRequestBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

function getNumberEnv(name, fallback) {
  const value = Number(process.env[name])
  return Number.isFinite(value) ? value : fallback
}

function getBooleanEnv(name, fallback) {
  const value = String(process.env[name] ?? '').trim().toLowerCase()
  if (!value) return fallback
  return value === 'true' || value === '1' || value === 'yes'
}

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return sendJson(res, 405, { error: 'Metodo no permitido. Usa POST.' })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ID_VOICE || process.env.ELEVENLABS_VOICE_ID

  if (!apiKey) {
    return sendJson(res, 500, { error: 'ELEVENLABS_API_KEY no esta configurada.' })
  }

  if (!voiceId) {
    return sendJson(res, 500, { error: 'ID_VOICE o ELEVENLABS_VOICE_ID no esta configurada.' })
  }

  const body = getRequestBody(req)
  const texto = String(body.texto ?? body.text ?? body.input ?? '').trim()

  if (!texto) {
    return sendJson(res, 400, { error: 'Debes enviar un campo "texto" en JSON.' })
  }

  if (texto.length > MAX_TEXT_LENGTH) {
    return sendJson(res, 413, {
      error: `El texto supera el maximo de ${MAX_TEXT_LENGTH} caracteres.`
    })
  }

  try {
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5'
    const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_44100_128'
    const response = await fetch(
      `${ELEVENLABS_TTS_BASE_URL}/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(outputFormat)}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: texto,
          model_id: modelId,
          voice_settings: {
            stability: getNumberEnv('ELEVENLABS_EXERCISE_STABILITY', 0.58),
            similarity_boost: getNumberEnv('ELEVENLABS_EXERCISE_SIMILARITY_BOOST', 0.8),
            style: getNumberEnv('ELEVENLABS_EXERCISE_STYLE', 0.38),
            use_speaker_boost: getBooleanEnv('ELEVENLABS_EXERCISE_SPEAKER_BOOST', false),
            speed: getNumberEnv('ELEVENLABS_EXERCISE_SPEED', 1.08)
          }
        })
      }
    )

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      return sendJson(res, response.status, {
        error: 'No se pudo generar el audio con ElevenLabs.',
        detail
      })
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer())

    setCorsHeaders(res)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', String(audioBuffer.length))
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Disposition', 'inline; filename="audio.mp3"')

    return res.status(200).send(audioBuffer)
  } catch (error) {
    console.error('[api/generar-audio]', error)
    return sendJson(res, 500, {
      error: 'No se pudo generar el audio con ElevenLabs.',
      detail: error?.message || 'Error desconocido'
    })
  }
}
