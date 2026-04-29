const DEFAULT_BRANCHING_FACTOR = -1; // TODO auto tune branching factor based on supported SIMD width and node size (currently 32 bytes per node, so 8 nodes fit into 256 bit SIMD registers)
const DEFAULT_CAPACITY_GROW_FACTOR = 2.0;
const DEFAULT_CAPACITY_INITIAL = 1024;
const DEFAULT_FAT_MARGIN = 0.1;

export type DynamicBVHOptions = {
  /** Branching factor determining the number of children each internal node can have (-1 to auto-detect, min. 2 for binary tree, default -1). */
  // TODO branchingFactor?: number;

  /** Factor by which to grow the BVH when capacity is exceeded (default 2.0). */
  capacityGrowFactor?: number;

  /** Initial capacity of the BVH (default 1024). The BVH will automatically resize if this capacity is exceeded. */
  capacityInitial?: number;

  /** Margin by which the bounding volume is enlarged (default 0.1). */
  fatMargin?: number;
};

type NodeIndex = number;

const NULL: NodeIndex = -1;
const FLAG_IS_FREE = 1 << 0;

type BVHNode<T> = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;

  left: NodeIndex; // left child index
  right: NodeIndex; // right child index
  parent: NodeIndex; // parent index
  height: number; // height of the node in the tree (0 for leaf nodes)
  flags: number; // bit flags (isLeaf, isFree)
  data: T | undefined; // Can hold any data associated with the leaf node
};

export default class DynamicBVH<T> {
  /** Branching factor determining the number of children each internal node can have. */
  // TODO public readonly branchingFactor: number;

  /** The margin by which the bounding volume is enlarged. */
  public readonly fatMargin: number;

  private _capacityGrowFactor: number = DEFAULT_CAPACITY_GROW_FACTOR;

  // BVHNode<T> but split up into separate arrays for better cache locality and SIMD optimization
  private _minX: Float32Array;
  private _minY: Float32Array;
  private _minZ: Float32Array;
  private _maxX: Float32Array;
  private _maxY: Float32Array;
  private _maxZ: Float32Array;

  private _left: Int32Array; // left child index
  private _right: Int32Array; // right child index
  private _parent: Int32Array; // parent index
  private _height: Int16Array; // height of the node in the tree (0 for leaf nodes)
  private _flags: Int8Array; // bit flags (isFree)
  private _data: (T | undefined)[];

  private _root: NodeIndex = NULL;
  private _freeList: NodeIndex; // start of the free list
  private _capacity: number;
  private _nodeCount: number = 0;
  private _leafCount: number = 0;

  public constructor(options?: DynamicBVHOptions) {
    this.fatMargin = options?.fatMargin ?? DEFAULT_FAT_MARGIN;
    this.capacityGrowFactor = options?.capacityGrowFactor ?? DEFAULT_CAPACITY_GROW_FACTOR;
    this._capacity = Math.max(0, options?.capacityInitial ?? DEFAULT_CAPACITY_INITIAL);

    /* TODO
        let branchingFactor = options?.branchingFactor ?? DEFAULT_BRANCHING_FACTOR;
        if(branchingFactor < 2){
            // TODO auto detect branching factor based on supported SIMD width and node size (currently 32 bytes per node, so 8 nodes fit into 256 bit SIMD registers)
            branchingFactor = 4; // TODO default to quaternary tree
        }
        this.branchingFactor = branchingFactor;
        */

    this._minX = new Float32Array(this._capacity);
    this._minY = new Float32Array(this._capacity);
    this._minZ = new Float32Array(this._capacity);
    this._maxX = new Float32Array(this._capacity);
    this._maxY = new Float32Array(this._capacity);
    this._maxZ = new Float32Array(this._capacity);

    this._left = new Int32Array(this._capacity).fill(NULL);
    this._right = new Int32Array(this._capacity).fill(NULL);
    this._parent = new Int32Array(this._capacity).fill(NULL);
    this._height = new Int16Array(this._capacity);
    this._flags = new Int8Array(this._capacity);
    this._data = new Array(this._capacity);

    for (let i = 0; i < this._capacity; i++) {
      this._parent[i] = i + 1;
    }
    this._parent[this._capacity - 1] = NULL; // end of free list
    this._freeList = this._capacity > 0 ? 0 : NULL;
  }

