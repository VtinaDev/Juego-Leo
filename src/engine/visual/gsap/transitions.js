import { gsap } from 'gsap'

export function fadeIn(element, { duration = 0.4, delay = 0 } = {}) {
  if (!element) return
  gsap.fromTo(
    element,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration, delay, ease: 'power1.out' }
  )
}

export function fadeOut(element, { duration = 0.3 } = {}) {
  if (!element) return
  gsap.to(element, { autoAlpha: 0, duration, ease: 'power1.in' })
}

export default {
  fadeIn,
  fadeOut
}
