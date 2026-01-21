import { defineStore } from 'pinia'

const STORAGE_KEY = 'juegoLeo_childProfile'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    childName: '',
    childBirthdate: ''
  }),

  actions: {
    loadProfile() {
      try {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          this.childName = parsed.childName || ''
          this.childBirthdate = parsed.childBirthdate || ''
        }
      } catch (error) {
        console.error('⚠️ Error al cargar perfil:', error)
      }
    },

    saveProfile(payload = {}) {
      try {
        const nextName = payload.name?.trim?.() || payload.childName?.trim?.() || ''
        const nextBirthdate = payload.birthdate || payload.childBirthdate || ''
        this.childName = nextName
        this.childBirthdate = nextBirthdate
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              childName: this.childName,
              childBirthdate: this.childBirthdate
            })
          )
        }
      } catch (error) {
        console.error('⚠️ Error al guardar perfil:', error)
      }
    }
  }
})

export default useProfileStore
