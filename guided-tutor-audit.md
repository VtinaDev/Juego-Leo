# Auditoría de GuidedTutor

Fecha: 2026-05-29

## Uso actual

- `GuidedTutor.vue` se usa en `src/views/Game.vue`, dentro de la tarjeta principal del ejercicio y antes del contenido interactivo.
- Aparece cuando hay un ejercicio actual y `currentStatus` no es `ok` ni `skipped`.
- Recibe `characterImg`, `step`, `steps` y `stepIndex`. Emite `play` para repetir el audio de guía.
- El audio se resuelve desde `Game.vue` con la ruta/cue existente del ejercicio (`cueForExercise`, `audio` o `id`), sin cambiar la arquitectura offline.

## Limitaciones detectadas

- Los tres pasos del tutor repetían el mismo texto del ejercicio, a veces largo.
- El componente llamaba al contenido `word`, aunque renderizaba instrucciones completas.
- `Game.vue` tenía estilos antiguos de `.guided-tutor` que ya no correspondían al componente real `.guided-tutor-card`.
- El audio podía dispararse por el watcher del ejercicio y por el temporizador del tutor, duplicando la carga inicial.
- Varias familias de ejercicios mostraban el ejercicio directamente sin una instrucción breve común.

## Integración aplicada

- `Game.vue` genera pasos reutilizables por ejercicio: mirar, escuchar y actuar, solo cuando aplican.
- El mensaje final de acción se define por tipo: elegir, ordenar, unir, completar, leer o escribir.
- `GuidedTutor.vue` ahora renderiza `message` y mantiene compatibilidad con `label`.
- El foco visual existente se conserva con las clases `tutor-focus-visual`, `tutor-focus-audio` y `tutor-focus-options`.
- El audio automático queda centralizado en el ciclo del tutor para evitar dobles reproducciones.

## Patrón resultante

Tutor -> mensaje corto -> audio -> ejercicio -> feedback -> siguiente paso.

Este patrón se monta una sola vez en `Game.vue`, por lo que los ejercicios nuevos lo heredan sin crear componentes ni sistemas nuevos.
