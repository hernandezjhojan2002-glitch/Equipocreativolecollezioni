/* Service worker — Equipo Creativo
   - Páginas (HTML): red primero, para que siempre veas la versión más nueva. Sin internet, muestra la última guardada.
   - Librerías (Supabase, Chart.js): se guardan para que la app abra rápido.
   - Supabase (datos, tiempo real, archivos): NUNCA se intercepta ni se guarda; los datos siempre vienen en vivo. */
const VERSION = 'v1';
const PAGINAS = 'equipo-paginas-' + VERSION;
const LIBS = 'equipo-libs-' + VERSION;
const CDN = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'unpkg.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.endsWith(VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

const claveDePagina = (url) => new Request(url.origin + url.pathname);   // una sola copia por archivo, sin ?parámetros

async function redPrimero(req) {
  const url = new URL(req.url);
  try {
    const res = await fetch(req);
    if (res && res.ok) { const c = await caches.open(PAGINAS); c.put(claveDePagina(url), res.clone()); }
    return res;
  } catch (err) {
    const c = await caches.open(PAGINAS);
    const guardada = await c.match(claveDePagina(url));
    if (guardada) return guardada;
    return new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#f3f3f1;color:#141414;text-align:center">' +
      '<div style="padding:24px"><h2 style="margin:0 0 8px">Sin conexión</h2><p style="margin:0">Conéctate a internet y vuelve a abrir la app.</p></div>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function cacheLuegoRed(req) {
  const c = await caches.open(LIBS);
  const guardada = await c.match(req);
  const red = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => null);
  return guardada || (await red) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return;   // datos en vivo: no tocar
  if (req.mode === 'navigate') { e.respondWith(redPrimero(req)); return; }
  if (CDN.includes(url.hostname)) { e.respondWith(cacheLuegoRed(req)); return; }
  if (url.origin === self.location.origin) { e.respondWith(cacheLuegoRed(req)); return; }    // íconos y manifest
});
