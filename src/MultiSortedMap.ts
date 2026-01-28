import { SortedMap, SortedMapOptions } from "./SortedMap";

/**
 * Map that keeps its keys sorted.
 * It allows multiple values per key.
 */
export class MultiSortedMap<K, V> {
    private map: SortedMap<K, V[]>;

    constructor(options?: SortedMapOptions){
        this.map = new SortedMap(options);
    }

    getSize(): number {
        return this.map.getSize();
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    entries(): IterableIterator<[K, V]> {
        const self = this;
        const it = self.map.entries();
        let currKey: K | undefined = undefined;
        let currValues: V[] | undefined = undefined;
        let currIdx = 0;

        return {
            next(): IteratorResult<[K, V]> {
                while(!currKey || !currValues || currIdx >= currValues.length){
                    const next = it.next();
                    if(next.done){
                        return { value: undefined, done: true };
                    }
                    [currKey, currValues] = next.value;
                    currIdx = 0;
                }
                const value = currValues[currIdx] as V;
                currIdx++;
                return { value: [currKey, value], done: false };
            },

            [Symbol.iterator](): IterableIterator<[K, V]> {
                return this;
            }
        };
    }

    entriesBefore(key: K, inclusive: boolean): IterableIterator<[K, V]> {
        const self = this;
        const it = self.map.entriesBefore(key, inclusive);
        let currKey: K | undefined = undefined;
        let currValues: V[] | undefined = undefined;
        let currIdx = 0;

        return {
            next(): IteratorResult<[K, V]> {
                while(!currKey || !currValues || currIdx >= currValues.length){
                    const next = it.next();
                    if(next.done){
                        return { value: undefined, done: true };
                    }
                    [currKey, currValues] = next.value;
                    currIdx = 0;
                }
                const value = currValues[currIdx] as V;
                currIdx++;
                return { value: [currKey, value], done: false };
            },

            [Symbol.iterator](): IterableIterator<[K, V]> {
                return this;
            }
        };
    }

    entriesAfter(key: K, inclusive: boolean): IterableIterator<[K, V]> {
        const self = this;
        const it = self.map.entriesAfter(key, inclusive);
        let currKey: K | undefined = undefined;
        let currValues: V[] | undefined = undefined;
        let currIdx = 0;

        return {
            next(): IteratorResult<[K, V]> {
                while(!currKey || !currValues || currIdx >= currValues.length){
                    const next = it.next();
                    if(next.done){
                        return { value: undefined, done: true };
                    }
                    [currKey, currValues] = next.value;
                    currIdx = 0;
                }
                const value = currValues[currIdx] as V;
                currIdx++;
                return { value: [currKey, value], done: false };
            },

            [Symbol.iterator](): IterableIterator<[K, V]> {
                return this;
            }
        };
    }

    keys(): IterableIterator<K> {
        return this.map.keys();
    }

    keysBefore(key: K, inclusive: boolean): IterableIterator<K> {
        return this.map.keysBefore(key, inclusive);
    }

    keysAfter(key: K, inclusive: boolean): IterableIterator<K> {
        return this.map.keysAfter(key, inclusive);
    }

    values(): IterableIterator<V> {
        const self = this;
        const it = self.map.values();
        let currValues: V[] | undefined = undefined;
        let currIdx = 0;

        return {
            next(): IteratorResult<V> {
                while(!currValues || currIdx >= currValues.length){
                    const next = it.next();
                    if(next.done){
                        return { value: undefined, done: true };
                    }
                    currValues = next.value;
                    currIdx = 0;
                }
                const value = currValues[currIdx] as V;
                currIdx++;
                return { value, done: false };
            },

            [Symbol.iterator](): IterableIterator<V> {
                return this;
            }
        };
    }

    valuesBefore(key: K, inclusive: boolean): IterableIterator<V> {
        const self = this;
        const it = self.map.valuesBefore(key, inclusive);
        let currValues: V[] | undefined = undefined;
        let currIdx = 0;

        return {
            next(): IteratorResult<V> {
                while(!currValues || currIdx >= currValues.length){
                    const next = it.next();
                    if(next.done){
                        return { value: undefined, done: true };
                    }
                    currValues = next.value;
                    currIdx = 0;
                }
                const value = currValues[currIdx] as V;
                currIdx++;
                return { value, done: false };
            },

            [Symbol.iterator](): IterableIterator<V> {
                return this;
            }
        };
    }

    valuesAfter(key: K, inclusive: boolean): IterableIterator<V> {
        const self = this;
        const it = self.map.valuesAfter(key, inclusive);
        let currValues: V[] | undefined = undefined;
        let currIdx = 0;

        return {
            next(): IteratorResult<V> {
                while(!currValues || currIdx >= currValues.length){
                    const next = it.next();
                    if(next.done){
                        return { value: undefined, done: true };
                    }
                    currValues = next.value;
                    currIdx = 0;
                }
                const value = currValues[currIdx] as V;
                currIdx++;
                return { value, done: false };
            },

            [Symbol.iterator](): IterableIterator<V> {
                return this;
            }
        };
    }


    set(key: K, value: V): void {
        const values = this.map.get(key) ?? [];
        values.push(value);
        this.map.set(key, values);
    }

    get(key: K): V[] | undefined {
        return this.map.get(key);
    }

    delete(key: K): void {
        this.map.delete(key);
    }

    deleteValue(key: K, value: V): void {
        const values = this.map.get(key);
        if(values){
            const idx = values.indexOf(value);
            if(idx >= 0){
                const newValues = values.splice(idx, 1);
                if(newValues.length > 0){
                    this.map.set(key, newValues);
                } else {
                    this.map.delete(key);
                }
            }
        }
    }
}