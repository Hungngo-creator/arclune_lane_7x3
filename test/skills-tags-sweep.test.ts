import { describe, expect, it } from '@jest/globals';

import { SKILL_TAG_VALIDATION_ISSUES } from '../src/data/skills.ts';

describe('skills.config tag sweep', () => {
  it('does not contain unknown tags and satisfies domain coverage rules', () => {
    expect(SKILL_TAG_VALIDATION_ISSUES).toEqual([]);
  });
});
