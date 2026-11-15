/* Service worker : l'appli marche sans réseau, et prend la nouvelle version dès qu'il y a du réseau. */
const CACHE = "metre-v4";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png", "icon-32.png",
                  "lib/html2canvas.min.js", "lib/jspdf.umd.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;     // Google, Drive : jamais en cache
  // Réseau d'abord (nouvelle version), cache si pas de réseau
  e.respondWith(fetch(e.request, {cache: "no-cache"}).then(r => {
    const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
