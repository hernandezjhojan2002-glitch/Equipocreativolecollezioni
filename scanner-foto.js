/* ============================================================
   SCANNER FOTO · LE COLLEZIONI
   Escanea la etiqueta → dice si la referencia está en la lista de
   fotografía → quien escanea actualiza el paso (Localizada →
   Fotografiada → Editada → Subida) y todo queda en Equipo Creativo.
   Accesos (como Equipo Creativo):
     ?admin=1          administrador (cuenta de Supabase)
     ?aprendiz=<id>    practicante (misma clave de 4 dígitos)
     ?externo=<id>     fotógrafo / tienda (clave propia)
     ?demo=1           prueba sin conectar nada
   ============================================================ */
'use strict';
const SUPABASE_URL = "https://yfppwtnrvkzlfigyvpgr.supabase.co";
const SUPABASE_KEY = "sb_publishable_7fruHz3lVitB6i1j5uA8bA_QR9NdCp1";
const REFRESCO_MS = 15000;          // cada cuánto se traen los cambios de los demás
const SYNC_DRIVE_MIN = 10;          // releer el Excel del Drive si la última lectura tiene más de X minutos
const N = window.FotoNucleo;
const supa = (window.supabase && !/[?&]demo=1/.test(location.search)) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const LOGO_DARK = "data:image/png;base64,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";  // logo negro, se usa en tema claro
const LOGO_LIGHT = "data:image/png;base64,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"; // logo blanco, se usa en tema oscuro

/* ---------- estado ---------- */
const S = {
  modo: null, persona: null, demo: false, token: '', actor: null, sede: '',
  listas: [], prod: new Map(), ix: N.crearIndice([]), desde: null, puente: null,
  tab: 'escanear', resultado: null, recientes: [], cola: [], enLinea: navigator.onLine,
  filtros: { sede: '', estado: 'falta', marca: '', lista: '' }, buscar: '', tecladoTexto: false,
  reporteLista: '', ultimo: { c: '', t: 0 }, sincronizando: false, _timer: null,
  archivo: [], ixArchivo: new Map(), progreso: {}, repDatos: {}, calMes: '', calAnio: 0, sesionOn: false, sesion: []
};

/* ---------- utilidades ---------- */
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const guardar = (k, v) => { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} };
const leer = (k, json) => { try { const v = localStorage.getItem(k); return json ? (v ? JSON.parse(v) : null) : v; } catch (e) { return null; } };
const borrar = k => { try { localStorage.removeItem(k); } catch (e) {} };
const ahoraIso = () => new Date().toISOString();
function haceCuanto(iso) {
  if (!iso) return '—';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return 'hace un momento';
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' });
}
const horaCO = iso => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' }).replace(/[  ]/g, ' ');
function toast(msg, ms) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), ms || 2600);
}
const ICON = {
  scan: '<path d="M3 7V4h3M17 4h3v3M21 17v3h-3M7 20H4v-3"/><path d="M7 8v8M10 8v8M13 8v8M16 8v8"/>',
  buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  reporte: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  admin: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  flash: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  pausa: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="m7 4 13 8-13 8z"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alerta: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  luna: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  salir: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  subir: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  nube: '<path d="M3 3l18 18M7 18h10a4 4 0 0 0 1.6-7.7A6 6 0 0 0 8.3 7.4M5.2 8.8A4.5 4.5 0 0 0 7 18"/>',
  descargar: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'
};
const ico = n => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;
const logo = h => `<img class="brand-logo-dark" src="${LOGO_LIGHT}" alt="LE COLLEZIONI" style="height:${h}px;width:auto;"><img class="brand-logo-light" src="${LOGO_DARK}" alt="LE COLLEZIONI" style="height:${h}px;width:auto;">`;

/* ---------- tema (el mismo de Equipo Creativo) ---------- */
function tema() { const s = leer('equipo_theme'); if (s) return s; return matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function aplicarTema(t) { document.documentElement.setAttribute('data-theme', t); const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#121211' : '#f3f3f1'); }
function cambiarTema() { const n = tema() === 'light' ? 'dark' : 'light'; guardar('equipo_theme', n); aplicarTema(n); pintarTop(); }

/* ---------- sonido y vibración ---------- */
const Sonido = {
  ctx: null,
  activar() { try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) {} },
  tono(f, d, desde) {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime + (desde || 0), o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  },
  si() { this.tono(1250, 0.12); try { navigator.vibrate && navigator.vibrate(60); } catch (e) {} },
  ya() { this.tono(900, 0.1); this.tono(900, 0.1, 0.14); try { navigator.vibrate && navigator.vibrate([40, 60, 40]); } catch (e) {} },
  no() { this.tono(320, 0.14); this.tono(240, 0.22, 0.17); try { navigator.vibrate && navigator.vibrate([120, 80, 120]); } catch (e) {} }
};
document.addEventListener('pointerdown', () => Sonido.activar(), { passive: true });

/* ============================================================
   SERVIDOR (Supabase) — o modo demo
   ============================================================ */
async function rpc(fn, args) {
  if (S.demo) return Demo.rpc(fn, args || {});
  try {
    const r = await supa.rpc(fn, args || {});
    if (r.error) {
      const m = String(r.error.message || '') + ' ' + String(r.error.code || '');
      if (/PGRST202|42883|could not find the function|schema cache/i.test(m)) return { ok: false, error: 'migracion' };
      if (/42501|permission denied|JWT|401/i.test(m)) return { ok: false, error: 'permiso' };
      return { ok: false, error: 'red', detalle: m };
    }
    return r.data == null ? { ok: false, error: 'red' } : r.data;
  } catch (e) { return { ok: false, error: 'red' }; }
}
const tok = () => S.modo === 'admin' ? '' : S.token;
const claveSesion = () => `foto_sesion_${S.modo}_${S.persona || ''}`;

/* ---------- cola: lo que se hace sin internet se envía después ---------- */
function cargarCola() { S.cola = leer('foto_cola_v1', true) || []; }
function guardarCola() { guardar('foto_cola_v1', S.cola); pintarIndicador(); }
function encolar(fn, args) {
  S.cola.push({ id: Math.random().toString(36).slice(2), fn, args: Object.assign({ p_cuando: ahoraIso(), p_sede: S.sede || null }, args), quien: claveSesion() });
  guardarCola(); enviarCola();
}
let _enviando = false;
async function enviarCola() {
  if (_enviando || !S.cola.length) return;
  _enviando = true;
  try {
    while (S.cola.length) {
      const it = S.cola[0];
      if (it.quien !== claveSesion()) { S.cola.shift(); continue; }
      const r = await rpc(it.fn, Object.assign({ p_token: tok() }, it.args));
      if (r && r.ok) { S.cola.shift(); if (r.producto) fusionarProducto(r.producto); if (r.productos) r.productos.forEach(fusionarProducto); S.enLinea = true; continue; }
      if (r && r.error === 'red') { S.enLinea = false; break; }
      if (r && r.error === 'sesion') { sesionVencida(); break; }
      S.cola.shift();                                                     // error de datos: se descarta
    }
  } finally { _enviando = false; guardarCola(); }
}
window.addEventListener('online', () => { S.enLinea = true; enviarCola(); refrescar(); });
window.addEventListener('offline', () => { S.enLinea = false; pintarIndicador(); });

/* ---------- datos ---------- */
function reconstruirIndice() { S.ix = N.crearIndice([...S.prod.values()]); }
// Memoria entre colecciones: referencias de colecciones archivadas (otros meses)
function construirArchivo() {
  const m = new Map();
  const add = (k, e) => { if (!k) return; const a = m.get(k); if (!a) m.set(k, [e]); else a.push(e); };
  (S.archivo || []).forEach(x => {
    const e = { ref: x[0], serial: x[1], estado: x[2], lista_id: x[3] };
    add(N.limpiar(x[0]), e);
    (x[4] || []).forEach(c => { const cl = N.limpiar(c); add(cl, e); if (cl.length > 6) add(cl.slice(0, -2), e); });
    const s = N.alnum(x[1]); if (s.length >= 6 && /\d/.test(s)) add(s, e);
  });
  S.ixArchivo = m;
}
function buscarArchivo(c) {
  const m = S.ixArchivo; if (!m || !m.size) return null;
  let mejor = null;
  [c, c.length > 6 ? c.slice(0, -2) : '', N.alnum(c)].filter(Boolean).forEach(k => (m.get(k) || []).forEach(e => { if (!mejor || N.ORDEN[e.estado] > N.ORDEN[mejor.estado]) mejor = e; }));
  return mejor;
}
function aplicarCola(p) {                // lo pendiente de enviar manda sobre lo que dice el servidor
  for (let i = S.cola.length - 1; i >= 0; i--) {
    const it = S.cola[i];
    if (it.fn === 'foto_marcar' && it.args.p_producto === p.id) { p.estado = it.args.p_estado; return p; }
    if (it.fn === 'foto_marcar_lote' && (it.args.p_productos || []).includes(p.id)) { p.estado = it.args.p_estado; return p; }
  }
  if (p.estado === 'pendiente' && S.cola.some(it => it.fn === 'foto_escanear' && it.args.p_producto === p.id)) p.estado = 'localizado';
  return p;
}
function fusionarProducto(p) {
  if (!p) return;
  if (p.activo === false) S.prod.delete(p.id); else S.prod.set(p.id, aplicarCola(p));
  reconstruirIndice(); guardarCache();
  if (S.resultado && S.resultado.p && S.resultado.p.id === p.id) { S.resultado.p = S.prod.get(p.id) || S.resultado.p; }
}
function aplicarDatos(r) {
  S.actor = r.actor || S.actor; if (r.puente) S.puente = r.puente;
  S.listas = r.listas || [];
  if (r.archivo) { S.archivo = r.archivo; construirArchivo(); }
  const activas = new Set(S.listas.filter(l => l.activa).map(l => l.id));
  if (r.completo) S.prod = new Map();
  (r.productos || []).forEach(p => { if (p.activo === false) S.prod.delete(p.id); else S.prod.set(p.id, aplicarCola(p)); });
  for (const [id, p] of S.prod) if (!activas.has(p.lista_id)) S.prod.delete(id);
  S.desde = r.ahora ? new Date(new Date(r.ahora).getTime() - 5000).toISOString() : S.desde;
  reconstruirIndice(); guardarCache();
  if (S.resultado && S.resultado.p) S.resultado.p = S.prod.get(S.resultado.p.id) || S.resultado.p;
}
function guardarCache() {
  guardar('foto_cache_v1', { quien: claveSesion(), listas: S.listas, productos: [...S.prod.values()], archivo: S.archivo, desde: S.desde, actor: S.actor, puente: S.puente });
}
function cargarCache() {
  const c = leer('foto_cache_v1', true);
  if (!c || c.quien !== claveSesion()) return false;
  S.listas = c.listas || []; S.prod = new Map((c.productos || []).map(p => [p.id, p])); S.desde = c.desde; S.actor = c.actor; S.puente = c.puente; S.archivo = c.archivo || []; construirArchivo();
  reconstruirIndice(); return true;
}
async function cargarDatos(completo) {
  const r = await rpc('foto_datos', { p_token: tok(), p_desde: completo ? null : S.desde });
  if (!r.ok) {
    if (r.error === 'sesion' || r.error === 'permiso') { sesionVencida(); return r; }
    S.enLinea = r.error !== 'red' ? S.enLinea : false; pintarIndicador(); return r;
  }
  S.enLinea = true;
  const cambio = r.completo || (r.productos || []).length > 0 || JSON.stringify(r.listas) !== JSON.stringify(S.listas);
  aplicarDatos(r);
  if (cambio) repintarSuave();
  pintarIndicador();
  return r;
}
async function refrescar() { if (document.hidden || !S.actor) return; await enviarCola(); await cargarDatos(false); }
function iniciarRefresco() {
  clearInterval(S._timer); S._timer = setInterval(refrescar, REFRESCO_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refrescar(); });
}

