/* =========================================================
   CONFIGURACIÓN PÚBLICA
   GitHub Pages es estático: todo lo de este archivo lo puede ver cualquiera
   que abra la app. Aquí NUNCA van contraseñas, tokens ni claves.
   La URL del backend no es un secreto: la protección real es el login y la
   verificación de contraseña que hace el servidor en cada envío.
   ========================================================= */
window.APP_CONFIG = {
  URL_BACKEND: 'https://script.google.com/macros/s/AKfycbwTnYAOGxhGnk2Fe4g-UX8PLZeSKZXnI3vGVkzFQzbKVepn5gpSV1uO_NihzJH_eLFzIQ/exec',
  INACTIVIDAD_MIN: 15,   // cierra la sesión tras N minutos sin actividad
  MAX_FILAS: 1000        // debe coincidir con MAX_FILAS_ALTA / MAX_FILAS_ACTUALIZACION del backend
};
