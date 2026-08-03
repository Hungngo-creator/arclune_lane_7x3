import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  canTrigger, createTriggerLedger, markTriggered, normalizeDamageType,
  resolveDamagePacket, resolveDefenseMultiplier, resolveLegacyDamage,
  resolveSourceAttribution,
} from '../src/combat/kernel/index.ts';

const source = { immediateSourceIid: 'source', controllerIid: null, creditTrueSelfId: 'source', ownerIid: null, environmentSourceId: null };
const fixturePath = path.join(process.cwd(), 'test/fixtures/combat-kernel-damage-golden.json');
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as any[];

describe('combat kernel packet goldens', () => {
  test.each(fixtures)('$name', (fixture) => {
    fixture.packets.forEach((entry: any, index: number) => {
      const packet = {
        packetId: `packet-${index}`, actionId: 'action', chainId: 'chain', source, targetIid: 'target',
        damageType: entry.damageType, declaredDamage: entry.declaredDamage, tags: [], isDot: false,
        isReflect: entry.damageType === 'reflected', isFollowup: false, isCounter: false,
        reactionDepth: 0, pierceShield: entry.pierceShield ?? false,
      };
      const result = resolveDamagePacket(packet, {
        attacker: { iid: 'source', currentHp: 100, maxHp: 100, arm: 0, res: 0 },
        defender: { iid: 'target', maxHp: 1000, ...fixture.defender },
        defensePenetration: { flat: 0, percent: fixture.penetration }, defenseModifiers: { flat: 0, percent: 0 },
        outgoingModifiers: fixture.outgoingModifiers ?? [], incomingModifiers: fixture.incomingModifiers ?? [],
        genericDamageReduction: fixture.genericDamageReduction ?? 0,
        reflectDamageReduction: fixture.reflectDamageReduction ?? 0, shield: { shieldBefore: fixture.shield },
      });
      expect(result).toMatchObject(fixture.expected[index]);
    });
  });

  test('arcane is read only as the will alias', () => expect(normalizeDamageType('arcane')).toBe('will'));
  test('negative defense is not clamped', () => expect(resolveDefenseMultiplier(-100)).toBe(1.5));
  test('source attribution follows summon controller and true self', () => {
    expect(resolveSourceAttribution({ immediateSource: { iid: 3 }, controller: { iid: 2 }, trueSelf: { id: 'hero' }, owner: { iid: 2 } }))
      .toEqual({ immediateSourceIid: 3, sourceIid: 3, controllerIid: 2, creditTrueSelfId: 'hero', ownerIid: 2, environmentSourceId: null, originActionId: null, sourceSide: null });
  });
});

describe('trigger ledger', () => {
  const first = { actionId: 'a', procKey: 'p', sourceIid: 's', targetIid: 't' };
  test('deduplicates the same tuple but permits a distinct proc key', () => {
    const ledger = createTriggerLedger();
    expect(markTriggered(ledger, first).allowed).toBe(true);
    expect(canTrigger(ledger, first)).toEqual({ allowed: false, reason: 'already-triggered' });
    expect(canTrigger(ledger, { ...first, procKey: 'other' }).allowed).toBe(true);
  });
  test('depth twelve is allowed and depth thirteen gives a clear reason', () => {
    expect(canTrigger(createTriggerLedger(12), first)).toEqual({ allowed: true, reason: 'allowed' });
    expect(canTrigger(createTriggerLedger(13), first)).toEqual({ allowed: false, reason: 'max-reaction-depth-exceeded' });
  });
});

describe('legacy adapter characterization', () => {
  const unit = (iid: string, stats: any) => ({ id: iid, iid, alive: true, hp: 1000, hpMax: 1000, arm: 0, res: 0, ...stats }) as any;
  test('matches legacy formula for an equivalent single-multiplier case', () => {
    const result = resolveLegacyDamage({ attacker: unit('a', {}), defender: unit('d', { arm: 100 }), damageType: 'physical', declaredDamage: 100 });
    expect(result.finalRoundedDamage).toBe(50);
  });
});
