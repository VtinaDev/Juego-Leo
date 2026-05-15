# Juego & Leo

Aplicación educativa construida con Vue 3, Pinia y Vite.

## Instalación

```bash
npm install
```

## Scripts disponibles

- `npm run dev` — levanta Vite en modo desarrollo.
- `npm run build` — genera el paquete de producción en `dist/`.
- `npm run preview` — sirve el build generado para validación manual.

## Ejecución en desarrollo

```bash
npm run dev
```

## Supabase Auth

Crea un archivo `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

Para que lleguen los correos de confirmación de nuevas cuentas, revisa en Supabase:

- Authentication > Providers > Email: confirma que el registro por email está activo.
- Authentication > Sign In / Providers: activa la confirmación de email si quieres que cada cuenta nueva tenga que confirmar el correo.
- Authentication > URL Configuration: configura el Site URL de producción y añade `http://localhost:5173/**` y la URL desplegada de la app en Redirect URLs.
- Authentication > Email: si usas el proveedor SMTP por defecto y los correos no llegan, configura un SMTP propio para mejorar la entrega.

El registro envía el enlace de confirmación de vuelta a `/profile`. En Vercel, `vercel.json` reescribe las rutas de Vue a `index.html` para que los enlaces de Supabase no abran una página 404.

## Generar build de producción

```bash
npm run build
```
