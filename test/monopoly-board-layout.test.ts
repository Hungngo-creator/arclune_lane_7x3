import { createMonopolyBoardCells } from '../src/screens/monopoly/index.ts';

describe('monopoly board layout', () => {
  it('builds exactly 84 cells with 40 main-track cells', () => {
    const cells = createMonopolyBoardCells();
    expect(cells).toHaveLength(84);
    expect(cells.filter(cell => cell.track === 'main')).toHaveLength(40);
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
});
