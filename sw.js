const CACHE = 'english-forge-v14';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './assets/vocabulary.js',
  './assets/icon.svg',
  './data/curriculum.js',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => null);
      if (cached) {
        event.waitUntil(network.catch(() => null));
        return cached;
      }
      return network.then(response =>
        response || caches.match('./index.html').then(hit => hit || Response.error())
      );
    })
  );
});
