import {
  advanceMonopolyMovement,
  applyMonopolyStepDrain,
  applyMonopolySurvivalHpDrain,
  collectHouseIncome,
  applySpiritGainWithHouseOverflow,
  computeMonopolyVictoryRewardByGold,
  createRandomHouseSlots,
  createInitialMonopolyStatus,
  createInitialMonopolyWallet,
  createMonopolyBoardCells,
  getHouseDefinitions,
  getHouseOwnerEffectSpec,
  getMonopolyDiceMaxBySpirit,
  inheritGoldOnKill,
  normalizeMonopolyWallet,
  pickRandomHouseDefinitionByTier,
  getHouseVisitorPenalty,
  refillMonopolySilverIfEmpty,
  revealHousePurchase,
  rollLacDuongEncounter,
  rollLacDuongRingDestiny,
  resetHouseSlotsByOwner,
  rollHouseTier,
  settleHouseTraverse,
  pickMonopolyModuleCell,
  createTrucLamClusters,
  createWorldRiftClusters,
  applyTrucLamThirstRestore,
  getWorldRiftTeleportChance,
  shouldTriggerAssassinTaxPunishment,
  upgradeHouse,
  resolveMonopolyCollisionCombat,
  shouldSkipMonopolyTurnBySpirit,
  spendMonopolySilver,
  createInitialMonopolyYearEventState,
  getMonopolyYearRuleModifiers,
  resolveMonopolyNewYearEvent,
} from '../src/screens/monopoly/index.ts';

