import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const TEMPLATES_PATH = path.join(ROOT, 'src/engine/logic/data/templates.json')
const OUT_CSV = path.join(ROOT, 'scripts/audio/missing_exercise_audio.csv')
const PUBLIC_DIR = path.join(ROOT, 'public')

function csvEscape(value = '') {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function parseExerciseId(exerciseId = '', levelKey = '', subtype = '', fallbackIndex = 1) {
  const raw = String(exerciseId || '').trim()
  const match = raw.match(/^L(\d+)-([A-Za-z]+)-(\d+)$/)
  if (match) {
    return {
      id: raw,
      level: match[1],
      unit: match[2].toUpperCase(),
      game: match[3]
    }
  }

  const safeSubtype = String(subtype || 'GEN')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase() || 'GEN'

  const fallbackId = raw || `L${levelKey}-${safeSubtype}-${fallbackIndex}`
  return {
    id: fallbackId,
    level: String(levelKey || ''),
    unit: safeSubtype,
    game: String(fallbackIndex)
  }
}

function extractExerciseText(exercise = {}) {
  const preferredFields = ['sentence', 'prompt', 'reading', 'text', 'context', 'question', 'instruction', 'fallbackText', 'title', 'hint']
  for (const field of preferredFields) {
    const value = exercise?.[field]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return ''
}

function normalizeAudioPath(audio = '') {
  const raw = String(audio || '').trim()
  if (!raw) return ''
  if (/^(https?:|data:)/i.test(raw)) return raw
  if (raw.startsWith('/')) return raw
  return `/${raw.replace(/^\/+/, '')}`
}

function audioFileExists(audio = '') {
  const normalized = normalizeAudioPath(audio)
  if (!normalized) return false
  if (!/^\/audio\/.+\.mp3$/i.test(normalized)) return false
  const filePath = path.join(PUBLIC_DIR, normalized.replace(/^\//, ''))
  return fs.existsSync(filePath)
}

const raw = fs.readFileSync(TEMPLATES_PATH, 'utf8')
const templates = JSON.parse(raw)

const rows = []

for (const [levelKey, levelDef] of Object.entries(templates || {})) {
  const subtypes = levelDef?.subtypes || {}
  for (const [subtype, exercises] of Object.entries(subtypes)) {
    if (!Array.isArray(exercises)) continue

    exercises.forEach((exercise, index) => {
      const parsed = parseExerciseId(exercise?.id, levelKey, subtype, index + 1)
      const text = extractExerciseText(exercise)
      const exists = audioFileExists(exercise?.audio)

      if (exists) return

      const expectedAudioFilename = `${parsed.level}-${parsed.unit}-${parsed.game}-${parsed.id}.mp3`

      rows.push({
        exercise_id: parsed.id,
        level: parsed.level,
        unit: parsed.unit,
        game: parsed.game,
        type: String(exercise?.type || subtype || ''),
        text,
        expected_audio_filename: expectedAudioFilename,
        audio_exists: false
      })
    })
  }
}

rows.sort((a, b) => {
  const levelDiff = Number(a.level) - Number(b.level)
  if (levelDiff !== 0) return levelDiff
  if (a.unit !== b.unit) return a.unit.localeCompare(b.unit)
  const gameDiff = Number(a.game) - Number(b.game)
  if (gameDiff !== 0) return gameDiff
  return a.exercise_id.localeCompare(b.exercise_id)
})

const header = [
  'exercise_id',
  'level',
  'unit',
  'game',
  'type',
  'text',
  'expected_audio_filename',
  'audio_exists'
]

const lines = [header.join(',')]
for (const row of rows) {
  lines.push([
    row.exercise_id,
    row.level,
    row.unit,
    row.game,
    row.type,
    row.text,
    row.expected_audio_filename,
    row.audio_exists
  ].map(csvEscape).join(','))
}

fs.writeFileSync(OUT_CSV, `${lines.join('\n')}\n`, 'utf8')

console.log(JSON.stringify({
  output: path.relative(ROOT, OUT_CSV),
  missingExercises: rows.length
}, null, 2))
