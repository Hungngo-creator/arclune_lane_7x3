import { dealAbilityDamage } from '../src/combat.ts';

import type { SessionState } from '../src/types/combat.ts';
import type { UnitToken } from '../src/types/units.ts';

const mkUnit = (overrides: Partial<UnitToken> = {}): UnitToken => ({
  id: overrides.id ?? 'linhgac',
  side: overrides.side ?? 'ally',
  cx: overrides.cx ?? 0,
  cy: overrides.cy ?? 0,
  alive: overrides.alive ?? true,
  hpMax: overrides.hpMax ?? 1000,
  hp: overrides.hp ?? 1000,
  atk: overrides.atk ?? 200,
  wil: overrides.wil ?? 100,
  arm: overrides.arm ?? 50,
  res: overrides.res ?? 50,
  statuses: overrides.statuses ?? [],
  ...overrides,
});

const mkGame = (tokens: UnitToken[]): SessionState => ({
  modeKey: 'test',
  grid: null,
  tokens,
  cost: 0,
  costCap: 0,
  summoned: 0,
  summonLimit: 0,
  unitsAll: [],
  usedUnitIds: new Set(),
  deck3: [],
  selectedId: null,
  ui: { bar: null },
  turn: null,
  queued: { ally: new Map(), enemy: new Map() },
  actionChain: [],
  events: new EventTarget(),
  battle: {
    over: false,
    winner: null,
    reason: null,
    detail: null,
    finishedAt: 0,
    result: null,
  },
  result: null,
  ai: {
    cost: 0,
    costCap: 0,
    summoned: 0,
    summonLimit: 0,
    unitsAll: [],
    usedUnitIds: new Set(),
    deck: [],
    selectedId: null,
    lastThinkMs: 0,
    lastDecision: null,
  },
  meta: {
    get: () => null,
    classOf: () => null,
    rankOf: () => null,
    kit: () => null,
    isSummoner: () => false,
  },
});

