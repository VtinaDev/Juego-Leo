#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createImage } from './ia.config.js'

const BASE_STYLE_PROMPT =
  "Children’s book illustration, soft digital painting style, warm and friendly atmosphere, rounded shapes, gentle lighting, pastel color palette, simple background, expressive cute character, clean composition, high quality, cohesive style"

function buildStyledPrompt(prompt = '') {
  const specificPrompt = String(prompt || '').trim()
  return specificPrompt ? `${BASE_STYLE_PROMPT}. ${specificPrompt}` : BASE_STYLE_PROMPT
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const templatePath = path.resolve(__dirname, '../src/engine/logic/data/templates.json')
const levelFolder = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' }

function loadTemplates() {
  const raw = fs.readFileSync(templatePath, 'utf8')
  return JSON.parse(raw)
}

function saveTemplates(data, { dry = false } = {}) {
  if (dry) {
    console.log('[dry] No se guardan cambios en templates.json')
    return
  }
  fs.writeFileSync(templatePath, JSON.stringify(data, null, 2))
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
  const specificPrompt = `${style} | Tipo: ${subtype} | Contenido: ${base}`.slice(0, 900)
  return buildStyledPrompt(specificPrompt)
}

async function runGenerateMissingImagesStyled({ dry = false } = {}) {
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
          skippedExisting += 1
          continue
        }

        const text = extractText(exercise)
        const prompt = buildPromptForExercise(level, subtype, text)
        const fileName = `${slugify(exercise.id || `${subtype}-${Date.now()}`)}.png`
        const filePath = path.join(folder, fileName)
        const publicPath = `/images/${levelFolder[level] || 'L' + level}/${fileName}`

        try {
          await createImage(prompt, filePath, { dry })
          exercise.image = publicPath
          generated += 1
        } catch (err) {
          failures += 1
          console.warn('No se pudo generar imagen para', exercise.id, err.message)
        }
      }
    }
  }

  saveTemplates(data, { dry })
  console.log(JSON.stringify({ generated, skippedExisting, failures, dry }, null, 2))
}

async function main() {
  const DRY_RUN = process.argv.includes('--dry')

  if (!process.env.ENABLE_AI_IMAGES) {
    console.log('IA image generation disabled.')
    return
  }

  await runGenerateMissingImagesStyled({ dry: DRY_RUN })
}

main().catch((err) => {
  console.error('Error en generateImages:', err)
  process.exit(1)
})
