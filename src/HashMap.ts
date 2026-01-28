import { LinkedListComparator } from "./Interfaces";
import { ObjectLinkedList } from "./ObjectLinkedList";

/**
 * Abstract base class for keys used in the HashMap.
 */
export interface HashMapKey<KEY extends HashMapKey<KEY>> {

    /**
     * Returns a hash string for this key.
     * Collisions should be minimized but are allowed.
     * @return Hash string.
     */
    hashCode(): string;

    /**
     * Compares this key to another key for equality.
     * @param other Other key to compare to.
     * @returns True if the keys are equal, false otherwise.
     */
    equals(other: KEY): boolean;
}



class HashMapEntry<K extends HashMapKey<K>, V> implements LinkedListComparator<HashMapEntry<K, V>> {
    public readonly key: K;
    public value: V;

    constructor(key: K, value: V){
        this.key = key;
        this.value = value;
    }

    equals(other: HashMapEntry<K, V>): boolean {
        return this.key.equals(other.key);
    }
}



/**
 * High performance hash map implementation using user-defined hash and equality functions.
 */
export class HashMap<K extends HashMapKey<K>, V> {
    private _size: number = 0;
    private _map: Map<string, ObjectLinkedList<HashMapEntry<K, V>>> = new Map();

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
        const hash = key.hashCode();
        const list = this._map.get(hash);
        if(!list) return undefined;
        const oldValue = list.remove(key);
        if(!oldValue) return undefined;
        this._size--;
        if(list.length === 0){
            this._map.delete(hash);
        }
        return oldValue.value;
    }

    /**
     * Returns an iterator over all entries in the hash map.
     * @returns Iterator of [key, value] pairs.
     */
    public *entries(): IterableIterator<[K, V]> {
        for(const list of this._map.values()){
            for(const entry of list){
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
        for(const list of this._map.values()){
            for(const entry of list){
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
        const list = this._map.get(key.hashCode());
        if(!list) return undefined;
        return list.getByComparator(key)?.value;
    }

    /**
     * Checks whether the hash map contains the given key.
     * @param key Key to look for.
     * @returns True if the key exists, false otherwise.
     */
    public has(key: K): boolean {
        const list = this._map.get(key.hashCode());
        if(!list) return false;
        return list.includes(key);
    }

    /**
     * Adds a value in the hash map or updates it if the key already exists.
     * @param key Key of the value.
     * @param value Value to set.
     * @returns Previous value associated with the key, or undefined if the key did not exist.
     */
    public set(key: K, value: V): V | undefined {
        const hash = key.hashCode();
        const list = this._map.get(hash);
        if(list){
            const oldValue = list.setByComparator(key, new HashMapEntry(key, value), true);
            if(oldValue){
                return oldValue.value;
            }
            this._size++;
            return undefined;
        }
        this._map.set(hash, new ObjectLinkedList<HashMapEntry<K, V>>([new HashMapEntry(key, value)]));
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