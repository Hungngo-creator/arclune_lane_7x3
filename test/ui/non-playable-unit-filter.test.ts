import { cloneRoster, isCollectionPlayableUnit } from '../../src/screens/collection/helpers.ts';
import { getSummonableFeaturedUnits, isGachaSummonableFeaturedUnit } from '../../src/screens/ui-gacha/logic/gacha.ts';

describe('collection/gacha filters for npc-pve units', () => {
  test('collection helper excludes npc/pve tags', () => {
    expect(isCollectionPlayableUnit({ id: 'x', tags: ['npc'] } as any)).toBe(false);
    expect(isCollectionPlayableUnit({ id: 'x', tags: ['pve'] } as any)).toBe(false);
    expect(isCollectionPlayableUnit({ id: 'x', tags: ['warrior'] } as any)).toBe(true);

    const roster = cloneRoster([
      { id: 'ok_1', tags: ['warrior'] },
      { id: 'bad_1', tags: ['npc'] },
      { id: 'bad_2', tags: ['pve'] },
    ] as any);
    expect(roster.map((entry) => entry.id)).toEqual(['ok_1']);
  });

  test('gacha helper excludes npc/pve featured entries', () => {
    expect(isGachaSummonableFeaturedUnit({ id: 'f1', name: 'F1', rarity: 'SSR', isNpc: true })).toBe(false);
    expect(isGachaSummonableFeaturedUnit({ id: 'f2', name: 'F2', rarity: 'SSR', tags: ['pve'] })).toBe(false);

    const filtered = getSummonableFeaturedUnits({
      id: 'banner-test',
      label: 'Banner',
      type: 'Permanent',
      rates: { SSR: 1 },
      pity: { srFloor: 10 },
      cost: { unit: 'HNT', x1: 1, x10: 10 },
      featured: [
        { id: 'ok', name: 'OK', rarity: 'SSR' },
        { id: 'bad', name: 'BAD', rarity: 'SSR', tags: ['npc'] },
      ],
    });

    expect(filtered.map((entry) => entry.id)).toEqual(['ok']);
  });
});
