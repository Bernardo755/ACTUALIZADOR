/* MÓDULO 5 — FLUJOS DE LA APP: login, alta, actualización y reporte.
   El front solo recoge datos y los envía; validación, armado de filas,
   fechas, mayúsculas, escritura y bitácora ocurren en el servidor. */
let bloqueManual = [];
let ultimoEnvio = [];       // copia local de lo que el usuario envió (para armar su reporte)
let reporteFilas = [];

/* ---------- SESIÓN ---------- */
async function iniciarSesion() {
  const u = $('lgUser').value.trim(), p = $('lgPass').value;
  if (!u || !p) { $('lgMsg').textContent = 'Escribe usuario y contraseña.'; return; }
  $('btnLogin').disabled = true; $('lgMsg').textContent = 'Verificando...';
  Sesion.ip = await obtenerIP();
  const r = await llamar('act_login', { usuario: u, password: p });
  $('btnLogin').disabled = false; $('lgPass').value = '';
  if (r.exito) {
    Sesion.token = r.token; Sesion.usuario = u;
    $('lgMsg').textContent = ''; $('lblUsuario').textContent = 'Sesión: ' + u;
    $('loginView').style.display = 'none'; $('appView').style.display = 'block';
  } else {
    $('lgMsg').textContent = r.error || 'No se pudo iniciar sesión.';
  }
}
$('lgPass').addEventListener('keydown', e => { if (e.key === 'Enter') iniciarSesion(); });

function cerrarSesionLocal(mensaje) {
  Sesion.token = Sesion.usuario = null;
  bloqueManual = []; ultimoEnvio = []; reporteFilas = [];
  $('tbodyBloque').innerHTML = ''; $('tablaBloque').style.display = 'none'; $('btnSincronizarManual').style.display = 'none';
  ['pasteMod1', 'pasteMod2'].forEach(id => $(id).value = '');
  $('appView').style.display = 'none'; $('loginView').style.display = 'flex';
  $('lgMsg').textContent = mensaje || ''; cerrarModal();
}
async function cerrarSesion() { await llamar('act_logout'); cerrarSesionLocal('Sesión cerrada.'); }

/* ---------- ENVÍO CON CONTRASEÑA (patrón común) ----------
   Pide la contraseña, la manda junto con los datos y reintenta si es incorrecta.
   Devuelve la respuesta del servidor, o null si el usuario cancela o la sesión se cerró. */
async function enviarConPassword(action, datos, resumenHtml) {
  let aviso = '';
  while (true) {
    const pass = await pedirPassword(aviso + resumenHtml);
    if (pass === null) return null;
    abrirModal('Procesando', 'Enviando datos... no cierres esta ventana.', { carga: true });
    const r = await llamar(action, { ...datos, password: pass });
    if (r.noAutorizado) return null;                       // cerrarSesionLocal ya actuó
    if (r.errorPassword) { aviso = '<span class="err">Contraseña incorrecta.</span><br>'; continue; }
    return r;
  }
}

/* ---------- ALTA MANUAL ---------- */
function agregarAlBloque() {
  const fila = CAMPOS.map((_, i) => $('f' + i).value.trim());
  if (!fila[0] || !fila[7]) return alert('El Folio y el Nombre son obligatorios.');
  bloqueManual.push(fila);
  const nombre = [fila[7], fila[8], fila[9]].filter(Boolean).join(' ');
  $('tbodyBloque').innerHTML += `<tr><td>${esc(fila[0])}</td><td>${esc(fila[4])}</td><td>${esc(fila[6])}</td><td>${esc(nombre)}</td>
    <td><span style="background:#dff3f1;color:#00534a;padding:4px 8px;border-radius:4px;font-size:11px">${esc(fila[16])}</span></td></tr>`;
  $('tablaBloque').style.display = 'table';
  $('btnSincronizarManual').style.display = 'inline-flex';
  CAMPOS.forEach((c, i) => { if (!c[1] || c[1] === 'list') $('f' + i).value = ''; });
}

/* ---------- ALTA (manual o pegado) ---------- */
async function enviarAlta(origen) {
  const filas = origen === 'manual' ? bloqueManual : parsearPegado($('pasteMod1').value);
  if (!filas.length) return alert(origen === 'manual' ? 'No hay datos para sincronizar.' : 'Pega los datos copiados de Excel antes de continuar.');

  const r = await enviarConPassword('act_registrar_bloque', { filas },
    `Se enviarán <strong>${filas.length} registros</strong> nuevos.<br>Escribe tu contraseña para autorizar la carga.`);
  if (!r) return cerrarModal();

  if (r.exito) {
    abrirModal('Carga completada', `<strong class="ok">${esc(r.mensaje)}</strong>` + (r.omitidas ? `<br>Omitidas sin folio: ${r.omitidas}` : ''), { cerrar: true });
    if (origen === 'manual') {
      bloqueManual = []; $('tbodyBloque').innerHTML = '';
      $('tablaBloque').style.display = 'none'; $('btnSincronizarManual').style.display = 'none';
    } else { $('pasteMod1').value = ''; contarFilas('pasteMod1', 'conteoMod1', 'zonaMod1'); }
  } else {
    abrirModal('Error', `<span class="err">${esc(r.error)}</span>`, { cerrar: true });
  }
}

/* ---------- ACTUALIZACIÓN MASIVA ---------- */
async function enviarActualizacion() {
  const filas = parsearPegado($('pasteMod2').value);
  if (!filas.length) return alert('Pega los datos copiados de Excel antes de continuar.');
  const cambios = filas.map(f => [f[0] || '', f[1] || '', f[2] || '']);

  const r = await enviarConPassword('act_actualizar_masivo', { cambios },
    `Se actualizarán hasta <strong>${cambios.length} folios</strong> en la base.<br>Escribe tu contraseña para autorizar.`);
  if (!r) return cerrarModal();

  if (r.exito) {
    const noEnc = new Set(r.noEncontrados);
    ultimoEnvio = cambios;
    reporteFilas = cambios.map(c => {
      const f = c[0].trim().toUpperCase();
      return [f, c[1].toUpperCase(), c[2].toUpperCase(), noEnc.has(f) ? 'NO ENCONTRADO ✖' : 'ACTUALIZADO ✓'];
    });
    const resumen = `<span class="ok">✔ ${r.exitosos} Actualizados</span> | <span class="err">✖ ${r.noEncontrados.length} No Encontrados</span>`;
    abrirModal('Actualización finalizada', resumen, { cerrar: true });
    $('resMod2').innerHTML = 'Resumen: ' + resumen;
    $('btnReporte').style.display = 'inline-flex';
    $('pasteMod2').value = ''; contarFilas('pasteMod2', 'conteoMod2', 'zonaMod2');
  } else {
    abrirModal('Error', `<span class="err">${esc(r.error)}</span>`, { cerrar: true });
  }
}

/* Reporte armado solo con lo que el propio usuario envió + el resultado por folio. */
function descargarReporte() {
  if (!reporteFilas.length) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["FOLIO BUSCADO", "ESTATUS ENVIADO", "OBS ENVIADO", "RESULTADO SISTEMA"], ...reporteFilas]), "Reporte");
  XLSX.writeFile(wb, "Reporte_Actualizacion.xlsx");
}

/* ---------- INICIO ---------- */
dibujarFormulario();
pintarGuia('guideMod1', ENC_ALTA);
pintarGuia('guideMod2', ENC_UPD);
