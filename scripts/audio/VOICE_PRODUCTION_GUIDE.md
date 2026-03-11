# Voice Production Guide (AI Studio)

This project already consumes fixed cue keys from `src/engine/audio/sounds.js`.
To replace voices safely, keep the same target filenames in `public/audio/voice/`.

## 1) Batch source files
Base cues:
- `scripts/audio/voice_batch_ai_studio.csv`

Level-personalized cues (L1-L5 tone direction):
- `scripts/audio/voice_batch_ai_studio_by_level.csv`

Use the level-personalized CSV when you want different emotional tone by stage progression.

Recommended columns used there:
- `event_key`: semantic cue used by the app
- `target_path`: exact file path to overwrite
- `spoken_text`: final script line
- `studio_prompt`: prompt to paste in AI Studio

## 2) Naming contract (must keep)
Required files:
- `public/audio/voice/intro.mp3`
- `public/audio/voice/start.mp3`
- `public/audio/voice/choose.mp3`
- `public/audio/voice/listen.mp3`
- `public/audio/voice/read.mp3`
- `public/audio/voice/breath.mp3`
- `public/audio/voice/try.mp3`
- `public/audio/voice/succes.mp3`
- `public/audio/voice/positive1.mp3`
- `public/audio/voice/positive3.mp3`

You can add more positive variants:
- `public/audio/voice/positive4.mp3`
- `public/audio/voice/positive5.mp3`
- etc.

The app auto-rotates `positiveN` variants when `playVoiceCue('positive')` is called.

## 3) Audio quality target
- Format: MP3
- Sample rate: 44.1kHz
- Peak: around -1 dBFS
- Loudness consistency across all clips (avoid large jumps)
- Natural pauses, no robotic pacing

## 4) Replace workflow
1. Generate clips in AI Studio from the CSV rows.
2. Export with exact names from `target_path`.
3. Overwrite files under `public/audio/voice/`.
4. Run validation:
   - `npm run validate:audio`
5. Run build smoke test:
   - `npm run build`

## 5) Optional normalization check (if ffmpeg is available)
Example command for one file:

```bash
ffmpeg -i input.mp3 -ar 44100 -ac 1 -filter:a "loudnorm=I=-16:LRA=11:TP=-1" output.mp3
```

Use the same process for all cues so volume and timbre feel consistent.
