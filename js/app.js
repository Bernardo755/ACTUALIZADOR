/* ARRANQUE DE LA APP ACTUALIZADOR (se carga al final) */

// Fuerza mayúsculas solo en el formulario de captura (no en login ni contraseñas)
document.addEventListener('input', function (e) {
  if (e.target.tagName === 'INPUT' && e.target.type === 'text' && e.target.closest('#formularioNuevos')) {
    e.target.value = e.target.value.toUpperCase();
  }
});

iniciarAutenticacion();