describe('dealAbilityDamage SSI formula extensions', () => {
  test('supports mixed dtype and uses ARM/RES weighted mitigation', () => {
    const attacker = mkUnit({ id: 'leaderA', side: 'ally', atk: 200, wil: 100, arm: 0, res: 0 });
    const target = mkUnit({ id: 'leaderB', side: 'enemy', hp: 1000, hpMax: 1000, arm: 300, res: 0 });
    const game = mkGame([attacker, target]);

    const result = dealAbilityDamage(game, attacker, target, {
      base: 300,
      dtype: 'mixed',
      physicalRatio: 0.5,
      arcaneRatio: 0.5,
      skillMul: 1,
      realmBonus: 0,
    });

    expect(result.dealt).toBe(187);
    expect(target.hp).toBe(813);
  });

  test('splits damage across shared HP group after shield mitigation', () => {
    const attacker = mkUnit({ side: 'ally', id: 'leaderA' });
    const a = mkUnit({ side: 'enemy', id: 'leaderB', hp: 1000, hpMax: 1000, arm: 0, res: 0, sharedHpGroup: 'lotus' });
    const b = mkUnit({ side: 'enemy', id: 'linhgac', hp: 1000, hpMax: 1000, arm: 0, res: 0, sharedHpGroup: 'lotus' });
    const game = mkGame([attacker, a, b]);

    const result = dealAbilityDamage(game, attacker, a, {
      base: 300,
      dtype: 'physical',
      skillMul: 1,
      realmBonus: 0,
    });

    expect(result.dealt).toBe(300);
    expect(a.hp).toBe(850);
    expect(b.hp).toBe(850);
  });

  
  test('realm bonus scales by class profile when not explicitly provided', () => {
    const attacker = mkUnit({ id: 'phe', side: 'ally', atk: 200, wil: 100, realm: 2, subRealm: 5, arm: 0, res: 0 });
    const target = mkUnit({ id: 'leaderB', side: 'enemy', hp: 1000, hpMax: 1000, arm: 0, res: 0 });
    const game = mkGame([attacker, target]);

    const result = dealAbilityDamage(game, attacker, target, {
      base: 300,
      dtype: 'physical',
      skillMul: 1,
    });

    expect(result.dealt).toBe(320);
    expect(target.hp).toBe(680);
  });

  test('shared HP supports weight and cap ratio metadata', () => {
    const attacker = mkUnit({ side: 'ally', id: 'leaderA' });
    const anchor = mkUnit({ side: 'enemy', id: 'leaderB', hp: 1000, hpMax: 1000, arm: 0, res: 0, sharedHpGroup: 'lotus' });
    const heavy = mkUnit({ side: 'enemy', id: 'linhgac', hp: 1000, hpMax: 1000, arm: 0, res: 0, sharedHpGroup: 'lotus', sharedHpWeight: 3 });
    const capped = mkUnit({ side: 'enemy', id: 'phe', hp: 1000, hpMax: 1000, arm: 0, res: 0, sharedHpGroup: 'lotus', sharedHpWeight: 1, sharedHpCapRatio: 0.02 });
    const game = mkGame([attacker, anchor, heavy, capped]);

    const result = dealAbilityDamage(game, attacker, anchor, {
      base: 400,
      dtype: 'physical',
      skillMul: 1,
      realmBonus: 0,
    });

    expect(result.dealt).toBe(340);
    expect(anchor.hp).toBe(920);
    expect(heavy.hp).toBe(760);
    expect(capped.hp).toBe(980);
  });

  test('law resolution: higher rank absolute shield blocks lower rank absolute attack', () => {
    const attacker = mkUnit({ side: 'ally', id: 'linhgac', rank: 'SSR', statuses: [{ id: 'absolute_attack' }] });
    const target = mkUnit({ side: 'enemy', id: 'leaderB', rank: 'Prime', statuses: [{ id: 'absolute_shield' }] });
    const game = mkGame([attacker, target]);

    const result = dealAbilityDamage(game, attacker, target, {
      base: 500,
      dtype: 'physical',
      skillMul: 1,
      realmBonus: 0,
    });

    expect(result.dealt).toBe(0);
    expect(target.hp).toBe(1000);
  });

  test('reflect uses net difference so attacker reflect can offset defender reflect', () => {
    const attacker = mkUnit({
      side: 'ally',
      id: 'leaderA',
      arm: 0,
      res: 0,
      statuses: [{ id: 'reflect', kind: 'buff', tag: 'counter', power: 0.5 } as any],
    });
    const target = mkUnit({
      side: 'enemy',
      id: 'leaderB',
      hp: 1000,
      hpMax: 1000,
      arm: 0,
      res: 0,
      statuses: [{ id: 'reflect', kind: 'buff', tag: 'counter', power: 0.3 } as any],
    });
    const game = mkGame([attacker, target]);

    dealAbilityDamage(game, attacker, target, {
      base: 200,
      dtype: 'physical',
      skillMul: 1,
      realmBonus: 0,
    });

    expect(target.hp).toBe(800);
    expect(attacker.hp).toBe(1000);
  });

  test('100% vs 100% reflect resolves once per side without infinite recursion', () => {
    const attacker = mkUnit({
      side: 'ally',
      id: 'leaderA',
      hp: 1000,
      hpMax: 1000,
      arm: 0,
      res: 0,
      statuses: [{ id: 'reflect', kind: 'buff', tag: 'counter', power: 1 } as any],
    });
    const target = mkUnit({
      side: 'enemy',
      id: 'leaderB',
      hp: 1000,
      hpMax: 1000,
      arm: 0,
      res: 0,
      statuses: [{ id: 'reflect', kind: 'buff', tag: 'counter', power: 1 } as any],
    });
    const game = mkGame([attacker, target]);

    dealAbilityDamage(game, attacker, target, {
      base: 200,
      dtype: 'physical',
      skillMul: 1,
      realmBonus: 0,
    });

    expect(attacker.hp).toBe(800);
    expect(target.hp).toBe(600);
  });
});
