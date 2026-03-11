# AI Integration Zone (Aislada)

Esta zona está reservada para futuras integraciones de IA, separada de la lógica actual del juego.

## Estructura

- `clients/`
  - Clientes/adaptadores para proveedores de IA (HTTP SDK wrappers, configuración de transporte, manejo de errores de red).

- `prompts/`
  - Plantillas y constructores de prompts por caso de uso (sin acoplarlos a vistas ni engine).

- `schemas/`
  - Esquemas de validación de entrada/salida para respuestas de IA.

- `types/`
  - Tipos y contratos compartidos de la capa IA (DTOs, interfaces, modelos de dominio IA).

- `utils/`
  - Utilidades puras de soporte (normalización de texto, helpers de parsing, mapeos comunes).

## Nota

No hay conexión activa a APIs en esta etapa. Esta estructura está preparada para crecer sin impactar el flujo actual de la app.
