import LinkedList from './LinkedList';

type HashMapOptions<K> = {
  /**
   * Compares two keys for equality.
   * @param a First key to compare.
   * @param b Second key to compare.
   * @returns True if the keys are equal, false otherwise.
   */
  equals?: (a: K, b: K) => boolean;

  /**
   * Returns a hash string for a key.
   * Collisions should be minimized but are allowed.
   * @param key Key to hash.
   * @return Hash string.
   */
  hashCode: (key: K) => string;
};

type HashMapEntry<K, V> = {
  readonly key: K;
  value: V;
};

/**
 * High performance hash map implementation using user-defined hash and equality functions.
 */
export default class HashMap<K, V> {
  private _size: number = 0;
  private _map: Map<string, LinkedList<HashMapEntry<K, V>>> = new Map();
  private readonly _equals: (a: K, b: K) => boolean;
  private readonly _hashCode: (key: K) => string;
  private readonly _entryEquals = (a: HashMapEntry<K, V>, b: HashMapEntry<K, V>) => this._equals(a.key, b.key);

  public constructor(options: HashMapOptions<K>) {
    this._equals = options.equals ?? ((a: K, b: K) => a === b);
    this._hashCode = options.hashCode;
  }

  /**
   * Clears the hash map.
   */
  public clear(): void {
    this._map.clear();
    this._size = 0;
  }

  /**
   * Deletes the entry with the given key from the hash map.
   * @param key Key of the entry to delete.
   * @returns The previous value associated with the key, or undefined if the key did not exist.
   */
  public delete(key: K): V | undefined {
    const hash = this._hashCode(key);
    const list: LinkedList<HashMapEntry<K, V>> | undefined = this._map.get(hash);
    if (!list) return undefined;
    const oldValue = list.remove({ key, value: undefined as any });
    if (!oldValue) return undefined;
    this._size--;
    if (list.length === 0) {
      this._map.delete(hash);
    }
    return oldValue.value;
  }

  /**
   * Returns an iterator over all entries in the hash map.
   * @returns Iterator of [key, value] pairs.
   */
  public *entries(): IterableIterator<[K, V]> {
    for (const list of this._map.values()) {
      for (const entry of list) {
        yield [entry.key, entry.value];
      }
    }
  }

  /**
   * Executes a provided function once for each key/value pair in the hash map.
   * @param callbackfn Function to execute for each entry.
   * @param thisArg Value to use as this when executing callbackfn.
   */
  public forEach(callbackfn: (value: V, key: K, map: HashMap<K, V>) => void, thisArg?: any): void {
    for (const list of this._map.values()) {
      for (const entry of list) {
        callbackfn.call(thisArg, entry.value, entry.key, this);
      }
    }
  }

  /**
   * Returns the value associated with the given key.
   * @param key Key to look for.
   * @returns Value associated with the key, or undefined if the key does not exist.
   */
  public get(key: K): V | undefined {
    const list = this._map.get(this._hashCode(key));
    if (!list) return undefined;
    return list.getByComparator({ key, value: undefined as any })?.value;
  }

  /**
   * Checks whether the hash map contains the given key.
   * @param key Key to look for.
   * @returns True if the key exists, false otherwise.
   */
  public has(key: K): boolean {
    const list = this._map.get(this._hashCode(key));
    if (!list) return false;
    return list.includes({ key, value: undefined as any });
  }

  /**
   * Adds a value in the hash map or updates it if the key already exists.
   * @param key Key of the value.
   * @param value Value to set.
   * @returns Previous value associated with the key, or undefined if the key did not exist.
   */
  public set(key: K, value: V): V | undefined {
    const hash = this._hashCode(key);
    const list = this._map.get(hash);
    if (list) {
      const oldValue = list.setByComparator({ key, value: undefined as any }, { key, value }, true);
      if (oldValue) {
        return oldValue.value;
      }
      this._size++;
      return undefined;
    }
    this._map.set(hash, new LinkedList<HashMapEntry<K, V>>({ equals: this._entryEquals }, [{ key, value }]));
    this._size++;
    return undefined;
  }

  /**
   * Returns the number of entries in the hash map.
   */
  public get size(): number {
    return this._size;
  }
}
