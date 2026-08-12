const scopeKey = new URL(self.registration.scope).pathname.replace(/[^a-z0-9]+/gi, "-") || "root";
const CACHE_PREFIX = `nbr-code-reference-${scopeKey}-`;
const CACHE = `${CACHE_PREFIX}v3`;
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "data/baseline.js",
  "data/codes-1.js",
  "data/codes-2.js",
  "data/codes-3.js",
  "data/codes-4.js",
  "data/codes-5.js",
  "manifest.json"
].map(path => new URL(path, self.registration.scope).href);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
