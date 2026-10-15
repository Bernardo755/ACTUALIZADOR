/* =========================================================
   API: única capa que habla con el backend.
   Formato: POST text/plain con JSON { accion, payload, usuario, token, password? }.
   El token vive solo en memoria (no se usa localStorage/sessionStorage).
   ========================================================= */
const Api = (function () {
  let token = '';
  let usuario = '';

  async function post(cuerpo) {
    try {
      const r = await fetch(window.APP_CONFIG.URL_BACKEND, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(cuerpo)
      });
      return await r.json();
    } catch (e) {
      return { exito: false, error: 'Falló la conexión con el servidor.' };
    }
  }

  async function login(user, pass) {
    const res = await post({ accion: 'login', usuario: user, password: pass });
    if (res && res.exito && res.token) {
      token = res.token;
      usuario = res.usuario || user;
    }
    return res;
  }

  // Petición con sesión. Si el servidor responde noAutorizado, avisa para volver al login.
  async function llamar(accion, payload, password) {
    const cuerpo = { accion: accion, payload: payload === undefined ? null : payload, usuario: usuario, token: token };
    if (password) cuerpo.password = password;
    const res = await post(cuerpo);
    if (res && res.noAutorizado && token) {
      document.dispatchEvent(new CustomEvent('app:sesion-invalida', { detail: res.error }));
    }
    return res;
  }

  // Pide la contraseña y envía. Si el servidor dice que es incorrecta, vuelve a pedirla.
  // Devuelve { cancelado:true } si la persona cancela.
  async function enviarConfirmado(accion, payload, titulo, mensajeHtml) {
    let error = '';
    while (true) {
      const pass = await UI.pedirPassword(titulo, mensajeHtml, error);
      if (pass === null) return { cancelado: true };
      UI.cargando('Enviando', 'Procesando. No cierres esta ventana.');
      const res = await llamar(accion, payload, pass);
      if (res && res.errorPassword) { error = res.error; continue; }
      return res;
    }
  }

  function limpiarSesion() { token = ''; usuario = ''; }

  return { login, llamar, enviarConfirmado, limpiarSesion };
})();
