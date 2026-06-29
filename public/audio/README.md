# Audio de Juego & Leo

La app no llama a ElevenLabs en runtime. ElevenLabs se usa solo offline desde `scripts/audio/` para generar archivos MP3 por lotes.

## Flujo

1. Añade o edita textos en `scripts/audio/app_voice_audio_manifest.json`.
2. Configura la voz en `scripts/audio/voiceConfig.json`.
3. Define `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` en `.env`.
4. Ejecuta `npm run audio:manifest` para validar y ver pendientes.
5. Ejecuta `npm run audio:generate` para generar MP3 faltantes.
6. Los MP3 se guardan en `public/audio/app-voice/`.
7. La app reproduce esos archivos locales con `playAppVoiceAudio(filename)`.

## Manifest

Cada item debe tener esta forma:

```json
{
  "id": "welcome_intro",
  "text": "Hola, soy Leo. Vamos a aprender jugando.",
  "filename": "welcome_intro.mp3",
  "category": "intro"
}
```

`filename` debe ser unico y terminar en `.mp3`. El generador omite archivos existentes para no duplicar coste. Usa `--force` solo si necesitas regenerar.

## Generacion

```bash
npm run audio:manifest
npm run audio:generate
npm run audio:generate:exercises
node scripts/audio/generateAppVoiceAudio.mjs --force
```

Si falla la generacion, revisa:

- que `.env` tenga `ELEVENLABS_API_KEY`;
- que `voiceConfig.json` tenga `voiceId` o `.env` tenga `ELEVENLABS_VOICE_ID`;
- que la cuenta de ElevenLabs tenga permisos y cuota;
- el log del item fallido. El proceso continua con los demas audios.

Si las frases motivadoras suenan bien pero los ejercicios no, regenera solo ejercicios para no tocar esos audios:

```bash
npm run audio:generate:exercises
```

## Runtime

La UI solo debe reproducir rutas locales bajo:

```txt
/audio/app-voice/{filename}
```

Desde `src/`, usa:

```js
import { playAppVoiceAudio } from '../utils/audioPlayer.js'

await playAppVoiceAudio('welcome_intro.mp3')
```

Si falta un MP3, el helper escribe un warning en consola, devuelve `false` y no rompe la interfaz.

## Validacion

```bash
rg "elevenlabs" src
rg "api.elevenlabs.io" src
npm run audio:manifest
find public/audio/app-voice -name '*.mp3'
```
