/* REGISTRO MANUAL DE TARJETAS - markup y lógica del módulo */

registrarModulo({
  id: 'modulo1-form',
  titulo: '📝 Registro de Tarjetas',
  html: `
    <h3>Registro Manual de Tarjetas</h3>

    <div class="form-grid" id="formularioNuevos">
      <div class="form-group"><label>Folio</label><input type="text" id="m1_folio"></div>
      <div class="form-group"><label>ID SARE</label><input type="text" id="m1_idSare"></div>
      <div class="form-group"><label>Nombre SARE</label><input type="text" id="m1_nombreSare"></div>
      <div class="form-group"><label>Municipio</label><input type="text" id="m1_municipio"></div>
      <div class="form-group"><label>CCT</label><input type="text" id="m1_cct"></div>
      <div class="form-group"><label>Nombre de la Escuela</label><input type="text" id="m1_escuela"></div>
      <div class="form-group"><label>ID Becario o Familia</label><input type="text" id="m1_idFamilia"></div>
      <div class="form-group"><label>Nombre(s)</label><input type="text" id="m1_nombre"></div>
      <div class="form-group"><label>Primer Apellido</label><input type="text" id="m1_ap1"></div>
      <div class="form-group"><label>Segundo Apellido</label><input type="text" id="m1_ap2"></div>
      <div class="form-group"><label>Remesa</label><input type="text" id="m1_remesa"></div>
      <div class="form-group">
        <label>Programa</label>
        <select id="m1_programa">
          <option value="BASICA">BÁSICA</option>
          <option value="BUEMS">BUEMS</option>
          <option value="JEF">JEF</option>
        </select>
      </div>
      <div class="form-group"><label>Bloque</label><input type="text" id="m1_bloque"></div>
      <div class="form-group">
        <label>Observaciones</label>
        <input type="text" id="m1_obs" list="opcionesObs">
        <datalist id="opcionesObs">
          <option value="RECIBIDA DE OTRO ESTADO"></option>
          <option value="NUEVA REMESA RECIBIDA"></option>
        </datalist>
      </div>
      <div class="form-group"><label>Mes de Remesa</label><input type="text" id="m1_mes"></div>
      <div class="form-group"><label>CURP</label><input type="text" id="m1_curp" maxlength="18"></div>
      <div class="form-group">
        <label>Estatus</label>
        <select id="m1_estatus">
          <option value="PERTENECE A LA SARE 1301">PERTENECE A LA SARE 1301</option>
          <option value="PERTENECE A LA SARE 1302">PERTENECE A LA SARE 1302</option>
          <option value="PERTENECE A LA SARE 1303">PERTENECE A LA SARE 1303</option>
          <option value="PERTENECE A LA SARE 1304">PERTENECE A LA SARE 1304</option>
          <option value="PERTENECE A LA SARE 1305">PERTENECE A LA SARE 1305</option>
          <option value="PERTENECE A LA SARE 1306">PERTENECE A LA SARE 1306</option>
          <option value="PERTENECE A LA SARE 1307">PERTENECE A LA SARE 1307</option>
        </select>
      </div>
    </div>

    <div style="display: flex; gap: 10px;">
      <button class="btn btn-secondary" onclick="agregarAlBloque()">➕ Agregar a la Lista</button>
      <button class="btn btn-primary" id="btnSincronizarManual" onclick="iniciarSincronizacion('manual')" style="display:none;">☁️ Sincronizar Registros</button>
    </div>

    <table id="tablaBloque" style="display:none;">
      <thead>
        <tr><th>Folio</th><th>CCT</th><th>ID Familia</th><th>Nombre Completo</th><th>Estatus</th></tr>
      </thead>
      <tbody id="tbodyBloque"></tbody>
    </table>
  `
});

let bloqueActualManual = [];

registrarFuenteBloque('manual', {
  obtener: () => bloqueActualManual,
  alExito: () => {
    bloqueActualManual = [];
    document.getElementById("tbodyBloque").innerHTML = "";
    document.getElementById("tablaBloque").style.display = "none";
    document.getElementById("btnSincronizarManual").style.display = "none";
  }
});

function agregarAlBloque() {
  const n = document.getElementById("m1_nombre").value;
  const ap1 = document.getElementById("m1_ap1").value;
  const ap2 = document.getElementById("m1_ap2").value;
  const nombreCompleto = `${n} ${ap1} ${ap2}`.trim();

  if (!document.getElementById("m1_folio").value || !n) {
    return alert("El Folio y el Nombre son obligatorios.");
  }

  const fechaActual = new Date().toLocaleDateString('es-MX');
  let obs = document.getElementById("m1_obs").value;
  obs = obs ? `${obs} - ${fechaActual}` : fechaActual;

  let filaNueva = new Array(20).fill("");
  filaNueva[0]  = document.getElementById("m1_folio").value;
  filaNueva[1]  = document.getElementById("m1_idSare").value;
  filaNueva[2]  = document.getElementById("m1_nombreSare").value;
  filaNueva[3]  = document.getElementById("m1_municipio").value;
  filaNueva[5]  = document.getElementById("m1_cct").value;
  filaNueva[6]  = document.getElementById("m1_escuela").value;
  filaNueva[7]  = document.getElementById("m1_idFamilia").value;
  filaNueva[8]  = n;
  filaNueva[9]  = ap1;
  filaNueva[10] = ap2;
  filaNueva[11] = document.getElementById("m1_remesa").value;
  filaNueva[12] = document.getElementById("m1_programa").value;
  filaNueva[13] = document.getElementById("m1_bloque").value;
  filaNueva[15] = obs;
  filaNueva[16] = document.getElementById("m1_mes").value;
  filaNueva[17] = document.getElementById("m1_curp").value;
  filaNueva[18] = document.getElementById("m1_estatus").value;
  filaNueva[19] = nombreCompleto;

  bloqueActualManual.push(filaNueva);

  document.getElementById("tbodyBloque").innerHTML += `<tr>
    <td>${esc(filaNueva[0])}</td><td>${esc(filaNueva[5])}</td><td>${esc(filaNueva[7])}</td>
    <td>${esc(filaNueva[19])}</td>
    <td><span style="background:#dff3f1; color:#00534a; padding:4px 8px; border-radius:4px; font-size:11px;">${esc(filaNueva[18])}</span></td>
  </tr>`;

  document.getElementById("tablaBloque").style.display = "table";
  document.getElementById("btnSincronizarManual").style.display = "inline-flex";

  document.querySelectorAll('#formularioNuevos input').forEach(inp => inp.value = "");
}
