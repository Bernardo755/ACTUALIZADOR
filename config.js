/* =========================================================
   CONFIGURACIÓN PÚBLICA DE LA APP ACTUALIZADOR
   Todo lo que usa el navegador es visible para quien abra las herramientas
   de desarrollo. La protección real es el login + token + rol + contraseña
   que valida el backend; estas URLs no son secretos.
   ========================================================= */
window.ACT_CONFIG = {
  // Backend de ESTA app (registrar tarjetas / actualizar estatus).
  URL_BACKEND_GAS: 'https://script.google.com/macros/s/AKfycbwQ8uuKkmB0yG8ibhaZ_9Z2V3EtIMzVRAiJ3iiQ9EOX-V9gx_pwRWaUt094ZVqPBJZa/exec',

  // API del sistema principal: solo se usa para iniciar sesión si la app se abre sin el sistema.
  URL_SISTEMA_API: 'https://script.google.com/macros/s/AKfycbxstQtPQg9lbYE-RrEpFSslvCzxiZaManHdEzHdfxAW6IC2kYIfgnLUwwViUvzk2ynWTg/exec',

  // Origen(es) desde donde el sistema principal puede entregar la sesión (postMessage).
  ORIGENES_SISTEMA: ['https://bernardo755.github.io'],

  // Roles que pueden usar esta app (el backend vuelve a validarlo en cada operación).
  ROLES_PERMITIDOS_APP: ['ADMIN', 'ADMINISTRADOR', 'RESP', 'RESPONSABLE']
};
