import { createSession } from '../src/modes/pve/session-state.ts';

describe('pve auto lineup fallback', () => {
  test('tự chọn đội từ collection khi không có lineup truyền vào', () => {
    const session = createSession({
      collectionState: {
        units: [
          { unitId: 'linhgac', owned: true, level: 1, stars: 0, realm: 0, subRealm: 0, tp: 0 },
          { unitId: 'vu_thien', owned: true, level: 30, stars: 2, realm: 1, subRealm: 3, tp: 40 },
          { unitId: 'thien_luu', owned: true, level: 20, stars: 1, realm: 1, subRealm: 0, tp: 10 },
        ],
      },
    });

    expect(session.playerDeckLocked.length).toBe(3);
    expect(session.playerDeckLocked[0]?.id).toBe('vu_thien');
    expect(session.playerDeckLocked[1]?.id).toBe('thien_luu');
    expect(session.playerDeckLocked[2]?.id).toBe('linhgac');
  });

  test('giới hạn auto lineup tối đa 10 nhân vật', () => {
    const session = createSession({
      collectionState: {
        units: [
          { unitId: 'thien_luu', owned: true, level: 2 },
          { unitId: 'vu_thien', owned: true, level: 3 },
          { unitId: 'anna', owned: true, level: 4 },
          { unitId: 'lao_khat_cai', owned: true, level: 5 },
          { unitId: 'ai_lan', owned: true, level: 6 },
          { unitId: 'faun', owned: true, level: 7 },
          { unitId: 'basil_thorne', owned: true, level: 8 },
          { unitId: 'mong_yem', owned: true, level: 9 },
          { unitId: 'chan_nga', owned: true, level: 10 },
          { unitId: 'ma_ton_diep_lam', owned: true, level: 11 },
          { unitId: 'mo_da', owned: true, level: 12 },
          { unitId: 'ngao_binh', owned: true, level: 13 },
        ],
      },
    });

    expect(session.playerDeckLocked.length).toBe(10);
  });

  test('fallback tối thiểu 1 nhân vật khi không có lineup và collection rỗng', () => {
    const session = createSession({ lineupDeck: [], collectionState: { units: [] } });

    expect(session.playerDeckLocked.length).toBeGreaterThanOrEqual(1);
  });
});
