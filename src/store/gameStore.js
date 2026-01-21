import { defineStore } from 'pinia'
import { getLevelDefinition, listLevels } from '../engine/logic/utils/validateTemplates.js'


function computeLevelProgress(state, level) {
  const levelKey = String(level)
  const levelDef = getLevelDefinition(levelKey)
  const totalStages =
    levelDef?.order?.length ||
    (levelDef?.subtypes ? Object.keys(levelDef.subtypes).length : 0) ||
    1
  const levelStages = state.stages?.[levelKey] || {}
  const completedStages = Object.values(levelStages).filter((stage) => stage?.done).length
  const nextStage = Math.min(completedStages + 1, totalStages)
  const lastStage = Object.values(levelStages)
    .filter(Boolean)
    .sort((a, b) => new Date(b.completedAt ?? 0) - new Date(a.completedAt ?? 0))[0]
  return {
    totalStages,
    completedStages,
    nextStage,
    lastStage,
    percent: totalStages ? completedStages / totalStages : 0
  }
}

export const useGameStore = defineStore('game', {
  state: () => ({
    points: 0,
    stars: 0,
    stages: {},
    child: {
      name: '',
      birthdate: ''
    }
  }),

  getters: {
    getLevelProgress: (state) => (level) => computeLevelProgress(state, level),

    levelTimeline: (state) =>
      listLevels().map((levelId) => {
        const def = getLevelDefinition(levelId)
        return {
          levelId: Number(levelId),
          levelName: def?.meta?.levelName ?? `Nivel ${levelId}`,
          icon: def?.meta?.icon ?? '⭐',
          color: def?.meta?.color ?? '#1d4ed8',
          progress: computeLevelProgress(state, levelId)
        }
      })
  },

  actions: {
    load() {
      try {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem('gameData')
        if (saved) {
          const parsed = JSON.parse(saved)
          Object.assign(this, parsed)
        }
      } catch (error) {
        console.error('⚠️ Error al cargar gameData:', error)
      }
    },

    save() {
      try {
        if (typeof window === 'undefined') return
        localStorage.setItem('gameData', JSON.stringify(this.$state))
      } catch (error) {
        console.error('⚠️ Error al guardar gameData:', error)
      }
    },

    addPoints(value = 10) {
      this.points += value
      this.save()
    },

    setStageResult(level, stage, result) {
      if (!this.stages[level]) this.stages[level] = {}
      this.stages[level][stage] = result
      this.updateStars()
      this.save()
    },

    setChild(payload) {
      this.child = {
        name: payload?.name?.trim() || '',
        birthdate: payload?.birthdate || ''
      }
      this.save()
    },

    updateStars() {
      let total = 0
      for (const level of Object.values(this.stages)) {
        for (const stage of Object.values(level)) {
          if (stage.stars) total += stage.stars
        }
      }
      this.stars = total
    },

    resetGame() {
      this.points = 0
      this.stars = 0
      this.stages = {}
      this.child = { name: '', birthdate: '' }
      this.save()
    },
  },
})
