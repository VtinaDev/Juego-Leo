# Auditoría de Ruta Zorro

Fecha: 2026-05-29

## Estado Encontrado

- Nivel: `2`, Zorro Astuto, `Entender palabras mágicas`.
- Etapas activas por orden: `multiple_choice`, `pair_synonyms`, `pair_antonyms`, `UNSCRAMBLE_WORD`, `COMPLETE_WORD`.
- Ejercicios existentes antes del ajuste:
  - `multiple_choice`: 7
  - `pair_synonyms`: 3
  - `pair_antonyms`: 2
  - `UNSCRAMBLE_WORD`: 2
  - `COMPLETE_WORD`: 2
  - `PUZZLE_ORDER`: 2 definidos, pero no activos en `order`.

## Riesgos Pedagógicos Detectados

- Poca repetición en ordenar letras y completar palabra: solo dos intentos por habilidad.
- Algunas palabras no tenían imagen de apoyo, elevando la carga para niños con dificultad lectora.
- `COMPLETE_WORD` tenía una pista inconsistente: `sopa` con pista de animal que salta.
- Progresión irregular: se pasaba de reconocer palabras a manipular letras con poco andamiaje.
- `PUZZLE_ORDER` existe, pero no participa en la ruta activa; conviene conservarlo alineado para futuro uso sin cambiar el flujo actual.

## Mejora Aplicada

- `UNSCRAMBLE_WORD` pasa de 2 a 5 ejercicios.
- `COMPLETE_WORD` pasa de 2 a 5 ejercicios.
- Las palabras se repiten con apoyo visual: `sol`, `sopa`, `sapo`, `mesa`, `luna`.
- Se añadieron imágenes existentes a los ejercicios manipulativos para reducir memoria de trabajo.
- Se simplificaron pistas: “Mira el sol”, “Mira la sopa”, “Falta una letra”.
- `PUZZLE_ORDER` se mantiene fuera del orden activo, pero sus dos ejercicios quedan alineados con imágenes y lenguaje simple.

## Resultado

La ruta mantiene arquitectura, progreso, store, audio y `ExerciseEngine`. La mejora se concentra en contenido: más repetición útil, menor carga cognitiva y mejor progresión visual.
