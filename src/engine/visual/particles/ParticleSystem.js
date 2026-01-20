import * as PIXI from 'pixi.js'

const systems = new WeakMap()

export class ParticleSystem {
  constructor(stage) {
    this.stage = stage
    this.items = new Set()
    this._tick = this._tick.bind(this)
    this._ticker = null
  }

  add(displayObject, updater) {
    if (!displayObject) return
    this.items.add({ displayObject, update: updater })
    this.stage.addChild(displayObject)
    this._ensureTicker()
  }

  _ensureTicker() {
    if (this._ticker) return
    this._ticker = PIXI.Ticker.shared
    this._ticker.add(this._tick)
  }

  _tick(delta) {
    const removals = []
    this.items.forEach((item) => {
      const keep = item.update?.(item.displayObject, delta) !== false
      if (!keep) {
        removals.push(item)
      }
    })
    removals.forEach((item) => {
      this.items.delete(item)
      if (item.displayObject?.parent === this.stage) {
        this.stage.removeChild(item.displayObject)
      }
    })
    if (this.items.size === 0) {
      this._ticker?.remove(this._tick)
      this._ticker = null
    }
  }

  destroy() {
    this.items.forEach((item) => {
      if (item.displayObject?.parent === this.stage) {
        this.stage.removeChild(item.displayObject)
      }
    })
    this.items.clear()
    if (this._ticker) {
      this._ticker.remove(this._tick)
      this._ticker = null
    }
  }
}

export function getParticleSystem(stage) {
  if (!stage) return null
  if (systems.has(stage)) {
    return systems.get(stage)
  }
  const system = new ParticleSystem(stage)
  systems.set(stage, system)
  return system
}

export default ParticleSystem
