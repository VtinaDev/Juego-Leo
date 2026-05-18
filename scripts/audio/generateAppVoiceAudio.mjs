import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { AUDIO_COPY, AUDIO_EXPERIENCE } from '../../src/engine/audio/audioExperience.js'

const ROOT = process.cwd()
const TEMPLATES_PATH = path.join(ROOT, 'src/engine/logic/data/templates.json')
const PUBLIC_DIR = path.join(ROOT, 'public')
const OUT_DIR = path.join(PUBLIC_DIR, 'audio/voice/exercises/generated')
const OUT_MANIFEST_JSON = path.join(ROOT, 'scripts/audio/app_voice_audio_manifest.json')
const OUT_MANIFEST_CSV = path.join(ROOT, 'scripts/audio/app_voice_audio_manifest.csv')

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini-tts'
const DEFAULT_OPENAI_VOICE = 'coral'
const DEFAULT_ELEVENLABS_MODEL = 'eleven_multilingual_v2'
const DEFAULT_ELEVENLABS_FORMAT = 'mp3_44100_128'

const args = parseArgs(process.argv.slice(2))
const dryRun = args.dry || args['dry-run']
const scope = args.scope || (args.all ? 'all' : 'missing')
const writeTemplates = args['write-templates'] !== false
const overwrite = Boolean(args.overwrite || scope === 'all')
const includeGlobalCues = args['include-global-cues'] !== false
const limit = Number.isFinite(Number(args.limit)) ? Number(args.limit) : Infinity
const delayMs = Number.isFinite(Number(args.delay)) ? Number(args.delay) : 250

function parseArgs(argv) {
  const parsed = {}
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const body = arg.slice(2)
    if (body.startsWith('no-')) {
      parsed[body.slice(3)] = false
      continue
    }
    const [key, ...rest] = body.split('=')
    parsed[key] = rest.length ? rest.join('=') : true
  }
  return parsed
}

