const skillsConfig = [
  {
    unitId: 'mong_yem',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'sleep-setup'],
      debuffs: [{ id: 'me_hoac', stacks: 1, maxStacks: 3, purgeable: false }],
      description: 'Tấn công một mục tiêu bằng 100% WIL + ATK và đặt 1 tầng Mê Hoặc (tối đa 3, không thể bị thanh tẩy). Đạt 3 tầng khiến mục tiêu ngủ 1 lượt và đặt lại số tầng.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Huyễn Ảnh Che Màn',
        type: 'active',
        cost: { aether: 30 },
        duration: { turns: 3 },
        buffs: [{ effect: 'dodgeBasic', amount: 0.50 }],
        description: 'Bao phủ bản thân bằng ảo ảnh trong 3 lượt: giảm 50% tỉ lệ bị trúng bởi đòn đánh thường. Không ảnh hưởng tới kỹ năng hay tuyệt kỹ của địch.'
      },
      {
        key: 'skill2',
        name: 'Thụy Ca Tự Miên',
        type: 'active',
        cost: { aether: 35 },
        duration: { turns: 3 },
        selfStatus: { id: 'tu_mien', kind: 'sleep', cannotAct: true },
        buffs: [{ effect: 'damageTaken', amount: -0.50 }],
        stackingBuffs: [{ stats: { ATK: 0.07, WIL: 0.07 }, trigger: 'turnEnd' }],
        description: 'Ru mình vào giấc ngủ trong tối đa 3 lượt: không thể hành động khi ngủ, sát thương nhận vào giảm 50% và mỗi lượt đang ngủ cộng 7% ATK/WIL. Tự thức khi HP ≤ 30% hoặc người chơi hủy thủ công.'
      },
      {
        key: 'skill3',
        name: 'Phá Mộng Tàn Ca',
        type: 'active',
        cost: { aether: 25 },
        tags: ['burst'],
        damage: { multiplier: 1.80 },
        bonusDamage: { perMark: { id: 'me_hoac', amount: 0.20, maxStacks: 3 } },
        pierce: { whenTargetSleeping: { arm: 0.30, res: 0.30 } },
        marks: [{ id: 'me_hoac', stacks: 1, targets: 2, transfer: true }],
        description: 'Gây 180% sát thương đòn đánh thường lên một mục tiêu. Mỗi tầng Mê Hoặc trên mục tiêu tăng 20% sát thương (tối đa +60%). Nếu mục tiêu đang ngủ, bỏ qua 30% ARM/RES và lan 1 tầng Mê Hoặc sang tối đa 2 kẻ địch khác.'
      }
    ],
    ult: {
      name: 'Thế Giới Thứ Hai',
      type: 'ultimate',
      tags: ['field', 'support'],
      duration: { turns: 3 },
      randomBuffs: { allies: 1, enemies: 1 },
      description: 'Kéo toàn bộ chiến trường vào “Thế Giới Thứ Hai” trong 3 lượt: mỗi đồng minh hiện tại và đồng minh vào sân trong thời gian này nhận một buff ngẫu nhiên; mỗi kẻ địch nhận một debuff ngẫu nhiên. Không gây sát thương trực tiếp.'
    },
    talent: {
      name: 'Mê Ca Dẫn Thụy',
      type: 'talent',
      maxStacks: 3,
      sleepOnCap: { turns: 1 },
      purgeable: false,
      description: 'Mọi nguồn sát thương của Mộng Yểm đặt 1 tầng Mê Hoặc (tối đa 3). Đạt 3 tầng khiến mục tiêu ngủ 1 lượt rồi đặt lại về 0 tầng; Mê Hoặc chỉ mất khi ngủ kích hoạt hoặc bị thanh tẩy.'
    },
    technique: null,
    notes: [
      'Mê Hoặc không tự rơi theo thời gian nhưng bị reset mỗi khi ngủ kích hoạt.',
      'Thụy Ca Tự Miên cho phép người chơi chạm hai lần vào thẻ nhân vật ở lượt địch để đánh thức sớm.'
    ]
  },
  {
    unitId: 'chan_nga',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Gây sát thương 100% ATK + WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Liên Ảnh Hồi Tức',
        type: 'active',
        cost: { aether: 30 },
        heals: { selfPercentMaxHP: 0.06, clonePercentMaxHP: 0.04 },
        description: 'Hồi phục 10% Max HP chia làm hai phần: bản thể nhận 6%, clone nhận 4%. Nếu không có clone, chỉ hồi cho bản thể.'
      },
      {
        key: 'skill2',
        name: 'Cộng Lực Ảnh Thân',
        type: 'active',
        cost: { aether: 25 },
        duration: { turns: 3 },
        buffs: [{ stats: { ATK: 0.10, WIL: 0.10 }, targets: 'self+clone' }],
        description: 'Tăng 10% ATK/WIL cho bản thể và clone trong 3 lượt. Tái kích hoạt chỉ làm mới thời gian.'
      },
      {
        key: 'skill3',
        name: 'Quy Nhất Bản Ảnh',
        type: 'active',
        cost: { aether: 40 },
        cooldown: 3,
        requirements: { adjacentClone: true },
        shields: [{ percentMaxHP: 0.50, duration: { turns: 3 } }],
        buffs: [{ stats: { ATK: 0.15, WIL: 0.15 }, duration: { turns: 2 } }],
        description: 'Tiêu biến clone đứng kề để hợp nhất cùng bản thể: nhận khiên bằng 50% Max HP trong 3 lượt và +15% ATK/WIL trong 2 lượt. Không tiêu hao Aether nếu không đáp ứng điều kiện.'
      }
    ],
    ult: {
      name: 'Thứ Hai Chân Thân',
      type: 'ultimate',
      tags: ['summon', 'clone'],
      hpTrade: { percentCurrentHP: 0.50 },
      summon: {
        id: 'chan_nga_clone',
        inheritPercent: 0.85,
        ttl: 6,
        forbiddenSkills: ['Quy Nhất Bản Ảnh'],
        rageLocked: true
      },
      description: 'Chỉ thi triển khi không có clone và HP ≥ 60%. Giảm 50% HP hiện có để triệu hồi “Thứ Hai Chân Thân” với 85% chỉ số hiện tại. Clone tồn tại tối đa 6 lượt, không thể dùng Quy Nhất Bản Ảnh và không tích nộ.'
    },
    talent: {
      name: 'Dự Phòng Chân Thể',
      type: 'talent',
      description: 'Vào trận nhận +10% Max HP (không áp dụng cho clone). Khi bản thể tử vong khi clone còn sống, đoạt xá vào clone, đồng thời chịu trạng thái Linh Mệt 3 lượt (khóa tuyệt kỹ, -50% hồi Aether).'
    },
    technique: null,
    notes: [
      'Clone copy 85% chỉ số tại thời điểm triệu hồi (snapshot buff/debuff).',
      'Nếu không còn ô trống bên phe mình khi cast ult, kỹ năng thất bại và hoàn lại 50% nộ.'
    ]
  },
  {
    unitId: 'ma_ton_diep_lam',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'mark-builder'],
      debuffs: [{ id: 'ma_chung', stacks: 1, purgeable: false }],
      description: 'Gây 100% ATK + WIL lên một mục tiêu và cấy 1 Ma Chủng (không thể bị thanh tẩy, mất sau 3 lượt không được làm mới). Vào trận +10% SPD.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Thôn Chủng Dưỡng Thể',
        type: 'active',
        cost: { aether: 30 },
        consumeMarks: { id: 'ma_chung', scope: 'all' },
        buffs: [{ effect: 'maxHP', amountPerStack: 0.05 }],
        description: 'Thu hồi tất cả Ma Chủng trên chiến trường. Mỗi tầng chuyển thành +5% Max HP tạm thời cho Diệp Lâm.'
      },
      {
        key: 'skill2',
        name: 'Ma Chủ Hiển Thân',
        type: 'active',
        cost: { aether: 25 },
        requirements: { totalMarks: { id: 'ma_chung', amount: 12 } },
        stanceChange: 'ma_chu',
        description: 'Khi tổng Ma Chủng trên chiến trường ≥ 12, thu hồi toàn bộ Ma Chủng trên một mục tiêu để hóa thành Ma Chủ. Khi ở trạng thái Ma Chủ, mất quyền dùng tuyệt kỹ và mỗi Ma Chủng cấy tiếp gây thêm +2% sát thương cuối dạng Thuật.'
      },
      {
        key: 'skill3',
        name: 'Nhiếp Chủng Song Chưởng',
        type: 'active',
        cost: { aether: 25 },
        hits: 2,
        tags: ['counts-as-basic', 'splash'],
        targets: 'markPriority',
        splash: { ratio: 0.70, maxTargets: 2 },
        description: 'Lao đến kẻ địch có Ma Chủng gần nhất và tung hai chưởng liên tiếp, mỗi hit 100% sát thương đòn đánh thường và lan 70% sang tối đa hai kẻ địch lân cận.'
      }
    ],
    ult: {
      name: 'Ma Chủng Phán Quyết',
      type: 'ultimate',
      tags: ['aoe', 'mark-detonation'],
      damage: { percentTargetMaxHPPerStack: 0.05, scaleWIL: 0 },
      debuffs: [{ id: 'fear', turns: 1, thresholdStacks: 2 }, { id: 'bleed', turns: 1, thresholdStacks: 2 }],
      description: 'Kích hoạt toàn bộ Ma Chủng trên kẻ địch, mỗi tầng gây 5% Max HP của mục tiêu dưới dạng sát thương WIL. Với mỗi 2 tầng trên cùng mục tiêu, áp Sợ Hãi và Chảy Máu 1 lượt. Các Ma Chủng được kích hoạt sẽ bị tiêu hao.'
    },
    talent: {
      name: 'Chú Ấn Ma Chủng',
      type: 'talent',
      purgeable: false,
      decay: { turns: 3 },
      description: 'Đánh thường cấy 1 Ma Chủng lên mục tiêu (không giới hạn cộng dồn). Nếu 3 lượt không cấy thêm, toàn bộ Ma Chủng trên mục tiêu đó biến mất.'
    },
    technique: null,
    notes: [
      'Ở trạng thái Ma Chủ, thanh tuyệt kỹ bị khoá cho đến khi trận đấu kết thúc hoặc trạng thái bị gỡ bỏ.',
      'Ma Chủng là dấu không thể bị đánh cắp, chỉ biến mất khi hết hạn hoặc bị kích nổ.'
    ]
  },
  {
    unitId: 'mo_da',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Gây 100% ATK + WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'U Trào Tụ Lực',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 3 },
        buffs: [{ stats: { ATK: 0.10, WIL: 0.10 }, stackLimit: 3 }],
        description: 'Tăng 10% ATK/WIL trong 3 lượt. Có thể cộng dồn tối đa 3 tầng.'
      },
      {
        key: 'skill2',
        name: 'Huyết Tế Cuồng Khí',
        type: 'active',
        cost: { aether: 15 },
        hpTrade: { percentCurrentHP: 0.35, lethal: false },
        duration: { turns: 3 },
        buffs: [{ stats: { ATK: 0.25, WIL: 0.25 }, stackLimit: 2 }],
        description: 'Hiến 35% HP hiện có (không thể tự sát) để nhận +25% ATK/WIL trong 3 lượt. Có thể cộng dồn tối đa 2 lần nếu dùng khi hiệu ứng còn.'
      },
      {
        key: 'skill3',
        name: 'Mộ Vực Trảm',
        type: 'active',
        cost: { aether: 15 },
        tags: ['counts-as-basic'],
        damage: { multiplier: 1.50 },
        description: 'Chém một mục tiêu gây 150% sát thương đòn đánh thường. Được tính như đòn đánh thường.'
      }
    ],
    ult: {
      name: 'Hồn Về Mộ',
      type: 'ultimate',
      tags: ['single-target', 'counts-as-basic'],
      damage: { multiplier: 2.00, piercePercent: { arm: 0.30, res: 0.30 } },
      buffs: [
        { id: 'bat_khuat', turns: 1 },
        { id: 'tan_sat', turns: 2 },
        { effect: 'untargetable', turns: 2, scope: 'singleTarget' }
      ],
      description: 'Gây 200% sát thương hỗn hợp lên một mục tiêu, bỏ qua 30% ARM/RES. Nhận hiệu ứng Bất Khuất + Tàn Sát và không thể bị chỉ định bởi đòn đơn trong 2 lượt kế tiếp.'
    },
    talent: {
      name: 'Dạ Mộ Nhị Cực',
      type: 'talent',
      description: 'Khi HP ≥ 70% nhận +10% WIL; khi HP < 70% chuyển thành +5% ARM/RES. Hiệu ứng luôn hoạt động và không thể bị xoá.'
    },
    technique: null,
    notes: [
      'Các kỹ năng hiến máu của Mộ Dạ không thể khiến nhân vật tự sát (tối thiểu còn 1 HP).',
      'Trong thời gian được buff Tàn Sát, các đòn đánh thường vẫn có thể thực thi dù đang miễn bị chỉ định.'
    ]
  },
  {
    unitId: 'ngao_binh',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'form-scaling'],
      description: 'Tấn công 1 mục tiêu với sát thương lai. Phụ thuộc trạng thái: Ấu Long (cơ bản), Thành Niên +20% sát thương, Trưởng Thành +30% sát thương, Long Thần +40% sát thương và lan thêm 40% lên mục tiêu phụ.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Long Trảo Song Trảm',
        type: 'active',
        cost: { aether: 25 },
        tags: ['counts-as-basic', 'multi-hit'],
        hits: 2,
        description: 'Tung hai đòn chém liên tiếp, mỗi hit gây 100% sát thương đòn đánh thường dựa trên trạng thái hiện tại.'
      },
      {
        key: 'skill2',
        name: 'Long Huyết Phẫn Viêm',
        type: 'active',
        cost: { aether: 25 },
        hpTrade: { percentMaxHP: 0.25, lethal: false },
        duration: { turns: 3 },
        buffs: [{ effect: 'basicDamage', amount: 0.50 }],
        debuffs: [{ stats: { ARM: -0.10, RES: -0.10 }, duration: { turns: 3 } }],
        description: 'Thiêu đốt 25% Max HP của bản thân để tăng 50% sát thương đòn đánh thường trong 3 lượt, đồng thời giảm 10% ARM/RES trong cùng thời gian.'
      },
      {
        key: 'skill3',
        name: 'Long Ảnh Truy Kích',
        type: 'active',
        cost: { aether: 25 },
        damage: { multiplier: 1.40 },
        splash: { ratioByForm: { au_long: 0.30, thanh_nien: 0.40, truong_thanh: 0.50, long_than: 0.60 }, maxTargets: 2 },
        description: 'Lao kích một mục tiêu gây 140% sát thương đòn đánh thường, sau đó lan sát thương phụ thuộc trạng thái lên kẻ đứng kề.'
      }
    ],
    ult: {
      name: 'Tam Chuyển Long Thai',
      type: 'ultimate',
      tags: ['evolution'],
      description: 'Mỗi lần thi triển, Ngao Bính hóa trứng 1 lượt (không thể tấn công, giảm sát thương nhận 40%/50%/60% tùy lần) rồi phá xác nâng trạng thái: Thành Niên → Trưởng Thành → Long Thần. Sau phá xác, đòn đánh thường mạnh hơn, tăng xuyên giáp, giảm sát thương nhận và tăng hồi phục mỗi lượt. Mỗi lần chuyển hóa hoàn tất nhận thêm 15 nộ.'
    },
    talent: {
      name: 'Long Cốt Bất Diệt',
      type: 'talent',
      description: 'Xác định các chỉ số nền cho từng trạng thái: Ấu Long (+2% xuyên, -8% sát thương nhận, +5% AGI, hồi 0.5% Max HP/lượt); Thành Niên (+5% xuyên, -11% sát thương, +10% AGI, hồi 1%); Trưởng Thành (+9% xuyên, -15%, +15% AGI, hồi 1.7%); Long Thần (+14% xuyên, -22%, +20% AGI, hồi 3%).'
    },
    technique: null,
    notes: [
      'Trong lượt Hoá Trứng, Ngao Bính không thể ra đòn nhưng vẫn có thể bị tấn công (đã giảm sát thương theo cấp).',
      'Đòn đánh thường ở trạng thái Long Thần biến thành Long Tức tầm xa và lan 40% sát thương lên các mục tiêu xung quanh.'
    ]
  },
  {
    unitId: 'lau_khac_ma_chu',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'mark-builder'],
      debuffs: [{ id: 'sa_an', stacks: 1, maxStacks: 5, purgeable: false }],
      description: 'Gây 100% ATK + WIL lên một mục tiêu và đặt 1 Sa Ấn (tối đa 5). Đạt 5 tầng khiến mục tiêu bỏ qua lượt kế tiếp rồi đặt lại số tầng.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Hắc Sa Song Chưởng',
        type: 'active',
        cost: { aether: 25 },
        tags: ['counts-as-basic', 'multi-hit'],
        hits: 2,
        targets: 'randomEnemies',
        description: 'Tung hai chưởng vào hai mục tiêu ngẫu nhiên, mỗi hit gây 100% sát thương đòn đánh thường và đặt Sa Ấn.'
      },
      {
        key: 'skill2',
        name: 'Trùng Ấn Lậu Khắc',
        type: 'active',
        cost: { aether: 25 },
        duration: { turns: 3, start: 'nextTurn' },
        buffs: [{ effect: 'extraMarks', id: 'sa_an', amount: 1 }],
        description: 'Trong 3 lượt bắt đầu từ lượt kế, mỗi đòn đánh thường/kỹ năng áp 2 tầng Sa Ấn thay vì 1.'
      },
      {
        key: 'skill3',
        name: 'Tam Luân Tán Chưởng',
        type: 'active',
        cost: { aether: 35 },
        hits: 3,
        targets: 'randomEnemies',
        description: 'Tung ba chưởng liên tiếp vào ba kẻ địch ngẫu nhiên, mỗi hit gây 100% sát thương đòn đánh thường và đặt Sa Ấn.'
      }
    ],
    ult: {
      name: 'Thiên Mệnh Lậu Khắc Ma Kinh',
      type: 'ultimate',
      tags: ['time'],
      description: 'Vận hành Lậu Khắc Ma Sa, thời sa chảy ngẫu nhiên 50% giữa hai kết quả: Nghịch Lưu – đưa toàn bộ phe đồng minh về trạng thái của 1 lượt trước (vị trí, HP, buff/debuff; đơn vị mới triệu hồi trong lượt hiện tại trở về deck và hoàn cost); Thuận Lưu – sau khi ult hoàn tất, mọi đồng minh ngay lập tức thực thi 1 đòn đánh thường.'
    },
    talent: {
      name: 'Lậu Ấn Trói Thời',
      type: 'talent',
      maxStacks: 5,
      skipTurnOnCap: true,
      purgeable: false,
      description: 'Mỗi đòn đánh thường hoặc kỹ năng đặt 1 Sa Ấn lên mục tiêu. Đủ 5 tầng khiến mục tiêu bỏ qua lượt kế tiếp rồi đặt lại Sa Ấn về 0.'
    },
    technique: null,
    notes: [
      'Sa Ấn tồn tại tới hết trận trừ khi bị thanh tẩy hoặc kích hoạt bỏ lượt.',
      'Các đòn đánh thường/kỹ năng có nhiều hit vẫn đếm số tầng riêng cho từng hit.'
    ]
  },
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
  },
  {
    unitId: 'vu_thien',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Vung đinh ba gây sát thương 100% ATK + 100% WIL lên một mục tiêu. Nếu Vũ Thiên đang ở trạng thái Ánh Sáng (kích hoạt bởi kỹ năng hoặc nội tại), hồi lại 10% sát thương gây ra.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Lam Triều Bộc Lực',
        type: 'active',
        cost: { aether: 35 },
        duration: { turns: 1 },
        buffs: [{ stats: { ATK: 0.40, WIL: 0.40 } }],
        description: 'Tăng 40% ATK/WIL trong 1 lượt. Kỹ năng lý tưởng để mở chuỗi burst hoặc phản công khi có trạng thái phản kích.'
      },
      {
        key: 'skill2',
        name: 'Hải Mâu Phá Lãng',
        type: 'active',
        cost: { aether: 25 },
        tags: ['burst'],
        damage: { multiplier: 1.5 },
        description: 'Phóng đinh ba gây 150% sát thương đòn đánh thường lên một kẻ địch rồi thu hồi vũ khí. Được tính là kỹ năng chủ động, không kích hoạt nội tại phản kích.'
      },
      {
        key: 'skill3',
        name: 'Triều Ảnh Hồi Kích',
        type: 'active',
        cost: { aether: 30 },
        duration: { turns: 1 },
        buffs: [{ effect: 'dodgeBasic', amount: 0.25 }],
        counters: [{ chance: 0.25, type: 'basic' }],
        description: 'Kích hoạt trạng thái phản công 1 lượt: mỗi khi bị tấn công có 25% né và phản đòn đánh thường. Nếu Vũ Thiên bị hạ gục, hiệu ứng kết thúc và phải tái kích hoạt.'
      }
    ],
    ult: {
      name: 'Hải Uy Trảm Ngôn',
      type: 'ultimate',
      tags: ['burst', 'silence'],
      damage: { multiplier: 3.0 },
      debuffs: [{ id: 'tram_mac', turns: 1 }],
      buffs: [{ effect: 'adaptive', duration: { turns: 1 } }],
      description: 'Chém một kẻ địch gây 300% sát thương, áp Trầm Mặc 1 lượt và nhận buff Thích Ứng (giảm sát thương, kháng hất tung theo chuẩn hệ thống) trong 1 lượt.'
    },
    talent: {
      name: 'Hải Triều Khai Trận',
      type: 'talent',
      onSpawn: { stats: { ATK: 0.05, WIL: 0.05 } },
      description: 'Khi vào trận lập tức tăng 5% ATK/WIL (không cộng dồn). Buff này mất khi rời trận.'
    },
    technique: null,
    notes: [
      'Triều Ảnh Hồi Kích chỉ phản công khi né thành công hoặc khi bị đánh thường trúng nhưng hệ thống cho phép phản kích (tùy vào thiết lập combat).',
      'VFX đề xuất: dòng nước bao lấy thân thể khi bật phản kích.'
    ]
  },
  {
    unitId: 'anna',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target', 'heal'],
      description: 'Tấn công một mục tiêu gây 100% ATK + 100% WIL, đồng thời hồi 3% Max HP của Anna cho một đồng minh ngẫu nhiên.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Aegis Tụ Linh',
        type: 'active',
        cost: { aether: 20 },
        duration: { turns: 2 },
        buffs: [{ stats: { ARM: 0.20, RES: 0.20 } }],
        description: 'Gây dựng áo giáp linh lực, tăng 20% ARM/RES cho bản thân trong 2 lượt.'
      },
      {
        key: 'skill2',
        name: 'Huyết Tế Vương Tọa',
        type: 'active',
        cost: { aether: 25 },
        requirements: { casterHpPercentMin: 0.70 },
        sacrifices: [{ percentMaxHP: 0.50, target: 'self', transferTo: 'leader' }],
        description: 'Hiến 50% Max HP hiện tại (không giảm Max HP) cho Leader đồng minh. Chỉ thi triển khi HP ≥ 70% Max HP, không chịu ảnh hưởng bởi buff hồi máu của Anna nhưng chịu modifier của người nhận.'
      },
      {
        key: 'skill3',
        name: 'Hỗn Linh Trường Ca',
        type: 'active',
        cost: { aether: 20 },
        tags: ['multi-target'],
        damage: { multiplier: 1.4, targets: 2 },
        description: 'Ngân trường ca hỗn linh, gây sát thương 140% đánh thường lên 2 kẻ địch ngẫu nhiên.'
      }
    ],
    ult: {
      name: 'Thánh Lễ Tái Sinh',
      type: 'ultimate',
      tags: ['team-heal'],
      heals: { percentMaxHP: 0.50, scale: { ATK: 0.20, WIL: 0.20 }, targets: 'allAllies' },
      description: 'Thực hiện nghi thức tái sinh, hồi 50% Max HP cộng thêm 20% ATK/WIL của Anna cho toàn bộ đồng minh.'
    },
    talent: {
      name: 'Ấn Chú Thăng Hoa',
      type: 'talent',
      stacks: 5,
      description: 'Mỗi lần thi triển Ultimate cộng dồn +5% ATK/WIL/Max HP (tối đa 5 tầng). Tầng không tự mất trong trận.'
    },
    technique: null,
    notes: [
      'Huyết Tế Vương Tọa không kích hoạt hiệu ứng “giảm sát thương tự gây” vì được tính như chuyển HP.',
      'Nội tại Ấn Chú Thăng Hoa nên hiển thị số tầng ngay trên khung buff của Anna để tiện theo dõi.'
    ]
  },
  {
    unitId: 'lao_khat_cai',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Đánh gậy vào kẻ địch gây 100% ATK + 100% WIL.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Khất Côn Xuyên Tạng',
        type: 'active',
        cost: { aether: 20 },
        tags: ['pierce'],
        damage: { multiplier: 1.0 },
        pierce: { arm: 0.15, res: 0.15 },
        description: 'Đâm gậy xuyên giáp, gây sát thương tương đương đòn đánh thường và bỏ qua 15% ARM/RES mục tiêu.'
      },
      {
        key: 'skill2',
        name: 'Tam Thập Lục Kế: Tẩu Vi Thượng',
        type: 'active',
        cost: { aether: 25 },
        duration: { turns: null },
        unique: true,
        utility: { evadeTargetedAoEChance: 0.25 },
        description: 'Kích hoạt kế sách chạy là thượng sách: trong phần còn lại của trận, lần đầu chịu kỹ năng AOE chọn mục tiêu sẽ có 25% chạy sang ô đồng minh trống gần nhất (nếu có).'
      },
      {
        key: 'skill3',
        name: 'Loạn Côn Tam Liên',
        type: 'active',
        cost: { aether: 35 },
        tags: ['multi-target'],
        damage: { multiplier: 1.0, hits: 3 },
        pierce: { arm: 0.20, res: 0.20 },
        description: 'Vung gậy hỗn loạn vào 3 kẻ địch ngẫu nhiên, mỗi hit là một đòn đánh thường bỏ qua 20% ARM/RES.'
      }
    ],
    ult: {
      name: 'Nhất Côn Đoạt Mệnh',
      type: 'ultimate',
      tags: ['finisher'],
      damage: { multiplier: 2.5 },
      pierce: { arm: 0.10, res: 0.10 },
      description: 'Dồn lực đánh chí mạng 250% sát thương, xuyên 10% phòng thủ của mục tiêu.'
    },
    talent: {
      name: 'Tạp Dân Tụ Lực',
      type: 'talent',
      description: 'Miễn nhiễm Khiêu Khích và nhận +2% ATK/WIL/AGI cho mỗi đồng minh (trừ Leader) đang hiện diện.'
    },
    technique: null,
    notes: [
      'Tẩu Vi Thượng chỉ xét kỹ năng AOE định vị (line, cone, hình chữ thập...). Với AOE ngẫu nhiên hoặc chiêu mục tiêu đơn không kích hoạt.',
      'Hiển thị buff bị động để người chơi biết đã tiêu hao cơ hội trốn hay chưa.'
    ]
  },
  {
    unitId: 'ai_lan',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Đánh bằng pháp trượng gây 100% ATK + 100% WIL. Ở Ánh Sáng: giảm 5% AGI mục tiêu và hồi 10% sát thương gây ra. Ở Bóng Tối: bỏ qua 10% ARM/RES. Đòn đánh có 2% làm Choáng.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Song Cực Hiến Phúc',
        type: 'active',
        cost: { aether: 25 },
        tags: ['support'],
        usableIn: ['light', 'dark'],
        description: 'Chuyển 20% Max HP cho Leader và 10% Max HP cho một đồng minh ngẫu nhiên (Ái Lân không mất Max HP). Cả hai mục tiêu nhận thêm khiên =10% Max HP của Ái Lân trong 2 lượt.'
      },
      {
        key: 'skill2',
        name: 'D’moreth • Hắc Tế Tam Ấn',
        type: 'active',
        cost: { aether: 25 },
        tags: ['aoe'],
        usableIn: ['dark'],
        damage: { multiplier: 0.7, targets: 3 },
        description: 'Chỉ dùng ở trạng thái Bóng Tối: gây 70% sát thương đánh thường lên 3 kẻ địch ngẫu nhiên, không tính là đòn đánh thường (không kích hoạt on-hit).' 
      },
      {
        key: 'skill3',
        name: 'Thánh Minh Trùng Tụ',
        type: 'active',
        cost: { aether: 20 },
        usableIn: ['light'],
        tags: ['heal'],
        heals: { self: { scale: { ATK: 0.60, WIL: 0.60 } }, randomAlly: { scale: { ATK: 0.60, WIL: 0.60 } } },
        description: 'Chỉ dùng ở trạng thái Ánh Sáng: hồi 60% tổng ATK+WIL cho bản thân và 1 đồng minh ngẫu nhiên.'
      }
    ],
    ult: {
      name: 'Khải Minh / Đọa Ảnh',
      type: 'ultimate',
      tags: ['stance'],
      description: 'Nếu thi triển trong Ánh Sáng: “Khải Minh Thánh Lễ” hồi 30% Max HP + 5% ATK/WIL cho 3 đồng minh ngẫu nhiên. Nếu thi triển trong Bóng Tối: “Đọa Ảnh Tứ Hình” gây 75% sát thương đánh thường lên 4 kẻ địch ngẫu nhiên (không tính là đòn đánh thường).'
    },
    talent: {
      name: 'Thánh Ám Luân Chuyển',
      type: 'talent',
      description: 'Bắt đầu trận ở Ánh Sáng, mỗi lượt tự luân phiên Ánh Sáng ↔ Bóng Tối. Ánh Sáng thêm hồi phục và giảm AGI, Bóng Tối tăng xuyên giáp.'
    },
    technique: null,
    notes: [
      'UI cần hiển thị biểu tượng trạng thái hiện tại để người chơi biết kỹ năng nào khả dụng.',
      'Các kỹ năng kiểm tra stance; nếu điều kiện không đạt cần xám nút và hiện tooltip.'
    ]
  },
  {
    unitId: 'faun',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Tấn công gây 100% ATK + 100% WIL. Thú triệu hồi kế thừa hệ số này khi tấn công.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Dã Linh Hiệp Kích',
        type: 'active',
        cost: { aether: 25 },
        tags: ['chain'],
        description: 'Faun và mọi thú triệu hồi đang tồn tại lần lượt tung một đòn đánh thường ngay lập tức, không tiêu lượt hiện tại.'
      },
      {
        key: 'skill2',
        name: 'Ấn Khế Cường Thừa',
        type: 'active',
        cost: { aether: 25 },
        tags: ['buff'],
        description: 'Đánh dấu 5 lần triệu hồi tiếp theo từ Ultimate để mỗi thú nhận 80% chỉ số của Faun (thay vì 50%).'
      },
      {
        key: 'skill3',
        name: 'Thú Tế Hộ Mệnh',
        type: 'active',
        cost: { aether: 25 },
        tags: ['heal', 'defense'],
        heals: { selfPercentMaxHP: 0.07 },
        description: 'Hồi 7% Max HP và nhận 1 lớp Bất Khuất. Khi lớp Bất Khuất kích hoạt, hy sinh thú có HP thấp nhất (ưu tiên thú được đánh dấu bởi kỹ năng này) và chặn sát thương.'
      }
    ],
    ult: {
      name: 'Lâm Uyên Triệu Dã',
      type: 'ultimate',
      tags: ['summon'],
      description: 'Triệu hồi ngẫu nhiên 1 trong 5 thú (Tiểu Hắc, Tiểu Bạch, Tiểu Hoàng, Tiểu Bất Điểm, Nhị Cẩu). Mỗi thú tồn tại tối đa 5 lượt, không trùng lặp, với hiệu ứng riêng: xuyên giáp, tăng sát thương, chết hồi máu cho Faun, hồi máu cho thú khác, hoặc hỗ trợ khiêu khích + hồi máu định kỳ.'
    },
    talent: {
      name: 'Vạn Thú Đồng Hưởng',
      type: 'talent',
      description: 'Mỗi thú đồng minh trên sân tăng 3% mọi chỉ số cho Faun (tối đa 5 tầng). Đồng thời giảm 20% sát thương nhận từ thú thuộc Faun.'
    },
    technique: null,
    notes: [
      'Thanh nộ tối đa chỉ 85; nhớ cập nhật UI fury bar.',
      'Khi hy sinh thú bởi Thú Tế Hộ Mệnh, cần thông báo trong log để người chơi hiểu vì sao thú biến mất.'
    ]
  },
  {
    unitId: 'basil_thorne',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      tags: ['single-target'],
      description: 'Đâm gai gây 100% ATK + 100% WIL lên 1 mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Chiết Luyện Độc Tích',
        type: 'active',
        cost: { aether: 30 },
        tags: ['self-buff'],
        description: 'Tính tổng số stack Độc trên toàn sân, mỗi stack chuyển thành +1,5% Max HP tạm thời cho Basil rồi xóa toàn bộ Độc khỏi địch.'
      },
      {
        key: 'skill2',
        name: 'Khế Ước Gai Huyết',
        type: 'active',
        cost: { aether: 25 },
        duration: { turns: 2 },
        tags: ['reflect'],
        description: 'Giảm 10% Max HP (thật) để nhận hiệu ứng phản sát thương trong 2 lượt. Lượng HP mất không được khiên ngăn chặn.'
      },
      {
        key: 'skill3',
        name: 'Song Tiêm Trảm',
        type: 'active',
        cost: { aether: 20 },
        tags: ['multi-hit'],
        damage: { multiplier: 1.0, hits: 2 },
        description: 'Đâm hai lần liên tiếp vào một mục tiêu, mỗi hit là đòn đánh thường.'
      }
    ],
    ult: {
      name: 'Pháo Đài Gai Đen',
      type: 'ultimate',
      tags: ['taunt', 'defense'],
      duration: { turns: 2 },
      description: 'Bao phủ cơ thể bằng gai đen: nhận Khiêu Khích 2 lượt và tăng 20% ARM/RES trong thời gian đó.'
    },
    talent: {
      name: 'Gai Độc',
      type: 'talent',
      description: 'Khi bị tấn công, kẻ gây sát thương nhận 1 stack Độc (tối đa 10 stack/mục tiêu, 1 lần mỗi lượt/mỗi nguồn). Độc có thể bị thanh tẩy.'
    },
    technique: null,
    notes: [
      'Nội tại áp Độc nên hiển thị số stack trên mục tiêu để người chơi nhận biết.',
      'Khế Ước Gai Huyết khiến Basil mất Max HP ngay khi dùng, cần hiển thị thông báo rõ ràng.'
    ]
  }
] as const;

export default skillsConfig;