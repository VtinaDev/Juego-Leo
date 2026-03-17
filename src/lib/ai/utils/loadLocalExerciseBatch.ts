import type { AIReadingExerciseBatch } from '../schemas/exerciseSchema'

/**
 * Helper base para cargar lotes locales ya tipados.
 */
export function loadLocalExerciseBatch(batch: AIReadingExerciseBatch): AIReadingExerciseBatch {
  return {
    exercises: [...batch.exercises]
  }
}

/**
 * Registro en memoria de lotes locales.
 * Se rellena dinámicamente desde src/data/generated-content/batches/*.json
 */
export const LOCAL_BATCH_REGISTRY: Record<string, AIReadingExerciseBatch> = {}

type BatchModule = { default: AIReadingExerciseBatch }
type BatchLoader = () => Promise<BatchModule>
type BatchModuleMap = Record<string, BatchLoader>

const batchModules = import.meta.glob('../../../data/generated-content/batches/*.json') as BatchModuleMap

function filePathToBatchKey(filePath: string): string {
  const filename = filePath.split('/').pop() || filePath
  return filename.replace(/\.json$/i, '')
}

/**
 * Carga todos los JSON disponibles y los registra automáticamente.
 *
 * Ejemplo de uso futuro:
 * await loadAllLocalExerciseBatches()
 */
export async function loadAllLocalExerciseBatches(): Promise<Record<string, AIReadingExerciseBatch>> {
  const entries = Object.entries(batchModules)

  await Promise.all(
    entries.map(async ([filePath, loader]) => {
      const module = await loader()
      const maybeBatch = module.default

      if (!maybeBatch || !Array.isArray(maybeBatch.exercises)) {
        return
      }

      const key = filePathToBatchKey(filePath)
      LOCAL_BATCH_REGISTRY[key] = loadLocalExerciseBatch(maybeBatch)
    })
  )

  return LOCAL_BATCH_REGISTRY
}

// Carga automática en runtime para que las vistas internas puedan leer el registro.
void loadAllLocalExerciseBatches()
