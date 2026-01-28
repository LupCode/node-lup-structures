import { LinkedListComparator } from "./Interfaces";

const MAX_ELEMENTS_FOR_TO_STRING = 100;


type DoubleLinkedListNode<T> = {
    value: T;
    next: DoubleLinkedListNode<T> | null;
    prev: DoubleLinkedListNode<T> | null;
};

/**
 * High-performance double linked list with user-defined equality function.
 */
export class ObjectDoubleLinkedList<T extends LinkedListComparator<T>> {
    private _size: number = 0;
    private _head: DoubleLinkedListNode<T> | null = null;
    private _tail: DoubleLinkedListNode<T> | null = null;

    /**
     * Creates a new linked list.
     * @param values Optional initial values to add to the linked list.
     */
    constructor(values?: T[]) {
        if(values){
            this.push(...values);
        }
    }

    /**
     * Adds one or more items to the end of the linked list.
     * @param item Item(s) to add.
     * @return New length of the linked list.
     */
    public add(...item: T[]): number {
        return this.push(...item);
    }

    /** 
     * Returns the value at the specified index.
     * @warning This operation is O(n).
     * @param index Index of the value to retrieve.
     * @return Value at the specified index.
     */
    public at(index: number): T | undefined {
        if(index < 0 || index >= this._size) return undefined;
        let currNode = this._head;
        for(let i=0; i < index; i++){
            currNode = currNode!.next;
        }
        return currNode!.value;
    }

    /** 
     * Clears the linked list.
     */
    public clear(): void {
        this._head = null;
        this._tail = null;
        this._size = 0;
    }

    /** 
     * Concatenates the linked list with other linked lists and returns a new linked list.
     * Does not modify this or the other linked lists.
     * @warning This operation is O(n x m).
     * @param other Other linked lists to concatenate.
     * @return New linked list containing the concatenated values.
     */
    public concat(...other: ObjectDoubleLinkedList<T>[]): ObjectDoubleLinkedList<T> {
        const newList = new ObjectDoubleLinkedList<T>(this.toArray());
        for(const list of other){
            for(const value of list){
                newList.push(value);
            }
        }
        return newList;
    }

    /** 
     * Concatenates the linked list with other linked lists in place.
     * Modifies this linked list.
     * @warning This operation is O(n x m).
     * @param other Other linked lists to concatenate.
     * @return This linked list after concatenation.
     */
    public concatInPlace(...other: ObjectDoubleLinkedList<T>[]): this {
        for(const list of other){
            for(const value of list){
                this.push(value);
            }
        }
        return this;
    }

    /**
     * Returns this object after copying a section of the array identified by start and end to the same array starting at position target.
     * @param target If target is negative, it is treated as length+target where length is the length of the array.
     * @param start If start is negative, it is treated as length+start.
     * @param end If not specified, length of the this object is used as its default value. If end is negative, it is treated as length+end.
     */
    /*public copyWithin(target: number, start: number, end?: number): this {
        target = target < 0 ? this._size + target : target;
        start = start < 0 ? this._size + start : start;
        end = end === undefined ? this._size : (end < 0 ? this._size + end : end);
        
        // TODO IMPLEMENT

        throw new Error("Method not implemented.");
    }*/

    /** 
     * Returns an iterator over the [index, value] pairs in the linked list.
     * @return Iterator over the [index, value] pairs in the linked list.
     */
    public *entries(): IterableIterator<[number, T]> {
        let currNode = this._head;
        let index = 0;
        while(currNode){
            yield [index, currNode.value];
            currNode = currNode.next;
            index++;
        }
    }

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. 
     * The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, 
     * or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     * @returns True if the predicate returns a value coercible to true for every array element; otherwise, false.
     */
    public every<S>(predicate: (value: T, index: number, list: this) => S, thisArg?: any): boolean {
        let currNode = this._head;
        let index = 0;
        while(currNode){
            if(!predicate.call(thisArg, currNode.value, index, this)){
                return false;
            }
            currNode = currNode.next;
            index++;
        }
        return true;
    }

