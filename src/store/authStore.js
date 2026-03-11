import { defineStore } from 'pinia'

const AUTH_KEY = 'juegoLeo_auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userEmail: '',
    token: '',
    password: '',
    resetRequested: false,
    error: ''
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.userEmail
  },

  actions: {
    load() {
      try {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem(AUTH_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          this.userEmail = parsed.userEmail || ''
          this.token = parsed.token || ''
          this.password = parsed.password || ''
          this.resetRequested = false
        }
      } catch (error) {
        console.error('⚠️ Error al cargar auth:', error)
      }
    },

    register(email, password) {
      this.error = ''
      if (!isValidEmail(email)) {
        this.error = 'Ingresa un email válido'
        return false
      }
      if (!password || password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres'
        return false
      }
      this.userEmail = email.trim().toLowerCase()
      this.token = generateToken()
      this.password = password
      this.resetRequested = false
      persist(this)
      return true
    },

    login(email, password) {
      this.error = ''
      if (!isValidEmail(email)) {
        this.error = 'Ingresa un email válido'
        return false
      }
      const saved = loadRaw()
      if (!saved || saved.userEmail !== email.trim().toLowerCase()) {
        this.error = 'No existe una cuenta con ese email'
        return false
      }
      if (!password || password.length < 6 || saved.password !== password) {
        this.error = 'Contraseña incorrecta'
        return false
      }
      this.userEmail = saved.userEmail
      this.token = saved.token || generateToken()
      this.password = saved.password || ''
      this.resetRequested = false
      persist(this)
      return true
    },

    logout() {
      this.userEmail = ''
      this.token = ''
      this.password = ''
      this.resetRequested = false
      this.error = ''
      if (typeof window !== 'undefined') localStorage.removeItem(AUTH_KEY)
    },

    requestReset(email) {
      this.error = ''
      if (!isValidEmail(email)) {
        this.error = 'Ingresa un email válido'
        return false
      }
      const saved = loadRaw()
      if (!saved || saved.userEmail !== email.trim().toLowerCase()) {
        this.error = 'No existe una cuenta con ese email'
        return false
      }
      this.userEmail = saved.userEmail
      this.password = saved.password
      this.token = saved.token
      this.resetRequested = true
      persist(this)
      return true
    },

    resetPassword(newPassword) {
      this.error = ''
      if (!this.resetRequested) {
        this.error = 'Solicita el enlace de recuperación primero.'
        return false
      }
      if (!newPassword || newPassword.length < 6) {
        this.error = 'La nueva contraseña debe tener al menos 6 caracteres'
        return false
      }
      this.password = newPassword
      this.token = generateToken()
      this.resetRequested = false
      persist(this)
      return true
    }
  }
})

function persist(store) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      userEmail: store.userEmail,
      token: store.token,
      password: store.password
    })
  )
}

function loadRaw() {
  try {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem(AUTH_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email || '')
}

export default useAuthStore
