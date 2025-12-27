/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'oathbreakers-static-v1';
const API_CACHE = 'oathbreakers-api-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/',
        '/manifest.json',
        '/icons/icon-192.svg',
        '/icons/icon-512.svg',
      ])
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for API (partial offline support)
  if (url.pathname.startsWith('/api') || url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(API_CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for same-origin assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
