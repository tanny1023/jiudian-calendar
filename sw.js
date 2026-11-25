/* 離線備援：平常優先抓最新版；網路被擋或太慢（4 秒）時改用上次存起來的版本，所以曾經開過的電腦即使網路擋住也打得開 */
const CACHE = 'jd-v1';
const ASSETS = ['./', './index.html', './lib/xlsx.full.min.js', './lib/exceljs.min.js', './lib/pdf.min.js', './lib/pdf.worker.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith((async () => {
    const net = fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; });
    const slow = new Promise(res => setTimeout(() => res(null), 4000));
    try {
      const first = await Promise.race([net, slow]);
      if (first) return first;
      const hit = await caches.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await caches.match('./index.html') : null);
      return hit || await net;
    } catch (err) {
      return (await caches.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await caches.match('./index.html') : Response.error());
    }
  })());
});
