/* Service worker : l'appli marche sans réseau, et prend la nouvelle version dès qu'il y a du réseau. */
const CACHE = "metre-v16";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png", "icon-32.png",
                  "lib/html2canvas.min.js", "lib/jspdf.umd.min.js", "lib/pdf.min.js", "lib/pdf.worker.min.js", "img/vb-gonds-formes.jpg", "img/vb-gonds-deport.jpg", "img/pt-portail.jpg", "img/pt-portillon.jpg",
                  "img/gc/gc-balconnet-vision-avec-verre-44-2.png", "img/gc/gc-balconnet-panama.png", "img/gc/gc-balconnet-art-deco.png", "img/gc/gc-balconnet-droit.png", "img/gc/gc-balconnet-bague.png", "img/gc/gc-balconnet-droit-volute.png", "img/gc/gc-balconnet-ondule.png", "img/gc/gc-balconnet-toulousain-avec-grillage-de-securite.png", "img/gc/gc-balconnet-volute.png", "img/gc/gc-balconnet-galbe.png", "img/gc/gc-balconnet-papillon.png", "img/gc/gc-balconnet-harmonie.png", "img/gc/gc-balconnet-regence-avec-plaque-makrolon.png", "img/gc/gc-balconnet-elegance.png", "img/gc/gc-balconnet-hippocampe.png", "img/gc/gc-balconnet-toulousain-avec-plaque-makrolon.png", "img/gc/gc-balconnet-contemporain.png", "img/gc/gc-balconnet-royal.png", "img/gc/gc-balconnet-mediterranee-avec-plaque-makrolon.png", "img/gc/gc-balconnet-voile-avec-plaque-makrolon.png", "img/gc/gc-balconnet-canopee.png", "img/gc/gc-balconnet-sphere.png", "img/gc/gc-balconnet-ligne.png", "img/gc/gc-balconnet-helios-avec-plaque-makrolon.png"];
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
