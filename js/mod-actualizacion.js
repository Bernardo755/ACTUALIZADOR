/* =========================================================
   MÓDULO: ACTUALIZACIÓN MASIVA DE ESTATUS
   Pega FOLIO / ESTATUS / OBSERVACIONES, confirma con contraseña y el servidor actualiza.
   El reporte descargable se arma aquí con lo que la persona pegó y el resultado
   de la operación; no es una descarga de datos de la base.
   ========================================================= */
const ModActualizacion = (function () {
  const $ = id => document.getElementById(id);
  const ENCABEZADOS = ["FOLIO", "ESTATUS", "OBSERVACIONES"];
  const MAX = window.APP_CONFIG.MAX_FILAS || 1000;

  let reporte = [];
  const pegado = UI.vincularPegado('pasteMod2', 'conteoMod2', 'pasteZoneMod2', ENCABEZADOS);
  UI.pintarGuia('guideMod2', ENCABEZADOS);

  const up = v => String(v === undefined || v === null ? '' : v).trim().toUpperCase();

  function limpiarResultado() {
    reporte = [];
    $('resMod2').innerHTML = '';
    $('btnDescargarReporte').style.display = 'none';
  }

  async function actualizar() {
    const filas = pegado.filas();
    if (!filas.length) return alert('Pega los datos copiados de Excel antes de continuar.');
    if (filas.length > MAX) return alert(`Máximo ${MAX} folios por envío. Divide los datos en partes.`);

    const cambios = filas.map(r => ({ folio: up(r[0]), estatus: up(r[1]), obs: up(r[2]) }));
    limpiarResultado();

    const msg = `Se actualizarán <strong>${cambios.length} folio(s)</strong> en la base de datos.<br>Para continuar, confirma tu contraseña.`;
    const res = await Api.enviarConfirmado('procesarActualizacionMasiva', cambios, 'Confirmar actualización', msg);
    if (res.cancelado || res.noAutorizado) return;

    if (!res.exito) {
      UI.informar('No se actualizó', UI.escapar(res.error || 'Error desconocido.'));
      return;
    }

    const e = res.estadisticas;
    let html = `<strong>Actualización finalizada</strong><br>
                <span style="color:#0d9488">✔ ${Number(e.exitos)} actualizados</span><br>
                <span style="color:#c0392b">✖ ${Number(e.fallos)} no encontrados</span>`;
    if (Number(e.noProcesados) > 0) {
      html += `<br><span style="color:#b45309">⚠ ${Number(e.noProcesados)} sin procesar por tiempo: vuelve a enviarlos</span>`;
    }
    UI.informar('Resultado', html);

    $('resMod2').innerHTML =
      `Resumen: <span style="color:#0d9488">${Number(e.exitos)} actualizados</span> | ` +
      `<span style="color:#c0392b">${Number(e.fallos)} no encontrados</span>` +
      (Number(e.noProcesados) > 0 ? ` | <span style="color:#b45309">${Number(e.noProcesados)} sin procesar</span>` : '');

    reporte = Array.isArray(res.reporte) ? res.reporte : [];
    $('btnDescargarReporte').style.display = reporte.length ? 'inline-flex' : 'none';
    pegado.limpiar();
  }

  function descargarReporte() {
    if (!reporte.length) return;
    const datos = [["FOLIO BUSCADO", "ESTATUS ENVIADO", "OBS ENVIADO", "RESULTADO SISTEMA"], ...reporte];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(datos), "Reporte");
    XLSX.writeFile(wb, "Reporte_Actualizacion.xlsx");
  }

  $('btnActualizar').addEventListener('click', actualizar);
  $('btnDescargarReporte').addEventListener('click', descargarReporte);

  // Al cerrar sesión se descartan los datos y el reporte.
  document.addEventListener('app:logout', () => {
    pegado.limpiar();
    limpiarResultado();
  });

  return {};
})();
