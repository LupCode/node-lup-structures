import { LinkedListComparator } from '../Interfaces';
import { ObjectDoubleLinkedList } from '../ObjectDoubleLinkedList';

class TestEntry implements LinkedListComparator<TestEntry> {
  public value: number;

  constructor(value: number) {
    this.value = value;
  }

  public equals(other: TestEntry): boolean {
    return (this.value - (this.value % 3)) === (other.value - (other.value % 3));
  }

  public toString(): string {
    return this.value.toString();
  }
}

describe('Testing LinkedList', () => {



  test('Empty constructor', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>();
    expect(list.length).toBe(0);
  });



  test('Constructor with initial values', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);
    expect(list.length).toBe(3);
  });



  // add() is the same as push()


  test('Method at()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)).toBeUndefined();
  });



  test('Method clear()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);
    list.clear();
    expect(list.length).toBe(0);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)).toBeUndefined();
    expect(list.at(1)).toBeUndefined();
    expect(list.at(2)).toBeUndefined();
    expect(list.at(3)).toBeUndefined();
  });



  test('Method concat()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
    ]);
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(9),
      new TestEntry(12),
    ]);
    const list = listA.concat(listB);

    expect(listA.length).toBe(2);
    expect(listA.at(-1)).toBeUndefined();
    expect(listA.at(0)?.value).toBe(3);
    expect(listA.at(1)?.value).toBe(6);
    expect(listA.at(2)).toBeUndefined();

    expect(listB.length).toBe(2);
    expect(listB.at(-1)).toBeUndefined();
    expect(listB.at(0)?.value).toBe(9);
    expect(listB.at(1)?.value).toBe(12);
    expect(listB.at(2)).toBeUndefined();

    expect(list.length).toBe(4);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)?.value).toBe(12);
    expect(list.at(4)).toBeUndefined();
  });



  test('Method concatInPlace()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
    ]);
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(9),
      new TestEntry(12),
    ]);
    const listC = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(15),
    ]);
    const list = listA.concatInPlace(listB, listC);

    expect(listA.length).toBe(5);
    expect(listA.at(-1)).toBeUndefined();
    expect(listA.at(0)?.value).toBe(3);
    expect(listA.at(1)?.value).toBe(6);
    expect(listA.at(2)?.value).toBe(9);
    expect(listA.at(3)?.value).toBe(12);
    expect(listA.at(4)?.value).toBe(15);
    expect(listA.at(5)).toBeUndefined();

    expect(listB.length).toBe(2);
    expect(listB.at(-1)).toBeUndefined();
    expect(listB.at(0)?.value).toBe(9);
    expect(listB.at(1)?.value).toBe(12);
    expect(listB.at(2)).toBeUndefined();

    expect(listC.length).toBe(1);
    expect(listC.at(-1)).toBeUndefined();
    expect(listC.at(0)?.value).toBe(15);
    expect(listC.at(1)).toBeUndefined();

    expect(list.length).toBe(5);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)?.value).toBe(12);
    expect(list.at(4)?.value).toBe(15);
    expect(list.at(5)).toBeUndefined();
  });



  test('Method entries()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);
    const it = list.entries();
    expect(it).toBeDefined();
    for(let i = 0; i < list.length; i++){
      const e = it.next();
      const [idx, obj] = e.value;
      expect(e.done).toBe(false);
      expect(idx).toBe(i);
      expect(obj).toBeDefined();
      expect(obj.value).toBe(i * 3 + 3);
    }
    const e = it.next();
    expect(e.done).toBe(true);
    expect(e.value).toBeUndefined();
  });



  test('Method every()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);
    expect(list.every((v => v.value < 0))).toBe(false);
    expect(list.every((v => v.value > 0))).toBe(true);
    expect(list.every((v => v.value > 99))).toBe(false);
  });



  test('Method fill()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(1),
      new TestEntry(2),
      new TestEntry(3),
    ]);

    list.fill(new TestEntry(4));
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(4);
    expect(list.at(1)?.value).toBe(4);
    expect(list.at(2)?.value).toBe(4);
    expect(list.at(3)).toBeUndefined();

    list.fill(new TestEntry(5), 1, -1);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(4);
    expect(list.at(1)?.value).toBe(5);
    expect(list.at(2)?.value).toBe(4);
    expect(list.at(3)).toBeUndefined();

    list.fill(new TestEntry(6), -2);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(4);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(6);
    expect(list.at(3)).toBeUndefined();

    list.fill(new TestEntry(7), 0, 2);
    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(7);
    expect(list.at(1)?.value).toBe(7);
    expect(list.at(2)?.value).toBe(6);
    expect(list.at(3)).toBeUndefined();
  });



  test('Method filter()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(1),
      new TestEntry(2),
      new TestEntry(3),
    ]);
    const result = list.filter((v => v.value >= 2));

    expect(list.length).toBe(3);
    expect(list.at(-1)).toBeUndefined();
    expect(list.at(0)?.value).toBe(1);
    expect(list.at(1)?.value).toBe(2);
    expect(list.at(2)?.value).toBe(3);
    expect(list.at(3)).toBeUndefined();

    expect(result.length).toBe(2);
    expect(result.at(-1)).toBeUndefined();
    expect(result.at(0)?.value).toBe(2);
    expect(result.at(1)?.value).toBe(3);
    expect(result.at(2)).toBeUndefined();
  });



  test('Method filterInPlace()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(1),
      new TestEntry(2),
      new TestEntry(3),
    ]);
    const resultA = listA.filterInPlace((v => v.value >= 2));
    expect(listA.length).toBe(2);
    expect(listA.at(-1)).toBeUndefined();
    expect(listA.at(0)?.value).toBe(2);
    expect(listA.at(1)?.value).toBe(3);
    expect(listA.at(2)).toBeUndefined();
    expect(resultA.length).toBe(2);
    expect(resultA.at(-1)).toBeUndefined();
    expect(resultA.at(0)?.value).toBe(2);
    expect(resultA.at(1)?.value).toBe(3);
    expect(resultA.at(2)).toBeUndefined();

    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(1),
      new TestEntry(2),
      new TestEntry(3),
      new TestEntry(4),
    ]);
    const resultB = listB.filterInPlace((v => v.value % 2 === 0));
    expect(listB.length).toBe(2);
    expect(listB.at(-1)).toBeUndefined();
    expect(listB.at(0)?.value).toBe(2);
    expect(listB.at(1)?.value).toBe(4);
    expect(listB.at(2)).toBeUndefined();
    expect(resultB.length).toBe(2);
    expect(resultB.at(-1)).toBeUndefined();
    expect(resultB.at(0)?.value).toBe(2);
    expect(resultB.at(1)?.value).toBe(4);
    expect(resultB.at(2)).toBeUndefined();

    const listC = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(1),
      new TestEntry(2),
      new TestEntry(3),
    ]);
    const resultC = listC.filterInPlace((v => v.value <= 2));
    expect(listC.length).toBe(2);
    expect(listC.at(-1)).toBeUndefined();
    expect(listC.at(0)?.value).toBe(1);
    expect(listC.at(1)?.value).toBe(2);
    expect(listC.at(2)).toBeUndefined();
    expect(resultC.length).toBe(2);
    expect(resultC.at(-1)).toBeUndefined();
    expect(resultC.at(0)?.value).toBe(1);
    expect(resultC.at(1)?.value).toBe(2);
    expect(resultC.at(2)).toBeUndefined();
  });



  test('Method find()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(1),
      new TestEntry(2),
      new TestEntry(3),
    ]);
    expect(list.find(v => v.value === 0)?.value).toBeUndefined();
    expect(list.find(v => v.value === 1)?.value).toBe(1);
    expect(list.find(v => v.value === 2)?.value).toBe(2);
    expect(list.find(v => v.value === 3)?.value).toBe(3);
    expect(list.find(v => v.value === 4)?.value).toBeUndefined();
  });



  test('Method findIndex()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(1),
      new TestEntry(2),
      new TestEntry(3),
    ]);
    expect(list.findIndex(v => v.value === 0)).toBe(-1);
    expect(list.findIndex(v => v.value === 1)).toBe(0);
    expect(list.findIndex(v => v.value === 2)).toBe(1);
    expect(list.findIndex(v => v.value === 3)).toBe(2);
    expect(list.findIndex(v => v.value === 4)).toBe(-1);
  });



  // TODO flat
  // TODO flatMap
  // TODO forEach



  test('Method getByComparator()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(4),
      new TestEntry(5),
      new TestEntry(6),
      new TestEntry(7),
      new TestEntry(8),
      new TestEntry(9),
      new TestEntry(10),
      new TestEntry(11),
    ]);
    expect(list.getByComparator(new TestEntry(1))?.value).toBeUndefined();
    expect(list.getByComparator(new TestEntry(2))?.value).toBeUndefined();
    expect(list.getByComparator(new TestEntry(3))?.value).toBe(3);
    expect(list.getByComparator(new TestEntry(4))?.value).toBe(3);
    expect(list.getByComparator(new TestEntry(5))?.value).toBe(3);
    expect(list.getByComparator(new TestEntry(6))?.value).toBe(6);
    expect(list.getByComparator(new TestEntry(7))?.value).toBe(6);
    expect(list.getByComparator(new TestEntry(8))?.value).toBe(6);
    expect(list.getByComparator(new TestEntry(9))?.value).toBe(9);
    expect(list.getByComparator(new TestEntry(10))?.value).toBe(9);
    expect(list.getByComparator(new TestEntry(11))?.value).toBe(9);
    expect(list.getByComparator(new TestEntry(12))?.value).toBeUndefined();
    expect(list.getByComparator(new TestEntry(13))?.value).toBeUndefined();
  });



  test('Method getLastByComparator()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(4),
      new TestEntry(5),
      new TestEntry(6),
      new TestEntry(7),
      new TestEntry(8),
      new TestEntry(9),
      new TestEntry(10),
      new TestEntry(11),
    ]);
    expect(list.getLastByComparator(new TestEntry(1))?.value).toBeUndefined();
    expect(list.getLastByComparator(new TestEntry(2))?.value).toBeUndefined();
    expect(list.getLastByComparator(new TestEntry(3))?.value).toBe(5);
    expect(list.getLastByComparator(new TestEntry(4))?.value).toBe(5);
    expect(list.getLastByComparator(new TestEntry(5))?.value).toBe(5);
    expect(list.getLastByComparator(new TestEntry(6))?.value).toBe(8);
    expect(list.getLastByComparator(new TestEntry(7))?.value).toBe(8);
    expect(list.getLastByComparator(new TestEntry(8))?.value).toBe(8);
    expect(list.getLastByComparator(new TestEntry(9))?.value).toBe(11);
    expect(list.getLastByComparator(new TestEntry(10))?.value).toBe(11);
    expect(list.getLastByComparator(new TestEntry(11))?.value).toBe(11);
    expect(list.getByComparator(new TestEntry(12))?.value).toBeUndefined();
    expect(list.getByComparator(new TestEntry(13))?.value).toBeUndefined();
  });



  test('Method includes()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
    ]);
    expect(list.includes(new TestEntry(1))).toBe(false);
    expect(list.includes(new TestEntry(2))).toBe(false);
    expect(list.includes(new TestEntry(3))).toBe(true);
    expect(list.includes(new TestEntry(4))).toBe(true);
    expect(list.includes(new TestEntry(5))).toBe(true);
    expect(list.includes(new TestEntry(6))).toBe(true);
    expect(list.includes(new TestEntry(7))).toBe(true);
    expect(list.includes(new TestEntry(8))).toBe(true);
    expect(list.includes(new TestEntry(9))).toBe(false);
    expect(list.includes(new TestEntry(10))).toBe(false);
  });



  test('Method indexOf()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(4),
      new TestEntry(5),
      new TestEntry(6),
    ]);
    expect(list.indexOf(new TestEntry(1))).toBe(-1);
    expect(list.indexOf(new TestEntry(2))).toBe(-1);
    expect(list.indexOf(new TestEntry(3))).toBe(0);
    expect(list.indexOf(new TestEntry(4))).toBe(0);
    expect(list.indexOf(new TestEntry(5))).toBe(0);
    expect(list.indexOf(new TestEntry(6))).toBe(3);
    expect(list.indexOf(new TestEntry(7))).toBe(3);
    expect(list.indexOf(new TestEntry(8))).toBe(3);
    expect(list.indexOf(new TestEntry(9))).toBe(-1);
    expect(list.indexOf(new TestEntry(10))).toBe(-1);
  });



  test('Method isEmpty()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
    ]);
    expect(list.isEmpty()).toBe(false);
    list.clear();
    expect(list.isEmpty()).toBe(true);
    list.add(new TestEntry(9), new TestEntry(10));
    expect(list.isEmpty()).toBe(false);
    list.remove(new TestEntry(10));
    expect(list.isEmpty()).toBe(false);
    list.removeAt(0);
    expect(list.isEmpty()).toBe(true);
  });



  test('Method join()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
    ]);
    expect(list.join(',')).toBe('3,6');
    expect(list.join(';')).toBe('3;6');
  });

  

  test('Method lastIndexOf()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(4),
      new TestEntry(5),
      new TestEntry(6),
    ]);
    expect(list.lastIndexOf(new TestEntry(1))).toBe(-1);
    expect(list.lastIndexOf(new TestEntry(2))).toBe(-1);
    expect(list.lastIndexOf(new TestEntry(3))).toBe(2);
    expect(list.lastIndexOf(new TestEntry(4))).toBe(2);
    expect(list.lastIndexOf(new TestEntry(5))).toBe(2);
    expect(list.lastIndexOf(new TestEntry(6))).toBe(3);
    expect(list.lastIndexOf(new TestEntry(7))).toBe(3);
    expect(list.lastIndexOf(new TestEntry(8))).toBe(3);
    expect(list.lastIndexOf(new TestEntry(9))).toBe(-1);
    expect(list.lastIndexOf(new TestEntry(10))).toBe(-1);
  });



  // TODO length



  test('Method map()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>();
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);

    const resultA = listA.map(v => new TestEntry(v.value * 2));
    expect(resultA.length).toBe(0);
    expect(resultA.at(0)).toBeUndefined();

    const resultB = listB.map(v => new TestEntry(v.value * 2));
    expect(resultB.length).toBe(3);
    expect(resultB.at(-1)).toBeUndefined();
    expect(resultB.at(0)?.value).toBe(6);
    expect(resultB.at(1)?.value).toBe(12);
    expect(resultB.at(2)?.value).toBe(18);
    expect(resultB.at(3)).toBeUndefined();
  });



  test('Method mapToArray()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>();
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);

    const resultA = listA.mapToArray(v => new TestEntry(v.value * 2));
    expect(resultA.length).toBe(0);
    expect(resultA[0]).toBeUndefined();

    const resultB = listB.mapToArray(v => new TestEntry(v.value * 2));
    expect(resultB.length).toBe(3);
    expect(resultB[-1]).toBeUndefined();
    expect(resultB[0]?.value).toBe(6);
    expect(resultB[1]?.value).toBe(12);
    expect(resultB[2]?.value).toBe(18);
    expect(resultB[3]).toBeUndefined();
  });



  test('Method peek()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>();
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(4),
      new TestEntry(5),
      new TestEntry(6),
    ]);

    expect(listA.peek()).toBeUndefined();
    expect(listA.length).toBe(0);

    expect(listB.peek()?.value).toBe(6);
    expect(listB.length).toBe(4);
    listB.clear();
    expect(listB.peek()).toBeUndefined();
    expect(listB.length).toBe(0);
  });



  test('Method peekFront()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>();
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(4),
      new TestEntry(5),
      new TestEntry(6),
    ]);

    expect(listA.peekFront()).toBeUndefined();
    expect(listA.length).toBe(0);

    expect(listB.peekFront()?.value).toBe(3);
    expect(listB.length).toBe(4);
    listB.clear();
    expect(listB.peekFront()).toBeUndefined();
    expect(listB.length).toBe(0);
  });



  test('Method pop()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(5),
      new TestEntry(9),
    ]);
    expect(list.pop()?.value).toBe(9);
    expect(list.length).toBe(2);
    expect(list.pop()?.value).toBe(5);
    expect(list.length).toBe(1);
    expect(list.pop()?.value).toBe(3);
    expect(list.length).toBe(0);
    expect(list.pop()).toBeUndefined();
    expect(list.length).toBe(0);
  });



  // popFront() is the same as shift()



  test('Method push()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>();

    expect(list.push(new TestEntry(3), new TestEntry(5), new TestEntry(9))).toBe(3);
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(5);
    expect(list.at(2)?.value).toBe(9);

    expect(list.push(new TestEntry(12), new TestEntry(15))).toBe(5);
    expect(list.length).toBe(5);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(5);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)?.value).toBe(12);
    expect(list.at(4)?.value).toBe(15);
  });



  // pushFront() is the same as unshift()



  test('Method reduce()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(5),
      new TestEntry(9),
    ]);
    expect(list.reduce((acc, v) => new TestEntry(acc.value + v.value) ).value).toBe(17);
    expect(list.reduce((acc, v) => new TestEntry(acc.value + v.value), new TestEntry(3)).value).toBe(20);
  });



  test('Method reduceRight()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(5),
      new TestEntry(9),
    ]);
    expect(list.reduceRight((acc, v) => new TestEntry(acc.value - v.value) ).value).toBe(1);
    expect(list.reduceRight((acc, v) => new TestEntry(acc.value - v.value), new TestEntry(20)).value).toBe(3);
  });



  test('Method remove()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);
    expect(list.remove(new TestEntry(1))).toBeUndefined();
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)).toBeUndefined();

    expect(list.remove(new TestEntry(7))?.value).toBe(6);
    expect(list.length).toBe(2);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(9);
    expect(list.at(2)).toBeUndefined();

    expect(list.remove(new TestEntry(3))?.value).toBe(3);
    expect(list.length).toBe(1);
    expect(list.at(0)?.value).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.remove(new TestEntry(3))?.value).toBeUndefined();
    expect(list.length).toBe(1);
    expect(list.at(0)?.value).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.remove(new TestEntry(9))?.value).toBe(9);
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();

    expect(list.remove(new TestEntry(6))?.value).toBeUndefined();
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();
  });



  test('Method removeAt()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);

    expect(list.removeAt(-1)).toBeUndefined();
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)).toBeUndefined();

    expect(list.removeAt(1)?.value).toBe(6);
    expect(list.length).toBe(2);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(9);
    expect(list.at(2)).toBeUndefined();

    expect(list.removeAt(0)?.value).toBe(3);
    expect(list.length).toBe(1);
    expect(list.at(0)?.value).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.removeAt(1)?.value).toBeUndefined();
    expect(list.length).toBe(1);
    expect(list.at(0)?.value).toBe(9);
    expect(list.at(1)).toBeUndefined();

    expect(list.removeAt(0)?.value).toBe(9);
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();

    expect(list.removeAt(0)?.value).toBeUndefined();
    expect(list.length).toBe(0);
    expect(list.at(0)).toBeUndefined();
  });



  test('Method reverse()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(5),
      new TestEntry(9),
    ]);
    list.reverse();
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(9);
    expect(list.at(1)?.value).toBe(5);
    expect(list.at(2)?.value).toBe(3);
    expect(list.at(3)).toBeUndefined();
  });



  test('Method set()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);

    list.set(0, new TestEntry(4));
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(4);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.set(1, new TestEntry(7));
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(4);
    expect(list.at(1)?.value).toBe(7);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.set(2, new TestEntry(10));
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(4);
    expect(list.at(1)?.value).toBe(7);
    expect(list.at(2)?.value).toBe(10);
    expect(list.at(3)).toBeUndefined();

    list.set(3, new TestEntry(12));
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(4);
    expect(list.at(1)?.value).toBe(7);
    expect(list.at(2)?.value).toBe(10);
    expect(list.at(3)).toBeUndefined();
  });



  test('Method setByComparator()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);

    list.setByComparator(new TestEntry(0), new TestEntry(4), false);
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(6);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.setByComparator(new TestEntry(7), new TestEntry(7), false);
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(7);
    expect(list.at(2)?.value).toBe(9);
    expect(list.at(3)).toBeUndefined();

    list.setByComparator(new TestEntry(9), new TestEntry(10), false);
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(7);
    expect(list.at(2)?.value).toBe(10);
    expect(list.at(3)).toBeUndefined();

    list.setByComparator(new TestEntry(12), new TestEntry(12), true);
    expect(list.length).toBe(4);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(7);
    expect(list.at(2)?.value).toBe(10);
    expect(list.at(3)?.value).toBe(12);
    expect(list.at(4)).toBeUndefined();
  });



  test('Method shift()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(5),
      new TestEntry(9),
    ]);
    expect(list.shift()?.value).toBe(3);
    expect(list.length).toBe(2);
    expect(list.shift()?.value).toBe(5);
    expect(list.length).toBe(1);
    expect(list.shift()?.value).toBe(9);
    expect(list.length).toBe(0);
    expect(list.shift()).toBeUndefined();
    expect(list.length).toBe(0);
  });



  test('Method slice()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(6),
      new TestEntry(3),
      new TestEntry(12),
      new TestEntry(9),
      new TestEntry(15),
    ]);

    const resultA = list.slice();
    expect(resultA.length).toBe(5);
    expect(resultA.at(-1)).toBeUndefined();
    expect(resultA.at(0)?.value).toBe(6);
    expect(resultA.at(1)?.value).toBe(3);
    expect(resultA.at(2)?.value).toBe(12);
    expect(resultA.at(3)?.value).toBe(9);
    expect(resultA.at(4)?.value).toBe(15);
    expect(resultA.at(5)).toBeUndefined();

    const resultB = list.slice(3);
    expect(resultB.length).toBe(2);
    expect(resultB.at(-1)).toBeUndefined();
    expect(resultB.at(0)?.value).toBe(9);
    expect(resultB.at(1)?.value).toBe(15);
    expect(resultB.at(2)).toBeUndefined();

    const resultC = list.slice(1, -1);
    expect(resultC.length).toBe(3);
    expect(resultC.at(-1)).toBeUndefined();
    expect(resultC.at(0)?.value).toBe(3);
    expect(resultC.at(1)?.value).toBe(12);
    expect(resultC.at(2)?.value).toBe(9);
    expect(resultC.at(3)).toBeUndefined();
  });



  test('Method slice()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(6),
      new TestEntry(3),
      new TestEntry(12),
      new TestEntry(9),
      new TestEntry(15),
    ]);

    const resultA = list.sliceToArray();
    expect(resultA.length).toBe(5);
    expect(resultA[-1]).toBeUndefined();
    expect(resultA[0]?.value).toBe(6);
    expect(resultA[1]?.value).toBe(3);
    expect(resultA[2]?.value).toBe(12);
    expect(resultA[3]?.value).toBe(9);
    expect(resultA[4]?.value).toBe(15);
    expect(resultA[5]).toBeUndefined();

    const resultB = list.sliceToArray(3);
    expect(resultB.length).toBe(2);
    expect(resultB[-1]).toBeUndefined();
    expect(resultB[0]?.value).toBe(9);
    expect(resultB[1]?.value).toBe(15);
    expect(resultB[2]).toBeUndefined();

    const resultC = list.sliceToArray(1, -1);
    expect(resultC.length).toBe(3);
    expect(resultC[-1]).toBeUndefined();
    expect(resultC[0]?.value).toBe(3);
    expect(resultC[1]?.value).toBe(12);
    expect(resultC[2]?.value).toBe(9);
    expect(resultC[3]).toBeUndefined();
  });



  test('Method some()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
    ]);
    expect(list.some((v => v.value < 0))).toBe(false);
    expect(list.some((v => v.value % 2 === 0))).toBe(true);
    expect(list.some((v => v.value > 99))).toBe(false);
  });



  test('Method sort()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>();
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(6),
      new TestEntry(3),
      new TestEntry(12),
      new TestEntry(9),
      new TestEntry(15),
    ]);
    const listC = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
      new TestEntry(12),
      new TestEntry(15),
    ]);

    listA.sort((a, b) => a.value - b.value);
    expect(listA.length).toBe(0);

    listB.sort((a, b) => a.value - b.value);
    expect(listB.length).toBe(5);
    expect(listB.at(0)?.value).toBe(3);
    expect(listB.at(1)?.value).toBe(6);
    expect(listB.at(2)?.value).toBe(9);
    expect(listB.at(3)?.value).toBe(12);
    expect(listB.at(4)?.value).toBe(15);
    expect(listB.at(5)).toBeUndefined();

    listC.sort((a, b) => b.value - a.value);
    expect(listC.length).toBe(5);
    expect(listC.at(0)?.value).toBe(15);
    expect(listC.at(1)?.value).toBe(12);
    expect(listC.at(2)?.value).toBe(9);
    expect(listC.at(3)?.value).toBe(6);
    expect(listC.at(4)?.value).toBe(3);
    expect(listC.at(5)).toBeUndefined();
  });



  test('Method splice()', () => {
    const listA = new ObjectDoubleLinkedList<TestEntry>();
    const listB = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(6),
      new TestEntry(3),
      new TestEntry(12),
      new TestEntry(9),
      new TestEntry(15),
    ]);
    const listC = new ObjectDoubleLinkedList<TestEntry>([
      new TestEntry(3),
      new TestEntry(6),
      new TestEntry(9),
      new TestEntry(12),
      new TestEntry(15),
    ]);

    const resultA = listA.splice(0, 2, new TestEntry(1));
    expect(listA.length).toBe(1);
    expect(listA.at(0)?.value).toBe(1);
    expect(listA.at(1)).toBeUndefined();
    expect(resultA.length).toBe(0);

    const resultB = listB.splice(0, 3, new TestEntry(1), new TestEntry(2));
    expect(listB.length).toBe(4);
    expect(listB.at(0)?.value).toBe(1);
    expect(listB.at(1)?.value).toBe(2);
    expect(listB.at(2)?.value).toBe(9);
    expect(listB.at(3)?.value).toBe(15);
    expect(listB.at(4)).toBeUndefined();
    expect(resultB.length).toBe(3);
    expect(resultB.at(0)?.value).toBe(6);
    expect(resultB.at(1)?.value).toBe(3);
    expect(resultB.at(2)?.value).toBe(12);
    expect(resultB.at(3)).toBeUndefined();

    const resultC = listC.splice(3, 10, new TestEntry(7), new TestEntry(8), new TestEntry(9));
    expect(listC.length).toBe(6);
    expect(listC.at(0)?.value).toBe(3);
    expect(listC.at(1)?.value).toBe(6);
    expect(listC.at(2)?.value).toBe(9);
    expect(listC.at(3)?.value).toBe(7);
    expect(listC.at(4)?.value).toBe(8);
    expect(listC.at(5)?.value).toBe(9);
    expect(listC.at(6)).toBeUndefined();
    expect(resultC.length).toBe(2);
    expect(resultC.at(0)?.value).toBe(12);
    expect(resultC.at(1)?.value).toBe(15);
    expect(resultC.at(2)).toBeUndefined();
  });



  test('Method unshift()', () => {
    const list = new ObjectDoubleLinkedList<TestEntry>();

    expect(list.unshift(new TestEntry(3), new TestEntry(5), new TestEntry(9))).toBe(3);
    expect(list.length).toBe(3);
    expect(list.at(0)?.value).toBe(3);
    expect(list.at(1)?.value).toBe(5);
    expect(list.at(2)?.value).toBe(9);

    expect(list.unshift(new TestEntry(12), new TestEntry(15))).toBe(5);
    expect(list.length).toBe(5);
    expect(list.at(0)?.value).toBe(12);
    expect(list.at(1)?.value).toBe(15);
    expect(list.at(2)?.value).toBe(3);
    expect(list.at(3)?.value).toBe(5);
    expect(list.at(4)?.value).toBe(9);
  });
});