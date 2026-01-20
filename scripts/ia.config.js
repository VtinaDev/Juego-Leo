import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const SIZE = process.env.OPENAI_IMAGE_SIZE || '1024x1024'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export async function createImage(prompt, filePath, { model = MODEL, size = SIZE, dry = false } = {}) {
  if (dry) {
    console.log(`[dry] createImage -> ${filePath} :: ${prompt}`)
    return filePath
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no configurada; no se puede generar imagen.')
  }

  ensureDir(filePath)

  const response = await client.images.generate({
    model,
    prompt,
    size,
    response_format: 'b64_json'
  })

  const imageBase64 = response?.data?.[0]?.b64_json
  if (!imageBase64) {
    throw new Error('Respuesta de imagen vacía.')
  }

  const buffer = Buffer.from(imageBase64, 'base64')
  fs.writeFileSync(filePath, buffer)
  return filePath
}

export default {
  createImage
}
