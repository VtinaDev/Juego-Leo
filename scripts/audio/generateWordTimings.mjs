#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import OpenAI from 'openai'

const ROOT = process.cwd()
const CSV_PATH = path.resolve(ROOT, 'scripts/audio/exercise_voice_lines.csv')
const OUTPUT_PATH = path.resolve(ROOT, 'src/engine/logic/audio/exerciseWordTimings.json')

const MODEL = process.env.WHISPER_MODEL || 'gpt-4o-mini-transcribe'
const CONCURRENCY = clampInt(process.env.WORD_TIMINGS_CONCURRENCY, 3, 1, 12)
const MAX_RETRIES = clampInt(process.env.WORD_TIMINGS_MAX_RETRIES, 3, 0, 8)
const LANGUAGE = process.env.WORD_TIMINGS_LANGUAGE || 'es'

const hasHelpFlag = process.argv.includes('--help') || process.argv.includes('-h')
if (hasHelpFlag) {
  printHelp()
  process.exit(0)
}

if (!fs.existsSync(CSV_PATH)) {
  console.error(`[generate-word-timings] CSV no encontrado: ${CSV_PATH}`)
  process.exit(1)
}

if (!process.env.OPENAI_API_KEY) {
  console.error('[generate-word-timings] Falta OPENAI_API_KEY en el entorno.')
  process.exit(1)
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const lines = readCsvLines(CSV_PATH)
const rows = lines
  .map(normalizeCsvRow)
  .filter((row) => row.lineId && row.text && row.targetPath)

console.log(`[generate-word-timings] Filas candidatas: ${rows.length}`)
console.log(`[generate-word-timings] Concurrency=${CONCURRENCY} model=${MODEL} language=${LANGUAGE}`)

const byLineId = {}
const missingAudio = []
const failed = []
let completed = 0

await runPool(rows, CONCURRENCY, async (row) => {
  const audioAbsPath = path.resolve(ROOT, row.targetPath)
  if (!fs.existsSync(audioAbsPath)) {
    missingAudio.push({ lineId: row.lineId, audioPath: row.targetPath })
    return
  }

  try {
    const transcription = await transcribeWithRetry({
      client,
      audioAbsPath,
      text: row.text,
      model: MODEL,
      language: LANGUAGE,
      maxRetries: MAX_RETRIES
    })
    const sourceWords = extractWhisperWords(transcription)
    const wordTimings = alignTimingsToText(row.text, sourceWords)
    byLineId[row.lineId] = {
      text: row.text,
      wordTimings
    }
    completed += 1
    if (completed % 25 === 0) {
      console.log(`[generate-word-timings] Procesadas: ${completed}/${rows.length}`)
    }
  } catch (error) {
    failed.push({
      lineId: row.lineId,
      audioPath: row.targetPath,
      error: toMessage(error)
    })
  }
})

const sortedOutput = Object.fromEntries(
  Object.entries(byLineId).sort((a, b) => numericAwareCompare(a[0], b[0]))
)

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(sortedOutput, null, 2)}\n`, 'utf8')

console.log(`[generate-word-timings] JSON generado: ${OUTPUT_PATH}`)
console.log(`[generate-word-timings] Generadas: ${Object.keys(sortedOutput).length}`)
console.log(`[generate-word-timings] Audios ausentes: ${missingAudio.length}`)
console.log(`[generate-word-timings] Errores: ${failed.length}`)

if (missingAudio.length) {
  const sample = missingAudio.slice(0, 10)
  console.warn('[generate-word-timings] Ejemplos de audios ausentes:')
  for (const item of sample) {
    console.warn(`  - line_id=${item.lineId} path=${item.audioPath}`)
  }
}

if (failed.length) {
  const sample = failed.slice(0, 10)
  console.warn('[generate-word-timings] Ejemplos de fallos:')
  for (const item of sample) {
    console.warn(`  - line_id=${item.lineId} path=${item.audioPath}: ${item.error}`)
  }
}

function printHelp() {
  console.log(`Usage: npm run generate-word-timings

Required env:
  OPENAI_API_KEY=...

Optional env:
  WHISPER_MODEL=gpt-4o-mini-transcribe
  WORD_TIMINGS_CONCURRENCY=3
  WORD_TIMINGS_MAX_RETRIES=3
  WORD_TIMINGS_LANGUAGE=es
