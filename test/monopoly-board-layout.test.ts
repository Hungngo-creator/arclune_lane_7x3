import { createMonopolyBoardCells } from '../src/screens/monopoly/index.ts';

describe('monopoly board layout', () => {
  it('builds exactly 80 cells with 40 main-track cells', () => {
    const cells = createMonopolyBoardCells();
    expect(cells).toHaveLength(80);
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

  it('adds four protrusion cells outside the main ring midpoint targets', () => {
    const cells = createMonopolyBoardCells();
    const protrusions = [
      [0, 6],
      [6, 12],
      [12, 6],
      [6, 0]
    ];

    protrusions.forEach(([row, col]) => {
      expect(cells.some(cell => cell.row === row && cell.col === col && cell.track !== 'main')).toBe(true);
    });
  });
});
