import { Howl } from 'howler'

const VOICE_DEFS = [
  ['/assets/voice/great_job.mp3', 0.9],
  ['/assets/voice/well_done.mp3', 0.9],
  ['/assets/voice/keep_trying.mp3', 0.9]
]

const voices = VOICE_DEFS.map(([src, volume]) => new Howl({ src: [src], volume }))

export function useReinforcementVoice() {
  function playPositive() {
    const index = Math.floor(Math.random() * 2)
    voices[index]?.play()
  }

  function playEncouragement() {
    voices[2]?.play()
  }

  return { playPositive, playEncouragement }
}

export default useReinforcementVoice