  /**
   * Returns wether a node is a leaf node (i.e. has no children).
   * This is used during tree traversal to determine when to call the query callback with the associated data.
   * @param node Index of the node to check.
   * @returns True if the node is a leaf node, false otherwise.
   */
  private _isLeaf(node: NodeIndex): boolean {
    return this._left[node] === NULL && this._right[node] === NULL;
  }

  /**
   * Returns wether a node is currently free (i.e. available for allocation) by checking the corresponding bit in the flags array.
   * @param node Index of the node to check.
   * @returns True if the node is free, false otherwise.
   */
  private _isFree(node: NodeIndex): boolean {
    return this._flags[node] & FLAG_IS_FREE ? true : false;
  }

  /**
   * Allocates a new node and returns its index.
   * @return Index of the allocated node.
   */
  private _allocate(): NodeIndex {
    if (this._freeList === NULL) this._grow();

    const node = this._freeList;
    this._freeList = this._parent[node]; // move free list head to next node

    this._left[node] = NULL;
    this._right[node] = NULL;
    this._parent[node] = NULL;
    this._height[node] = 0;
    this._flags[node] = 0; // reset flags

    this._nodeCount++;
    return node;
  }

  /**
   * Releases a node back to the free list.
   * @param node Index of the node to free.
   */
  private _free(node: NodeIndex) {
    this._parent[node] = this._freeList; // add node back to free list
    this._freeList = node;
    this._flags[node] = FLAG_IS_FREE; // mark node as free and reset other flags
    this._nodeCount--;
  }

  /**
   * Increases the capacity of the BVH.
   */
  private _grow() {
    const oldCapacity = this._capacity;
    const newCapacity = Math.ceil(oldCapacity * this.capacityGrowFactor);

    const growF32 = (old: Float32Array) => {
      const n = new Float32Array(newCapacity);
      n.set(old);
      return n;
    };

    const growI32 = (old: Int32Array) => {
      const n = new Int32Array(newCapacity);
      n.set(old);
      return n;
    };

    const growI16 = (old: Int16Array) => {
      const n = new Int16Array(newCapacity);
      n.set(old);
      return n;
    };

    const growI8 = (old: Int8Array) => {
      const n = new Int8Array(newCapacity);
      n.set(old);
      return n;
    };

    this._minX = growF32(this._minX);
    this._minY = growF32(this._minY);
    this._minZ = growF32(this._minZ);
    this._maxX = growF32(this._maxX);
    this._maxY = growF32(this._maxY);
    this._maxZ = growF32(this._maxZ);

    this._left = growI32(this._left);
    this._right = growI32(this._right);
    this._parent = growI32(this._parent);
    this._height = growI16(this._height);
    this._flags = growI8(this._flags);

    const newData = new Array(newCapacity);
    for (let i = 0; i < this._data.length; i++) {
      newData[i] = this._data[i];
    }
    this._data = newData;

    for (let i = oldCapacity; i < newCapacity; i++) {
      this._parent[i] = i + 1;
      this._flags[i] = FLAG_IS_FREE; // mark new nodes as free
    }
    this._parent[newCapacity - 1] = NULL; // end of free list
    this._freeList = oldCapacity; // new nodes start at old capacity

    this._capacity = newCapacity;
  }

  /**
   * Merges two nodes into a new parent node. The merged node's bounding box will encompass both child nodes.
   * @param a Index of the first node to merge.
   * @param b Index of the second node to merge.
   * @param out Index of the node where the merged result will be stored.
   */
  private _merge(a: NodeIndex, b: NodeIndex, out: NodeIndex) {
    this._minX[out] = Math.min(this._minX[a], this._minX[b]);
    this._minY[out] = Math.min(this._minY[a], this._minY[b]);
    this._minZ[out] = Math.min(this._minZ[a], this._minZ[b]);
    this._maxX[out] = Math.max(this._maxX[a], this._maxX[b]);
    this._maxY[out] = Math.max(this._maxY[a], this._maxY[b]);
    this._maxZ[out] = Math.max(this._maxZ[a], this._maxZ[b]);
  }

