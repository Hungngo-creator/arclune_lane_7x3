import {
  collectAssignedUnitTags,
  evaluatePassive,
  type LineupPassive,
  type RosterUnit,
} from '../src/screens/lineup/view/state.ts';

function makePassive(overrides: Partial<LineupPassive> = {}): LineupPassive {
  return {
    index: 0,
    id: 'p1',
    name: 'P1',
    description: '',
    requirement: '',
    requiredUnitIds: [],
    requiredTags: [],
    isEmpty: false,
    autoActive: false,
    source: null,
    ...overrides,
  };
}

describe('lineup passive evaluation helpers', () => {
  it('collectAssignedUnitTags gom role/rank/tags của các unit đã gán', () => {
    const rosterLookup = new Map<string, RosterUnit>([
      ['u1', { id: 'u1', name: 'U1', role: 'mage', rank: 'SSR', tags: ['void'], power: null, avatar: null, passives: [], raw: null }],
      ['u2', { id: 'u2', name: 'U2', role: 'tank', rank: 'SR', tags: ['dragon'], power: null, avatar: null, passives: [], raw: null }],
    ]);
    const assigned = new Set<string>(['u1', 'u2']);

    const tags = collectAssignedUnitTags(assigned, rosterLookup);

    expect(tags.has('mage')).toBe(true);
    expect(tags.has('SSR')).toBe(true);
    expect(tags.has('void')).toBe(true);
    expect(tags.has('tank')).toBe(true);
    expect(tags.has('SR')).toBe(true);
    expect(tags.has('dragon')).toBe(true);
  });

  it('evaluatePassive hỗ trợ dùng tag cache để tránh tính lại mỗi passive', () => {
    const rosterLookup = new Map<string, RosterUnit>([
      ['u1', { id: 'u1', name: 'U1', role: 'mage', rank: 'SSR', tags: ['void'], power: null, avatar: null, passives: [], raw: null }],
    ]);
    const assigned = new Set<string>(['u1']);
    const cachedTags = collectAssignedUnitTags(assigned, rosterLookup);
    const passive = makePassive({ requiredTags: ['mage', 'void'] });

    expect(evaluatePassive(passive, assigned, rosterLookup, cachedTags)).toBe(true);
  });
});
