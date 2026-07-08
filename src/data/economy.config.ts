//home (termux)/arclune_lane_7x3/src/data/economy.config.ts

const economyConfig = {
  currencies: [
    {
      id: 'VNT',
      name: 'Vụn Nguyên Tinh',
      shortName: 'Vụn',
      suffix: 'VNT',
      ratioToBase: 1,
      description: 'Đơn vị nhỏ nhất, rơi ra từ tinh thể vỡ và hoạt động hằng ngày.'
    },
    {
      id: 'HNT',
      name: 'Hạ Nguyên Tinh',
      shortName: 'Hạ',
      suffix: 'HNT',
      ratioToBase: 100,
      description: 'Tinh thể đã tinh luyện, dùng cho giao dịch phổ thông và vé gacha thường.'
    },
    {
      id: 'TNT',
      name: 'Trung Nguyên Tinh',
      shortName: 'Trung',
      suffix: 'TNT',
      ratioToBase: 10000,
      description: 'Kho dự trữ cho các kiến trúc tông môn, chế tác pháp khí và banner cao cấp.'
    },
    {
      id: 'ThNT',
      name: 'Thượng Nguyên Tinh',
      shortName: 'Thượng',
      suffix: 'ThNT',
      ratioToBase: 1000000,
      description: 'Tiền chính cho Prime banner, dùng trực tiếp cho lượt quay Prime và đổi thưởng cao cấp.'
    },
    {
      id: 'TT',
      name: 'Thần Tinh',
      shortName: 'Thần',
      suffix: 'TT',
      ratioToBase: 100000000,
      description: 'Tài nguyên tối thượng/chiến lược. Có thể đổi xuống ThNT khi người chơi xác nhận, nhưng không tự động tiêu cho roll; công dụng Nghịch Phản Tiên Thiên/Axiom là dự kiến hoặc khóa sau hệ thống upgrade.'
    }
  ],
  cultivation: {
    realms: {
      1: {
        name: 'Khai Nguyên',
        specialSubRealmCount: 9,
        subRealmCosts: [
          200,
          280,
          380,
          500,
          650,
          830,
          1040,
          1280,
          1550
        ],
        breakthroughCost: 2200
      },
      2: {
        name: 'Trúc Cơ',
        specialSubRealmCount: 9,
        subRealmCosts: [
          300,
          450,
          700,
          1050,
          1450,
          1900,
          2400,
          2950,
          3550
        ],
        breakthroughCost: 4800
      },
      3: {
        name: 'Kết Đan',
        specialSubRealmCount: 9,
        subRealmCosts: [
          4200,
          5000,
          5900,
          6900,
          8000,
          9200,
          10500,
          11900,
          13400
        ],
        breakthroughCost: 16800
      },
      4: {
        name: 'Ngưng Đan',
        specialSubRealmCount: 9,
        subRealmCosts: [
          15000,
          16800,
          18700,
          20700,
          22800,
          25000,
          27300,
          29700,
          32200
        ],
        breakthroughCost: 42000
      },
      5: {
        name: 'Đúc Phách',
        specialSubRealmCount: 7,
        subRealmCosts: [
          36000,
          40500,
          45500,
          51000,
          57000,
          63500,
          70500
        ],
        breakthroughCost: 92000
      },
      6: {
        name: 'Luyện Hồn',
        specialSubRealmCount: 3,
        subRealmCosts: [
          98000,
          122000,
          151000
        ],
        breakthroughCost: 210000
      },
      7: {
        name: 'Thánh Nhân',
        specialSubRealmCount: 9,
        subRealmCosts: [
          165000,
          182000,
          200000,
          219000,
          239000,
          260000,
          282000,
          305000,
          329000
        ],
        breakthroughCost: 420000
      },
      8: {
        name: 'Thánh Hoàng',
        specialSubRealmCount: 9,
        subRealmCosts: [
          360000,
          388000,
          417000,
          447000,
          478000,
          510000,
          543000,
          577000,
          612000
        ],
        breakthroughCost: 760000
      },
      9: {
        name: 'Thánh Tôn',
        specialSubRealmCount: 9,
        subRealmCosts: [
          650000,
          690000,
          731000,
          773000,
          816000,
          860000,
          905000,
          951000,
          998000
        ],
        breakthroughCost: 1200000
      }
    }
  },
  pityConfig: {
    SSR: {
      tier: 'SSR',
      hardPity: 60,
      softGuarantees: []
    },
    UR: {
      tier: 'UR',
      hardPity: 70,
      softGuarantees: [
        { tier: 'SSR', pull: 50 }
      ]
    },
    PRIME: {
      tier: 'PRIME',
      hardPity: 120,
      softGuarantees: [
        { tier: 'UR', pull: 90 },
        { tier: 'PRIME', pull: 91 }
      ]
    }
  },
  shopTaxBrackets: [
    { rank: 'N', label: 'Phổ thông (N)', rate: 0.05 },
    { rank: 'R', label: 'Hiếm (R)', rate: 0.08 },
    { rank: 'SR', label: 'Siêu hiếm (SR)', rate: 0.1 },
    { rank: 'SSR', label: 'Cực hiếm (SSR)', rate: 0.12 },
    { rank: 'UR', label: 'Siêu thực (UR)', rate: 0.15 },
    { rank: 'PRIME', label: 'Tối thượng (Prime)', rate: 0.18 }
  ],
  lotterySplit: {
    devVault: 0.5,
    prizePool: 0.5
  },
  initialWallet: {
    VNT: 125_000,
    HNT: 5_200,
    TNT: 620,
    ThNT: 120,
    TT: 68
  }
} as const;

export default economyConfig;