  /**
   * Calculates the surface area of a node's bounding box.
   * @param node Index of the node.
   * @returns Surface area of the node's bounding box.
   */
  private _area(node: NodeIndex): number {
    const dx = this._maxX[node] - this._minX[node];
    const dy = this._maxY[node] - this._minY[node];
    const dz = this._maxZ[node] - this._minZ[node];
    return 2 * (dx * dy + dx * dz + dy * dz);
  }

  /**
   * Calculates the cost of merging two nodes. This is used during tree construction to choose the best place to insert new nodes.
   * @param a Index of the first node to merge.
   * @param b Index of the second node to merge.
   * @returns Cost of merging the two nodes.
   */
  private _costOfMerge(a: NodeIndex, b: NodeIndex): number {
    const minX = this._minX[a] < this._minX[b] ? this._minX[a] : this._minX[b]; // faster than Math.min()
    const minY = this._minY[a] < this._minY[b] ? this._minY[a] : this._minY[b]; // faster than Math.min()
    const minZ = this._minZ[a] < this._minZ[b] ? this._minZ[a] : this._minZ[b]; // faster than Math.min()

    const maxX = this._maxX[a] > this._maxX[b] ? this._maxX[a] : this._maxX[b]; // faster than Math.max()
    const maxY = this._maxY[a] > this._maxY[b] ? this._maxY[a] : this._maxY[b]; // faster than Math.max()
    const maxZ = this._maxZ[a] > this._maxZ[b] ? this._maxZ[a] : this._maxZ[b]; // faster than Math.max()

    const dx = maxX - minX;
    const dy = maxY - minY;
    const dz = maxZ - minZ;

    return 2 * (dx * dy + dx * dz + dy * dz);
  }

  /**
   * Checks wether the bounding box of a node overlaps with the given bounding box. This is used for tree traversal during queries.
   * @param node Index of the node to check for overlap.
   * @param minX Minimum X coordinate of the query bounding box.
   * @param minY Minimum Y coordinate of the query bounding box.
   * @param minZ Minimum Z coordinate of the query bounding box.
   * @param maxX Maximum X coordinate of the query bounding box.
   * @param maxY Maximum Y coordinate of the query bounding box.
   * @param maxZ Maximum Z coordinate of the query bounding box.
   * @returns True if the node's bounding box overlaps with the query bounding box, false otherwise.
   */
  private _overlaps(
    node: NodeIndex,
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
  ): boolean {
    return !(
      this._maxX[node] < minX ||
      this._minX[node] > maxX ||
      this._maxY[node] < minY ||
      this._minY[node] > maxY ||
      this._maxZ[node] < minZ ||
      this._minZ[node] > maxZ
    );
  }

