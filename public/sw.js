// sw.js
const CACHE_NAME = "uber-app-" + "{{VERSION}}"
const STATIC_FILES = ["/", "/index.html", "/style.css", "/app.js", "/icon.png"]

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  )
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", event => {
  if (event.request.url.includes("/accounts") || event.request.url.includes("/test-whatsapp")) return
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  )
})