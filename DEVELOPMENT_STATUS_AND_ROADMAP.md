# Informe de desarrollo y hoja de ruta

Fecha de auditoría: 15 de junio de 2026

## 1. Resumen ejecutivo

Juego & Leo se encuentra en estado de **prototipo funcional avanzado / beta interna**.

La aplicación ya dispone de una experiencia educativa reconocible y de una base técnica útil:

- Vue 3, Vite, Pinia y Vue Router.
- Autenticación con Supabase.
- Perfil infantil y cuestionario de aprendizaje.
- Persistencia local y remota del progreso.
- Cinco niveles, mapa interactivo y pantalla de felicitación.
- Motor de ejercicios con audio, voz, feedback y animaciones.
- 165 ejercicios activos distribuidos en 22 etapas.
- Validadores automáticos para rutas de audio y recursos visuales.
- Despliegue web preparado para Vercel y configuración inicial de Capacitor.

La app **todavía no está preparada para un lanzamiento público con pagos**. Los bloqueos principales son:

1. No hay tests automatizados, lint, comprobación de tipos ni CI.
2. La suscripción es un mock modificable desde `localStorage`.
3. Las rutas internas `/ai-lab` y `/batch-viewer` son públicas.
4. La configuración futura de IA contempla claves `VITE_*`, que serían visibles en el navegador.
5. `Game.vue` concentra 3.744 líneas y demasiadas responsabilidades.
6. El bundle principal es de unos 900 KB minificado y `public/` pesa unos 180 MB.
7. Hay muchos cambios locales y una migración de assets todavía sin consolidar.
8. Falta completar el endurecimiento de datos, privacidad, accesibilidad y operación en producción.

## 2. Estado actual por área

| Área | Estado | Evaluación |
| --- | --- | --- |
| Experiencia educativa | Avanzada | Los cinco niveles, ejercicios, feedback, mapa y audio forman un flujo funcional. |
| Contenido | Avanzado | 165 ejercicios activos y 167 definidos. Hay dos ejercicios inactivos en nivel 2 y un título de etapa vacío en nivel 1. |
| Diseño responsive | En progreso | Hay adaptación responsive y soporte parcial para movimiento reducido, pero falta QA sistemático por dispositivo. |
| Accesibilidad | En progreso | Existen `aria-label`, estados vivos, textos alternativos y navegación por teclado en varios componentes. Falta auditoría WCAG completa. |
| Autenticación | Funcional | Supabase Auth protege mapa y juego. Faltan pruebas de sesión, recuperación, errores y expiración. |
| Perfil y progreso | Funcional con riesgos | Se guardan perfiles y progreso en Supabase. Deben reforzarse políticas, migraciones y pruebas de sincronización. |
| Suscripciones | Demo | Los planes y la prueba se almacenan localmente; no existe facturación ni autorización en servidor. |
| Arquitectura frontend | Frágil | Hay buenos módulos de motor, audio y renderers, pero varias vistas son demasiado grandes y existe código duplicado/no usado. |
| Rendimiento | Insuficiente para lanzamiento | Bundle principal grande, rutas cargadas estáticamente y numerosos PNG de 1-4 MB. |
| Calidad automatizada | Inicial | El build y los validadores funcionan, pero no hay suite de tests, lint, formatter ni CI. |
| PWA/móvil | Parcial | Hay manifest e instalación capturada, pero no se encontró service worker ni estrategia offline. Capacitor solo tiene configuración base. |
| Observabilidad | Pendiente | No hay captura centralizada de errores, métricas de producto, rendimiento real ni alertas. |
| Seguridad y privacidad | Pendiente de endurecimiento | RLS está activa para hijos y progreso, pero faltan políticas completas, validaciones de relación y revisión específica de datos de menores. |

## 3. Evidencias verificadas

### Build y dependencias

- `npm run build`: correcto.
- `npm run validate:audio`: 366 rutas verificadas.
- `npm run validate:content`: correcto.
- `npm audit --offline --omit=dev`: 0 vulnerabilidades conocidas en la información local disponible.
- Bundle JavaScript principal: aproximadamente 900 KB minificado y 270 KB gzip.
- El build avisa de chunks superiores a 500 KB.

