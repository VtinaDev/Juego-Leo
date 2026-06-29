import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const INPUT_ROOT = path.join(ROOT, 'public/images')
const OUTPUT_ROOT = path.join(ROOT, 'public/images-optimized')
const SUPPORTED = new Set(['.png', '.jpg', '.jpeg'])
const force = process.argv.includes('--force')

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath, files)
      continue
    }
    if (SUPPORTED.has(path.extname(entry.name).toLowerCase())) files.push(fullPath)
  }
  return files
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const files = await walk(INPUT_ROOT)
  let generated = 0
  let skipped = 0
  let failed = 0

  await fs.mkdir(OUTPUT_ROOT, { recursive: true })

  for (const filePath of files) {
    const rel = path.relative(INPUT_ROOT, filePath)
    const outRel = rel.replace(/\.(png|jpe?g)$/i, '.webp')
    const outPath = path.join(OUTPUT_ROOT, outRel)
    if (!force && await exists(outPath)) {
      skipped += 1
      continue
    }

    try {
      await fs.mkdir(path.dirname(outPath), { recursive: true })
      await sharp(filePath)
        .rotate()
        .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(outPath)
      generated += 1
      console.log(`[assets] ${path.relative(ROOT, outPath)}`)
    } catch (error) {
      failed += 1
      console.warn(`[assets] fallo ${path.relative(ROOT, filePath)}: ${error?.message || error}`)
    }
  }

  console.log(JSON.stringify({ total: files.length, generated, skipped, failed }, null, 2))
}

main()
