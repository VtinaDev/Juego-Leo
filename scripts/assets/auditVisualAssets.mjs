import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['public', 'src/assets', 'src/views']
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])
const LARGE_FILE_BYTES = 512 * 1024

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, files)
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (IMAGE_EXTENSIONS.has(ext)) files.push(fullPath)
  }
  return files
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const files = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
const records = files.map((filePath) => {
  const stat = fs.statSync(filePath)
  const rel = path.relative(ROOT, filePath)
  return {
    path: rel,
    size: stat.size,
    sizeLabel: humanSize(stat.size),
    extension: path.extname(filePath)
  }
})

const basenameGroups = new Map()
for (const item of records) {
  const key = path.basename(item.path).toLowerCase()
  if (!basenameGroups.has(key)) basenameGroups.set(key, [])
  basenameGroups.get(key).push(item.path)
}

const large = records
  .filter((item) => item.size >= LARGE_FILE_BYTES)
  .sort((a, b) => b.size - a.size)

const duplicateNames = [...basenameGroups.entries()]
  .filter(([, paths]) => paths.length > 1)
  .map(([name, paths]) => ({ name, paths }))

const uppercaseExtensions = records.filter((item) => /[A-Z]/.test(item.extension))

console.log(JSON.stringify({
  totalImages: records.length,
  largeFiles: large.map(({ path, sizeLabel }) => ({ path, size: sizeLabel })),
  duplicateNames,
  uppercaseExtensions: uppercaseExtensions.map((item) => item.path)
}, null, 2))
