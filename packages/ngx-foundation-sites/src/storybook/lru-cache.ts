/**
 * LRU (Least Recently Used) Cache
 *
 * A bounded cache that automatically evicts the oldest unused entries when
 * the maximum size is reached. Uses JavaScript Map's insertion order to
 * track recency efficiently.
 *
 * @example
 * ```typescript
 * const cache = new LruCache<string, string>(3);
 * cache.set('a', '1');
 * cache.set('b', '2');
 * cache.set('c', '3');
 * cache.get('a');        // '1' - moves 'a' to most recent
 * cache.set('d', '4');   // Evicts 'b' (least recently used)
 * cache.has('b');        // false
 * ```
 */
export class LruCache<K, V> {
  readonly #maxSize: number;
  readonly #cache = new Map<K, V>();

  constructor(maxSize: number) {
    if (maxSize < 1) {
      throw new Error('LruCache maxSize must be at least 1');
    }
    this.#maxSize = maxSize;
  }

  /**
   * Gets a value from the cache and marks it as recently used.
   * @param key - The key to look up
   * @returns The value if found, undefined otherwise
   */
  get(key: K): V | undefined {
    const value = this.#cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used) by delete + re-insert
      this.#cache.delete(key);
      this.#cache.set(key, value);
    }
    return value;
  }

  /**
   * Sets a value in the cache, evicting the oldest entry if at capacity.
   * @param key - The key to set
   * @param value - The value to store
   */
  set(key: K, value: V): void {
    // Delete first to update position if key exists
    this.#cache.delete(key);
    this.#cache.set(key, value);

    // Evict oldest (first) entry if over capacity
    if (this.#cache.size > this.#maxSize) {
      const oldestKey = this.#cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.#cache.delete(oldestKey);
      }
    }
  }

  /**
   * Checks if a key exists in the cache (does NOT update recency).
   * @param key - The key to check
   * @returns True if the key exists
   */
  has(key: K): boolean {
    return this.#cache.has(key);
  }

  /**
   * Removes all entries from the cache.
   */
  clear(): void {
    this.#cache.clear();
  }

  /**
   * Gets the current number of entries in the cache.
   */
  get size(): number {
    return this.#cache.size;
  }

  /**
   * Gets the maximum capacity of the cache.
   */
  get maxSize(): number {
    return this.#maxSize;
  }
}
