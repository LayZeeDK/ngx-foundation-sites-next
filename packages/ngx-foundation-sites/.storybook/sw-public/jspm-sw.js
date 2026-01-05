/**
 * Service Worker for caching JSPM CDN modules (Dart Sass)
 *
 * This SW intercepts requests to jspm.dev and caches them using a cache-first
 * strategy. JSPM serves versioned, immutable npm packages, making them ideal
 * for aggressive caching.
 *
 * Why Service Worker instead of IndexedDB:
 * - ES modules loaded from blob URLs can't resolve internal imports like `/npm:immutable@4`
 * - Service Workers return cached responses with the **original URL intact**
 * - This allows the module's internal imports to resolve correctly against jspm.dev
 *
 * Performance impact:
 * - First load: ~200ms (network fetch)
 * - HTTP cache: ~50-70ms
 * - SW cache: ~0-5ms (near-instant)
 */

const CACHE_NAME = 'jspm-cdn-v1';
const JSPM_ORIGIN = 'https://jspm.dev';

self.addEventListener('install', () => {
  console.log('[jspm-sw] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[jspm-sw] Activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // Delete old versioned caches (jspm-cdn-v0, etc.)
        return Promise.all(
          cacheNames
            .filter(
              (name) => name.startsWith('jspm-cdn-') && name !== CACHE_NAME,
            )
            .map((name) => {
              console.log(`[jspm-sw] Deleting old cache: ${name}`);
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      }),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept JSPM CDN requests
  // This avoids interfering with Storybook HMR and other requests
  if (url.origin !== JSPM_ORIGIN) {
    return;
  }

  // Cache-first strategy for JSPM modules
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[jspm-sw] Cache hit: ${url.pathname}`);
          return cachedResponse;
        }

        console.log(`[jspm-sw] Cache miss, fetching: ${url.pathname}`);
        return fetch(event.request).then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse.ok) {
            // Clone before caching (response can only be consumed once)
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    }),
  );
});
