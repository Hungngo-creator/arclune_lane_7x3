import { createMonopolyBoardCells } from '../src/screens/monopoly/index.ts';

describe('monopoly board layout', () => {
    it('builds exactly 116 cells with 40 main-track cells, 24 mini-ring cells và 8 ô vi mô', () => {
    const cells = createMonopolyBoardCells();
    expect(cells).toHaveLength(116);
    expect(cells.filter(cell => cell.track === 'main')).toHaveLength(40);
    expect(cells.filter(cell => cell.track === 'mini')).toHaveLength(24);
    expect(cells.filter(cell => cell.track === 'micro')).toHaveLength(8);
  });

  it('does not overlap coordinates between tracks', () => {
    const cells = createMonopolyBoardCells();
    const coordSet = new Set(cells.map(cell => `${cell.row},${cell.col}`));
    expect(coordSet.size).toBe(cells.length);
  });

  it('keeps all cells inside 15x15 board and indexes contiguous', () => {
    const cells = createMonopolyBoardCells();
    cells.forEach((cell, idx) => {
      expect(cell.index).toBe(idx);
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThan(15);
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThan(15);
    });
  });

  it('adds eight protrusion cells at requested paired anchor targets', () => {
    const cells = createMonopolyBoardCells();
    const protrusions = [
      [1, 3],
      [1, 11],
      [3, 13],
      [11, 13],
      [13, 11],
      [13, 3],
      [11, 1],
      [3, 1]
    ];

    protrusions.forEach(([row, col]) => {
      expect(cells.some(cell => cell.row === row && cell.col === col && cell.track !== 'main')).toBe(true);
    });
  });

  it('positions side lanes and top/bottom lanes at requested outer anchors', () => {
    const cells = createMonopolyBoardCells();
    const find = (index: number) => cells[index - 1];

    for (let i = 41; i <= 49; i += 1) {
      expect(find(i).col).toBe(0);
      expect(find(i).row).toBe(i - 38);
      expect(find(i).track).toBe('connector');
    }

    for (let i = 68; i <= 76; i += 1) {
      expect(find(i).col).toBe(14);
      expect(find(i).row).toBe(i - 65);
      expect(find(i).track).toBe('connector');
    }

    for (let i = 50; i <= 58; i += 1) {
      expect(find(i).row).toBe(0);
      expect(find(i).col).toBe(i - 47);
      expect(find(i).track).toBe('lane');
    }

    for (let i = 59; i <= 67; i += 1) {
      expect(find(i).row).toBe(14);
      expect(find(i).col).toBe(i - 56);
      expect(find(i).track).toBe('lane');
    }

    expect(find(79)).toMatchObject({ row: 1, col: 3 });
    expect(find(80)).toMatchObject({ row: 1, col: 11 });
    expect(find(83)).toMatchObject({ row: 13, col: 3 });
    expect(find(84)).toMatchObject({ row: 13, col: 11 });
  });

  it('creates an inner mini square using intersections of (3,39), (9,13), (19,23), (29,33)', () => {
    const cells = createMonopolyBoardCells();
    const main = cells.filter(cell => cell.track === 'main');
    const mini = cells.filter(cell => cell.track === 'mini');

    const topLeft = { row: main[39 - 1].row, col: main[3 - 1].col };
    const topRight = { row: main[13 - 1].row, col: main[9 - 1].col };
    const bottomRight = { row: main[19 - 1].row, col: main[23 - 1].col };
    const bottomLeft = { row: main[33 - 1].row, col: main[29 - 1].col };

    expect(topLeft).toEqual({ row: 4, col: 4 });
    expect(topRight).toEqual({ row: 4, col: 10 });
    expect(bottomRight).toEqual({ row: 10, col: 10 });
    expect(bottomLeft).toEqual({ row: 10, col: 4 });

    const miniSet = new Set(mini.map(cell => `${cell.row},${cell.col}`));
    expect(miniSet.size).toBe(24);
    expect(mini[0].index).toBe(84);
    expect(mini.at(-1)?.index).toBe(107);

    expect(miniSet.has(`${topLeft.row},${topLeft.col}`)).toBe(true);
    expect(miniSet.has(`${topRight.row},${topRight.col}`)).toBe(true);
    expect(miniSet.has(`${bottomRight.row},${bottomRight.col}`)).toBe(true);
    expect(miniSet.has(`${bottomLeft.row},${bottomLeft.col}`)).toBe(true);
  });

  it('creates a second micro square (8 cells) from intersections of (99,95), (101,105), (107,87), (89,93)', () => {
    const cells = createMonopolyBoardCells();
    const micro = cells.filter(cell => cell.track === 'micro');
    const mini = cells.filter(cell => cell.track === 'mini');

    const byIndex = (oneBased: number) => cells[oneBased - 1];
    const pickIntersection = (first: number, second: number) => {
      const a = byIndex(first);
      const b = byIndex(second);
      const c1 = { row: a.row, col: b.col };
      const c2 = { row: b.row, col: a.col };
      const miniRows = mini.map(cell => cell.row);
      const miniCols = mini.map(cell => cell.col);
      const minRow = Math.min(...miniRows);
      const maxRow = Math.max(...miniRows);
      const minCol = Math.min(...miniCols);
      const maxCol = Math.max(...miniCols);
      return [c1, c2].find(point => (
        point.row > minRow &&
        point.row < maxRow &&
        point.col > minCol &&
        point.col < maxCol
      ));
    };

    const corners = [
      pickIntersection(99, 95),
      pickIntersection(101, 105),
      pickIntersection(107, 87),
      pickIntersection(89, 93)
    ];

    expect(corners).toEqual([
      { row: 8, col: 8 },
      { row: 8, col: 6 },
      { row: 6, col: 6 },
      { row: 6, col: 8 }
    ]);

    const microSet = new Set(micro.map(cell => `${cell.row},${cell.col}`));
    expect(microSet.size).toBe(8);
    expect(micro[0].index).toBe(108);
    expect(micro.at(-1)?.index).toBe(115);

    expect(microSet.has('6,6')).toBe(true);
    expect(microSet.has('6,8')).toBe(true);
    expect(microSet.has('8,8')).toBe(true);
    expect(microSet.has('8,6')).toBe(true);

    const touchesMini = micro.some(microCell => mini.some(miniCell => {
      const rowDistance = Math.abs(microCell.row - miniCell.row);
      const colDistance = Math.abs(microCell.col - miniCell.col);
      return rowDistance + colDistance === 1;
    }));
    expect(touchesMini).toBe(false);
  });
});
