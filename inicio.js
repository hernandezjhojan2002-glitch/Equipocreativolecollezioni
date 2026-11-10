/* ============================================================
   INSTALABLE (PWA): service worker + manifiesto con el link de acceso
   - El manifiesto se arma con el link que abriste (admin / aprendiz / jefe / solicitar),
     así la app instalada abre directo en TU vista.
   ============================================================ */
window.__pwa = { prompt: null };
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); window.__pwa.prompt = e; window.dispatchEvent(new Event('pwa-lista')); });
window.addEventListener('appinstalled', function(){ window.__pwa.prompt = null; });
(function(){ try{
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }
  var DEFAULT_ROL = (document.currentScript && document.currentScript.dataset.rol) || '';   // 'admin' en equipo-creativo-admin.html
  var u = new URL(location.href); u.hash = '';
  var p = u.searchParams;
  var rol = p.get('admin')==='1' ? 'admin' : p.has('aprendiz') ? 'aprendiz' : p.get('vista')==='jefe' ? 'jefe' : p.get('solicitar')==='1' ? 'solicitar' : DEFAULT_ROL;
  if(rol){
    var N = { admin:['Equipo creativo · Administrador','Admin'], aprendiz:['Equipo creativo · Mi trabajo','Mi trabajo'], jefe:['Equipo creativo · Dirección','Dirección'], solicitar:['Equipo creativo · Solicitudes','Solicitudes'] }[rol];
    var abs = function(f){ return new URL(f, location.href).href; };
    var man = { id: u.href, name: N[0], short_name: N[1], description: 'Gestión del equipo creativo: proyectos, tareas y solicitudes en línea.', lang: 'es',
      start_url: u.href, scope: new URL('./', location.href).href, display: 'standalone', orientation: 'portrait',
      background_color: '#f3f3f1', theme_color: '#f3f3f1',
      icons: [ { src: abs('icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
               { src: abs('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
               { src: abs('icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' } ] };
    var blobUrl = URL.createObjectURL(new Blob([JSON.stringify(man)], { type: 'application/manifest+json' }));
    var enlace = document.querySelector('link[rel="manifest"]');
    if(enlace){ enlace.setAttribute('href', blobUrl); }
  }
}catch(e){} })();