  /**
   * Inserts a leaf node into the BVH.
   * The leaf node should already have its bounding box and data set.
   * @param leaf Index of the leaf node to insert.
   */
  private _insertLeaf(leaf: NodeIndex) {
    if (this._root === NULL) {
      this._root = leaf;
      this._parent[leaf] = NULL;
      return;
    }

    // SAH-lite insertion
    let curr = this._root;
    while (this._left[curr] !== NULL) {
      const left = this._left[curr];
      const right = this._right[curr];

      const area = this._area(curr);

      // cost of creating a new parent for this node + leaf
      const combinedArea = this._costOfMerge(curr, leaf);
      const cost = 2 * combinedArea;

      // minimum cost of pushing leaf down
      const inheritanceCost = 2 * (combinedArea - area);

      // cost for descending left
      let costLeft: number;
      if (this._isLeaf(left)) {
        costLeft = this._costOfMerge(left, leaf) + inheritanceCost;
      } else {
        const newArea = this._costOfMerge(left, leaf);
        costLeft = newArea - this._area(left) + inheritanceCost;
      }

      // cost for descending right
      let costRight: number;
      if (this._isLeaf(right)) {
        costRight = this._costOfMerge(right, leaf) + inheritanceCost;
      } else {
        const newArea = this._costOfMerge(right, leaf);
        costRight = newArea - this._area(right) + inheritanceCost;
      }

      // stop descending if it's cheaper to create a new parent
      if (cost < costLeft && cost < costRight) break;

      // descend
      curr =
        costLeft === costRight
          ? leaf & 1
            ? left
            : right // if costs are equal use module leaf to randomize left/right choice
          : costLeft < costRight
            ? left
            : right;
    }

    const sibling = curr;
    const oldParent = this._parent[sibling];
    const newParent = this._allocate();

    this._parent[newParent] = oldParent;
    this._left[newParent] = sibling;
    this._right[newParent] = leaf;

    this._parent[sibling] = newParent;
    this._parent[leaf] = newParent;

    this._merge(sibling, leaf, newParent);
    this._height[newParent] = this._height[sibling] + 1;

    if (oldParent === NULL) {
      this._root = newParent;
    } else if (this._left[oldParent] === sibling) {
      this._left[oldParent] = newParent;
    } else {
      this._right[oldParent] = newParent;
    }

    this._fixUpwards(newParent);
  }

  /**
   * Updates the tree structure and bounding boxes upwards from the given node after an insertion, update or removal operation.
   * @param node Index of the node to fix upwards from.
   */
  private _fixUpwards(node: NodeIndex) {
    while (node !== NULL) {
      node = this._balance(node);

      const left = this._left[node];
      const right = this._right[node];

      if (left !== NULL && right !== NULL) {
        this._height[node] = 1 + Math.max(this._height[left], this._height[right]);
        this._merge(left, right, node);
      }

      node = this._parent[node];
    }
  }

  /**
   * Balances the subtree rooted at the given node to maintain AVL property.
   * @param node Index of the node to balance.
   * @returns Index of the new root of the balanced subtree.
   */
  private _balance(node: NodeIndex): NodeIndex {
    const left = this._left[node];
    const right = this._right[node];

    if (left === NULL || right === NULL) return node; // cannot balance leaf nodes

    const balance = this._height[right] - this._height[left];

    if (balance > 1) {
      const rightLeft = this._left[right];
      const rightRight = this._right[right];

      this._left[right] = node;
      this._parent[right] = this._parent[node];
      this._parent[node] = right;

      if (this._parent[right] !== NULL) {
        if (this._left[this._parent[right]] === node) {
          this._left[this._parent[right]] = right;
        } else {
          this._right[this._parent[right]] = right;
        }
      } else {
        this._root = right;
      }

      if (this._height[rightLeft] > this._height[rightRight]) {
        this._right[right] = rightLeft;
        this._right[node] = rightRight;
        if (rightLeft !== NULL) this._parent[rightLeft] = right;
        if (rightRight !== NULL) this._parent[rightRight] = node;
      } else {
        this._right[right] = rightRight;
        this._right[node] = rightLeft;
        if (rightRight !== NULL) this._parent[rightRight] = right;
        if (rightLeft !== NULL) this._parent[rightLeft] = node;
      }

      this._height[node] = 1 + Math.max(this._height[left], this._height[this._right[node]]);
      this._height[right] = 1 + Math.max(this._height[node], this._height[this._left[right]]);

      this._merge(this._left[node], this._right[node], node);
      this._merge(this._left[right], this._right[right], right);

      return right;
    }

    if (balance < -1) {
      const leftLeft = this._left[left];
      const leftRight = this._right[left];

      this._right[left] = node;
      this._parent[left] = this._parent[node];
      this._parent[node] = left;

      if (this._parent[left] !== NULL) {
        if (this._left[this._parent[left]] === node) {
          this._left[this._parent[left]] = left;
        } else {
          this._right[this._parent[left]] = left;
        }
      } else {
        this._root = left;
      }

      if (this._height[leftLeft] > this._height[leftRight]) {
        this._left[left] = leftLeft;
        this._left[node] = leftRight;
        if (leftLeft !== NULL) this._parent[leftLeft] = left;
        if (leftRight !== NULL) this._parent[leftRight] = node;
      } else {
        this._left[left] = leftRight;
        this._left[node] = leftLeft;
        if (leftRight !== NULL) this._parent[leftRight] = left;
        if (leftLeft !== NULL) this._parent[leftLeft] = node;
      }

      this._height[node] = 1 + Math.max(this._height[this._left[node]], this._height[this._right[node]]);
      this._height[left] = 1 + Math.max(this._height[node], this._height[this._right[left]]);

      this._merge(this._left[node], this._right[node], node);
      this._merge(this._left[left], this._right[left], left);

      return left;
    }

    return node; // already balanced
  }

