import type { AgeRange, SkillType, Difficulty } from '../schemas/exerciseSchema'

export interface BuildBatchFilenameParams {
  ageRange: AgeRange
  skillType: SkillType
  difficulty: Difficulty
  sequenceNumber: number
}

export function buildBatchFilename(params: BuildBatchFilenameParams): string {
  const sequence = Math.max(1, Math.floor(params.sequenceNumber || 1))
  const padded = String(sequence).padStart(3, '0')

  return `reading-batch-${params.ageRange}-${params.skillType}-${params.difficulty}-${padded}.json`
}
