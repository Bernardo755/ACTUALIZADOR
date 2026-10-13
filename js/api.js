/* COMUNICACIÓN CON EL BACKEND (misma forma de siempre: POST text/plain con JSON).
   Cada petición lleva usuario + token; las operaciones que escriben, además la
   contraseña. El servidor valida todo; esto no es una barrera de seguridad. */

async function llamarBackend(accion, payload = null, password = null) {
  try {
    const cuerpo = { accion: accion, payload: payload, usuario: sesion.usuario, token: sesion.token };
    if (password) cuerpo.password = password;

    const response = await fetch(window.ACT_CONFIG.URL_BACKEND_GAS, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(cuerpo)
    });
    const r = await response.json();
    // "Acción no válida" aquí significa que quien respondió NO es el backend del Actualizador
    // (URL equivocada en config.js) o que el publicado es una versión anterior.
    if (r && r.error === 'Acción no válida.' && !r.noAutorizado) {
      r.error = 'Configuración incorrecta: URL_BACKEND_GAS (config.js) no apunta al backend del Actualizador, o el backend publicado es una versión anterior.';
    }
    if (r && r.noAutorizado) bloquearApp(r.error || 'Tu sesión ya no es válida.');
    return r;
  } catch (error) {
    return { exito: false, error: 'Fallo la conexión con el servidor: ' + error.message };
  }
}
