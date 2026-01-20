import { defineStore } from 'pinia'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    subscribed: false,
    plan: null,
    trialEndsAt: null,
  }),

  actions: {
    load() {
      try {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem('billingData')
        if (saved) {
          Object.assign(this, JSON.parse(saved))
        }
      } catch (error) {
        console.error('⚠️ Error al cargar billingData:', error)
      }
    },

    save() {
      try {
        if (typeof window === 'undefined') return
        localStorage.setItem('billingData', JSON.stringify(this.$state))
      } catch (error) {
        console.error('⚠️ Error al guardar billingData:', error)
      }
    },

    canAccessLevel(level) {
      return true
    },

    toggleSubscription() {
      this.subscribed = !this.subscribed
      this.plan = this.subscribed ? 'manual-toggle' : null
      if (!this.subscribed) {
        this.trialEndsAt = null
      }
      this.save()
    },

    startTrial() {
      this.subscribed = true
      this.plan = 'trial'
      this.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      this.save()
    },

    subscribeMonthly() {
      this.subscribed = true
      this.plan = 'monthly'
      this.trialEndsAt = null
      this.save()
    },

    subscribeAnnual() {
      this.subscribed = true
      this.plan = 'annual'
      this.trialEndsAt = null
      this.save()
    },

    buyLifetime() {
      this.subscribed = true
      this.plan = 'lifetime'
      this.trialEndsAt = null
      this.save()
    }
  },
})