  /**
   * Removes a leaf node from the BVH and updates the tree structure accordingly.
   * @param node Index of the node to remove (should be a leaf node).
   * @param freeNode Wether to free the node after removal.
   * This should be false if the node will be immediately reused during an update operation to avoid unnecessary allocations and deallocations.
   * @returns True if the node was successfully removed, false if the node index was invalid or the node was already removed.
   */
  private _remove(node: NodeIndex, freeNode: boolean): boolean {
    if (node < 0 || node >= this._capacity || !this._isLeaf(node) || this._isFree(node)) return false; // can only remove valid leaf nodes

    if (node === this._root) {
      this._root = NULL;
      if (freeNode) {
        this._free(node);
        this._leafCount--;
      }
      return true;
    }

    const parent = this._parent[node];
    const grandParent = this._parent[parent];
    const sibling = this._left[parent] === node ? this._right[parent] : this._left[parent];

    if (grandParent !== NULL) {
      // connect sibling to grandparent
      if (this._left[grandParent] === parent) {
        this._left[grandParent] = sibling;
      } else {
        this._right[grandParent] = sibling;
      }
      this._parent[sibling] = grandParent;
      this._free(parent);
      this._fixUpwards(grandParent);
    } else {
      // parent was root
      this._root = sibling;
      this._parent[sibling] = NULL;
      this._free(parent);
    }
    if (freeNode) {
      this._free(node);
      this._leafCount--;
    }
    return true;
  }

  /**
   * Adds a new data entry to the BVH with the specified bounding box and associated data.
   * The bounding box will be enlarged by the fat margin to improve query performance at the cost of increased false positives.
   *
   * @param data Data to add.
   * @param minX Minimum X coordinate of the axis-aligned data entry bounding box.
   * @param minY Minimum Y coordinate of the axis-aligned data entry bounding box.
   * @param minZ Minimum Z coordinate of the axis-aligned data entry bounding box.
   * @param maxX Maximum X coordinate of the axis-aligned data entry bounding box.
   * @param maxY Maximum Y coordinate of the axis-aligned data entry bounding box.
   * @param maxZ Maximum Z coordinate of the axis-aligned data entry bounding box.
   * @returns The index of the new node in the BVH needed to update or remove the entry later.
   */
  public add(data: T, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): NodeIndex {
    const leaf = this._allocate();
    this._flags[leaf] = 0; // overwrite all other flags

    this._minX[leaf] = minX - this.fatMargin;
    this._minY[leaf] = minY - this.fatMargin;
    this._minZ[leaf] = minZ - this.fatMargin;
    this._maxX[leaf] = maxX + this.fatMargin;
    this._maxY[leaf] = maxY + this.fatMargin;
    this._maxZ[leaf] = maxZ + this.fatMargin;

    this._height[leaf] = 0;
    this._data[leaf] = data;
    this._leafCount++;

    this._insertLeaf(leaf);
    return leaf;
  }