### Código

- 48 componentes/vistas Vue.
- 80 archivos JavaScript/TypeScript.
- `Game.vue`: 3.744 líneas.
- `Profile.vue`: 897 líneas.
- `MapView.vue`: 847 líneas.
- No hay configuración de ESLint, Prettier, Vitest, Playwright o Cypress.
- `test-level.mjs` solo imprime una definición de nivel; no es una prueba automatizada.
- Existe un árbol `src/app/` que no participa en la aplicación principal.

### Contenido

| Nivel | Etapas activas | Ejercicios activos | Ejercicios definidos |
| --- | ---: | ---: | ---: |
| 1 | 6 | 39 | 39 |
| 2 | 5 | 22 | 24 |
| 3 | 3 | 23 | 23 |
| 4 | 3 | 9 | 9 |
| 5 | 5 | 72 | 72 |
| **Total** | **22** | **165** | **167** |

### Assets

- `public/`: aproximadamente 180 MB.
- `dist/`: aproximadamente 198 MB.
- Se detectaron 163 imágenes.
- Hay decenas de PNG superiores a 1 MB y varios entre 2 y 4 MB.
- Los WebP optimizados existen, pero la adopción todavía es parcial.
- Hay duplicados, extensiones `.PNG` en mayúsculas y variantes `nino/niño`, que aumentan el riesgo en sistemas sensibles a mayúsculas.

## 4. Riesgos priorizados

### P0: bloquean un lanzamiento público

#### 4.1 Consolidación del repositorio

El árbol de trabajo contiene numerosas modificaciones, eliminaciones y archivos sin seguimiento. Antes de ampliar funcionalidad:

- Separar cambios por tema: mapa, audio, assets, contenido y vistas.
- Confirmar que cada eliminación tiene reemplazo y que las rutas ya usan el reemplazo.
- Eliminar `.DS_Store` y residuos generados.
- Crear commits pequeños y reversibles.
- Establecer una rama de integración y proteger `main`.

#### 4.2 Autorización y pagos reales

`billingStore` confía en `localStorage` y `canAccessLevel()` permite todos los niveles. Esto sirve para demo, pero no para monetización.

Se necesita:

- Proveedor de pagos y checkout alojado.
- Webhooks verificados en servidor.
- Tabla de suscripciones o entitlements en backend.
- Control de acceso resuelto por servidor, nunca solo por Pinia o `localStorage`.
- Estados de pago: trial, activo, impago, cancelado, expirado y reembolso.
- Portal de cliente y recuperación ante fallos de webhook.

#### 4.3 Secretos y herramientas internas

- No usar claves privadas en variables `VITE_*`; Vite las incorpora al bundle público.
- Toda llamada a IA debe pasar por una función de servidor autenticada, con límites y validación.
- Proteger o excluir de producción `/ai-lab` y `/batch-viewer`.
- Revisar también `VITE_ILLUSTRATION_TOKEN`: un token incluido así es público.

#### 4.4 Datos de menores

La aplicación almacena nombre, fecha de nacimiento, necesidades y perfil de aprendizaje.

Antes del lanzamiento:

- Minimizar los datos solicitados y documentar su finalidad.
- Definir retención, borrado de cuenta y exportación.
- Añadir consentimiento y textos legales revisados profesionalmente.
- Auditar RLS con usuarios distintos y pruebas negativas.
- Añadir política para `profiles`, si la tabla se va a utilizar.
- Hacer que la política de `game_progress` valide que `child_id` pertenece al mismo usuario.
- Evitar datos personales en logs, analítica y herramientas de errores.

#### 4.5 Calidad automatizada

No debe continuarse hacia producción sin una red mínima de seguridad:

- ESLint y formatter.
- `vue-tsc` o estrategia explícita de tipado.
- Tests unitarios del motor, stores y validadores.
- Tests de componentes críticos.
- Tests E2E de autenticación, onboarding, nivel y progreso.
- CI obligatoria en cada pull request.

