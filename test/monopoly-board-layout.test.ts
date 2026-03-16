import { createMonopolyBoardCells } from '../src/screens/monopoly/index.ts';

describe('monopoly board layout', () => {
  it('builds exactly 80 cells with 40 main-track cells', () => {
    const cells = createMonopolyBoardCells();
    expect(cells).toHaveLength(80);
    expect(cells.filter(cell => cell.track === 'main')).toHaveLength(40);
  });

  it('keeps all cells inside 11x11 board and indexes contiguous', () => {
    const cells = createMonopolyBoardCells();
    cells.forEach((cell, idx) => {
      expect(cell.index).toBe(idx);
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThan(11);
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThan(11);
    });
  });
});
