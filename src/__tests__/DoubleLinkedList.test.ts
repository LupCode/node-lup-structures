import DoubleLinkedList from '../DoubleLinkedList';

const EQUALS = (a: number, b: number) => a - (a % 3) === b - (b % 3);

describe('Testing DoubleLinkedList', () => {
  test('Empty constructor', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS });
    expect(list.length).toBe(0);
  });

  test('Constructor with initial values', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);
    expect(list.length).toBe(3);
  });

  // add() is the same as push()

  test('Method at()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBeUndefined();
  });

  test('Method clear()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);
    list.clear();
    expect(list.length).toBe(0);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBeUndefined();
    expect(list.at(1)).toBeUndefined();
    expect(list.at(2)).toBeUndefined();
    expect(list.at(3)).toBeUndefined();
  });

  test('Method concat()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6]);
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [9, 12]);
    const list = listA.concat(listB);

    expect(listA.length).toBe(2);
    expect(listA.at(-1)).toBeUndefined();
    expect(listA.at(0)).toBe(3);
    expect(listA.at(1)).toBe(6);
    expect(listA.at(2)).toBeUndefined();

    expect(listB.length).toBe(2);
    expect(listB.at(-1)).toBeUndefined();
    expect(listB.at(0)).toBe(9);
    expect(listB.at(1)).toBe(12);
    expect(listB.at(2)).toBeUndefined();

    expect(list.length).toBe(4);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBe(12);
    expect(list.at(4)).toBeUndefined();
  });

  test('Method concatInPlace()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6]);
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [9, 12]);
    const listC = new DoubleLinkedList<number>({ equals: EQUALS }, [15]);

    const list = listA.concatInPlace(listB, listC);

    expect(listA.length).toBe(5);
    expect(listA.at(-1)).toBeUndefined();
    expect(listA.at(0)).toBe(3);
    expect(listA.at(1)).toBe(6);
    expect(listA.at(2)).toBe(9);
    expect(listA.at(3)).toBe(12);
    expect(listA.at(4)).toBe(15);
    expect(listA.at(5)).toBeUndefined();

    expect(listB.length).toBe(2);
    expect(listB.at(-1)).toBeUndefined();
    expect(listB.at(0)).toBe(9);
    expect(listB.at(1)).toBe(12);
    expect(listB.at(2)).toBeUndefined();

    expect(listC.length).toBe(1);
    expect(listC.at(-1)).toBeUndefined();
    expect(listC.at(0)).toBe(15);
    expect(listC.at(1)).toBeUndefined();

    expect(list.length).toBe(5);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBe(12);
    expect(list.at(4)).toBe(15);
    expect(list.at(5)).toBeUndefined();
  });

  test('Method entries()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);
    const it = list.entries();
    expect(it).toBeDefined();
    for (let i = 0; i < list.length; i++) {
      const e: IteratorResult<[number, number]> = it.next(); // [index, value]
      const [idx, obj] = e.value;
      expect(e.done).toBe(false);
      expect(idx).toBe(i);
      expect(obj).toBeDefined();
      expect(obj).toBe(i * 3 + 3);
    }
    const e = it.next();
    expect(e.done).toBe(true);
    expect(e.value).toBeUndefined();
  });

  test('Method every()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);
    expect(list.every((v) => v < 0)).toBe(false);
    expect(list.every((v) => v > 0)).toBe(true);
    expect(list.every((v) => v > 99)).toBe(false);
  });

  test('Method fill()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [1, 2, 3]);

    list.fill(4);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(4);
    expect(list.at(1)).toBe(4);
    expect(list.at(2)).toBe(4);
    expect(list.at(3)).toBeUndefined();

    list.fill(5, 1, -1);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(4);
    expect(list.at(1)).toBe(5);
    expect(list.at(2)).toBe(4);
    expect(list.at(3)).toBeUndefined();

    list.fill(6, -2);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(4);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(6);
    expect(list.at(3)).toBeUndefined();

    list.fill(7, 0, 2);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(7);
    expect(list.at(1)).toBe(7);
    expect(list.at(2)).toBe(6);
    expect(list.at(3)).toBeUndefined();
  });

  test('Method filter()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [1, 2, 3]);
    const result = list.filter((v) => v >= 2);

    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBe(1);
    expect(list.at(1)).toBe(2);
    expect(list.at(2)).toBe(3);
    expect(list.at(3)).toBeUndefined();

    expect(result.length).toBe(2);
    expect(result.at(-1)).toBeUndefined();
    expect(result.at(0)).toBe(2);
    expect(result.at(1)).toBe(3);
    expect(result.at(2)).toBeUndefined();
  });

  test('Method filterInPlace()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS }, [1, 2, 3]);
    const resultA = listA.filterInPlace((v) => v >= 2);
    expect(listA.length).toBe(2);
    expect(listA.at(-1)).toBeUndefined();
    expect(listA.at(0)).toBe(2);
    expect(listA.at(1)).toBe(3);
    expect(listA.at(2)).toBeUndefined();
    expect(resultA.length).toBe(2);
    expect(resultA.at(-1)).toBeUndefined();
    expect(resultA.at(0)).toBe(2);
    expect(resultA.at(1)).toBe(3);
    expect(resultA.at(2)).toBeUndefined();

    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [1, 2, 3, 4]);
    const resultB = listB.filterInPlace((v) => v % 2 === 0);
    expect(listB.length).toBe(2);
    expect(listB.at(-1)).toBeUndefined();
    expect(listB.at(0)).toBe(2);
    expect(listB.at(1)).toBe(4);
    expect(listB.at(2)).toBeUndefined();
    expect(resultB.length).toBe(2);
    expect(resultB.at(-1)).toBeUndefined();
    expect(resultB.at(0)).toBe(2);
    expect(resultB.at(1)).toBe(4);
    expect(resultB.at(2)).toBeUndefined();

    const listC = new DoubleLinkedList<number>({ equals: EQUALS }, [1, 2, 3]);
    const resultC = listC.filterInPlace((v) => v <= 2);
    expect(listC.length).toBe(2);
    expect(listC.at(-1)).toBeUndefined();
    expect(listC.at(0)).toBe(1);
    expect(listC.at(1)).toBe(2);
    expect(listC.at(2)).toBeUndefined();
    expect(resultC.length).toBe(2);
    expect(resultC.at(-1)).toBeUndefined();
    expect(resultC.at(0)).toBe(1);
    expect(resultC.at(1)).toBe(2);
    expect(resultC.at(2)).toBeUndefined();
  });

  test('Method find()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [1, 2, 3]);
    expect(list.find((v) => v === 0)).toBeUndefined();
    expect(list.find((v) => v === 1)).toBe(1);
    expect(list.find((v) => v === 2)).toBe(2);
    expect(list.find((v) => v === 3)).toBe(3);
    expect(list.find((v) => v === 4)).toBeUndefined();
  });

  test('Method findIndex()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [1, 2, 3]);
    expect(list.findIndex((v) => v === 0)).toBe(-1);
    expect(list.findIndex((v) => v === 1)).toBe(0);
    expect(list.findIndex((v) => v === 2)).toBe(1);
    expect(list.findIndex((v) => v === 3)).toBe(2);
    expect(list.findIndex((v) => v === 4)).toBe(-1);
  });

  // TODO flat
  // TODO flatMap
  // TODO forEach

  test('Method getByComparator()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(list.getByComparator(1)).toBeUndefined();
    expect(list.getByComparator(2)).toBeUndefined();
    expect(list.getByComparator(3)).toBe(3);
    expect(list.getByComparator(4)).toBe(3);
    expect(list.getByComparator(5)).toBe(3);
    expect(list.getByComparator(6)).toBe(6);
    expect(list.getByComparator(7)).toBe(6);
    expect(list.getByComparator(8)).toBe(6);
    expect(list.getByComparator(9)).toBe(9);
    expect(list.getByComparator(10)).toBe(9);
    expect(list.getByComparator(11)).toBe(9);
    expect(list.getByComparator(12)).toBeUndefined();
    expect(list.getByComparator(13)).toBeUndefined();
  });

  test('Method getLastByComparator()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(list.getLastByComparator(1)).toBeUndefined();
    expect(list.getLastByComparator(2)).toBeUndefined();
    expect(list.getLastByComparator(3)).toBe(5);
    expect(list.getLastByComparator(4)).toBe(5);
    expect(list.getLastByComparator(5)).toBe(5);
    expect(list.getLastByComparator(6)).toBe(8);
    expect(list.getLastByComparator(7)).toBe(8);
    expect(list.getLastByComparator(8)).toBe(8);
    expect(list.getLastByComparator(9)).toBe(11);
    expect(list.getLastByComparator(10)).toBe(11);
    expect(list.getLastByComparator(11)).toBe(11);
    expect(list.getLastByComparator(12)).toBeUndefined();
    expect(list.getLastByComparator(13)).toBeUndefined();
  });

  test('Method includes()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6]);
    expect(list.includes(2)).toBe(false);
    expect(list.includes(2)).toBe(false);
    expect(list.includes(3)).toBe(true);
    expect(list.includes(4)).toBe(true);
    expect(list.includes(5)).toBe(true);
    expect(list.includes(6)).toBe(true);
    expect(list.includes(7)).toBe(true);
    expect(list.includes(8)).toBe(true);
    expect(list.includes(9)).toBe(false);
    expect(list.includes(10)).toBe(false);
  });

  test('Method indexOf()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 4, 5, 6]);
    expect(list.indexOf(1)).toBe(-1);
    expect(list.indexOf(2)).toBe(-1);
    expect(list.indexOf(3)).toBe(0);
    expect(list.indexOf(4)).toBe(0);
    expect(list.indexOf(5)).toBe(0);
    expect(list.indexOf(6)).toBe(3);
    expect(list.indexOf(7)).toBe(3);
    expect(list.indexOf(8)).toBe(3);
    expect(list.indexOf(9)).toBe(-1);
    expect(list.indexOf(10)).toBe(-1);
  });

  test('Method isEmpty()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6]);
    expect(list.isEmpty()).toBe(false);
    list.clear();
    expect(list.isEmpty()).toBe(true);
    list.add(9, 10);
    expect(list.isEmpty()).toBe(false);
    list.remove(10);
    expect(list.isEmpty()).toBe(false);
    list.removeAt(0);
    expect(list.isEmpty()).toBe(true);
  });

  test('Method join()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6]);
    expect(list.join(',')).toBe('3,6');
    expect(list.join(';')).toBe('3;6');
  });

  test('Method lastIndexOf()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 4, 5, 6]);
    expect(list.lastIndexOf(1)).toBe(-1);
    expect(list.lastIndexOf(2)).toBe(-1);
    expect(list.lastIndexOf(3)).toBe(2);
    expect(list.lastIndexOf(4)).toBe(2);
    expect(list.lastIndexOf(5)).toBe(2);
    expect(list.lastIndexOf(6)).toBe(3);
    expect(list.lastIndexOf(7)).toBe(3);
    expect(list.lastIndexOf(8)).toBe(3);
    expect(list.lastIndexOf(9)).toBe(-1);
    expect(list.lastIndexOf(10)).toBe(-1);
  });

  // TODO length

  test('Method map()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS });
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);

    const resultA = listA.map((v) => v * 2);
    expect(resultA.length).toBe(0);
    expect(resultA.at(0)).toBeUndefined();

    const resultB = listB.map((v) => v * 2);
    expect(resultB.length).toBe(3);
    expect(resultB.at(-1)).toBeUndefined();
    expect(resultB.at(0)).toBe(6);
    expect(resultB.at(1)).toBe(12);
    expect(resultB.at(2)).toBe(18);
    expect(resultB.at(3)).toBeUndefined();
  });

  test('Method mapToArray()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS });
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);

    const resultA = listA.mapToArray((v) => v * 2);
    expect(resultA.length).toBe(0);
    expect(resultA[0]).toBeUndefined();

    const resultB = listB.mapToArray((v) => v * 2);
    expect(resultB.length).toBe(3);
    expect(resultB[-1]).toBeUndefined();
    expect(resultB[0]).toBe(6);
    expect(resultB[1]).toBe(12);
    expect(resultB[2]).toBe(18);
    expect(resultB[3]).toBeUndefined();
  });

  test('Method peek()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS });
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 4, 5, 6]);

    expect(listA.peek()).toBeUndefined();
    expect(listA.length).toBe(0);

    expect(listB.peek()).toBe(6);
    expect(listB.length).toBe(4);
    listB.clear();
    expect(listB.peek()).toBeUndefined();
    expect(listB.length).toBe(0);
  });

  test('Method peekFront()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS });
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 4, 5, 6]);

    expect(listA.peekFront()).toBeUndefined();
    expect(listA.length).toBe(0);

    expect(listB.peekFront()).toBe(3);
    expect(listB.length).toBe(4);
    listB.clear();
    expect(listB.peekFront()).toBeUndefined();
    expect(listB.length).toBe(0);
  });

  test('Method pop()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 5, 9]);
    expect(list.pop()).toBe(9);
    expect(list.length).toBe(2);
    expect(list.pop()).toBe(5);
    expect(list.length).toBe(1);
    expect(list.pop()).toBe(3);
    expect(list.length).toBe(0);
    expect(list.pop()).toBeUndefined();
    expect(list.length).toBe(0);
  });

  // popFront() is the same as shift()

  test('Method push()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS });

    expect(list.push(3, 5, 9)).toBe(3);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(5);
    expect(list.at(2)).toBe(9);

    expect(list.push(12, 15)).toBe(5);
    expect(list.length).toBe(5);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(5);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBe(12);
    expect(list.at(4)).toBe(15);
  });

  // pushFront() is the same as unshift()

  test('Method reduce()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 5, 9]);
    expect(list.reduce((acc, v) => acc + v)).toBe(17);
    expect(list.reduce((acc, v) => acc + v, 3)).toBe(20);
  });

  test('Method reduceRight()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 5, 9]);
    expect(list.reduceRight((acc, v) => acc - v)).toBe(1);
    expect(list.reduceRight((acc, v) => acc - v, 20)).toBe(3);
  });

  test('Method remove()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);
    expect(list.remove(1)).toBeUndefined();
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBeUndefined();

    expect(list.remove(7)).toBe(6);
    expect(list.length).toBe(2);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(9);
    expect(list.at(2)).toBeUndefined();

    expect(list.remove(3)).toBe(3);
    expect(list.length).toBe(1);
    expect(list.at(0)).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.remove(3)).toBeUndefined();
    expect(list.length).toBe(1);
    expect(list.at(0)).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.remove(9)).toBe(9);
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();

    expect(list.remove(6)).toBeUndefined();
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();
  });

  test('Method removeAt()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);

    expect(list.removeAt(-1)).toBeUndefined();
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBeUndefined();

    expect(list.removeAt(1)).toBe(6);
    expect(list.length).toBe(2);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(9);
    expect(list.at(2)).toBeUndefined();

    expect(list.removeAt(0)).toBe(3);
    expect(list.length).toBe(1);
    expect(list.at(0)).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.removeAt(1)).toBeUndefined();
    expect(list.length).toBe(1);
    expect(list.at(0)).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.removeAt(0)).toBe(9);
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();

    expect(list.removeAt(0)).toBeUndefined();
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();
  });

  test('Method reverse()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 5, 9]);
    list.reverse();
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(9);
    expect(list.at(1)).toBe(5);
    expect(list.at(2)).toBe(3);
    expect(list.at(3)).toBeUndefined();
  });

  test('Method set()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);

    list.set(0, 4);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(4);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.set(1, 7);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(4);
    expect(list.at(1)).toBe(7);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.set(2, 10);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(4);
    expect(list.at(1)).toBe(7);
    expect(list.at(2)).toBe(10);
    expect(list.at(3)).toBeUndefined();

    list.set(3, 12);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(4);
    expect(list.at(1)).toBe(7);
    expect(list.at(2)).toBe(10);
    expect(list.at(3)).toBeUndefined();
  });

  test('Method setByComparator()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);

    list.setByComparator(0, 4, false);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(6);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.setByComparator(7, 7, false);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(7);
    expect(list.at(2)).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.setByComparator(9, 10, false);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(7);
    expect(list.at(2)).toBe(10);
    expect(list.at(3)).toBeUndefined();

    list.setByComparator(12, 12, true);
    expect(list.length).toBe(4);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(7);
    expect(list.at(2)).toBe(10);
    expect(list.at(3)).toBe(12);
    expect(list.at(4)).toBeUndefined();
  });

  test('Method shift()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 5, 9]);
    expect(list.shift()).toBe(3);
    expect(list.length).toBe(2);
    expect(list.shift()).toBe(5);
    expect(list.length).toBe(1);
    expect(list.shift()).toBe(9);
    expect(list.length).toBe(0);
    expect(list.shift()).toBeUndefined();
    expect(list.length).toBe(0);
  });

  test('Method slice()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [6, 3, 12, 9, 15]);

    const resultA = list.slice();
    expect(resultA.length).toBe(5);
    expect(resultA.at(-1)).toBeUndefined();
    expect(resultA.at(0)).toBe(6);
    expect(resultA.at(1)).toBe(3);
    expect(resultA.at(2)).toBe(12);
    expect(resultA.at(3)).toBe(9);
    expect(resultA.at(4)).toBe(15);
    expect(resultA.at(5)).toBeUndefined();

    const resultB = list.slice(3);
    expect(resultB.length).toBe(2);
    expect(resultB.at(-1)).toBeUndefined();
    expect(resultB.at(0)).toBe(9);
    expect(resultB.at(1)).toBe(15);
    expect(resultB.at(2)).toBeUndefined();

    const resultC = list.slice(1, -1);
    expect(resultC.length).toBe(3);
    expect(resultC.at(-1)).toBeUndefined();
    expect(resultC.at(0)).toBe(3);
    expect(resultC.at(1)).toBe(12);
    expect(resultC.at(2)).toBe(9);
    expect(resultC.at(3)).toBeUndefined();
  });

  test('Method slice()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [6, 3, 12, 9, 15]);

    const resultA = list.sliceToArray();
    expect(resultA.length).toBe(5);
    expect(resultA[-1]).toBeUndefined();
    expect(resultA[0]).toBe(6);
    expect(resultA[1]).toBe(3);
    expect(resultA[2]).toBe(12);
    expect(resultA[3]).toBe(9);
    expect(resultA[4]).toBe(15);
    expect(resultA[5]).toBeUndefined();

    const resultB = list.sliceToArray(3);
    expect(resultB.length).toBe(2);
    expect(resultB[-1]).toBeUndefined();
    expect(resultB[0]).toBe(9);
    expect(resultB[1]).toBe(15);
    expect(resultB[2]).toBeUndefined();

    const resultC = list.sliceToArray(1, -1);
    expect(resultC.length).toBe(3);
    expect(resultC[-1]).toBeUndefined();
    expect(resultC[0]).toBe(3);
    expect(resultC[1]).toBe(12);
    expect(resultC[2]).toBe(9);
    expect(resultC[3]).toBeUndefined();
  });

  test('Method some()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9]);
    expect(list.some((v) => v < 0)).toBe(false);
    expect(list.some((v) => v % 2 === 0)).toBe(true);
    expect(list.some((v) => v > 99)).toBe(false);
  });

  test('Method sort()', () => {
    const listA = new DoubleLinkedList<number>({ equals: EQUALS });
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [6, 3, 12, 9, 15]);
    const listC = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9, 12, 15]);

    listA.sort((a, b) => a - b);
    expect(listA.length).toBe(0);

    listB.sort((a, b) => a - b);
    expect(listB.length).toBe(5);
    expect(listB.at(0)).toBe(3);
    expect(listB.at(1)).toBe(6);
    expect(listB.at(2)).toBe(9);
    expect(listB.at(3)).toBe(12);
    expect(listB.at(4)).toBe(15);
    expect(listB.at(5)).toBeUndefined();

    listC.sort((a, b) => b - a);
    expect(listC.length).toBe(5);
    expect(listC.at(0)).toBe(15);
    expect(listC.at(1)).toBe(12);
    expect(listC.at(2)).toBe(9);
    expect(listC.at(3)).toBe(6);
    expect(listC.at(4)).toBe(3);
    expect(listC.at(5)).toBeUndefined();
  });

  test('Method splice()', () => {
    const listA = new DoubleLinkedList<number>();
    const listB = new DoubleLinkedList<number>({ equals: EQUALS }, [6, 3, 12, 9, 15]);
    const listC = new DoubleLinkedList<number>({ equals: EQUALS }, [3, 6, 9, 12, 15]);

    const resultA = listA.splice(0, 2, 1);
    expect(listA.length).toBe(1);
    expect(listA.at(0)).toBe(1);
    expect(listA.at(1)).toBeUndefined();
    expect(resultA.length).toBe(0);

    const resultB = listB.splice(0, 3, 1, 2);
    expect(listB.length).toBe(4);
    expect(listB.at(0)).toBe(1);
    expect(listB.at(1)).toBe(2);
    expect(listB.at(2)).toBe(9);
    expect(listB.at(3)).toBe(15);
    expect(listB.at(4)).toBeUndefined();
    expect(resultB.length).toBe(3);
    expect(resultB.at(0)).toBe(6);
    expect(resultB.at(1)).toBe(3);
    expect(resultB.at(2)).toBe(12);
    expect(resultB.at(3)).toBeUndefined();

    const resultC = listC.splice(3, 10, 7, 8, 9);
    expect(listC.length).toBe(6);
    expect(listC.at(0)).toBe(3);
    expect(listC.at(1)).toBe(6);
    expect(listC.at(2)).toBe(9);
    expect(listC.at(3)).toBe(7);
    expect(listC.at(4)).toBe(8);
    expect(listC.at(5)).toBe(9);
    expect(listC.at(6)).toBeUndefined();
    expect(resultC.length).toBe(2);
    expect(resultC.at(0)).toBe(12);
    expect(resultC.at(1)).toBe(15);
    expect(resultC.at(2)).toBeUndefined();
  });

  test('Method unshift()', () => {
    const list = new DoubleLinkedList<number>({ equals: EQUALS });

    expect(list.unshift(3, 5, 9)).toBe(3);
    expect(list.length).toBe(3);
    expect(list.at(0)).toBe(3);
    expect(list.at(1)).toBe(5);
    expect(list.at(2)).toBe(9);

    expect(list.unshift(12, 15)).toBe(5);
    expect(list.length).toBe(5);
    expect(list.at(0)).toBe(12);
    expect(list.at(1)).toBe(15);
    expect(list.at(2)).toBe(3);
    expect(list.at(3)).toBe(5);
    expect(list.at(4)).toBe(9);
  });
});