  /**
   * Updates the bounding box of an existing data entry.
   * @param node Index of the node to update (returned by add method).
   * @param minX New minimum X coordinate of the data entry axis-aligned bounding box.
   * @param minY New minimum Y coordinate of the data entry axis-aligned bounding box.
   * @param minZ New minimum Z coordinate of the data entry axis-aligned bounding box.
   * @param maxX New maximum X coordinate of the data entry axis-aligned bounding box.
   * @param maxY New maximum Y coordinate of the data entry axis-aligned bounding box.
   * @param maxZ New maximum Z coordinate of the data entry axis-aligned bounding box.
   * @throws Error if the node index is invalid or the node has already been removed.
   */
  public update(node: NodeIndex, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
    if (node < 0 || node >= this._capacity || !this._isLeaf(node) || this._isFree(node))
      throw new Error('Invalid node index');

    // TODO check if AABB still inside fat AABB, if so do nothing, otherwise:
    // TODO remove leaf, update bounds, reinsert leaf (try to reuse same node index if possible)

    // check if still inside fat AABB
    if (
      minX >= this._minX[node] &&
      minY >= this._minY[node] &&
      minZ >= this._minZ[node] &&
      maxX <= this._maxX[node] &&
      maxY <= this._maxY[node] &&
      maxZ <= this._maxZ[node]
    ) {
      return; // still inside fat AABB, no need to update
    }

    // remove node but do not free to keep node index the same for reinsertion
    if (!this._remove(node, false)) throw new Error('Failed to remove node during update');

    // update bounds
    this._minX[node] = minX - this.fatMargin;
    this._minY[node] = minY - this.fatMargin;
    this._minZ[node] = minZ - this.fatMargin;
    this._maxX[node] = maxX + this.fatMargin;
    this._maxY[node] = maxY + this.fatMargin;
    this._maxZ[node] = maxZ + this.fatMargin;
    this._height[node] = 0; // node is a leaf

    // reinsert node
    this._insertLeaf(node);
  }

  /**
   * Removes a data entry from the BVH.
   * @param node Index of the node to remove (returned by add method).
   * @return True if the node was successfully removed, false if the node index was invalid or the node was already removed.
   */
  public remove(node: NodeIndex): boolean {
    return this._remove(node, true);
  }

  /**
   * Removes all data entries from the BVH and resets the tree structure.
   */
  public clear() {
    this._root = NULL;
    this._freeList = 0;
    this._nodeCount = 0;
    this._leafCount = 0;

    for (let i = 0; i < this._capacity; i++) {
      this._parent[i] = i + 1;
      this._flags[i] = FLAG_IS_FREE; // mark all nodes as free
      this._data[i] = undefined; // clear data references
    }
    if (this._capacity > 0) {
      this._parent[this._capacity - 1] = NULL; // end of free list
    }
  }

  /**
   * Queries the BVH for all data entries whose bounding boxes overlap with the given query bounding box.
   * @param minX Minimum X coordinate of the axis-aligned query bounding box.
   * @param minY Minimum Y coordinate of the axis-aligned query bounding box.
   * @param minZ Minimum Z coordinate of the axis-aligned query bounding box.
   * @param maxX Maximum X coordinate of the axis-aligned query bounding box.
   * @param maxY Maximum Y coordinate of the axis-aligned query bounding box.
   * @param maxZ Maximum Z coordinate of the axis-aligned query bounding box.
   * @param callback Callback function that will be called for each overlapping data entry.
   */
  public query(
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
    callback: (data: T, node: NodeIndex) => void,
  ) {
    let stack = new Int32Array(64); // stack for tree traversal
    let sp = 0;
    stack[sp++] = this._root;

    while (sp > 0) {
      const node = stack[--sp];
      if (node === NULL) continue;

      if (!this._overlaps(node, minX, minY, minZ, maxX, maxY, maxZ)) {
        continue;
      }

      if (this._isLeaf(node)) {
        callback(this._data[node]!, node); // is leaf
      } else {
        // grow stack if needed
        if (sp + 2 >= stack.length) {
          const newStack = new Int32Array(stack.length * 2);
          newStack.set(stack);
          stack = newStack;
        }

        stack[sp++] = this._left[node];
        stack[sp++] = this._right[node];
      }
    }
  }

  /** Number of data entries currently stored in the BVH. */
  public get size(): number {
    return this._leafCount;
  }

