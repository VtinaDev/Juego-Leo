#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createImage } from './ia.config.js'

if (!process.env.ENABLE_AI_IMAGES) {
  console.log('IA image generation disabled.')
  process.exit(0)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DRY_RUN = process.argv.includes('--dry')
const templatePath = path.resolve(__dirname, '../src/engine/logic/data/templates.json')
const levelFolder = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' }

function loadTemplates() {
  const raw = fs.readFileSync(templatePath, 'utf8')
  return JSON.parse(raw)
}

function saveTemplates(data) {
  if (DRY_RUN) {
    console.log('[dry] No se guardan cambios en templates.json')
    return
  }
  fs.writeFileSync(templatePath, JSON.stringify(data, null, 2))
}

function buildPromptForExercise(level, subtype, text = '') {
  const base = text || 'Escena educativa para niños'
  const styleByLevel = {
    1: 'Estilo infantil suave, animales amigables, estética mágica del bosque.',
    2: 'Escena ágil y astuta de zorro, colores cálidos y dinámicos.',
    3: 'Escena dinámica de mono curioso, movimiento y exploración.',
    4: 'Escena de escritura o dictado con lápiz mágico y cuaderno brillante.',
    5: 'Temática de sabiduría con elefante sabiondo, ambiente académico mágico.'
  }
  const style = styleByLevel[level] || 'Escena educativa mágica'
  return `${style} | Contenido: ${base}`.slice(0, 900)
}

function extractText(exercise) {
  return (
    exercise?.text ||
    exercise?.sentence ||
    exercise?.prompt ||
    exercise?.question ||
    exercise?.instruction ||
    exercise?.context ||
    ''
  )
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'img'
}

async function runGenerateMissingImages() {
  const data = loadTemplates()
  let generated = 0
  let skippedExisting = 0
  let failures = 0

  for (const [levelKey, conf] of Object.entries(data)) {
    const level = Number(levelKey)
    const folder = path.resolve(__dirname, `../public/images/${levelFolder[level] || 'L' + level}`)
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }

    for (const [subtype, list] of Object.entries(conf.subtypes || {})) {
      for (const exercise of list || []) {
        if (exercise.image) {
          skippedExisting++
          continue
        }

        const text = extractText(exercise)
        const prompt = buildPromptForExercise(level, subtype, text)
        const fileName = `${slugify(exercise.id || `${subtype}-${Date.now()}`)}.png`
        const filePath = path.join(folder, fileName)
        const publicPath = `/images/${levelFolder[level] || 'L' + level}/${fileName}`

        try {
          await createImage(prompt, filePath, { dry: DRY_RUN })
          exercise.image = publicPath
          generated++
        } catch (err) {
          failures++
          console.warn('No se pudo generar imagen para', exercise.id, err.message)
        }
      }
    }
  }

  saveTemplates(data)

  console.log(JSON.stringify({ generated, skippedExisting, failures, dry: DRY_RUN }, null, 2))
}

runGenerateMissingImages()
  .catch((err) => {
    console.error('Error en generateMissingImages:', err)
    process.exit(1)
  })

export { runGenerateMissingImages }
