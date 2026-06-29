# Auditoría visual de assets - Juego & Leo

Fecha: 2026-05-28

Alcance revisado:

- `src/`
- `src/engine/logic/data/templates.json`
- componentes y vistas Vue
- imports de imágenes en `src/assets`
- rutas públicas en `public/`
- iconos, logos, fondos, hábitats, personajes e ilustraciones
- manifests y scripts relacionados con imágenes

No se generaron assets en esta auditoría.

## Resumen

- Imágenes declaradas en ejercicios activos de `templates.json`: 155
- Imágenes faltantes en ejercicios activos de `templates.json`: 0
- Rutas visuales rotas o no locales detectadas fuera del manifest principal de ejercicios: 6, corregidas después de la auditoría
- `npm run validate:content`: OK

## Correcciones aplicadas

| Pantalla / componente | Ejercicio asociado | Ruta anterior | Ruta local final | Tipo de asset | Prioridad | Reutilizable | Estado / detalle |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/views/Home.vue` | N/A | typo de `background_home.png` | `/background_home.png` | fondo | HIGH | YES | Resuelto. Se corrigió el fondo del hero en desktop y mobile. |
| `src/engine/visual/illustrations/IllustrationManager.js` | Ejercicios renderizados por `GameCanvas` sin `exercise.image` | fallback de hábitat inexistente | `/images/habitats/escuela.PNG` | hábitat / fondo | MEDIUM | YES | Resuelto. Se usó un hábitat local existente y coherente como fallback seguro. |
| `src/components/GameCanvas.vue` | Fallback de personaje en modo canvas | import de elefante inexistente | import eliminado | personaje | MEDIUM | YES | Resuelto. El import no se usaba en `levelCharacters`, por lo que se eliminó. |
| `src/components/GameCanvas.vue` | Fallback de personaje nivel 5 en modo canvas | nombre con guion del elefante graduado | `@/assets/characters/Elefante_graduado.png` | personaje | MEDIUM | YES | Resuelto. Se corrigió al nombre real del asset existente. |
| `src/engine/visual/illustrations/IllustrationManager.js` | Ejercicios renderizados por `GameCanvas` sin imagen local | placeholders externos x3 | hábitats locales existentes | ilustración / fallback | LOW | YES | Resuelto. Se reemplazaron dependencias externas por assets locales. |

## Ejercicios

No encontré imágenes faltantes en los ejercicios activos definidos en `src/engine/logic/data/templates.json`.

Validación específica:

- Total de referencias `image` encontradas en `templates.json`: 155
- Total inexistentes en `public/`: 0
- `npm run validate:content`: rutas visuales verificadas correctamente

## Imports rotos

| Archivo | Línea | Import | Prioridad | Comentario |
| --- | ---: | --- | --- | --- |
| `src/components/GameCanvas.vue` | 17 | import de elefante no graduado | MEDIUM | Resuelto. Se eliminó porque no se usaba. |
| `src/components/GameCanvas.vue` | 17 | `@/assets/characters/Elefante_graduado.png` | MEDIUM | Resuelto. El import apunta al asset real existente. |

## Placeholders relacionados con imagen

| Archivo | Placeholder | Prioridad | Comentario |
| --- | --- | --- | --- |
| `src/engine/visual/illustrations/IllustrationManager.js` | placeholders externos x3 | LOW | Resuelto. Se reemplazaron por hábitats locales existentes. |
| `src/components/ui/OptimizedImage.vue` | `Imagen no disponible` | LOW | Fallback textual correcto. No requiere asset nuevo. |
| `src/components/exercises/ExerciseImage.vue` | `Ilustración no disponible` | LOW | Fallback textual correcto. No requiere asset nuevo. |

Los demás `placeholder` encontrados son placeholders de inputs de texto, no de imágenes.

## TODO / FIXME relacionados con imágenes

No encontré comentarios `TODO` o `FIXME` relacionados con imágenes o assets visuales.

## Assets revisados y existentes

Rutas públicas verificadas como existentes:

- `/icons/*` usados por navegación, audio, mapa, metodología, beneficios y marcador.
- `/logo/app-icon.PNG`.
- `/images/characters/*` usados por mapa/perfil.
- `/images/habitats/*` usados por mapa y Home.
- `/images/L1/*`, `/images/L2/*`, `/images/L3/*`, `/images/L4/*`, `/images/L5/*` usados por ejercicios.
- `src/assets/characters/Perezoso.png`, `Zorro.png`, `Oso.png`, `Mono.png`, `Elefante_graduado.png`.
- `src/views/fondo-congrats.PNG`.
- `public/background_home.png`.

## Recomendación antes de generar assets

No hace falta generar imágenes nuevas para los ejercicios activos. Las rutas/nombres detectados ya fueron corregidos:

1. `Home.vue` usa `/background_home.png`.
2. `GameCanvas.vue` usa `Elefante_graduado.png`.
3. El import del elefante no graduado se eliminó porque no se usaba.
4. El fallback inexistente de `IllustrationManager.js` se sustituyó por hábitats locales existentes.
5. Los placeholders externos se reemplazaron por fallbacks locales.
