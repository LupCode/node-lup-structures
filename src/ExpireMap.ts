type ExpireMapOptions = {
  /** Default time in milliseconds after which an entry expires (if zero or not set entries will not expire by default). */
  defaultMaxAge?: number | null;

  /** Whether to extend the expiration time on access (default false). */
  resetLifespanOnAccess?: boolean;
};

type ExpireMapEntry<V> = { value: V; lifespan: number | undefined; expireTime: number | undefined };

/**
 * Map that expires entries after a certain time.
 */
export default class ExpireMap<K, V> {
  private _defaultMaxAge: number | undefined;
  private _resetLifespanOnAccess: boolean;
  private _map: Map<K, ExpireMapEntry<V>> = new Map();
  private _expireTimes: number[] = [];
  private _expireKeys: K[] = [];

  /**
   * Creates a new ExpireMap.
   *
   * @param defaultMaxAge Default time in milliseconds after which an entry expires (if not)
   */
  constructor(options?: ExpireMapOptions, entries?: Iterable<[K, V]>) {
    this._defaultMaxAge = options?.defaultMaxAge ?? undefined;
    this._resetLifespanOnAccess = options?.resetLifespanOnAccess ?? false;
    if (entries) this.setAll(entries);
  }

  // if duplicate keys returns the index of the first one
  private _findIndexFirst(timestamp: number): number {
    let low = 0;
    let high = this._expireTimes.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const cmp = timestamp - (this._expireTimes[mid] as number);
      if (cmp <= 0) {
        // special to deal with duplicates
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return low;
  }

  // if duplicate keys returns the index of the last one
  private _findIndexLast(timestamp: number): number {
    let low = 0;
    let high = this._expireTimes.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const cmp = timestamp - (this._expireTimes[mid] as number);
      if (cmp < 0) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return low;
  }

  private _cleanup() {
    if (this._expireTimes.length === 0) return;

    const now = Date.now();
    let i = 0;
    while (i < this._expireTimes.length) {
      if ((this._expireTimes[i] as number) > now) break;
      const key = this._expireKeys[i] as K;
      this._map.delete(key);
      i++;
    }
    if (i > 0) {
      this._expireTimes.splice(0, i);
      this._expireKeys.splice(0, i);
    }
  }

  private _deleteFromIndexes(key: K, expireTime: number | undefined): void {
    if (expireTime === undefined) return;
    let idx = this._findIndexFirst(expireTime); // first entry with same timestamp but might not be the same key
    while (idx < this._expireTimes.length && this._expireTimes[idx] === expireTime) {
      if (this._expireKeys[idx] === key) {
        this._expireTimes.splice(idx, 1);
        this._expireKeys.splice(idx, 1);
        break;
      }
      idx++;
    }
  }

  private _insertIntoIndexes(key: K, expireTime: number | undefined): void {
    if (expireTime === undefined) return;
    const idx = this._findIndexLast(expireTime); // insert position
    this._expireTimes.splice(idx, 0, expireTime);
    this._expireKeys.splice(idx, 0, key);
  }

  private _resetLifespanInIndexes(key: K, oldInfo: ExpireMapEntry<V>, lifespan: number | undefined): void {
    if (oldInfo.expireTime !== undefined) this._deleteFromIndexes(key, oldInfo.expireTime);
    if (lifespan !== undefined) {
      this._insertIntoIndexes(key, Date.now() + lifespan);
      oldInfo.expireTime = Date.now() + lifespan;
    } else {
      oldInfo.expireTime = undefined;
    }
    oldInfo.lifespan = lifespan;
  }

  /**
   * Returns the default maximum age for entries in milliseconds if set.
   * @returns Default maximum age in milliseconds or undefined if not set.
   */
  public getDefaultMaxAge(): number | undefined {
    return this._defaultMaxAge;
  }

  /**
   * Sets the default maximum age for entries in milliseconds.
   * Previously stored entries are not affected.
   * If not set, entries do not expire by default.
   * @param ms Default maximum age in milliseconds. If zero, undefined, or null, entries will not expire by default.
   */
  public setDefaultMaxAge(ms: number | undefined | null): void {
    this._defaultMaxAge = ms && ms > 0 ? ms : undefined;
  }

  /**
   * Returns whether accessing an entry resets its expiration time.
   * @returns True if accessing an entry resets its expiration time, false otherwise.
   */
  public getResetLifespanOnAccess(): boolean {
    return this._resetLifespanOnAccess;
  }

  /**
   * Sets whether accessing an entry resets its expiration time.
   * @param value True to reset expiration time on access, false otherwise.
   */
  public setResetLifespanOnAccess(value: boolean): void {
    this._resetLifespanOnAccess = value;
  }

  /**
   * Clears the map.
   */
  clear(): void {
    this._map.clear();
    this._expireTimes = [];
    this._expireKeys = [];
  }

  /**
   * Deletes a key from the map.
   * @param key Key to delete.
   * @returns Value associated with the key, or undefined if the key was not found.
   */
  public delete(key: K): V | undefined {
    const previous = this._map.get(key);
    this._map.delete(key);
    this._deleteFromIndexes(key, previous?.expireTime);
    return previous?.value;
  }

  /**
   * Returns an iterator over the non-expired entries in the map.
   *
   * @returns An iterator over the non-expired entries.
   */
  public *entries(): IterableIterator<[K, V]> {
    this._cleanup();
    for (const [key, info] of this._map.entries()) {
      // skip expired entries
      if (info.expireTime !== undefined && Date.now() >= info.expireTime) continue;

      // reset expiration time on access
      if (this._resetLifespanOnAccess) this._resetLifespanInIndexes(key, info, info.lifespan);

      yield [key, info.value];
    }
  }

  /**
   * Executes a provided function once per each key/value pair in the Map.
   * @param callbackfn Function to execute for each entry.
   * @param thisArg Value to use as this when executing callbackfn.
   */
  public forEach(callbackfn: (value: V, key: K, map: ExpireMap<K, V>) => void, thisArg?: any): void {
    this._cleanup();
    for (const [key, info] of this._map.entries()) {
      // skip expired entries
      if (info.expireTime !== undefined && Date.now() >= info.expireTime) continue;

      // reset expiration time on access
      if (this._resetLifespanOnAccess) this._resetLifespanInIndexes(key, info, info.lifespan);

      callbackfn.call(thisArg, info.value, key, this);
    }
  }

  /**
   * Gets the value associated with a key if it exists and has not expired.
   * Does not refresh the expiration time.
   *
   * @param key The key.
   * @returns The value associated with the key, or undefined if there is none or it has expired.
   */
  public get(key: K): V | undefined {
    this._cleanup();
    const info = this._map.get(key);
    if (!info) return undefined;

    // reset expiration time on access
    if (this._resetLifespanOnAccess) this._resetLifespanInIndexes(key, info, info.lifespan);

    return info.value;
  }

  /**
   * Returns the remaining lifespan of a key in milliseconds.
   * If the key exists but has no expiration, returns null.
   * If the key does not exist or has expired, returns undefined.
   * @param key The key to check.
   * @returns Remaining lifespan in milliseconds, null if no expiration, or undefined.
   */
  public getRemainingLifespan(key: K): number | null | undefined {
    const entry = this._map.get(key);
    if (!entry) return undefined;
    if (entry.expireTime === undefined) return null;
    const remaining = entry.expireTime - Date.now();
    return remaining > 0 ? remaining : undefined;
  }

  /**
   * Checks if a key exists in the map and has not expired.
   *
   * @param key The key.
   * @returns True if the key exists and has not expired, false otherwise.
   */
  public has(key: K): boolean {
    this._cleanup();
    if (this._resetLifespanOnAccess) {
      const info = this._map.get(key);
      if (!info) return false;
      this._resetLifespanInIndexes(key, info, info.lifespan);
      return true;
    } else {
      return this._map.has(key);
    }
  }

  /**
   * Returns an iterator over the non-expired keys in the map.
   *
   * @returns An iterator over the non-expired keys.
   */
  public *keys(): IterableIterator<K> {
    this._cleanup();
    for (const [key, info] of this._map.entries()) {
      // skip expired entries
      if (info.expireTime !== undefined && Date.now() >= info.expireTime) continue;

      // reset expiration time on access
      if (this._resetLifespanOnAccess) this._resetLifespanInIndexes(key, info, info.lifespan);

      yield key;
    }
  }

  /**
   * Resets the age of a key by setting its expiration time to now + its lifespan.
   * If a maxAge is provided, it is set for the key even if it did not have a lifespan before.
   * If key already expired, does nothing and returns false.
   * @param key Key to reset.
   * @param maxAge Optional new max age to set for the key. If zero the key will not expire. If null the default max age is used. If undefined, the previous lifespan is used.
   * @returns True if the key exists and was reset or the key did not have a lifespan, false otherwise.
   */
  public resetAge(key: K, maxAge?: number | null): boolean {
    this._cleanup();
    const info = this._map.get(key);
    if (!info) return false;

    const lifespan =
      maxAge === undefined ? info.lifespan : maxAge === null ? this._defaultMaxAge : maxAge > 0 ? maxAge : undefined;
    this._resetLifespanInIndexes(key, info, lifespan);
    return true;
  }

  /**
   * Resets the age of all keys by setting their expiration time to now + their lifespan.
   * If a maxAge is provided, it is set for all keys even for those that did not have a lifespan before.
   * If a key already expired, it is skipped.
   * @param maxAge Optional new max age to set for all keys. If zero the keys will not expire. If null the default max age is used. If undefined, the previous lifespan is used.
   */
  public resetAgeOfAll(maxAge?: number | null): void {
    this._cleanup();
    for (const [key, info] of this._map.entries()) {
      const lifespan =
        maxAge === undefined ? info.lifespan : maxAge === null ? this._defaultMaxAge : maxAge > 0 ? maxAge : undefined;
      this._resetLifespanInIndexes(key, info, info.lifespan);
    }
  }

  /**
   * Sets a key-value pair in the map.
   *
   * @param key The key.
   * @param value The value.
   * @param maxAge Time in milliseconds after which the entry expires. If not set, the default expire time is used.
   */
  public set(key: K, value: V, maxAge?: number): V | undefined {
    this._cleanup();
    const lifespan = maxAge ?? this._defaultMaxAge;
    const expireTime = lifespan !== undefined ? Date.now() + lifespan : undefined;

    // delete previous entry from expireTimes
    const previousValue = this._map.get(key);
    this._deleteFromIndexes(key, previousValue?.expireTime);

    // insert/update new entry in expireTimes
    this._map.set(key, { value, lifespan, expireTime });
    this._insertIntoIndexes(key, expireTime);
    return previousValue?.value;
  }

  /**
   * Sets multiple key-value pairs in the map.
   *
   * @param entries An iterable of key-value pairs.
   * @param maxAge Time in milliseconds after which the entries expire. If not set, the default expire time is used.
   */
  public setAll(entries: Iterable<[K, V]>, maxAge?: number): void {
    this._cleanup();
    const lifespan = maxAge ?? this._defaultMaxAge;
    const expireTime = lifespan !== undefined ? Date.now() + lifespan : undefined;

    for (const [key, value] of entries) {
      // delete previous entry from expireTimes
      this.delete(key);

      // insert/update new entry in expireTimes
      this._map.set(key, { value, lifespan, expireTime });
      this._insertIntoIndexes(key, expireTime);
    }
  }

  /**
   * Returns the number of non-expired entries in the map.
   * @returns Number of non-expired entries.
   */
  public get size(): number {
    this._cleanup();
    return this._map.size;
  }

  /**
   * Returns a debug string representation of the ExpireMap.
   * @returns Debug string representation.
   */
  public toDebugString(): string {
    let result = 'ExpireMap {\n';
    result += '  map=[\n';
    for (const [key, info] of this._map.entries()) {
      result +=
        '    ' +
        key +
        ' = ' +
        JSON.stringify({ ...info, expired: info.expireTime !== undefined && Date.now() >= info.expireTime }) +
        '\n';
    }
    result += '  ]\n';
    result += '  expireTimes=[ ' + this._expireTimes.join(', ') + ' ]\n';
    result += '  expireKeys=[ ' + this._expireKeys.join(', ') + ' ]\n';
    result += '}';
    return result;
  }

  /**
   * Returns an iterator over the non-expired values in the map.
   *
   * @returns An iterator over the non-expired values.
   */
  public *values(): IterableIterator<V> {
    this._cleanup();
    for (const [key, info] of this._map.entries()) {
      // skip expired entries
      if (info.expireTime !== undefined && Date.now() >= info.expireTime) continue;

      // reset expiration time on access
      if (this._resetLifespanOnAccess) this._resetLifespanInIndexes(key, info, info.lifespan);

      yield info.value;
    }
  }
}
