import { ROSTER } from '../src/catalog.ts';

function getCreepEntries() {
  return ROSTER.filter((entry) => /^creep_\d+$/.test(entry.id));
}

describe('pve creep static checklist', () => {
  test('creeps never define ult/rage skill', () => {
    for (const creep of getCreepEntries()) {
      expect(creep.kit?.ult ?? null).toBeNull();
      const skills = Array.isArray((creep.kit as any)?.skills) ? ((creep.kit as any).skills as Array<Record<string, unknown>>) : [];
      for (const skill of skills) {
        const cost = (skill?.cost ?? null) as Record<string, unknown> | null;
        expect(typeof cost?.rage === 'undefined').toBe(true);
        expect(typeof cost?.fury === 'undefined').toBe(true);
      }
    }
  });

  test('creeps always carry npc or pve tag', () => {
    for (const creep of getCreepEntries()) {
      const tags = Array.isArray(creep.tags) ? creep.tags.map((tag) => String(tag).toLowerCase()) : [];
      expect(tags.includes('npc') || tags.includes('pve')).toBe(true);
    }
  });

  test('creep #3 is strongest by onSpawn stat bonus among creep trio', () => {
    const findSpawnBonus = (id: string) => {
      const creep = ROSTER.find((entry) => entry.id === id);
      const stats = (((creep?.kit as any)?.onSpawn ?? null) as Record<string, unknown> | null)?.stats as Record<string, unknown> | undefined;
      return Number(stats?.ATK ?? 0);
    };
    const c1 = findSpawnBonus('creep_1');
    const c2 = findSpawnBonus('creep_2');
    const c3 = findSpawnBonus('creep_3');
    expect(c3).toBeGreaterThan(c2);
    expect(c2).toBeGreaterThan(c1);
  });
});
