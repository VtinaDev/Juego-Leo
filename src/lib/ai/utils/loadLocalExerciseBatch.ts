import type { AIReadingExerciseBatch } from '../schemas/exerciseSchema'
import readingBatch6to8ComprehensionEasy001 from '../../data/generated-content/batches/reading-batch-6-8-reading_comprehension-easy-001.json'

/**
 * Helper base para cargar lotes locales ya tipados.
 *
 * En una siguiente etapa, aquí se podrán conectar imports reales, por ejemplo:
 * - import batch001 from '../../data/generated-content/batches/reading-batch-...json'
 * - const batch = loadLocalExerciseBatch(batch001 as AIReadingExerciseBatch)
 */
export function loadLocalExerciseBatch(batch: AIReadingExerciseBatch): AIReadingExerciseBatch {
  return {
    exercises: [...batch.exercises]
  }
}

export const LOCAL_BATCH_REGISTRY: Record<string, AIReadingExerciseBatch> = {
  'reading-batch-6-8-reading-comprehension-easy-001': loadLocalExerciseBatch(
    readingBatch6to8ComprehensionEasy001 as AIReadingExerciseBatch
  )
}
