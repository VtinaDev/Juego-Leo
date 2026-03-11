import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const srcDir = path.join(rootDir, 'src')
const templatesPath = path.join(rootDir, 'src', 'engine', 'logic', 'data', 'templates.json')
const soundsPath = path.join(rootDir, 'src', 'engine', 'audio', 'sounds.js')

function normalizeRoute(route) {
  const raw = String(route || '').trim()
  if (!raw) return ''
  if (/^(https?:|data:)/i.test(raw)) return ''
  const noQuery = raw.split('?')[0].split('#')[0]
  if (noQuery.startsWith('/')) return noQuery.slice(1)
  return noQuery
}

function existsInPublic(route) {
  const normalized = normalizeRoute(route)
  if (!normalized) return true
  const filePath = path.join(publicDir, normalized)
  return fs.existsSync(filePath)
}

function collectTemplateAudioRoutes() {
  const results = []
  const raw = fs.readFileSync(templatesPath, 'utf8')
  const parsed = JSON.parse(raw)
  const levels = Object.values(parsed || {})

  for (const level of levels) {
    const subtypes = level?.subtypes
    if (!subtypes || typeof subtypes !== 'object') continue
    for (const exercises of Object.values(subtypes)) {
      if (!Array.isArray(exercises)) continue
      for (const exercise of exercises) {
        if (typeof exercise?.audio === 'string' && exercise.audio.trim()) {
          results.push({
            route: exercise.audio,
            source: `templates:${exercise.id || 'unknown'}`
          })
        }
      }
    }
  }

  return results
}

async function collectSoundsMapRoutes() {
  const moduleUrl = pathToFileURL(soundsPath).href
  const soundsModule = await import(moduleUrl)
  const buckets = ['SFX_SOURCES', 'MUSIC_SOURCES', 'VOICE_SOURCES']
  const collected = []

  for (const bucket of buckets) {
    const map = soundsModule[bucket]
    if (!map || typeof map !== 'object') continue
    for (const [key, route] of Object.entries(map)) {
      if (typeof route !== 'string') continue
      collected.push({ route, source: `${bucket}:${key}` })
    }
  }

  return collected
}

function walkFiles(startDir, files = []) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(fullPath, files)
      continue
    }
    if (!/\.(js|ts|vue|json)$/i.test(entry.name)) continue
    files.push(fullPath)
  }
  return files
}

function collectLiteralAudioRoutes() {
  const results = []
  const files = walkFiles(srcDir)
  const literalPattern = /['"`](\/audio\/[^'"`\s]+)['"`]/g

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf8')
    let match = literalPattern.exec(raw)
    while (match) {
      const route = match[1]
      const rel = path.relative(rootDir, filePath)
      results.push({ route, source: `literal:${rel}` })
      match = literalPattern.exec(raw)
    }
  }

  return results
}

function dedupe(items) {
  const map = new Map()
  for (const item of items) {
    const key = `${item.source}::${item.route}`
    if (!map.has(key)) map.set(key, item)
  }
  return [...map.values()]
}

function reportMissing(missing) {
  console.error('\n[validate:audio] Se encontraron rutas de audio inválidas:\n')
  for (const item of missing) {
    console.error(`- ${item.route} (${item.source})`)
  }
  console.error(`\nTotal inválidas: ${missing.length}`)
}

async function main() {
  const [templateRoutes, soundsRoutes, literalRoutes] = await Promise.all([
    Promise.resolve(collectTemplateAudioRoutes()),
    collectSoundsMapRoutes(),
    Promise.resolve(collectLiteralAudioRoutes())
  ])

  const allRoutes = dedupe([...templateRoutes, ...soundsRoutes, ...literalRoutes])
  const audioRoutes = allRoutes.filter(({ route }) => {
    const normalized = normalizeRoute(route)
    return normalized.startsWith('audio/')
  })

  const missing = audioRoutes.filter(({ route }) => !existsInPublic(route))
  if (missing.length) {
    reportMissing(missing)
    process.exitCode = 1
    return
  }

  console.log(`[validate:audio] OK - ${audioRoutes.length} rutas de audio verificadas.`)
}

main().catch((err) => {
  console.error('[validate:audio] Error inesperado:', err)
  process.exitCode = 1
})
