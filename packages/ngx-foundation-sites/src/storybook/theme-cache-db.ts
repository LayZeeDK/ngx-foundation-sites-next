/**
 * IndexedDB Cache for Compiled Theme CSS
 *
 * Provides persistent storage for compiled CSS across browser sessions.
 * This enables instant theme restoration on page refresh instead of
 * waiting for recompilation (~1500ms → ~5ms).
 *
 * Storage structure:
 * - Database: 'nfs-theme-cache'
 * - Object store: 'compiled-css'
 * - Key: Cache version + theme state hash
 * - Value: { css: string, timestamp: number }
 *
 * @example
 * ```typescript
 * // Store compiled CSS
 * await setPersistedCSS('accordion:abc123', accordionCss);
 *
 * // Retrieve on page load
 * const css = await getPersistedCSS('accordion:abc123');
 * if (css) {
 *   injectCSS(css); // Instant!
 * }
 * ```
 */

const DB_NAME = 'nfs-theme-cache';
const DB_VERSION = 1;
const STORE_NAME = 'compiled-css';

/**
 * Cache version prefix for invalidation.
 * Increment this when Sass sources change in a way that would
 * produce different CSS output for the same theme state.
 *
 * v1 → v2: Added full Foundation variable support (56 variables)
 *          with LinkedColorValue types and reorganized ThemeState
 * v2 → v3: WCAG-compliant default palette (#0c5f91 replaces #1779ba)
 * v3 → v4: Fixed MutationObserver to disable dynamically-loaded stylesheets
 * v4 → v5: Adjusted WCAG palette to barely exceed 4.5:1 minimum (#146ba5 etc.)
 */
const CACHE_VERSION = 'v5';

/**
 * Maximum age for cached entries (7 days in milliseconds).
 * Entries older than this are considered stale and will be recompiled.
 */
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Cached entry structure stored in IndexedDB.
 */
interface CacheEntry {
  /** Versioned cache key */
  key: string;
  /** Compiled CSS string */
  css: string;
  /** Timestamp when cached (for expiration) */
  timestamp: number;
}

/** Cached database connection */
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens (or creates) the IndexedDB database.
 * Connection is cached for reuse across calls.
 */
function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('[theme-cache-db] Failed to open IndexedDB:', request.error);
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Creates a versioned cache key.
 * The version prefix ensures old cache entries are invalidated
 * when the cache format or Sass sources change.
 *
 * @param rawKey - The unversioned key (e.g., "accordion:abc123")
 * @returns Versioned key (e.g., "v1:accordion:abc123")
 */
export function createCacheKey(rawKey: string): string {
  return `${CACHE_VERSION}:${rawKey}`;
}

/**
 * Retrieves cached CSS from IndexedDB.
 *
 * @param key - The cache key (should include version prefix)
 * @returns The cached CSS string, or null if not found/expired/error
 */
export async function getPersistedCSS(key: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if entry has expired
        const age = Date.now() - entry.timestamp;
        if (age > MAX_CACHE_AGE_MS) {
          console.log(
            `[theme-cache-db] Cache expired (age: ${Math.round(age / 1000 / 60 / 60)}h)`,
          );
          resolve(null);
          return;
        }

        resolve(entry.css);
      };

      request.onerror = () => {
        console.warn(
          '[theme-cache-db] Failed to read from IndexedDB:',
          request.error,
        );
        resolve(null);
      };
    });
  } catch {
    // IndexedDB not available (private browsing, etc.)
    return null;
  }
}

/**
 * Stores compiled CSS in IndexedDB for persistence.
 *
 * @param key - The cache key (should include version prefix)
 * @param css - The compiled CSS to store
 */
export async function setPersistedCSS(key: string, css: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const entry: CacheEntry = {
        key,
        css,
        timestamp: Date.now(),
      };

      store.put(entry);

      tx.oncomplete = () => {
        resolve();
      };

      tx.onerror = () => {
        console.warn(
          '[theme-cache-db] Failed to write to IndexedDB:',
          tx.error,
        );
        resolve(); // Non-fatal, just log
      };
    });
  } catch {
    // IndexedDB not available, silently fail
  }
}

/**
 * Clears all cached entries from IndexedDB.
 * Useful for development when Sass sources change.
 */
export async function clearPersistedCache(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();

      tx.oncomplete = () => {
        console.log('[theme-cache-db] Cache cleared');
        resolve();
      };

      tx.onerror = () => {
        console.warn('[theme-cache-db] Failed to clear IndexedDB:', tx.error);
        resolve();
      };
    });
  } catch {
    // IndexedDB not available
  }
}

/**
 * Gets cache statistics for debugging.
 *
 * @returns Object with entry count and total size estimate
 */
export async function getCacheStats(): Promise<{
  entries: number;
  sizeKB: number;
}> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        const totalBytes = entries.reduce(
          (sum, e) => sum + e.css.length * 2,
          0,
        ); // UTF-16
        resolve({
          entries: entries.length,
          sizeKB: Math.round(totalBytes / 1024),
        });
      };

      request.onerror = () => {
        resolve({ entries: 0, sizeKB: 0 });
      };
    });
  } catch {
    return { entries: 0, sizeKB: 0 };
  }
}
