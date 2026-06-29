import { playAppVoiceAudio } from './audioPlayer.js'

export async function reproducirFrase(filename) {
  return playAppVoiceAudio(filename)
}

export default {
  reproducirFrase
}
