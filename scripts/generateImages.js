#!/usr/bin/env node
import { runGenerateMissingImages } from './generateMissingImages.js'

async function main() {
  const DRY_RUN = process.argv.includes('--dry')

  if (!process.env.ENABLE_AI_IMAGES) {
    console.log('IA image generation disabled.')
    return
  }

  // Propaga flag de dry-run
  if (DRY_RUN) {
    process.argv.push('--dry')
  }

  await runGenerateMissingImages()
}

main().catch((err) => {
  console.error('Error en generateImages:', err)
  process.exit(1)
})
