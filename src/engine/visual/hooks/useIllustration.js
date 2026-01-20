import { ref, watch, computed, isRef } from 'vue'
import { illustrationManager } from '../illustrations/IllustrationManager'

export function useIllustration(exerciseRef, meta = {}) {
  const illustration = ref(null)
  const status = ref('idle')
  const source = ref(null)
  const lastId = ref(null)
  const metaRef = isRef(meta) ? meta : computed(() => meta)
  const exerciseId = computed(() => exerciseRef.value?.id || null)

  async function load() {
    const exercise = exerciseRef.value
    if (!exercise || !exerciseId.value) {
      illustration.value = null
      status.value = 'idle'
      source.value = null
      return
    }

    if (exercise.image) {
      illustration.value = exercise.image
      source.value = 'template'
      status.value = 'ready'
      lastId.value = exercise.id
      return
    }

    if (lastId.value === exercise.id && illustration.value) {
      status.value = 'ready'
      return
    }

    status.value = 'loading'
    const currentMeta = metaRef.value || {}
    const result = await illustrationManager.ensureIllustration(exercise, currentMeta)
    illustration.value = result?.src || null
    source.value = result?.source || null
    status.value = illustration.value ? 'ready' : 'empty'
    lastId.value = exercise.id
  }

  watch(exerciseId, () => {
    load()
  })

  return {
    illustration,
    status,
    source,
    reload: load
  }
}

export default useIllustration
