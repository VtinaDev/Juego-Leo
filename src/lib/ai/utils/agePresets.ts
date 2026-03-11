import type { AgeRange, SkillType, Difficulty } from '../schemas/exerciseSchema'

export interface AgePreset {
  maxTextLength: number
  maxSentenceLength: number
  allowedSkills: SkillType[]
  allowedDifficulty: Difficulty[]
  readingLevelDescription: string
}

export const AGE_PRESETS: Record<AgeRange, AgePreset> = {
  '4-6': {
    maxTextLength: 140,
    maxSentenceLength: 8,
    allowedSkills: ['decoding', 'reading_comprehension'],
    allowedDifficulty: ['easy'],
    readingLevelDescription:
      'Inicio lector: vocabulario frecuente, frases muy cortas y apoyo fuerte en decodificación.'
  },
  '6-8': {
    maxTextLength: 260,
    maxSentenceLength: 12,
    allowedSkills: ['decoding', 'reading_comprehension', 'inference'],
    allowedDifficulty: ['easy', 'medium'],
    readingLevelDescription:
      'Consolidación lectora: oraciones cortas-medias, comprensión literal y primeras inferencias simples.'
  },
  '8-10': {
    maxTextLength: 420,
    maxSentenceLength: 18,
    allowedSkills: ['reading_comprehension', 'inference'],
    allowedDifficulty: ['medium', 'hard'],
    readingLevelDescription:
      'Lectura autónoma en desarrollo: textos más extensos, relaciones entre ideas e inferencias guiadas.'
  }
}
