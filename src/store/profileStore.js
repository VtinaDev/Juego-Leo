import { defineStore } from 'pinia'
import { getSupabaseConfigError, hasSupabaseConfig, supabase } from '../lib/supabaseClient'
import { useAuthStore } from './authStore'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    childId: '',
    childName: '',
    childBirthdate: '',
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
          .select('id, name, birthdate')
          .eq('user_id', auth.user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (error) throw error

        this.childId = data?.id || ''
        this.childName = data?.name || ''
        this.childBirthdate = data?.birthdate || ''

        return true
      } catch (error) {
        this.error = error?.message || 'No se pudo cargar el perfil'
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

      this.loading = true

      try {
        let data
        let error

        if (this.childId) {
          const result = await supabase
            .from('children')
            .update({
              name: nextName,
              birthdate: nextBirthdate
            })
            .eq('id', this.childId)
            .eq('user_id', auth.user.id)
            .select('id, name, birthdate')
            .single()

          data = result.data
          error = result.error
        } else {
          const result = await supabase
            .from('children')
            .insert({
              user_id: auth.user.id,
              name: nextName,
              birthdate: nextBirthdate
            })
            .select('id, name, birthdate')
            .single()

          data = result.data
          error = result.error
        }

        if (error) throw error

        this.childId = data?.id || ''
        this.childName = data?.name || ''
        this.childBirthdate = data?.birthdate || ''

        return true
      } catch (error) {
        this.error = error?.message || 'No se pudo guardar el perfil'
        return false
      } finally {
        this.loading = false
      }
    },

    clearProfile() {
      this.childId = ''
      this.childName = ''
      this.childBirthdate = ''
      this.error = ''
    }
  }
})

export default useProfileStore