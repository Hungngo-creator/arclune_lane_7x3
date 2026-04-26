import {
  ACTION_END,
  advanceSession,
  applyReward,
  createPveSession,
  emitGameEvent,
  onSessionEvent,
} from '../src/modes/pve/session-runtime.ts';

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

  test('merge reward path lớn vẫn ghi đè theo id và sanitize dữ liệu rác', () => {
    const makeReward = (id: string, tier = 1) => ({ id, weight: 1, tier });
    const existing = Array.from({ length: 8 }, (_, index) => makeReward(`r${index + 1}`));
    const additions = [
      makeReward('r2', 3),
      makeReward('r9', 1),
      makeReward('r10', 2),
    ];

    const session: any = {
      runtime: {
        rewardQueue: [...existing, { id: '', weight: 1, tier: 1 }, null],
        encounter: {
          status: 'running',
          waveIndex: 0,
          pendingRewards: [...existing],
          waves: [{ status: 'active', rewards: [...additions, { bad: true }] }],
        },
      },
    };

    const encounter = advanceSession(session);
    expect(encounter?.status).toBe('completed');
    expect(session.runtime.rewardQueue.find((item: any) => item.id === 'r2')?.tier).toBe(3);
    expect(session.runtime.rewardQueue.some((item: any) => !item?.id)).toBe(false);
    expect(session.runtime.rewardQueue.map((item: any) => item.id)).toContain('r10');
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

  test('applyReward không remove lặp khi rewardQueue và pendingRewards trỏ cùng mảng', () => {
    const sharedRewards = [
      { id: 'gold', weight: 1, tier: 1 },
      { id: 'gem', weight: 1, tier: 1 },
    ];
    const session: any = {
      runtime: {
        rewardQueue: sharedRewards,
        encounter: {
          pendingRewards: sharedRewards,
        },
      },
    };

    const picked = { id: 'gold', weight: 1, tier: 1 };
    expect(applyReward(session, picked)).toEqual(picked);
    expect(session.runtime.rewardQueue).toEqual([{ id: 'gem', weight: 1, tier: 1 }]);
    expect(session.runtime.encounter.pendingRewards).toEqual([{ id: 'gem', weight: 1, tier: 1 }]);
  });

  test('onSessionEvent trả noop khi input không hợp lệ', () => {
    const unsub = onSessionEvent('' as any, null as any);
    expect(typeof unsub).toBe('function');
    expect(() => unsub()).not.toThrow();
  });

  test('event forwarding qua createPveSession.onEvent và unsubscribe hoạt động thật', () => {
    const session = createPveSession(null as any, {});
    const seen: string[] = [];
    const off = session.onEvent(ACTION_END, () => {
      seen.push('called');
    });

    emitGameEvent(ACTION_END, {} as any);
    expect(seen).toHaveLength(1);

    off();
    emitGameEvent(ACTION_END, {} as any);
    expect(seen).toHaveLength(1);
  });

  test('event forwarding unsubscribe chỉ gỡ handler tương ứng', () => {
    const session = createPveSession(null as any, {});
    const seen: string[] = [];
    const offA = session.onEvent(ACTION_END, () => {
      seen.push('A');
    });
    session.onEvent(ACTION_END, () => {
      seen.push('B');
    });

    emitGameEvent(ACTION_END, {} as any);
    expect(seen).toEqual(['A', 'B']);

    offA();
    emitGameEvent(ACTION_END, {} as any);
    expect(seen).toEqual(['A', 'B', 'B']);
  });

  test('onSessionEvent unsubscribe hoạt động thật', () => {
    const seen: string[] = [];
    const off = onSessionEvent(ACTION_END, () => {
      seen.push('ok');
    });
    emitGameEvent(ACTION_END, {} as any);
    expect(seen).toHaveLength(1);
    off();
    emitGameEvent(ACTION_END, {} as any);
    expect(seen).toHaveLength(1);
  });

  test('advanceSession trả null khi thiếu runtime hoặc encounter', () => {
    expect(advanceSession(null)).toBeNull();
    expect(advanceSession({} as any)).toBeNull();
    expect(advanceSession({ runtime: {} } as any)).toBeNull();
  });

  test('idempotency: tick nhiều lần sau completed không làm drift state', () => {
    const reward = { id: 'gold', weight: 1, tier: 1 };
    const session: any = {
      runtime: {
        rewardQueue: [],
        wave: null,
        encounter: {
          status: 'running',
          waveIndex: 0,
          pendingRewards: [],
          waves: [{ status: 'active', rewards: [reward] }],
        },
      },
    };

    const first = advanceSession(session);
    expect(first?.status).toBe('completed');
    expect(session.runtime.rewardQueue).toEqual([reward]);
    expect(session.runtime.encounter.pendingRewards).toEqual([reward]);

    for (let tick = 0; tick < 10; tick += 1) {
      const next = advanceSession(session);
      expect(next?.status).toBe('completed');
      expect(session.runtime.rewardQueue).toEqual([reward]);
      expect(session.runtime.encounter.pendingRewards).toEqual([reward]);
      expect(session.runtime.wave).toBeNull();
      expect(session.runtime.encounter.waveIndex).toBe(1);
    }
  });

  test('idempotency nhiều tick completed không tạo reward trùng (large path)', () => {
    const size = 1000;
    const rewards = Array.from({ length: size }, (_, index) => ({
      id: `reward_${index}`,
      weight: 1,
      tier: 1,
    }));
    const session: any = {
      runtime: {
        rewardQueue: [],
        wave: null,
        encounter: {
          status: 'running',
          waveIndex: 0,
          pendingRewards: [],
          waves: [{ status: 'active', rewards }],
        },
      },
    };

    expect(advanceSession(session)?.status).toBe('completed');
    expect(session.runtime.rewardQueue).toHaveLength(size);

    for (let tick = 0; tick < 50; tick += 1) {
      expect(advanceSession(session)?.status).toBe('completed');
      expect(session.runtime.rewardQueue).toHaveLength(size);
      expect(session.runtime.encounter.pendingRewards).toHaveLength(size);
    }
  });

  test('encounter completed thì advanceSession trả sớm, không mutate thêm', () => {
    const reward = { id: 'gold', weight: 1, tier: 1 };
    const wave = { status: 'active', rewards: [reward] };
    const session: any = {
      runtime: {
        rewardQueue: [reward],
        wave: wave,
        encounter: {
          status: 'completed',
          waveIndex: 99,
          pendingRewards: [reward],
          waves: [wave],
        },
      },
    };

    const encounter = advanceSession(session);
    expect(encounter?.status).toBe('completed');
    expect(session.runtime.wave).toBeNull();
    expect(session.runtime.encounter.waveIndex).toBe(99);
    expect(session.runtime.rewardQueue).toEqual([reward]);
    expect(session.runtime.encounter.pendingRewards).toEqual([reward]);
  });

  test('active wave sanitize/cache chỉ chạy một lần và giữ reference reward list đã làm sạch', () => {
    const reward = { id: 'gold', weight: 1, tier: 1 };
    const dirtyRewards: any[] = [reward, { id: '', weight: 1, tier: 1 }, null];
    const wave: any = { status: 'active', rewards: dirtyRewards };
    const session: any = {
      runtime: {
        rewardQueue: [],
        encounter: {
          status: 'running',
          waveIndex: 0,
          pendingRewards: [],
          waves: [wave],
        },
      },
    };

    expect(advanceSession(session)?.status).toBe('completed');
    expect(wave.rewards).toBe(dirtyRewards);
    expect(wave.rewards).toEqual([reward]);

    // gọi lặp sau completed không append lại reward
    for (let tick = 0; tick < 5; tick += 1) {
      expect(advanceSession(session)?.status).toBe('completed');
      expect(session.runtime.rewardQueue).toEqual([reward]);
    }
  });

  test('applyReward trả null khi input không hợp lệ', () => {
    expect(applyReward(null as any, { id: 'x', weight: 1, tier: 1 } as any)).toBeNull();
    expect(applyReward({ runtime: {} } as any, { id: 'x', weight: 1, tier: 1 } as any)).toEqual({ id: 'x', weight: 1, tier: 1 });
    expect(applyReward({ runtime: {} } as any, { id: '', weight: 1, tier: 1 } as any)).toBeNull();
  });

  test('regression nhỏ: merge reward path lớn giữ đúng unique id và override mới nhất', () => {
    const size = 2500;
    const existing = Array.from({ length: size }, (_, index) => ({
      id: `reward_${index}`,
      weight: 1,
      tier: 1,
    }));
    const additions = Array.from({ length: size }, (_, index) => ({
      id: `reward_${index}`,
      weight: 2,
      tier: 2,
    }));
    additions.push({ id: 'bonus_drop', weight: 5, tier: 3 });

    const session: any = {
      runtime: {
        rewardQueue: existing,
        encounter: {
          status: 'running',
          waveIndex: 0,
          pendingRewards: existing.slice(),
          waves: [{ status: 'active', rewards: additions }],
        },
      },
    };

    const startedAt = performance.now();
    const encounter = advanceSession(session);
    const elapsedMs = performance.now() - startedAt;

    expect(encounter?.status).toBe('completed');
    expect(session.runtime.rewardQueue).toHaveLength(size + 1);
    expect(session.runtime.rewardQueue.find((item: any) => item.id === 'reward_0')?.tier).toBe(2);
    expect(session.runtime.rewardQueue.find((item: any) => item.id === 'bonus_drop')?.tier).toBe(3);
    expect(session.runtime.encounter.pendingRewards).toHaveLength(size + 1);
    // Guard regression cơ bản, tránh đặt ngưỡng quá chặt gây flaky theo môi trường CI.
    expect(elapsedMs).toBeLessThan(2000);
  });


});