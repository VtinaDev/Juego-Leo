const FIELDS_PRIORITY = [
  'narrationText',
  'phrase',
  'sentence',
  'text',
  'targetText',
  'prompt',
  'context',
  'question',
  'instruction'
] as const

type MaybeExercise = Record<string, unknown> | null | undefined

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().replace(/\s+/g, ' ')
  return trimmed.length > 0 ? trimmed : null
}

function truncate(text: string): string {
  if (text.length <= 200) return text
  const firstSentence = text.split(/[.!?]/)[0]
  if (firstSentence && firstSentence.length > 20) {
    return `${firstSentence.trim().slice(0, 200)}…`
  }
  return `${text.slice(0, 200)}…`
}

export function getExerciseNarrationText(exercise: MaybeExercise): string | null {
  if (!exercise) return null

  for (const field of FIELDS_PRIORITY) {
    const value = cleanText((exercise as Record<string, unknown>)[field])
    if (value) {
      return truncate(value)
    }
  }

  return null
}
