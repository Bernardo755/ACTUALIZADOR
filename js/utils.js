/* UTILIDADES COMPARTIDAS: escape HTML y manejo de datos pegados desde Excel */

function esc(t) {
  return String(t === undefined || t === null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pintarGuia(idContenedor, encabezados) {
  const cont = document.getElementById(idContenedor);
  cont.innerHTML = encabezados.map((h, i) => `<span class="header-chip"><span class="idx">${i+1}</span>${h}</span>`).join("");
}

// Convierte el texto pegado (tab-delimitado, como copia Excel) en un arreglo de filas de celdas.
// Detecta y descarta automáticamente una fila de encabezado si viene incluida.
function parsearPegado(texto, encabezados) {
  const lineas = texto.split(/\r\n|\r|\n/).filter(l => l.trim() !== "");
  if (lineas.length === 0) return [];

  let filas = lineas.map(linea => {
    // Excel copia con tabuladores; si no hay tabs pero sí comas, se usa coma como respaldo (CSV)
    if (linea.indexOf('\t') === -1 && linea.indexOf(',') !== -1) {
      return linea.split(',').map(c => c.trim());
    }
    return linea.split('\t').map(c => c.trim());
  });

  const primerCelda = (filas[0][0] || "").trim().toUpperCase();
  if (primerCelda === encabezados[0]) {
    filas.shift();
  }
  return filas.filter(f => f[0]); // descarta filas sin folio
}

function contarFilasPegadas(idTextarea, idConteo, idZona, encabezados) {
  const texto = document.getElementById(idTextarea).value;
  const filas = parsearPegado(texto, encabezados);
  const zona = document.getElementById(idZona);
  document.getElementById(idConteo).innerText = `${filas.length} fila(s) detectada(s)`;
  if (filas.length > 0) { zona.classList.add('con-datos'); } else { zona.classList.remove('con-datos'); }
  return filas;
}
