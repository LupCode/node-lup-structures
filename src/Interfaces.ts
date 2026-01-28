export interface LinkedListComparator<T> {

    /**
     * Compares this element to another for equality.
     * @param other Other element to compare to.
     * @returns True if the elements are equal, false otherwise.
     */
    equals(other: LinkedListComparator<T>): boolean;
}