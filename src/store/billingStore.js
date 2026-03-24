import { defineStore } from 'pinia'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    subscribed: false,
    plan: null,
    trialEndsAt: null,
    trialUsed: false,
    demoPlanActive: false,
    demoPlanId: null,
    demoActivatedAt: null
  }),

  getters: {
    trialActive: (state) => {
      if (state.plan !== 'trial') return false
      if (!state.trialEndsAt) return false
      const ends = new Date(state.trialEndsAt)
      if (Number.isNaN(ends.getTime())) return false
      return ends.getTime() > Date.now()
    },
    trialExpired() {
      if (!this.trialUsed) return false
      if (this.plan === 'trial') return !this.trialActive
      return !this.trialActive
    },
    trialDaysLeft: (state) => {
      if (!state.trialEndsAt) return 0
      const ends = new Date(state.trialEndsAt)
      if (Number.isNaN(ends.getTime())) return 0
      const diffMs = ends.getTime() - Date.now()
      return diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0
    },
    hasActiveSubscription() {
      if (!this.subscribed) return false
      if (this.plan === 'trial') return this.trialActive
      return true
    }
  },

  actions: {
    load() {
      try {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem('billingData')
        const savedDemo = localStorage.getItem('juegoLeo_demoPlan')
        if (saved) Object.assign(this, JSON.parse(saved))
        if (savedDemo) Object.assign(this, JSON.parse(savedDemo))
        this.enforceTrialValidity()
      } catch (error) {
        console.error('⚠️ Error al cargar billingData:', error)
      }
    },

    save() {
      try {
        if (typeof window === 'undefined') return
        localStorage.setItem('billingData', JSON.stringify(this.$state))
        localStorage.setItem(
          'juegoLeo_demoPlan',
          JSON.stringify({
            demoPlanActive: this.demoPlanActive,
            demoPlanId: this.demoPlanId,
            demoActivatedAt: this.demoActivatedAt
          })
        )
      } catch (error) {
        console.error('⚠️ Error al guardar billingData:', error)
      }
    },

    enforceTrialValidity() {
      if (this.plan !== 'trial') return
      const ends = this.trialEndsAt ? new Date(this.trialEndsAt) : null
      if (!ends || Number.isNaN(ends.getTime()) || ends.getTime() <= Date.now()) {
        this.subscribed = false
        this.plan = null
        this.trialEndsAt = null
        this.trialUsed = true
        this.save()
      }
    },

    canAccessLevel(level) {
      this.enforceTrialValidity()
      // Modo inspección: permitir acceso a todos los niveles sin suscripción.
      return Number(level) >= 1
    },

    toggleSubscription() {
      const wasPlan = this.plan
      this.subscribed = !this.subscribed
      this.plan = this.subscribed ? 'manual-toggle' : null
      this.demoPlanActive = false
      this.demoPlanId = null
      this.demoActivatedAt = null
      if (!this.subscribed) {
        this.trialEndsAt = null
        if (wasPlan === 'trial') this.trialUsed = true
      }
      this.save()
    },

    startTrial() {
      this.enforceTrialValidity()
      if (this.trialUsed && !this.trialActive) return false
      this.subscribed = true
      this.plan = 'trial'
      this.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      this.trialUsed = true
      this.demoPlanActive = false
      this.save()
      return true
    },

    subscribeMonthly() {
      this.subscribed = true
      this.plan = 'monthly'
      this.trialEndsAt = null
      this.demoPlanActive = false
      this.save()
    },

    subscribeAnnual() {
      this.subscribed = true
      this.plan = 'annual'
      this.trialEndsAt = null
      this.demoPlanActive = false
      this.save()
    },

    buyLifetime() {
      this.subscribed = true
      this.plan = 'lifetime'
      this.trialEndsAt = null
      this.demoPlanActive = false
      this.save()
    },

    startDemoPlan(planId) {
      this.demoPlanActive = true
      this.demoPlanId = planId || 'demo'
      this.demoActivatedAt = new Date().toISOString()
      this.save()
    }
  },
})