describe('monopoly board layout', () => {
    it('builds exactly 116 cells with 40 main-track cells, 24 mini-ring cells và 8 ô vi mô', () => {
    const cells = createMonopolyBoardCells();
    expect(cells).toHaveLength(116);
    expect(cells.filter(cell => cell.track === 'main')).toHaveLength(40);
    expect(cells.filter(cell => cell.track === 'mini')).toHaveLength(24);
    expect(cells.filter(cell => cell.track === 'micro')).toHaveLength(8);
  });

  it('does not overlap coordinates between tracks', () => {
    const cells = createMonopolyBoardCells();
    const coordSet = new Set(cells.map(cell => `${cell.row},${cell.col}`));
    expect(coordSet.size).toBe(cells.length);
  });

  it('keeps all cells inside 15x15 board and indexes contiguous', () => {
    const cells = createMonopolyBoardCells();
    cells.forEach((cell, idx) => {
      expect(cell.index).toBe(idx);
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThan(15);
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThan(15);
    });
  });

  it('adds eight protrusion cells at requested paired anchor targets', () => {
    const cells = createMonopolyBoardCells();
    const protrusions = [
      [1, 3],
      [1, 11],
      [3, 13],
      [11, 13],
      [13, 11],
      [13, 3],
      [11, 1],
      [3, 1]
    ];

    protrusions.forEach(([row, col]) => {
      expect(cells.some(cell => cell.row === row && cell.col === col && cell.track !== 'main')).toBe(true);
    });
  });

  it('positions side lanes and top/bottom lanes at requested outer anchors', () => {
    const cells = createMonopolyBoardCells();
    const find = (index: number) => cells[index - 1];

    for (let i = 41; i <= 49; i += 1) {
      expect(find(i).col).toBe(0);
      expect(find(i).row).toBe(i - 38);
      expect(find(i).track).toBe('connector');
    }

    for (let i = 68; i <= 76; i += 1) {
      expect(find(i).col).toBe(14);
      expect(find(i).row).toBe(i - 65);
      expect(find(i).track).toBe('connector');
    }

    for (let i = 50; i <= 58; i += 1) {
      expect(find(i).row).toBe(0);
      expect(find(i).col).toBe(i - 47);
      expect(find(i).track).toBe('lane');
    }

    for (let i = 59; i <= 67; i += 1) {
      expect(find(i).row).toBe(14);
      expect(find(i).col).toBe(i - 56);
      expect(find(i).track).toBe('lane');
    }

    expect(find(79)).toMatchObject({ row: 1, col: 3 });
    expect(find(80)).toMatchObject({ row: 1, col: 11 });
    expect(find(83)).toMatchObject({ row: 13, col: 3 });
    expect(find(84)).toMatchObject({ row: 13, col: 11 });
  });

  it('creates an inner mini square using intersections of (3,39), (9,13), (19,23), (29,33)', () => {
    const cells = createMonopolyBoardCells();
    const main = cells.filter(cell => cell.track === 'main');
    const mini = cells.filter(cell => cell.track === 'mini');

    const topLeft = { row: main[39 - 1].row, col: main[3 - 1].col };
    const topRight = { row: main[13 - 1].row, col: main[9 - 1].col };
    const bottomRight = { row: main[19 - 1].row, col: main[23 - 1].col };
    const bottomLeft = { row: main[33 - 1].row, col: main[29 - 1].col };

    expect(topLeft).toEqual({ row: 4, col: 4 });
    expect(topRight).toEqual({ row: 4, col: 10 });
    expect(bottomRight).toEqual({ row: 10, col: 10 });
    expect(bottomLeft).toEqual({ row: 10, col: 4 });

    const miniSet = new Set(mini.map(cell => `${cell.row},${cell.col}`));
    expect(miniSet.size).toBe(24);
    expect(mini[0].index).toBe(84);
    expect(mini.at(-1)?.index).toBe(107);

    expect(miniSet.has(`${topLeft.row},${topLeft.col}`)).toBe(true);
    expect(miniSet.has(`${topRight.row},${topRight.col}`)).toBe(true);
    expect(miniSet.has(`${bottomRight.row},${bottomRight.col}`)).toBe(true);
    expect(miniSet.has(`${bottomLeft.row},${bottomLeft.col}`)).toBe(true);
  });

  it('creates a second micro square (8 cells) from intersections of (99,95), (101,105), (107,87), (89,93)', () => {
    const cells = createMonopolyBoardCells();
    const micro = cells.filter(cell => cell.track === 'micro');
    const mini = cells.filter(cell => cell.track === 'mini');

    const byIndex = (oneBased: number) => cells[oneBased - 1];
    const pickIntersection = (first: number, second: number) => {
      const a = byIndex(first);
      const b = byIndex(second);
      const c1 = { row: a.row, col: b.col };
      const c2 = { row: b.row, col: a.col };
      const miniRows = mini.map(cell => cell.row);
      const miniCols = mini.map(cell => cell.col);
      const minRow = Math.min(...miniRows);
      const maxRow = Math.max(...miniRows);
      const minCol = Math.min(...miniCols);
      const maxCol = Math.max(...miniCols);
      return [c1, c2].find(point => (
        point.row > minRow &&
        point.row < maxRow &&
        point.col > minCol &&
        point.col < maxCol
      ));
    };

    const corners = [
      pickIntersection(99, 95),
      pickIntersection(101, 105),
      pickIntersection(107, 87),
      pickIntersection(89, 93)
    ];

    expect(corners).toEqual([
      { row: 8, col: 8 },
      { row: 8, col: 6 },
      { row: 6, col: 6 },
      { row: 6, col: 8 }
    ]);

    const microSet = new Set(micro.map(cell => `${cell.row},${cell.col}`));
    expect(microSet.size).toBe(8);
    expect(micro[0].index).toBe(108);
    expect(micro.at(-1)?.index).toBe(115);

    expect(microSet.has('6,6')).toBe(true);
    expect(microSet.has('6,8')).toBe(true);
    expect(microSet.has('8,8')).toBe(true);
    expect(microSet.has('8,6')).toBe(true);

    const touchesMini = micro.some(microCell => mini.some(miniCell => {
      const rowDistance = Math.abs(microCell.row - miniCell.row);
      const colDistance = Math.abs(microCell.col - miniCell.col);
      return rowDistance + colDistance === 1;
    }));
    expect(touchesMini).toBe(false);
  });
});

