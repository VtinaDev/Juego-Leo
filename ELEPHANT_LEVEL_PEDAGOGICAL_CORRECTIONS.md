# Informe de corrección pedagógica: nivel Elefante

Fecha de revisión: 15 de junio de 2026

## Alcance

Se revisaron exclusivamente las actividades del nivel Elefante correspondientes a:

- tiempos verbales;
- acentuación y sílaba tónica;
- signos de puntuación;
- examen final.

No se modificaron la arquitectura, el diseño ni el funcionamiento general de los ejercicios.

## Correcciones aplicadas

Todas las correcciones se realizaron en `src/engine/logic/data/templates.json`.

| Ejercicio | Líneas modificadas | Corrección | Motivo pedagógico |
| --- | ---: | --- | --- |
| `L5-AG-1` | 2489-2497 | `melodia` pasó a `melodía`; la sílaba tónica pasó de `di` a `dí`; la clasificación pasó de `Aguda` a `Grave`. | `Melodía` es una palabra llana o grave. El hiato `í-a` desplaza la sílaba tónica a `dí` y exige tilde. |
| `L5-AG-2` | 2507-2515 | `fantasia` pasó a `fantasía`; la sílaba tónica pasó de `si` a `sí`; la clasificación pasó de `Aguda` a `Grave`. | `Fantasía` es una palabra llana o grave. El hiato `í-a` hace tónica la sílaba `sí` y exige tilde. |
| `L5-PG-1` | 2879 | La frase pasó a `__ Qué sorpresa verte aquí!`. | El signo inicial debe quedar realmente pendiente para que el niño pueda elegirlo. `Qué` lleva tilde diacrítica en una exclamación. |
| `L5-PG-2` | 2900 | La frase pasó a `__ Cómo te llamas?`. | El signo inicial debe quedar pendiente para que el niño pueda elegirlo. `Cómo` lleva tilde diacrítica en una interrogación directa. |
| `L5-PG-3` | 2921 | Se añadió el espacio de respuesta al final: `Gracias por ayudarme __`. | La consigna pedía seleccionar un punto, pero la frase no indicaba dónde debía insertarse. |
| `L5-FE-2` | 3274 | La pregunta pasó a `Elige el signo inicial que completa la frase: "__ Vienes a la clase de magia?"`. | El signo `¿` ya aparecía en la frase aunque era la respuesta esperada. La nueva redacción elimina esa pista y precisa que se evalúa el signo inicial. |
| `L5-FE-TCOMP-1` | 3310, 3317 | Se añadió el marcador temporal `Ahora` y se adaptó la pista. | `Yo nado` y `yo nadé` eran respuestas posibles sin contexto temporal. `Ahora` determina objetivamente el presente. |
| `L5-FE-TCOMP-4` | 3373, 3380 | Se añadió el marcador temporal `Ahora` y se adaptó la pista. | `Yo como` y `yo comí` eran respuestas posibles sin contexto temporal. `Ahora` determina objetivamente el presente. |
| `L5-FE-TCOMP-10` | 3499, 3506 | Se añadió el marcador habitual `Cada noche` y se adaptó la pista. | `Yo duermo` y `yo dormí` eran respuestas posibles sin contexto temporal. `Cada noche` determina una acción habitual en presente. |

## Actividades revisadas sin cambios

- Los 18 ejercicios de clasificación de tiempos verbales presentan correspondencia correcta entre frase y categoría.
- Los otros 15 ejercicios de acentuación presentan sílaba tónica y clasificación correctas.
- Los otros 15 ejercicios de puntuación presentan una respuesta coherente con la frase.
- Las demás respuestas del examen final son lingüísticamente coherentes con sus preguntas y opciones.

## Verificación

- Auditoría estructural específica del nivel 5: correcta.
- `npm run validate:content`: correcto.
- `npm run validate:audio`: correcto; 366 rutas verificadas.

Los archivos MP3 existentes no se regeneraron, porque esta tarea se limita a corregir el contenido lingüístico declarativo y no incluye producción de voz.
