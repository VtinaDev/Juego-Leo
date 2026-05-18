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

## Automated Generation

Use the global audio policy from `src/engine/audio/audioExperience.js` to create exercise voice MP3s:

```bash
npm run audio:manifest
npm run audio:generate
npm run audio:generate:all
```

- `audio:manifest`: dry run, exports `scripts/audio/app_voice_audio_manifest.json` and `.csv`.
- `audio:generate`: generates only missing canonical files and writes their routes into `templates.json`.
- `audio:generate:all`: regenerates every global cue and exercise guide audio, overwriting canonical files.

Default pipeline:

```text
Nuevo ejercicio/texto/guia
        ↓
Script detecta texto nuevo en templates.json
        ↓
Genera ID unico del audio desde exercise.id
        ↓
Crea MP3 automaticamente con OpenAI TTS
        ↓
Guarda archivo en public/audio/voice/exercises/generated
        ↓
Actualiza manifest JSON/CSV
        ↓
Actualiza templates.json con la ruta del MP3 generado
        ↓
La app reproduce el audio desde exercise.audio
```

Provider behavior:
- `audio:generate` uses OpenAI TTS by default. Requires `OPENAI_API_KEY`.
- `audio:generate:elevenlabs` uses ElevenLabs when `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` are set.
- `audio:manifest` never writes MP3s or templates; it only previews the plan.
- `templates.json` is updated only after the selected MP3 files are generated successfully.

Useful flags:
- `-- --provider=elevenlabs`
- `-- --provider=openai`
- `-- --limit=5`
- `-- --no-write-templates`
- `-- --dry`

For AI Studio batch generation and naming contract, use:
- `scripts/audio/voice_batch_ai_studio.csv`
- `scripts/audio/VOICE_PRODUCTION_GUIDE.md`