describe('monopoly lạc dương trấn module', () => {
  it('rolls encounter chance đúng mốc 20% nhỏ, 10% thiếu nữ', () => {
    expect(rollLacDuongEncounter(0)).toBe('minor');
    expect(rollLacDuongEncounter(0.1999)).toBe('minor');
    expect(rollLacDuongEncounter(0.2)).toBe('maiden');
    expect(rollLacDuongEncounter(0.2999)).toBe('maiden');
    expect(rollLacDuongEncounter(0.3)).toBe('none');
  });

  it('rolls nhẫn đá cũ đúng mốc 15/20/25/40', () => {
    expect(rollLacDuongRingDestiny(0.01)).toBe('major');
    expect(rollLacDuongRingDestiny(0.2)).toBe('medium');
    expect(rollLacDuongRingDestiny(0.55)).toBe('minor');
    expect(rollLacDuongRingDestiny(0.9)).toBe('none');
  });

  it('never picks module cell inside mini/micro tracks và không đè ô đã chiếm', () => {
    const cells = createMonopolyBoardCells();
    const miniAndMicro = cells
      .filter(cell => cell.track === 'mini' || cell.track === 'micro')
      .map(cell => cell.index + 1);
    const occupied = new Set<number>(miniAndMicro);
    occupied.add(21);
    const picked = pickMonopolyModuleCell(cells, occupied);
    expect(picked).not.toBeNull();
    if (picked != null) {
      expect(occupied.has(picked)).toBe(false);
      const cell = cells[picked - 1];
      expect(cell.track).not.toBe('mini');
      expect(cell.track).not.toBe('micro');
    }
  });
});

describe('monopoly trúc lâm module', () => {
  it('creates 5 clusters and each cluster has exactly 1 cell', () => {
    const cells = createMonopolyBoardCells();
    const clusters = createTrucLamClusters(cells, new Set(), 5, () => 0.01);
    expect(clusters).toHaveLength(5);
    const allCells = clusters.flat();
    expect(new Set(allCells).size).toBe(5);

    for (const cluster of clusters) {
      expect(cluster).toHaveLength(1);
      const [first] = cluster;
      const firstCell = cells[first - 1];
      expect(firstCell.track).not.toBe('mini');
      expect(firstCell.track).not.toBe('micro');
    }
  });

  it('restores thirst = 10% cap when stepping directly on one Trúc Lâm tile', () => {
    const status = applyTrucLamThirstRestore({ thirst: 40, hunger: 70, spirit: 80 });
    expect(status.thirst).toBe(50);
    expect(status.hunger).toBe(70);
    expect(status.spirit).toBe(80);
  });
});

describe('monopoly vành nứt thế giới module', () => {
  it('creates exactly 1 contiguous cluster with 7 non-mini/non-micro cells', () => {
    const cells = createMonopolyBoardCells();
    const clusters = createWorldRiftClusters(cells, new Set(), 1, 7, () => 0.01);
    expect(clusters).toHaveLength(1);
    const [cluster] = clusters;
    expect(cluster).toHaveLength(7);
    expect(new Set(cluster).size).toBe(7);

    for (let idx = 1; idx < cluster.length; idx += 1) {
      const prev = cells[cluster[idx - 1] - 1];
      const curr = cells[cluster[idx] - 1];
      expect(curr.track).not.toBe('mini');
      expect(curr.track).not.toBe('micro');
      expect(Math.abs(prev.row - curr.row) + Math.abs(prev.col - curr.col)).toBe(1);
    }
  });

  it('uses symmetric 10/20/30/40/30/20/10 teleport odds', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(getWorldRiftTeleportChance)).toEqual([0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.1]);
  });
});

describe('monopoly detour movement', () => {
  it('queues detour on 22 and enters brown lane on next turn', () => {
    const queued = advanceMonopolyMovement({
      currentPathIndex: 0,
      currentCellOneBased: 21,
      pendingDetourFrom: null,
      activeDetourFrom: null,
      detourProgress: -1
    }, 1);

    expect(queued.currentCellOneBased).toBe(22);
    expect(queued.pendingDetourFrom).toBe(22);
    expect(queued.activeDetourFrom).toBeNull();

    const entered = advanceMonopolyMovement(queued, 1);
    expect(entered.currentCellOneBased).toBe(84);
    expect(entered.activeDetourFrom).toBe(22);
    expect(entered.detourProgress).toBe(0);
  });

  it('must go to the end of detour before returning to main track', () => {
    const state = advanceMonopolyMovement({
      currentPathIndex: 1,
      currentCellOneBased: 22,
      pendingDetourFrom: 22,
      activeDetourFrom: null,
      detourProgress: -1
    }, 11);

    expect(state.currentCellOneBased).toBe(83);
    expect(state.activeDetourFrom).toBe(22);
    expect(state.pendingDetourFrom).toBeNull();

    const exited = advanceMonopolyMovement(state, 1);
    expect(exited.currentCellOneBased).toBe(32);
    expect(exited.activeDetourFrom).toBeNull();
    expect(exited.pendingDetourFrom).toBe(32);
  });
});

