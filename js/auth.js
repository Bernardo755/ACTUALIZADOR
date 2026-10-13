/* ACCESO: solo usuarios válidos con rol ADMIN o RESP.
   La sesión se recibe del sistema principal (postMessage) o, si la app se abre
   sola, mediante el login del sistema principal. Vive solo en memoria. */

let sesion = { usuario: '', token: '' };
let appActiva = false;

function mostrarAuth(estado, mensaje) {
  document.getElementById('authOverlay').style.display = 'flex';
  document.getElementById('authVerificando').style.display = estado === 'verificando' ? 'block' : 'none';
  document.getElementById('authLogin').style.display = estado === 'login' ? 'block' : 'none';
  document.getElementById('authBloqueado').style.display = estado === 'bloqueado' ? 'block' : 'none';
  if (estado === 'bloqueado') document.getElementById('authBloqueadoMsg').innerText = mensaje || '';
  if (estado === 'login') document.getElementById('authMsg').innerText = mensaje || '';
}

function mostrarApp() {
  appActiva = true;
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
}

function bloquearApp(mensaje) {
  appActiva = false;
  sesion = { usuario: '', token: '' };
  document.getElementById('appContainer').style.display = 'none';
  cerrarModal();
  mostrarAuth('bloqueado', mensaje || 'Tu sesión ya no es válida.');
}

function iniciarAutenticacion() {
  sesion = { usuario: '', token: '' };
  appActiva = false;
  mostrarAuth('verificando');

  if (window.parent !== window) {
    // Abierta dentro del sistema principal: se le pide la sesión por postMessage.
    window.removeEventListener('message', recibirSesion);
    window.addEventListener('message', recibirSesion);
    window.parent.postMessage({ tipo: 'solicitar_sesion' }, '*'); // la petición no contiene secretos
    setTimeout(() => { if (!appActiva && !sesion.token) mostrarAuth('login'); }, 2000);
  } else {
    mostrarAuth('login');
  }
}

function recibirSesion(ev) {
  if (ev.source !== window.parent) return;
  if (window.ACT_CONFIG.ORIGENES_SISTEMA.indexOf(ev.origin) === -1) return;
  const d = ev.data;
  if (!d || d.tipo !== 'sesion' || !d.usuario || !d.token) return;
  activarSesion(d.usuario, d.token);
}

async function iniciarSesionLocal() {
  const u = document.getElementById('authUsuario').value.trim();
  const p = document.getElementById('authPassword').value.trim();
  const btn = document.getElementById('btnAuthEntrar');
  const msg = document.getElementById('authMsg');
  if (!u || !p) { msg.innerText = 'Llena ambos campos.'; return; }

  btn.disabled = true; msg.innerText = 'Validando...';
  try {
    const resp = await fetch(window.ACT_CONFIG.URL_SISTEMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'login', usuario: u, password: p, ip: 'N/A', ubicacion: 'App Actualizador' })
    });
    const r = await resp.json();
    if (!r.exito) { msg.innerText = r.error || 'Credenciales incorrectas.'; return; }

    const rol = String(r.rol || '').trim().toUpperCase();
    if (window.ACT_CONFIG.ROLES_PERMITIDOS_APP.indexOf(rol) === -1) {
      msg.innerText = 'Tu usuario no tiene permiso para esta aplicación.';
      return;
    }
    document.getElementById('authPassword').value = '';
    await activarSesion(u, r.token);
  } catch (e) {
    msg.innerText = 'Error de conexión con el servidor.';
  } finally {
    btn.disabled = false;
  }
}

// Comprueba con el servidor (sesión + rol) antes de mostrar la app.
async function activarSesion(usuario, token) {
  sesion = { usuario: usuario, token: token };
  mostrarAuth('verificando');
  const r = await llamarBackend('obtenerSiguienteFila');
  if (r && r.exito) {
    mostrarApp();
  } else if (!(r && r.noAutorizado)) {
    bloquearApp((r && r.error) || 'No se pudo verificar el acceso.');
  }
  // Si fue noAutorizado, llamarBackend ya llamó a bloquearApp().
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target && e.target.id === 'authPassword') iniciarSesionLocal();
});
