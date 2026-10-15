/* =========================================================
   MÓDULO: ALTA DE TARJETAS NUEVAS
   Dos entradas (formulario manual y pegado desde Excel) con el mismo flujo de envío:
   consulta de fila libre -> confirmación con contraseña -> registro en el servidor.
   ========================================================= */
const ModAlta = (function () {
  const $ = id => document.getElementById(id);
  const ENCABEZADOS = ["FOLIO", "ID SARE", "NOMBRE SARE", "MUNICIPIO", "CCT", "ESCUELA", "ID FAMILIA", "NOMBRE(S)", "APELLIDO 1", "APELLIDO 2", "REMESA", "PROGRAMA", "BLOQUE", "OBSERVACIONES", "MES REMESA", "CURP", "ESTATUS"];
  const MAX = window.APP_CONFIG.MAX_FILAS || 1000;
  const CAMPOS_MANUAL = ['m1_folio', 'm1_idSare', 'm1_nombreSare', 'm1_municipio', 'm1_cct', 'm1_escuela', 'm1_idFamilia',
                         'm1_nombre', 'm1_ap1', 'm1_ap2', 'm1_remesa', 'm1_bloque', 'm1_obs', 'm1_mes', 'm1_curp'];

  let bloqueManual = [];
  const pegado = UI.vincularPegado('pasteMod1', 'conteoMod1', 'pasteZoneMod1', ENCABEZADOS);
  UI.pintarGuia('guideMod1', ENCABEZADOS);

  const up = v => String(v === undefined || v === null ? '' : v).trim().toUpperCase();

  // Fila de 20 columnas (A..T) con el mismo diseño que usa la hoja BASE.
  function armarFila(d) {
    const fecha = new Date().toLocaleDateString('es-MX');
    const nombre = up(d.nombre), ap1 = up(d.ap1), ap2 = up(d.ap2), obs = up(d.obs);
    const f = new Array(20).fill('');
    f[0] = up(d.folio);       f[1] = up(d.idSare);   f[2] = up(d.nombreSare); f[3] = up(d.municipio);
    f[5] = up(d.cct);         f[6] = up(d.escuela);  f[7] = up(d.idFamilia);
    f[8] = nombre;            f[9] = ap1;            f[10] = ap2;
    f[11] = up(d.remesa);     f[12] = up(d.programa); f[13] = up(d.bloque);
    f[15] = obs ? `${obs} - ${fecha}` : fecha;
    f[16] = up(d.mes);        f[17] = up(d.curp);    f[18] = up(d.estatus);
    f[19] = `${nombre} ${ap1} ${ap2}`.trim();
    return f;
  }

  /* ---------- Formulario manual ---------- */
  function pintarTabla() {
    const tabla = $('tablaBloque');
    $('tbodyBloque').innerHTML = bloqueManual.map(f => `<tr>
      <td>${UI.escapar(f[0])}</td><td>${UI.escapar(f[5])}</td><td>${UI.escapar(f[7])}</td>
      <td>${UI.escapar(f[19])}</td>
      <td><span class="etiqueta-estatus">${UI.escapar(f[18])}</span></td>
    </tr>`).join('');
    tabla.style.display = bloqueManual.length ? 'table' : 'none';
    $('btnSincronizarManual').style.display = bloqueManual.length ? 'inline-flex' : 'none';
  }

  function limpiarFormulario() {
    CAMPOS_MANUAL.forEach(id => { $(id).value = ''; });
  }

  function agregarManual() {
    const v = id => $(id).value;
    const d = {
      folio: v('m1_folio'), idSare: v('m1_idSare'), nombreSare: v('m1_nombreSare'), municipio: v('m1_municipio'),
      cct: v('m1_cct'), escuela: v('m1_escuela'), idFamilia: v('m1_idFamilia'), nombre: v('m1_nombre'),
      ap1: v('m1_ap1'), ap2: v('m1_ap2'), remesa: v('m1_remesa'), programa: v('m1_programa'),
      bloque: v('m1_bloque'), obs: v('m1_obs'), mes: v('m1_mes'), curp: v('m1_curp'), estatus: v('m1_estatus')
    };

    if (!up(d.folio) || !up(d.nombre)) return alert('El Folio y el Nombre son obligatorios.');
    if (bloqueManual.some(f => f[0] === up(d.folio))) return alert('Ese folio ya está en la lista.');
    if (bloqueManual.length >= MAX) return alert(`La lista admite máximo ${MAX} registros por envío.`);

    bloqueManual.push(armarFila(d));
    pintarTabla();
    limpiarFormulario();
  }

  /* ---------- Pegado desde Excel ---------- */
  function procesarPegado() {
    const filas = pegado.filas();
    if (!filas.length) return alert('Pega los datos copiados de Excel antes de continuar.');

    const bloque = filas.map(r => armarFila({
      folio: r[0], idSare: r[1], nombreSare: r[2], municipio: r[3], cct: r[4], escuela: r[5], idFamilia: r[6],
      nombre: r[7], ap1: r[8], ap2: r[9], remesa: r[10], programa: r[11], bloque: r[12],
      obs: r[13], mes: r[14], curp: r[15], estatus: r[16]
    }));
    sincronizar(bloque, () => pegado.limpiar());
  }

  /* ---------- Envío (común) ---------- */
  // Lista de folios repetidos para el modal (todo escapado; se muestran hasta 200, el resto queda en la Bitácora).
  function listaFolios(titulo, folios) {
    if (!Array.isArray(folios) || !folios.length) return '';
    const mostrados = folios.slice(0, 200);
    const resto = folios.length - mostrados.length;
    return `<div class="lista-folios"><strong>${UI.escapar(titulo)} (${folios.length}):</strong>
      <div class="caja-folios">${UI.escapar(mostrados.join(', '))}${resto > 0 ? ` … y ${resto} más (ver Bitácora)` : ''}</div></div>`;
  }
  async function sincronizar(filas, alExito) {
    if (!filas.length) return alert('No hay datos para sincronizar.');
    if (filas.length > MAX) return alert(`Máximo ${MAX} registros por envío. Divide los datos en partes.`);

    UI.cargando('Verificando', 'Consultando disponibilidad en la base de datos...');
    const pre = await Api.llamar('obtenerSiguienteFila');
    if (pre.noAutorizado) return;
    if (!pre.exito) return UI.informar('No se pudo continuar', UI.escapar(pre.error || 'Error al consultar la base.'));

    const msg = `Se guardarán <strong>${filas.length} registros</strong> a partir de la <strong>fila ${Number(pre.fila)}</strong>.<br>Para continuar, confirma tu contraseña.`;
    const res = await Api.enviarConfirmado('registrarBloqueTarjetas', filas, 'Confirmar carga de tarjetas', msg);
    if (res.cancelado || res.noAutorizado) return;

    const rep = res.repetidos || {};
    const listas = listaFolios('Ya existen en la base', rep.enBase) + listaFolios('Repetidos dentro de tu lista', rep.enLote);

    if (res.exito) {
      alExito();
      if (listas) UI.informar('Carga completada con folios repetidos', UI.escapar(res.mensaje) + listas); // queda abierto para poder leerlos
      else UI.informar('Carga completada', UI.escapar(res.mensaje), 3000);
    } else {
      UI.informar('No se guardó', UI.escapar(res.error || 'Error desconocido.') + listas); // los datos siguen en pantalla
    }
  }

  /* ---------- Inicialización ---------- */
  // Mayúsculas en los campos de texto del formulario (no en usuario/contraseña).
  $('formularioNuevos').addEventListener('input', e => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') e.target.value = e.target.value.toUpperCase();
  });
  $('btnAgregarManual').addEventListener('click', agregarManual);
  $('btnSincronizarManual').addEventListener('click', () => sincronizar(bloqueManual, () => { bloqueManual = []; pintarTabla(); }));
  $('btnProcesarNuevos').addEventListener('click', procesarPegado);

  // Al cerrar sesión se descartan los datos pendientes.
  document.addEventListener('app:logout', () => {
    bloqueManual = [];
    pintarTabla();
    limpiarFormulario();
    pegado.limpiar();
  });

  return {};
})();