describe('monopoly collision combat', () => {
  const createAvatar = (id: number, hp: number) => ({
    id,
    hp,
    stats: { hpMax: hp, ATK: 100, WIL: 50, ARM: 0, RES: 0 },
  } as any);

  it('2 avatars cùng ô đánh nhau 1 đòn thường mỗi bên, cùng lúc', () => {
    const a = createAvatar(1, 1000);
    const b = createAvatar(2, 1000);

    const result = resolveMonopolyCollisionCombat([a, b]);

    expect(result.events).toHaveLength(2);
    expect(a.hp).toBe(850);
    expect(b.hp).toBe(850);
  });

  it('3 avatars cùng ô thì mỗi avatar đánh 2 mục tiêu còn lại cùng lúc', () => {
    const a = createAvatar(1, 1000);
    const b = createAvatar(2, 1000);
    const c = createAvatar(3, 1000);

    const result = resolveMonopolyCollisionCombat([a, b, c]);

    expect(result.events).toHaveLength(6);
    expect(a.hp).toBe(700);
    expect(b.hp).toBe(700);
    expect(c.hp).toBe(700);
  });
});

describe('monopoly currency wallet', () => {
  it('gives every avatar 4 gold + 1 silver at game start', () => {
    expect(createInitialMonopolyWallet()).toEqual({ gold: 4, silver: 1 });
  });

  it('does not auto-convert silver into gold when normalizing wallet', () => {
    expect(normalizeMonopolyWallet({ gold: 2, silver: 250 })).toEqual({ gold: 2, silver: 250 });
    expect(normalizeMonopolyWallet({ gold: -1, silver: Number.NaN })).toEqual({ gold: 0, silver: 0 });
  });

  it('auto-converts exactly 1 gold into 100 silver only when silver is empty', () => {
    expect(refillMonopolySilverIfEmpty({ gold: 4, silver: 0 })).toEqual({ gold: 3, silver: 100 });
    expect(refillMonopolySilverIfEmpty({ gold: 4, silver: 1 })).toEqual({ gold: 4, silver: 1 });
    expect(refillMonopolySilverIfEmpty({ gold: 0, silver: 0 })).toEqual({ gold: 0, silver: 0 });
  });

  it('spends silver after single-step auto conversion and does not chain-convert extra gold', () => {
    expect(spendMonopolySilver({ gold: 3, silver: 0 }, 80)).toEqual({
      wallet: { gold: 2, silver: 20 },
      paid: true
    });
    expect(spendMonopolySilver({ gold: 3, silver: 0 }, 101)).toEqual({
      wallet: { gold: 2, silver: 100 },
      paid: false
    });
  });

  it('computes victory reward based on gold only', () => {
    expect(computeMonopolyVictoryRewardByGold({ gold: 5, silver: 999 })).toBe(500);
  });

  it('inherits only gold from victim wallet on kill', () => {
    const result = inheritGoldOnKill({ gold: 3, silver: 40 }, { gold: 5, silver: 90 });
    expect(result.inheritedGold).toBe(5);
    expect(result.killerWallet).toEqual({ gold: 8, silver: 40 });
    expect(result.victimWallet).toEqual({ gold: 0, silver: 90 });
  });

  describe('monopoly survival metrics', () => {
  it('resets all monopoly-only metrics to 80/100 at match start', () => {
    expect(createInitialMonopolyStatus()).toEqual({
      thirst: 80,
      hunger: 80,
      spirit: 80
    });
  });

  it('drains thirst/hunger/spirit per moved step with cap [0,100]', () => {
    expect(applyMonopolyStepDrain({ thirst: 80, hunger: 80, spirit: 80 }, 5)).toEqual({
      thirst: 72,
      hunger: 74,
      spirit: 77.5
    });

    expect(applyMonopolyStepDrain({ thirst: 3, hunger: 3, spirit: 1 }, 5)).toEqual({
      thirst: 0,
      hunger: 0,
      spirit: 0
    });
  });

  it('limits dice to 1..3 when spirit <= 30, otherwise 1..6', () => {
    expect(getMonopolyDiceMaxBySpirit(80)).toBe(6);
    expect(getMonopolyDiceMaxBySpirit(31)).toBe(6);
    expect(getMonopolyDiceMaxBySpirit(30)).toBe(3);
    expect(getMonopolyDiceMaxBySpirit(0)).toBe(3);
  });

  it('marks skip-turn when spirit <= 20', () => {
    expect(shouldSkipMonopolyTurnBySpirit(21)).toBe(false);
    expect(shouldSkipMonopolyTurnBySpirit(20)).toBe(true);
    expect(shouldSkipMonopolyTurnBySpirit(0)).toBe(true);
  });

it('drains hp by step when thirst/hunger are critically low for any avatar', () => {
    expect(applyMonopolySurvivalHpDrain(1000, 1000, { thirst: 9, hunger: 80, spirit: 80 }, 4)).toBe(960);
    expect(applyMonopolySurvivalHpDrain(1000, 1000, { thirst: 80, hunger: 9, spirit: 80 }, 4)).toBe(980);
    expect(applyMonopolySurvivalHpDrain(1000, 1000, { thirst: 9, hunger: 9, spirit: 80 }, 4)).toBe(940);
    expect(applyMonopolySurvivalHpDrain(1000, 1000, { thirst: 10, hunger: 10, spirit: 80 }, 4)).toBe(1000);
  });
});
});
describe('monopoly house module', () => {
  it('spawns up to 16 random house slots and keeps marker ?', () => {
    const cells = createMonopolyBoardCells();
    const slots = createRandomHouseSlots(cells, () => 0.2);
    expect(slots).toHaveLength(16);
    expect(new Set(slots.map(slot => slot.cellIndex)).size).toBe(16);
    expect(slots.every(slot => slot.marker === '?')).toBe(true);
  });

  it('can exclude mini (24) + micro (8) zones from random house slots', () => {
    const cells = createMonopolyBoardCells();
    const blockedZones = cells.filter(cell => cell.track === 'mini' || cell.track === 'micro');
    const eligibleCells = cells.filter(cell => cell.track !== 'mini' && cell.track !== 'micro');
    const blockedZoneCellIds = new Set(blockedZones.map(cell => cell.index + 1));
    const slots = createRandomHouseSlots(eligibleCells, () => 0.2);

    expect(blockedZones).toHaveLength(32);
    expect(eligibleCells).toHaveLength(84);
    expect(slots).toHaveLength(16);
    expect(slots.every(slot => !blockedZoneCellIds.has(slot.cellIndex))).toBe(true);
  });

  it('rolls house tier using weighted table and can reveal purchase', () => {
    expect(rollHouseTier(() => 0.01)).toBe(5);
    expect(rollHouseTier(() => 0.05)).toBe(4);
    expect(rollHouseTier(() => 0.10)).toBe(3);
    expect(rollHouseTier(() => 0.20)).toBe(2);
    expect(rollHouseTier(() => 0.80)).toBe(1);

    const slot = createRandomHouseSlots(createMonopolyBoardCells(), () => 0.3, 1)[0]!;
    const res = revealHousePurchase(slot, 7, 2_000, () => 0.01);
    expect(res.ok).toBe(true);
    expect(slot.ownerAvatarId).toBe(7);
    expect(slot.revealedTier).toBe(5);
    expect(res.nextWalletSilver).toBe(500);
  });

  it('applies tax to non-owner traversal and owner can collect treasury when passing', () => {
    const slot = {
      cellIndex: 22,
      marker: '?' as const,
      revealedTier: 1 as const,
      definitionId: 'tieu_diem',
      ownerAvatarId: 2,
      treasurySilver: 0,
      minedYears: 0
    };

    const passTax = settleHouseTraverse(slot, 5, false);
    const landTax = settleHouseTraverse(slot, 5, true);
    const ownerCollect = settleHouseTraverse(slot, 2, false);

    expect(passTax.paidTaxSilver).toBe(5);
    expect(landTax.paidTaxSilver).toBe(20);
    expect(ownerCollect.ownerCollectedSilver).toBe(25);
    expect(slot.treasurySilver).toBe(0);
  });

  it('upgrades owned house to next tier with configured upgrade cost', () => {
    const slot = {
      cellIndex: 11,
      marker: '?' as const,
      revealedTier: 1 as const,
      definitionId: 'tieu_diem',
      ownerAvatarId: 9,
      treasurySilver: 0,
      minedYears: 0
    };

    const upgraded = upgradeHouse(slot, 500, () => 0.02);
    expect(upgraded.ok).toBe(true);
    expect(upgraded.nextWalletSilver).toBe(300);
    expect(slot.revealedTier).toBe(2);
    expect(upgraded.nextDefinition?.tier).toBe(2);
  });

  it('caps tax by current wallet so house treasury does not mint money from debt', () => {
    const slot = {
      cellIndex: 30,
      marker: '?' as const,
      revealedTier: 5 as const,
      definitionId: 'anh_sat_mon',
      ownerAvatarId: 3,
      treasurySilver: 0,
      minedYears: 0
    };

    const settled = settleHouseTraverse(slot, 8, true, 420);
    expect(settled.expectedTaxSilver).toBe(1500);
    expect(settled.paidTaxSilver).toBe(420);
    expect(slot.treasurySilver).toBe(420);
  });

  it('supports mine-style houses with limited yearly extraction', () => {
    const mine = getHouseDefinitions().find(entry => entry.id === 'quang_nho');
    expect(mine).toBeTruthy();
    expect(pickRandomHouseDefinitionByTier(2, () => 0.4).tier).toBe(2);

    const slot = {
      cellIndex: 22,
      marker: '?' as const,
      revealedTier: 2 as const,
      definitionId: 'quang_nho',
      ownerAvatarId: 2,
      treasurySilver: 0,
      minedYears: 0
    };
    for (let i = 0; i < 5; i += 1) {
      collectHouseIncome(slot, true);
    }
    expect(slot.treasurySilver).toBe(750);
    expect(slot.minedYears).toBe(3);
  });

it('resets all houses of a slain owner back to hidden ?', () => {
    const slots = [
      {
        cellIndex: 12,
        marker: '?' as const,
        revealedTier: 4 as const,
        definitionId: 'tien_gia_phu_de',
        ownerAvatarId: 8,
        treasurySilver: 1234,
        minedYears: 0
      },
      {
        cellIndex: 31,
        marker: '?' as const,
        revealedTier: 2 as const,
        definitionId: 'quang_nho',
        ownerAvatarId: 8,
        treasurySilver: 500,
        minedYears: 2
      },
      {
        cellIndex: 7,
        marker: '?' as const,
        revealedTier: 1 as const,
        definitionId: 'tieu_diem',
        ownerAvatarId: 3,
        treasurySilver: 88,
        minedYears: 0
      }
    ];

    const resetCells = resetHouseSlotsByOwner(slots, 8);
    expect(resetCells.sort((a, b) => a - b)).toEqual([12, 31]);
    expect(slots[0]).toMatchObject({ revealedTier: null, definitionId: null, ownerAvatarId: null, treasurySilver: 0, minedYears: 0 });
    expect(slots[1]).toMatchObject({ revealedTier: null, definitionId: null, ownerAvatarId: null, treasurySilver: 0, minedYears: 0 });
    expect(slots[2]).toMatchObject({ revealedTier: 1, definitionId: 'tieu_diem', ownerAvatarId: 3, treasurySilver: 88 });
  });

it('applies Ba Nén Nhang visitor penalties by pass/land', () => {
    const passPenalty = getHouseVisitorPenalty('ba_nen_nhang', false);
    const landPenalty = getHouseVisitorPenalty('ba_nen_nhang', true);
    const neutralPenalty = getHouseVisitorPenalty('tieu_diem', true);

    expect(passPenalty.hpRatioLoss).toBe(0.05);
    expect(landPenalty.hpRatioLoss).toBe(0.13);
    expect(landPenalty.statusDelta.thirst).toBe(-10);
    expect(landPenalty.statusDelta.hunger).toBe(-10);
    expect(landPenalty.statusDelta.spirit).toBe(-13);
    expect(neutralPenalty.hpRatioLoss).toBe(0);
  });

  it('converts overflow spirit to spirit cap for Ảnh sát môn', () => {
    const overflow = applySpiritGainWithHouseOverflow('anh_sat_mon', 90, 100, 65);
    const normal = applySpiritGainWithHouseOverflow('hop_hoan_tong', 90, 100, 35);

    expect(overflow.nextSpirit).toBe(100);
    expect(overflow.nextSpiritCap).toBe(127.5);
    expect(overflow.overflowConvertedToCap).toBe(27.5);
    expect(normal.nextSpirit).toBe(100);
    expect(normal.nextSpiritCap).toBe(100);
  });

  it('exposes owner buff specs from house module for auditability', () => {
    const tanKhiMon = getHouseOwnerEffectSpec('tan_khi_mon');
    const anhSatMon = getHouseOwnerEffectSpec('anh_sat_mon');
    const empty = getHouseOwnerEffectSpec('thi_than_thuong');

    expect(tanKhiMon.passHpRatio).toBe(0.05);
    expect(tanKhiMon.passStatus).toEqual({ thirst: 10, hunger: 10, spirit: 5 });
    expect(anhSatMon.overflowSpiritToCap).toBe(true);
    expect(anhSatMon.landStatus?.spirit).toBe(65);
    expect(empty.passStatus).toBeUndefined();
    expect(empty.landStatus).toBeUndefined();
  });
  it('flags assassin punishment whenever Ảnh sát môn tax is underpaid', () => {
    expect(shouldTriggerAssassinTaxPunishment('anh_sat_mon', 1500, 200)).toBe(true);
    expect(shouldTriggerAssassinTaxPunishment('anh_sat_mon', 700, 700)).toBe(false);
    expect(shouldTriggerAssassinTaxPunishment('tai_cac', 1700, 0)).toBe(false);
  });
});