/* ---------- Drive (puente de Apps Script) ---------- */
function idDeDrive(t) {
  t = String(t || '').trim();
  const m = /\/d\/([\w-]{20,})/.exec(t) || /[?&]id=([\w-]{20,})/.exec(t);
  if (m) return m[1];
  return /^[\w-]{20,}$/.test(t) ? t : '';
}
function base64ABytes(b64) { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
const ERR_PUENTE = { clave: 'La clave del puente no coincide (revísala en Admin → Conexión).', id: 'El link de Drive no es válido.', tipo: 'Ese archivo no es un Excel (.xlsx) ni una hoja de Google.', acceso: 'Tu cuenta de Google no puede abrir ese archivo. Pide que te lo compartan.' };
async function traerDeDrive(lista) {
  if (S.demo) return Demo.excel();
  if (!S.puente || !S.puente.url) throw new Error('Falta conectar el puente de Drive (Admin → Conexión).');
  if (!lista.archivo_id) throw new Error('Esta lista no tiene link de Drive.');
  const u = new URL(S.puente.url); u.searchParams.set('k', S.puente.clave || ''); u.searchParams.set('id', lista.archivo_id);
  let j;
  try { const res = await fetch(u.toString(), { redirect: 'follow' }); j = await res.json(); }
  catch (e) { throw new Error('No pude conectar con el puente de Drive. Revisa internet o el link del puente.'); }
  if (!j || !j.ok) throw new Error(ERR_PUENTE[j && j.error] || 'El puente de Drive respondió con un error.');
  return base64ABytes(j.xlsx);
}
async function sincronizarLista(lista, bytes, silencioso) {
  const hojas = await N.leerXlsx(bytes);
  const r = N.parsearLibro(hojas);
  if (!r.productos.length) throw new Error('No encontré referencias en ese Excel (revisa que tenga columnas como "Ref base" o "Códigos").');
  const s = await rpc('foto_sync', { p_token: tok(), p_lista: lista.id, p_productos: r.productos });
  if (!s.ok) throw new Error(s.error === 'permiso' ? 'No tienes permiso para actualizar listas.' : s.error === 'red' ? 'Sin conexión: intenta de nuevo.' : 'No pude guardar la lista (' + s.error + ').');
  await cargarDatos(false);
  if (!silencioso || s.nuevos || s.quitados) {
    const partes = [`${s.total} referencias`]; if (s.nuevos) partes.push(`${s.nuevos} nuevas`); if (s.quitados) partes.push(`${s.quitados} ya no están`);
    if (s.memoria) partes.push(`${s.memoria} ya subidas en otra colección`);
    toast(`${lista.nombre}: ${partes.join(' · ')}`, 4000);
  }
  if (!silencioso) mostrarCambiosSync(lista, s);
  S.repDatos = {};
  return { s, r };
}
async function autoSincronizar() {
  if (S.modo === 'externo' || S.sincronizando) return;
  if (!S.demo && !(S.puente && S.puente.url)) return;
  const viejas = S.listas.filter(l => l.activa && l.origen === 'drive' && l.archivo_id &&
    (!l.sincronizada_en || Date.now() - new Date(l.sincronizada_en).getTime() > SYNC_DRIVE_MIN * 60000));
  if (viejas.length) {
    S.sincronizando = true; pintarIndicador();
    try { for (const l of viejas) { try { await sincronizarLista(l, await traerDeDrive(l), true); } catch (e) { console.warn('Drive', e); } } }
    finally { S.sincronizando = false; pintarIndicador(); }
  }
  revisarCarpetas(false);
}
async function actualizarTodoDesdeDrive() {
  if (S.sincronizando) return;
  const ls = S.listas.filter(l => l.activa && l.origen === 'drive' && l.archivo_id);
  if (!ls.length) { await cargarDatos(true); toast('Datos al día'); return; }
  S.sincronizando = true; pintarIndicador(); toast('Leyendo el Excel del Drive…', 6000);
  try { for (const l of ls) { try { await sincronizarLista(l, await traerDeDrive(l)); } catch (e) { toast(e.message, 5000); } } }
  finally { S.sincronizando = false; pintarIndicador(); repintarSuave(); }
  guardar('foto_drive_ult', '0'); revisarCarpetas(false);
}

/* ============================================================
   CÁMARA Y LECTOR DE CÓDIGOS
   - Android/Chrome: lector nativo del teléfono (rápido)
   - iPhone y el resto: ZXing (incluido en la app)
   ============================================================ */
const FORMATOS = ['code_128', 'ean_13', 'ean_8', 'code_39', 'upc_a', 'upc_e', 'itf', 'codabar', 'code_93', 'qr_code'];
const Cam = {
  stream: null, video: null, track: null, detector: null, lector: null, canvas: null, activo: false, timer: null,
  pausadoHasta: 0, linterna: false, linternaOn: false, error: '',
  async iniciar(video) {
    this.detener(); this.video = video; this.error = '';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { this.error = 'soporte'; return false; }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
    } catch (e) { this.error = (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) ? 'permiso' : 'camara'; return false; }
    if (!this.video || !this.video.isConnected) { this.detener(); return false; }
    video.srcObject = this.stream; video.setAttribute('playsinline', ''); video.muted = true;
    try { await video.play(); } catch (e) {}
    this.track = this.stream.getVideoTracks()[0];
    let caps = {}; try { caps = this.track.getCapabilities ? this.track.getCapabilities() : {}; } catch (e) {}
    if (caps.focusMode && caps.focusMode.includes('continuous')) this.track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
    this.linterna = !!caps.torch; this.linternaOn = false;
    if (!this.detector && !this.lector) await this.prepararLector();
    this.activo = true; this.ciclo();
    return true;
  },
  async prepararLector() {
    if ('BarcodeDetector' in window && !/[?&]zxing=1/.test(location.search)) {
      try {
        const sop = await window.BarcodeDetector.getSupportedFormats();
        const f = FORMATOS.filter(x => sop.includes(x));
        if (f.length) { this.detector = new window.BarcodeDetector({ formats: f }); return; }
      } catch (e) {}
    }
    if (window.ZXing) {
      const Z = window.ZXing, h = new Map();
      h.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.CODE_128, Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.CODE_39,
        Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E, Z.BarcodeFormat.ITF, Z.BarcodeFormat.CODABAR, Z.BarcodeFormat.CODE_93, Z.BarcodeFormat.QR_CODE]);
      h.set(Z.DecodeHintType.TRY_HARDER, true);
      this.lector = new Z.MultiFormatReader(); this.lector.setHints(h);
      this.canvas = document.createElement('canvas');
    }
  },
  async ciclo() {
    if (!this.activo) return;
    const v = this.video;
    if (v && !document.hidden && v.readyState >= 2 && Date.now() > this.pausadoHasta) {
      try { const c = await this.leer(); if (c && this.activo) alDetectar(c, 'camara'); } catch (e) {}
    }
    this.timer = setTimeout(() => this.ciclo(), this.detector ? 90 : 130);
  },
  async leer() {
    const v = this.video, vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return null;
    if (this.detector) {
      const r = await this.detector.detect(v);
      const x = r && r.find(b => b.rawValue);
      return x ? x.rawValue : null;
    }
    if (!this.lector) return null;
    const rw = Math.round(vw * 0.88), rh = Math.round(vh * 0.62), rx = Math.round((vw - rw) / 2), ry = Math.round((vh - rh) / 2);
    const k = Math.min(1, 1100 / rw), cw = Math.round(rw * k), ch = Math.round(rh * k);
    const cv = this.canvas; if (cv.width !== cw) cv.width = cw; if (cv.height !== ch) cv.height = ch;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(v, rx, ry, rw, rh, 0, 0, cw, ch);
    const Z = window.ZXing;
    try {
      const fuente = new Z.HTMLCanvasElementLuminanceSource(cv);
      return this.lector.decodeWithState(new Z.BinaryBitmap(new Z.HybridBinarizer(fuente))).getText();
    } catch (e) { return null; } finally { try { this.lector.reset(); } catch (e) {} }
  },
  pausar(ms) { this.pausadoHasta = Date.now() + ms; },
  async alternarLinterna() {
    if (!this.track || !this.linterna) return false;
    this.linternaOn = !this.linternaOn;
    try { await this.track.applyConstraints({ advanced: [{ torch: this.linternaOn }] }); } catch (e) { this.linternaOn = false; }
    return this.linternaOn;
  },
  detener() {
    this.activo = false; clearTimeout(this.timer);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null; this.track = null; this.linternaOn = false;
  }
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) Cam.detener();
  else if (S.tab === 'escanear' && S.actor && !S.camPausada) setTimeout(encenderCamara, 150);
});

// Pistola Bluetooth / USB: escribe como teclado muy rápido y termina en Enter
(function () {
  let buf = '', ult = 0;
  document.addEventListener('keydown', e => {
    if (!S.actor || e.target.closest('input,textarea,select')) return;
    const t = performance.now(); if (t - ult > 90) buf = ''; ult = t;
    if (e.key === 'Enter') { if (buf.length >= 4) { e.preventDefault(); alDetectar(buf, 'pistola'); } buf = ''; return; }
    if (e.key.length === 1) buf += e.key;
  });
})();

/* ============================================================
   ESCANEO → RESULTADO
   ============================================================ */
function alDetectar(codigo, origen) {
  const c = N.limpiar(codigo);
  if (c.length < 4) return;
  if (S.ultimo.c === c && Date.now() - S.ultimo.t < 2500) return;
  S.ultimo = { c, t: Date.now() };
  Cam.pausar(1100);
  const b = N.buscar(S.ix, c);
  const r = { codigo: c, tipo: b.tipo, sufijo: b.sufijo, resultados: b.resultados, origen, cuando: ahoraIso() };
  r.p = b.resultados[0] ? b.resultados[0].p : null;
  r.talla = b.resultados[0] ? b.resultados[0].talla : '';
  if (r.p) {
    const ya = N.yaFotografiada(r.p);
    r.ya = ya;
    ya ? Sonido.ya() : Sonido.si();
    encolar('foto_escanear', { p_codigo: c, p_producto: r.p.id });
    if (r.p.estado === 'pendiente') { r.p.estado = 'localizado'; r.p.estado_por = S.actor && S.actor.nombre; r.p.estado_en = ahoraIso(); reconstruirIndice(); }
  } else {
    r.archivo = buscarArchivo(c);
    r.archivo ? Sonido.ya() : Sonido.no();
    encolar('foto_escanear', { p_codigo: c, p_producto: null });
  }
  if (r.p && S.sesionOn && !S.sesion.includes(r.p.id)) { S.sesion.push(r.p.id); guardarSesion(); }
  S.resultado = r;
  S.recientes.unshift({ codigo: c, tipo: r.tipo, id: r.p && r.p.id, archivo: !!r.archivo, cuando: r.cuando });
  S.recientes = S.recientes.slice(0, 25);
  if (S.tab !== 'escanear' && origen !== 'manual') { S.tab = 'escanear'; pintar(); }
  else if (S.tab === 'escanear') { pintarResultado(); pintarRecientes(); pintarEstadoLista(); pintarSesion(); const cam = $('.cam'); if (cam) { cam.classList.remove('leyo'); void cam.offsetWidth; cam.classList.add('leyo'); } }
}

function marcar(p, estado) {
  if (!p || p.estado === estado) return;
  p.estado = estado; p.estado_por = S.actor && S.actor.nombre; p.estado_en = ahoraIso();
  S.prod.set(p.id, p); reconstruirIndice(); guardarCache();
  encolar('foto_marcar', { p_producto: p.id, p_estado: estado });
  toast(`${N.etiquetaEstado(estado)} ✓`);
  repintarSuave();
}

function nombreLista(id) { const l = S.listas.find(x => x.id === id); return l ? l.nombre : ''; }

