import { describe, expect, it } from '@jest/globals';

import skillsConfig from '../src/data/skills.config.ts';
import { UNITS } from '../src/units.ts';

type SkillConfigEntry = (typeof skillsConfig)[number];

function hasMissingDesignSourceNote(entry: SkillConfigEntry): boolean {
  if (!Array.isArray(entry.notes)) return false;
  return entry.notes.some((note) => typeof note === 'string' && note.toLowerCase().includes('missing design source'));
}

describe('skills config coverage by unitId', () => {
  const allUnitIds = UNITS.map((unit) => unit.id);
  const configMap = new Map(skillsConfig.map((entry) => [entry.unitId, entry]));

  it('covers every unitId declared in src/units.ts', () => {
    expect(new Set(configMap.keys())).toEqual(new Set(allUnitIds));
  });

  it('enforces minimum valid skill payload for every unit', () => {
    const missingDesignSourceUnitIds: string[] = [];

    for (const unitId of allUnitIds) {
      const entry = configMap.get(unitId);
      expect(entry).toBeDefined();
      if (!entry) continue;

      expect(Array.isArray(entry.notes)).toBe(true);
      expect((entry.notes ?? []).length).toBeGreaterThan(0);

      if (hasMissingDesignSourceNote(entry)) {
        missingDesignSourceUnitIds.push(unitId);
        continue;
      }

      expect(entry.basic).toBeTruthy();
      expect(entry.ult).toBeTruthy();
      expect(entry.talent).toBeTruthy();
      expect(Array.isArray(entry.skills)).toBe(true);
      expect((entry.skills ?? []).length).toBeGreaterThan(0);

      expect(Array.isArray(entry.basic?.tags)).toBe(true);
      expect((entry.basic?.tags ?? []).length).toBeGreaterThan(0);

      expect(Array.isArray(entry.ult?.tags)).toBe(true);
      expect((entry.ult?.tags ?? []).length).toBeGreaterThan(0);

      for (const skill of entry.skills ?? []) {
        expect(typeof skill.cost?.aether).toBe('number');
      }
    }

    expect(missingDesignSourceUnitIds).toEqual(['thien_luu']);
  });
});
