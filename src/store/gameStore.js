import { defineStore } from 'pinia'
import { getLevelDefinition, listLevels } from '../engine/logic/utils/validateTemplates.js'
import { getSupabaseConfigError, hasSupabaseConfig, supabase } from '../lib/supabaseClient'
import { useAuthStore } from './authStore'
import { useProfileStore } from './profileStore'

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

    async loadProgressFromSupabase() {
      if (!hasSupabaseConfig) {
        console.warn(getSupabaseConfigError())
        return false
      }

      const auth = useAuthStore()
      if (!auth.initialized) await auth.load()

      if (!auth.user?.id) {
        return false
      }

      const profile = useProfileStore()
      if (!profile.childId) {
        await profile.loadProfile()
      }

      const { data, error } = await supabase
        .from('game_progress')
        .select('level_id, stage_id, stars, points, completed, completed_at')
        .eq('user_id', auth.user.id)
        .eq('child_id', profile.childId)

      if (error) {
        console.error('Error cargando progreso desde Supabase:', error)
        return false
      }

      const nextStages = {}
      let nextStars = 0
      let nextPoints = 0

      for (const item of data || []) {
        const levelKey = String(item.level_id)
        const stageKey = String(item.stage_id)

        if (!nextStages[levelKey]) nextStages[levelKey] = {}

        nextStages[levelKey][stageKey] = {
          done: Boolean(item.completed),
          stars: Number(item.stars || 0),
          points: Number(item.points || 0),
          completedAt: item.completed_at
        }

        nextStars += Number(item.stars || 0)
        nextPoints += Number(item.points || 0)
      }

      this.stages = nextStages
      this.stars = nextStars
      this.points = nextPoints

      this.save()

      return true
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

    async setStageResult(level, stage, result) {
      if (!this.stages[level]) this.stages[level] = {}

      const completedAt = result?.completedAt || new Date().toISOString()

      this.stages[level][stage] = {
        ...result,
        done: true,
        completedAt
      }

      this.updateStars()
      this.save()

      await this.saveStageProgressToSupabase(level, stage, this.stages[level][stage])
    },

    async saveStageProgressToSupabase(level, stage, result) {
      if (!hasSupabaseConfig) {
        console.warn(getSupabaseConfigError())
        return false
      }

      const auth = useAuthStore()
      if (!auth.initialized) await auth.load()

      if (!auth.user?.id) {
        return false
      }

      const profile = useProfileStore()
      if (!profile.childId) {
        await profile.loadProfile()
      }

      const { error } = await supabase
        .from('game_progress')
        .upsert(
          {
            user_id: auth.user.id,
            child_id: profile.childId || null,
            level_id: Number(level),
            stage_id: Number(stage),
            stars: Number(result?.stars || 0),
            points: Number(result?.points || 0),
            completed: Boolean(result?.done ?? true),
            completed_at: result?.completedAt || new Date().toISOString()
          },
          {
            onConflict: 'user_id,child_id,level_id,stage_id'
          }
        )

      if (error) {
        console.error('Error guardando progreso en Supabase:', error)
        return false
      }

      return true
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
    }
  }
})

export default useGameStore