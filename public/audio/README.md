# Audio Assets

This app loads audio directly from `public/audio`.

Current runtime paths:
- `public/audio/sfx/*.wav`
- `public/audio/music/*.mp3`
- `public/audio/voice/*.mp3`
- `public/audio/voice/exercises/*.mp3`

## Global Audio System

The runtime audio contract is centralized in `src/engine/audio`:

- `audioExperience.js`: tone, copy, volume profile and calm retry policy for children ages 4-10 with neurodivergent learning needs.
- `sounds.js`: canonical SFX, music and ElevenLabs voice route registry.
- `audioManager.js`: browser audio playback, TTS fallback in dev, voice/music/SFX settings and autoplay retry.
- `SoundService.js`: Howler-backed SFX used by Pixi/GSAP celebration flows.
- `voiceProfile.js`: slow, stable Spanish voice profile for generated fallback speech.

Tone rules:
- Short phrases, one instruction at a time.
- Motivating and optimistic without pressure.
- Error states use calm guidance, not alarm language or harsh sound.
- MP3 voice has priority; browser TTS is only a development fallback unless explicitly enabled.

Latest audit:
- `npm run validate:audio` verified 370 audio routes.
- Exercise audio coverage from `templates.json`: L1 24/39, L2 12/18, L3 6/23, L4 9/9, L5 11/72.
- `npm run audio:missing-checklist` exports the current missing production voice list to `scripts/audio/missing_exercise_audio.csv`.

For AI Studio batch generation and naming contract, use:
- `scripts/audio/voice_batch_ai_studio.csv`
- `scripts/audio/VOICE_PRODUCTION_GUIDE.md`
