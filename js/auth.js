/* =========================================================
   AUTENTICACIÓN (frontend)
   Controla qué pantalla se ve, pero la seguridad real la aplica el servidor:
   sin token válido y sin contraseña correcta el backend rechaza cada acción.
   ========================================================= */
const Auth = (function () {
  const $ = id => document.getElementById(id);
  const LIMITE_MS = (window.APP_CONFIG.INACTIVIDAD_MIN || 15) * 60 * 1000;
  const EVENTOS_ACTIVIDAD = ['mousemove', 'keydown', 'click', 'touchstart'];
  let timer = null;

  function reiniciarTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => cerrarSesion('Tu sesión expiró por inactividad.'), LIMITE_MS);
  }

  function iniciarTimer() {
    EVENTOS_ACTIVIDAD.forEach(e => document.addEventListener(e, reiniciarTimer, { passive: true }));
    reiniciarTimer();
  }

  function detenerTimer() {
    clearTimeout(timer);
    EVENTOS_ACTIVIDAD.forEach(e => document.removeEventListener(e, reiniciarTimer));
  }

  async function iniciarSesion() {
    const user = $('loginUsuario').value.trim();
    const pass = $('loginPassword').value;
    const msg = $('loginMensaje');
    const btn = $('btnLogin');

    if (!user || !pass) { msg.innerText = 'Escribe usuario y contraseña.'; return; }

    msg.innerText = 'Validando...';
    btn.disabled = true;
    const res = await Api.login(user, pass);
    btn.disabled = false;
    $('loginPassword').value = '';

    if (res && res.exito) {
      msg.innerText = '';
      $('loginUsuario').value = '';
      $('etiquetaSesion').innerText = `Sesión: ${res.usuario} (${res.rol})`;
      $('vista-login').style.display = 'none';
      $('vista-app').style.display = 'block';
      iniciarTimer();
    } else {
      msg.innerText = (res && res.error) || 'No se pudo iniciar sesión.';
    }
  }

  function cerrarSesion(aviso) {
    detenerTimer();
    Api.limpiarSesion();
    UI.cerrarModal();
    document.dispatchEvent(new Event('app:logout')); // los módulos borran sus datos pendientes
    $('vista-app').style.display = 'none';
    $('vista-login').style.display = 'block';
    $('loginMensaje').innerText = aviso || '';
  }

  // Inicialización
  $('formLogin').addEventListener('submit', e => { e.preventDefault(); iniciarSesion(); });
  $('btnSalir').addEventListener('click', () => cerrarSesion(''));
  document.addEventListener('app:sesion-invalida', e => cerrarSesion(e.detail || 'Tu sesión ya no es válida. Inicia sesión nuevamente.'));
  UI.iniciarPestanas();

  return { cerrarSesion };
})();
