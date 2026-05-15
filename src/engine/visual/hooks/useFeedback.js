import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { gsap } from 'gsap'
import { AUDIO_COPY, AUDIO_EXPERIENCE } from '../../audio/audioExperience.js'
const FEEDBACK_COOLDOWN = 600

export function useFeedback() {
  let lastFeedback = 0

  function playHaptics() {
    try {
      Haptics.impact({ style: ImpactStyle.Light })
    } catch {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(AUDIO_EXPERIENCE.haptics.retryMs)
      }
    }
  }

  function showFeedback({ app, message = AUDIO_COPY.retryFirst, target = null } = {}) {
    const now = Date.now()
    if (now - lastFeedback < FEEDBACK_COOLDOWN) return
    lastFeedback = now

    playHaptics()

    if (target) {
      if (typeof Element !== 'undefined' && target instanceof Element) {
        gsap.to(target, {
          y: '+=3',
          duration: 0.12,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      } else {
        gsap.to(target, {
          y: (target.y ?? 0) + 3,
          duration: 0.12,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut'
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