describe('monopoly yearly events', () => {
  it('applies drought and famine multipliers to step drain', () => {
    const base = createInitialMonopolyStatus();
    const drought = applyMonopolyStepDrain(base, 2, getMonopolyYearRuleModifiers('drought'));
    const famine = applyMonopolyStepDrain(base, 2, getMonopolyYearRuleModifiers('famine'));

    expect(drought.thirst).toBeLessThan(base.thirst - 3);
    expect(drought.hunger).toBeCloseTo(base.hunger - 2 * 1.2, 5);
    expect(famine.hunger).toBeLessThan(base.hunger - 4);
    expect(famine.thirst).toBeCloseTo(base.thirst - 2 * 1.6, 5);
  });

  it('rotates yearly events with 2-year cooldown after the event ends', () => {
    let state = createInitialMonopolyYearEventState();
    const cells = createMonopolyBoardCells()
      .filter(cell => cell.track !== 'mini' && cell.track !== 'micro')
      .map(cell => cell.index + 1);
    const seen: string[] = [];

    for (let year = 1; year <= 6; year += 1) {
      const outcome = resolveMonopolyNewYearEvent(year, state, cells, () => 0);
      state = outcome.nextState;
      seen.push(outcome.event.id);
    }

    expect(seen.slice(0, 4)).toEqual(['drought', 'famine', 'inflation', 'drought']);
    expect(seen[4]).toBe('famine');
  });

  it('spawns đúng số ô cho loạn lưu và cây trái được mùa', () => {
    const cells = createMonopolyBoardCells()
      .filter(cell => cell.track !== 'mini' && cell.track !== 'micro')
      .map(cell => cell.index + 1);
    const baseState = createInitialMonopolyYearEventState();

    const chaos = resolveMonopolyNewYearEvent(1, {
      ...baseState,
      cooldownUntilYearByEvent: {
        drought: 99,
        famine: 99,
        inflation: 99,
        fruit_bounty: 99,
        vitality: 99
      }
    }, cells, () => 0.25);
    expect(chaos.event.id).toBe('spacetime_chaos');
    expect(chaos.nextState.chaosCells).toHaveLength(3);
    expect(new Set(chaos.nextState.chaosCells).size).toBe(3);

    const fruit = resolveMonopolyNewYearEvent(1, {
      ...baseState,
      cooldownUntilYearByEvent: {
        drought: 99,
        famine: 99,
        inflation: 99,
        spacetime_chaos: 99,
        vitality: 99
      }
    }, cells, () => 0.8);
    expect(fruit.event.id).toBe('fruit_bounty');
    expect(fruit.nextState.fruitCells).toHaveLength(5);
    expect(new Set(fruit.nextState.fruitCells).size).toBe(5);
  });
});