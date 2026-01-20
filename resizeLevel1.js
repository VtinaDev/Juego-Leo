import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const LEVEL_DIR = path.join(process.cwd(), 'public', 'images', 'level1')
const TARGET_WIDTH = 1600
const TARGET_HEIGHT = 1000

async function listPngFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png')).map((entry) => entry.name)
}

async function resizeImage(filePath) {
  await sharp(filePath)
    .resize({
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      fit: 'cover'
    })
    .toFile(`${filePath}.tmp`)

  await fs.rename(`${filePath}.tmp`, filePath)
  console.log(`✅ Redimensionado: ${path.basename(filePath)}`)
}

async function main() {
  try {
    const files = await listPngFiles(LEVEL_DIR)
    if (!files.length) {
      console.warn('⚠️ No se encontraron PNG en', LEVEL_DIR)
      return
    }

    for (const file of files) {
      const fullPath = path.join(LEVEL_DIR, file)
      await resizeImage(fullPath)
    }

    console.log('🎯 Redimensionado completado para todas las imágenes.')
  } catch (error) {
    console.error('❌ Error al redimensionar imágenes:', error)
    process.exitCode = 1
  }
}

main()