function tarjetaArchivo(r) {
  const a = r.archivo, l = S.listas.find(x => x.id === a.lista_id) || {}, subida = a.estado === 'subido';
  return `<div class="res warn" role="status" aria-live="polite">
    <div class="res-banda">${ico('alerta')} ${subida ? 'Subida en página · otra colección' : 'Está en otra colección'}</div>
    <div class="res-cuerpo"><p>No está en las colecciones activas. ${subida ? 'Ya se subió a la página en' : 'Aparece en'} <b>${esc(l.nombre || 'otra colección')}${l.mes ? ' · ' + esc(N.nombreMes(l.mes)) : ''}</b> — ${esc(N.etiquetaEstado(a.estado))}.</p>
    <dl class="datos" style="margin-top:10px;"><dt>Escaneado</dt><dd class="mono">${esc(r.codigo)}</dd><dt>Ref. base</dt><dd class="mono">${esc(a.ref)}</dd>${a.serial ? `<dt>Serial</dt><dd class="mono">${esc(a.serial)}</dd>` : ''}</dl></div></div>`;
}
function notaColeccion(p) {
  let h = '';
  if (p.otra) h += p.otra.estado === 'subido'
    ? `<div class="nota-talla">Subida en página en la colección <b>${esc(p.otra.nombre)} · ${esc(N.nombreMes(p.otra.mes))}</b>.</div>`
    : `<div class="nota-talla">También está en la colección <b>${esc(p.otra.nombre)} · ${esc(N.nombreMes(p.otra.mes))}</b> (${esc(N.etiquetaEstado(p.otra.estado).toLowerCase())}).</div>`;
  if (p.arrastrado_de) h += `<div class="nota-talla ok">Viene de ${esc(nombreListaMes(p.arrastrado_de))} (quedó pendiente ese mes).</div>`;
  return h;
}
function tarjetaProducto(r) {
  const p = r.p;
  if (!p && r.archivo) return tarjetaArchivo(r);
  if (!p) {
    return `<div class="res no" role="alert" aria-live="assertive">
      <div class="res-banda">${ico('x')} No está en la lista <small class="mono">${esc(r.codigo)}</small></div>
      <div class="res-cuerpo"><p>Este código no aparece en ${S.listas.filter(l => l.activa).length > 1 ? 'ninguna de las listas activas' : 'la lista de fotografía'}.</p>
      <p class="hint" style="margin-top:6px;">Si la etiqueta está dañada o es un sticker escrito a mano, búscalo por código o serial en <b>Buscar</b>.</p>
      <div class="res-acc" style="margin-top:12px;"><button class="btn sec" data-acc="ir" data-tab="buscar">${ico('buscar')} Buscar a mano</button></div></div></div>`;
  }
  const ya = N.yaFotografiada(p);
  const clase = ya ? 'warn' : 'ok';
  const banda = ya && p.estado === 'subido' && /^Subida en página/.test(p.estado_por || '') ? `${ico('alerta')} Subida en página · otra colección`
    : ya ? `${ico('alerta')} Ya ${N.etiquetaEstado(p.estado).toLowerCase()}` : `${ico('check')} Sí está · fotografiar`;
  let nota = '';
  if (r.tipo === 'exacto') nota = `<div class="nota-talla ok">Talla ${esc(r.talla || '—')} · está en la lista</div>`;
  else if (r.tipo === 'otra_talla') nota = `<div class="nota-talla">Talla distinta a la de la lista (código …${esc(r.sufijo)}). La referencia sí está: sirve para la foto.</div>`;
  else if (r.tipo === 'serial') nota = `<div class="nota-talla ok">Encontrada por serial</div>`;
  else if (r.tipo === 'referencia') nota = `<div class="nota-talla ok">Encontrada por referencia base</div>`;
  const tallas = (p.tallas || []).filter(Boolean);
  const tallasHtml = tallas.length ? `<div class="tallas">${tallas.map(t => `<span class="${r.talla && t === r.talla ? 'esta' : ''}">${esc(t)}</span>`).join('')}</div>` : '—';
  const bods = (p.bodegas || []).slice().sort((a, b) => (N.esTransito(a.b) - N.esTransito(b.b)) || b.n - a.n);
  const bodsHtml = bods.length ? `<div class="bods">${bods.map(x => `<span class="${S.sede && x.b === S.sede ? 'aqui' : ''} ${N.esTransito(x.b) ? 'tran' : ''}">${esc(N.nombreSede(x.b))} · ${x.n}</span>`).join('')}</div>` : '—';
  const extra = Object.entries(p.extra || {});
  const otras = (r.resultados || []).slice(1).map(x => x.p).filter(x => x.lista_id !== p.lista_id || x.id !== p.id);
  const sig = siguientePaso(p.estado);
  return `<div class="res ${clase}" role="status" aria-live="polite">
    <div class="res-banda">${banda}</div>
    <div class="res-cuerpo">
      <div class="res-marca">${esc(p.marca || p.hoja || '')}</div>
      <div class="res-desc">${esc(p.descripcion || 'Sin descripción')}</div>
      ${nota}${notaColeccion(p)}
      <dl class="datos">
        <dt>Escaneado</dt><dd class="mono">${esc(r.codigo || '—')}</dd>
        <dt>Ref. base</dt><dd class="mono">${esc(p.ref_base)}</dd>
        ${p.serial ? `<dt>Serial</dt><dd class="mono">${esc(p.serial)}</dd>` : ''}
        <dt>Tallas</dt><dd>${tallasHtml}</dd>
        <dt>Bodegas</dt><dd>${bodsHtml}</dd>
        ${extra.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
        ${p.drive_archivo ? `<dt>Foto en Drive</dt><dd>${esc(p.drive_archivo)}</dd>` : ''}
      </dl>
      ${(p.alertas || []).length ? `<ul class="alertas">${p.alertas.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
      <div class="pasos" role="group" aria-label="Paso de la foto">${N.ESTADOS.map(([k, l]) => {
        const o = N.ORDEN[k], act = N.ORDEN[p.estado];
        return `<button class="paso ${o < act ? 'hecho' : ''} ${o === act ? 'actual' : ''}" data-acc="marcar" data-id="${esc(p.id)}" data-estado="${k}" aria-pressed="${o === act}"><i></i>${esc(l)}</button>`;
      }).join('')}</div>
      ${sig ? `<div class="res-acc"><button class="btn ok full" data-acc="marcar" data-id="${esc(p.id)}" data-estado="${sig[0]}">${ico('check')} ${esc(sig[1])}</button></div>` : `<div class="nota-talla ok" style="margin:0;">Lista completa: foto subida.</div>`}
      <div class="res-meta">${esc(nombreListaMes(p.lista_id))} · ${p.estado_por ? `último cambio: ${esc(p.estado_por)}, ${esc(haceCuanto(p.estado_en))}` : 'sin cambios todavía'}</div>
      ${otras.length ? `<div class="otras">También aparece en: ${otras.map(o => esc(nombreLista(o.lista_id) + ' · ' + o.ref_base)).join(', ')}</div>` : ''}
    </div></div>`;
}
function siguientePaso(e) {
  return { pendiente: ['fotografiado', 'Ya la fotografié'], localizado: ['fotografiado', 'Ya la fotografié'],
           fotografiado: ['editado', 'Marcar editada'], editado: ['subido', 'Marcar subida'] }[e] || null;
}

/* ============================================================
   PANTALLAS
   ============================================================ */
function contar(arr) {
  const c = { total: arr.length, pendiente: 0, localizado: 0, fotografiado: 0, editado: 0, subido: 0 };
  arr.forEach(p => { c[p.estado] = (c[p.estado] || 0) + 1; });
  c.fot = c.fotografiado + c.editado + c.subido; c.edi = c.editado + c.subido; c.loc = c.localizado + c.fot;
  return c;
}
function barraHtml(c) {
  const pc = n => c.total ? (100 * n / c.total).toFixed(1) + '%' : '0%';
  return `<div class="barra" role="img" aria-label="${c.fot} de ${c.total} fotografiadas, ${c.subido} subidas"><i class="b-loc" style="width:${pc(c.loc)}"></i><i class="b-fot" style="width:${pc(c.fot)}"></i><i class="b-sub" style="width:${pc(c.subido)}"></i></div>`;
}
const pillEstado = e => `<span class="pill e-${esc(e)}">${esc(N.etiquetaEstado(e))}</span>`;

function pintarTop() {
  const t = $('.top'); if (!t) return;
  t.innerHTML = `<div class="marca">${logo(22)}<span class="sub">Scanner foto</span></div>
    <div class="acciones">
      <button class="chip" data-acc="sede" title="Dónde estás">${ico('pin')}<b>${esc(S.sede ? N.nombreSede(S.sede) : 'Sede')}</b></button>
      <button class="icon-btn" id="ind" data-acc="sync" title="Actualizar" aria-label="Actualizar">${ico('sync')}</button>
      <button class="icon-btn" data-acc="tema" aria-label="Cambiar tema">${tema() === 'dark' ? ico('sol') : ico('luna')}</button>
      ${S.modo === 'demo' ? '' : `<button class="icon-btn" data-acc="salir" aria-label="Salir">${ico('salir')}</button>`}
    </div>`;
  pintarIndicador();
}
function pintarIndicador() {
  const b = $('#ind'); if (!b) return;
  const pend = S.cola.length;
  b.querySelector('.dot') && b.querySelector('.dot').remove();
  b.title = !S.enLinea ? `Sin conexión${pend ? ` · ${pend} cambios por enviar` : ''}` : (pend ? `${pend} cambios por enviar` : S.sincronizando ? 'Leyendo el Drive…' : 'Actualizar');
  if (!S.enLinea || pend) { const d = document.createElement('span'); d.className = 'dot' + (!S.enLinea ? ' off' : ''); b.appendChild(d); }
  b.classList.toggle('girando', !!S.sincronizando);
  const q = $('#cola-aviso'); if (q) q.innerHTML = colaTexto();
}
function colaTexto() {
  if (!S.enLinea) return `${ico('nube')} Sin conexión · ${S.cola.length ? S.cola.length + ' cambios se enviarán solos' : 'sigues pudiendo escanear'}`;
  return S.cola.length ? `${S.cola.length} cambios enviándose…` : '';
}

const TABS = [['escanear', 'Escanear', 'scan'], ['buscar', 'Buscar', 'buscar'], ['pendientes', 'Pendientes', 'lista'], ['calendario', 'Calendario', 'cal']];
function pintar() {
  const tabs = S.modo === 'admin' || S.modo === 'demo' ? [...TABS, ['admin', 'Admin', 'admin']] : TABS;
  $('#app').innerHTML = `${S.demo ? '<div class="demo-banda">Modo prueba: datos de ejemplo, nada se guarda. Prueba con el código 149539691785108.</div>' : ''}
    <header class="top"></header><main id="vista"></main>
    <nav class="nav" aria-label="Secciones"><div class="nav-in">${tabs.map(([k, l, i]) => `<button data-acc="ir" data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${ico(i)}<span>${l}</span></button>`).join('')}</div></nav>`;
  pintarTop(); pintarVista();
}
function pintarVista() {
  const v = $('#vista'); if (!v) return;
  if (S.tab !== 'escanear') Cam.detener();
  if (S.tab === 'escanear') vistaEscanear(v);
  else if (S.tab === 'buscar') vistaBuscar(v);
  else if (S.tab === 'pendientes') vistaPendientes(v);
  else if (S.tab === 'calendario') vistaCalendario(v);
  else if (S.tab === 'admin') vistaAdmin(v);
}
let _repintar = null;
function repintarSuave() {          // vuelve a pintar sin tocar la cámara ni lo que se está escribiendo
  clearTimeout(_repintar);
  _repintar = setTimeout(() => {
    if (S.tab === 'escanear') { pintarResultado(); pintarEstadoLista(); pintarRecientes(); pintarSesion(); }
    else if (S.tab === 'buscar') pintarSugerencias();
    else if (S.tab === 'pendientes') pintarPendientes();
    else if (S.tab === 'calendario') { pintarCalendario(); pintarMes(); pintarReporte(false); }
    else if (S.tab === 'admin' && !document.activeElement.closest('input,select')) vistaAdmin($('#vista'));
    if ($('.ov .res')) { const id = $('.ov [data-pid]') && $('.ov [data-pid]').dataset.pid; const p = S.prod.get(id); if (p) $('.ov [data-pid]').innerHTML = tarjetaProducto({ p, codigo: '', tipo: 'manual', resultados: [{ p }] }); }
  }, 60);
}

/* ---------- Escanear ---------- */
function vistaEscanear(v) {
  v.innerHTML = `<div class="cam" id="cam"><video id="video" playsinline muted autoplay></video>
      <div class="mascara"><div class="ventana"></div><div class="linea"></div></div>
      <div class="ayuda">Apunta al código de barras de la etiqueta o de la caja</div>
      <div class="controles"><button id="b-linterna" class="hidden" data-acc="linterna" aria-pressed="false" aria-label="Linterna">${ico('flash')}</button>
      <button data-acc="pausar" aria-label="${S.camPausada ? 'Encender cámara' : 'Pausar cámara'}">${S.camPausada ? ico('play') : ico('pausa')}</button></div>
      <div class="aviso hidden" id="cam-aviso"></div></div>
    <div class="estado-lista" id="estado-lista"></div>
    <div id="instalar"></div>
    <div id="sesion-bar"></div>
    <div class="estado-lista" id="cola-aviso" style="color:var(--warn);"></div>
    <div id="resultado"></div>
    <div id="recientes"></div>`;
  pintarEstadoLista(); pintarInstalar(); pintarSesion(); pintarResultado(); pintarRecientes(); pintarIndicador();
  if (S.camPausada) avisoCamara('pausada'); else encenderCamara();
}
async function encenderCamara() {
  const video = $('#video'); if (!video || S.tab !== 'escanear') return;
  if (Cam.activo && Cam.video === video) return;
  const ok = await Cam.iniciar(video);
  if (!ok) { if (Cam.error) avisoCamara(Cam.error); return; }
  $('#cam-aviso') && $('#cam-aviso').classList.add('hidden');
  const bl = $('#b-linterna'); if (bl) bl.classList.toggle('hidden', !Cam.linterna);
}
function avisoCamara(tipo) {
  const a = $('#cam-aviso'); if (!a) return;
  const txt = {
    permiso: ['Sin permiso para usar la cámara', 'Permite la cámara para este sitio en los ajustes del navegador y vuelve a intentar. Mientras tanto puedes buscar a mano.'],
    soporte: ['Este navegador no abre la cámara', 'Abre la app en Safari (iPhone) o Chrome (Android), desde el link https.'],
    camara: ['No pude abrir la cámara', 'Cierra otras apps que la estén usando y vuelve a intentar.'],
    pausada: ['Cámara en pausa', 'Tócala para seguir escaneando.']
  }[tipo] || ['Cámara no disponible', ''];
  a.innerHTML = `<b>${esc(txt[0])}</b><p>${esc(txt[1])}</p><div class="fila"><button class="btn" data-acc="${tipo === 'pausada' ? 'pausar' : 'reintentar-cam'}">${tipo === 'pausada' ? 'Seguir escaneando' : 'Intentar de nuevo'}</button><button class="btn sec" style="color:#eee;border-color:#666" data-acc="ir" data-tab="buscar">Buscar a mano</button></div>`;
  a.classList.remove('hidden');
}
function pintarEstadoLista() {
  const e = $('#estado-lista'); if (!e) return;
  const activas = S.listas.filter(l => l.activa);
  if (!activas.length) { e.innerHTML = `<span>No hay listas activas. ${S.modo === 'admin' ? 'Agrega una en Admin.' : 'Pídele al admin que conecte una.'}</span>`; return; }
  const c = contar([...S.prod.values()]);
  e.innerHTML = `<b style="color:var(--ink);font-weight:500;flex-basis:100%;">${esc(activas.length === 1 ? activas[0].nombre : activas.length + ' listas activas')}</b>
    <span>${c.total} refs · ${c.fot} fotografiadas · ${c.subido} subidas</span><div class="crece" style="flex-basis:100%;">${barraHtml(c)}</div>`;
}
function pintarResultado() {
  const d = $('#resultado'); if (!d) return;
  if (!S.resultado) { d.innerHTML = ''; return; }
  if (S.resultado.p) S.resultado.p = S.prod.get(S.resultado.p.id) || S.resultado.p;
  d.innerHTML = tarjetaProducto(S.resultado);
}
function pintarRecientes() {
  const d = $('#recientes'); if (!d) return;
  const rs = S.recientes.slice(S.resultado ? 1 : 0, 12);
  if (!rs.length) { d.innerHTML = ''; return; }
  d.innerHTML = `<div class="sec-t">Escaneados recientes</div><div class="items recientes">${rs.map(x => {
    const p = x.id && S.prod.get(x.id);
    const cls = !p ? (x.archivo ? 'warn' : 'no') : N.yaFotografiada(p) ? 'warn' : 'ok';
    return `<button class="item" ${p ? `data-acc="ver" data-id="${esc(p.id)}"` : ''}><span class="marcador ${cls}"></span><span class="crece">
      <span class="t">${p ? esc(p.descripcion || p.ref_base) : x.archivo ? 'Está en otra colección' : 'No está en la lista'}</span><span class="s mono">${esc(x.codigo)} · ${esc(haceCuanto(x.cuando))}</span></span>${p ? pillEstado(p.estado) : ''}</button>`;
  }).join('')}</div>`;
}

/* ---------- Instalar en el celular ---------- */
const esApp = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function pintarInstalar() {
  const d = $('#instalar'); if (!d) return;
  if (esApp() || leer('foto_instalar_no')) { d.innerHTML = ''; return; }
  const icono = '<img src="icon-192.png" alt="">';
  if (window.__pwa && window.__pwa.prompt) {
    d.innerHTML = `<div class="instalar">${icono}<span class="crece"><b>Instálalo en este celular</b><br><span class="hint">Queda como app con su ícono y abre directo en la cámara.</span></span>
      <button class="btn peq" data-acc="instalar">Instalar</button><button class="icon-btn" data-acc="instalar-no" aria-label="Ahora no">${ico('x')}</button></div>`;
  } else if (esIOS()) {
    d.innerHTML = `<div class="instalar">${icono}<span class="crece"><b>Tenlo como app en el iPhone</b><br><span class="hint">Toca <b>Compartir</b> (el cuadro con la flecha) → <b>Agregar a inicio</b>.</span></span>
      <button class="icon-btn" data-acc="instalar-no" aria-label="Entendido">${ico('x')}</button></div>`;
  } else d.innerHTML = '';
}
window.addEventListener('pwa-lista', () => pintarInstalar());

/* ---------- Sesión de fotos en lote ---------- */
function cargarSesion() { const s = leer('foto_sesion_v1', true) || {}; S.sesionOn = !!s.on; S.sesion = Array.isArray(s.ids) ? s.ids : []; }
function guardarSesion() { guardar('foto_sesion_v1', { on: S.sesionOn, ids: S.sesion }); pintarSesion(); }
function pintarSesion() {
  const d = $('#sesion-bar'); if (!d) return;
  if (!S.sesionOn) { d.innerHTML = `<button class="chip" data-acc="sesion-on" style="margin-top:10px;">${ico('lista')} Sesión de fotos: marcar varias de una vez</button>`; return; }
  const n = S.sesion.filter(id => S.prod.has(id)).length;
  d.innerHTML = `<div class="sesion"><span class="crece"><b>Sesión de fotos</b> · ${n} escaneada${n === 1 ? '' : 's'}</span>
    <button class="btn ok peq" data-acc="sesion-ver" ${n ? '' : 'disabled'}>Marcar…</button><button class="btn sec peq" data-acc="sesion-off">Terminar</button></div>`;
}
function abrirSesion() {
  const ps = S.sesion.map(id => S.prod.get(id)).filter(Boolean);
  if (!ps.length) return toast('Escanea referencias para agregarlas a la sesión');
  hoja(`<h3>Sesión de fotos · ${ps.length}</h3><p class="hint" style="margin-bottom:10px;">Quita las que no alcanzaste y marca el resto con un toque.</p>
    ${ps.map(p => `<label class="opcion-chk"><input type="checkbox" checked data-sid="${esc(p.id)}"><span class="crece"><b style="font-weight:500;">${esc(p.descripcion || p.ref_base)}</b><br><span class="hint">${esc(p.ref_base)} · ${esc(N.etiquetaEstado(p.estado))}</span></span></label>`).join('')}
    <div class="sec-t">Marcar las seleccionadas como</div>
    <div class="fila"><button class="btn ok" data-acc="lote" data-estado="fotografiado">Fotografiadas</button><button class="btn sec" data-acc="lote" data-estado="editado">Editadas</button><button class="btn sec" data-acc="lote" data-estado="subido">Subidas</button></div>`);
}
function marcarLote(ids, estado) {
  ids.forEach(id => { const p = S.prod.get(id); if (p) { p.estado = estado; p.estado_por = S.actor && S.actor.nombre; p.estado_en = ahoraIso(); } });
  reconstruirIndice(); guardarCache();
  encolar('foto_marcar_lote', { p_productos: ids, p_estado: estado });
  S.sesion = S.sesion.filter(id => !ids.includes(id)); guardarSesion();
  toast(`${ids.length} marcada${ids.length === 1 ? '' : 's'} como ${N.etiquetaEstado(estado)}`);
  repintarSuave();
}

/* ---------- Buscar ---------- */
function vistaBuscar(v) {
  v.innerHTML = `<h2 class="titulo">Buscar a mano</h2>
    <p class="hint" style="margin-bottom:10px;">Para stickers escritos a mano o etiquetas dañadas: escribe el código, la referencia o el serial. Con 5 o 6 dígitos ya aparece.</p>
    <form class="buscador" id="f-buscar" autocomplete="off"><input class="inp" id="q" value="${esc(S.buscar)}" inputmode="${S.tecladoTexto ? 'text' : 'numeric'}" autocapitalize="characters" spellcheck="false" placeholder="Código, referencia o serial" aria-label="Código, referencia o serial">
      <div class="lado"><button type="button" data-acc="teclado">${S.tecladoTexto ? '123' : 'ABC'}</button><button type="submit" aria-label="Buscar">${ico('buscar')}</button></div></form>
    <div id="sug" style="margin-top:12px;"></div>`;
  const q = $('#q');
  q.addEventListener('input', () => { S.buscar = q.value; pintarSugerencias(); });
  $('#f-buscar').addEventListener('submit', e => {
    e.preventDefault(); const t = q.value.trim(); if (!t) return;
    const b = N.buscar(S.ix, t);
    if (b.tipo !== 'ninguno') { S.ultimo = { c: '', t: 0 }; alDetectar(t, 'manual'); abrirProducto(b.resultados[0].p, { codigo: N.limpiar(t), tipo: b.tipo, talla: b.resultados[0].talla, sufijo: b.sufijo, resultados: b.resultados }); }
    else {
      const ar = buscarArchivo(N.limpiar(t));
      if (ar) { S.ultimo = { c: '', t: 0 }; alDetectar(t, 'manual'); hoja(tarjetaArchivo({ codigo: N.limpiar(t), archivo: ar })); }
      else pintarSugerencias(true);
    }
  });
  pintarSugerencias();
  setTimeout(() => q.focus(), 50);
}
function pintarSugerencias(sinExacto) {
  const d = $('#sug'); if (!d) return;
  const t = S.buscar.trim();
  if (t.length < 2) { d.innerHTML = `<div class="vacio">Escribe al menos 2 caracteres.</div>`; return; }
  const arr = N.sugerir(S.ix, t, 30);
  d.innerHTML = (sinExacto ? `<div class="res no" style="margin:0 0 10px;"><div class="res-banda">${ico('x')} No está en la lista</div></div>` : '') +
    (arr.length ? `<div class="items">${arr.map(itemHtml).join('')}</div>` : `<div class="vacio">Nada coincide con “${esc(t)}”.</div>`);
}
function itemHtml(p, extra) {
  const tallas = (p.tallas || []).filter(Boolean).join(', ');
  return `<button class="item" data-acc="ver" data-id="${esc(p.id)}"><span class="crece"><span class="t">${esc(p.descripcion || p.ref_base)}</span>
    <span class="s"><span class="mono">${esc(p.ref_base)}</span>${p.serial ? ' · ' + esc(p.serial) : ''}${tallas ? ' · T ' + esc(tallas) : ''}</span>
    <span class="s">${esc(p.marca || '')}${extra || ''}${p.otra ? ` · <span class="pill alerta">${p.otra.estado === 'subido' ? 'subida en otra colección' : 'en otra colección'}</span>` : ''}${p.arrastrado_de ? ' · <span class="pill">viene de otro mes</span>' : ''}${(p.alertas || []).length ? ' · <span class="pill alerta">revisar datos</span>' : ''}</span></span>${pillEstado(p.estado)}</button>`;
}
function abrirProducto(p, r) {
  const ov = document.createElement('div'); ov.className = 'ov';
  const res = Object.assign({ p, codigo: '', tipo: 'manual', resultados: [{ p }] }, r || {});
  ov.innerHTML = `<div class="hoja" role="dialog" aria-modal="true" aria-label="Referencia"><button class="icon-btn cerrar" data-acc="cerrar" aria-label="Cerrar">${ico('x')}</button><div style="clear:both;"></div><div data-pid="${esc(p.id)}">${tarjetaProducto(res)}</div></div>`;
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
}

/* ---------- Pendientes por tienda ---------- */
function sedesDisponibles() {
  const m = new Map();
  for (const p of S.prod.values()) (p.bodegas || []).forEach(b => { m.set(b.b, (m.get(b.b) || 0) + 1); });
  return [...m.entries()].sort((a, b) => N.esTransito(a[0]) - N.esTransito(b[0]) || b[1] - a[1]).map(x => x[0]);
}
function vistaPendientes(v) {
  if (S.filtros.sede === '' && S.sede && !S._filtroTocado) S.filtros.sede = S.sede;
  const marcas = [...new Set([...S.prod.values()].map(p => p.marca || p.hoja))].sort();
  const sedes = sedesDisponibles();
  const listas = S.listas.filter(l => l.activa);
  v.innerHTML = `<h2 class="titulo">Pendientes por tienda</h2>
    <div class="filtros">
      <select id="fl-sede" aria-label="Tienda o bodega"><option value="*">Todas las tiendas</option>${sedes.map(s => `<option value="${esc(s)}" ${S.filtros.sede === s ? 'selected' : ''}>${esc(N.nombreSede(s))}${N.esTransito(s) ? ' (tránsito)' : ''}</option>`).join('')}</select>
      <select id="fl-estado" aria-label="Estado"><option value="falta" ${S.filtros.estado === 'falta' ? 'selected' : ''}>Por fotografiar</option>${N.ESTADOS.map(([k, l]) => `<option value="${k}" ${S.filtros.estado === k ? 'selected' : ''}>${l}</option>`).join('')}<option value="*" ${S.filtros.estado === '*' ? 'selected' : ''}>Todos los estados</option></select>
      <select id="fl-marca" aria-label="Marca"><option value="">Todas las marcas</option>${marcas.map(m => `<option ${S.filtros.marca === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select>
      ${listas.length > 1 ? `<select id="fl-lista" aria-label="Lista"><option value="">Todas las listas</option>${listas.map(l => `<option value="${esc(l.id)}" ${S.filtros.lista === l.id ? 'selected' : ''}>${esc(l.nombre)}</option>`).join('')}</select>` : ''}
    </div><div id="pend"></div>`;
  ['sede', 'estado', 'marca', 'lista'].forEach(k => { const s = $('#fl-' + k); if (s) s.addEventListener('change', () => { S.filtros[k] = s.value === '*' && k === 'sede' ? '*' : s.value; if (k === 'sede') S._filtroTocado = true; pintarPendientes(); }); });
  pintarPendientes();
}
function pintarPendientes() {
  const d = $('#pend'); if (!d) return;
  const f = S.filtros;
  let arr = [...S.prod.values()];
  if (f.sede && f.sede !== '*') arr = arr.filter(p => (p.bodegas || []).some(b => b.b === f.sede));
  if (f.estado === 'falta') arr = arr.filter(p => !N.yaFotografiada(p)); else if (f.estado && f.estado !== '*') arr = arr.filter(p => p.estado === f.estado);
  if (f.marca) arr = arr.filter(p => (p.marca || p.hoja) === f.marca);
  if (f.lista) arr = arr.filter(p => p.lista_id === f.lista);
  if (!arr.length) { d.innerHTML = `<div class="vacio">${f.estado === 'falta' ? 'No queda nada por fotografiar aquí.' : 'No hay referencias con ese filtro.'}</div>`; return; }
  const grupos = new Map();
  arr.sort((a, b) => String(a.descripcion).localeCompare(String(b.descripcion))).forEach(p => { const k = p.marca || p.hoja || '—'; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(p); });
  const sede = f.sede && f.sede !== '*' ? f.sede : '';
  d.innerHTML = `<p class="hint">${arr.length} referencia${arr.length === 1 ? '' : 's'}${sede ? ' con unidades en ' + esc(N.nombreSede(sede)) : ''}.</p>` +
    [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([m, ps]) => `<div class="grupo-t"><span>${esc(m)}</span><span>${ps.length}</span></div><div class="items">${ps.map(p => {
      const u = sede ? ((p.bodegas || []).find(b => b.b === sede) || {}).n : null;
      return itemHtml(p, u ? ` · <b>${u} und. aquí</b>` : '');
    }).join('')}</div>`).join('');
}

/* ---------- Calendario: colecciones por mes + reporte ---------- */
const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function mesHoy() { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).slice(0, 7) + '-01'; }
const mesClave = m => String(m || '').slice(0, 7);                   // 'AAAA-MM'
function listasDelMes(clave) { return S.listas.filter(l => mesClave(l.mes) === clave); }
function nombreListaMes(id) { const l = S.listas.find(x => x.id === id); return l ? `${l.nombre} · ${N.nombreMes(l.mes)}` : 'otro mes'; }
function cuentasLista(l) {          // activa: con los datos del teléfono · archivada: lo que dice el servidor
  if (l.activa) { const arr = [...S.prod.values()].filter(p => p.lista_id === l.id); if (arr.length || !S.progreso[l.id]) return contar(arr); }
  const x = S.progreso[l.id]; if (!x) return contar([]);
  const c = { total: x.total || 0, pendiente: x.pendiente || 0, localizado: x.localizado || 0, fotografiado: x.fotografiado || 0, editado: x.editado || 0, subido: x.subido || 0 };
  c.fot = c.fotografiado + c.editado + c.subido; c.edi = c.editado + c.subido; c.loc = c.localizado + c.fot;
  return c;
}
async function traerProgreso() {
  if (!S.listas.length) return;
  const r = await rpc('foto_progreso', { p_tareas: null, p_listas: S.listas.map(l => l.id) });
  if (Array.isArray(r)) r.forEach(x => { S.progreso[x.lista_id] = x; });
}
function hoja(html) {
  const ov = document.createElement('div'); ov.className = 'ov';
  ov.innerHTML = `<div class="hoja" role="dialog" aria-modal="true"><button class="icon-btn cerrar" data-acc="cerrar" aria-label="Cerrar">${ico('x')}</button>${html}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov); return ov;
}

function vistaCalendario(v) {
  if (!S.calMes) { const act = S.listas.find(l => l.activa); S.calMes = mesClave(act ? act.mes : mesHoy()); }
  if (!S.calAnio) S.calAnio = Number(S.calMes.slice(0, 4));
  v.innerHTML = `<div class="fila entre"><h2 class="titulo">Calendario</h2>
      <div class="fila"><button class="icon-btn" data-acc="anio" data-d="-1" aria-label="Año anterior">‹</button><b style="font-weight:500;min-width:48px;text-align:center;">${S.calAnio}</b><button class="icon-btn" data-acc="anio" data-d="1" aria-label="Año siguiente">›</button></div></div>
    <div class="cal" id="cal"></div><div id="mes-panel"></div><div id="mes-form"></div><div id="rep"></div>`;
  pintarCalendario(); pintarMes(); pintarFormMes(); pintarReporte(true);
  traerProgreso().then(() => { if (S.tab === 'calendario') { pintarCalendario(); pintarMes(); pintarReporte(false); } });
}
function pintarCalendario() {
  const d = $('#cal'); if (!d) return;
  const hoy = mesClave(mesHoy());
  d.innerHTML = MES_CORTO.map((m, i) => {
    const clave = `${S.calAnio}-${String(i + 1).padStart(2, '0')}`;
    const ls = listasDelMes(clave);
    const c = ls.reduce((a, l) => { const k = cuentasLista(l); a.total += k.total; a.fot += k.fot; a.subido += k.subido; a.loc += k.loc; return a; }, { total: 0, fot: 0, subido: 0, loc: 0 });
    return `<button class="cal-mes ${clave === S.calMes ? 'sel' : ''} ${clave === hoy ? 'hoy' : ''} ${ls.length ? '' : 'vacio-mes'}" data-acc="cal-mes" data-mes="${clave}" aria-pressed="${clave === S.calMes}">
      <span class="cal-n">${m}</span>${ls.length ? `<span class="cal-d">${ls.length} colec. · ${c.total} refs</span>${barraHtml(c)}<span class="cal-p">${c.total ? Math.round(100 * c.subido / c.total) : 0}% subidas</span>` : `<span class="cal-d">${clave === hoy ? 'Mes actual' : 'Sin Excel'}</span>`}</button>`;
  }).join('');
}
function pintarMes() {
  const d = $('#mes-panel'); if (!d) return;
  const ls = listasDelMes(S.calMes);
  const titulo = N.nombreMes(S.calMes + '-01');
  if (ls.length && !ls.some(l => l.id === S.reporteLista)) S.reporteLista = (ls.find(l => l.activa) || ls[0]).id;
  if (!ls.length) S.reporteLista = '';
  d.innerHTML = `<div class="sec-t">${esc(titulo)}</div>` + (ls.length ? `<div class="items">${ls.map(l => {
    const c = cuentasLista(l), x = S.progreso[l.id] || {};
    return `<div class="panel col ${l.id === S.reporteLista ? 'sel' : ''}">
      <div class="fila entre"><b style="font-weight:500;">${esc(l.nombre)}</b>${l.activa ? '<span class="pill e-fotografiado">Activa</span>' : '<span class="pill">Archivada</span>'}</div>
      <p class="hint" style="margin:4px 0 8px;">${c.total} refs · ${c.fot} fotografiadas · ${c.subido} subidas${x.arrastrados ? ` · ${x.arrastrados} vienen de otro mes` : ''}${x.otra ? ` · ${x.otra} también en otra colección` : ''}</p>
      ${barraHtml(c)}
      <div class="fila" style="margin-top:10px;"><button class="btn sec peq" data-acc="ver-col" data-id="${esc(l.id)}">Ver reporte</button>
        <button class="btn sec peq" data-acc="cambios" data-id="${esc(l.id)}">Qué cambió en el Excel</button></div></div>`;
  }).join('')}</div>` : `<div class="vacio">No hay Excel en ${esc(titulo)}.${S.modo === 'admin' || S.modo === 'demo' ? ' Agrégalo aquí abajo.' : ''}</div>`);
}
function pintarFormMes() {
  const d = $('#mes-form'); if (!d) return;
  if (S.modo !== 'admin' && S.modo !== 'demo') { d.innerHTML = ''; return; }
  const titulo = N.nombreMes(S.calMes + '-01');
  d.innerHTML = `<div class="panel" style="margin-top:12px;"><b style="font-weight:500;">Agregar Excel a ${esc(titulo)}</b>
    <p class="hint" style="margin:4px 0 12px;">Crea la colección del mes y su tarea “Fotografía · ${esc(titulo)}” en Equipo Creativo, con entrega el último día del mes.</p>
    <div class="campo"><label for="nl-nombre">Nombre de la colección</label><input id="nl-nombre" placeholder="Ej. Dackel, Executive, Navidad…"></div>
    <div class="campo"><label for="nl-link">Link del Excel en Drive</label><input id="nl-link" placeholder="https://docs.google.com/spreadsheets/d/…"></div>
    <div class="fila"><button class="btn" data-acc="lista-crear">Conectar desde Drive</button><button class="btn sec" data-acc="lista-crear-archivo">${ico('subir')} Subir Excel</button></div>
    <div class="error" id="nl-error"></div>
    <input type="file" id="archivo" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hidden"></div>`;
}

async function pintarReporte(traer) {
  const d = $('#rep'); if (!d) return;
  const l = S.listas.find(x => x.id === S.reporteLista);
  if (!l) { d.innerHTML = ''; return; }
  const local = l.activa && [...S.prod.values()].some(p => p.lista_id === l.id);
  const arr = local ? [...S.prod.values()].filter(p => p.lista_id === l.id) : [];
  const c = cuentasLista(l), x = S.progreso[l.id] || {};
  let marcas = [];
  if (local) {
    const m = new Map(); arr.forEach(p => { const k = p.marca || p.hoja || '—'; if (!m.has(k)) m.set(k, []); m.get(k).push(p); });
    marcas = [...m.entries()].map(([marca, ps]) => { const k = contar(ps); return { marca, total: k.total, fot: k.fot, edi: k.edi, sub: k.subido }; });
  } else marcas = (x.marcas || []).map(m => ({ marca: m.marca, total: m.total, fot: m.fotografiadas, edi: m.editadas, sub: m.subidas }));
  marcas.sort((a, b) => String(a.marca).localeCompare(String(b.marca)));
  const alertas = arr.filter(p => (p.alertas || []).length).length;
  const pct = n => c.total ? Math.round(100 * n / c.total) + '%' : '0%';
  d.innerHTML = `<div class="sec-t">Reporte · ${esc(l.nombre)} · ${esc(N.nombreMes(l.mes))}</div>
    <div class="panel">
      <div class="fila entre"><span class="hint">Excel leído ${esc(haceCuanto(l.sincronizada_en))}</span>
        <span class="fila">${S.modo !== 'externo' && l.archivo_id && l.activa ? `<button class="btn sec peq" data-acc="sync-drive">${ico('sync')} Leer del Drive</button>` : ''}
        ${local ? `<button class="btn peq" data-acc="exportar">${ico('descargar')} Excel</button>` : ''}</span></div>
      <div class="kpis">
        <div class="kpi"><b>${c.loc}</b><span>Localizadas · ${pct(c.loc)}</span></div>
        <div class="kpi"><b>${c.fot}</b><span>Fotografiadas · ${pct(c.fot)}</span></div>
        <div class="kpi"><b>${c.edi}</b><span>Editadas · ${pct(c.edi)}</span></div>
        <div class="kpi"><b>${c.subido}</b><span>Subidas · ${pct(c.subido)}</span></div>
      </div>${barraHtml(c)}
      <p class="hint" style="margin-top:8px;">${c.total} referencias · faltan ${c.total - c.fot} por fotografiar${alertas ? ` · <span class="pill alerta">${alertas} con datos por revisar</span>` : ''}${!l.activa ? ' · colección archivada' : ''}</p>
    </div>
    <div class="sec-t">Por marca</div>
    <div class="panel" style="padding:6px 12px;overflow-x:auto;"><table class="tabla"><thead><tr><th>Marca</th><th class="n">Refs</th><th class="n">Fotog.</th><th class="n">Editadas</th><th class="n">Subidas</th></tr></thead><tbody>
      ${marcas.map(m => `<tr><td>${esc(m.marca)}</td><td class="n">${m.total}</td><td class="n">${m.fot}</td><td class="n">${m.edi}</td><td class="n">${m.sub}</td></tr>`).join('') || '<tr><td colspan="5" class="hint">Sin datos</td></tr>'}
    </tbody></table></div>
    <div class="sec-t">Quién ha fotografiado</div><div class="panel" id="rp-personas"><p class="hint">Cargando…</p></div>
    <div class="sec-t">Tiempos y ritmo</div><div class="panel" id="rp-metricas"><p class="hint">Cargando…</p></div>
    <div class="sec-t">Historial</div><div class="panel" id="rp-hist" style="padding:4px 14px;"><p class="hint" style="padding:10px 0;">Cargando…</p></div>`;
  const cache = S.repDatos[l.id];
  if (traer || !cache) {
    const [pr, hi, me] = await Promise.all([
      rpc('foto_progreso', { p_tareas: null, p_listas: [l.id] }),
      rpc('foto_historial', { p_token: tok(), p_lista: l.id, p_limite: 60 }),
      rpc('foto_metricas', { p_token: tok(), p_listas: [l.id], p_dias: 56 })]);
    if (Array.isArray(pr) && pr[0]) S.progreso[l.id] = pr[0];
    S.repDatos[l.id] = { pr, hi, me };
    if (S.reporteLista !== l.id) return;
  }
  const { pr, hi, me } = S.repDatos[l.id];
  const dp = $('#rp-personas'), dh = $('#rp-hist'), dm = $('#rp-metricas');
  if (dp) {
    const per = Array.isArray(pr) && pr[0] ? pr[0].personas : [];
    dp.innerHTML = per.length ? `<table class="tabla"><tbody>${per.map(p => `<tr><td>${esc(p.nombre)}</td><td class="n">${p.fotos} foto${p.fotos === 1 ? '' : 's'}</td></tr>`).join('')}</tbody></table>` : `<p class="hint">Todavía nadie marca fotos en esta colección.</p>`;
  }
  if (dm) dm.innerHTML = metricasHtml(me);
  if (dh) {
    const ev = hi && hi.ok ? hi.eventos : [];
    dh.innerHTML = ev.length ? ev.map(e => {
      const que = e.accion === 'estado' ? `${esc(e.actor_nombre)} marcó <b>${esc(N.etiquetaEstado(e.estado_nuevo))}</b>` : e.accion === 'escaneo' ? `${esc(e.actor_nombre)} escaneó` : `${esc(e.actor_nombre)} escaneó un código que no está`;
      return `<div class="evento"><span class="cuando">${esc(haceCuanto(e.creado_en))}</span><span class="crece">${que} · ${esc(e.descripcion || e.codigo || e.ref_base || '')}${e.sede ? ` <span class="hint">· ${esc(N.nombreSede(e.sede))}</span>` : ''}</span></div>`;
    }).join('') : `<p class="hint" style="padding:10px 0;">Sin movimientos todavía.</p>`;
  }
}
function metricasHtml(m) {
  if (!m || !m.ok) return '<p class="hint">Sin datos todavía.</p>';
  const t = m.tiempos || {};
  const dur = v => v == null ? '—' : Number(v) < 1 ? `${Math.max(1, Math.round(Number(v) * 24))} h` : `${String(Math.round(Number(v) * 10) / 10).replace('.', ',')} días`;
  const sem = m.semanas || [];
  const semanas = [...new Set(sem.map(s => s.semana))].sort().slice(-4);
  const personas = [...new Set(sem.filter(s => semanas.includes(s.semana)).map(s => s.nombre))].sort();
  const val = (n, s) => (sem.find(x => x.nombre === n && x.semana === s) || {}).fotos || 0;
  const fSem = s => { const d = new Date(s + 'T12:00:00'); return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }); };
  const dias = []; const hoy = new Date();
  for (let i = 29; i >= 0; i--) { const d = new Date(hoy.getTime() - i * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); dias.push(d); }
  const porDia = new Map((m.dias || []).map(x => [x.dia, x.fotografiadas || 0]));
  const max = Math.max(1, ...dias.map(d => porDia.get(d) || 0));
  const totalMes = dias.reduce((s, d) => s + (porDia.get(d) || 0), 0);
  return `<div class="kpis k3">
      <div class="kpi"><b>${dur(t.loc_fot)}</b><span>De localizada a fotografiada</span></div>
      <div class="kpi"><b>${dur(t.fot_sub)}</b><span>De fotografiada a subida</span></div>
      <div class="kpi"><b>${dur(t.loc_sub)}</b><span>Del escaneo a la página</span></div></div>
    <p class="hint">Medianas con ${t.n_fot || 0} fotografiadas y ${t.n_sub || 0} subidas.</p>
    ${personas.length ? `<div style="overflow-x:auto;margin-top:10px;"><table class="tabla"><thead><tr><th>Fotos por semana</th>${semanas.map(s => `<th class="n">${esc(fSem(s))}</th>`).join('')}</tr></thead><tbody>
      ${personas.map(n => `<tr><td>${esc(n)}</td>${semanas.map(s => `<td class="n">${val(n, s) || '·'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
    <div class="fila entre" style="margin-top:12px;"><span class="hint">Fotografiadas por día · últimos 30 días</span><span class="hint">${totalMes} en total</span></div>
    <div class="ritmo" role="img" aria-label="${totalMes} referencias fotografiadas en los últimos 30 días">${dias.map(d => `<i style="height:${Math.round(100 * (porDia.get(d) || 0) / max)}%" title="${esc(d)}: ${porDia.get(d) || 0}"></i>`).join('')}</div>`;
}

/* ---------- Qué cambió en el Excel ---------- */
const listaRefs = arr => `<ul class="refs">${arr.map(x => `<li><span class="mono">${esc(x.ref)}</span> · ${esc(x.desc || '')} <span class="hint">${esc(x.marca || '')}</span></li>`).join('')}</ul>`;
async function abrirCambios(id) {
  const l = S.listas.find(x => x.id === id); if (!l) return;
  const ov = hoja(`<h3>Qué cambió · ${esc(l.nombre)}</h3><p class="hint" style="margin-bottom:8px;">${esc(N.nombreMes(l.mes))} · cada vez que el Excel trae algo distinto queda aquí.</p><div id="cambios-c"><p class="hint">Cargando…</p></div>`);
  const r = await rpc('foto_versiones_listar', { p_token: tok(), p_lista: id });
  const c = $('#cambios-c', ov); if (!c) return;
  const vs = r && r.ok ? r.versiones : [];
  c.innerHTML = vs.length ? vs.map(v => `<div class="evento"><span class="cuando">${esc(horaCO(v.creado_en))}</span><span class="crece">
      ${v.nota ? esc(v.nota) : v.primera ? `Primera lectura: ${v.total} referencias` : `<b>+${(v.nuevos || []).length}</b> nuevas · <b>−${(v.quitados || []).length}</b> ya no están`}${v.por ? ` <span class="hint">· ${esc(v.por)}</span>` : ''}
      ${(v.nuevos || []).length ? `<details><summary>Nuevas (${v.nuevos.length})</summary>${listaRefs(v.nuevos)}</details>` : ''}
      ${(v.quitados || []).length ? `<details><summary>Ya no están (${v.quitados.length})</summary>${listaRefs(v.quitados)}</details>` : ''}</span></div>`).join('')
    : '<p class="hint">Todavía no hay cambios registrados.</p>';
}
function mostrarCambiosSync(lista, s) {
  const nv = s.lista_nuevos || [], qt = s.lista_quitados || [];
  if (!nv.length && !qt.length) return;
  hoja(`<h3>El Excel cambió · ${esc(lista.nombre)}</h3><p class="hint" style="margin-bottom:10px;">${esc(N.nombreMes(lista.mes))} · el avance de lo que ya estaba no se pierde.</p>
    ${nv.length ? `<div class="sec-t">Nuevas (${nv.length})</div>${listaRefs(nv)}` : ''}${qt.length ? `<div class="sec-t">Ya no están (${qt.length})</div>${listaRefs(qt)}` : ''}
    <button class="btn full" style="margin-top:14px;" data-acc="cerrar">Listo</button>`);
}

/* ---------- Pendientes de meses anteriores: se pregunta cada vez ---------- */
function preguntarArrastre(nueva) {
  const viejas = S.listas.filter(l => l.activa && l.id !== nueva.id && mesClave(l.mes) < mesClave(nueva.mes))
    .map(l => ({ l, n: [...S.prod.values()].filter(p => p.lista_id === l.id && p.estado !== 'subido').length })).filter(x => x.n > 0);
  if (!viejas.length) return;
  hoja(`<h3>Pendientes de meses anteriores</h3>
    <p class="hint" style="margin-bottom:10px;">Quedaron referencias sin subir. ¿Las pasas a ${esc(N.nombreMes(nueva.mes))}? Conservan su paso (si ya estaban fotografiadas, siguen así).</p>
    ${viejas.map(x => `<label class="opcion-chk"><input type="checkbox" checked data-origen="${esc(x.l.id)}"><span>${esc(x.l.nombre)} · ${esc(N.nombreMes(x.l.mes))} — <b>${x.n}</b> sin subir</span></label>`).join('')}
    <label class="opcion-chk"><input type="checkbox" id="arch" checked><span>Archivar los meses que queden sin pendientes</span></label>
    <div class="fila" style="margin-top:12px;"><button class="btn" data-acc="pasar-ok" data-destino="${esc(nueva.id)}">Pasar a ${esc(N.nombreMes(nueva.mes))}</button><button class="btn sec" data-acc="cerrar">Dejarlos en su mes</button></div>`);
}
async function pasarPendientes(el) {
  const ov = el.closest('.ov'); const destino = el.dataset.destino;
  const origenes = $$('input[data-origen]', ov).filter(i => i.checked).map(i => i.dataset.origen);
  const archivar = $('#arch', ov).checked;
  if (!origenes.length) { ov.remove(); return; }
  el.disabled = true; el.textContent = 'Pasando…';
  let total = 0;
  for (const o of origenes) {
    const r = S.demo ? Demo.pasar(o, destino, archivar) : await rpc('foto_pasar_pendientes', { p_origen: o, p_destino: destino, p_archivar: archivar });
    if (r.ok) total += r.pasados; else toast('No pude pasar los pendientes (' + r.error + ')', 5000);
  }
  ov.remove(); await cargarDatos(true); await traerProgreso();
  toast(`${total} referencia${total === 1 ? '' : 's'} pasaron a ${N.nombreMes((S.listas.find(l => l.id === destino) || {}).mes)}`, 4000);
  pintarVista();
}

function exportar() {
  const l = S.listas.find(x => x.id === S.reporteLista) || S.listas.find(x => x.activa);
  if (!l) return toast('No hay colección para exportar');
  const arr = [...S.prod.values()].filter(p => p.lista_id === l.id).sort((a, b) => String(a.hoja).localeCompare(String(b.hoja)) || (a.fila || 0) - (b.fila || 0));
  if (!arr.length) return toast('Activa la colección para exportarla');
  const filas = [['Hoja', 'Marca', 'Ref base', 'Serial', 'Códigos', 'Tallas', 'Descripción', 'Bodegas', 'Cantidad', 'Estado foto', 'Fotografiada', 'Subida', 'Último cambio por', 'Fecha último cambio', 'Otra colección', 'Viene de', 'Foto en Drive', 'Revisar datos']];
  arr.forEach(p => filas.push([p.hoja || '', p.marca || '', p.ref_base, p.serial || '', (p.codigos || []).join(', '), (p.tallas || []).join(', '), p.descripcion || '',
    (p.bodegas || []).map(b => `${b.b} (${b.n})`).join(', '), p.cantidad == null ? '' : Number(p.cantidad), N.etiquetaEstado(p.estado),
    N.yaFotografiada(p) ? 'SÍ' : 'NO', p.estado === 'subido' ? 'SÍ' : 'NO', p.estado_por || '', p.estado_en ? horaCO(p.estado_en) : '',
    p.otra ? `${p.otra.nombre} · ${N.nombreMes(p.otra.mes)} (${N.etiquetaEstado(p.otra.estado)})` : '', p.arrastrado_de ? nombreListaMes(p.arrastrado_de) : '',
    p.drive_archivo || '', (p.alertas || []).join(' | ')]));
  const marcas = new Map(); arr.forEach(p => { const k = p.marca || p.hoja || '—'; if (!marcas.has(k)) marcas.set(k, []); marcas.get(k).push(p); });
  const res = [['Marca', 'Referencias', 'Localizadas', 'Fotografiadas', 'Editadas', 'Subidas', '% subidas']];
  [...marcas.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([m, ps]) => { const c = contar(ps); res.push([m, c.total, c.loc, c.fot, c.edi, c.subido, c.total ? Math.round(100 * c.subido / c.total) : 0]); });
  const t = contar(arr); res.push(['TOTAL', t.total, t.loc, t.fot, t.edi, t.subido, t.total ? Math.round(100 * t.subido / t.total) : 0]);
  const bytes = N.escribirXlsx([{ nombre: 'Avance', filas }, { nombre: 'Resumen', filas: res }]);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `Avance fotos - ${N.nombreMes(l.mes)} - ${l.nombre.replace(/[\\/:*?"<>|]/g, ' ')} - ${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })}.xlsx`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  toast('Excel descargado');
}

/* ---------- Admin ---------- */
async function vistaAdmin(v) {
  if (!v) return;
  const base = location.origin + location.pathname;
  v.innerHTML = `<h2 class="titulo">Administrar</h2>
    <div class="sec-t">Colecciones por mes</div>
    <p class="hint" style="margin-bottom:10px;">Para agregar el Excel de un mes ve a <a href="#" data-acc="ir" data-tab="calendario">Calendario</a> y elige el mes.</p>
    <div id="ad-listas"></div>
    <div class="sec-t">Quién puede escanear</div><div id="ad-gente"><p class="hint">Cargando…</p></div>
    <div class="sec-t">Conexión con Drive</div><div id="ad-conexion"><p class="hint">Cargando…</p></div>
    <div class="sec-t">Datos por revisar</div><div id="ad-alertas"></div>
    <input type="file" id="archivo" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hidden">`;
  pintarAdminListas();
  pintarAdminAlertas();
  const [tal, ext, cfg] = S.demo ? [{ data: Demo.talentos }, { data: Demo.externos }, { data: Demo.config() }] : await Promise.all([
    supa.from('talentos').select('id,nombre').order('nombre'),
    supa.from('foto_externos').select('id,nombre,activo,creado_en').order('creado_en'),
    supa.from('foto_config').select('clave,valor')
  ]);
  const g = $('#ad-gente'); if (!g) return;
  const talentos = (tal && tal.data) || [], externos = ((ext && ext.data) || []);
  g.innerHTML = `<div class="panel"><b style="font-weight:500;">Equipo creativo</b><p class="hint" style="margin:4px 0 10px;">Entran con la misma clave de 4 dígitos de Equipo Creativo.</p>
      ${talentos.length ? talentos.map(t => `<div class="fila entre" style="padding:8px 0;border-top:1px solid var(--line);"><span>${esc(t.nombre)}</span><button class="btn sec peq" data-acc="copiar" data-txt="${esc(base + '?aprendiz=' + t.id)}">${ico('copiar')} Copiar link</button></div>`).join('') : '<p class="hint">No pude leer el equipo.</p>'}</div>
    <div class="panel"><b style="font-weight:500;">Gente externa</b><p class="hint" style="margin:4px 0 10px;">Fotógrafo o personal de tienda: solo usan el scanner, no ven Equipo Creativo.</p>
      ${externos.map(x => `<div class="fila entre" style="padding:8px 0;border-top:1px solid var(--line);"><span class="crece">${esc(x.nombre)} ${x.activo ? '' : '<span class="pill">desactivado</span>'}</span>
        <span class="fila"><button class="btn sec peq" data-acc="copiar" data-txt="${esc(base + '?externo=' + x.id)}">${ico('copiar')} Link</button>
        <button class="btn sec peq" data-acc="ext-pin" data-id="${esc(x.id)}" data-nombre="${esc(x.nombre)}">Nueva clave</button>
        ${x.activo ? `<button class="btn peligro peq" data-acc="ext-off" data-id="${esc(x.id)}">Quitar</button>` : ''}</span></div>`).join('')}
      <div class="fila" style="margin-top:10px;"><input class="inp crece" id="ext-nombre" placeholder="Nombre (ej. Fotógrafo estudio)"><button class="btn" data-acc="ext-crear">Agregar</button></div></div>`;
  const conf = {}; ((cfg && cfg.data) || []).forEach(r => { conf[r.clave] = r.valor; });
  let carpetas = []; try { carpetas = JSON.parse(conf.carpetas_fotos || '[]'); } catch (e) {}
  S._carpetasAdmin = Array.isArray(carpetas) ? carpetas : [];
  const c = $('#ad-conexion');
  if (c) c.innerHTML = `<div class="panel"><p class="hint" style="margin-bottom:10px;">Pega la URL del puente de Apps Script (termina en <code>/exec</code>) y la misma clave que pusiste en el código del puente.</p>
      <div class="campo"><label for="cf-url">URL del puente</label><input id="cf-url" value="${esc(conf.puente_url || '')}" placeholder="https://script.google.com/macros/s/…/exec"></div>
      <div class="campo"><label for="cf-clave">Clave del puente</label><input id="cf-clave" value="${esc(conf.puente_clave || '')}" placeholder="La frase de CLAVE del código"></div>
      <div class="campo"><label for="cf-admin">Tu nombre en el historial</label><input id="cf-admin" value="${esc(conf.admin_nombre || 'Jhojan')}"></div>
      <div class="fila"><button class="btn" data-acc="cf-guardar">Guardar</button><button class="btn sec" data-acc="cf-probar">Probar conexión</button></div><div class="error" id="cf-msg"></div></div>
    <div class="panel"><b style="font-weight:500;">Carpetas de fotos (se marcan solas)</b>
      <p class="hint" style="margin:4px 0 10px;">Si las fotos se guardan con el <b>serial</b> en el nombre (ej. <code>JDMQ0046001T778AV1-600F_1.jpg</code>) o en una carpeta con el serial, el scanner revisa la carpeta y avanza el paso solo. Nunca devuelve un paso.</p>
      ${S._carpetasAdmin.map((x, i) => `<div class="fila entre" style="padding:8px 0;border-top:1px solid var(--line);"><span class="crece">${esc(x.nombre || 'Carpeta')} → <b>${esc(N.etiquetaEstado(x.estado))}</b> <a href="https://drive.google.com/drive/folders/${esc(x.id)}" target="_blank" rel="noopener">abrir</a></span><button class="btn peligro peq" data-acc="carpeta-quitar" data-i="${i}">Quitar</button></div>`).join('')}
      <div class="campo" style="margin-top:10px;"><label for="cp-link">Link de la carpeta en Drive</label><input id="cp-link" placeholder="https://drive.google.com/drive/folders/…"></div>
      <div class="fila"><input class="inp crece" id="cp-nombre" placeholder="Nombre (ej. Fotos editadas)"><select class="inp" id="cp-estado" style="width:auto;"><option value="fotografiado">Marca Fotografiada</option><option value="editado">Marca Editada</option><option value="subido" selected>Marca Subida</option></select></div>
      <div class="fila" style="margin-top:10px;"><button class="btn" data-acc="carpeta-agregar">Agregar carpeta</button><button class="btn sec" data-acc="carpetas-revisar">${ico('sync')} Revisar ahora</button></div></div>`;
}
function pintarAdminListas() {
  const d = $('#ad-listas'); if (!d) return;
  if (!S.listas.length) { d.innerHTML = `<div class="vacio">Todavía no hay colecciones.</div>`; return; }
  const porMes = new Map(); S.listas.forEach(l => { const k = mesClave(l.mes); if (!porMes.has(k)) porMes.set(k, []); porMes.get(k).push(l); });
  d.innerHTML = [...porMes.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([k, ls]) => `<div class="grupo-t"><span>${esc(N.nombreMes(k + '-01'))}</span><span>${ls.length}</span></div>` + ls.map(l => {
    const c = cuentasLista(l);
    return `<div class="panel"><div class="fila entre"><b style="font-weight:500;">${esc(l.nombre)}</b>${l.activa ? '<span class="pill e-fotografiado">Activa</span>' : '<span class="pill">Archivada</span>'}</div>
      <p class="hint" style="margin:4px 0 8px;">${l.total_refs} refs · ${c.fot} fotografiadas · ${c.subido} subidas · Excel leído ${esc(haceCuanto(l.sincronizada_en))}${l.sincronizada_por ? ' por ' + esc(l.sincronizada_por) : ''}
      · ${l.tarea_id ? 'tarea en Equipo Creativo ✓' : '<span style="color:var(--warn)">sin tarea en Equipo Creativo</span>'}${l.archivo_id && l.archivo_id !== 'demo' ? ` · <a href="https://drive.google.com/file/d/${esc(l.archivo_id)}/view" target="_blank" rel="noopener">abrir en Drive</a>` : ''}</p>
      <div class="fila">${l.archivo_id ? `<button class="btn sec peq" data-acc="lista-sync" data-id="${esc(l.id)}">${ico('sync')} Leer del Drive</button>` : ''}
        <button class="btn sec peq" data-acc="lista-subir" data-id="${esc(l.id)}">${ico('subir')} Subir Excel</button>
        <button class="btn sec peq" data-acc="lista-activa" data-id="${esc(l.id)}">${l.activa ? 'Archivar' : 'Activar'}</button>
        <button class="btn peligro peq" data-acc="lista-borrar" data-id="${esc(l.id)}">Eliminar</button></div></div>`;
  }).join('')).join('');
}
function pintarAdminAlertas() {
  const d = $('#ad-alertas'); if (!d) return;
  const arr = [...S.prod.values()].filter(p => (p.alertas || []).length);
  d.innerHTML = arr.length ? `<p class="hint" style="margin-bottom:8px;">Filas del Excel con problemas (códigos pegados, seriales repetidos…). Corrígelas en el Excel y vuelve a leerlo.</p><div class="items">${arr.map(p => `<button class="item" data-acc="ver" data-id="${esc(p.id)}"><span class="crece"><span class="t">${esc(p.descripcion || p.ref_base)}</span><span class="s">${esc(nombreListaMes(p.lista_id))} · ${esc(p.hoja || '')} · fila ${esc(p.fila || '—')}</span><span class="s" style="color:var(--warn)">${esc(p.alertas.join(' · '))}</span></span></button>`).join('')}</div>` : `<div class="vacio">Sin problemas en los datos.</div>`;
}
function pedirArchivo() {
  return new Promise(res => {
    const inp = $('#archivo'); if (!inp) return res(null);
    inp.value = ''; inp.onchange = async () => { const f = inp.files && inp.files[0]; res(f ? new Uint8Array(await f.arrayBuffer()) : null); };
    inp.click();
  });
}
async function guardarCarpetas(arr) {
  if (!S.demo) { const r = await supa.from('foto_config').upsert([{ clave: 'carpetas_fotos', valor: JSON.stringify(arr) }]); if (r.error) throw new Error(r.error.message); }
  else Demo.carpetas = arr;
  await cargarDatos(true);
}
async function adminAccion(acc, el) {
  const id = el.dataset.id, lista = S.listas.find(l => l.id === id);
  try {
    if (acc === 'lista-crear' || acc === 'lista-crear-archivo') {
      const nombre = $('#nl-nombre').value.trim(), link = $('#nl-link').value.trim(), err = $('#nl-error');
      err.textContent = '';
      if (!nombre) { err.textContent = 'Ponle un nombre a la colección.'; return; }
      const archivo = idDeDrive(link);
      if (acc === 'lista-crear' && !archivo) { err.textContent = 'Pega el link del Excel en Drive (o usa “Subir Excel”).'; return; }
      let bytes = null;
      if (acc === 'lista-crear-archivo') { bytes = await pedirArchivo(); if (!bytes) return; }
      el.disabled = true; el.textContent = 'Conectando…';
      const mes = (S.calMes || mesClave(mesHoy())) + '-01';
      const r = S.demo ? Demo.crearLista(nombre, archivo, mes) : await rpc('foto_lista_crear', { p_nombre: nombre, p_mes: mes, p_origen: archivo ? 'drive' : 'archivo', p_archivo: archivo || null });
      if (!r.ok) throw new Error(r.error === 'migracion' ? 'Falta correr el SQL del scanner en Supabase.' : 'No pude crear la colección (' + r.error + ').');
      if (r.aviso) toast(r.aviso, 6000);
      await cargarDatos(true);
      const nueva = S.listas.find(l => l.id === r.id);
      if (nueva) { await sincronizarLista(nueva, bytes || await traerDeDrive(nueva)); S.reporteLista = nueva.id; }
      S.repDatos = {}; await traerProgreso(); pintarVista();
      if (nueva) preguntarArrastre(S.listas.find(l => l.id === nueva.id) || nueva);
    } else if (acc === 'lista-sync') {
      el.disabled = true; el.textContent = 'Leyendo…';
      await sincronizarLista(lista, await traerDeDrive(lista)); pintarVista();
    } else if (acc === 'lista-subir') {
      const bytes = await pedirArchivo(); if (!bytes) return;
      el.disabled = true; await sincronizarLista(lista, bytes); pintarVista();
    } else if (acc === 'lista-activa') {
      if (S.demo) lista.activa = !lista.activa; else { const r = await supa.from('foto_listas').update({ activa: !lista.activa }).eq('id', id); if (r.error) throw new Error(r.error.message); }
      await cargarDatos(true); pintarVista();
    } else if (acc === 'lista-borrar') {
      if (!confirm(`¿Eliminar “${lista.nombre}” (${N.nombreMes(lista.mes)}) y todo su avance? La tarea de Equipo Creativo se queda (bórrala allá si quieres).`)) return;
      if (S.demo) Demo.borrarLista(id); else { const r = await supa.from('foto_listas').delete().eq('id', id); if (r.error) throw new Error(r.error.message); }
      await cargarDatos(true); pintarVista();
    } else if (acc === 'ext-crear') {
      const nombre = $('#ext-nombre').value.trim(); if (!nombre) return toast('Escribe el nombre');
      const r = S.demo ? { ok: true, id: 'demo', pin: '1234' } : await rpc('foto_externo_crear', { p_nombre: nombre });
      if (!r.ok) throw new Error('No pude crear el acceso (' + r.error + ').');
      mostrarAcceso(nombre, location.origin + location.pathname + '?externo=' + r.id, r.pin); pintarVista();
    } else if (acc === 'ext-pin') {
      if (!confirm(`¿Crear una clave nueva para ${el.dataset.nombre}? La anterior deja de servir.`)) return;
      const r = S.demo ? { ok: true, pin: '4321' } : await rpc('foto_externo_pin', { p_id: id });
      if (!r.ok) throw new Error('No pude cambiar la clave.');
      mostrarAcceso(el.dataset.nombre, location.origin + location.pathname + '?externo=' + id, r.pin); pintarVista();
    } else if (acc === 'ext-off') {
      if (!confirm('¿Quitarle el acceso? Ya no podrá entrar al scanner.')) return;
      if (!S.demo) { const r = await rpc('foto_externo_revocar', { p_id: id }); if (!r.ok) throw new Error('No pude quitar el acceso.'); }
      pintarVista();
    } else if (acc === 'cf-guardar') {
      const filas = [{ clave: 'puente_url', valor: $('#cf-url').value.trim() }, { clave: 'puente_clave', valor: $('#cf-clave').value.trim() }, { clave: 'admin_nombre', valor: $('#cf-admin').value.trim() || 'Jhojan' }];
      if (!S.demo) { const r = await supa.from('foto_config').upsert(filas); if (r.error) throw new Error(r.error.message); }
      S.puente = Object.assign({}, S.puente, { url: filas[0].valor, clave: filas[1].valor }); $('#cf-msg').textContent = ''; toast('Conexión guardada');
      await cargarDatos(false);
    } else if (acc === 'cf-probar') {
      const m = $('#cf-msg'); m.style.color = ''; m.textContent = 'Probando…';
      try {
        const u = new URL($('#cf-url').value.trim()); u.searchParams.set('k', $('#cf-clave').value.trim()); u.searchParams.set('prueba', '1');
        const j = await (await fetch(u.toString(), { redirect: 'follow' })).json();
        if (j.ok) { m.style.color = 'var(--ok)'; m.textContent = `Conectado ✓ (cuenta de Google: ${j.cuenta || 'ok'})`; } else m.textContent = ERR_PUENTE[j.error] || 'El puente respondió con error.';
      } catch (e) { m.textContent = 'No pude conectar. Revisa la URL (debe terminar en /exec) y que el puente esté publicado para “Cualquier persona”.'; }
    } else if (acc === 'carpeta-agregar') {
      const link = $('#cp-link').value.trim();
      const idc = (/\/folders\/([\w-]{15,})/.exec(link) || /[?&]id=([\w-]{15,})/.exec(link) || [])[1] || (/^[\w-]{15,}$/.test(link) ? link : '');
      if (!idc) return toast('Pega el link de la carpeta de Drive');
      const arr = (S._carpetasAdmin || []).filter(x => x.id !== idc).concat([{ id: idc, nombre: $('#cp-nombre').value.trim() || 'Carpeta de fotos', estado: $('#cp-estado').value }]);
      await guardarCarpetas(arr); toast('Carpeta agregada'); pintarVista(); revisarCarpetas(true);
    } else if (acc === 'carpeta-quitar') {
      const arr = (S._carpetasAdmin || []).filter((x, i) => String(i) !== el.dataset.i);
      await guardarCarpetas(arr); pintarVista();
    } else if (acc === 'carpetas-revisar') {
      el.disabled = true; await revisarCarpetas(true); el.disabled = false;
    }
  } catch (e) { toast(e.message || 'Algo salió mal', 5000); pintarVista(); }
}
function mostrarAcceso(nombre, link, pin) {
  hoja(`<h3>Acceso para ${esc(nombre)}</h3>
    <p class="hint">Mándale el link y la clave. La clave solo se muestra esta vez.</p>
    <div class="pin-grande">${esc(pin)}</div>
    <div class="caja-link"><span class="crece mono">${esc(link)}</span><button class="btn sec peq" data-acc="copiar" data-txt="${esc(link)}">${ico('copiar')} Copiar</button></div>
    <div class="fila" style="margin-top:14px;"><button class="btn sec" data-acc="copiar" data-txt="${esc(`Scanner de fotografía LE COLLEZIONI\n${link}\nClave: ${pin}`)}">Copiar link + clave</button><button class="btn" data-acc="cerrar">Listo</button></div>`);
}

/* ---------- Carpetas de fotos del Drive: avanzan el paso solas ---------- */
async function traerArchivosCarpeta(id) {
  if (S.demo) return Demo.archivosCarpeta();
  const u = new URL(S.puente.url); u.searchParams.set('k', S.puente.clave || ''); u.searchParams.set('accion', 'fotos'); u.searchParams.set('carpeta', id); u.searchParams.set('dias', '150');
  let j;
  try { j = await (await fetch(u.toString(), { redirect: 'follow' })).json(); } catch (e) { throw new Error('No pude conectar con el puente para leer la carpeta de fotos.'); }
  if (!j || !j.ok) throw new Error(j && j.error === 'accion' ? 'Actualiza el código del puente (versión con carpetas de fotos).' : (ERR_PUENTE[j && j.error] || 'No pude leer la carpeta de fotos.'));
  return j.archivos || [];
}
async function revisarCarpetas(manual) {
  const carpetas = (S.puente && S.puente.carpetas) || [];
  if (S.modo === 'externo') return;
  if (!carpetas.length) { if (manual) toast('No hay carpetas de fotos configuradas (Admin → Conexión).'); return; }
  if (!S.demo && !(S.puente && S.puente.url)) return;
  const ult = Number(leer('foto_drive_ult') || 0);
  if (!manual && Date.now() - ult < SYNC_DRIVE_MIN * 60000) return;
  guardar('foto_drive_ult', String(Date.now()));
  if (manual) toast('Revisando la carpeta de fotos…', 5000);
  let total = 0;
  for (const c of carpetas) {
    try {
      const archivos = await traerArchivosCarpeta(c.id);
      const marcas = N.emparejarArchivos([...S.prod.values()], archivos)
        .filter(x => (N.ORDEN[c.estado] || 0) > N.ORDEN[x.p.estado])
        .map(x => ({ id: x.p.id, estado: c.estado, archivo: x.archivo }));
      if (!marcas.length) continue;
      const r = S.demo ? Demo.driveMarcar(marcas) : await rpc('foto_drive_marcar', { p_token: tok(), p_marcas: marcas });
      if (r.ok) total += r.n;
    } catch (e) { if (manual) toast(e.message, 5000); }
  }
  if (total) { await cargarDatos(false); repintarSuave(); toast(`Carpeta de fotos: ${total} referencia${total === 1 ? ' avanzó sola' : 's avanzaron solas'}`, 4500); }
  else if (manual) toast('Carpeta revisada: nada nuevo');
}

/* ---------- elegir sede ---------- */
function elegirSede(primeraVez) {
  const sedes = sedesDisponibles().filter(s => !N.esTransito(s));
  const ov = document.createElement('div'); ov.className = 'ov';
  ov.innerHTML = `<div class="hoja" role="dialog" aria-modal="true" aria-label="Dónde estás"><h3>¿Dónde estás escaneando?</h3>
    <p class="hint">Así sabes qué unidades hay aquí y el historial queda con la sede.</p>
    <div class="opciones">${['Estudio de fotografía', ...sedes].map(s => `<button data-acc="sede-ok" data-sede="${esc(s)}" aria-pressed="${S.sede === s}">${esc(N.nombreSede(s))}</button>`).join('')}</div>
    <div class="fila"><input class="inp crece" id="sede-otra" placeholder="Otra (escríbela)"><button class="btn sec" data-acc="sede-otra">Usar</button></div>
    ${primeraVez ? '' : '<button class="btn sec full" style="margin-top:10px;" data-acc="cerrar">Cancelar</button>'}</div>`;
  document.body.appendChild(ov);
}
function fijarSede(s) { S.sede = s; guardar('foto_sede', s); S.filtros.sede = s; S._filtroTocado = false; $$('.ov').forEach(o => o.remove()); pintarTop(); repintarSuave(); }

/* ---------- clics (sin código en línea: la política de seguridad lo bloquea) ---------- */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-acc]'); if (!el) return;
  const acc = el.dataset.acc;
  if (el.tagName === 'A') e.preventDefault();
  if (acc === 'ir') { $$('.ov').forEach(o => o.remove()); S.tab = el.dataset.tab; pintar(); window.scrollTo(0, 0); }
  else if (acc === 'marcar') { const p = S.prod.get(el.dataset.id); if (p) marcar(p, el.dataset.estado); }
  else if (acc === 'ver') { const p = S.prod.get(el.dataset.id); if (p) abrirProducto(p); }
  else if (acc === 'cerrar') { const o = el.closest('.ov'); if (o) o.remove(); }
  else if (acc === 'tema') cambiarTema();
  else if (acc === 'sede') elegirSede(false);
  else if (acc === 'sede-ok') fijarSede(el.dataset.sede);
  else if (acc === 'sede-otra') { const v = $('#sede-otra').value.trim(); if (v) fijarSede(v); }
  else if (acc === 'sync') { await enviarCola(); if (S.modo !== 'externo') actualizarTodoDesdeDrive(); else { await cargarDatos(true); toast('Datos al día'); } }
  else if (acc === 'sync-drive') actualizarTodoDesdeDrive();
  else if (acc === 'exportar') exportar();
  else if (acc === 'salir') salir();
  else if (acc === 'linterna') { const on = await Cam.alternarLinterna(); el.setAttribute('aria-pressed', String(on)); }
  else if (acc === 'pausar') { S.camPausada = !S.camPausada; if (S.camPausada) { Cam.detener(); } vistaEscanear($('#vista')); }
  else if (acc === 'reintentar-cam') { Cam.detener(); encenderCamara(); }
  else if (acc === 'teclado') { S.tecladoTexto = !S.tecladoTexto; S.buscar = $('#q').value; vistaBuscar($('#vista')); }
  else if (acc === 'copiar') { try { await navigator.clipboard.writeText(el.dataset.txt); toast('Copiado'); } catch (x) { prompt('Copia esto:', el.dataset.txt); } }
  else if (acc === 'anio') { S.calAnio += Number(el.dataset.d); vistaCalendario($('#vista')); }
  else if (acc === 'cal-mes') { S.calMes = el.dataset.mes; pintarCalendario(); pintarMes(); pintarFormMes(); pintarReporte(false); }
  else if (acc === 'ver-col') { S.reporteLista = el.dataset.id; pintarMes(); pintarReporte(false); const r = $('#rep'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  else if (acc === 'cambios') abrirCambios(el.dataset.id);
  else if (acc === 'pasar-ok') pasarPendientes(el);
  else if (acc === 'sesion-on') { S.sesionOn = true; guardarSesion(); toast('Sesión iniciada: cada referencia que escanees se suma'); }
  else if (acc === 'sesion-ver') abrirSesion();
  else if (acc === 'instalar') { const pr = window.__pwa && window.__pwa.prompt; if (pr) { pr.prompt(); try { await pr.userChoice; } catch (x) {} window.__pwa.prompt = null; } pintarInstalar(); }
  else if (acc === 'instalar-no') { guardar('foto_instalar_no', '1'); pintarInstalar(); }
  else if (acc === 'sesion-off') { const n = S.sesion.length; if (n && !confirm(`¿Terminar la sesión? Las ${n} sin marcar se quitan de la sesión (no pierden su paso).`)) return; S.sesionOn = false; S.sesion = []; guardarSesion(); }
  else if (acc === 'lote') { const ov = el.closest('.ov'); const ids = $$('input[data-sid]', ov).filter(i => i.checked).map(i => i.dataset.sid); if (!ids.length) return toast('Selecciona al menos una'); ov.remove(); marcarLote(ids, el.dataset.estado); }
  else if (acc.startsWith('lista-') || acc.startsWith('ext-') || acc.startsWith('cf-') || acc.startsWith('carpeta')) adminAccion(acc, el);
});

/* ============================================================
   ENTRADA
   ============================================================ */
function renderSinAcceso() {
  $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="logo">${logo(40)}</div><h2>Scanner de fotografía</h2>
    <p>Abre el link personal que te compartieron. Si eres del equipo creativo, búscalo en tu tarea de Fotografía en Equipo Creativo.</p></div></div>`;
}
const ERR_PIN = r => ({
  clave: r.restantes ? `Clave incorrecta. Te quedan ${r.restantes} intento${r.restantes === 1 ? '' : 's'}.` : 'Clave incorrecta.',
  bloqueado: `Demasiados intentos. Espera ${r.minutos || 15} min o pídele al admin una clave nueva.`,
  sin_clave: 'Este link aún no tiene clave. Pídesela al admin.', acceso: 'Tu acceso está desactivado. Habla con el admin.',
  enlace: 'Este link no es válido. Pide el link actualizado.', migracion: 'Falta activar el scanner en Supabase (avísale al admin).',
  red: 'No pude conectar. Revisa tu internet.'
}[r.error] || 'No pude entrar.');
function gatePin(msg) {
  const quien = S.modo === 'talento' ? 'Escribe tu clave de 4 dígitos de Equipo Creativo.' : 'Escribe la clave de 4 dígitos que te dieron.';
  $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="logo">${logo(40)}</div><h2>Scanner de fotografía</h2><p>${quien}</p>
    <form id="f-pin" novalidate><input class="inp pin" id="pin" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="one-time-code" placeholder="••••" aria-label="Clave de 4 dígitos">
    <button class="btn full" style="margin-top:14px;" type="submit">Entrar</button><div class="error" id="pin-err" role="alert" style="margin-top:10px;text-align:center;">${esc(msg || '')}</div></form></div></div>`;
  const inp = $('#pin'); inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 4); });
  $('#f-pin').addEventListener('submit', async e => {
    e.preventDefault(); if (!/^\d{4}$/.test(inp.value)) { $('#pin-err').textContent = 'La clave tiene 4 números.'; return; }
    const b = $('#f-pin button'); b.disabled = true; b.textContent = 'Entrando…';
    const r = await entrarConPin(inp.value);
    if (r.ok) entrar(); else gatePin(ERR_PIN(r));
  });
  setTimeout(() => inp.focus(), 60);
}
async function entrarConPin(pin) {
  const r = await rpc('foto_entrar', { p_tipo: S.modo, p_id: S.persona, p_pin: pin });
  if (r.ok) { S.token = r.token; guardar(claveSesion(), { token: r.token, expira: Date.now() + 11.5 * 3600 * 1000 }); }
  return r;
}
function gateAdmin(msg) {
  $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="logo">${logo(40)}</div><h2>Scanner · Administrador</h2><p>Entra con la misma cuenta de Equipo Creativo.</p>
    <form id="f-adm" novalidate><div class="campo"><label for="a-mail">Correo</label><input id="a-mail" type="email" autocomplete="username"></div>
    <div class="campo"><label for="a-pass">Contraseña</label><input id="a-pass" type="password" autocomplete="current-password"></div>
    <button class="btn full" type="submit">Entrar</button><div class="error" id="a-err" role="alert" style="margin-top:10px;">${esc(msg || '')}</div></form></div></div>`;
  $('#f-adm').addEventListener('submit', async e => {
    e.preventDefault(); const b = $('#f-adm button'); b.disabled = true; b.textContent = 'Entrando…';
    const { error } = await supa.auth.signInWithPassword({ email: $('#a-mail').value.trim(), password: $('#a-pass').value });
    if (error) return gateAdmin('Correo o contraseña incorrectos.');
    const ok = await rpc('es_admin');
    if (ok !== true) { await supa.auth.signOut(); return gateAdmin('Esta cuenta no es administradora.'); }
    entrar();
  });
}
function sesionVencida() {
  if (S.modo === 'demo') return;
  Cam.detener(); clearInterval(S._timer); S.actor = null;
  borrar(claveSesion());
  if (S.modo === 'admin') gateAdmin('Tu sesión terminó. Vuelve a entrar.'); else gatePin('Tu sesión terminó. Escribe tu clave otra vez.');
}
async function salir() {
  if (!confirm('¿Salir del scanner en este teléfono?')) return;
  Cam.detener(); clearInterval(S._timer);
  if (S.modo === 'admin') { try { await supa.auth.signOut(); } catch (e) {} }
  else { rpc('foto_salir', { p_token: S.token }); borrar(claveSesion()); }
  borrar('foto_cache_v1'); S.actor = null; location.reload();
}

async function entrar() {
  cargarCola(); cargarSesion();
  const conCache = cargarCache();
  S.sede = leer('foto_sede') || '';
  if (conCache) { pintar(); }
  else { $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="logo">${logo(40)}</div><p>Cargando la lista…</p></div></div>`; }
  const r = await cargarDatos(true);
  if (!r.ok && !conCache) {
    if (r.error === 'sesion' || r.error === 'permiso') return;
    $('#app').innerHTML = `<div class="gate"><div class="gate-card"><div class="logo">${logo(40)}</div><h2>Sin conexión</h2><p>${r.error === 'migracion' ? 'Falta correr el SQL del scanner en Supabase.' : 'No pude cargar la lista. Revisa tu internet y vuelve a abrir.'}</p></div></div>`;
    return;
  }
  if (!conCache) pintar();
  iniciarRefresco(); enviarCola();
  if (!S.sede) elegirSede(true);
  autoSincronizar();
}

async function boot() {
  aplicarTema(tema());
  const q = new URLSearchParams(location.search);
  if (q.get('demo') === '1') { S.demo = true; S.modo = 'demo'; S.persona = 'demo'; Demo.iniciar(); return entrar(); }
  if (q.get('admin') === '1') S.modo = 'admin';
  else if (q.get('aprendiz')) { S.modo = 'talento'; S.persona = q.get('aprendiz'); }
  else if (q.get('externo')) { S.modo = 'externo'; S.persona = q.get('externo'); }
  else {
    const ruta = leer('foto_ruta');
    if (ruta && /^\?(admin=1|aprendiz=|externo=)/.test(ruta)) { location.replace(location.pathname + ruta); return; }
    return renderSinAcceso();
  }
  guardar('foto_ruta', location.search);
  if (!supa) return renderSinAcceso();
  if (S.modo === 'admin') {
    const { data } = await supa.auth.getSession();
    if (data && data.session && (await rpc('es_admin')) === true) return entrar();
    return gateAdmin();
  }
  const ses = leer(claveSesion(), true);
  if (ses && ses.token && ses.expira > Date.now()) { S.token = ses.token; return entrar(); }
  if (S.modo === 'talento') {                       // si ya entró a Equipo Creativo en este teléfono, usa esa clave
    let pin = ''; try { pin = sessionStorage.getItem('equipo_pin_' + S.persona) || localStorage.getItem('equipo_pin_' + S.persona) || ''; } catch (e) {}
    if (/^\d{4}$/.test(pin)) { const r = await entrarConPin(pin); if (r.ok) return entrar(); }
  }
  gatePin();
}

/* ============================================================
   MODO DEMO (?demo=1): datos de ejemplo de la lista Dackel
   Octubre (archivada) + Noviembre (activa), para probar el calendario,
   la memoria entre colecciones, la sesión en lote y la carpeta de fotos.
   ============================================================ */
const Demo = {
  listas: [], prod: [], eventos: [], versiones: {}, carpetas: [{ id: 'demo-carpeta', nombre: 'Fotos finales', estado: 'subido' }],
  talentos: [{ id: 'demo-liz', nombre: 'Liz' }, { id: 'demo-mateo', nombre: 'Mateo' }], externos: [{ id: 'demo-foto', nombre: 'Fotógrafo estudio', activo: true }],
  iniciar() {
    const hoy = mesHoy(), d = new Date(hoy + 'T12:00:00'); d.setMonth(d.getMonth() - 1);
    const antes = d.toISOString().slice(0, 7) + '-01';
    const mk = (id, mes, activa) => ({ id, nombre: 'Dackel', mes, origen: 'drive', archivo_id: 'demo', activa, tarea_id: 'demo', total_refs: 0, sincronizada_en: ahoraIso(), sincronizada_por: 'Demo', creado_en: ahoraIso() });
    this.listas = [mk('demo-nov', hoy, true), mk('demo-oct', antes, false)];
    const filas = [
      ['Jacob Cohen', '1495396917851', 'JDMQ0046001T778AV1-600F', ['149539691785108'], ['28'], 'JEANS JACOB COHEN DAMA NEGRO ALGODON T-28 915', [['Calle_109', 1], ['MEDELL', 1]]],
      ['Harmont & Blaine Shoes', '788001864630', 'EFM2410116160', ['78800186463021', '78800186463073', '78800186463075'], ['41', '41.5', '43.5'], 'TENIS H&B SHOES AZUL + BLANCO CUERO + POLIURE T-41', [['BOGOTA', 1], ['BQ/LLA', 1], ['Calle_109', 1], ['BODEGA CAL', 1]]],
      ['Harmont & Blaine Shoes', '788017925653', 'EFM2610702H012', ['78801792565323', '78801792565324', '78801792565321'], ['43', '44', '41'], 'TENIS H&B SHOES AZUL POLIE+ CUERO T-43 IM924', [['MEDELL', 1], ['NOGAL', 1], ['CARRERA 12', 1]]],
      ['Harmont & Blaine Shoes', '0781T54896064', 'H4EPMH583093082', ['0781T5489606460'], [''], 'PORTATARJETAS H&B SHOES AZUL CUERO DELLE PELLE', [['BQ/LLA', 1]]],
      ['Paul Smith', '1924793881397', 'M2R-151LE-N21511-79', ['192479388139703', '192479388139704', '192479388139705'], ['M', 'L', 'XL'], 'CAMISETA POLO PAUL SMITH NEGRO ALG + ELAS T-M', [['MEDELL', 6], ['NOGAL', 1]]],
      ['Paul Smith', '1923797915394', 'M2R-191Z-TP5408-79', ['192379791539404', '192379791539403'], ['L', 'M'], 'SWEAT-SHIRT PAUL SMITH NEGRO ALG + POLI T-L', [['BOGOTA', 1], ['MEDELL', 1]]],
      ['Paul Smith', '1928054881858', 'M2S-LEE19-JLEA-79', ['192805488185844', '192805488185842'], ['10', '9'], 'TENIS PAUL SMITH NEGRO CUERO T-10 IM881', [['BQ/LLA', 1], ['MEDELL', 1]]],
      ['Eddy Monetti', '2114683867957', 'FM47350-15', ['211468386795722', '211468386795721'], ['42', '41'], 'CAMISA EDDY MONETTI BLANCO RYS AZUL ALGODON T-42', [['Calle_109', 1], ['CARRERA 12', 2]]],
      ['Harmont & Blaine Peluches', '689062345777', 'beige-verde', ['68906234577761'], [''], 'PELUCHE PARA NIÑO MAYOR DE 3 AÑOS BEIGE-VERDE', [['BQ/LLA', 1], ['Calle_109', 1]]]
    ];
    const prod = (f, i, lista, estado, por) => ({ id: `${lista}-p${i}`, lista_id: lista, marca: f[0], hoja: f[0], ref_base: f[1], serial: f[2], codigos: f[3], tallas: f[4], descripcion: f[5],
      bodegas: f[6].map(([b, n]) => ({ b, n })), extra: {}, alertas: [], fila: i + 2, activo: true, estado, estado_por: por, estado_en: por ? ahoraIso() : null, actualizado_en: ahoraIso() });
    this.prod = filas.map((f, i) => prod(f, i, 'demo-nov', i === 1 ? 'fotografiado' : i === 4 ? 'subido' : 'pendiente', i === 1 || i === 4 ? 'Liz' : null));
    // Octubre: la sudadera ya se subió; el tenis IM924 se fotografió → "está en otra colección"
    this.prod.push(prod(filas[5], 5, 'demo-oct', 'subido', 'Mateo'), prod(filas[2], 2, 'demo-oct', 'fotografiado', 'Liz'),
      prod(['Paul Smith', '1924835915406', 'M2R-220X-TP5408-79', ['192483591540603'], ['M'], 'CAMISETA-TSHIRT PAUL SMITH NEGRO ALGODON T-M IM915', [['MEDELL', 1]]], 20, 'demo-oct', 'subido', 'Mateo'));
    const s = this.prod.find(p => p.id === 'demo-nov-p5'); s.estado = 'subido'; s.estado_por = 'Subida en página · Dackel'; s.estado_en = ahoraIso();
    this.listas.forEach(l => { l.total_refs = this.prod.filter(p => p.lista_id === l.id).length; });
    this.versiones = { 'demo-nov': [{ creado_en: ahoraIso(), por: 'Jhojan', nuevos: [{ ref: '1495396917851', desc: 'JEANS JACOB COHEN DAMA NEGRO', marca: 'Jacob Cohen' }], quitados: [{ ref: '1924788915582', desc: 'CAMISETA POLO PAUL SMITH VINOTINTO', marca: 'Paul Smith' }] }, { creado_en: ahoraIso(), por: 'Jhojan', primera: true, total: 8, nuevos: [], quitados: [] }] };
  },
  copia: o => JSON.parse(JSON.stringify(o)),
  conOtra(p) {
    const o = this.prod.filter(q => q.ref_base === p.ref_base && q.lista_id !== p.lista_id).sort((a, b) => N.ORDEN[b.estado] - N.ORDEN[a.estado])[0];
    const l = o && this.listas.find(x => x.id === o.lista_id);
    return Object.assign(this.copia(p), { otra: o ? { lista_id: l.id, nombre: l.nombre, mes: l.mes, estado: o.estado } : null });
  },
  ev(e) { this.eventos.unshift(Object.assign({ id: this.eventos.length + 1, creado_en: ahoraIso(), actor_nombre: 'Tú (demo)', sede: S.sede }, e)); },
  marcar(id, estado) {
    const p = this.prod.find(x => x.id === id); if (!p) return null;
    p.estado = estado; p.estado_por = 'Tú (demo)'; p.estado_en = ahoraIso();
    this.ev({ accion: 'estado', estado_nuevo: estado, lista_id: p.lista_id, descripcion: p.descripcion });
    return this.conOtra(p);
  },
  progreso(l) {
    const ps = this.prod.filter(p => p.lista_id === l.id && !p.movido_a), c = k => ps.filter(p => p.estado === k).length;
    const marcas = [...new Set(ps.map(p => p.marca))].map(m => { const q = ps.filter(p => p.marca === m); return { marca: m, total: q.length, fotografiadas: q.filter(N.yaFotografiada).length, editadas: q.filter(p => N.ORDEN[p.estado] >= 3).length, subidas: q.filter(p => p.estado === 'subido').length }; });
    const per = {}; this.eventos.filter(e => e.accion === 'estado' && e.estado_nuevo === 'fotografiado' && e.lista_id === l.id).forEach(e => { per[e.actor_nombre] = (per[e.actor_nombre] || 0) + 1; });
    return { lista_id: l.id, tarea_id: 'demo', nombre: l.nombre, mes: l.mes, activa: l.activa, total: ps.length, pendiente: c('pendiente'), localizado: c('localizado'), fotografiado: c('fotografiado'), editado: c('editado'), subido: c('subido'),
      arrastrados: ps.filter(p => p.arrastrado_de).length, otra: ps.filter(p => this.prod.some(q => q.ref_base === p.ref_base && q.lista_id !== p.lista_id)).length, marcas,
      personas: l.id === 'demo-nov' ? [{ nombre: 'Liz', fotos: 2 }, ...Object.entries(per).map(([nombre, fotos]) => ({ nombre, fotos }))] : [{ nombre: 'Mateo', fotos: 2 }, { nombre: 'Liz', fotos: 1 }] };
  },
  async rpc(fn, a) {
    await new Promise(r => setTimeout(r, 60));
    const activas = new Set(this.listas.filter(l => l.activa).map(l => l.id));
    if (fn === 'foto_datos') return { ok: true, actor: { tipo: 'admin', id: 'demo', nombre: 'Tú (demo)' }, ahora: ahoraIso(), completo: true, listas: this.copia(this.listas),
      productos: this.prod.filter(p => activas.has(p.lista_id) && !p.movido_a).map(p => this.conOtra(p)),
      archivo: this.prod.filter(p => !activas.has(p.lista_id) && !p.movido_a).map(p => [p.ref_base, p.serial, p.estado, p.lista_id, p.codigos]),
      puente: { url: 'demo', clave: 'demo', carpetas: this.carpetas } };
    if (fn === 'foto_escanear') {
      const p = this.prod.find(x => x.id === a.p_producto);
      this.ev({ accion: p ? 'escaneo' : 'no_encontrado', codigo: a.p_codigo, lista_id: p && p.lista_id, descripcion: p && p.descripcion });
      if (p && p.estado === 'pendiente') { p.estado = 'localizado'; p.estado_por = 'Tú (demo)'; p.estado_en = ahoraIso(); this.ev({ accion: 'estado', estado_nuevo: 'localizado', lista_id: p.lista_id, descripcion: p.descripcion }); }
      return { ok: true, producto: p ? this.conOtra(p) : undefined };
    }
    if (fn === 'foto_marcar') { const p = this.marcar(a.p_producto, a.p_estado); return p ? { ok: true, producto: p } : { ok: false, error: 'producto' }; }
    if (fn === 'foto_marcar_lote') { const ps = a.p_productos.map(id => this.marcar(id, a.p_estado)).filter(Boolean); return { ok: true, n: ps.length, productos: ps }; }
    if (fn === 'foto_historial') return { ok: true, eventos: this.eventos.filter(e => !a.p_lista || e.lista_id === a.p_lista).slice(0, a.p_limite || 60) };
    if (fn === 'foto_progreso') return this.listas.filter(l => (a.p_listas || []).includes(l.id)).map(l => this.progreso(l));
    if (fn === 'foto_versiones_listar') return { ok: true, versiones: this.versiones[a.p_lista] || [] };
    if (fn === 'foto_metricas') {
      const dias = []; for (let i = 0; i < 30; i++) { const d = new Date(Date.now() - i * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); dias.push({ dia: d, fotografiadas: i % 7 === 0 || i % 7 === 6 ? 0 : (i * 7) % 9 + 1 }); }
      const sem = []; for (let w = 0; w < 4; w++) { const d = new Date(Date.now() - w * 7 * 86400000); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const s = d.toLocaleDateString('en-CA'); sem.push({ nombre: 'Liz', semana: s, fotos: 18 - w * 3 }, { nombre: 'Mateo', semana: s, fotos: 12 + w }); }
      return { ok: true, tiempos: { loc_fot: 1.4, fot_sub: 3.2, loc_sub: 4.8, n_fot: 42, n_sub: 31 }, semanas: sem, dias };
    }
    if (fn === 'foto_sync') {
      const l = this.listas.find(x => x.id === a.p_lista); const nv = [];
      a.p_productos.forEach((x, i) => {
        const ex = this.prod.find(p => p.lista_id === l.id && p.ref_base === x.ref_base);
        if (ex) Object.assign(ex, x, { estado: ex.estado }); else { nv.push({ ref: x.ref_base, desc: x.descripcion, marca: x.marca }); this.prod.push(Object.assign({ id: 'demo-n' + Date.now() + i, lista_id: l.id, estado: 'pendiente', activo: true }, x)); }
      });
      l.total_refs = this.prod.filter(p => p.lista_id === l.id).length; l.sincronizada_en = ahoraIso();
      const primera = !(this.versiones[l.id] || []).length;
      (this.versiones[l.id] = this.versiones[l.id] || []).unshift({ creado_en: ahoraIso(), por: 'Tú (demo)', primera, total: l.total_refs, nuevos: primera ? [] : nv, quitados: [] });
      return { ok: true, total: l.total_refs, nuevos: primera ? 0 : nv.length, quitados: 0, primera, lista_nuevos: primera ? [] : nv, lista_quitados: [] };
    }
    if (fn === 'foto_salir') return { ok: true };
    return { ok: false, error: 'demo' };
  },
  config() { return [{ clave: 'carpetas_fotos', valor: JSON.stringify(this.carpetas) }, { clave: 'admin_nombre', valor: 'Jhojan' }]; },
  crearLista(nombre, archivo, mes) { const id = 'demo-l' + Date.now(); this.listas.unshift({ id, nombre, mes, origen: archivo ? 'drive' : 'archivo', archivo_id: archivo || null, activa: true, tarea_id: 'demo', total_refs: 0, sincronizada_en: null, creado_en: ahoraIso() }); return { ok: true, id }; },
  borrarLista(id) { this.listas = this.listas.filter(l => l.id !== id); this.prod = this.prod.filter(p => p.lista_id !== id); },
  pasar(origen, destino, archivar) {
    let n = 0;
    this.prod.filter(p => p.lista_id === origen && !p.movido_a && p.estado !== 'subido').forEach(p => {
      const d = this.prod.find(q => q.lista_id === destino && q.ref_base === p.ref_base);
      if (d) { if (N.ORDEN[p.estado] > N.ORDEN[d.estado]) d.estado = p.estado; }
      else this.prod.push(Object.assign(this.copia(p), { id: p.id + '-a', lista_id: destino, arrastrado_de: origen }));
      p.movido_a = destino; n++;
    });
    const quedan = this.prod.some(p => p.lista_id === origen && !p.movido_a && p.estado !== 'subido');
    if (archivar && !quedan) this.listas.find(l => l.id === origen).activa = false;
    return { ok: true, pasados: n };
  },
  driveMarcar(marcas) { marcas.forEach(m => this.marcar(m.id, m.estado)); return { ok: true, n: marcas.length }; },
  async archivosCarpeta() { return [{ n: 'M2S-LEE19-JLEA-79_frente.jpg', r: 'Fotos finales' }, { n: 'M2S-LEE19-JLEA-79_detalle.jpg', r: 'Fotos finales' }, { n: 'IMG_4521.jpg', r: 'Fotos finales' }]; },
  async excel() { throw new Error('En modo prueba no hay Drive conectado. Usa “Subir Excel”.'); }
};

boot();
