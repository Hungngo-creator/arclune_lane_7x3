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
      ratioToBase: 1000,
      description: 'Kho dự trữ cho các kiến trúc tông môn, chế tác pháp khí và banner cao cấp.'
    },
    {
      id: 'ThNT',
      name: 'Thượng Nguyên Tinh',
      shortName: 'Thượng',
      suffix: 'ThNT',
      ratioToBase: 10000,
      description: 'Đơn vị luân chuyển giữa các tông môn, đổi thưởng cao cấp và sự kiện giới hạn.'
    },
    {
      id: 'TT',
      name: 'Thần Tinh',
      shortName: 'Thần',
      suffix: 'TT',
      ratioToBase: 100000,
      description: 'Đơn vị tối thượng cho các giao dịch Prime và quỹ dự trữ chiến lược.'
    }
  ],
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
      hardPity: 80,
      softGuarantees: [
        { tier: 'SSR', pull: 40 },
        { tier: 'UR', pull: 60 }
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
  }
} as const;

export default economyConfig;