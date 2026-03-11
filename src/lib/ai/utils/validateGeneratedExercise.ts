import type { AIReadingExercise, AgeRange } from '../schemas/exerciseSchema'
import { AGE_PRESETS } from './agePresets'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

function getPreset(ageRange: AgeRange) {
  return AGE_PRESETS[ageRange]
}

export function validateGeneratedExercise(exercise: AIReadingExercise): ValidationResult {
  const errors: string[] = []
  const preset = getPreset(exercise.ageRange)

  if (exercise.text.length > preset.maxTextLength) {
    errors.push(
      `text exceeds maxTextLength for age ${exercise.ageRange} (${exercise.text.length}/${preset.maxTextLength})`
    )
  }

  if (!Array.isArray(exercise.options) || exercise.options.length < 2) {
    errors.push('options must contain at least 2 elements')
  }

  if (!exercise.options.includes(exercise.correctAnswer)) {
    errors.push('correctAnswer must be included in options')
  }

  if (!preset.allowedDifficulty.includes(exercise.difficulty)) {
    errors.push(`difficulty '${exercise.difficulty}' is not allowed for age ${exercise.ageRange}`)
  }

  if (!preset.allowedSkills.includes(exercise.skillType)) {
    errors.push(`skillType '${exercise.skillType}' is not allowed for age ${exercise.ageRange}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
