/* ALTA MASIVA DE TARJETAS (PEGAR DESDE EXCEL) - markup y lógica del módulo */

const ENCABEZADOS_MOD1 = ["FOLIO","ID SARE","NOMBRE SARE","MUNICIPIO","CCT","ESCUELA","ID FAMILIA","NOMBRE(S)","APELLIDO 1","APELLIDO 2","REMESA","PROGRAMA","BLOQUE","OBSERVACIONES","MES REMESA","CURP","ESTATUS"];

registrarModulo({
  id: 'modulo1-excel',
  titulo: '📊 Registro de tarjetas (Pegar desde Excel)',
  html: `
    <h3>Alta Masiva de Tarjetas Nuevas</h3>
    <div class="paste-zone" id="pasteZoneMod1">
      <div class="header-guide" id="guideMod1"></div>
      <textarea id="pasteMod1" class="paste-input" placeholder="Selecciona y copia (Ctrl+C) el rango de celdas en Excel, en el mismo orden de columnas de la guía de arriba, y pégalo aquí (Ctrl+V). Puedes incluir o no la fila de encabezado."></textarea>
      <div class="paste-count" id="conteoMod1">0 filas detectadas</div>
      <div class="paste-hint">Orden de columnas esperado: FOLIO, ID SARE, NOMBRE SARE, MUNICIPIO, CCT, ESCUELA, ID FAMILIA, NOMBRE(S), APELLIDO 1, APELLIDO 2, REMESA, PROGRAMA, BLOQUE, OBSERVACIONES, MES REMESA, CURP, ESTATUS.</div>
    </div>
    <div class="file-actions">
      <button class="btn btn-primary" onclick="procesarPegadoNuevos()" style="width: 260px;">📤 Procesar y Sincronizar</button>
    </div>
  `
});

let bloqueActualExcel = [];

pintarGuia('guideMod1', ENCABEZADOS_MOD1);
document.getElementById('pasteMod1').addEventListener('input', () => {
  contarFilasPegadas('pasteMod1', 'conteoMod1', 'pasteZoneMod1', ENCABEZADOS_MOD1);
});

registrarFuenteBloque('excel_nuevos', {
  obtener: () => bloqueActualExcel,
  alExito: () => {
    bloqueActualExcel = [];
    document.getElementById('pasteMod1').value = "";
    contarFilasPegadas('pasteMod1', 'conteoMod1', 'pasteZoneMod1', ENCABEZADOS_MOD1);
  }
});

function procesarPegadoNuevos() {
  const texto = document.getElementById('pasteMod1').value;
  const filas = parsearPegado(texto, ENCABEZADOS_MOD1);

  if (filas.length === 0) return alert("Pega los datos copiados de Excel antes de continuar.");

  bloqueActualExcel = [];
  const fechaActual = new Date().toLocaleDateString('es-MX');

  filas.forEach(row => {
    let fData = new Array(20).fill("");
    let n   = String(row[7]  || "").toUpperCase();
    let ap1 = String(row[8]  || "").toUpperCase();
    let ap2 = String(row[9]  || "").toUpperCase();
    let obsOrig = String(row[13] || "").toUpperCase();

    fData[0] = String(row[0]  || "").toUpperCase(); // FOLIO
    fData[1] = String(row[1]  || "").toUpperCase(); // ID SARE
    fData[2] = String(row[2]  || "").toUpperCase(); // NOMBRE SARE
    fData[3] = String(row[3]  || "").toUpperCase(); // MUNICIPIO
    fData[5] = String(row[4]  || "").toUpperCase(); // CCT
    fData[6] = String(row[5]  || "").toUpperCase(); // ESCUELA
    fData[7] = String(row[6]  || "").toUpperCase(); // ID FAMILIA
    fData[8] = n; fData[9] = ap1; fData[10] = ap2;
    fData[11] = String(row[10] || "").toUpperCase(); // REMESA
    fData[12] = String(row[11] || "").toUpperCase(); // PROGRAMA
    fData[13] = String(row[12] || "").toUpperCase(); // BLOQUE
    fData[15] = obsOrig ? `${obsOrig} - ${fechaActual}` : fechaActual; // OBSERVACIONES
    fData[16] = String(row[14] || "").toUpperCase(); // MES REMESA
    fData[17] = String(row[15] || "").toUpperCase(); // CURP
    fData[18] = String(row[16] || "").toUpperCase(); // ESTATUS
    fData[19] = `${n} ${ap1} ${ap2}`.trim();

    bloqueActualExcel.push(fData);
  });

  if (bloqueActualExcel.length > 0) {
    iniciarSincronizacion('excel_nuevos');
  } else {
    alert("No se detectaron filas válidas en los datos pegados.");
  }
}
