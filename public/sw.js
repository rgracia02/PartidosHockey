// Self-destructing cleanup worker for iOS / Safari stale cache eradication
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

// Pass through all fetch requests directly to network without caching
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
