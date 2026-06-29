import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, 'scripts/audio/app_voice_audio_manifest.json')
const CONFIG_PATH = path.join(ROOT, 'scripts/audio/voiceConfig.json')
const OUTPUT_DIR = path.join(ROOT, 'public/audio/app-voice')
const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run') || args.has('--dry')
const force = args.has('--force')
const category = readArgValue('--category')
const categoryPrefix = readArgValue('--category-prefix')
const id = readArgValue('--id')
const idPrefix = readArgValue('--id-prefix')
const onlyExercises = args.has('--only-exercises')

function readArgValue(name) {
  const prefix = `${name}=`
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix))
  return match ? match.slice(prefix.length).trim() : ''
}

function isValidFilename(filename = '') {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.mp3$/.test(String(filename || '').trim())
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

function validateManifest(manifest) {
  if (!Array.isArray(manifest)) {
    throw new Error('El manifest debe ser un array de items.')
  }

  const filenames = new Set()
  const ids = new Set()

  return manifest.map((item, index) => {
    const normalized = {
      id: String(item?.id || '').trim(),
      text: String(item?.text || '').trim(),
      filename: String(item?.filename || '').trim(),
      category: String(item?.category || 'general').trim() || 'general'
    }

    if (!normalized.id) throw new Error(`Item ${index + 1}: falta id.`)
    if (!normalized.text) throw new Error(`Item ${index + 1} (${normalized.id}): falta text.`)
    if (!isValidFilename(normalized.filename)) {
      throw new Error(`Item ${index + 1} (${normalized.id}): filename invalido.`)
    }
    if (ids.has(normalized.id)) throw new Error(`ID duplicado en manifest: ${normalized.id}`)
    if (filenames.has(normalized.filename)) throw new Error(`Archivo duplicado en manifest: ${normalized.filename}`)

    ids.add(normalized.id)
    filenames.add(normalized.filename)
    return normalized
  })
}

function resolveVoiceId(config) {
  return String(config.voiceId || process.env.ELEVENLABS_VOICE_ID || '').trim()
}

async function generateItem(item, config, apiKey, voiceId) {
  const url = new URL(`${ELEVENLABS_TTS_URL}/${encodeURIComponent(voiceId)}`)
  url.searchParams.set('output_format', config.outputFormat || 'mp3_44100_128')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: item.text,
      model_id: config.modelId || 'eleven_multilingual_v2',
      voice_settings: {
        stability: Number(config.stability ?? 0.5),
        similarity_boost: Number(config.similarityBoost ?? 0.75),
        style: Number(config.style ?? 0.2),
        use_speaker_boost: config.useSpeakerBoost !== false,
        speed: Number(config.speed ?? 1)
      }
    })
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`ElevenLabs ${response.status}: ${detail}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.writeFile(path.join(OUTPUT_DIR, item.filename), buffer)
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const [manifestRaw, config] = await Promise.all([
    readJson(MANIFEST_PATH),
    readJson(CONFIG_PATH)
  ])
  const manifest = validateManifest(manifestRaw).filter((item) => {
    if (onlyExercises && !item.category.startsWith('level-')) return false
    if (category && item.category !== category) return false
    if (categoryPrefix && !item.category.startsWith(categoryPrefix)) return false
    if (id && item.id !== id) return false
    if (idPrefix && !item.id.startsWith(idPrefix)) return false
    return true
  })
  const apiKey = String(process.env.ELEVENLABS_API_KEY || '').trim()
  const voiceId = resolveVoiceId(config)

  let generated = 0
  let skipped = 0
  let failed = 0

  console.log(`[audio:generate] total detectados: ${manifest.length}`)
  if (dryRun) {
    console.log('[audio:generate] modo dry-run: no se generaran archivos.')
  }

  if (!dryRun && !apiKey) {
    throw new Error('Falta ELEVENLABS_API_KEY en .env.')
  }
  if (!dryRun && !voiceId) {
    throw new Error('Falta voiceConfig.voiceId o ELEVENLABS_VOICE_ID en .env.')
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  for (const item of manifest) {
    const outputFile = path.join(OUTPUT_DIR, item.filename)
    const exists = await fileExists(outputFile)

    if (exists && !force) {
      skipped += 1
      console.log(`[audio:generate] omitido: ${item.filename}`)
      continue
    }

    if (dryRun) {
      skipped += 1
      console.log(`[audio:generate] pendiente: ${item.filename}`)
      continue
    }

    try {
      await generateItem(item, config, apiKey, voiceId)
      generated += 1
      console.log(`[audio:generate] generado: ${item.filename}`)
    } catch (error) {
      failed += 1
      console.warn(`[audio:generate] fallo ${item.filename}: ${error?.message || error}`)
    }
  }

  console.log(`[audio:generate] generados: ${generated}`)
  console.log(`[audio:generate] omitidos: ${skipped}`)
  console.log(`[audio:generate] fallidos: ${failed}`)

  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('[audio:generate]', error?.message || error)
  process.exitCode = 1
})
