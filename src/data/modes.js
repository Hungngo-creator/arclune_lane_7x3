const MODE_TYPES = Object.freeze({
  PVE: 'PvE',
  PVP: 'PvP',
  ECONOMY: 'Kinh tế'
});

const MODE_STATUS = Object.freeze({
  AVAILABLE: 'available',
  COMING_SOON: 'coming-soon',
  PLANNED: 'planned'
});

const MENU_SECTION_DEFINITIONS = [
  { id: 'core-pve', title: 'PvE' },
  { id: 'competitive', title: 'Cạnh tranh' },
  { id: 'economy', title: 'Kinh tế & Hạ tầng' }
];

const MODE_GROUPS = [
  {
    id: 'arena-hub',
    title: 'Đấu Trường',
    shortDescription: 'Lựa chọn giữa đấu trường PvE và PvP, cả hai đều xoay quanh mùa giải 7 ngày với bảng xếp hạng phần thưởng.',
    icon: '🏟️',
    tags: ['PvE', 'PvP'],
    menuSections: ['core-pve', 'competitive'],
    childModeIds: ['arena', 'beast-arena']
  }
];

const MODES = [
  {
    id: 'campaign',
    title: 'Chiến Dịch',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🛡️',
    shortDescription: 'PvE cốt truyện trên bản đồ 2D để đi nhiệm vụ, nhặt vật phẩm đột phá và mở khóa kiến trúc tông môn.',
    unlockNotes: 'Mở từ đầu; tiến trình mở rộng sang hệ tu luyện 15 đại cảnh giới và tái thiết các kiến trúc tông môn.',
    tags: ['PvE'],
    menuSections: ['core-pve'],
    shell: {
      screenId: 'pve-session',
      moduleId: './modes/pve/session.js',
      defaultParams: { modeKey: 'campaign' }
    }
  },
  {
    id: 'challenge',
    title: 'Thử Thách',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🎯',
    shortDescription: 'Các màn PvE với đội hình cố định cùng phần thưởng đặc biệt dành cho người vượt qua.',
    unlockNotes: 'Có sẵn để thử sức với các đội hình cố định và nhận phần thưởng thử thách đặc biệt.',
    tags: ['PvE'],
    menuSections: ['core-pve'],
    shell: {
      screenId: 'pve-session',
      moduleId: './modes/pve/session.js',
      defaultParams: { modeKey: 'challenge' }
    }
  },
  {
    id: 'arena',
    title: 'Đấu Trường',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🏟️',
    shortDescription: 'Deck PvE đối đầu deck do AI điều khiển, xoay vòng mùa giải 7 ngày với bảng xếp hạng phần thưởng.',
    unlockNotes: 'Yêu cầu chuẩn bị deck xếp sẵn; tham chiến theo mùa 7 ngày để nhận thưởng và leo bảng.',
    tags: ['PvE'],
    menuSections: ['core-pve', 'competitive'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'pve-session',
      moduleId: './modes/pve/session.js',
      defaultParams: { modeKey: 'arena' }
    }
  },
  {
    id: 'ares',
    title: 'Ares',
    type: MODE_TYPES.PVP,
    status: MODE_STATUS.COMING_SOON,
    icon: '⚔️',
    shortDescription: 'PvP thời gian thực, hiển thị "Coming soon" cho tới khi hạ tầng networking hoàn tất.',
    unlockNotes: 'Chờ kết nối hệ thống PvP online realtime trước khi mở cho người chơi.',
    tags: ['PvP', 'Coming soon'],
    menuSections: ['competitive'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  },
  {
    id: 'tongmon',
    title: 'Tông Môn',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '🏯',
    shortDescription: 'Quản lý Trấn Yêu Tháp, Tàng Kinh Các, Đan Phong và Tu Luyện Phòng gắn với kinh tế nguyên tinh.',
    unlockNotes: 'Mở khi người chơi tái thiết tông môn tàn tạ, liên kết tiến trình PvE và dòng nguyên tinh.',
    tags: ['Kinh tế nguyên tinh', 'Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  },
  {
    id: 'gacha',
    title: 'Gacha',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '🎲',
    shortDescription: 'Quầy gacha phân tab Nhân Vật, Công Pháp, Vũ Khí, Sủng Thú với pity riêng và chi phí tiền tệ khác nhau.',
    unlockNotes: 'Kích hoạt cùng các banner pity, tiêu tốn những loại tiền tệ và vé gacha tương ứng.',
    tags: ['Kinh tế nguyên tinh', 'Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  },
  {
    id: 'collection',
    title: 'Bộ Sưu Tập',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '📚',
    shortDescription: 'Hiển thị hồ sơ nhân vật, sủng thú, công pháp, rank budget, sao và class từ dữ liệu tổng hợp.',
    unlockNotes: 'Mở khi người chơi bắt đầu thu thập nhân vật và sủng thú để theo dõi tiến trình nâng sao và rank budget.',
    tags: ['Kinh tế nguyên tinh', 'Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  },
  {
    id: 'market',
    title: 'Chợ Đen & Shop Dev',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '💰',
    shortDescription: 'Trao đổi vật phẩm giữa người chơi kèm thuế theo bậc và shop dev bán vật phẩm bằng tiền thật.',
    unlockNotes: 'Mở khi nền kinh tế ổn định để người chơi giao dịch, đồng thời kích hoạt kênh shop của dev.',
    tags: ['Kinh tế nguyên tinh', 'Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  },
  {
    id: 'events',
    title: 'Sự Kiện & Vé Số',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '🎟️',
    shortDescription: 'Event giới hạn thời gian kết hợp vé số dùng tiền tệ trong game, chia thưởng và doanh thu theo tỉ lệ.',
    unlockNotes: 'Kích hoạt theo lịch sự kiện; vé số thu 50% tiền cho dev và 50% đưa vào quỹ giải thưởng.',
    tags: ['Kinh tế nguyên tinh', 'Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  },
  {
    id: 'social',
    title: 'Chat & Xã hội',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '💬',
    shortDescription: 'Khung chat realtime cùng kênh thông báo cộng đồng để người chơi tương tác.',
    unlockNotes: 'Mở khi hệ thống chat realtime hoàn thiện để player trò chuyện và nhận thông báo.',
    tags: ['Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  },
  {
    id: 'beast-arena',
    title: 'Đấu Thú Trường',
    type: MODE_TYPES.PVP,
    status: MODE_STATUS.COMING_SOON,
    icon: '🐾',
    shortDescription: 'Đưa sủng thú chiến đấu tự động để leo hệ thống rank từ Đồng tới Đấu Thần theo số trận thắng.',
    unlockNotes: 'Yêu cầu sở hữu sủng thú và tham gia mùa giải để leo hạng, nhận thưởng ở mọi bậc và phần thưởng đặc biệt cho top.',
    tags: ['PvP', 'Coming soon'],
    menuSections: ['competitive'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: './modes/coming-soon.stub.js'
    }
  }
];

const MODE_INDEX = MODES.reduce((acc, mode) => {
  acc[mode.id] = mode;
  return acc;
}, {});

function getModeById(id){
  return id ? MODE_INDEX[id] || null : null;
}

function listModesByType(type, options = {}){
  const { includeStatuses } = options;
  return MODES.filter(mode => {
    if (type && mode.type !== type) return false;
    if (Array.isArray(includeStatuses) && includeStatuses.length > 0){
      return includeStatuses.includes(mode.status);
    }
    return true;
  });
}

function listModesForSection(sectionId, options = {}){
  const { includeStatuses } = options;
  return MODES.filter(mode => {
    if (!mode.menuSections || !mode.menuSections.includes(sectionId)){
      return false;
    }
    if (Array.isArray(includeStatuses) && includeStatuses.length > 0){
      return includeStatuses.includes(mode.status);
    }
    return true;
  });
}

function getMenuSections(options = {}){
  const { includeStatuses } = options;
  const includeSet = Array.isArray(includeStatuses) && includeStatuses.length > 0
    ? new Set(includeStatuses)
    : null;

  const filterChildModeIds = (childIds = []) => {
    return childIds.filter(childId => {
      const mode = MODE_INDEX[childId];
      if (!mode) return false;
      if (includeSet && !includeSet.has(mode.status)) return false;
      return true;
    });
  };
  return MENU_SECTION_DEFINITIONS.map(section => {
    const entries = [];

    MODE_GROUPS.forEach(group => {
      if (!group.menuSections || !group.menuSections.includes(section.id)) return;
      const childModeIds = filterChildModeIds(group.childModeIds);
      if (childModeIds.length === 0) return;
      entries.push({
        id: group.id,
        type: 'group',
        cardId: group.id,
        childModeIds
      });
    });

    const standaloneModes = listModesForSection(section.id, { includeStatuses })
      .filter(mode => !mode.parentId);

    standaloneModes.forEach(mode => {
      entries.push({
        id: mode.id,
        type: 'mode',
        cardId: mode.id,
        childModeIds: [mode.id]
      });
    });

    if (entries.length === 0) return null;
    
    return {
      id: section.id,
      title: section.title,
      entries
    };
   }).filter(Boolean);
}

export {
  MODES,
  MODE_GROUPS,
  MODE_TYPES,
  MODE_STATUS,
  MENU_SECTION_DEFINITIONS,
  MODE_INDEX,
  getModeById,
  listModesByType,
  listModesForSection,
  getMenuSections
};