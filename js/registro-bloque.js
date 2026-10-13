/* REGISTRO DE TARJETAS NUEVAS EN BLOQUE (lógica compartida por el formulario manual
   y el pegado desde Excel). Cada módulo registra su "fuente":
     registrarFuenteBloque('tipo', { obtener: () => matriz, alExito: () => limpiar() }) */

const fuentesBloque = {};

function registrarFuenteBloque(tipo, fuente) {
  fuentesBloque[tipo] = fuente;
  registrarOperacionConfirmable(tipo, password => ejecutarRegistroBloque(tipo, password));
}

// Consulta la fila libre y pide confirmación (con contraseña)
async function iniciarSincronizacion(tipo) {
  const fuente = fuentesBloque[tipo];
  if (!fuente) return;

  tipoSincronizacionActiva = tipo;
  const total = fuente.obtener().length;

  if (total === 0) return alert("No hay datos para sincronizar.");

  abrirModal('Consultando disponibilidad en la base de datos...', 'cargando');

  const res = await llamarBackend('obtenerSiguienteFila');
  if (!appActiva) return; // la sesión se cerró durante la consulta

  if (res.exito) {
    mensajeConfirmacionActual =
      `Se encontró espacio libre.<br>Se guardarán <strong>${total} registros</strong> a partir de la <strong>Fila ${esc(res.fila)}</strong>.<br><br>¿Deseas proceder?`;
    abrirModal(mensajeConfirmacionActual, 'confirmar', true);
  } else {
    abrirModal(`<span style="color:red">Error: ${esc(res.error)}</span>`, 'cerrar');
  }
}

async function ejecutarRegistroBloque(tipo, password) {
  const fuente = fuentesBloque[tipo];
  abrirModal('Sincronizando datos... Por favor espera.', 'cargando', false, 'Sincronizando');

  const res = await llamarBackend('registrarBloqueTarjetas', fuente.obtener(), password);
  if (!appActiva) return;

  if (res.errorPassword) {
    tipoSincronizacionActiva = tipo;
    return reintentarConPasswordIncorrecta(res.error);
  }

  if (res.exito) {
    abrirModal(`<strong>¡Éxito!</strong><br>${esc(res.mensaje)}`, 'mensaje');
    fuente.alExito();
    setTimeout(cerrarModal, 2500);
  } else {
    abrirModal(`<span style="color:red">Error al guardar: ${esc(res.error)}</span>`, 'cerrar');
  }
}