`)
}

function readCsvLines(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const rows = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]
    const next = raw[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === '\n' && !inQuotes) {
      if (current.trim()) rows.push(current)
      current = ''
      continue
    }

    if (char !== '\r') current += char
  }

  if (current.trim()) rows.push(current)
  if (!rows.length) return []

  const header = splitCsvRow(rows[0])
  return rows.slice(1).map((line) => {
    const cells = splitCsvRow(line)
    const obj = {}
    for (let i = 0; i < header.length; i += 1) {
      obj[header[i]] = cells[i] ?? ''
    }
    return obj
  })
}

function splitCsvRow(line) {
  const out = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      out.push(current)
      current = ''
      continue
    }

    current += char
  }

  out.push(current)
  return out.map((value) => value.trim())
}

function normalizeCsvRow(row) {
  return {
    lineId: String(row.row_id ?? '').trim(),
    text: String(row.text ?? '').trim(),
    targetPath: String(row.target_path ?? '').trim()
  }
}

async function runPool(items, concurrency, worker) {
  const queue = [...items]
  const workers = []

  for (let i = 0; i < concurrency; i += 1) {
    workers.push(
      (async () => {
        while (queue.length) {
          const next = queue.shift()
          if (!next) return
          await worker(next)
        }
      })()
    )
  }

  await Promise.all(workers)
}

async function transcribeWithRetry({ client, audioAbsPath, text, model, language, maxRetries }) {
  let attempt = 0
  let lastError = null

  while (attempt <= maxRetries) {
    try {
      const response = await client.audio.transcriptions.create({
        model,
        file: fs.createReadStream(audioAbsPath),
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
        language,
        prompt: text
      })
      return response
    } catch (error) {
      lastError = error
      attempt += 1
      if (attempt > maxRetries) break
      const backoffMs = 400 * 2 ** (attempt - 1)
      await sleep(backoffMs)
    }
  }

  throw lastError ?? new Error('Transcription failed')
}

function extractWhisperWords(transcription) {
  const words = Array.isArray(transcription?.words) ? transcription.words : []
  return words
    .map((item) => ({
      word: String(item.word ?? '').trim(),
      start: toNumber(item.start),
      end: toNumber(item.end)
    }))
    .filter((item) => item.word && Number.isFinite(item.start) && Number.isFinite(item.end))
}

function alignTimingsToText(originalText, recognizedWords) {
  const target = tokenizeForOutput(originalText)
  if (!target.length) return []

  const recog = recognizedWords
    .map((w) => ({
      word: normalizeToken(w.word),
      raw: w.word,
      start: w.start,
      end: w.end
    }))
    .filter((w) => w.word)

  const mapped = target.map((word) => ({ word, start: null, end: null }))
  let cursor = 0

  for (let i = 0; i < target.length; i += 1) {
    const wanted = target[i]
    let matchIndex = -1

    for (let j = cursor; j < recog.length; j += 1) {
      if (isTokenMatch(wanted, recog[j].word)) {
        matchIndex = j
        break
      }
    }

    if (matchIndex >= 0) {
      mapped[i].start = recog[matchIndex].start
      mapped[i].end = recog[matchIndex].end
      cursor = matchIndex + 1
    }
  }

  return fillMissingAndNormalize(mapped, recog)
}

function fillMissingAndNormalize(mapped, recognized) {
  const known = mapped
    .map((item, index) => ({ ...item, index }))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end))

  const firstKnown = known[0]
  const lastKnown = known[known.length - 1]

  const firstStart = Number.isFinite(firstKnown?.start)
    ? firstKnown.start
    : Number.isFinite(recognized[0]?.start)
    ? recognized[0].start
    : 0
  const lastEnd = Number.isFinite(lastKnown?.end)
    ? lastKnown.end
    : Number.isFinite(recognized[recognized.length - 1]?.end)
    ? recognized[recognized.length - 1].end
    : Math.max(0.22 * mapped.length, 0.3)

  const avgKnownDuration =
    known.length > 0
      ? known.reduce((acc, item) => acc + Math.max(0.06, item.end - item.start), 0) / known.length
      : Math.max((lastEnd - firstStart) / Math.max(1, mapped.length), 0.22)

  // Completa huecos interpolando entre anclas conocidas.
  for (let i = 0; i < mapped.length; i += 1) {
    if (Number.isFinite(mapped[i].start) && Number.isFinite(mapped[i].end)) continue

    const prev = findKnown(mapped, i, -1)
    const next = findKnown(mapped, i, 1)

    if (prev && next && next.index > prev.index) {
      const span = next.start - prev.end
      const slots = next.index - prev.index
      const step = span > 0 ? span / slots : avgKnownDuration
      const estStart = prev.end + step * (i - prev.index - 1)
      mapped[i].start = estStart
      mapped[i].end = estStart + Math.max(0.08, step * 0.9)
      continue
    }

    if (prev) {
      const estStart = prev.end + avgKnownDuration * (i - prev.index - 1)
      mapped[i].start = estStart
      mapped[i].end = estStart + avgKnownDuration
      continue
    }

    if (next) {
      const before = next.index - i
      const estEnd = next.start - avgKnownDuration * Math.max(1, before - 1)
      mapped[i].end = estEnd
      mapped[i].start = estEnd - avgKnownDuration
      continue
    }

    const step = (lastEnd - firstStart) / Math.max(1, mapped.length)
    mapped[i].start = firstStart + step * i
    mapped[i].end = mapped[i].start + Math.max(0.08, step * 0.9)
  }

  // Monotónico y redondeado.
  let prevEnd = Math.max(0, firstStart)
  return mapped.map((item) => {
    let start = Number(item.start)
    let end = Number(item.end)
    if (!Number.isFinite(start)) start = prevEnd
    if (!Number.isFinite(end)) end = start + avgKnownDuration
    if (start < prevEnd) start = prevEnd
    if (end <= start) end = start + 0.08
    prevEnd = end
    return {
      word: item.word,
      start: round3(start),
      end: round3(end)
    }
  })
}

function findKnown(items, fromIndex, direction) {
  let i = fromIndex + direction
  while (i >= 0 && i < items.length) {
    if (Number.isFinite(items[i].start) && Number.isFinite(items[i].end)) {
      return { ...items[i], index: i }
    }
    i += direction
  }
  return null
}

function tokenizeForOutput(text) {
  return String(text || '')
    .split(/\s+/)
    .map((token) => normalizeToken(token))
    .filter(Boolean)
}

function normalizeToken(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function isTokenMatch(expected, heard) {
  if (!expected || !heard) return false
  if (expected === heard) return true
  if (expected.length >= 4 && heard.startsWith(expected)) return true
  if (heard.length >= 4 && expected.startsWith(heard)) return true
  if (expected.length >= 5 && heard.length >= 5) {
    const dist = levenshtein(expected, heard)
    return dist <= 1
  }
  return false
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[a.length][b.length]
}

function round3(num) {
  return Math.round(num * 1000) / 1000
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function numericAwareCompare(a, b) {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

function toMessage(error) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (typeof error.message === 'string') return error.message
  return JSON.stringify(error)
}
