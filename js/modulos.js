/* REGISTRO DE MÓDULOS
   Cada módulo llama a registrarModulo({ id, titulo, html }) y obtiene su pestaña
   y su panel. El primero registrado queda activo. Para agregar un módulo nuevo basta
   con crear modules/mod-xxx.js, llamarlo aquí y cargarlo en index.html. */

function registrarModulo(def) {
  const tabs = document.getElementById('tabs');
  const host = document.getElementById('modulos');
  if (!tabs || !host) return;

  const esPrimero = tabs.children.length === 0;

  const boton = document.createElement('button');
  boton.className = 'tab-btn' + (esPrimero ? ' activo' : '');
  boton.dataset.modulo = def.id;
  boton.textContent = def.titulo;
  boton.addEventListener('click', () => cambiarModulo(def.id));

  const panel = document.createElement('div');
  panel.id = def.id;
  panel.className = 'modulo' + (esPrimero ? ' activo' : '');
  panel.innerHTML = def.html;

  tabs.appendChild(boton);
  host.appendChild(panel);
}

function cambiarModulo(id) {
  document.querySelectorAll('#modulos > .modulo').forEach(m => m.classList.toggle('activo', m.id === id));
  document.querySelectorAll('#tabs > .tab-btn').forEach(b => b.classList.toggle('activo', b.dataset.modulo === id));
}