### P1: alto impacto técnico y de experiencia

#### 4.6 Descomponer `Game.vue`

La vista mezcla:

- navegación;
- carga de contenido;
- estado del ejercicio;
- audio y voz;
- feedback;
- renderizado de muchos tipos;
- persistencia;
- estilos.

Debe evolucionar hacia:

```text
views/Game.vue
features/game/
  composables/
    useGameSession
    useExerciseAudio
    useExerciseFeedback
    useStageNavigation
  components/
    GameHeader
    ExerciseHost
    GameFeedback
    GameControls
  exercise-types/
    QuestionSentenceExercise
    CompleteSentenceExercise
    OrderSentenceExercise
    ...
```

La extracción debe ser incremental y cubierta por tests; no conviene reescribir toda la vista de una vez.

#### 4.7 Reducir bundle y carga inicial

- Convertir vistas a imports dinámicos en el router.
- Cargar Pixi, GSAP, voz y laboratorios solo cuando se necesitan.
- Separar herramientas internas del bundle de usuario.
- Medir con un visualizador de bundle.
- Definir presupuestos de rendimiento en CI.

Objetivos iniciales:

- JavaScript inicial gzip inferior a 170 KB.
- Ningún chunk de ruta superior a 350 KB sin justificación.
- Imágenes hero por debajo de 300 KB.
- Iconos por debajo de 50 KB, preferiblemente SVG/WebP.

#### 4.8 Completar la migración de assets

- Sustituir PNG pesados por WebP/AVIF con dimensiones correctas.
- Usar `OptimizedImage.vue` o una política de imagen común.
- Añadir `width` y `height` o `aspect-ratio` para evitar saltos de layout.
- Eliminar originales únicamente después de verificar todas las referencias.
- Normalizar nombres a minúsculas ASCII.
- Añadir umbrales de peso al script de auditoría y hacerlos fallar en CI.

### P2: preparación de producto y operación

#### 4.9 Accesibilidad

- Auditoría con teclado, VoiceOver/TalkBack y zoom al 200%.
- Foco visible y orden lógico en modales, mapa, drag and drop y ejercicios.
- Alternativas accesibles para arrastrar, reconocimiento de voz y contenido solo auditivo.
- Contraste, objetivos táctiles mínimos y textos de error asociados.
- Pruebas automáticas con axe más revisión manual.

#### 4.10 PWA y Capacitor

Hay manifest, pero no una estrategia offline completa.

Decidir primero:

- **Web/PWA**: service worker, caché versionada, fallback offline y política para audio.
- **Apps nativas con Capacitor**: proyectos iOS/Android, permisos, splash, iconos, firma, privacidad y pruebas en dispositivo.

No mantener ambas vías como “casi preparadas”; elegir una como objetivo de lanzamiento y dejar la otra como fase posterior.

#### 4.11 Observabilidad

- Captura de errores con redacción de datos sensibles.
- Web Vitals y tiempos de carga por dispositivo.
- Eventos de producto: onboarding completado, etapa iniciada/completada, abandono y error de audio.
- Alertas de autenticación, persistencia y webhooks.
- Identificador de versión visible para soporte.

## 5. Hoja de ruta paso a paso

Las duraciones son orientativas para una persona frontend senior con apoyo puntual de backend, diseño y contenido.

### Fase 0. Definir el alcance de lanzamiento

Duración: 1-2 días.

1. Elegir plataforma inicial: web responsive, PWA o tienda móvil.
2. Decidir si el primer lanzamiento incluye pagos reales.
3. Definir navegadores, dispositivos y versiones soportadas.
4. Fijar los cinco flujos críticos:
   - registro/inicio de sesión;
   - creación del perfil infantil;
   - entrada al mapa;
   - completar una etapa;
   - recuperar progreso en otra sesión.
5. Definir métricas de éxito y criterios de no lanzamiento.

**Definition of Done**

- Documento de alcance aprobado.
- Matriz de dispositivos.
- Lista cerrada de funcionalidades de la versión 1.

