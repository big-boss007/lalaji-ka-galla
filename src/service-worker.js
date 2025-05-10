/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this version of the app.
const CACHE_NAME = `mobile-ledger-cache-${version}`;

// List of assets to cache on installation.
const ASSETS_TO_CACHE = [...build, ...files];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event fired');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('[ServiceWorker] Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event fired');
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // console.log('[ServiceWorker] Fetch event for:', event.request.url);
  // Basic cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // console.log('[ServiceWorker] Found in cache:', event.request.url);
          return response;
        }
        // console.log('[ServiceWorker] Network request for:', event.request.url);
        return fetch(event.request).then(
          (response) => {
            // Optional: Cache new resources dynamically if needed
            // if(!response || response.status !== 200 || response.type !== 'basic') {
            //   return response;
            // }
            // const responseToCache = response.clone();
            // caches.open(CACHE_NAME)
            //   .then(cache => {
            //     cache.put(event.request, responseToCache);
            //   });
            return response;
          }
        );
      })
      .catch(error => {
        console.error('[ServiceWorker] Fetch failed; returning offline page if available or error:', error);
        // Optionally, return a fallback offline page
        // return caches.match('/offline.html');
      })
  );
});