  /** Grow factor by which the capacity is increased when exceeded. */
  public get capacityGrowFactor(): number {
    return this._capacityGrowFactor;
  }

  /**
   * Sets the grow factor by which the capacity is increased when exceeded.
   * If smaller than or equal to 1.0, the capacity will not grow and an error will be thrown when capacity is exceeded.
   */
  public set capacityGrowFactor(value: number) {
    if (value <= 1.0) throw new Error('capacityGrowFactor must be greater than 1.0');
    this._capacityGrowFactor = value;
  }

  public toDebugString(): string {
    const visitedIndices = new Set<NodeIndex>();
    let treeStr = '';
    let freeStr = '';
    let missingStr = '';
    let errors = '';

    // traverse tree
    let stack = new Int32Array(64); // stack for tree traversal
    let sp = 0;
    stack[sp++] = this._root;
    while (sp > 0) {
      const node = stack[--sp];
      if (node === NULL) continue;

      visitedIndices.add(node);

      // checks
      if (this._parent[node] === NULL && node !== this._root)
        errors += ", 'node " + node + " has no parent but is not root'";
      if (this._left[node] !== NULL && this._parent[this._left[node]] !== node)
        errors += ", 'node " + node + " is not parent of its left child'";
      if (this._right[node] !== NULL && this._parent[this._right[node]] !== node)
        errors += ", 'node " + node + " is not parent of its right child'";

      // flags
      const flags = [];
      if (this._isLeaf(node)) {
        flags.push('L');
        if (this._data[node] === undefined) errors += ", 'leaf " + node + " has no data'";
        if (this._left[node] !== NULL) errors += ", 'leaf " + node + " has left child'";
        if (this._right[node] !== NULL) errors += ", 'leaf " + node + " has right child'";
      } else {
        if (this._data[node] !== undefined)
          errors += ", 'internal node " + node + ' has data "' + this._data[node] + '"' + "'";
      }
      if (this._isFree(node)) {
        flags.push('F');
        errors += ", 'node " + node + " is marked free but is in the tree'";
      }

      // output
      treeStr +=
        ', (' +
        node +
        ' | d=' +
        (this._data[node] !== undefined ? "'" + this._data[node] + "'" : 'null') +
        ', l=' +
        (this._left[node] !== NULL ? this._left[node] : 'null') +
        ', r=' +
        (this._right[node] !== NULL ? this._right[node] : 'null') +
        ', p=' +
        (this._parent[node] !== NULL ? this._parent[node] : 'null') +
        ', h=' +
        this._height[node] +
        ', f=[' +
        flags.join(',') +
        '])';

      // traverse children if not leaf
      if (!this._isLeaf(node)) {
        // grow stack if needed
        if (sp + 2 >= stack.length) {
          const newStack = new Int32Array(stack.length * 2);
          newStack.set(stack);
          stack = newStack;
        }

        stack[sp++] = this._left[node];
        stack[sp++] = this._right[node];
      }
    }

    // iterate free list
    let curr = this._freeList;
    while (curr !== NULL) {
      const flags = [];
      if (this._isFree(curr)) flags.push('L');
      if (this._flags[curr] & FLAG_IS_FREE) flags.push('F');
      freeStr += ', (' + curr + ' | f=[' + flags.join(',') + '])';
      visitedIndices.add(curr);
      curr = this._parent[curr];
    }

    for (let i = 0; i < this._capacity; i++) {
      if (!visitedIndices.has(i)) missingStr += ', ' + i;
    }

    return (
      'BVH(size=' +
      this.size +
      ', capacity=' +
      this._capacity +
      ', \n\ttree=[ ' +
      treeStr.substring(2) +
      ' ]' +
      ', \n\tfree=[ ' +
      freeStr.substring(2) +
      ' ]' +
      (missingStr.length > 0 ? ', \n\tmissing=[ ' + missingStr.substring(2) + ' ]' : '') +
      (errors.length > 0 ? ', \n\terrors=[ ' + errors.substring(2) + ' ]' : '') +
      '\n)'
    );
  }
}