function normalizeText(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function slugify(value = '') {
  return normalizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function csvEscape(value = '') {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function publicRouteToFile(route = '') {
  const clean = String(route || '').replace(/^\//, '')
  return path.join(PUBLIC_DIR, clean)
}

function fileExistsForRoute(route = '') {
  if (!route) return false
  return fs.existsSync(publicRouteToFile(route))
}

function getExerciseText(exercise = {}) {
  const type = String(exercise.type || exercise.subtype || '').toUpperCase()
  if (type === 'COMPLETE_WORD') {
    const solution = normalizeText(exercise.solution ?? exercise.correct ?? exercise.answer)
    if (solution) return `Completa la palabra: ${solution}.`
  }

  const fields = ['instruction', 'prompt', 'question', 'sentence', 'text', 'reading', 'context', 'fallbackText', 'title', 'hint']
  for (const field of fields) {
    const text = normalizeText(exercise[field])
    if (text) return text
  }

  if (Array.isArray(exercise.correctOrder) && exercise.correctOrder.length) {
    return `Ordena las piezas: ${exercise.correctOrder.join(' ')}.`
  }

  if (Array.isArray(exercise.syllables) && exercise.syllables.length) {
    return `Ordena las silabas: ${exercise.syllables.join(', ')}.`
  }

  return ''
}

function getStyleInstructions() {
  return [
    'Voz en espanol para una app infantil de lectura.',
    `Tono: ${AUDIO_EXPERIENCE.tone.intent}.`,
    'Habla como una guia cercana: clara, paciente, segura y amable.',
    'Ritmo pausado, diccion muy nitida, energia moderada y sonrisa suave.',
    'Evita dramatizar, reganar, sonar urgente o usar tono de error.',
    'Frases cortas, una idea por vez, con pausas naturales para ninos neurodivergentes de 4 a 10 anos.'
  ].join(' ')
}

function collectGlobalCues() {
  return [
    {
      id: 'global-home-welcome',
      kind: 'global',
      route: '/audio/voice/home-welcome.mp3',
      text: 'Hola. Bienvenido a Juego Leo. Vamos a leer con calma y alegria.'
    },
    {
      id: 'global-home-start',
      kind: 'global',
      route: '/audio/voice/home-start.mp3',
      text: 'Cuando estes listo, empezamos paso a paso.'
    },
    {
      id: 'global-exercise-success',
      kind: 'global',
      route: '/audio/voice/exercise-succes.mp3',
      text: AUDIO_COPY.success
    },
    {
      id: 'global-exercise-try-again',
      kind: 'global',
      route: '/audio/voice/exercise-try-again.mp3',
      text: AUDIO_COPY.retryFirst
    },
    {
      id: 'global-positive-1',
      kind: 'global',
      route: '/audio/voice/positive1.mp3',
      text: 'Muy bien. Sigue asi, con calma.'
    },
    {
      id: 'global-positive-2',
      kind: 'global',
      route: '/audio/voice/positive2.mp3',
      text: 'Excelente esfuerzo. Lo estas haciendo muy bien.'
    },
    {
      id: 'global-positive-3',
      kind: 'global',
      route: '/audio/voice/positive3.mp3',
      text: 'Buen trabajo. Respira y continuamos.'
    }
  ]
}

function collectExerciseItems(templates) {
  const items = []

  for (const [levelKey, levelDef] of Object.entries(templates || {})) {
    const order = Array.isArray(levelDef.order) ? levelDef.order : Object.keys(levelDef.subtypes || {})
    order.forEach((subtype, stageIndex) => {
      const list = levelDef.subtypes?.[subtype] || []
      list.forEach((exercise, index) => {
        const id = exercise.id || `L${levelKey}-${slugify(subtype)}-${index + 1}`
        const filename = `${slugify(id)}.mp3`
        const route = `/audio/voice/exercises/generated/${filename}`
        const text = getExerciseText(exercise)
        if (!text) return

        items.push({
          id,
          kind: 'exercise',
          level: Number(levelKey),
          stage: stageIndex + 1,
          subtype,
          type: exercise.type || subtype,
          route,
          text,
          existingRoute: exercise.audio || '',
          hasExistingAudio: fileExistsForRoute(exercise.audio || ''),
          templateRef: { levelKey, subtype, index }
        })
      })
    })
  }

  return items
}

function chooseProvider() {
  const requested = String(args.provider || 'auto').toLowerCase()
  if (requested !== 'auto') return requested
  if (process.env.ELEVENLABS_API_KEY && (process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE)) {
    return 'elevenlabs'
  }
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'none'
}

async function generateWithElevenLabs(item, outputFile) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE
  if (!apiKey || !voiceId) {
    throw new Error('Faltan ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID para generar con ElevenLabs.')
  }

  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`)
  url.searchParams.set('output_format', process.env.ELEVENLABS_OUTPUT_FORMAT || DEFAULT_ELEVENLABS_FORMAT)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': 'application/json',
      accept: 'audio/mpeg'
    },
    body: JSON.stringify({
      text: item.text,
      model_id: process.env.ELEVENLABS_MODEL_ID || DEFAULT_ELEVENLABS_MODEL,
      voice_settings: {
        stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.72),
        similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY_BOOST ?? 0.82),
        style: Number(process.env.ELEVENLABS_STYLE ?? 0.18),
        use_speaker_boost: process.env.ELEVENLABS_SPEAKER_BOOST !== 'false',
        speed: Number(process.env.ELEVENLABS_SPEED ?? 0.92)
      }
    })
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`)
  }

  await writeBinaryResponse(response, outputFile)
}

async function generateWithOpenAI(item, outputFile) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Falta OPENAI_API_KEY para generar con OpenAI TTS.')

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || DEFAULT_OPENAI_MODEL,
      voice: process.env.OPENAI_TTS_VOICE || DEFAULT_OPENAI_VOICE,
      input: item.text,
      instructions: getStyleInstructions(),
      response_format: 'mp3',
      speed: Number(process.env.OPENAI_TTS_SPEED ?? 0.88)
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI TTS ${response.status}: ${await response.text()}`)
  }

  await writeBinaryResponse(response, outputFile)
}

async function writeBinaryResponse(response, outputFile) {
  const arrayBuffer = await response.arrayBuffer()
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, Buffer.from(arrayBuffer))
}

function writeManifests(items, selectedItems, provider) {
  const payload = {
    generatedAt: new Date().toISOString(),
    provider,
    scope,
    overwrite,
    dryRun,
    style: AUDIO_EXPERIENCE.tone,
    totalItems: items.length,
    selectedItems: selectedItems.length,
    items: selectedItems.map(({ templateRef, ...item }) => item)
  }
  fs.writeFileSync(OUT_MANIFEST_JSON, JSON.stringify(payload, null, 2))

  const header = ['kind', 'level', 'stage', 'exercise_id', 'subtype', 'route', 'text', 'has_existing_audio']
  const rows = [header.join(',')]
  selectedItems.forEach((item) => {
    rows.push([
      item.kind,
      item.level ?? '',
      item.stage ?? '',
      item.id,
      item.subtype ?? '',
      item.route,
      item.text,
      item.hasExistingAudio ?? fileExistsForRoute(item.route)
    ].map(csvEscape).join(','))
  })
  fs.writeFileSync(OUT_MANIFEST_CSV, `${rows.join('\n')}\n`)
}

function applyTemplateRoutes(templates, selectedItems) {
  for (const item of selectedItems) {
    if (item.kind !== 'exercise' || !item.templateRef) continue
    const { levelKey, subtype, index } = item.templateRef
    const exercise = templates[levelKey]?.subtypes?.[subtype]?.[index]
    if (!exercise) continue
    exercise.audio = item.route
  }
  fs.writeFileSync(TEMPLATES_PATH, `${JSON.stringify(templates, null, 2)}\n`)
}

async function main() {
  const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, 'utf8'))
  const globalItems = includeGlobalCues ? collectGlobalCues() : []
  const exerciseItems = collectExerciseItems(templates)
  const allItems = [...globalItems, ...exerciseItems]
  const selected = allItems
    .filter((item) => {
      if (scope === 'all') return true
      if (item.kind === 'global') return !fileExistsForRoute(item.route)
      return !fileExistsForRoute(item.route) && (!item.hasExistingAudio || overwrite)
    })
    .slice(0, limit)

  const provider = chooseProvider()
  writeManifests(allItems, selected, provider)

  if (dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      provider,
      scope,
      overwrite,
      manifest: path.relative(ROOT, OUT_MANIFEST_JSON),
      csv: path.relative(ROOT, OUT_MANIFEST_CSV),
      totalItems: allItems.length,
      selectedItems: selected.length,
      templatesUpdated: false
    }, null, 2))
    return
  }

  if (provider === 'none') {
    throw new Error('No hay proveedor configurado. Define ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID, o OPENAI_API_KEY.')
  }

  let generated = 0
  let skipped = 0

  for (const item of selected) {
    const outputFile = publicRouteToFile(item.route)
    if (!overwrite && fs.existsSync(outputFile)) {
      skipped += 1
      continue
    }

    if (provider === 'elevenlabs') await generateWithElevenLabs(item, outputFile)
    else if (provider === 'openai') await generateWithOpenAI(item, outputFile)
    else throw new Error(`Proveedor no soportado: ${provider}`)

    generated += 1
    console.log(`[audio] ${generated}/${selected.length} ${item.route}`)
    if (delayMs > 0) await wait(delayMs)
  }

  if (writeTemplates && selected.length > 0) {
    applyTemplateRoutes(templates, selected.filter((item) => item.kind === 'exercise'))
  }

  console.log(JSON.stringify({
    provider,
    scope,
    overwrite,
    generated,
    skipped,
    selectedItems: selected.length,
    templatesUpdated: writeTemplates,
    manifest: path.relative(ROOT, OUT_MANIFEST_JSON)
  }, null, 2))
}

main().catch((error) => {
  console.error('[generate-app-voice-audio]', error?.message || error)
  process.exitCode = 1
})
