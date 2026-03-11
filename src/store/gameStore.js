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

function aggregateLearningInsights(stages = {}) {
  const subtypeMap = new Map()
  let totalOk = 0
  let totalFail = 0
  let totalSkipped = 0
  let totalAttempts = 0
  let totalExercises = 0

  for (const levelStages of Object.values(stages || {})) {
    for (const stage of Object.values(levelStages || {})) {
      if (!stage) continue
      const subtype = stage.subtype || 'general'
      const bucket = subtypeMap.get(subtype) || {
        subtype,
        ok: 0,
        fail: 0,
        skipped: 0,
        attempts: 0,
        exercises: 0
      }

      bucket.ok += Number(stage.ok || 0)
      bucket.fail += Number(stage.fail || 0)
      bucket.skipped += Number(stage.skipped || 0)
      bucket.exercises += Number(stage.total || 0)
      bucket.attempts += (stage.results || []).reduce((acc, result) => {
        return acc + Number(result?.attempts || 0)
      }, 0)

      subtypeMap.set(subtype, bucket)

      totalOk += Number(stage.ok || 0)
      totalFail += Number(stage.fail || 0)
      totalSkipped += Number(stage.skipped || 0)
      totalExercises += Number(stage.total || 0)
      totalAttempts += (stage.results || []).reduce((acc, result) => {
        return acc + Number(result?.attempts || 0)
      }, 0)
    }
  }

  const bySubtype = [...subtypeMap.values()]
    .map((entry) => {
      const answered = entry.ok + entry.fail
      const accuracy = answered > 0 ? entry.ok / answered : 0
      const avgAttempts = entry.exercises > 0 ? entry.attempts / entry.exercises : 0
      return {
        ...entry,
        accuracy,
        avgAttempts
      }
    })
    .sort((a, b) => a.accuracy - b.accuracy || b.avgAttempts - a.avgAttempts)

  const answered = totalOk + totalFail
  return {
    totals: {
      ok: totalOk,
      fail: totalFail,
      skipped: totalSkipped,
      attempts: totalAttempts,
      exercises: totalExercises,
      accuracy: answered > 0 ? totalOk / answered : 0
    },
    bySubtype,
    weakest: bySubtype.slice(0, 3),
    strongest: [...bySubtype]
      .sort((a, b) => b.accuracy - a.accuracy || a.avgAttempts - b.avgAttempts)
      .slice(0, 3)
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
      }),

    learningInsights: (state) => aggregateLearningInsights(state.stages)
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