### Fase 1. Estabilizar repositorio y entorno

Duración: 2-4 días.

1. Clasificar y revisar todos los cambios locales.
2. Completar la migración de assets sin rutas rotas.
3. Eliminar `src/app/` si se confirma que es código muerto.
4. Añadir versiones de Node/npm mediante `.nvmrc` o `engines`.
5. Completar `.env.example` sin secretos.
6. Añadir scripts `lint`, `format`, `typecheck`, `test` y `check`.
7. Actualizar README con instalación, arquitectura y despliegue.

**Definition of Done**

- `git status` limpio.
- Instalación reproducible desde clon nuevo.
- `npm run check` ejecuta todas las comprobaciones locales.

### Fase 2. Crear la red de calidad

Duración: 5-8 días.

1. Configurar ESLint para Vue y TypeScript.
2. Configurar formatter y reglas de imports.
3. Instalar Vitest y Vue Test Utils.
4. Añadir tests del `ExerciseEngine`.
5. Añadir tests de progreso, bloqueo de niveles y sincronización de stores.
6. Añadir tests de validación del contenido.
7. Configurar Playwright para los cinco flujos críticos.
8. Crear GitHub Actions para instalar, validar, probar y construir.

**Definition of Done**

- CI obligatoria y verde.
- Tests deterministas.
- Cobertura prioritaria sobre lógica de negocio, no una cifra artificial global.

### Fase 3. Endurecer backend, seguridad y privacidad

Duración: 5-8 días, con revisión backend.

1. Convertir `supabase-schema.sql` en migraciones versionadas.
2. Añadir y probar políticas faltantes.
3. Validar relaciones `user_id`/`child_id` en progreso.
4. Probar sesiones expiradas, logout y recuperación.
5. Implementar borrado/exportación de datos.
6. Mover futuras llamadas de IA al servidor.
7. Ocultar herramientas internas mediante build flag y autorización.
8. Revisar textos y tratamiento de datos de menores con asesoramiento adecuado.

**Definition of Done**

- Tests de RLS con dos usuarios independientes.
- Ningún secreto privado en el bundle.
- Rutas internas inaccesibles en producción.
- Flujo de borrado de cuenta verificado.

### Fase 4. Refactor incremental del juego

Duración: 7-12 días.

1. Congelar el comportamiento actual con tests E2E.
2. Extraer navegación y sesión a composables.
3. Extraer audio/voz a una interfaz única.
4. Crear `ExerciseHost` con registro de tipos.
5. Mover cada familia de ejercicio a componentes independientes.
6. Extraer estilos por feature.
7. Mantener un contrato tipado común para ejercicios.
8. Eliminar renderers y ramas antiguas solo después de comprobar equivalencia.

**Definition of Done**

- `Game.vue` actúa como orquestador y no como implementación de todos los ejercicios.
- Cada tipo de ejercicio puede probarse de forma aislada.
- No hay regresiones en progreso, audio o feedback.

### Fase 5. Rendimiento y assets

Duración: 5-8 días.

1. Aplicar lazy loading a todas las rutas.
2. Separar dependencias pesadas por feature.
3. Migrar imágenes críticas a WebP/AVIF.
4. Generar variantes responsive.
5. Precargar solo recursos del siguiente ejercicio.
6. Definir caché para audio e imágenes.
7. Medir móvil de gama media con red limitada.
8. Añadir presupuestos de bundle y assets a CI.

**Definition of Done**

- Cumplimiento de los presupuestos acordados.
- Sin imágenes de varios MB en recorridos principales.
- Inicio, mapa y primer ejercicio medidos en dispositivo real.

### Fase 6. UX, accesibilidad y contenido

Duración: 5-10 días.

1. Completar el título vacío de la etapa del nivel 1.
2. Decidir si los dos ejercicios inactivos del nivel 2 se activan o eliminan.
3. Revisar equilibrio: el nivel 4 tiene 9 ejercicios y el nivel 5 tiene 72.
4. Probar todos los ejercicios con teclado y lector de pantalla.
5. Añadir alternativas a drag and drop y voz.
6. Unificar estados: cargando, vacío, error, offline y reintento.
7. Validar lenguaje, dificultad y feedback con especialista educativo.
8. Realizar sesiones con familias y registrar problemas por severidad.

