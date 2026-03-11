import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const TEMPLATES_PATH = path.join(ROOT, 'src/engine/logic/data/templates.json')
const OUT_JSON = path.join(ROOT, 'scripts/audio/exercise_voice_corpus.json')
const OUT_CSV = path.join(ROOT, 'scripts/audio/exercise_voice_lines.csv')
const OUT_PROMPT = path.join(ROOT, 'scripts/audio/AI_STUDIO_EXERCISES_MASTER_PROMPT.md')

const raw = fs.readFileSync(TEMPLATES_PATH, 'utf8')
const templates = JSON.parse(raw)

const NARRATION_KEYS = ['instruction', 'prompt', 'question', 'text', 'sentence', 'context', 'fallbackText', 'title']
const RESPONSE_KEYS = ['correct', 'answer', 'expectedAnswer', 'solution', 'answerPattern']
const ARRAY_RESPONSE_KEYS = ['options', 'correctOrder', 'syllables', 'letters']

const PAIR_LEFT_KEYS = ['word', 'singular', 'statement']
const PAIR_RIGHT_KEYS = ['match', 'synonym', 'antonym', 'plural', 'response']

function normalize(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function pushLine(bucket, line) {
  const text = normalize(line.text)
  if (!text) return
  if (text.length < 2) return
  if (/^[._\-\d\s]+$/.test(text)) return
  bucket.push({ ...line, text })
}

function collectExerciseLines(exercise, meta) {
  const lines = []

  for (const key of NARRATION_KEYS) {
    const value = exercise[key]
    if (typeof value === 'string') {
      pushLine(lines, { ...meta, role: 'narration', field: key, text: value })
    }
  }

  for (const key of RESPONSE_KEYS) {
    const value = exercise[key]
    if (typeof value === 'string' || typeof value === 'number') {
      pushLine(lines, { ...meta, role: 'response', field: key, text: value })
    }
  }

  for (const key of ARRAY_RESPONSE_KEYS) {
    const arr = exercise[key]
    if (!Array.isArray(arr)) continue
    arr.forEach((item, idx) => {
      if (typeof item === 'string' || typeof item === 'number') {
        pushLine(lines, { ...meta, role: key === 'options' ? 'response' : 'narration', field: `${key}[${idx}]`, text: item })
      }
    })
  }

  if (Array.isArray(exercise.pairs)) {
    exercise.pairs.forEach((pair, pIdx) => {
      if (!pair || typeof pair !== 'object') return
      for (const key of PAIR_LEFT_KEYS) {
        if (typeof pair[key] === 'string') {
          pushLine(lines, { ...meta, role: 'narration', field: `pairs[${pIdx}].${key}`, text: pair[key] })
        }
      }
      for (const key of PAIR_RIGHT_KEYS) {
        if (typeof pair[key] === 'string') {
          pushLine(lines, { ...meta, role: 'response', field: `pairs[${pIdx}].${key}`, text: pair[key] })
        }
      }
    })
  }

  if (typeof exercise.hint === 'string') {
    pushLine(lines, { ...meta, role: 'hint', field: 'hint', text: exercise.hint })
  }

  return lines
}

const corpus = []
let rowId = 1

for (const [levelKey, levelDef] of Object.entries(templates)) {
  const order = Array.isArray(levelDef.order) ? levelDef.order : Object.keys(levelDef.subtypes || {})
  order.forEach((subtype, stageIndex) => {
    const list = levelDef.subtypes?.[subtype] || []
    list.forEach((exercise, exIndex) => {
      const exerciseId = exercise.id || `L${levelKey}-${subtype}-${exIndex + 1}`
      const baseMeta = {
        level: Number(levelKey),
        stage: stageIndex + 1,
        subtype,
        type: exercise.type || subtype,
        exerciseId
      }
      const lines = collectExerciseLines(exercise, baseMeta)
      lines.forEach((line) => {
        corpus.push({
          rowId: rowId++,
          ...line
        })
      })
    })
  })
}

const dedupeMap = new Map()
for (const item of corpus) {
  const key = `${item.exerciseId}::${item.field}::${item.text.toLowerCase()}`
  if (!dedupeMap.has(key)) dedupeMap.set(key, item)
}
const unique = [...dedupeMap.values()]

const csvHeader = [
  'row_id',
  'level',
  'stage',
  'exercise_id',
  'subtype',
  'type',
  'role',
  'field',
  'target_path',
  'text'
]

function csvEscape(value = '') {
  const str = String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

const csvLines = [csvHeader.join(',')]
unique.forEach((item) => {
  const targetPath = `public/audio/exercises/L${item.level}/${item.exerciseId}/${item.role}_${item.field.replace(/[^a-zA-Z0-9_\-\[\].]/g, '_')}.mp3`
  const row = [
    item.rowId,
    item.level,
    item.stage,
    item.exerciseId,
    item.subtype,
    item.type,
    item.role,
    item.field,
    targetPath,
    item.text
  ]
  csvLines.push(row.map(csvEscape).join(','))
})

const corpusPayload = {
  generatedAt: new Date().toISOString(),
  source: 'src/engine/logic/data/templates.json',
  totalLines: unique.length,
  levels: 5,
  items: unique
}

const styleBlock = [
  'VOZ OBJETIVO (igual que eventos):',
  '- Nina/maestra latina (es-CO), calida, cercana, natural, cero robotica.',
  '- Dicción muy clara para infancia, pausas naturales, tono positivo.',
  '- Mantener la misma identidad de voz en todas las lineas.',
  '- Evitar sobreactuacion y evitar entonacion sintetica.',
  '- Ritmo: 0.94-1.02; tono: 0.98-1.03; energia moderada.',
  '',
  'INSTRUCCIONES DE GENERACION:',
  '1) Genera un audio por cada fila del dataset.',
  '2) Respeta exactamente el texto de la columna text.',
  '3) Exporta en MP3 con el nombre/ruta de target_path.',
  '4) Mantén mismo timbre y estilo entre todas las salidas.',
  '5) Si una linea contiene signos o tildes, pronunciarlos naturalmente.',
  '',
  'FORMATO TECNICO:',
  '- MP3, 44.1kHz, loudness consistente, picos maximos cercanos a -1 dBFS.',
  '',
  'DATASET CSV (copiar y pegar en AI Studio o usar por lotes):',
].join('\n')

fs.writeFileSync(OUT_JSON, JSON.stringify(corpusPayload, null, 2))
fs.writeFileSync(OUT_CSV, `${csvLines.join('\n')}\n`)
fs.writeFileSync(OUT_PROMPT, `${styleBlock}\n\n${csvLines.join('\n')}\n`)

console.log(JSON.stringify({
  outJson: path.relative(ROOT, OUT_JSON),
  outCsv: path.relative(ROOT, OUT_CSV),
  outPrompt: path.relative(ROOT, OUT_PROMPT),
  totalLines: unique.length
}, null, 2))
