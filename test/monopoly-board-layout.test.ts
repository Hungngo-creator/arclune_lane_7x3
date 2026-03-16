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

  it('keeps all cells inside 13x13 board and indexes contiguous', () => {
    const cells = createMonopolyBoardCells();
    cells.forEach((cell, idx) => {
      expect(cell.index).toBe(idx);
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThan(13);
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThan(13);
    });
  });

  it('adds eight protrusion cells at requested paired anchor targets', () => {
    const cells = createMonopolyBoardCells();
    const protrusions = [
      [0, 2],
      [0, 10],
      [2, 12],
      [10, 12],
      [12, 10],
      [12, 2],
      [10, 0],
      [2, 0]
    ];

    protrusions.forEach(([row, col]) => {
      expect(cells.some(cell => cell.row === row && cell.col === col && cell.track !== 'main')).toBe(true);
    });
  });
});
