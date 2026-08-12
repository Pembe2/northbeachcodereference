const scopeKey = new URL(self.registration.scope).pathname.replace(/[^a-z0-9]+/gi, "-") || "root";
const CACHE_PREFIX = `nbr-code-reference-${scopeKey}-`;
const CACHE = `${CACHE_PREFIX}v5`;
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
  "data/jobs.js",
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
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request, { cache: "no-store" });
      if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      throw error;
    }
  })());
});
