const CACHE_NAME = "uber-app-v1";
const STATIC_FILES = ["/", "/index.html", "/style.css", "/app.js", "/icon.png"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting(); // activa el SW inmediatamente
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // No cachear llamadas a la API
  if (event.request.url.includes("/accounts")) {
    return; // deja pasar directo a la red
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
