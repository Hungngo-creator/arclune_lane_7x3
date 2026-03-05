import { describe, expect, it } from '@jest/globals';

import skillsConfig from '../src/data/skills.config.ts';
import { getTagDefinition, normalizeTagId } from '../src/data/tags.ts';
import { UNITS } from '../src/units.ts';

type SkillConfigEntry = (typeof skillsConfig)[number];

type SkillSectionLike = {
  tags?: ReadonlyArray<string>;
};

function hasMissingDesignSourceNote(entry: SkillConfigEntry): boolean {
  if (!Array.isArray(entry.notes)) return false;
  return entry.notes.some((note) => typeof note === 'string' && note.toLowerCase().includes('missing design source'));
}

function collectSectionTags(entry: SkillConfigEntry): string[] {
  const tags: string[] = [];
  const pushTags = (section: SkillSectionLike | null | undefined): void => {
    if (!section || !Array.isArray(section.tags)) return;
    tags.push(...section.tags.filter((tag): tag is string => typeof tag === 'string'));
  };

  pushTags(entry.basic as SkillSectionLike | null | undefined);
  pushTags(entry.ult as SkillSectionLike | null | undefined);
  pushTags(entry.talent as SkillSectionLike | null | undefined);
  if (Array.isArray(entry.skills)) {
    entry.skills.forEach((skill) => pushTags(skill as SkillSectionLike));
  }

  return tags;
}

describe('skills config coverage by unitId', () => {
  const allUnitIds = UNITS.map((unit) => unit.id);
  const configMap = new Map(skillsConfig.map((entry) => [entry.unitId, entry]));

  it('covers every unitId declared in src/units.ts', () => {
    expect(new Set(configMap.keys())).toEqual(new Set(allUnitIds));
  });

  it('enforces placeholder control and required design payload fields', () => {
    const placeholderUnitIds: string[] = [];

    for (const unitId of allUnitIds) {
      const entry = configMap.get(unitId);
      expect(entry).toBeDefined();
      if (!entry) continue;

      expect(Array.isArray(entry.notes)).toBe(true);
      expect((entry.notes ?? []).length).toBeGreaterThan(0);

      if (hasMissingDesignSourceNote(entry)) {
        placeholderUnitIds.push(unitId);
        expect(entry.designStatus).toBe('placeholder');
        expect(entry.placeholderControl).toMatchObject({
          allowSyntheticFill: false,
          requiredSourceFiles: ['ý tưởng nhân vật v1.txt', 'ý tưởng nhân vật v2.3.txt', 'ý tưởng nhân vật 3.2.txt'],
        });
        expect(entry.basic ?? null).toBeNull();
        expect(entry.ult ?? null).toBeNull();
        expect(entry.talent ?? null).toBeNull();
        expect(entry.skills ?? []).toEqual([]);
        continue;
      }

      expect(typeof entry.importBatch).toBe('string');
      expect(entry.importBatch).toContain('ideas-matrix-batch-');
      expect(entry.sourceRefs).toEqual(['ý tưởng nhân vật v1.txt', 'ý tưởng nhân vật v2.3.txt', 'ý tưởng nhân vật 3.2.txt']);

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

    expect(placeholderUnitIds).toEqual(['thien_luu']);
  });

  it('uses normalized canonical tags only', () => {
    for (const entry of skillsConfig) {
      const sectionTags = collectSectionTags(entry);
      for (const rawTag of sectionTags) {
        const normalizedTag = normalizeTagId(rawTag);
        expect(normalizedTag).toBe(rawTag);
        expect(getTagDefinition(rawTag)).not.toBeNull();
      }
    }
  });
});
