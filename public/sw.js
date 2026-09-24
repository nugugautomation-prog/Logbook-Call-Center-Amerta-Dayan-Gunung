// Self-unregistering service worker to clear out stale legacy Vite cache
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)))
    }).then(() => {
      return self.registration.unregister()
    })
  )
})
