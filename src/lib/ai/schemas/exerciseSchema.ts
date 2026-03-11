export type AgeRange = '4-6' | '6-8' | '8-10'

export type SkillType = 'decoding' | 'reading_comprehension' | 'inference'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface AIReadingExercise {
  id: string
  ageRange: AgeRange
  title: string
  text: string
  question: string
  options: string[]
  correctAnswer: string
  skillType: SkillType
  difficulty: Difficulty
}

export interface AIReadingExerciseBatch {
  exercises: AIReadingExercise[]
}
