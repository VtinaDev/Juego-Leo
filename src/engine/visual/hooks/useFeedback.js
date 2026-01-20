import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { gsap } from 'gsap'
import { SoundService } from '../../audio/SoundService'

const FEEDBACK_COOLDOWN = 600

export function useFeedback() {
  let lastFeedback = 0

  function playHaptics() {
    try {
      Haptics.impact({ style: ImpactStyle.Light })
    } catch {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(80)
      }
    }
  }

  function showFeedback({ app, message = 'Casi, mira otra vez', target = null } = {}) {
    const now = Date.now()
    if (now - lastFeedback < FEEDBACK_COOLDOWN) return
    lastFeedback = now

    SoundService.play('error')
    playHaptics()

    if (target) {
      if (typeof Element !== 'undefined' && target instanceof Element) {
        gsap.to(target, {
          x: '+=6',
          duration: 0.05,
          repeat: 3,
          yoyo: true,
          ease: 'power1.inOut'
        })
      } else {
        gsap.to(target, {
          x: (target.x ?? 0) + 6,
          duration: 0.05,
          repeat: 3,
          yoyo: true,
          ease: 'power1.inOut'
        })
      }
    }

    const overlay =
      document.getElementById('feedback') || document.getElementById('feedback-message')
    if (overlay) {
      overlay.textContent = message
      gsap.fromTo(
        overlay,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.25,
          ease: 'power1.out',
          onComplete: () => {
            gsap.to(overlay, {
              autoAlpha: 0,
              duration: 0.4,
              delay: 1.2,
              ease: 'power1.in'
            })
          }
        }
      )
    }

    if (app?.stage) {
      gsap.to(app.stage, {
        skewX: 0.01,
        duration: 0.14,
        yoyo: true,
        repeat: 1,
        ease: 'power1.out'
      })
    }
  }

  return { showFeedback }
}

export default useFeedback
