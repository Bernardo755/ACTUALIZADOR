/* =========================================================
   CONFIGURACIÓN PÚBLICA DE LA APP ACTUALIZADOR
   Todo lo que usa el navegador es visible para quien abra las herramientas
   de desarrollo. La protección real es el login + token + rol + contraseña
   que valida el backend; estas URLs no son secretos.
   ========================================================= */
window.ACT_CONFIG = {
  // Backend de ESTA app (registrar tarjetas / actualizar estatus).
  URL_BACKEND_GAS: 'https://script.google.com/macros/s/AKfycbyOiI4bDqFyz7iCtPjguyQpPyQuBBuuZtR03T0GLrFi9nNWqJZYf3ZgxX-bEoTn_wMtfA/exec',

  // API del sistema principal: solo se usa para iniciar sesión si la app se abre sin el sistema.
  URL_SISTEMA_API: 'https://script.google.com/macros/s/AKfycbwiWNdsNQ3XUOM96JO-L2c8RuI1SreWVXHETYnlGffcdjGycJxXLCPf652jIAzDT3Ar5A/exec',

  // Origen(es) desde donde el sistema principal puede entregar la sesión (postMessage).
  ORIGENES_SISTEMA: ['https://bernardo755.github.io'],

  // Roles que pueden usar esta app (el backend vuelve a validarlo en cada operación).
  ROLES_PERMITIDOS_APP: ['ADMIN', 'ADMINISTRADOR', 'RESP', 'RESPONSABLE']
};
