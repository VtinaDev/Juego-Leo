import { defineStore } from 'pinia'

const STORAGE_KEY = 'juegoLeo_childProfile'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    childName: '',
    childBirthdate: '',
    childEmail: '',
    progressSnapshot: null
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
          this.childEmail = parsed.childEmail || ''
          this.progressSnapshot = parsed.progressSnapshot || null
        }
      } catch (error) {
        console.error('⚠️ Error al cargar perfil:', error)
      }
    },

    saveProfile(payload = {}) {
      try {
        const nextName = payload.name?.trim?.() || payload.childName?.trim?.() || ''
        const nextBirthdate = payload.birthdate || payload.childBirthdate || ''
        const nextEmail = payload.email?.trim?.() || payload.childEmail?.trim?.() || ''
        const nextSnapshot = payload.progressSnapshot || this.progressSnapshot || null
        this.childName = nextName
        this.childBirthdate = nextBirthdate
        this.childEmail = nextEmail
        this.progressSnapshot = nextSnapshot
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              childName: this.childName,
              childBirthdate: this.childBirthdate,
              childEmail: this.childEmail,
              progressSnapshot: this.progressSnapshot
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
