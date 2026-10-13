/* =========================================================
   MODALES / IFRAME
   Las URLs permanecen exclusivamente en config.js.
   ========================================================= */

function configurarModalIframe(botonAbrirId, botonCerrarId, modalId, iframeId, url) {
    const btnAbrir = document.getElementById(botonAbrirId);
    const btnCerrar = document.getElementById(botonCerrarId);
    const modal = document.getElementById(modalId);
    const iframe = document.getElementById(iframeId);

    // Un módulo puede no estar disponible para ciertos roles.
    if (!btnAbrir || !btnCerrar || !modal || !iframe) return;

    btnAbrir.addEventListener('click', () => {
        iframe.src = url || '';
        modal.style.display = 'flex';
    });

    btnCerrar.addEventListener('click', () => {
        modal.style.display = 'none';
        iframe.src = '';
    });
}

configurarModalIframe(
    'btnAbrirAppB',
    'btnCerrarAppB',
    'modalAppB',
    'iframeAppB',
    window.APP_CONFIG.URL_APP_B
);

configurarModalIframe(
    'btnAbrirCargaTarjetas',
    'btnCerrarCargaTarjetas',
    'modalCargaTarjetas',
    'iframeCargaTarjetas',
    window.APP_CONFIG.URL_CARGA_TARJETAS
);

configurarModalIframe(
    'btnAbrirConsulta',
    'btnCerrarConsulta',
    'modalConsulta',
    'iframeConsulta',
    window.APP_CONFIG.URL_SISTEMA_CONSULTA
);

/* =========================================================
   ENTREGA DE SESIÓN A LA APP ACTUALIZADOR (iframe)
   La app solicita la sesión por postMessage. Solo se responde si:
   - el mensaje viene del iframe del Actualizador (event.source),
   - su origen coincide con URL_CARGA_TARJETAS,
   - hay una sesión activa con rol ADMIN/RESP.
   El token va únicamente por postMessage con origen destino explícito
   (nunca en la URL). Aun así, el backend vuelve a validar sesión, rol
   y contraseña en cada operación.
   ========================================================= */
window.addEventListener('message', function (event) {
    if (!event.data || event.data.tipo !== 'solicitar_sesion') return;

    const iframe = document.getElementById('iframeCargaTarjetas');
    if (!iframe || !iframe.contentWindow || event.source !== iframe.contentWindow) return;

    let origenEsperado;
    try { origenEsperado = new URL(window.APP_CONFIG.URL_CARGA_TARJETAS).origin; } catch (e) { return; }
    if (event.origin !== origenEsperado) return;

    const rol = String(rolActual || '').trim().toUpperCase();
    const permitido = ['ADMIN', 'ADMINISTRADOR', 'RESP', 'RESPONSABLE'].indexOf(rol) !== -1;
    if (!permitido || !usuarioActual || !tokenActual) return;

    event.source.postMessage({ tipo: 'sesion', usuario: usuarioActual, token: tokenActual }, event.origin);
});
