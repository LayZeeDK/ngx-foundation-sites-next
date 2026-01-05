/**
 * Service Worker Registration for JSPM CDN Caching
 *
 * Registers a Service Worker that caches JSPM CDN modules (Dart Sass).
 * This reduces Sass module loading latency from ~50-70ms (HTTP cache)
 * to near-instant (~0-5ms) by serving from the SW cache.
 *
 * The SW only intercepts jspm.dev requests, leaving Storybook HMR unaffected.
 */

/** Singleton promise to prevent multiple registrations */
let registrationPromise: Promise<ServiceWorkerRegistration | null> | null =
  null;

/**
 * Register the JSPM Service Worker.
 *
 * This function is idempotent - calling it multiple times returns the same promise.
 * Registration is non-blocking; it won't delay Storybook startup.
 *
 * @returns Promise that resolves to the registration, or null if unsupported/failed
 */
export async function registerJspmServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (registrationPromise) {
    return registrationPromise;
  }
  registrationPromise = doRegister();
  return registrationPromise;
}

async function doRegister(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[jspm-sw] Service Workers not supported in this browser');
    return null;
  }

  try {
    // Register SW at root scope to intercept requests from Web Workers
    const registration = await navigator.serviceWorker.register('/jspm-sw.js', {
      scope: '/',
    });

    // Wait for the SW to be ready (activated and controlling)
    await navigator.serviceWorker.ready;

    console.log('[jspm-sw] Service worker ready');
    return registration;
  } catch (error) {
    console.error('[jspm-sw] Registration failed:', error);
    return null;
  }
}

/**
 * Check if the JSPM Service Worker is currently active and controlling the page.
 *
 * @returns true if SW is active, false otherwise
 */
export function isJspmServiceWorkerActive(): boolean {
  return navigator.serviceWorker?.controller !== null;
}

/**
 * Clear the JSPM CDN cache.
 *
 * Useful for development when you need to force a fresh fetch.
 * Can be called from the browser console: `clearJspmCache()`
 */
export async function clearJspmCache(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith('jspm-cdn-'))
      .map((name) => caches.delete(name)),
  );
  console.log('[jspm-sw] Cache cleared');
}

/**
 * Get information about the current Service Worker state.
 *
 * Useful for debugging and benchmark verification.
 */
export async function getJspmServiceWorkerInfo(): Promise<{
  registered: boolean;
  active: string | null;
  controlling: boolean;
  cacheNames: string[];
  cachedUrls: string[];
}> {
  const registration = await navigator.serviceWorker?.getRegistration('/');
  const cacheNames = await caches.keys();
  const jspmCacheNames = cacheNames.filter((name) =>
    name.startsWith('jspm-cdn-'),
  );

  let cachedUrls: string[] = [];
  for (const cacheName of jspmCacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    cachedUrls = cachedUrls.concat(requests.map((r) => r.url));
  }

  return {
    registered: registration !== undefined,
    active: registration?.active?.state ?? null,
    controlling: navigator.serviceWorker?.controller !== null,
    cacheNames: jspmCacheNames,
    cachedUrls,
  };
}

// Expose clearJspmCache globally for console access
if (typeof window !== 'undefined') {
  (
    window as unknown as { clearJspmCache: typeof clearJspmCache }
  ).clearJspmCache = clearJspmCache;
}
