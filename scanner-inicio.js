/* ============================================================
   SCANNER FOTO · INSTALABLE EN EL CELULAR (PWA)
   - Registra el mismo service worker de Equipo Creativo (abre rápido y sin señal).
   - Arma el manifiesto con el link que abriste (?aprendiz=…, ?externo=…, ?admin=1),
     así el ícono instalado abre directo en TU scanner, con la cámara lista.
   ============================================================ */
window.__pwa = { prompt: null };
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__pwa.prompt = e; window.dispatchEvent(new Event('pwa-lista')); });
window.addEventListener('appinstalled', function () { window.__pwa.prompt = null; window.dispatchEvent(new Event('pwa-lista')); });
(function () {
  try {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
    var u = new URL(location.href); u.hash = '';
    var abs = function (f) { return new URL(f, location.href).href; };
    var man = {
      id: u.href, name: 'Scanner foto · LE COLLEZIONI', short_name: 'Scanner foto',
      description: 'Escanea etiquetas y controla la fotografía de producto.', lang: 'es',
      start_url: u.href, scope: new URL('./', location.href).href, display: 'standalone', orientation: 'portrait',
      background_color: '#f3f3f1', theme_color: '#f3f3f1',
      icons: [{ src: abs('icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
              { src: abs('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
              { src: abs('icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' }]
    };
    var enlace = document.querySelector('link[rel="manifest"]');
    if (enlace) enlace.setAttribute('href', URL.createObjectURL(new Blob([JSON.stringify(man)], { type: 'application/manifest+json' })));
  } catch (e) {}
})();
