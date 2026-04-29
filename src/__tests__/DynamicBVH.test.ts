/// <reference types="jest" />
import DynamicBVH, { DynamicBVHOptions } from '../DynamicBVH';

const DEFAULT_OPTIONS: DynamicBVHOptions = {
  capacityInitial: 4,
};

type TestData = {
  data: string;
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

describe('Testing DynamicBVH', () => {
  test('Empty constructor', () => {
    const bvh = new DynamicBVH<string>(DEFAULT_OPTIONS);
    expect(bvh.size).toBe(0);

    bvh.clear();
    expect(bvh.size).toBe(0);

    const debugString = bvh.toDebugString();
    expect(typeof debugString).toBe('string');
    expect(debugString.length).toBeGreaterThan(0);
  });

  test('Simple add and remove', () => {
    const bvh = new DynamicBVH<string>(DEFAULT_OPTIONS);
    expect(bvh.size).toBe(0);

    const node1 = bvh.add('Node1', 0, 0, 0, 1, 1, 1);
    expect(bvh.size).toBe(1);

    const remove1 = bvh.remove(node1);
    expect(remove1).toBe(true);
    expect(bvh.size).toBe(0);
  });

  test('Simple update', () => {
    const bvh = new DynamicBVH<string>(DEFAULT_OPTIONS);
    const node1 = bvh.add('Node1', 1, 1, 1, 2, 2, 2);
    expect(bvh.size).toBe(1);

    bvh.update(node1, 4, 4, 4, 5, 5, 5);

    const queryResults: string[] = [];
    bvh.query(3, 3, 3, 6, 6, 6, (data) => queryResults.push(data));
    expect(queryResults).toEqual(['Node1']);
  });

  test('Complex add, remove, and query', () => {
    const bvh = new DynamicBVH<string>(DEFAULT_OPTIONS);

    // add dummy test data which will be removed before actual testing
    const dummyNodes: number[] = [];
    for (let i = 0; i < 50; i++) {
      const minX = Math.random() * 40 - 20;
      const minY = Math.random() * 40 - 20;
      const minZ = Math.random() * 40 - 20;
      const maxX = minX + Math.random() * (20 - minX);
      const maxY = minY + Math.random() * (20 - minY);
      const maxZ = minZ + Math.random() * (20 - minZ);
      const dummyNode = bvh.add('Dummy' + (i + 1), minX, minY, minZ, maxX, maxY, maxZ);
      expect(dummyNodes.includes(dummyNode)).toBeFalsy();
      expect(bvh.size).toBe(i + 1);
      dummyNodes.push(dummyNode);
    }

    // remove some dummy data
    shuffleArray(dummyNodes);
    for (let i = 0; i < 25; i++) {
      const dummyNode = dummyNodes.pop()!;
      const removeResult = bvh.remove(dummyNode);
      expect(removeResult).toBe(true);
      expect(bvh.size).toBe(50 - i - 1);
    }

    // add some more dummy data
    for (let i = 0; i < 75; i++) {
      const minX = Math.random() * 40 - 20;
      const minY = Math.random() * 40 - 20;
      const minZ = Math.random() * 40 - 20;
      const maxX = minX + Math.random() * (20 - minX);
      const maxY = minY + Math.random() * (20 - minY);
      const maxZ = minZ + Math.random() * (20 - minZ);
      const dummyNode = bvh.add('Dummy' + (i + 1), minX, minY, minZ, maxX, maxY, maxZ);
      expect(dummyNodes.includes(dummyNode)).toBeFalsy();
      expect(bvh.size).toBe(25 + i + 1);
      dummyNodes.push(dummyNode);
    }

    // remove all dummy data
    for (let i = 0; i < 100; i++) {
      const dummyNode = dummyNodes.pop()!;
      const removeResult = bvh.remove(dummyNode);
      expect(removeResult).toBe(true);
      expect(bvh.size).toBe(100 - i - 1);
    }

    // add test data with known positions
    const testData: TestData[] = [
      { data: 'LBF1', minX: -10, maxX: -2, minY: -5, maxY: -4, minZ: -7, maxZ: -3 }, // left bottom front
      { data: 'LBF2', minX: -8, maxX: -1, minY: -6, maxY: -2, minZ: -6, maxZ: -2 }, // left bottom front
      { data: 'LBB1', minX: -10, maxX: -2, minY: -5, maxY: -4, minZ: 4, maxZ: 5 }, // left bottom back
      { data: 'LBB2', minX: -2, maxX: -1, minY: -14, maxY: -9, minZ: 1, maxZ: 4 }, // left bottom back
      { data: 'LTF1', minX: -10, maxX: -2, minY: 4, maxY: 5, minZ: -7, maxZ: -3 }, // left top front
      { data: 'LTF2', minX: -8, maxX: -4, minY: 6, maxY: 7, minZ: -6, maxZ: -1 }, // left top front
      { data: 'LTB1', minX: -10, maxX: -2, minY: 1, maxY: 5, minZ: 2, maxZ: 11 }, // left top back
      { data: 'LTB2', minX: -4, maxX: -3, minY: 2, maxY: 19, minZ: 3, maxZ: 8 }, // left top back
      { data: 'RBF1', minX: 2, maxX: 11, minY: -5, maxY: -4, minZ: -7, maxZ: -3 }, // right bottom front
      { data: 'RBF2', minX: 9, maxX: 14, minY: -10, maxY: -3, minZ: -6, maxZ: -2 }, // right bottom front
      { data: 'RBB1', minX: 2, maxX: 11, minY: -5, maxY: -4, minZ: 8, maxZ: 12 }, // right bottom back
      { data: 'RBB2', minX: 1, maxX: 4, minY: -14, maxY: -9, minZ: 3, maxZ: 5 }, // right bottom back
      { data: 'RTF1', minX: 2, maxX: 6, minY: 4, maxY: 6, minZ: -7, maxZ: -3 }, // right top front
      { data: 'RTF2', minX: 9, maxX: 14, minY: 6, maxY: 7, minZ: -6, maxZ: -1 }, // right top front
      { data: 'RTB1', minX: 2, maxX: 7, minY: 3, maxY: 5, minZ: 2, maxZ: 7 }, // right top back
      { data: 'RTB2', minX: 12, maxX: 15, minY: 2, maxY: 19, minZ: 3, maxZ: 4 }, // right top back

      { data: 'BottomFront', minX: -10, maxX: 14, minY: -6, maxY: -2, minZ: -7, maxZ: -1 }, // bottom front | stretch X
      { data: 'BottomBack', minX: -2, maxX: 5, minY: -12, maxY: -10, minZ: 10, maxZ: 12 }, // bottom back  | stretch X
      { data: 'TopFront', minX: -5, maxX: 5, minY: 4, maxY: 12, minZ: -4, maxZ: -2 }, // top front    | stretch X
      { data: 'TopBack', minX: -7, maxX: 2, minY: 3, maxY: 8, minZ: 6, maxZ: 9 }, // top back     | stretch X

      { data: 'LeftFront', minX: -10, maxX: -2, minY: -6, maxY: 12, minZ: -7, maxZ: -1 }, // left front   | stretch Y
      { data: 'LeftBack', minX: -2, maxX: -1, minY: -14, maxY: 19, minZ: 7, maxZ: 11 }, // left back    | stretch Y
      { data: 'RightFront', minX: 3, maxX: 4, minY: -1, maxY: 3, minZ: -11, maxZ: -10 }, // right front  | stretch Y
      { data: 'RightBack', minX: 12, maxX: 14, minY: -10, maxY: 13, minZ: 3, maxZ: 16 }, // right back   | stretch Y

      { data: 'LeftBottom', minX: -10, maxX: -1, minY: -6, maxY: -2, minZ: -7, maxZ: 5 }, // left bottom  | stretch Z
      { data: 'LeftTop', minX: -5, maxX: -3, minY: 5, maxY: 12, minZ: -1, maxZ: 1 }, // left top     | stretch Z
      { data: 'RightBottom', minX: 1, maxX: 14, minY: -10, maxY: -3, minZ: -6, maxZ: 12 }, // right bottom | stretch Z
      { data: 'RightTop', minX: 2, maxX: 3, minY: 9, maxY: 12, minZ: -11, maxZ: 8 }, // right top    | stretch Z

      { data: 'Center', minX: -1, maxX: 1, minY: -1, maxY: 1, minZ: -1, maxZ: 1 }, // center
      { data: 'All', minX: -21, maxX: 21, minY: -21, maxY: 21, minZ: -21, maxZ: 21 }, // all

      { data: 'Outside1', minX: 25, maxX: 30, minY: 1, maxY: 3, minZ: 4, maxZ: 6 }, // outside
      { data: 'Outside2', minX: 1, maxX: 2, minY: 42, maxY: 45, minZ: 4, maxZ: 6 }, // outside
      { data: 'Outside3', minX: 5, maxX: 10, minY: -5, maxY: 3, minZ: -26, maxZ: -22 }, // outside
    ];

    // verify test data
    for (const entry of testData) {
      expect(entry.minX).toBeLessThanOrEqual(entry.maxX);
      expect(entry.minY).toBeLessThanOrEqual(entry.maxY);
      expect(entry.minZ).toBeLessThanOrEqual(entry.maxZ);
    }

    // add test data in random order to BVH
    shuffleArray(testData);
    const dataToNodeMap = new Map<string, number>();
    for (const entry of testData) {
      const node = bvh.add(entry.data, entry.minX, entry.minY, entry.minZ, entry.maxX, entry.maxY, entry.maxZ);
      expect(dataToNodeMap.has(entry.data)).toBeFalsy();
      expect(bvh.size).toBe(dataToNodeMap.size + 1);
      dataToNodeMap.set(entry.data, node);
    }

    // left bottom front quadrant
    const leftBottomFrontExpected = ['All', 'BottomFront', 'Center', 'LBF1', 'LBF2', 'LeftBottom', 'LeftFront'];
    const leftBottomFrontResults: string[] = [];
    bvh.query(-20, -20, -20, 0, 0, 0, (data) => leftBottomFrontResults.push(data));
    expect(leftBottomFrontResults.sort()).toEqual(leftBottomFrontExpected.sort());

    // left bottom back quadrant
    const leftBottomBackExpected = ['All', 'BottomBack', 'Center', 'LBB1', 'LBB2', 'LeftBottom', 'LeftBack'];
    const leftBottomBackResults: string[] = [];
    bvh.query(-20, -20, 0, 0, 0, 20, (data) => leftBottomBackResults.push(data));
    expect(leftBottomBackResults.sort()).toEqual(leftBottomBackExpected.sort());

    // left top front quadrant
    const leftTopFrontExpected = ['All', 'Center', 'LeftFront', 'LeftTop', 'LTF1', 'LTF2', 'TopFront'];
    const leftTopFrontResults: string[] = [];
    bvh.query(-20, 0, -20, 0, 20, 0, (data) => leftTopFrontResults.push(data));
    expect(leftTopFrontResults.sort()).toEqual(leftTopFrontExpected.sort());

    // left top back quadrant
    const leftTopBackExpected = ['All', 'Center', 'LeftBack', 'LeftTop', 'LTB1', 'LTB2', 'TopBack'];
    const leftTopBackResults: string[] = [];
    bvh.query(-20, 0, 0, 0, 20, 20, (data) => leftTopBackResults.push(data));
    expect(leftTopBackResults.sort()).toEqual(leftTopBackExpected.sort());

    // right bottom front quadrant
    const rightBottomFrontExpected = ['All', 'BottomFront', 'Center', 'RBF1', 'RBF2', 'RightBottom', 'RightFront'];
    const rightBottomFrontResults: string[] = [];
    bvh.query(0, -20, -20, 20, 0, 0, (data) => rightBottomFrontResults.push(data));
    expect(rightBottomFrontResults.sort()).toEqual(rightBottomFrontExpected.sort());

    // right bottom back quadrant
    const rightBottomBackExpected = ['All', 'BottomBack', 'Center', 'RBB1', 'RBB2', 'RightBottom', 'RightBack'];
    const rightBottomBackResults: string[] = [];
    bvh.query(0, -20, 0, 20, 0, 20, (data) => rightBottomBackResults.push(data));
    expect(rightBottomBackResults.sort()).toEqual(rightBottomBackExpected.sort());

    // right top front quadrant
    const rightTopFrontExpected = ['All', 'Center', 'RightFront', 'RightTop', 'RTF1', 'RTF2', 'TopFront'];
    const rightTopFrontResults: string[] = [];
    bvh.query(0, 0, -20, 20, 20, 0, (data) => rightTopFrontResults.push(data));
    expect(rightTopFrontResults.sort()).toEqual(rightTopFrontExpected.sort());

    // right top back quadrant
    const rightTopBackExpected = ['All', 'Center', 'RightBack', 'RightTop', 'RTB1', 'RTB2', 'TopBack'];
    const rightTopBackResults: string[] = [];
    bvh.query(0, 0, 0, 20, 20, 20, (data) => rightTopBackResults.push(data));
    expect(rightTopBackResults.sort()).toEqual(rightTopBackExpected.sort());

    // bottom front | stretch X
    const bottomFrontExpected = [
      'All',
      'BottomFront',
      'Center',
      'LBF1',
      'LBF2',
      'RBF1',
      'RBF2',
      'LeftBottom',
      'LeftFront',
      'RightBottom',
      'RightFront',
    ];
    const bottomFrontResults: string[] = [];
    bvh.query(-20, -20, -20, 20, 0, 0, (data) => bottomFrontResults.push(data));
    expect(bottomFrontResults.sort()).toEqual(bottomFrontExpected.sort());

    // bottom back  | stretch X
    const bottomBackExpected = [
      'All',
      'BottomBack',
      'Center',
      'LBB1',
      'LBB2',
      'RBB1',
      'RBB2',
      'LeftBottom',
      'LeftBack',
      'RightBack',
      'RightBottom',
    ];
    const bottomBackResults: string[] = [];
    bvh.query(-20, -20, 0, 20, 0, 20, (data) => bottomBackResults.push(data));
    expect(bottomBackResults.sort()).toEqual(bottomBackExpected.sort());

    // top front    | stretch X
    const topFrontExpected = [
      'All',
      'Center',
      'LTF1',
      'LTF2',
      'RTF1',
      'RTF2',
      'LeftFront',
      'LeftTop',
      'RightFront',
      'RightTop',
      'TopFront',
    ];
    const topFrontResults: string[] = [];
    bvh.query(-20, 0, -20, 20, 20, 0, (data) => topFrontResults.push(data));
    expect(topFrontResults.sort()).toEqual(topFrontExpected.sort());

    // top back     | stretch X
    const topBackExpected = [
      'All',
      'Center',
      'LTB1',
      'LTB2',
      'RTB1',
      'RTB2',
      'LeftBack',
      'LeftTop',
      'RightBack',
      'RightTop',
      'TopBack',
    ];
    const topBackResults: string[] = [];
    bvh.query(-20, 0, 0, 20, 20, 20, (data) => topBackResults.push(data));
    expect(topBackResults.sort()).toEqual(topBackExpected.sort());

    // left front   | stretch Y
    const leftFrontExpected = [
      'All',
      'BottomFront',
      'Center',
      'LBF1',
      'LBF2',
      'LTF1',
      'LTF2',
      'LeftBottom',
      'LeftFront',
      'LeftTop',
      'TopFront',
    ];
    const leftFrontResults: string[] = [];
    bvh.query(-20, -20, -20, 0, 20, 0, (data) => leftFrontResults.push(data));
    expect(leftFrontResults.sort()).toEqual(leftFrontExpected.sort());

    // left back    | stretch Y
    const leftBackExpected = [
      'All',
      'BottomBack',
      'Center',
      'LBB1',
      'LBB2',
      'LTB1',
      'LTB2',
      'LeftBottom',
      'LeftBack',
      'LeftTop',
      'TopBack',
    ];
    const leftBackResults: string[] = [];
    bvh.query(-20, -20, 0, 0, 20, 20, (data) => leftBackResults.push(data));
    expect(leftBackResults.sort()).toEqual(leftBackExpected.sort());

    // right front  | stretch Y
    const rightFrontExpected = [
      'All',
      'BottomFront',
      'Center',
      'RBF1',
      'RBF2',
      'RTF1',
      'RTF2',
      'RightBottom',
      'RightFront',
      'RightTop',
      'TopFront',
    ];
    const rightFrontResults: string[] = [];
    bvh.query(0, -20, -20, 20, 20, 0, (data) => rightFrontResults.push(data));
    expect(rightFrontResults.sort()).toEqual(rightFrontExpected.sort());

    // right back   | stretch Y
    const rightBackExpected = [
      'All',
      'BottomBack',
      'Center',
      'RBB1',
      'RBB2',
      'RTB1',
      'RTB2',
      'RightBack',
      'RightBottom',
      'RightTop',
      'TopBack',
    ];
    const rightBackResults: string[] = [];
    bvh.query(0, -20, 0, 20, 20, 20, (data) => rightBackResults.push(data));
    expect(rightBackResults.sort()).toEqual(rightBackExpected.sort());

    // left bottom  | stretch Z
    const leftBottomExpected = [
      'All',
      'BottomFront',
      'BottomBack',
      'Center',
      'LBF1',
      'LBF2',
      'LBB1',
      'LBB2',
      'LeftBack',
      'LeftBottom',
      'LeftFront',
    ];
    const leftBottomResults: string[] = [];
    bvh.query(-20, -20, -20, 0, 0, 20, (data) => leftBottomResults.push(data));
    expect(leftBottomResults.sort()).toEqual(leftBottomExpected.sort());

    // left top     | stretch Z
    const leftTopExpected = [
      'All',
      'Center',
      'LTF1',
      'LTF2',
      'LTB1',
      'LTB2',
      'LeftBack',
      'LeftFront',
      'LeftTop',
      'TopBack',
      'TopFront',
    ];
    const leftTopResults: string[] = [];
    bvh.query(-20, 0, -20, 0, 20, 20, (data) => leftTopResults.push(data));
    expect(leftTopResults.sort()).toEqual(leftTopExpected.sort());

    // right bottom | stretch Z
    const rightBottomExpected = [
      'All',
      'BottomFront',
      'BottomBack',
      'Center',
      'RBF1',
      'RBF2',
      'RBB1',
      'RBB2',
      'RightBack',
      'RightBottom',
      'RightFront',
    ];
    const rightBottomResults: string[] = [];
    bvh.query(0, -20, -20, 20, 0, 20, (data) => rightBottomResults.push(data));
    expect(rightBottomResults.sort()).toEqual(rightBottomExpected.sort());

    // right top    | stretch Z
    const rightTopExpected = [
      'All',
      'Center',
      'RTF1',
      'RTF2',
      'RTB1',
      'RTB2',
      'RightBack',
      'RightFront',
      'RightTop',
      'TopBack',
      'TopFront',
    ];
    const rightTopResults: string[] = [];
    bvh.query(0, 0, -20, 20, 20, 20, (data) => rightTopResults.push(data));
    expect(rightTopResults.sort()).toEqual(rightTopExpected.sort());

    // all
    const allExpected = [
      'All',
      'BottomFront',
      'BottomBack',
      'Center',
      'LeftBottom',
      'LeftFront',
      'LeftTop',
      'LeftBack',
      'RightBottom',
      'RightFront',
      'RightTop',
      'RightBack',
      'TopFront',
      'TopBack',
      'LBF1',
      'LBF2',
      'LBB1',
      'LBB2',
      'LTF1',
      'LTF2',
      'LTB1',
      'LTB2',
      'RBF1',
      'RBF2',
      'RBB1',
      'RBB2',
      'RTF1',
      'RTF2',
      'RTB1',
      'RTB2',
    ];
    const allResults: string[] = [];
    bvh.query(-20, -20, -20, 20, 20, 20, (data) => allResults.push(data));
    expect(allResults.sort()).toEqual(allExpected.sort());

    // move some nodes and verify queries still work
    bvh.update(dataToNodeMap.get('LBF1')!, -15, 3, -3, -11, 7, -1); // LBF1 -> LTF (left top front)
    bvh.update(dataToNodeMap.get('LBF2')!, 4, -13, 6, 9, -8, 15); // LBF2 -> RBB (right bottom back)
    bvh.update(dataToNodeMap.get('BottomFront')!, -9, -14, 3, 17, -6, 10); // BottomFront -> BottomBack
    bvh.update(dataToNodeMap.get('LeftFront')!, 6, -18, -5, 9, 16, -1); // LeftFront -> RightFront
    bvh.update(dataToNodeMap.get('LeftBottom')!, 9, -5, -19, 11, -2, 12); // LeftBottom -> RightBottom

    // left bottom front quadrant
    const leftBottomFront2Expected = ['All', 'Center'];
    const leftBottomFront2Results: string[] = [];
    bvh.query(-20, -20, -20, 0, 0, 0, (data) => leftBottomFront2Results.push(data));
    expect(leftBottomFront2Results.sort()).toEqual(leftBottomFront2Expected.sort());

    // left bottom back quadrant
    const leftBottomBack2Expected = ['All', 'BottomBack', 'BottomFront', 'Center', 'LBB1', 'LBB2', 'LeftBack'];
    const leftBottomBack2Results: string[] = [];
    bvh.query(-20, -20, 0, 0, 0, 20, (data) => leftBottomBack2Results.push(data));
    expect(leftBottomBack2Results.sort()).toEqual(leftBottomBack2Expected.sort());

    // left top front quadrant
    const leftTopFront2Expected = ['All', 'Center', 'LBF1', 'LeftTop', 'LTF1', 'LTF2', 'TopFront'];
    const leftTopFront2Results: string[] = [];
    bvh.query(-20, 0, -20, 0, 20, 0, (data) => leftTopFront2Results.push(data));
    expect(leftTopFront2Results.sort()).toEqual(leftTopFront2Expected.sort());

    // left top back quadrant
    const leftTopBack2Expected = ['All', 'Center', 'LeftBack', 'LeftTop', 'LTB1', 'LTB2', 'TopBack'];
    const leftTopBack2Results: string[] = [];
    bvh.query(-20, 0, 0, 0, 20, 20, (data) => leftTopBack2Results.push(data));
    expect(leftTopBack2Results.sort()).toEqual(leftTopBack2Expected.sort());

    // right bottom front quadrant
    const rightBottomFront2Expected = [
      'All',
      'Center',
      'LeftBottom',
      'LeftFront',
      'RBF1',
      'RBF2',
      'RightBottom',
      'RightFront',
    ];
    const rightBottomFront2Results: string[] = [];
    bvh.query(0, -20, -20, 20, 0, 0, (data) => rightBottomFront2Results.push(data));
    expect(rightBottomFront2Results.sort()).toEqual(rightBottomFront2Expected.sort());

    // right bottom back quadrant
    const rightBottomBack2Expected = [
      'All',
      'BottomBack',
      'BottomFront',
      'Center',
      'LBF2',
      'LeftBottom',
      'RBB1',
      'RBB2',
      'RightBottom',
      'RightBack',
    ];
    const rightBottomBack2Results: string[] = [];
    bvh.query(0, -20, 0, 20, 0, 20, (data) => rightBottomBack2Results.push(data));
    expect(rightBottomBack2Results.sort()).toEqual(rightBottomBack2Expected.sort());

    // right top front quadrant
    const rightTopFront2Expected = ['All', 'Center', 'LeftFront', 'RightFront', 'RightTop', 'RTF1', 'RTF2', 'TopFront'];
    const rightTopFront2Results: string[] = [];
    bvh.query(0, 0, -20, 20, 20, 0, (data) => rightTopFront2Results.push(data));
    expect(rightTopFront2Results.sort()).toEqual(rightTopFront2Expected.sort());

    // right top back quadrant
    const rightTopBack2Expected = ['All', 'Center', 'RightBack', 'RightTop', 'RTB1', 'RTB2', 'TopBack'];
    const rightTopBack2Results: string[] = [];
    bvh.query(0, 0, 0, 20, 20, 20, (data) => rightTopBack2Results.push(data));
    expect(rightTopBack2Results.sort()).toEqual(rightTopBack2Expected.sort());
  });
});
