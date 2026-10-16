/* MÓDULO 4 — INTERFAZ: formulario, zonas de pegado, pestañas y modal.
   Aquí no hay lógica de negocio: solo se capturan y muestran datos. */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const ENC_ALTA = ["FOLIO","ID SARE","NOMBRE SARE","MUNICIPIO","CCT","ESCUELA","ID FAMILIA","NOMBRE(S)","APELLIDO 1","APELLIDO 2","REMESA","PROGRAMA","BLOQUE","OBSERVACIONES","MES REMESA","CURP","ESTATUS"];
const ENC_UPD  = ["FOLIO","ESTATUS","OBSERVACIONES"];

// Campos del formulario manual, en el MISMO orden que ENC_ALTA.
const SARES = [1301,1302,1303,1304,1305,1306,1307].map(n => 'PERTENECE A LA SARE ' + n);
const CAMPOS = [
  ['Folio'],['ID SARE'],['Nombre SARE'],['Municipio'],['CCT'],['Nombre de la Escuela'],['ID Becario o Familia'],
  ['Nombre(s)'],['Primer Apellido'],['Segundo Apellido'],['Remesa'],
  ['Programa','select',['BASICA','BUEMS','JEF']],['Bloque'],
  ['Observaciones','list',['RECIBIDA DE OTRO ESTADO','NUEVA REMESA RECIBIDA']],
  ['Mes de Remesa'],['CURP','text',null,18],['Estatus','select',SARES]
];

function dibujarFormulario() {
  $('formularioNuevos').innerHTML = CAMPOS.map(([lbl, tipo, ops, max], i) => {
    let ctl = `<input type="text" id="f${i}"${max ? ` maxlength="${max}"` : ''}>`;
    if (tipo === 'select') ctl = `<select id="f${i}">${ops.map(o => `<option>${o}</option>`).join('')}</select>`;
    if (tipo === 'list') ctl = `<input type="text" id="f${i}" list="dl${i}"><datalist id="dl${i}">${ops.map(o => `<option value="${o}">`).join('')}</datalist>`;
    return `<div class="form-group"><label>${lbl}</label>${ctl}</div>`;
  }).join('');
}

function pintarGuia(id, enc) {
  $(id).innerHTML = enc.map((h, i) => `<span class="header-chip"><span class="idx">${i + 1}</span>${h}</span>`).join('');
}

// Mayúsculas mientras se escribe (el servidor las vuelve a forzar).
document.addEventListener('input', e => {
  if (e.target.tagName === 'INPUT' && e.target.type === 'text') e.target.value = e.target.value.toUpperCase();
});

function cambiarModulo(id, btn) {
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
  $(id).classList.add('activo'); btn.classList.add('activo');
}

/* ---------- Pegado desde Excel: solo separa celdas; el servidor valida y normaliza ---------- */
function parsearPegado(texto) {
  return texto.split(/\r\n|\r|\n/).filter(l => l.trim() !== '')
    .map(l => (l.indexOf('\t') === -1 && l.indexOf(',') !== -1 ? l.split(',') : l.split('\t')).map(c => c.trim()))
    .filter(f => f[0] && f[0].toUpperCase() !== 'FOLIO');
}

function contarFilas(idTxt, idConteo, idZona) {
  const filas = parsearPegado($(idTxt).value);
  $(idConteo).textContent = `${filas.length} fila(s) detectada(s)`;
  $(idZona).classList.toggle('con-datos', filas.length > 0);
  return filas;
}

/* ---------- Modal ---------- */
function abrirModal(titulo, html, { carga = false, password = false, cerrar = false } = {}) {
  $('modalTitle').textContent = titulo;
  $('modalMessage').innerHTML = html;
  $('modalLoader').style.display = carga ? 'block' : 'none';
  $('modalPass').style.display = password ? 'block' : 'none';
  $('modalPass').value = '';
  $('modalButtons').style.display = (password || cerrar) ? 'flex' : 'none';
  $('btnModalOk').style.display = password ? '' : 'none';
  $('btnModalCancel').textContent = password ? 'Cancelar' : 'Cerrar';
  $('confirmModal').style.display = 'flex';
  if (password) $('modalPass').focus();
}
function cerrarModal() { $('confirmModal').style.display = 'none'; $('modalPass').value = ''; }

let _resolver = null;
function pedirPassword(html) {
  return new Promise(resolve => { _resolver = resolve; abrirModal('Confirma tu identidad', html, { password: true }); });
}
$('btnModalOk').onclick = () => { const v = $('modalPass').value; if (!v || !_resolver) return; const r = _resolver; _resolver = null; r(v); };
$('btnModalCancel').onclick = () => { const r = _resolver; _resolver = null; cerrarModal(); if (r) r(null); };
$('modalPass').addEventListener('keydown', e => { if (e.key === 'Enter') $('btnModalOk').click(); });
