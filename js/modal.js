/* MODAL GLOBAL DE CONFIRMACIÓN (con contraseña obligatoria antes de escribir)
   modos: 'cargando' | 'confirmar' (con contraseña) | 'cerrar' | 'mensaje'

   Las operaciones que escriben en la base se registran con
   registrarOperacionConfirmable(tipo, async (password) => {...}); el botón
   "Aceptar y Enviar" exige la contraseña y ejecuta la operación activa. */

let tipoSincronizacionActiva = null;
let mensajeConfirmacionActual = '';
const operacionesConfirmables = {};

function registrarOperacionConfirmable(tipo, ejecutar) {
  operacionesConfirmables[tipo] = ejecutar;
}

function abrirModal(mensaje, modo = 'cargando', conPassword = false, titulo = 'Confirmar Acción') {
  document.getElementById('confirmModal').style.display = 'flex';
  document.getElementById('modalTitle').innerText = titulo;
  document.getElementById('modalMessage').innerHTML = mensaje;

  document.getElementById('modalLoader').style.display = modo === 'cargando' ? 'block' : 'none';
  document.getElementById('modalButtonsConfirm').style.display = modo === 'confirmar' ? 'flex' : 'none';
  document.getElementById('modalButtonsClose').style.display = modo === 'cerrar' ? 'flex' : 'none';

  const mostrarPass = (modo === 'confirmar' && conPassword);
  document.getElementById('modalPasswordBox').style.display = mostrarPass ? 'block' : 'none';
  if (mostrarPass) {
    document.getElementById('modalPassword').value = '';
    document.getElementById('modalPasswordError').innerText = '';
    setTimeout(() => document.getElementById('modalPassword').focus(), 50);
  }
}

function cerrarModal() {
  document.getElementById('confirmModal').style.display = 'none';
  document.getElementById('modalPassword').value = '';
  tipoSincronizacionActiva = null;
}

// Reabre la confirmación mostrando el error de contraseña (sin perder los datos pendientes)
function reintentarConPasswordIncorrecta(mensajeError) {
  abrirModal(mensajeConfirmacionActual, 'confirmar', true);
  document.getElementById('modalPasswordError').innerText = mensajeError || 'Contraseña incorrecta.';
}

// Botón "Aceptar y Enviar": exige contraseña y ejecuta la operación activa.
async function ejecutarSincronizacion() {
  const password = document.getElementById('modalPassword').value;
  if (!password) {
    document.getElementById('modalPasswordError').innerText = 'Escribe tu contraseña para continuar.';
    return;
  }
  const operacion = operacionesConfirmables[tipoSincronizacionActiva];
  if (!operacion) return;
  await operacion(password);
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target && e.target.id === 'modalPassword') ejecutarSincronizacion();
});
