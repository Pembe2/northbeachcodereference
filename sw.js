const CACHE = "nbr-code-reference-v2";
const ASSETS = ["./", "index.html", "styles.css", "app.js", "data/baseline.js", "data/codes-1.js", "data/codes-2.js", "data/codes-3.js", "data/codes-4.js", "data/codes-5.js", "manifest.json"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
