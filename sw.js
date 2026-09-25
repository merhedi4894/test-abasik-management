const CACHE_NAME = 'abasik-cache-v3';
const urlsToCache = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          /* সব পুরোনো cache মুছে ফেলি — v1, v2 সহ */
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* HTML কখনো cache করবে না — সবসময় server থেকে fetch করবে */
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    /* Network-only for HTML — কোনো cache fallback নেই */
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        credentials: 'same-origin'
      }).then(response => {
        return response;
      }).catch(() => {
        /* অফলাইনে শুধু ক্যাশ থেকে দেখাবে */
        return caches.match(event.request);
      })
    );
    return;
  }
  /* Static assets — cache first */
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