    /**
     * Changes all array elements from start to end index to a static value and returns this modified array.
     * @param value Value to fill array section with.
     * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
     * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
     * @return This modified array.
     */
    public fill(value: T, start?: number, end?: number): this {
        start = start === undefined ? 0 : (start < 0 ? this._size + start : start);
        end = end === undefined ? this._size : (end < 0 ? this._size + end : end);
        if(start < 0) start = 0;
        if(end > this._size) end = this._size;
        if(start >= end) return this;
        let currNode = this._head;
        let index = 0;
        while(currNode && index < start){
            currNode = currNode.next;
            index++;
        }
        while(currNode && index < end){
            currNode.value = value;
            currNode = currNode.next;
            index++;
        }
        return this;
    }

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     * @return A new array with the elements that pass the test. If no elements pass the test, an empty array will be returned.
     */
    public filter<S>(predicate: (value: T, index: number, list: this) => S, thisArg?: any): ObjectDoubleLinkedList<T> {
        const newList = new ObjectDoubleLinkedList<T>();
        let currNode = this._head;
        let index = 0;
        while(currNode){
            if(predicate.call(thisArg, currNode.value, index, this)){
                newList.push(currNode.value);
            }
            currNode = currNode.next;
            index++;
        }
        return newList;
    }

    /**
     * Filters the linked list in place by removing elements that do not satisfy the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filterInPlace method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     * @return This linked list after filtering.
     */
    public filterInPlace<S>(predicate: (value: T, index: number, list: this) => S, thisArg?: any): this {
        let index = 0;

        // find first node that does satisfy the predicate
        while(this._head && !predicate.call(thisArg, this._head.value, index, this)){
            this._head = this._head.next;
            index++;
            this._size--;
        }
        if(!this._head){
            this._tail = null;
            return this;
        }

        // check currNode.next for removal
        let currNode = this._head;
        while(currNode.next){
            if(!predicate.call(thisArg, currNode.next.value, index, this)){
                const nextNode = currNode.next.next;
                currNode.next = nextNode;
                if(nextNode){
                    nextNode.prev = currNode;
                } else {
                    this._tail = currNode;
                }
                this._size--;
                // currNode stays the same because we are always looking on currNode.next
            } else {
                currNode = currNode.next;
            }
            index++;
        }
        return this;
    }
    
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
     * @warning This operation is O(n).
     * @param predicate Calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. 
     * If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
     * @return The value of the first element in the array where predicate is true, and undefined otherwise.
     */
    public find<S>(predicate: (value: T, index: number, list: this) => S, thisArg?: any): T | undefined {
        let currNode = this._head;
        let index = 0;
        while(currNode){
            if(predicate.call(thisArg, currNode.value, index, this)){
                return currNode.value;
            }
            currNode = currNode.next;
            index++;
        }
        return undefined;
    }

    /**
     * findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
     * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
     * @param predicate Calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. 
     * If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
     * @return The index of the first element in the array where predicate is true, and -1 otherwise.
     */
    public findIndex<S>(predicate: (value: T, index: number, list: this) => S, thisArg?: any): number {
        let currNode = this._head;
        let index = 0;
        while(currNode){
            if(predicate.call(thisArg, currNode.value, index, this)){
                return index;
            }
            currNode = currNode.next;
            index++;
        }
        return -1;
    }

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the specified depth.
     * @param depth The maximum recursion depth. If omitted, the default depth is 1.
     * @return A new array with the sub-array elements concatenated into it.
     */
    public flat(depth: number = 1): ObjectDoubleLinkedList<T> {
        const newList = new ObjectDoubleLinkedList<T>();
        const flatten = (node: DoubleLinkedListNode<T> | null, currentDepth: number) => {
            while(node){
                if(Array.isArray(node.value)){
                    for(const item of node.value){
                        flatten({ value: item, next: null, prev: null }, currentDepth - 1);
                    }
                } else {
                    newList.push(node.value);
                }
                node = node.next;
            }
        };
        flatten(this._head, depth);
        return newList;
    }

    /**
     * Recursively flattens the linked list in place up to the specified depth.
     * @param depth The maximum recursion depth. If omitted, the default depth is 1.
     * @return This linked list after flattening.
     */
    /*public flatInPlace(depth: number = 1): this {
        if(!this._head) return this;
        const flattenInPlace = (curr: DoubleLinkedListNode<any>, currentDepth: number): [DoubleLinkedListNode<any>, DoubleLinkedListNode<any>]  => {
            if(Array.isArray(curr.value)){
                const initialNext = curr.next;
                
                // TODO

                throw new Error("Method not implemented.");
            }
        };
        [this._head, this._tail] = flattenInPlace(this._head, depth);
        return this;
    }*/

