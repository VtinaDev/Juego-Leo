import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const TEMPLATES_PATH = path.join(ROOT, 'src/engine/logic/data/templates.json')
const OUT_TXT = path.join(ROOT, 'scripts/audio/exercise_phrases_no_options.txt')
const OUT_CSV = path.join(ROOT, 'scripts/audio/exercise_phrases_no_options.csv')

const NARRATION_KEYS = ['instruction', 'prompt', 'question', 'text', 'sentence', 'context', 'fallbackText', 'title', 'hint']

function normalize(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function csvEscape(value = '') {
  const str = String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

const templates = JSON.parse(fs.readFileSync(TEMPLATES_PATH, 'utf8'))
const lines = []

for (const [levelKey, levelDef] of Object.entries(templates)) {
  const order = Array.isArray(levelDef.order) ? levelDef.order : Object.keys(levelDef.subtypes || {})
  order.forEach((subtype, stageIndex) => {
    const exercises = levelDef.subtypes?.[subtype] || []
    exercises.forEach((exercise, exIndex) => {
      const exerciseId = exercise.id || `L${levelKey}-${subtype}-${exIndex + 1}`
      for (const key of NARRATION_KEYS) {
        const value = exercise[key]
        if (typeof value !== 'string') continue
        const text = normalize(value)
        if (!text) continue
        lines.push({
          level: Number(levelKey),
          stage: stageIndex + 1,
          exercise_id: exerciseId,
          subtype,
          field: key,
          text
        })
      }
    })
  })
}

const seen = new Set()
const unique = lines.filter((item) => {
  const k = `${item.level}|${item.exercise_id}|${item.field}|${item.text.toLowerCase()}`
  if (seen.has(k)) return false
  seen.add(k)
  return true
})

const txtOutput = unique
  .map((item) => `[L${item.level}-E${item.exercise_id}] ${item.text}`)
  .join('\n')

const csvHeader = ['level', 'stage', 'exercise_id', 'subtype', 'field', 'text']
const csvRows = [csvHeader.join(',')]
unique.forEach((item) => {
  csvRows.push([
    item.level,
    item.stage,
    item.exercise_id,
    item.subtype,
    item.field,
    item.text
  ].map(csvEscape).join(','))
})

fs.writeFileSync(OUT_TXT, `${txtOutput}\n`)
fs.writeFileSync(OUT_CSV, `${csvRows.join('\n')}\n`)

console.log(JSON.stringify({
  outTxt: path.relative(ROOT, OUT_TXT),
  outCsv: path.relative(ROOT, OUT_CSV),
  totalPhrases: unique.length
}, null, 2))
