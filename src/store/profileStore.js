import { defineStore } from 'pinia'
import { getSupabaseConfigError, hasSupabaseConfig, supabase } from '../lib/supabaseClient'
import { normalizeLearningProfile } from '../data/onboardingQuestionnaire'
import { useAuthStore } from './authStore'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    childId: '',
    childName: '',
    childBirthdate: '',
    childLearningNeeds: [],
    childOtherLearningNeed: '',
    childLearningProfile: normalizeLearningProfile(),
    loading: false,
    error: ''
  }),

  actions: {
    async loadProfile() {
      this.error = ''

      if (!hasSupabaseConfig) {
        this.error = getSupabaseConfigError()
        return false
      }

      const auth = useAuthStore()
      if (!auth.initialized) await auth.load()

      if (!auth.user?.id) {
        this.clearProfile()
        return false
      }

      this.loading = true

      try {
        const { data, error } = await supabase
          .from('children')
          .select('id, name, birthdate, learning_needs, other_learning_need, learning_profile')
          .eq('user_id', auth.user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (error) throw error

        this.childId = data?.id || ''
        this.childName = data?.name || ''
        this.childBirthdate = data?.birthdate || ''
        this.childLearningNeeds = normalizeLearningNeeds(data?.learning_needs)
        this.childOtherLearningNeed = data?.other_learning_need || ''
        this.childLearningProfile = normalizeLearningProfile(data?.learning_profile)

        return true
      } catch (error) {
        this.error = formatProfileSchemaError(error, 'cargar')
        return false
      } finally {
        this.loading = false
      }
    },

    async saveProfile(payload = {}) {
      this.error = ''

      if (!hasSupabaseConfig) {
        this.error = getSupabaseConfigError()
        return false
      }

      const auth = useAuthStore()
      if (!auth.initialized) await auth.load()

      if (!auth.user?.id) {
        this.error = 'Inicia sesión o regístrate para guardar el perfil.'
        return false
      }

      const nextName = payload.name?.trim?.() || payload.childName?.trim?.() || ''
      const nextBirthdate = payload.birthdate || payload.childBirthdate || null
      const nextLearningNeeds = normalizeLearningNeeds(payload.learningNeeds || payload.childLearningNeeds)
      const nextOtherLearningNeed = payload.otherLearningNeed?.trim?.() || ''
      const nextLearningProfile = normalizeLearningProfile(
        payload.learningProfile || payload.childLearningProfile
      )
      const profilePayload = {
        name: nextName,
        birthdate: nextBirthdate,
        learning_needs: nextLearningNeeds,
        other_learning_need: nextLearningNeeds.includes('other') ? nextOtherLearningNeed : '',
        learning_profile: nextLearningProfile
      }

      this.loading = true

      try {
        let data
        let error

        if (this.childId) {
          const result = await supabase
            .from('children')
            .update(profilePayload)
            .eq('id', this.childId)
            .eq('user_id', auth.user.id)
            .select('id, name, birthdate, learning_needs, other_learning_need, learning_profile')
            .single()

          data = result.data
          error = result.error
        } else {
          const result = await supabase
            .from('children')
            .insert({
              user_id: auth.user.id,
              ...profilePayload
            })
            .select('id, name, birthdate, learning_needs, other_learning_need, learning_profile')
            .single()

          data = result.data
          error = result.error
        }

        if (error) throw error

        this.childId = data?.id || ''
        this.childName = data?.name || ''
        this.childBirthdate = data?.birthdate || ''
        this.childLearningNeeds = normalizeLearningNeeds(data?.learning_needs)
        this.childOtherLearningNeed = data?.other_learning_need || ''
        this.childLearningProfile = normalizeLearningProfile(data?.learning_profile)

        return true
      } catch (error) {
        this.error = formatProfileSchemaError(error, 'guardar')
        return false
      } finally {
        this.loading = false
      }
    },

    clearProfile() {
      this.childId = ''
      this.childName = ''
      this.childBirthdate = ''
      this.childLearningNeeds = []
      this.childOtherLearningNeed = ''
      this.childLearningProfile = normalizeLearningProfile()
      this.error = ''
    }
  }
})

function normalizeLearningNeeds(value) {
  if (!Array.isArray(value)) return []

  const selected = [...new Set(value.filter(Boolean).map(String))]
  if (selected.includes('none_identified')) return ['none_identified']
  return selected
}

function formatProfileSchemaError(error, action = 'guardar') {
  const message = error?.message || ''
  const details = error?.details || ''
  const hint = error?.hint || ''
  const combined = `${message} ${details} ${hint}`.toLowerCase()

  if (
    combined.includes('learning_needs') ||
    combined.includes('other_learning_need') ||
    combined.includes('learning_profile') ||
    combined.includes('schema cache')
  ) {
    return `No se pudo ${action} el perfil porque faltan columnas en Supabase. Ejecuta el SQL de actualización de la tabla children y recarga el schema cache.`
  }

  return message || `No se pudo ${action} el perfil`
}

export default useProfileStore