    /**
     * Calls a defined callback function on each element of an array. Then, flattens the result into a new array. This is identical to a map followed by flat with depth 1.
     * @param callback A function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callback function. If thisArg is omitted, undefined is used as the this value.
     * @return A new array with each element being the result of the callback function and flattened to a depth of 1.
     */
    public flatMap<S extends LinkedListComparator<S>>(callback: (value: T, index: number, list: this) => S, thisArg?: any): ObjectDoubleLinkedList<S> {
        return this.map<S>(callback, thisArg).flat() as ObjectDoubleLinkedList<S>;
    }

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn — A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg — An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public forEach(callbackfn: (value: T, index: number, list: this) => void, thisArg?: any): void {
        let currNode = this._head;
        let index = 0;
        while(currNode){
            callbackfn.call(thisArg, currNode.value, index, this);
            currNode = currNode.next;
            index++;
        }
    }

    /** 
     * Returns the first occurrence of the specified value.
     * @warning This operation is O(n).
     * @param lookup Value to find.
     * @return Found value, or undefined if the value was not found.
     */
    public getByComparator(lookup: T | LinkedListComparator<T>): T | undefined {
        let currNode = this._head;
        while(currNode){
            if(currNode.value.equals(lookup)){
                return currNode.value;
            }
            currNode = currNode.next;
        }
        return undefined;
    }

    /** 
     * Returns the last occurrence of the specified value.
     * @warning This operation is O(n).
     * @param lookup Value to find.
     * @return Found value, or undefined if the value was not found.
     */
    public getLastByComparator(lookup: T | LinkedListComparator<T>): T | undefined {
        let currNode = this._tail;
        while(currNode){
            if(currNode.value.equals(lookup)){
                return currNode.value;
            }
            currNode = currNode.prev;
        }
        return undefined;
    }

    /** 
     * Checks whether the linked list contains the specified value.
     * @warning This operation is O(n).
     * @param lookup Value to check for.
     * @param fromIndex Index to start searching from (default 0).
     * @return True if the value exists, false otherwise.
     */
    public includes(lookup: T | LinkedListComparator<T>, fromIndex?: number): boolean {
        fromIndex = fromIndex ?? 0;
        let currNode = this._head;
        let index = 0;
        while(currNode){
            if(index >= fromIndex && currNode.value.equals(lookup)){
                return true;
            }
            currNode = currNode.next;
            index++;
        }
        return false;
    }

    /**
     * Returns the index of the first occurrence of the specified value.
     * @warning This operation is O(n).
     * @param lookup Value to find.
     * @param fromIndex Index to start searching from (default 0).
     * @return Index of the found value, or -1 if the value was not found.
     */
    public indexOf(lookup: T | LinkedListComparator<T>, fromIndex?: number): number {
        fromIndex = fromIndex ?? 0;
        let currNode = this._head;
        let index = 0;
        while(currNode){
            if(index >= fromIndex && currNode.value.equals(lookup)){
                return index;
            }
            currNode = currNode.next;
            index++;
        }
        return -1;
    }

    /** 
     * Returns whether the linked list is empty.
     * @return True if the linked list is empty, false otherwise.
     */
    public isEmpty(): boolean {
        return this._size === 0;
    }

    /**
     * Joins all elements of the linked list into a string.
     * @param separator Separator to use between elements. Default is ','.
     * @return Joined string.
     */
    public join(separator?: string): string {
        separator ??= ',';
        let result = '';
        let currNode = this._head;
        while(currNode){
            result += (result.length > 0 ? separator : '') + currNode.value.toString();
            currNode = currNode.next;
        }
        return result;
    }

    /** 
     * Returns the index of the last occurrence of the specified value.
     * @warning This operation is O(n).
     * @param lookup Value to find.
     * @param fromIndex Index to start searching backwards from (default length-1).
     * @return Index of the found value, or -1 if the value was not found.
     */
    public lastIndexOf(lookup: T | LinkedListComparator<T>, fromIndex?: number): number {
        fromIndex = fromIndex === undefined ? this._size - 1 : (fromIndex < 0 ? this._size + fromIndex : fromIndex);
        let currNode = this._tail;
        let index = this._size - 1;
        while(currNode){
            if(index <= fromIndex && currNode.value.equals(lookup)){
                return index;
            }
            currNode = currNode.prev;
            index--;
        }
        return -1;
    }

