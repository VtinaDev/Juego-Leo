import { playSfx as playFx } from '../engine/audio/audioManager'

export function playSfx(type = 'click') {
  playFx(type === 'cta' ? 'click' : type)
}

export default { playSfx }
