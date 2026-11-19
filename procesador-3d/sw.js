/* Procesador 3D — service worker: guarda la página para que funcione sin internet después de la primera visita. */
const CACHE = 'procesador-3d-v1.1';
const SHELL = ['./', 'index.html', 'css/styles.css', 'manifest.webmanifest',
  'js/config.js', 'js/data.js', 'js/data-evaluacion.js', 'js/db.js', 'js/audio.js', 'js/parts.js', 'js/fx.js',
  'js/mode-fabricacion.js', 'js/mode-comparar.js', 'js/mode-sockets.js', 'js/mode-inicio.js', 'js/mode-evaluacion.js', 'js/mode-docente.js',
  'js/app.js', 'js/sw-register.js', 'js/vendor/qrcode.js', 'assets/icon-192.png', 'assets/qr-manual.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // la página: primero internet (para ver la versión nueva) y si no hay, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // archivos (incluye Three.js y fuentes): la copia guardada y, si no existe, internet
  const cdn = /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if (url.origin !== location.origin && !cdn) return;
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
    return r;
  })));
});
