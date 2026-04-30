import { defineStore } from 'pinia'
import { getSupabaseConfigError, hasSupabaseConfig, supabase } from '../lib/supabaseClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    userEmail: '',
    loading: false,
    initialized: false,
    error: ''
  }),

  getters: {
    isAuthenticated: (state) => !!state.session?.access_token && !!state.user?.id,
    isConfigured: () => hasSupabaseConfig
  },

  actions: {
    async load() {
      if (!hasSupabaseConfig) {
        this.error = getSupabaseConfigError()
        this.initialized = true
        return false
      }

      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        this.setSession(data.session)
        return true
      } catch (error) {
        this.clearSession()
        this.error = getAuthMessage(error)
        return false
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async register(email, password) {
      this.error = ''
      const normalizedEmail = normalizeEmail(email)
      const validation = validateCredentials(normalizedEmail, password)
      if (validation) {
        this.error = validation
        return false
      }
      if (!hasSupabaseConfig) {
        this.error = getSupabaseConfigError()
        return false
      }

      this.loading = true
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password
        })
        if (error) throw error
        this.setSession(data.session)
        if (!data.session && data.user) {
          this.user = data.user
          this.userEmail = data.user.email || normalizedEmail
        }
        return true
      } catch (error) {
        this.error = getAuthMessage(error)
        return false
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async login(email, password) {
      this.error = ''
      const normalizedEmail = normalizeEmail(email)
      const validation = validateCredentials(normalizedEmail, password)
      if (validation) {
        this.error = validation
        return false
      }
      if (!hasSupabaseConfig) {
        this.error = getSupabaseConfigError()
        return false
      }

      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        })
        if (error) throw error
        this.setSession(data.session)
        return true
      } catch (error) {
        this.clearSession()
        this.error = getAuthMessage(error)
        return false
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async logout() {
      this.error = ''
      if (hasSupabaseConfig) {
        const { error } = await supabase.auth.signOut()
        if (error) this.error = getAuthMessage(error)
      }
      this.clearSession()
      this.initialized = true
      return !this.error
    },

    async requestReset(email) {
      this.error = ''
      const normalizedEmail = normalizeEmail(email)
      if (!isValidEmail(normalizedEmail)) {
        this.error = 'Ingresa un email válido'
        return false
      }
      if (!hasSupabaseConfig) {
        this.error = getSupabaseConfigError()
        return false
      }

      const redirectTo = `${window.location.origin}/profile`
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo })
      if (error) {
        this.error = getAuthMessage(error)
        return false
      }
      return true
    },

    async resetPassword(newPassword) {
      this.error = ''
      if (!newPassword || newPassword.length < 6) {
        this.error = 'La nueva contraseña debe tener al menos 6 caracteres'
        return false
      }
      if (!hasSupabaseConfig) {
        this.error = getSupabaseConfigError()
        return false
      }

      const { data, error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        this.error = getAuthMessage(error)
        return false
      }
      if (data.user) this.user = data.user
      return true
    },

    setSession(session) {
      this.session = session || null
      this.user = session?.user || null
      this.userEmail = session?.user?.email || ''
    },

    clearSession() {
      this.session = null
      this.user = null
      this.userEmail = ''
    }
  }
})

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function validateCredentials(email, password) {
  if (!isValidEmail(email)) return 'Ingresa un email válido'
  if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
  return ''
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email || '')
}

function getAuthMessage(error) {
  const message = error?.message || ''
  if (/invalid login credentials/i.test(message)) return 'Email o contraseña incorrectos'
  if (/email not confirmed/i.test(message)) return 'Confirma tu email antes de iniciar sesión'
  if (/user already registered|already registered/i.test(message)) return 'Ya existe una cuenta con ese email'
  if (/password/i.test(message) && /weak|short|length/i.test(message)) {
    return 'La contraseña debe tener al menos 6 caracteres'
  }
  return message || 'No se pudo completar la operación'
}

export default useAuthStore
