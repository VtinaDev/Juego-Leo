import { computed, ref } from 'vue'
import {
  getAudioSettings,
  updateAudioSettings,
  playMusic,
  stopMusic,
  setVolumes as setVolumesApi
} from '../engine/audio/audioManager'

const settingsRef = ref(getAudioSettings())

function commit(next) {
  settingsRef.value = { ...settingsRef.value, ...next }
  updateAudioSettings(settingsRef.value)
}

export function useAudioSettings() {
  const musicEnabled = computed(() => settingsRef.value.musicEnabled)
  const sfxEnabled = computed(() => settingsRef.value.sfxEnabled)
  const voiceEnabled = computed(() => settingsRef.value.voiceEnabled)
  const musicVolume = computed(() => settingsRef.value.musicVolume)
  const sfxVolume = computed(() => settingsRef.value.sfxVolume)
  const voiceVolume = computed(() => settingsRef.value.voiceVolume)

  function toggleMusic() {
    const enabled = !settingsRef.value.musicEnabled
    commit({ musicEnabled: enabled })
    if (!enabled) stopMusic()
    else playMusic('intro')
  }
  function toggleSfx() {
    commit({ sfxEnabled: !settingsRef.value.sfxEnabled })
  }
  function toggleVoice() {
    commit({ voiceEnabled: !settingsRef.value.voiceEnabled })
  }

  function setVolumes(partial) {
    setVolumesApi(partial)
    settingsRef.value = { ...settingsRef.value, ...partial }
  }

  return {
    settings: settingsRef,
    musicEnabled,
    sfxEnabled,
    voiceEnabled,
    musicVolume,
    sfxVolume,
    voiceVolume,
    toggleMusic,
    toggleSfx,
    toggleVoice,
    setVolumes
  }
}