    /**
     * Returns the number of elements in the linked list.
     * @return Number of elements in the linked list.
     */
    public get length(): number {
        return this._size;
    }

    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn — A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg — An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     * @return A new ObjectDoubleLinkedList with each element being the result of the callback function.
     */
    public map<U extends LinkedListComparator<U>>(callbackfn: (value: T, index: number, list: this) => U, thisArg?: any): ObjectDoubleLinkedList<U> {
        const newList = new ObjectDoubleLinkedList<U>();
        let currNode = this._head;
        let index = 0;
        while(currNode){
            newList.push(callbackfn.call(thisArg, currNode.value, index, this));
            currNode = currNode.next;
            index++;
        }
        return newList;
    }

    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn — A function that accepts up to three arguments. The mapToArray method calls the callbackfn function one time for each element in the array.
     * @param thisArg — An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     * @return A new array with each element being the result of the callback function.
     */
    public mapToArray<U>(callbackfn: (value: T, index: number, list: this) => U, thisArg?: any): U[] {
        const arr: U[] = new Array<U>(this._size);
        let currNode = this._head;
        let index = 0;
        while(currNode){
            arr[index] = callbackfn.call(thisArg, currNode.value, index, this);
            currNode = currNode.next;
            index++;
        }
        return arr;
    }

    /** 
     * Returns the last element of the linked list without removing it.
     * @return Last value, or undefined if the list is empty.
     */
    public peek(): T | undefined {
        return this._tail ? this._tail.value : undefined;
    }

    /**
     * Returns the first element of the linked list without removing it.
     * @return First value, or undefined if the list is empty.
     */
    public peekFront(): T | undefined {
        return this._head ? this._head.value : undefined;
    }

    /** 
     * Removes and returns the last element of the linked list.
     * @return Removed value, or undefined if the list is empty.
     */
    public pop(): T | undefined {
        if(!this._tail) return undefined;
        const oldTail = this._tail;
        this._tail = oldTail.prev;
        if(this._tail){
            this._tail.next = null;
        } else {
            this._head = null;
        }
        this._size--;
        return oldTail.value;
    }

    /** 
     * Removes and returns the first element of the linked list.
     * @return Removed value, or undefined if the list is empty.
     */
    public popFront(): T | undefined {
        return this.shift();
    }

    /** 
     * Adds one or more items to the front of the linked list.
     * @param item Item(s) to add.
     * @return New length of the linked list.
     */
    public push(...item: T[]): number {
        for(let i=0; i < item.length; i++){
            const newNode: DoubleLinkedListNode<T> = {
                value: item[i]!,
                next: null,
                prev: this._tail,
            };
            if(!this._head){
                this._head = newNode;
            }
            if(this._tail){
                this._tail.next = newNode;
            }
            this._tail = newNode;
        }
        this._size += item.length;
        return this._size;
    }

    /**
     * Adds one or more items to the front of the linked list.
     * @param item Item(s) to add.
     * @return New length of the linked list.
     */
    public pushFront(...item: T[]): number {
        return this.unshift(...item);
    }

