# App Actualizador — Registro de tarjetas y actualización de estatus

Aplicación estática (GitHub Pages) con backend en Google Apps Script. Solo **escribe** en la hoja `BASE`: ninguna acción devuelve contenido de la base.
Lo único que informa es cuáles de los folios que la persona acaba de enviar ya existen (folios repetidos), y solo tras verificar su contraseña.

## Estructura

```
index.html              estructura y orden de carga
config.js               configuración PÚBLICA (URL del backend, inactividad, tope de filas)
css/styles.css          estilos
js/ui.js                escape de HTML, pestañas, modal con contraseña, utilidades de pegado
js/api.js               única capa que habla con el backend (token en memoria)
js/auth.js              login, cierre de sesión, inactividad
js/mod-alta.js          alta de tarjetas (formulario manual + pegado desde Excel)
js/mod-actualizacion.js actualización masiva de estatus
backend/Code.gs         backend completo en UN solo archivo (router, bitácora, autenticación, operaciones)
```

## Seguridad

- **Acceso:** solo usuarios de la hoja `Usuarios` con rol `ADMIN` o `RESP` y cuenta distinta de `Bloqueado`.
- **Sesión:** el login devuelve un token guardado en la caché de este proyecto. Vence a los **15 min sin actividad** (lo aplica el servidor, no solo el navegador) o a las **2 h** desde el login. El front lo guarda solo en memoria.
- **Cada petición** valida token, usuario, estado de la cuenta y rol vigente en la hoja.
- **Cada alta y cada actualización** exigen la contraseña, verificada en el servidor. Tras 5 fallos se cierra la sesión.
- **Login:** 5 intentos fallidos por usuario bloquean 10 minutos.
- **Folios repetidos:** en cada alta el servidor revisa si el folio ya existe en la columna A de `BASE` o se repite dentro del lote, y los reporta en pantalla y en la Bitácora. Con `POLITICA_REPETIDOS = "OMITIR"` (por defecto) inserta solo los nuevos; con `"RECHAZAR"` no inserta nada si hay algún repetido; con `"PERMITIR"` no revisa nada e inserta todo (comportamiento original, puede duplicar folios).
- **Validación en servidor:** formato, tope de filas, longitud de celdas y neutralización de fórmulas (`= + - @`).
- **Bitácora** (hoja `Bitacora`, columna Ubicación = `APP ACTUALIZADOR`): login, altas y actualizaciones con los folios separados por coma, contraseñas fallidas y rechazos (con tope anti-inundación).

## Despliegue

1. En el proyecto de Apps Script de esta app, reemplaza el contenido con `backend/Code.gs` (un solo archivo; borra cualquier otro archivo `.gs` del proyecto para evitar funciones duplicadas).
2. **Implementar → Administrar implementaciones →** editar la implementación existente → **Versión nueva**. Así la URL no cambia. (Si creas una implementación nueva, la URL cambia y debes actualizar `config.js`; archiva las anteriores.)
3. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier persona** (la protección es el login de la app).
4. Sube `index.html`, `config.js`, `css/` y `js/` a GitHub Pages.

## Mantenimiento

- Topes, roles y política de repetidos: constantes al inicio de `Code.gs` (`ROLES_PERMITIDOS`, `MAX_FILAS_*`, `POLITICA_REPETIDOS`). Si cambias `MAX_FILAS_*`, cambia también `MAX_FILAS` en `config.js`.
- El formato de hash de la sección AUTENTICACIÓN de `Code.gs` debe seguir idéntico al del backend de consulta (`h1$iteraciones$sal$hash`).
- Para agregar una acción: añádela a `ACCIONES` en `Code.gs` (indicando si exige contraseña), crea su función en la sección OPERACIONES de `Code.gs` y llámala desde un módulo en `js/` con `Api.llamar` o `Api.enviarConfirmado`.
