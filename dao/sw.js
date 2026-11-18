/* Service worker de la Mini DAO : l'appli marche sans réseau,
   et prend la nouvelle version dès qu'il y a du réseau.
   À CHAQUE MISE À JOUR de index.html : augmenter le numéro de CACHE (dao-v2, dao-v3…). */
const CACHE = "dao-v4";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-32.png", "icon-180.png", "icon-192.png", "icon-512.png", "lib/jspdf.umd.min.js", "lib/svg2pdf.umd.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith("dao-") && x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // Réseau d'abord (nouvelle version), cache si pas de réseau
  e.respondWith(fetch(e.request, {cache: "no-cache"}).then(r => {
    const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
