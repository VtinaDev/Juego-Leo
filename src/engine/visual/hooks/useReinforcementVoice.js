import { getAudioSettings, playVoiceCue } from '../../audio/audioManager'

export function useReinforcementVoice() {
  // Mantiene solo los refuerzos que encajan con el flujo de avance.
  const POSITIVE_CUES = ['positive1', 'positive2', 'positive3']

  function randomPositiveCue() {
    const index = Math.floor(Math.random() * POSITIVE_CUES.length)
    return POSITIVE_CUES[index]
  }

  function playPositive(options = {}) {
    playVoiceCue(randomPositiveCue(), options)
  }

  function playPositiveAndWait({ timeoutMs = 2200, ...options } = {}) {
    const audioSettings = getAudioSettings()
    if (!audioSettings.voiceEnabled || (audioSettings.voiceVolume ?? 0) <= 0) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        resolve()
      }

      const timer = setTimeout(() => {
        finish()
      }, timeoutMs)

      playVoiceCue(randomPositiveCue(), {
        ...options,
        onEnd: () => {
          clearTimeout(timer)
          finish()
        }
      })
    })
  }

  function playEncouragement() {
    playVoiceCue('retry')
  }

  return { playPositive, playPositiveAndWait, playEncouragement }
}

export default useReinforcementVoice