    /**
     * Calls the specified callback function for all the elements in an array. 
     * The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. 
     * The reduce method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation, 
     * otherwise the first element in the array will be used and skipped.
     * The first call to the callbackfn function provides this value as an argument instead of an array value.
     * @return The accumulated result.
     * @trhows TypeError if the linked list is empty and no initialValue is provided.
     */
    public reduce<U = T>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, list: this) => U, initialValue?: U): U {
        let currNode = this._head;
        let index = 0;
        let accumulator: U;
        if(initialValue !== undefined){
            accumulator = initialValue;
        } else {
            if(!currNode){
                throw new TypeError("Reduce of empty linked list with no initial value");
            }
            accumulator = currNode.value as unknown as U;
            currNode = currNode.next;
            index++;
        }
        while(currNode){
            accumulator = callbackfn(accumulator, currNode.value, index, this);
            currNode = currNode.next;
            index++;
        }
        return accumulator;
    }

    /** 
     * Calls the specified callback function for all the elements in an array in reverse order. 
     * The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. 
     * The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation,
     * otherwise the last element in the array will be used and skipped.
     * The first call to the callbackfn function provides this value as an argument instead of an array value.
     * @return The accumulated result.
     * @trhows TypeError if the linked list is empty and no initialValue is provided.
     */
    public reduceRight<U = T>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, list: this) => U, initialValue?: U): U {
        let currNode = this._tail;
        let index = this._size - 1;
        let accumulator: U;
        if(initialValue !== undefined){
            accumulator = initialValue;
        } else {
            if(!currNode){
                throw new TypeError("Reduce of empty linked list with no initial value");
            }
            accumulator = currNode.value as unknown as U;
            currNode = currNode.prev;
            index--;
        }
        while(currNode){
            accumulator = callbackfn(accumulator, currNode.value, index, this);
            currNode = currNode.prev;
            index--;
        }
        return accumulator;
    }

    /** 
     * Removes the first occurrence of the specified value.
     * @param lookup Value to remove.
     * @return Removed value, or undefined if the value was not found.
     */
    public remove(lookup: T | LinkedListComparator<T>): T | undefined {
        if(!this._head) return undefined;

        // special case for head
        if(this._head.value.equals(lookup)){
            const value = this._head.value;
            this._head = this._head.next;
            if(this._head){
                this._head.prev = null;
            } else {
                this._tail = null;
            }
            this._size--;
            return value;
        }

        // iterate currNode.next to index
        let currNode = this._head;
        while(currNode.next){

            if(currNode.next.value.equals(lookup)){
                // currNode.next should be removed
                const curr = currNode.next;
                const value = curr.value;
                if(curr.next){
                    curr.next.prev = currNode;
                } else {
                    this._tail = currNode;
                }
                currNode.next = curr.next;
                this._size--;
                return value;
            }

            currNode = currNode.next;
        }

        return undefined;
    }

    /**
     * Removes all occurrences of the specified value.
     * @warning This operation is O(n).
     * @param lookup Value to remove.
     * @return Number of removed elements.
     */
    public removeAll(lookup: T | LinkedListComparator<T>): number {
        let removedCount = 0;

        // remove from head
        while(this._head && this._head.value.equals(lookup)){
            this._head = this._head.next;
            if(this._head){
                this._head.prev = null;
            }
            removedCount++;
            this._size--;
        }
        if(!this._head){
            this._tail = null;
            return removedCount;
        }

        // check currNode.next for removal
        let currNode = this._head;
        while(currNode.next){
            if(currNode.next.value.equals(lookup)){
                const curr = currNode.next;
                const nextNode = currNode.next.next;
                currNode.next = nextNode;
                if(nextNode){
                    nextNode.prev = currNode;
                } else {
                    this._tail = currNode;
                }
                removedCount++;
                this._size--;
            } else {
                currNode = currNode.next;
            }
        }
        return removedCount;
    }

    /** 
     * Removes the value at the specified index.
     * @warning This operation is O(n).
     * @param index Index of the value to remove.
     * @return Removed value, or undefined if the index is out of bounds.
     */
    public removeAt(index: number): T | undefined {
        if(index < 0 || index >= this._size || !this._head) return undefined;

        // special case for head
        if(index === 0){
            const oldHeadValue = this._head.value;
            this._head = this._head.next;
            if(this._head){
                this._head.prev = null;
            } else {
                this._tail = null;
            }
            this._size--;
            return oldHeadValue;
        }

        // iterate currNode.next to index
        let currNode: DoubleLinkedListNode<T> | null = this._head;
        for(let i=1; i < index; i++){
            currNode = currNode!.next;
        }

        // currNode.next should be removed
        const oldValue = currNode!.next!.value;
        if(currNode!.next!.next){
            currNode!.next!.next!.prev = currNode;
        } else {
            this._tail = currNode;
        }
        currNode!.next = currNode!.next!.next;
        this._size--;
        return oldValue;
    }

    /**
     * Reverses the elements in an array in place. This method mutates the array and returns a reference to the same array.
     * @return This linked list after reversing.
     */
    public reverse(): this {
        let currNode = this._head;
        let prevNode: DoubleLinkedListNode<T> | null = null;
        this._tail = this._head;
        while(currNode){
            const nextNode = currNode.next;
            currNode.next = prevNode;
            currNode.prev = nextNode;
            prevNode = currNode;
            currNode = nextNode;
        }
        this._head = prevNode;
        return this;
    }

    /** 
     * Sets the value at the specified index.
     * @warning This operation is O(n).
     * @param index Index of the value to set (if 
     * @param value New value.
     * @return Previous value at the specified index, or undefined if the index is out of bounds.
     */
    public set(index: number, value: T): T | undefined {
        if(index < 0 || index >= this._size) return undefined;
        let currNode = this._head;
        for(let i=0; i < index; i++){
            currNode = currNode!.next;
        }
        const oldValue = currNode!.value;
        currNode!.value = value;
        return oldValue;
    }

    /** 
     * Overwrites the first occurrence of the specified value.
     * @param lookup Value to find.
     * @param newValue New value to set.
     * @param appendIfNotFound If true, appends the new value if the specified value is not found.
     * @return Previous value, or undefined if the value was not found.
     */
    public setByComparator(lookup: T | LinkedListComparator<T>, newValue: T, appendIfNotFound?: boolean): T | undefined {
        let currNode = this._head;
        while(currNode){
            if(currNode.value.equals(lookup)){
                const oldValue = currNode.value;
                currNode.value = newValue;
                return oldValue;
            }
            currNode = currNode.next;
        }
        if(appendIfNotFound){
            this.push(newValue);
        }
        return undefined;
    }

    /**
     * Removes the first element from an array and returns it. If the array is empty, undefined is returned and the array is not modified.
     * @return The removed element from the array or undefined if the array is empty.
     */
    public shift(): T | undefined {
        if(!this._head) return undefined;
        const value = this._head.value;
        this._head = this._head.next;
        if(this._head){
            this._head.prev = null;
        } else {
            this._tail = null;
        }
        this._size--;
        return value;
    }

    /**
     * Returns a copy of a section of an array. 
     * For both start and end, a negative index can be used to indicate an offset from the end of the array.
     * For example, -2 refers to the second to last element of the array.
     * @warning This operation is O(n).
     * @param start The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0.
     * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. 
     * If end is undefined, then the slice extends to the end of the array.
     * @return A new ObjectDoubleLinkedList containing the extracted elements.
     */
    public slice(start?: number, end?: number): ObjectDoubleLinkedList<T> {
        start = start === undefined ? 0 : (start < 0 ? this._size + start : start);
        end = end === undefined ? this._size : (end < 0 ? this._size + end : end);
        if(start < 0) start = 0;
        if(end > this._size) end = this._size;
        const newList = new ObjectDoubleLinkedList<T>();
        if(start >= end) return newList;
        let currNode = this._head;
        let index = 0;
        while(currNode && index < end){
            if(index >= start){
                newList.push(currNode.value);
            }
            currNode = currNode.next;
            index++;
        }
        return newList;
    }

    /**
     * Returns a copy of a section of an array. 
     * For both start and end, a negative index can be used to indicate an offset from the end of the array.
     * For example, -2 refers to the second to last element of the array.
     * @warning This operation is O(n).
     * @param start The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0.
     * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. 
     * If end is undefined, then the slice extends to the end of the array.
     * @return A new ObjectDoubleLinkedList containing the extracted elements.
     */
    public sliceToArray(start?: number, end?: number): T[] {
        start = start === undefined ? 0 : (start < 0 ? this._size + start : start);
        end = end === undefined ? this._size : (end < 0 ? this._size + end : end);
        if(start < 0) start = 0;
        if(end > this._size) end = this._size;
        const newList: T[] = [];
        if(start >= end) return newList;
        let currNode = this._head;
        let index = 0;
        while(currNode && index < end){
            if(index >= start){
                newList.push(currNode.value);
            }
            currNode = currNode.next;
            index++;
        }
        return newList;
    }

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. 
     * The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, 
     * or until the end of the array.
     * @param thisArg object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     * @returns true if the predicate returns a value coercible to true for any array element; otherwise, false.
     */
    public some<S>(predicate: (value: T, index: number, list: this) => S, thisArg?: any): boolean {
        let currNode = this._head;
        let index = 0;
        while(currNode){
            if(predicate.call(thisArg, currNode.value, index, this)){
                return true;
            }
            currNode = currNode.next;
            index++;
        }
        return false;
    }

    /**
     * Sorts an array in place. This method mutates the array and returns a reference to the same array.
     * Uses iterative bottom-up merge sort algorithm which is stable even for large lists and has a time complexity of O(n log n).
     * @param compareFn Function used to determine the order of the elements. 
     * It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, 
     * and a positive value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
     * @return This linked list after sorting.
     */
    public sort(compareFn?: (a: T, b: T) => number): this {
        if(this._size <= 1) return this;
        compareFn = compareFn || ((a: T, b: T) => {
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        /**
         * Splits the linked list into two parts with the first part containing 'size' nodes.
         * @param head Head of the linked list to split.
         * @param size Amount of nodes that should remain linked to head.
         * @returns New head of the second part of the split linked list.
         */
        function split<U>(head: DoubleLinkedListNode<U> | null, size: number): DoubleLinkedListNode<U> | null {
            let cur = head;
            for(let i = 1; cur && i < size; i++){
                cur = cur.next;
            }
            if(!cur) return null;

            const next = cur.next;
            if(next) next.prev = null;
            cur.next = null;
            return next;
        }

        /**
         * Merges two sorted linked lists into one sorted linked list.
         * @param a List a.
         * @param b List b.
         * @param compare Comparison function.
         * @returns Head and tail of the new merged list.
         */
        function merge<U>(a: DoubleLinkedListNode<U> | null, b: DoubleLinkedListNode<U> | null, compare: (x: U, y: U) => number): { head: DoubleLinkedListNode<U> | null; tail: DoubleLinkedListNode<U> | null } {
            // create new merged list
            let head: DoubleLinkedListNode<U> | null = null;
            let tail: DoubleLinkedListNode<U> | null = null;
            const append = (node: DoubleLinkedListNode<U>) => {
                node.prev = tail;
                node.next = null;
                if(tail) tail.next = node;
                else head = node;
                tail = node;
            };

            // merge two sorted lists
            while(a && b){
                if(compare(a.value, b.value) <= 0) {
                    const next = a.next;
                    append(a);
                    a = next;
                } else {
                    const next = b.next;
                    append(b);
                    b = next;
                }
            }

            // append remaining nodes from list a
            while(a){
                const next = a.next;
                append(a);
                a = next;
            }

            // append remaining nodes from list b
            while(b){
                const next = b.next;
                append(b);
                b = next;
            }
            return { head, tail };
        }


        // Iteratively merge runs
        for(let size = 1; size < this._size; size <<= 1) {
            let newHead: DoubleLinkedListNode<T> | null = null;
            let newTail: DoubleLinkedListNode<T> | null = null;
            let cur: DoubleLinkedListNode<T> | null = this._head;

            // split and merge increasingly larger sublists always starting from head
            while(cur){
                const left = cur;
                const right = split(left, size);
                const next = split(right, size);

                const merged = merge(left, right, compareFn);

                if(!newHead){
                    newHead = merged.head;
                } else {
                    newTail!.next = merged.head;
                    merged.head!.prev = newTail;
                }
                newTail = merged.tail;
                cur = next;
            }

            this._head = newHead;
        }

        return this;
    }
    
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove. Omitting this argument will remove all elements from the start paramater location to end of the array. 
     * If value of this argument is either a negative number, zero, undefined, or a type that cannot be converted to an integer, 
     * the function will evaluate the argument as zero and not remove any elements.
     * @param items The elements to add to the array. If you don't specify any elements, splice() will only remove elements from the array.
     * @returns — An array containing the elements that were deleted.
     */
    public splice(start: number, deleteCount?: number, ...items: T[]): ObjectDoubleLinkedList<T> {
        start = start < 0 ? Math.max(this._size + start, 0) : Math.min(start, this._size);
        deleteCount = deleteCount === undefined ? this._size - start : Math.max(Math.min(deleteCount, this._size - start), 0);
        const removedList = new ObjectDoubleLinkedList<T>();

        // special case for empty list
        if(!this._head){
            this.unshift(...items);
            return removedList;
        }

        // special case for head
        if(start === 0){
            // remove deleteCount nodes from head
            for(let i=0; i < deleteCount && this._head; i++){
                const nextNode: DoubleLinkedListNode<T> | null = this._head.next;
                removedList.push(this._head.value);
                if(nextNode){
                    nextNode.prev = null;
                } else {
                    this._tail = null;
                }
                this._head = nextNode;
                this._size--;
            }
            this.unshift(...items);
            return removedList;
        }
        
        // find start node as currNode.next
        let currNode = this._head;
        let index = 1;
        while(currNode.next && index < start){
            currNode = currNode.next;
            index++;
        }

        // remove deleteCount nodes
        for(let i=0; i < deleteCount && currNode.next; i++){
            const curr: DoubleLinkedListNode<T> = currNode.next;
            const nextNode: DoubleLinkedListNode<T> | null = currNode.next.next;
            removedList.push(curr.value);
            if(nextNode){
                nextNode.prev = curr;
            } else {
                this._tail = currNode;
            }
            currNode.next = nextNode;
            this._size--;
        }

        // insert new items
        for(const item of items){
            const newNode: DoubleLinkedListNode<T> = {
                value: item,
                next: currNode.next,
                prev: currNode,
            };
            if(currNode.next){
                currNode.next.prev = newNode;
            } else {
                this._tail = newNode;
            }
            currNode.next = newNode;
            currNode = newNode;
        }
        this._size += items.length;

        return removedList;
    }

    /** 
     * Converts the linked list to an array.
     * @return Array containing all values in the linked list.
     */
    public toArray(): T[] {
        const arr: T[] = new Array<T>(this._size);
        let currNode = this._head;
        for(let i=0; i < this._size; i++){
            arr[i] = currNode!.value;
            currNode = currNode!.next;
        }
        return arr;
    }

    /**
     * Returns a debug string representation of the linked list, showing the structure of the nodes.
     * @returns Debug string representation of the linked list.
     */
    public toDebugString(): string {
        let result = '';
        let currNode = this._head;
        if(currNode){
            result += (currNode.prev ? '! <-' : 'x-');
        }
        while(currNode){
            result += ' (' + currNode.value + ') ' + (currNode.next?.prev ? '<' : '') + '-' + (currNode.next ? '>' : 'x');
            currNode = currNode.next;
        }
        return '[ ' + result + ' ]';
    }

    /** 
     * Returns a string representation of the linked list.
     * The elements are converted to string using their toLocaleString methods.
     * @param maxElements Maximum number of elements to include in the string representation.
     * @return String representation of the linked list.
     */
    public toLocaleString(maxElements: number = MAX_ELEMENTS_FOR_TO_STRING): string {
        let result = '';
        let currNode = this._head;
        for(let i=0; i < maxElements && currNode; i++){
            result += (result.length > 0 ? ', ' : '') + currNode.value.toLocaleString();
            currNode = currNode.next;
        }
        return 'ObjectDoubleLinkedList[ ' + result + (this._size > maxElements ? ', ...' : '') + ' ]';
    }

    /** 
     * Returns a string representation of the linked list.
     * The elements are converted to string using their toString methods.
     * @param maxElements Maximum number of elements to include in the string representation.
     * @return String representation of the linked list.
     */
    public toString(maxElements: number = MAX_ELEMENTS_FOR_TO_STRING): string {
        let result = '';
        let currNode = this._head;
        for(let i=0; i < maxElements && currNode; i++){
            result += (result.length > 0 ? ', ' : '') + currNode.value.toString();
            currNode = currNode.next;
        }
        return 'ObjectDoubleLinkedList[ ' + result + (this._size > maxElements ? ', ...' : '') + ' ]';
    }

    /**
     * Inserts new elements at the start of the list, and returns the new length of the list.
     * Order of inserted elements is preserved.
     * @param items Elements to insert at the start of the list.
     * @return New length of the list.
     */
    public unshift(...items: T[]): number {
        for(let i=items.length - 1; i >= 0; i--){
            const newNode: DoubleLinkedListNode<T> = {
                value: items[i]!,
                next: this._head,
                prev: null,
            };
            if(this._head){
                this._head.prev = newNode;
            }
            this._head = newNode;
            if(!this._tail){
                this._tail = newNode;
            }
        }
        this._size += items.length;
        return this._size;
    }

    /** 
     * Returns an iterator over the values in the linked list.
     * @return Iterator over the values in the linked list.
     */
    public *[Symbol.iterator](): IterableIterator<T> {
        let currNode = this._head;
        while(currNode){
            yield currNode.value;
            currNode = currNode.next;
        }
    }

}
