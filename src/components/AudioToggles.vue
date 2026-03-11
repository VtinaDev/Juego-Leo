<template>
  <div class="audio-toggles" role="group" aria-label="Controles de audio">
    <button
      type="button"
      class="toggle"
      :aria-pressed="musicEnabled"
      aria-label="Música"
      @click="handleMusic"
    >
      🎶 <span>Música</span>
    </button>
    <button
      type="button"
      class="toggle"
      :aria-pressed="voiceEnabled"
      aria-label="Voz"
      @click="handleVoice"
    >
      🔊 <span>Voz</span>
    </button>
    <button
      type="button"
      class="toggle"
      :aria-pressed="sfxEnabled"
      aria-label="Efectos"
      @click="handleSfx"
    >
      ✨ <span>SFX</span>
    </button>
  </div>
</template>

<script setup>
import { useAudioSettings } from '../composables/useAudioSettings'
import { unlockAudio } from '../engine/audio/audioManager'

const { musicEnabled, voiceEnabled, sfxEnabled, toggleMusic, toggleVoice, toggleSfx } = useAudioSettings()

function handleMusic() {
  unlockAudio()
  toggleMusic()
}
function handleVoice() {
  unlockAudio()
  toggleVoice()
}
function handleSfx() {
  unlockAudio()
  toggleSfx()
}
</script>

<style scoped>
.audio-toggles {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: white;
  color: #0f172a;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.toggle[aria-pressed='true'] {
  border-color: rgba(16, 185, 129, 0.6);
  box-shadow: 0 8px 18px rgba(16, 185, 129, 0.22);
}
.toggle:focus-visible {
  outline: 2px solid #22c55e;
  outline-offset: 2px;
}
.toggle:hover {
  transform: translateY(-1px);
}
</style>
