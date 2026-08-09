const CACHE = 'glp1-shell-v3';
const SHELL = ['./', './index.html', './Restart Tracker.dc.html', './support.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const APP_FILES = ['index.html', 'Restart Tracker.dc.html'];
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isApp = url.origin === location.origin &&
    (e.request.mode === 'navigate' || APP_FILES.some(f => url.pathname.endsWith('/' + f)));
  if (isApp) {
    // Network-first for the app so updates reach users; cache is the offline fallback.
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./Restart Tracker.dc.html')))
    );
    return;
  }
  // Cache-first for everything else.
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./Restart Tracker.dc.html')))
  );
});