const DEFAULT_SORTED_MAP_INITIAL_CAPACITY = 16;
const DEFAULT_SORTED_MAP_SCALE_FACTOR = 2;

export type SortedMapOptions = {

    /** The initial capacity of the map how many lots it should hold at the beginning (default 16). */
    initialCapacity?: number;

    /** The factor/multiplier by which the capacity of the map should be increased when it is full (default 2). */
    scaleFactor?: number;

    /** The function to compare keys. */
    compare?: (a: any, b: any) => number;
}

/**
 * Map that keeps its keys sorted.
 * It only allows one value per key.
 */
export class SortedMap<K, V> {
    private myKeys: K[];
    private myValues: V[];
    private size: number = 0;
    private scaleFactor: number;
    private compare: (a: any, b: any) => number;

    constructor(options?: SortedMapOptions){
        this.size = options?.initialCapacity ?? DEFAULT_SORTED_MAP_INITIAL_CAPACITY;
        this.myKeys = new Array(this.size);
        this.myValues = new Array(this.size);
        this.scaleFactor = options?.scaleFactor ?? DEFAULT_SORTED_MAP_SCALE_FACTOR;
        this.compare = options?.compare ?? ((a, b) => a < b ? -1 : (a > b ? 1 : 0));
    }

    private _findIndex(key: K): {index: number, alreadyExists: boolean } {
        let low = 0;
        let high = this.size;
        while(low < high){
            const mid = Math.floor((low + high) / 2);
            const cmp = this.compare(key, this.myKeys[mid]);
            if(cmp < 0){
                high = mid;
            } else if(cmp > 0){
                low = mid + 1;
            } else {
                return { index: mid, alreadyExists: true };
            }
        }
        return { index: low, alreadyExists: false };
    }


    getSize(): number {
        return this.size;
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    entries(): IterableIterator<[K, V]> {
        const self = this;
        let idx = 0;

        return {
            next(): IteratorResult<[K, V]> {
                if(idx < self.size){
                    const key = self.myKeys[idx] as K;
                    const value = self.myValues[idx] as V;
                    idx++;
                    return { value: [key, value], done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<[K, V]> {
                return this;
            }
        };
    }

    entriesBefore(key: K, inclusive: boolean): IterableIterator<[K, V]> {
        const self = this;
        let idx = 0;

        return {
            next(): IteratorResult<[K, V]> {
                if(idx < self.size){
                    const k = self.myKeys[idx] as K;
                    const value = self.myValues[idx] as V;
                    idx++;
                    if(k < key || (inclusive && k === key))
                        return { value: [k, value], done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<[K, V]> {
                return this;
            }
        };
    }

    entriesAfter(key: K, inclusive: boolean): IterableIterator<[K, V]> {
        const self = this;
        let idx = this._findIndex(key).index; // initial index (optimization)

        return {
            next(): IteratorResult<[K, V]> {
                while(idx < self.size){
                    const k = self.myKeys[idx] as K;
                    const value = self.myValues[idx] as V;
                    idx++;
                    if(k > key || (inclusive && k === key))
                        return { value: [k, value], done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<[K, V]> {
                return this;
            }
        };
    }

    keys(): IterableIterator<K> {
        const self = this;
        let idx = 0;

        return {
            next(): IteratorResult<K> {
                if(idx < self.size){
                    const key = self.myKeys[idx] as K;
                    idx++;
                    return { value: key, done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<K> {
                return this;
            }
        };
    }

    keysBefore(key: K, inclusive: boolean): IterableIterator<K> {
        const self = this;
        let idx = 0;

        return {
            next(): IteratorResult<K> {
                if(idx < self.size){
                    const k = self.myKeys[idx] as K;
                    idx++;
                    if(k < key || (inclusive && k === key))
                        return { value: k, done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<K> {
                return this;
            }
        };
    }

    keysAfter(key: K, inclusive: boolean): IterableIterator<K> {
        const self = this;
        let idx = this._findIndex(key).index; // initial index (optimization)

        return {
            next(): IteratorResult<K> {
                while(idx < self.size){
                    const k = self.myKeys[idx] as K;
                    idx++;
                    if(k > key || (inclusive && k === key))
                        return { value: k, done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<K> {
                return this;
            }
        };
    }

    values(): IterableIterator<V> {
        const self = this;
        let idx = 0;

        return {
            next(): IteratorResult<V> {
                if(idx < self.size){
                    const value = self.myValues[idx] as V;
                    idx++;
                    return { value, done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<V> {
                return this;
            }
        };
    }

    valuesBefore(key: K, inclusive: boolean): IterableIterator<V> {
        const self = this;
        let idx = 0;

        return {
            next(): IteratorResult<V> {
                if(idx < self.size){
                    const k = self.myKeys[idx] as K;
                    const value = self.myValues[idx] as V;
                    idx++;
                    if(k < key || (inclusive && k === key))
                        return { value, done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<V> {
                return this;
            }
        };
    }

    valuesAfter(key: K, inclusive: boolean): IterableIterator<V> {
        const self = this;
        let idx = this._findIndex(key).index; // initial index (optimization)

        return {
            next(): IteratorResult<V> {
                while(idx < self.size){
                    const k = self.myKeys[idx] as K;
                    const value = self.myValues[idx] as V;
                    idx++;
                    if(k > key || (inclusive && k === key))
                        return { value, done: false };
                }
                return { value: undefined, done: true };
            },

            [Symbol.iterator](): IterableIterator<V> {
                return this;
            }
        };
    }

    forEach(callback: (value: V, key: K, map: SortedMap<K, V>) => void): void {
        for(let i=0; i<this.size; i++){
            callback(this.myValues[i] as V, this.myKeys[i] as K, this);
        }
    }

    set(key: K, value: V): void {
        if(this.size === this.myKeys.length){
            this.size *= this.scaleFactor;
            this.myKeys = this.myKeys.concat(new Array(this.size));
            this.myValues = this.myValues.concat(new Array(this.size));
        } else {
            this.size++;
        }
        const foundIdx = this._findIndex(key);
        if(foundIdx.alreadyExists){
            this.myValues[foundIdx.index] = value;
        } else {
            // shift elements to the right to make space for new element
            /*for(let i=this.size-1; i > foundIdx.index; i--){
                this.myKeys[i] = this.myKeys[i-1] as K;
                this.myValues[i] = this.myValues[i-1] as V;
            }
            this.myKeys[foundIdx.index] = key;
            this.myValues[foundIdx.index] = value;*/
            this.myKeys.splice(foundIdx.index, 0, key);
            this.myValues.splice(foundIdx.index, 0, value);
        }
    }

    has(key: K): boolean {
        return this._findIndex(key).alreadyExists;
    }

    get(key: K): V | undefined {
        const foundIdx = this._findIndex(key);
        if(foundIdx.alreadyExists){
            return this.myValues[foundIdx.index];
        }
        return undefined;
    }

    delete(key: K): void {
        const foundIdx = this._findIndex(key);
        if(foundIdx.alreadyExists){
            // shift all elements after found index to the left
            /*for(let i=foundIdx.index; i < this.size-1; i++){
                this.myKeys[i] = this.myKeys[i+1] as K;
                this.myValues[i] = this.myValues[i+1] as V;
            }*/
            this.myKeys.splice(foundIdx.index, 1);
            this.myValues.splice(foundIdx.index, 1);
            this.size--;
        }
    }
}
