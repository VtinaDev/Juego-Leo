import type { AIReadingExerciseBatch } from '../schemas/exerciseSchema'

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

/**
 * Placeholder de registro manual de lotes locales.
 *
 * Mantener este objeto vacío por ahora y añadir entradas cuando existan JSON
 * concretos en src/data/generated-content/batches.
 */
export const LOCAL_BATCH_REGISTRY: Record<string, AIReadingExerciseBatch> = {}
