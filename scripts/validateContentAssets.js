import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const templatesPath = path.join(rootDir, 'src', 'engine', 'logic', 'data', 'templates.json')
const publicDir = path.join(rootDir, 'public')

function normalizeRoute(route) {
  const raw = String(route || '').trim()
  if (!raw) return ''
  if (/^(https?:|data:)/i.test(raw)) return ''
  const clean = raw.split('?')[0].split('#')[0]
  if (clean.startsWith('/')) return clean.slice(1)
  return clean
}

function routeExists(route) {
  const normalized = normalizeRoute(route)
  if (!normalized) return true
  const target = path.join(publicDir, normalized)
  return fs.existsSync(target)
}

function collectMissingVisualAssets() {
  const raw = fs.readFileSync(templatesPath, 'utf8')
  const templates = JSON.parse(raw)
  const missing = []
  const trackedFields = ['image', 'background']

  for (const [levelId, levelConfig] of Object.entries(templates || {})) {
    const subtypes = levelConfig?.subtypes || {}
    for (const [subtype, exercises] of Object.entries(subtypes)) {
      if (!Array.isArray(exercises)) continue
      for (const exercise of exercises) {
        for (const field of trackedFields) {
          const route = exercise?.[field]
          if (typeof route !== 'string' || !route.trim()) continue
          if (routeExists(route)) continue
          missing.push({
            level: levelId,
            subtype,
            id: exercise?.id || 'unknown',
            field,
            route
          })
        }
      }
    }
  }

  return missing
}

function main() {
  const missing = collectMissingVisualAssets()
  if (!missing.length) {
    console.log('[validate:content] OK - rutas visuales verificadas.')
    return
  }

  console.error('\n[validate:content] Se encontraron rutas visuales inválidas:\n')
  for (const item of missing) {
    console.error(`- ${item.id} (${item.level}/${item.subtype}) ${item.field}: ${item.route}`)
  }
  console.error(`\nTotal inválidas: ${missing.length}`)
  process.exitCode = 1
}

main()
