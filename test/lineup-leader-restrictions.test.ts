import { setLeader, LINEUP_ALLOWED_LEADER_IDS, type LineupState, type RosterUnit } from '../src/screens/lineup/view/state.ts';

describe('lineup leader restrictions', () => {
  const createLineup = (): LineupState => ({
    id: 'l1',
    name: 'L1',
    role: '',
    description: '',
    passives: [],
    cells: [],
    leaderId: null,
    defaultCurrencyId: null,
  });

  it('chỉ cho phép leaderA và leaderB', () => {
    expect(LINEUP_ALLOWED_LEADER_IDS.has('leaderA')).toBe(true);
    expect(LINEUP_ALLOWED_LEADER_IDS.has('leaderB')).toBe(true);
    expect(LINEUP_ALLOWED_LEADER_IDS.has('anna')).toBe(false);
  });

  it('từ chối unit không thuộc danh sách leader', () => {
    const lineup = createLineup();
    const rosterLookup = new Map<string, RosterUnit>();
    const result = setLeader(lineup, 'anna', rosterLookup);
    expect(result.ok).toBe(false);
    expect(lineup.leaderId).toBeNull();
  });

  it('cho phép chọn leaderA kể cả khi không có trong roster lookup', () => {
    const lineup = createLineup();
    const rosterLookup = new Map<string, RosterUnit>();
    const result = setLeader(lineup, 'leaderA', rosterLookup);
    expect(result.ok).toBe(true);
    expect(lineup.leaderId).toBe('leaderA');
  });
});
