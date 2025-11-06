const skillsConfig = [
  {
    unitId: 'phe',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'lifesteal', 'mark'],
      effects: {
        lifesteal: { percentOfDamage: 0.10 },
        applyMark: { id: 'mark_devour', stacks: 1, maxStacks: 3, ttlTurns: 3, refreshOnHit: true }
      },
      description: 'Gây sát thương 100% WIL + ATK lên một mục tiêu, hồi lại 10% lượng sát thương gây ra và đặt 1 tầng Phệ Ấn (tối đa 3 tầng). Mỗi mục tiêu chỉ nhận tối đa 2 Phệ Ấn trong một lượt; đạt 3 tầng sẽ nổ ở đầu lượt của mục tiêu, gây 50% WIL của Phệ. Dấu ấn tự mất nếu 3 lượt không được làm mới.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Song Huyết Cầu',
        type: 'active',
        cost: { aether: 25 },
        tags: ['counts-as-basic', 'multi-hit'],
        hits: 2,
        targets: 'randomEnemies',
        description: 'Phóng hai huyết cầu vào hai kẻ địch ngẫu nhiên. Mỗi hit gây 130% sát thương đòn đánh thường, được tính như đòn đánh thường để kích hoạt hút máu và Phệ Ấn, đồng thời làm mới thời hạn dấu ấn trên mục tiêu trúng đòn nhưng vẫn tôn trọng giới hạn 2 Phệ Ấn mỗi lượt.'
      },
      {
        key: 'skill2',
        name: 'Huyết Chướng',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 2 },
        buffs: [{ stat: 'damageTaken', type: 'multiplier', amount: -0.30 }],
        shields: [{ stat: 'hpRegen', amountPercentMaxHP: 0.15, perTurn: true }],
        description: 'Tạo màn huyết chướng trong 2 lượt: Phệ giảm 30% sát thương phải chịu, nhận hồi phục 15% Máu tối đa mỗi lượt, sát thương gây ra giảm 30% và không thể bị chỉ định bởi đòn đơn mục tiêu. Hiệu ứng duy trì kể cả khi đang bị khống chế.'
      },
      {
        key: 'skill3',
        name: 'Huyết Thệ',
        type: 'active',
        cost: { aether: 35 },
        duration: { turns: 4 },
        links: { maxConcurrent: 1, sharePercent: 0.5 },
        description: 'Liên kết thanh HP với một đồng minh do người chơi chọn trong 4 lượt. 50% sát thương đồng minh phải nhận sẽ chuyển sang Phệ; chỉ duy trì một mối liên kết cùng lúc, liên kết tự hủy nếu mục tiêu rời sân và sát thương chuyển tiếp không thể chuyển lần hai.'
      }
    ],
    ult: {
      name: 'Thiên Mệnh Phệ Nguyên Kinh',
      type: 'ultimate',
      tags: ['aoe', 'hp-drain', 'counts-as-basic'],
      duration: { turns: 2, affectedStat: 'WIL' },
      hpDrain: { percentCurrentHP: 0.08, perBoss: 0.08 },
      damage: { scaleWIL: 0.65, type: 'arcane', unavoidable: true },
      heals: { selfPercentTotalDamage: 0.35, allies: { targets: 2, percentTotalDamage: 0.25 } },
      overhealToShield: { capPercentMaxHP: 0.6 },
      postBuff: { stat: 'WIL', percent: 0.20, turns: 2 },
      marksApplied: { stacks: 1, maxPerTarget: 3 },
      description: 'Hút máu toàn bộ kẻ địch: mỗi mục tiêu mất 8% HP hiện tại + 65% WIL của Phệ (Thuật, không thể né tránh, vẫn chịu kháng). Phần sát thương gây ra hồi cho Phệ 35% và hồi cho hai đồng minh ngẫu nhiên mỗi người 25%; phần vượt trần chuyển thành Giáp Máu tới tối đa +60% Máu tối đa. Sau khi thi triển nhận thêm 20% WIL trong 2 lượt và đặt 1 tầng Phệ Ấn lên các mục tiêu bị hút (giới hạn 2 Phệ Ấn mỗi lượt mỗi mục tiêu).'
    },
    talent: {
      name: 'Phệ Ấn',
      type: 'talent',
      maxStacks: 3,
      explosion: { damageScaleWIL: 0.50, trigger: 'onTurnStartTarget' },
      ttl: { turns: 3, refreshOnApply: true },
      purgeable: false,
      description: 'Mỗi đòn đánh thường/kỹ năng/tuyệt kỹ trúng mục tiêu đặt 1 Phệ Ấn (tối đa 3 cộng dồn, mỗi mục tiêu chỉ nhận 2 Ấn trong một lượt). Khi đạt 3 cộng dồn, Phệ Ấn tự kích nổ ở đầu lượt của mục tiêu, gây sát thương bằng 50% WIL của Phệ. Dấu ấn tồn tại tối đa 3 lượt nếu không được làm mới và không thể bị xoá bỏ, lãng quên hoặc cướp. Chúc Phúc Của Huyết Chủ: khi vào trận nhận thêm 15% Máu tối đa và +50% hồi HP.'
    },
    technique: null,
    notes: [
      'Song Huyết Cầu và mọi hit từ tuyệt kỹ đều được tính như đòn đánh thường để cộng Phệ Ấn và hút máu, vẫn tuân theo giới hạn 2 Phệ Ấn mỗi lượt.',
      'Huyết Thệ chuyển hướng sát thương nhưng Phệ vẫn chịu sát thương nên cần giữ lượng hồi phục luôn sẵn sàng.'
    ]
  },
  {
    unitId: 'kiemtruongda',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'armor-pierce'],
      piercePercent: 0.05,
      description: 'Chém một mục tiêu bằng n% ATK + x% WIL và bỏ qua 5% ARM/RES của mục tiêu. Mỗi nguồn xuyên giáp khác từ bộ kỹ năng sẽ cộng dồn trực tiếp với hiệu ứng này.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Loạn Trảm Dạ Hành',
        type: 'active',
        cost: { aether: 25 },
        hits: 1,
        tags: ['counts-as-basic', 'line-target'],
        targets: 'randomRow',
        description: 'Gây sát thương bằng 150% đòn đánh thường lên một hàng ngang ngẫu nhiên (1-2-3, 4-5-6 hoặc 7-8-9). Được tính là đòn đánh thường, giữ nguyên khả năng xuyên giáp hiện có của Kiếm Trường Dạ.'
      },
      {
        key: 'skill2',
        name: 'Ngũ Kiếm Huyền Ấn',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 'battle' },
        buffs: [
          { id: 'kiem_sinh', effect: 'lifesteal', amountPercentDamage: 0.05 },
          { id: 'kiem_ma', effect: 'pierce', amount: 0.10 },
          { id: 'kiem_tho', effect: 'selfBuff', stats: { ARM: 0.05, RES: 0.05 } },
          { id: 'kiem_hoa', effect: 'damageBonus', amount: 0.05 },
          { id: 'kiem_hu', effect: 'dodge', amount: 0.15 }
        ],
        description: 'Kích hoạt ngẫu nhiên một trong năm trạng thái kiếm cho tới hết trận: Kiếm Sinh (hút máu 5% tổng sát thương gây ra), Kiếm Ma (xuyên thêm 10% ARM/RES), Kiếm Thổ (+5% ARM/RES), Kiếm Hỏa (+5% tổng sát thương), Kiếm Hư (+15% tỉ lệ né đòn đánh thường). Mỗi trận chỉ duy trì một trạng thái và không thể thay đổi.'
      },
      {
        key: 'skill3',
        name: 'Kiếm Ý Tinh Luyện',
        type: 'active',
        cost: { aether: 25 },
        duration: { turns: 3, start: 'nextTurn' },
        buffs: [{ stats: { ATK: 0.23, WIL: 0.23 }, delayTurns: 1 }],
        description: 'Tăng 23% ATK/WIL dựa trên chỉ số hiện tại trong 3 lượt, hiệu lực bắt đầu từ lượt kế tiếp sau khi thi triển. Có thể cộng dồn với các nguồn buff khác.'
      }
    ],
    ult: {
      name: 'Vạn Kiếm Quy Tông',
      type: 'ultimate',
      tags: ['counts-as-basic', 'column'],
      hits: 4,
      piercePercent: 0.30,
      targets: 'columnMid',
      description: 'Phóng thích 4 nhát chém dọc cột giữa hướng Leader địch (ô 2-5-8). Mỗi hit gây 80% sát thương đòn đánh thường (lai vật lý/thuật), xuyên 30% RES và được tính là đòn đánh thường; nếu mục tiêu né đòn đánh thường thì hit tương ứng trượt.'
    },
    talent: {
      name: 'Kiếm Tâm',
      type: 'talent',
      scaling: { stats: { ATK: 0.05, WIL: 0.05 }, basedOn: 'battleStart' },
      description: 'Mỗi lần thi triển tuyệt kỹ thành công, Kiếm Trường Dạ nhận vĩnh viễn +5% ATK và +5% WIL dựa trên chỉ số ban đầu khi vào trận. Hiệu ứng tích lũy không giới hạn, không thể bị xoá hoặc cướp.'
    },
    technique: null,
    notes: [
      'Các hit từ tuyệt kỹ được tính riêng rẽ giúp tận dụng hiệu ứng đòn đánh thường và cộng dồn Xuyên Giáp.',
      'Ngũ Kiếm Huyền Ấn cần hiệu ứng hình ảnh để người chơi nhận biết trạng thái hiện tại.'
    ]
  },
  {
    unitId: 'loithienanh',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      hits: 2,
      tags: ['multi-hit', 'spd-debuff'],
      debuffs: [{ stat: 'SPD', amountPercent: -0.02, maxStacks: 5 }],
      description: 'Ra hai cú đấm liên tiếp vào một mục tiêu: hit đầu gây sát thương bằng n% ATK + x% WIL, hit thứ hai gây thêm 50% sát thương của hit đầu. Mỗi hit giảm 2% SPD của mục tiêu (tối đa 5 cộng dồn) cho tới khi bị xoá.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Lôi Ảnh Tam Kích',
        type: 'active',
        cost: { aether: 25 },
        hits: 3,
        tags: ['counts-as-basic', 'random-target'],
        bonusDamage: { condition: 'targetsAdjacent', amount: 0.10 },
        description: 'Giương tay thu lôi đánh ngẫu nhiên ba kẻ địch, mỗi mục tiêu nhận 110% sát thương đòn đánh thường và được tính như đòn đánh thường. Nếu cả ba mục tiêu đứng liền kề nhau, toàn bộ nhận thêm 10% sát thương.'
      },
      {
        key: 'skill2',
        name: 'Ngũ Lôi Phệ Thân',
        type: 'active',
        cost: { aether: 35 },
        hpTrade: { percentMaxHP: 0.05, lethal: false },
        hits: 5,
        tags: ['random-target'],
        description: 'Thiêu đốt 5% Máu tối đa của bản thân (không thể tự sát) rồi gọi 5 lôi cầu tấn công ngẫu nhiên 5 kẻ địch. Mỗi cầu gây 130% sát thương đòn đánh thường nhưng không được tính là đòn đánh thường.'
      },
      {
        key: 'skill3',
        name: 'Lôi Thể Bách Chiến',
        type: 'active',
        cost: { aether: 30 },
        buffs: [{ stat: 'HP', type: 'percentBase', amount: 0.20 }],
        limitUses: 3,
        lockout: 'battle',
        description: 'Tăng 20% Máu tối đa dựa trên giá trị gốc khi vào trận. Sau 3 lần sử dụng, kỹ năng bị khoá cho tới hết trận.'
      }
    ],
    ult: {
      name: 'Huyết Hồn Lôi Quyết',
      type: 'ultimate',
      tags: ['hp-trade', 'multi-hit', 'counts-as-basic'],
      hits: 3,
      hpTrade: { percentMaxHP: 0.15, lethal: false, minHP: 1 },
      damage: { basePercentMaxHPTarget: 0.07, bossPercent: 0.04, scaleWIL: 0.50, type: 'arcane' },
      debuffs: [{ stat: 'SPD', amountPercent: -0.02, maxStacks: 5 }],
      postBuff: { stat: 'damageTaken', percent: -0.30, turns: 2 },
      duration: { turns: 2 },
      description: 'Thiêu đốt 15% Máu tối đa của bản thân (không làm giảm trần, không thể tự sát, tối thiểu còn 1 HP) rồi gây sát thương Thuật bằng 7% Max HP mục tiêu (4% với boss PvE) + 50% WIL lên 3 kẻ địch ngẫu nhiên. Mỗi hit được tính là đòn đánh thường và cộng thêm 1 tầng giảm 2% SPD (tối đa 5 tầng). Sau khi thi triển, Lôi Thiên Ảnh giảm 30% sát thương phải chịu trong 2 lượt.'
    },
    talent: {
      name: 'Song Thể Lôi Đạo',
      type: 'talent',
      description: 'Khi HP ≥ 50%, Lôi Thiên Ảnh nhận +20% ARM/RES. Khi HP ≤ 49%, chuyển sang +20% WIL/ATK. Hiệu ứng luôn hoạt động, không thể bị xoá hoặc lãng quên.'
    },
    technique: null,
    notes: [
      'Các kỹ năng tiêu hao HP không thể khiến nhân vật tự sát.',
      'Giảm SPD từ đòn đánh thường cũng áp dụng lên các hit của tuyệt kỹ.'
    ]
  },
  {
    unitId: 'laky',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'sleep-setup'],
      debuffs: [{ id: 'me_hoac', stacks: 1, maxStacks: 4, effect: 'sleepTrigger' }],
      description: 'Gây sát thương bằng n% WIL + x% ATK lên một mục tiêu và cộng 1 tầng “Mê Hoặc”. Đạt 4 tầng khiến mục tiêu ngủ trong 1 lượt rồi đặt lại; các tầng không thể bị xoá trước khi kích hoạt.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Mộng Trảo',
        type: 'active',
        cost: { aether: 25 },
        hits: 3,
        tags: ['counts-as-basic', 'random-aoe'],
        description: 'Gây ba đòn tấn công diện rộng ngẫu nhiên, mỗi đòn gây 130% sát thương đòn đánh thường, cộng tầng Mê Hoặc cho các mục tiêu trúng hit.'
      },
      {
        key: 'skill2',
        name: 'Vạn Mộng Trận',
        type: 'active',
        cost: { aether: 35 },
        hits: 5,
        tags: ['counts-as-basic', 'random-aoe'],
        description: 'Gây năm đòn diện rộng ngẫu nhiên, mỗi đòn gây 100% sát thương đòn đánh thường và cộng tầng Mê Hoặc cho từng mục tiêu trúng hit.'
      },
      {
        key: 'skill3',
        name: 'Mộng Giới Hộ Thân',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 3 },
        buffs: [{ stat: 'damageTaken', percent: -0.20 }],
        description: 'Tạo kết giới mộng bảo hộ trong 3 lượt, giảm 20% mọi sát thương phải chịu.'
      }
    ],
    ult: {
      name: 'Đại Mộng Thiên Thu',
      type: 'ultimate',
      tags: ['control', 'sleep'],
      duration: { turns: 2, bossModifier: 0.5 },
      targets: 3,
      description: 'Gây trạng thái Ngủ lên ba kẻ địch ngẫu nhiên trong 2 lượt: mục tiêu không hành động, không thể né/đỡ/parry nhưng vẫn nhận sát thương đầy đủ. Boss PvE chỉ ngủ nửa thời gian (làm tròn xuống).'
    },
    talent: {
      name: 'Mê Mộng Chú',
      type: 'talent',
      buffs: { perSleepingEnemy: { stat: 'RES', percent: 0.02 }, maxStacks: null },
      description: 'Nhận +2% RES cho mỗi kẻ địch đang ngủ. Hiệu ứng cộng dồn không giới hạn, luôn hoạt động và không thể bị xoá.'
    },
    technique: null,
    notes: [
      'Hiệu ứng Mê Hoặc không tự biến mất; sau khi kích hoạt ngủ sẽ đặt lại số tầng về 0.',
      'Có thể hỗ trợ đồng đội khống chế bằng cách chuẩn bị sẵn tầng Mê Hoặc trước khi dùng tuyệt kỹ.'
    ]
  },
  {
    unitId: 'doanminh',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Gây sát thương bằng n% WIL + x% ATK lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Cán Cân Giáng Phạt',
        type: 'active',
        cost: { aether: 20 },
        tags: ['counts-as-basic'],
        description: 'Dùng cán cân nện vào một kẻ địch, gây 150% sát thương đòn đánh thường và được tính như đòn đánh thường.'
      },
      {
        key: 'skill2',
        name: 'Phán Xét Cứu Rỗi',
        type: 'active',
        cost: { aether: 15 },
        heals: { targets: 3, percentMaxHPOfCaster: 0.10 },
        description: 'Hồi phục cho ba đồng minh ngẫu nhiên, mỗi người nhận lượng HP bằng 10% Máu tối đa của Doãn Minh.'
      },
      {
        key: 'skill3',
        name: 'Cân Bằng Sinh Mệnh',
        type: 'active',
        cost: { aether: 15 },
        buffs: [{ stat: 'HP', type: 'percentBase', amount: 0.10 }],
        limitUses: 5,
        description: 'Tăng 10% Máu tối đa của bản thân dựa trên giá trị gốc khi vào trận. Có thể sử dụng tối đa 5 lần trong một trận.'
      }
    ],
    ult: {
      name: 'Cán Cân Công Lý',
      type: 'ultimate',
      tags: ['support', 'hp-redistribute'],
      targets: { allies: 3, excludeLeader: true },
      heals: { leaderPercentMaxHPOfCaster: 0.10 },
      description: 'Chọn ngẫu nhiên ba đồng minh (trừ Leader) còn sống và cân bằng lượng HP của họ về cùng một mức trung bình (không vượt quá Máu tối đa). Đồng thời hồi cho Leader 10% Máu tối đa của Doãn Minh.'
    },
    talent: {
      name: 'Thăng Bình Pháp Lực',
      type: 'talent',
      onSpawn: { teamHealPercentMaxHPOfCaster: 0.05 },
      description: 'Khi ra sân, hồi HP cho toàn bộ đồng minh trên sân bằng 5% Máu tối đa của Doãn Minh.'
    },
    technique: null,
    notes: [
      'Cân bằng HP từ tuyệt kỹ không làm mất phần máu vượt ngưỡng hiện có của các mục tiêu khác.',
      'Nội tại kích hoạt cả khi được triệu hồi lại sau khi rời sân.'
    ]
  },
  {
    unitId: 'kydieu',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Tế Lễ Phản Hồn',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 3 },
        heals: { selfPercentMaxHPPerTurn: 0.08 },
        description: 'Tế lễ hồi nguyên trong 3 lượt: mỗi lượt Kỳ Diêu hồi 8% Máu tối đa của bản thân.'
      },
      {
        key: 'skill2',
        name: 'Thí Thân Hộ Chủ',
        type: 'active',
        cost: { aether: 15 },
        hpTrade: { sacrificeSelf: true },
        reviveDelay: { turns: 4, ragePercent: 0.5, hpPercent: 0.5, aether: 0 },
        buffs: [{ target: 'leader', effect: 'indomitability', stacks: 1 }],
        description: 'Hy sinh bản thân (HP về 0) để ban cho Leader 1 tầng Bất Khuất. Sau 4 lượt, Kỳ Diêu hồi sinh ngẫu nhiên trên sân với 0 Aether, 50% nộ tối đa và 50% HP tối đa; nếu sân kín cô biến mất vĩnh viễn.'
      },
      {
        key: 'skill3',
        name: 'Tế Vũ Tăng Bão',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 4 },
        buffs: [{ stat: 'rageGain', percent: 0.50 }],
        description: 'Tăng 50% tốc độ tích nộ cho bản thân trong 4 lượt.'
      }
    ],
    ult: {
      name: 'Hoàn Hồn Mộ Tặc',
      type: 'ultimate',
      tags: ['revive'],
      revive: { targets: 1, priority: 'recent', hpPercent: 0.15, ragePercent: 0, lockSkillsTurns: 1 },
      description: 'Hồi sinh một đồng minh ngẫu nhiên (ưu tiên người vừa ngã xuống gần nhất). Khi sống lại, mục tiêu nhận tối đa 15% Máu tối đa của chính họ, nộ về 0 và bị khoá kỹ năng trong 1 lượt.'
    },
    talent: {
      name: 'Phục Tế Khôi Minh',
      type: 'talent',
      scaling: { perAction: { ARM: 0.03, RES: 0.03 }, purgeable: false },
      description: 'Mỗi lượt hành động thành công cộng vĩnh viễn +3% ARM và +3% RES. Hiệu ứng không giới hạn cộng dồn và không thể bị xoá hoặc cướp.'
    },
    technique: null,
    notes: [
      'Thí Thân Hộ Chủ có thể kết hợp với nội tại để tích phòng thủ trước khi tự hiến.',
      'Khi hồi sinh do tuyệt kỹ, đồng minh sẽ không được nhận lại Aether và phải chờ 1 lượt mới có thể dùng kỹ năng.'
    ]
  },
  {
    unitId: 'tranquat',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Sai Khiển Tiểu Đệ',
        type: 'active',
        cost: { aether: 15 },
        description: 'Sai khiến tối đa hai tiểu đệ hiện có tấn công một kẻ địch bằng đòn đánh thường của chúng ngay lập tức. Nếu còn ít hơn hai tiểu đệ, chỉ các đơn vị còn lại tham gia.'
      },
      {
        key: 'skill2',
        name: 'Khiên Mộc Dẫn Địch',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 3 },
        buffs: [{ target: 'minions', effect: 'taunt' }],
        description: 'Đặt hiệu ứng Khiêu Khích lên toàn bộ tiểu đệ còn sống trên sân trong 3 lượt, buộc kẻ địch ưu tiên chúng.'
      },
      {
        key: 'skill3',
        name: 'Tăng Cường Tòng Bộc',
        type: 'active',
        cost: { aether: 20 },
        buffs: [{ target: 'futureSummons', inheritBonus: { HP: 0.20, ATK: 0.20, WIL: 0.20 } }],
        limitUses: 5,
        lockout: 'battle',
        description: 'Tăng giới hạn HP/ATK/WIL mà tiểu đệ kế thừa từ Trần Quát thêm 20%. Chỉ áp dụng cho các tiểu đệ được triệu hồi sau khi sử dụng; kỹ năng bị khoá sau 5 lần dùng.'
      }
    ],
    ult: {
      name: 'Gọi Tiểu Đệ',
      type: 'ultimate',
      tags: ['summon'],
      summon: { count: 2, placement: 'adjacentRow', inherit: { HP: 0.5, ATK: 0.5, WIL: 0.5 }, ttlTurns: 4, limit: 2, replace: 'oldest' },
      description: 'Triệu hồi 2 tiểu đệ vào các ô trống lân cận cùng hàng. Mỗi tiểu đệ kế thừa 50% HP/ATK/WIL của Trần Quát (có thể tăng thêm nhờ Tăng Cường Tòng Bộc), tồn tại tối đa 4 lượt hoặc tới khi bị tiêu diệt. Chỉ duy trì tối đa 2 tiểu đệ cùng lúc; triệu hồi mới thay thế tiểu đệ tồn tại lâu nhất. Tiểu đệ không thể hồi sinh.'
    },
    talent: {
      name: 'Đại Ca Đầu Đàn',
      type: 'talent',
      bonuses: { perMinion: { basicDamagePercent: 0.15 }, onMinionDeath: { stats: { ATK: 0.05, WIL: 0.05 }, maxStacks: null } },
      description: 'Mỗi tiểu đệ hiện diện trên sân giúp Trần Quát nhận thêm 15% tổng sát thương đòn đánh thường. Khi một tiểu đệ bị kẻ địch hạ gục, Trần Quát nhận thêm 5% ATK/WIL (mỗi tiểu đệ chỉ cộng một lần).'
    },
    technique: null,
    notes: [
      'Các tiểu đệ được gọi bằng kỹ năng vẫn tuân theo giới hạn 2 đơn vị như trong tuyệt kỹ.',
      'Khi sử dụng Sai Khiển Tiểu Đệ, nếu không còn tiểu đệ nào trên sân thì kỹ năng sẽ không gây hiệu ứng.'
    ]
  },
  {
    unitId: 'linhgac',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Trảm Cảnh Giới',
        type: 'active',
        cost: { aether: 20 },
        tags: ['counts-as-basic'],
        description: 'Gây sát thương bằng 150% đòn đánh thường lên một mục tiêu và được tính như đòn đánh thường.'
      },
      {
        key: 'skill2',
        name: 'Thành Lũy Tạm Thời',
        type: 'active',
        cost: { aether: 15 },
        duration: { turns: 3 },
        buffs: [{ stats: { RES: 0.20, ARM: 0.20 } }],
        description: 'Tăng 20% RES và ARM cho bản thân trong 3 lượt.'
      },
      {
        key: 'skill3',
        name: 'Kiên Cố Trường Kỳ',
        type: 'active',
        cost: { aether: 20 },
        buffs: [{ stats: { RES: 0.05, ARM: 0.05 }, type: 'permanent', thresholdBonus: { hpBelowPercent: 0.30, stats: { RES: 0.15, ARM: 0.15 } } }],
        description: 'Tăng 5% RES/ARM của bản thân cho đến hết trận. Khi HP dưới 30% Max HP, mỗi lần dùng kỹ năng này thay vì 5% sẽ tăng 15% RES/ARM.'
      }
    ],
    ult: {
      name: 'Còi Tăng Tốc',
      type: 'ultimate',
      tags: ['support', 'haste'],
      duration: { turns: 2 },
      buffs: [{ targets: 'self+2allies', stat: 'attackSpeed', percent: 0.20 }],
      bonuses: { selfBasicDamagePercent: 0.05 },
      description: 'Tăng 20% tốc đánh cho bản thân và hai đồng minh ngẫu nhiên trong 2 lượt. Trong thời gian này, đòn đánh thường của Lính Gác gây thêm 5% tổng sát thương.'
    },
    talent: {
      name: 'Cảnh Giới Bất Biến',
      type: 'talent',
      onSpawn: { stats: { AGI: 0.05, ATK: 0.05 } },
      description: 'Khi vào trận nhận ngay +5% AGI và +5% ATK. Hiệu ứng luôn hoạt động trong suốt trận đấu.'
    },
    technique: null,
    notes: [
      'Kiên Cố Trường Kỳ giúp tích lũy phòng thủ cao hơn khi Lính Gác ở ngưỡng máu nguy hiểm.',
      'Còi Tăng Tốc ưu tiên đồng minh ngẫu nhiên; hiệu ứng có thể trùng lặp với các nguồn tăng tốc khác.'
    ]
  }
] as const;

export default skillsConfig;