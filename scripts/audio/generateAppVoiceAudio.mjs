import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { AUDIO_COPY, AUDIO_EXPERIENCE } from '../../src/engine/audio/audioExperience.js'

const ROOT = process.cwd()
const TEMPLATES_PATH = path.join(ROOT, 'src/engine/logic/data/templates.json')
const PUBLIC_DIR = path.join(ROOT, 'public')
const OUT_MANIFEST_JSON = path.join(ROOT, 'scripts/audio/app_voice_audio_manifest.json')
const OUT_MANIFEST_CSV = path.join(ROOT, 'scripts/audio/app_voice_audio_manifest.csv')

const DEFAULT_ELEVENLABS_VOICE_ID = 'IvWkxlWQtJVT34p1Pt9D'
const DEFAULT_ELEVENLABS_MODEL = 'eleven_flash_v2_5'
const DEFAULT_ELEVENLABS_FORMAT = 'mp3_44100_128'
const DEFAULT_EXERCISE_VOICE_SETTINGS = {
  stability: 0.58,
  similarityBoost: 0.8,
  style: 0.38,
  speakerBoost: false,
  speed: 1.08
}
const DEFAULT_REWARD_VOICE_SETTINGS = {
  stability: 0.58,
  similarityBoost: 0.8,
  style: 0.38,
  speakerBoost: false,
  speed: 1.08
}

const args = parseArgs(process.argv.slice(2))
const dryRun = args.dry || args['dry-run']
const scope = args.scope || (args.all ? 'all' : 'missing')
const writeTemplates = args['write-templates'] !== false
const overwrite = Boolean(args.overwrite || scope === 'all')
const includeGlobalCues = args['include-global-cues'] !== false
const syncRoutesOnly = Boolean(args['sync-routes-only'])
const limit = Number.isFinite(Number(args.limit)) ? Number(args.limit) : Infinity
const delayMs = Number.isFinite(Number(args.delay)) ? Number(args.delay) : 250
const selectedIds = parseIdSet(args.ids || args.id)
const startAfterId = args['start-after'] && args['start-after'] !== true ? String(args['start-after']).trim() : ''

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

function parseIdSet(value) {
  if (!value || value === true) return null
  const ids = String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return ids.length ? new Set(ids) : null
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

function blankReplacementText() {
  return normalizeText(process.env.AUDIO_BLANK_REPLACEMENT || 'espacio para completar')
}

function choicesConnectorText() {
  return normalizeText(process.env.AUDIO_CHOICES_CONNECTOR ?? '')
}

function symbolToSpeech(value = '') {
  const text = normalizeText(value)
  const symbolMap = {
    '.': 'punto final',
    ',': 'coma',
    ';': 'punto y coma',
    ':': 'dos puntos',
    '?': 'signo de pregunta',
    '¿': 'signo de apertura de pregunta',
    '!': 'signo de exclamacion',
    '¡': 'signo de apertura de exclamacion'
  }

  if (symbolMap[text]) return symbolMap[text]
  if (/^[.,;:¿?¡!]+$/.test(text)) {
    return Array.from(text).map((symbol) => symbolMap[symbol]).filter(Boolean).join(', ')
  }
  return ''
}

function cleanSpeechSegment(value = '') {
  return normalizeText(value)
    .replace(/\s*_{2,}\s*/g, `, ${blankReplacementText()}, `)
    .replace(/\s+:/g, ':')
    .replace(/:\s*([.!?])/g, '$1')
    .replace(/,\s*([.!?])/g, '$1')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,;:!?]){2,}/g, '$1')
    .replace(/:$/g, '')
    .trim()
}

function getAnswerText(exercise = {}) {
  const answer = exercise.correct ?? exercise.answer ?? exercise.solution ?? exercise.expectedAnswer
  if (Array.isArray(answer)) return answer.map(textFromOption).filter(Boolean).join(' ')
  return textFromOption(answer)
}

function speechTextForField(exercise = {}, field = '') {
  const value = exercise[field]
  const raw = normalizeText(value)
  if (!raw) return ''
  if (!raw.includes('__')) return raw

  const answer = getAnswerText(exercise)
  if (!answer) return raw

  return raw.replace(/_{2,}/g, answer)
}

function stripFinalPunctuation(value = '') {
  const text = cleanSpeechSegment(value)
  return text.replace(/[.,;:!?]+$/g, '').trim() || text
}

