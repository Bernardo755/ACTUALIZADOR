/* ACTUALIZACIÓN MASIVA DE ESTATUS (PEGAR DESDE EXCEL) - markup y lógica del módulo */

const ENCABEZADOS_MOD2 = ["FOLIO","ESTATUS","OBSERVACIONES"];

registrarModulo({
  id: 'modulo2',
  titulo: '🔄 Actualizar Estatus (Pegar desde Excel)',
  html: `
    <h3>Actualización Masiva de Estatus</h3>
    <div class="paste-zone" id="pasteZoneMod2">
      <div class="header-guide" id="guideMod2"></div>
      <textarea id="pasteMod2" class="paste-input" placeholder="Copia (Ctrl+C) las columnas FOLIO, ESTATUS y OBSERVACIONES desde Excel y pégalas aquí (Ctrl+V). Puedes incluir o no la fila de encabezado."></textarea>
      <div class="paste-count" id="conteoMod2">0 filas detectadas</div>
      <div class="paste-hint">Orden de columnas esperado: FOLIO, ESTATUS, OBSERVACIONES.</div>
    </div>
    <div class="file-actions">
      <button class="btn btn-primary" onclick="procesarPegadoUpdate()" style="width: 260px;">🔄 Actualizar Base de Datos</button>
    </div>
    <div id="resMod2" style="margin-top: 20px; font-weight: 600;"></div>
    <button id="btnDescargarReporte" class="btn btn-secondary" onclick="generarReporteExcel()" style="display:none; margin-top: 15px;">📥 Descargar Reporte de Resultados</button>
  `
});

let updatesPendientes = [];
let reporteMasivoGenerado = [];

pintarGuia('guideMod2', ENCABEZADOS_MOD2);
document.getElementById('pasteMod2').addEventListener('input', () => {
  contarFilasPegadas('pasteMod2', 'conteoMod2', 'pasteZoneMod2', ENCABEZADOS_MOD2);
});

registrarOperacionConfirmable('update', password => ejecutarActualizacionMasiva(password));

// Confirmación con contraseña antes de modificar la base
function procesarPegadoUpdate() {
  const texto = document.getElementById('pasteMod2').value;
  const filas = parsearPegado(texto, ENCABEZADOS_MOD2);

  if (filas.length === 0) return alert("Pega los datos copiados de Excel antes de continuar.");

  updatesPendientes = filas.map(row => ({
    folio:   String(row[0] || "").toUpperCase(),
    estatus: String(row[1] || "").toUpperCase(),
    obs:     String(row[2] || "").toUpperCase()
  }));

  tipoSincronizacionActiva = 'update';
  mensajeConfirmacionActual =
    `Se actualizarán el estatus y las observaciones de <strong>${updatesPendientes.length} registros</strong> en la base de datos.<br><br>¿Deseas proceder?`;
  abrirModal(mensajeConfirmacionActual, 'confirmar', true);
}

async function ejecutarActualizacionMasiva(password) {
  abrirModal('Procesando actualizaciones masivas...<br>No cierres esta ventana.', 'cargando', false, 'Actualizando');
  document.getElementById("btnDescargarReporte").style.display = "none";
  document.getElementById("resMod2").innerHTML = "";

  const res = await llamarBackend('procesarActualizacionMasiva', updatesPendientes, password);
  if (!appActiva) return;

  if (res.errorPassword) {
    tipoSincronizacionActiva = 'update';
    return reintentarConPasswordIncorrecta(res.error);
  }

  if (res.exito) {
    abrirModal(`<strong>Actualización Finalizada</strong><br>
                <span style="color:#0d9488">✔ ${esc(res.estadisticas.exitos)} Actualizados</span><br>
                <span style="color:#c0392b">✖ ${esc(res.estadisticas.fallos)} No Encontrados</span>`, 'cerrar');

    document.getElementById("resMod2").innerHTML =
      `Resumen: <span style="color:#0d9488">${esc(res.estadisticas.exitos)} Actualizados</span> |
      <span style="color:#c0392b">${esc(res.estadisticas.fallos)} No Encontrados</span>`;

    reporteMasivoGenerado = res.reporte;
    updatesPendientes = [];
    document.getElementById("btnDescargarReporte").style.display = "inline-flex";
    document.getElementById('pasteMod2').value = "";
    contarFilasPegadas('pasteMod2', 'conteoMod2', 'pasteZoneMod2', ENCABEZADOS_MOD2);
  } else {
    abrirModal(`<span style="color:red">Error: ${esc(res.error)}</span>`, 'cerrar');
  }
}

// El reporte solo contiene lo que el propio usuario pegó + el resultado de cada folio;
// no descarga datos de la base.
function generarReporteExcel() {
  if (reporteMasivoGenerado.length === 0) return;
  const dataFinal = [["FOLIO BUSCADO", "ESTATUS ENVIADO", "OBS ENVIADO", "RESULTADO SISTEMA"], ...reporteMasivoGenerado];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataFinal), "Reporte");
  XLSX.writeFile(wb, "Reporte_Actualizacion.xlsx");
}
