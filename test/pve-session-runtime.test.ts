import { advanceSession, applyReward } from '../src/modes/pve/session-runtime.ts';

describe('pve session runtime reward + wave flow', () => {
  test('advanceSession chuyển wave và đồng bộ rewardQueue/pendingRewards với dữ liệu đã sanitize', () => {
    const rewardA = { id: 'gold', weight: 1, tier: 1, data: { value: 10 } };
    const rewardB = { id: 'gem', weight: 1, tier: 2, data: { value: 1 } };
    const rewardAOverride = { id: 'gold', weight: 2, tier: 3, data: { value: 20 } };

    const session: any = {
      runtime: {
        rewardQueue: [{ id: 'legacy', weight: 1, tier: 1 }],
        encounter: {
          status: 'idle',
          waveIndex: 0,
          pendingRewards: [{ id: 'legacy', weight: 1, tier: 1 }],
          waves: [
            { status: 'pending', rewards: [rewardA, null, { bad: true }] },
            { status: 'spawning', rewards: [rewardB] },
            { status: 'active', rewards: [rewardAOverride, { id: '', weight: 1, tier: 1 }] },
          ],
        },
      },
    };

    const encounter = session.runtime.encounter;

    expect(advanceSession(session)?.status).toBe('running');
    expect(encounter.waves[0].status).toBe('spawning');

    expect(advanceSession(session)?.status).toBe('running');
    expect(encounter.waves[0].status).toBe('active');

    expect(advanceSession(session)?.status).toBe('running');
    expect(encounter.waves[0].status).toBe('cleared');
    expect(encounter.waveIndex).toBe(1);

    expect(session.runtime.rewardQueue).toEqual([
      { id: 'legacy', weight: 1, tier: 1 },
      rewardA,
    ]);
    expect(encounter.pendingRewards).toEqual(session.runtime.rewardQueue);

    expect(advanceSession(session)?.status).toBe('running');
    expect(encounter.waves[1].status).toBe('active');

    expect(advanceSession(session)?.status).toBe('running');
    expect(encounter.waves[1].status).toBe('cleared');
    expect(encounter.waveIndex).toBe(2);
    expect(session.runtime.rewardQueue).toEqual([
      { id: 'legacy', weight: 1, tier: 1 },
      rewardA,
      rewardB,
    ]);

    expect(advanceSession(session)?.status).toBe('completed');
    expect(encounter.waves[2].status).toBe('cleared');
    expect(encounter.waveIndex).toBe(3);
    expect(session.runtime.rewardQueue).toEqual([
      { id: 'legacy', weight: 1, tier: 1 },
      rewardAOverride,
      rewardB,
    ]);

    expect(advanceSession(session)?.status).toBe('completed');
    expect(session.runtime.wave).toBeNull();
  });

  test('applyReward xóa reward theo id ở cả runtime.rewardQueue và encounter.pendingRewards', () => {
    const selected = { id: 'gem', weight: 1, tier: 1 };
    const session: any = {
      runtime: {
        rewardQueue: [
          { id: 'gold', weight: 1, tier: 1 },
          { ...selected },
        ],
        encounter: {
          pendingRewards: [
            { ...selected },
            { id: 'ticket', weight: 1, tier: 1 },
          ],
        },
      },
    };

    expect(applyReward(session, selected)).toEqual(selected);
    expect(session.runtime.rewardQueue).toEqual([{ id: 'gold', weight: 1, tier: 1 }]);
    expect(session.runtime.encounter.pendingRewards).toEqual([{ id: 'ticket', weight: 1, tier: 1 }]);
  });

  test('advanceSession trả null khi thiếu runtime hoặc encounter', () => {
    expect(advanceSession(null)).toBeNull();
    expect(advanceSession({} as any)).toBeNull();
    expect(advanceSession({ runtime: {} } as any)).toBeNull();
  });
});
