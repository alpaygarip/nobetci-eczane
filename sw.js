/* ============================================================
   Service Worker — çevrimdışı destek
   ------------------------------------------------------------
   Uygulama kabuğu (HTML/CSS/JS/ikonlar) önbelleğe alınır:
   "önce önbellek, arkada güncelle" (stale-while-revalidate).
   /api/ istekleri HER ZAMAN ağa gider — nöbet listesi günlük
   değişir; çevrimdışı durumda uygulama zaten localStorage'daki
   son listeyi gösterir.

   Kabuk dosyaları değiştiğinde CACHE sürümünü artırın.
   ============================================================ */

const CACHE = "eczane-kabuk-v5";

const SHELL = [
  ".",
  "index.html",
  "css/style.css",
  "js/data.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "vendor/leaflet/leaflet.css",
  "vendor/leaflet/leaflet.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) return;   // CollectAPI vb. dış istekler
  if (url.pathname.startsWith("/api")) return;  // canlı veri her zaman ağdan

  e.respondWith(staleWhileRevalidate(e.request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });

  const fromNetwork = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);

  return cached || fromNetwork;
}
