import { vfxAddHit, vfxDraw, type SessionWithVfx } from '../src/vfx';

type DrawCall = {
  text: string;
  fillStyle: string;
  strokeStyle: string;
};

function createCtxRecorder(): { ctx: CanvasRenderingContext2D; drawCalls: DrawCall[] } {
  const drawCalls: DrawCall[] = [];

  const state: { fillStyle: string; strokeStyle: string } = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
  };

  const ctxLike: Partial<CanvasRenderingContext2D> = {
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    arc: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    strokeText: jest.fn(),
    fillText: jest.fn((text: string) => {
      drawCalls.push({ text, fillStyle: state.fillStyle, strokeStyle: state.strokeStyle });
    }),
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {
      state.fillStyle = String(value);
    },
    get fillStyle() {
      return state.fillStyle;
    },
    set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
      state.strokeStyle = String(value);
    },
    get strokeStyle() {
      return state.strokeStyle;
    },
  };

  return { ctx: ctxLike as CanvasRenderingContext2D, drawCalls };
}

function createSessionWithHitFlags(flags: Record<string, unknown>): SessionWithVfx {
  const game = {
    modeKey: 'test',
    grid: { cols: 7, rows: 3, tile: 100, ox: 0, oy: 0, w: 700, h: 300, pad: 0, dpr: 1, pixelW: 700, pixelH: 300, pixelArea: 210000 },
    tokens: [{ iid: 1, id: 'a', side: 'ally', cx: 1, cy: 1, hp: 100, hpMax: 100, alive: true }],
    cost: 0,
    costCap: 30,
    summoned: 0,
    summonLimit: 5,
    turn: null,
    over: false,
    result: null,
    battle: null,
    ai: null,
    selectedId: null,
    selectedSkill: null,
    cfg: null,
    fx: null,
    rngState: null,
    vfx: [],
  } as unknown as SessionWithVfx;

  vfxAddHit(game, game.tokens[0], flags);
  return game;
}

describe('vfx damage status text rendering', () => {
  test('only critical keeps critical text style', () => {
    const game = createSessionWithHitFlags({ isCrit: true });
    const { ctx, drawCalls } = createCtxRecorder();

    vfxDraw(ctx, game, null);

    expect(drawCalls).toMatchInlineSnapshot(`
      [
        {
          "fillStyle": "#ffb8b8",
          "strokeStyle": "#4a0f0f",
          "text": "CRITICAL",
        },
      ]
    `);
  });

  test('only advantage keeps advantage text style', () => {
    const game = createSessionWithHitFlags({ advantage: true });
    const { ctx, drawCalls } = createCtxRecorder();

    vfxDraw(ctx, game, null);

    expect(drawCalls).toMatchInlineSnapshot(`
      [
        {
          "fillStyle": "#9befff",
          "strokeStyle": "#0f2e40",
          "text": "ADVANTAGE",
        },
      ]
    `);
  });

  test('combined critical + advantage shows required combined text in gold', () => {
    const game = createSessionWithHitFlags({ isCrit: true, advantage: true });
    const { ctx, drawCalls } = createCtxRecorder();

    vfxDraw(ctx, game, null);

    expect(drawCalls).toMatchInlineSnapshot(`
      [
        {
          "fillStyle": "#ffd447",
          "strokeStyle": "#4b2f00",
          "text": "CRITICAL · ADVANTAGE",
        },
      ]
    `);
  });
});