function joinSpeechSegments(segments = []) {
  return segments
    .map(cleanSpeechSegment)
    .filter(Boolean)
    .map((segment) => segment.replace(/[,;:]+$/g, '').trim())
    .map((segment) => (/[.!?]$/.test(segment) ? segment : `${segment}.`))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function pushUniqueText(target, value) {
  const text = cleanSpeechSegment(value)
  if (!text) return
  if (!target.some((item) => item.toLowerCase() === text.toLowerCase())) {
    target.push(text)
  }
}

function textFromOption(option) {
  if (option == null) return ''
  if (typeof option === 'string' || typeof option === 'number') {
    return cleanSpeechSegment(symbolToSpeech(option) || option)
  }
  if (typeof option !== 'object') return ''

  const fields = ['text', 'label', 'value', 'word', 'match', 'letter', 'syllable', 'title', 'answer', 'name']
  for (const field of fields) {
    const text = cleanSpeechSegment(symbolToSpeech(option[field]) || option[field])
    if (text) return text
  }

  return ''
}

function collectOptionTexts(exercise = {}) {
  const options = []
  const optionFields = ['options', 'choices', 'answers', 'items', 'fragments', 'pieces', 'segments', 'words', 'letters']

  optionFields.forEach((field) => {
    const value = exercise[field]
    if (!Array.isArray(value)) return
    value.forEach((option) => pushUniqueText(options, textFromOption(option)))
  })

  if (Array.isArray(exercise.correctOrder)) {
    exercise.correctOrder.forEach((option) => pushUniqueText(options, option))
  }

  if (Array.isArray(exercise.syllables)) {
    exercise.syllables.forEach((option) => pushUniqueText(options, option))
  }

  if (Array.isArray(exercise.pairs)) {
    exercise.pairs.forEach((pair) => {
      pushUniqueText(options, textFromOption(pair?.left ?? pair?.a ?? pair?.first ?? pair?.word))
      pushUniqueText(options, textFromOption(pair?.right ?? pair?.b ?? pair?.second ?? pair?.match))
    })
  }

  return options
}

function getExerciseText(exercise = {}, context = {}) {
  const type = String(exercise.type || exercise.subtype || '').toUpperCase()
  if (type === 'READ_WITH_AUDIO') {
    return joinSpeechSegments([speechTextForField(exercise, 'text')])
  }

  const leadParts = []
  const level = Number(context.level ?? 0)
  const subtype = String(context.subtype || '').toLowerCase()
  const omitAnswerSentence = level === 1 && subtype === 'question_sentence'

  const fields = ['instruction', 'prompt', 'question', 'sentence', 'text', 'reading', 'context', 'fallbackText', 'title']
  fields.forEach((field) => {
    if (omitAnswerSentence && field === 'sentence') return
    pushUniqueText(leadParts, speechTextForField(exercise, field))
  })

  if (type === 'ORDER_SENTENCE' && leadParts.length === 0) {
    pushUniqueText(leadParts, 'Ordena las palabras para formar una frase')
  }

  if (type === 'UNSCRAMBLE_WORD' && leadParts.length === 0) {
    pushUniqueText(leadParts, 'Ordena las piezas para formar la palabra')
  }

  if (type === 'COMPLETE_WORD' && exercise.pattern) {
    pushUniqueText(leadParts, `Patron: ${String(exercise.pattern).replace(/_/g, ' espacio ')}`)
  }

  const options = collectOptionTexts(exercise)
  const parts = [...leadParts]

  if (options.length) {
    const choicesText = options.map(stripFinalPunctuation).join('; ')
    const connector = choicesConnectorText()
    parts.push(connector ? `${connector}: ${choicesText}` : choicesText)
  }

  if (!parts.length) {
    pushUniqueText(parts, exercise.hint)
  }

  return joinSpeechSegments(parts)
}

function getStyleInstructions() {
  return [
    'Voz en espanol latino neutral para una app infantil de lectura.',
    `Tono: ${AUDIO_EXPERIENCE.tone.intent}.`,
    'Habla como una guia cercana: clara, paciente, segura y amable.',
    'Ritmo pausado, diccion muy nitida, energia moderada y sonrisa suave.',
    'Evita dramatizar, reganar, sonar urgente o usar tono de error.',
    'No uses modismos de Espana; prefiere pronunciacion y cadencia latinoamericana natural.',
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
      text: '¡Muy bien!'
    },
    {
      id: 'global-positive-2',
      kind: 'global',
      route: '/audio/voice/positive2.mp3',
      text: '¡Sigue asi!'
    },
    {
      id: 'global-positive-3',
      kind: 'global',
      route: '/audio/voice/positive3.mp3',
      text: '¡Muy bien!'
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
        const route = `/audio/voice/exercises/L${levelKey}/${filename}`
        const text = getExerciseText(exercise, { level: Number(levelKey), subtype })
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
  const requested = String(args.provider || 'elevenlabs').toLowerCase()
  if (requested !== 'elevenlabs') {
    throw new Error('Este generador por lotes esta configurado solo para ElevenLabs. Usa --provider=elevenlabs.')
  }
  return 'elevenlabs'
}

function envNumber(name, fallback) {
  const value = Number(process.env[name])
  return Number.isFinite(value) ? value : fallback
}

function envBool(name, fallback) {
  const value = process.env[name]
  if (value == null) return fallback
  return String(value).toLowerCase() === 'true'
}

function getVoiceSettingsForItem(item = {}) {
  const prefix = item.kind === 'exercise' ? 'ELEVENLABS_EXERCISE' : 'ELEVENLABS_REWARD'
  const defaults = item.kind === 'exercise' ? DEFAULT_EXERCISE_VOICE_SETTINGS : DEFAULT_REWARD_VOICE_SETTINGS

  return {
    stability: envNumber(`${prefix}_STABILITY`, defaults.stability),
    similarityBoost: envNumber(`${prefix}_SIMILARITY_BOOST`, defaults.similarityBoost),
    style: envNumber(`${prefix}_STYLE`, defaults.style),
    speakerBoost: envBool(`${prefix}_SPEAKER_BOOST`, defaults.speakerBoost),
    speed: envNumber(`${prefix}_SPEED`, defaults.speed)
  }
}

async function generateWithElevenLabs(item, outputFile) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE || DEFAULT_ELEVENLABS_VOICE_ID
  if (!apiKey) throw new Error('Falta ELEVENLABS_API_KEY para generar con ElevenLabs.')

  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`)
  url.searchParams.set('output_format', process.env.ELEVENLABS_OUTPUT_FORMAT || DEFAULT_ELEVENLABS_FORMAT)
  const voiceSettings = getVoiceSettingsForItem(item)

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
        stability: voiceSettings.stability,
        similarity_boost: voiceSettings.similarityBoost,
        style: voiceSettings.style,
        use_speaker_boost: voiceSettings.speakerBoost,
        speed: voiceSettings.speed
      }
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    if (response.status === 401 && detail.includes('missing_permissions')) {
      throw new Error(
        'ElevenLabs 401: la API key existe, pero no tiene permiso text_to_speech. ' +
        'Crea o edita una API key en ElevenLabs con permiso Text to Speech y vuelve a ejecutar npm run generar-voz.'
      )
    }
    throw new Error(`ElevenLabs ${response.status}: ${detail}`)
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
    elevenLabsModel: process.env.ELEVENLABS_MODEL_ID || DEFAULT_ELEVENLABS_MODEL,
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE || DEFAULT_ELEVENLABS_VOICE_ID,
    elevenLabsOutputFormat: process.env.ELEVENLABS_OUTPUT_FORMAT || DEFAULT_ELEVENLABS_FORMAT,
    elevenLabsVoiceSettings: {
      exercise: getVoiceSettingsForItem({ kind: 'exercise' }),
      reward: getVoiceSettingsForItem({ kind: 'global' })
    },
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
  const startIndex = startAfterId ? allItems.findIndex((item) => item.id === startAfterId) : -1
  const candidateItems = startIndex >= 0 ? allItems.slice(startIndex + 1) : allItems
  const selected = candidateItems
    .filter((item) => !selectedIds || selectedIds.has(item.id))
    .filter((item) => {
      if (scope === 'all') return true
      if (item.kind === 'global') return !fileExistsForRoute(item.route)
      return !fileExistsForRoute(item.route) && (!item.hasExistingAudio || overwrite)
    })
    .slice(0, limit)

  const provider = chooseProvider()
  writeManifests(allItems, selected, provider)

  if (syncRoutesOnly) {
    applyTemplateRoutes(templates, exerciseItems)
    console.log(JSON.stringify({
      syncRoutesOnly: true,
      provider,
      exerciseRoutesUpdated: exerciseItems.length,
      templatesUpdated: true,
      manifest: path.relative(ROOT, OUT_MANIFEST_JSON)
    }, null, 2))
    return
  }

  if (dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      provider,
      scope,
      overwrite,
      startAfterId: startAfterId || null,
      manifest: path.relative(ROOT, OUT_MANIFEST_JSON),
      csv: path.relative(ROOT, OUT_MANIFEST_CSV),
      totalItems: allItems.length,
      selectedItems: selected.length,
      templatesUpdated: false
    }, null, 2))
    return
  }

  if (!process.env.ELEVENLABS_API_KEY) throw new Error('No hay proveedor configurado. Define ELEVENLABS_API_KEY.')

  let generated = 0
  let skipped = 0

  for (const item of selected) {
    const outputFile = publicRouteToFile(item.route)
    if (!overwrite && fs.existsSync(outputFile)) {
      skipped += 1
      continue
    }

    await generateWithElevenLabs(item, outputFile)

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
    startAfterId: startAfterId || null,
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