**Definition of Done**

- Sin bloqueos de accesibilidad en flujos críticos.
- Contenido aprobado pedagógicamente.
- Errores y estados vacíos tienen recuperación clara.

### Fase 7. Suscripciones y autorización

Duración: 7-12 días, si forma parte de la versión 1.

1. Diseñar productos y precios en el proveedor.
2. Crear checkout en backend.
3. Procesar webhooks idempotentes.
4. Persistir entitlements en base de datos.
5. Sincronizar el frontend desde el servidor.
6. Añadir portal de cliente.
7. Probar renovaciones, fallos, cancelaciones y reembolsos.
8. Eliminar controles de acceso basados únicamente en `localStorage`.

**Definition of Done**

- El usuario no puede concederse acceso editando el navegador.
- Los eventos de pago duplicados no duplican cambios.
- Estado de acceso consistente después de cerrar sesión o cambiar de dispositivo.

### Fase 8. PWA o aplicación móvil

Duración: 5-10 días según plataforma.

1. Implementar la estrategia elegida en la fase 0.
2. Probar permisos de micrófono, audio e haptics.
3. Añadir experiencia offline limitada y explícita.
4. Gestionar actualizaciones de versión y caché.
5. Probar instalación, reanudación y orientación.
6. Preparar metadatos, iconos, privacidad y capturas.

**Definition of Done**

- Checklist de plataforma completado en dispositivos reales.
- Actualizaciones sin dejar clientes con contenido incompatible.

### Fase 9. Release candidate

Duración: 3-5 días.

1. Congelar funcionalidades.
2. Ejecutar regresión completa.
3. Probar desde cuentas nuevas y existentes.
4. Validar producción con datos de prueba controlados.
5. Activar observabilidad y alertas.
6. Crear runbook de incidentes y rollback.
7. Publicar de forma gradual.

**Definition of Done**

- Cero incidencias P0/P1 abiertas.
- Métricas, alertas y rollback verificados.
- Responsable asignado para soporte de lanzamiento.

## 6. Orden recomendado de las próximas 10 tareas

1. Consolidar los cambios actuales y dejar el repositorio limpio.
2. Añadir ESLint, formatter, Vitest y un script único `npm run check`.
3. Crear CI con validaciones, tests y build.
4. Proteger/eliminar en producción las rutas de laboratorio.
5. Eliminar cualquier diseño que exponga tokens privados mediante `VITE_*`.
6. Añadir lazy loading de rutas y medir el bundle.
7. Crear tests del motor, progreso y desbloqueo de niveles.
8. Empezar la extracción incremental de `Game.vue`.
9. Completar la migración y compresión de assets.
10. Endurecer Supabase y definir el tratamiento de datos de menores antes de pagos.

## 7. Definition of Done global para la versión 1

Una funcionalidad no se considera terminada hasta que:

- Tiene estados de carga, éxito, error y reintento.
- Funciona con teclado y en los dispositivos soportados.
- Incluye tests proporcionales al riesgo.
- No introduce errores de consola.
- No aumenta el bundle o assets fuera del presupuesto.
- No expone secretos ni confía en autorización del cliente.
- Incluye analítica y errores sin datos personales innecesarios.
- Está documentada cuando cambia contratos, configuración o despliegue.
- Ha pasado revisión de código.
- Se puede desplegar y revertir de forma segura.

## 8. Conclusión

La app tiene suficiente producto construido para justificar una fase de estabilización, no una reescritura. La estrategia recomendada es conservar el motor y los flujos que ya funcionan, introducir primero calidad automatizada y después refactorizar por módulos.

El orden importa: **estabilizar, proteger, probar, modularizar, optimizar y finalmente monetizar/lanzar**. Añadir más niveles o efectos antes de completar esas bases aumentaría el coste de terminar la aplicación.
