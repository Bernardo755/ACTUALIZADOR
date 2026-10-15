/* =========================================================
   UI COMPARTIDA
   Escape de HTML, pestañas, modal (con campo de contraseña) y utilidades de pegado.
   ========================================================= */
const UI = (function () {
  const $ = id => document.getElementById(id);

  function escapar(t) {
    return String(t === undefined || t === null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function iniciarPestanas() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
        $(btn.dataset.modulo).classList.add('activo');
        btn.classList.add('activo');
      });
    });
  }

  /* ---------- Modal ---------- */
  let idModal = 0;          // evita que un cierre automático cierre un modal posterior
  let resolverPassword = null;

  // El HTML de "mensaje" lo arma quien llama: todo dato dinámico debe pasar por escapar().
  function mostrarModal(o) {
    idModal++;
    $('modalTitle').innerText = o.titulo || '';
    $('modalMessage').innerHTML = o.mensaje || '';
    $('modalLoader').style.display = o.cargando ? 'block' : 'none';
    $('modalPassBox').style.display = o.pedirPassword ? 'block' : 'none';
    $('modalPassError').innerText = o.error || '';

    const cont = $('modalButtons');
    cont.innerHTML = '';
    (o.botones || []).forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn ' + (b.clase || '');
      btn.innerText = b.texto;
      btn.addEventListener('click', b.accion);
      cont.appendChild(btn);
    });
    cont.style.display = (o.botones && o.botones.length) ? 'flex' : 'none';
    $('confirmModal').style.display = 'flex';
  }

  function cerrarModal() {
    $('confirmModal').style.display = 'none';
    $('modalPass').value = '';
    $('modalPass').onkeydown = null;
    if (resolverPassword) { const r = resolverPassword; resolverPassword = null; r(null); }
  }

  function cargando(titulo, mensaje) {
    mostrarModal({ titulo, mensaje, cargando: true });
  }

  function informar(titulo, mensaje, autocerrarMs) {
    mostrarModal({ titulo, mensaje, botones: [{ texto: 'Cerrar', clase: 'btn-secondary', accion: cerrarModal }] });
    if (autocerrarMs) {
      const mio = idModal;
      setTimeout(() => { if (idModal === mio) cerrarModal(); }, autocerrarMs);
    }
  }

  // Pide la contraseña. Devuelve la contraseña escrita, o null si cancela.
  // El modal queda abierto: quien llama lo reemplaza con cargando()/informar().
  function pedirPassword(titulo, mensaje, error) {
    return new Promise(resolve => {
      resolverPassword = resolve;
      const enviar = () => {
        const v = $('modalPass').value;
        if (!v) { $('modalPassError').innerText = 'Escribe tu contraseña.'; return; }
        $('modalPass').value = '';
        resolverPassword = null;
        resolve(v);
      };
      mostrarModal({
        titulo, mensaje, pedirPassword: true, error,
        botones: [
          { texto: 'Cancelar', clase: 'btn-secondary', accion: cerrarModal },
          { texto: 'Confirmar y enviar', accion: enviar }
        ]
      });
      const input = $('modalPass');
      input.value = '';
      input.onkeydown = e => { if (e.key === 'Enter') enviar(); };
      input.focus();
    });
  }

  /* ---------- Zonas de pegado desde Excel ---------- */
  function pintarGuia(idContenedor, encabezados) {
    $(idContenedor).innerHTML = encabezados
      .map((h, i) => `<span class="header-chip"><span class="idx">${i + 1}</span>${escapar(h)}</span>`)
      .join('');
  }

  // Convierte el texto pegado (tabulado, como copia Excel) en filas de celdas.
  // Descarta la fila de encabezado si viene incluida y las filas sin folio.
  function parsearPegado(texto, encabezados) {
    const lineas = texto.split(/\r\n|\r|\n/).filter(l => l.trim() !== '');
    if (lineas.length === 0) return [];

    const filas = lineas.map(linea => {
      // Excel copia con tabuladores; si no hay tabs pero sí comas, se usa coma como respaldo (CSV)
      if (linea.indexOf('\t') === -1 && linea.indexOf(',') !== -1) {
        return linea.split(',').map(c => c.trim());
      }
      return linea.split('\t').map(c => c.trim());
    });

    if ((filas[0][0] || '').trim().toUpperCase() === encabezados[0]) filas.shift();
    return filas.filter(f => f[0]);
  }

  // Vincula un textarea con su contador. Devuelve { filas(), limpiar() }.
  function vincularPegado(idTextarea, idConteo, idZona, encabezados) {
    const ta = $(idTextarea), cont = $(idConteo), zona = $(idZona);
    const actualizar = () => {
      const filas = parsearPegado(ta.value, encabezados);
      cont.innerText = `${filas.length} fila(s) detectada(s)`;
      zona.classList.toggle('con-datos', filas.length > 0);
    };
    ta.addEventListener('input', actualizar);
    return {
      filas: () => parsearPegado(ta.value, encabezados),
      limpiar: () => { ta.value = ''; actualizar(); }
    };
  }

  return { escapar, iniciarPestanas, cargando, informar, pedirPassword, cerrarModal, pintarGuia, vincularPegado };
})();
