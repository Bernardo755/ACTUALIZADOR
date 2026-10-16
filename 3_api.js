/* MÓDULO 3 — COMUNICACIÓN CON EL BACKEND Y SESIÓN (solo en memoria) */
const URL_BACKEND_GAS = 'https://script.google.com/macros/s/AKfycbyE63llfkQ-aH_PJiQQQkfWVt73qU4_6p86vL7Uj_RRnvuXcjlxsqpnp1TZtIpKpJ0IrQ/exec';

// El token vive solo en memoria: al recargar la página hay que iniciar sesión otra vez.
const Sesion = { token: null, usuario: null, ip: 'N/A' };

async function obtenerIP() {
  try {
    const c = new AbortController();
    setTimeout(() => c.abort(), 2500);
    const r = await fetch('https://api.ipify.org?format=json', { signal: c.signal });
    return (await r.json()).ip || 'N/A';
  } catch (e) { return 'N/A'; }
}

// Toda petición lleva usuario + token; el servidor valida sesión, rol y (en cargas) contraseña.
async function llamar(action, datos = {}) {
  try {
    const r = await fetch(URL_BACKEND_GAS, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, usuario: Sesion.usuario, token: Sesion.token,
                             ip: Sesion.ip, ubicacion: 'App Actualizador', ...datos })
    });
    const j = await r.json();
    if (j && j.noAutorizado) cerrarSesionLocal(j.error);   // sesión vencida o cerrada por el servidor
    return j;
  } catch (e) {
    return { exito: false, error: 'Falló la conexión con el servidor: ' + e.message };
  }
}
