import { getLotterySplit, getPityConfig, getShopTaxRate } from './economy.ts';
import { GACHA_CONFIG } from '../screens/ui-gacha/logic/config.ts';

import type {
  LotterySplit,
  MenuSectionDefinition,
  ModeConfig,
  ModeGroup,
  PityConfiguration
} from '@shared-types/config';

const SSR_PITY: PityConfiguration | null = getPityConfig('SSR');
const UR_PITY: PityConfiguration | null = getPityConfig('UR');
const PRIME_PITY: PityConfiguration | null = getPityConfig('PRIME');
const CURRENT_PRIME_BANNER = GACHA_CONFIG.banners.find(({ id }) => id === 'limited-prime') ?? null;
const CURRENT_PRIME_PITY = CURRENT_PRIME_BANNER?.pity.prime ?? null;
const CURRENT_PRIME_SUPPORT_UR_PITY = CURRENT_PRIME_BANNER?.pity.ur ?? null;
const PRIME_BANNER_PITY_SUMMARY = CURRENT_PRIME_PITY
  ? `soft pity Prime từ lượt ${CURRENT_PRIME_PITY.soft}, hard pity Prime ở lượt ${CURRENT_PRIME_PITY.hard}`
  : `hard pity Prime mặc định ${PRIME_PITY?.hardPity || 80} lượt`;
const PRIME_BANNER_SUPPORT_PITY_SUMMARY = CURRENT_PRIME_SUPPORT_UR_PITY
  ? `UR phụ trợ soft từ lượt ${CURRENT_PRIME_SUPPORT_UR_PITY.soft}, hard ở lượt ${CURRENT_PRIME_SUPPORT_UR_PITY.hard}`
  : null;
const LOTTERY_SPLIT: LotterySplit = getLotterySplit();
const BASE_TAX_RATE = getShopTaxRate('N');
const TOP_TAX_RATE = getShopTaxRate('PRIME');
const PVE_SESSION_MODULE_ID = '@modes/pve/session.ts' as const;
const COMING_SOON_MODULE_ID = '@modes/coming-soon.stub.ts' as const;
const LINEUP_SCREEN_MODULE_ID = '@screens/lineup/index.ts' as const;
const COLLECTION_SCREEN_MODULE_ID = '@screens/collection/index.ts' as const;
const GACHA_SCREEN_MODULE_ID = '@screens/ui-gacha/index.ts' as const;
const ARENA_HUB_SCREEN_MODULE_ID = '@screens/arena-hub/index.ts' as const;
const CAMPAIGN_WORLD_MAP_SCREEN_MODULE_ID = '@screens/campaign-world-map/index.ts' as const;
const MONOPOLY_SCREEN_MODULE_ID = '@screens/monopoly/index.ts' as const;
const MONOPOLY_READY_SCREEN_MODULE_ID = '@screens/monopoly/ready.ts' as const;
const CHESS_STRATEGY_RPG_READY_SCREEN_MODULE_ID = '@screens/chess-strategy-rpg/ready.ts' as const;
const CHESS_STRATEGY_RPG_BATTLE_SCREEN_MODULE_ID = '@screens/chess-strategy-rpg/battle.ts' as const;
const CHESS_STRATEGY_RPG_MATCH_SCREEN_MODULE_ID = '@screens/chess-strategy-rpg/match.ts' as const;
const VINH_DA_GAMEPLAY_SCREEN_MODULE_ID = '@screens/vinh-da/gameplay.ts' as const;
const SECT_SCREEN_MODULE_ID = './screens/sect/index.ts' as const;

const MODE_TYPES = {
  PVE: '',
  PVP: 'PvP',
  ECONOMY: 'Kinh tế'
} as const satisfies Readonly<Record<'PVE' | 'PVP' | 'ECONOMY', string>>;

const MODE_STATUS = {
  AVAILABLE: 'available',
  COMING_SOON: 'coming-soon',
  PLANNED: 'planned'
} as const satisfies Readonly<Record<'AVAILABLE' | 'COMING_SOON' | 'PLANNED', string>>;

type ModeStatus = typeof MODE_STATUS[keyof typeof MODE_STATUS];

const MENU_SECTION_DEFINITIONS = [
  { id: 'core-pve', title: '' },
  { id: 'economy', title: '' }
] satisfies ReadonlyArray<MenuSectionDefinition>;

const MODE_GROUPS: ReadonlyArray<ModeGroup> = [];
const SSI_ENGINE_LABEL = 'SSI (Sequential Simultaneous Instant)';
const SSI_ENGINE_SUMMARY = `${SSI_ENGINE_LABEL}: lượt chạy 1A→1B→...→9A→9B, bỏ qua slot trống, cập nhật sát thương/buff tức thời và tạo cảm giác phối hợp theo lane.`;
const withSsiDescription = (base: string): string => `${base} ${SSI_ENGINE_SUMMARY}`;

const MODES = [
  {
    id: 'arena-hub',
    title: 'Chiến Trường',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🏟️',
    shortDescription: 'Tụ điểm tổng hợp các hoạt động chiến đấu luân phiên để người chơi bước vào chiến dịch, thử thách và mùa giải.',
    unlockNotes: 'Cung cấp lối vào nhanh tới chiến dịch, thử thách, đấu trường PvE/PvP và các mùa giải đặc biệt.',
    tags: ['PvE', 'PvP'],
    menuSections: ['core-pve'],
    shell: {
      screenId: 'arena-hub',
      moduleId: ARENA_HUB_SCREEN_MODULE_ID
    }
  },
  {
    id: 'campaign',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🛡️',
    shortDescription: withSsiDescription('PvE cốt truyện trên bản đồ 2D để đi nhiệm vụ, nhặt vật phẩm đột phá và mở khóa kiến trúc tông môn.'),
    unlockNotes: 'Mở từ đầu; tiến trình mở rộng sang hệ tu luyện 15 đại cảnh giới và tái thiết các kiến trúc tông môn.',
    tags: ['PvE'],
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'campaign-world-map',
      moduleId: CAMPAIGN_WORLD_MAP_SCREEN_MODULE_ID,
      defaultParams: { modeKey: 'campaign' }
    }
  },
  {
    id: 'vinh-da',
    title: 'Vĩnh Dạ',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🏰',
    shortDescription: 'World Map phòng thủ thành trì trong màn đêm vĩnh cửu, chọn Leader trước khi vào trận side-scrolling.',
    unlockNotes: 'Mở từ Chiến Trường; dùng World Map riêng và scene Vĩnh Dạ độc lập.',
    tags: ['PvE'],
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'campaign-world-map',
      moduleId: CAMPAIGN_WORLD_MAP_SCREEN_MODULE_ID,
      defaultParams: { modeKey: 'vinh-da' }
    }
  },
  {
    id: 'vinh-da-gameplay',
    title: 'Vĩnh Dạ · Trận Chiến',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🏰',
    shortDescription: 'Prototype gameplay màn hình ngang cho Vĩnh Dạ với Leader di chuyển trái/phải và camera follow.',
    unlockNotes: 'Vào từ Stage trên World Map Vĩnh Dạ.',
    tags: ['PvE'],
    menuSections: [],
    parentId: 'vinh-da',
    shell: {
      screenId: 'vinh-da-gameplay',
      moduleId: VINH_DA_GAMEPLAY_SCREEN_MODULE_ID
    }
  },
  {
    id: 'challenge',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🎯',
    shortDescription: withSsiDescription('Các màn PvE với đội hình cố định cùng phần thưởng đặc biệt dành cho người vượt qua.'),
    unlockNotes: 'Có sẵn để thử sức với các đội hình cố định và nhận phần thưởng thử thách đặc biệt.',
    tags: ['PvE'],
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'pve-session',
      moduleId: PVE_SESSION_MODULE_ID,
      defaultParams: { modeKey: 'challenge' }
    }
  },
  {
    id: 'arena',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🏟️',
    shortDescription: withSsiDescription('Deck PvE đối đầu deck do AI điều khiển, xoay vòng mùa giải 7 ngày với bảng xếp hạng phần thưởng.'),
    unlockNotes: 'Yêu cầu chuẩn bị deck xếp sẵn; tham chiến theo mùa 7 ngày để nhận thưởng và leo bảng.',
    tags: ['PvE'],
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'pve-session',
      moduleId: PVE_SESSION_MODULE_ID,
      defaultParams: { modeKey: 'arena' }
    }
  },
  {
    id: 'ares',
    type: MODE_TYPES.PVP,
    status: MODE_STATUS.COMING_SOON,
    icon: '⚔️',
    shortDescription: 'PvP thời gian thực, hiển thị "Coming soon" cho tới khi hạ tầng networking hoàn tất.',
    unlockNotes: 'Chờ kết nối hệ thống PvP online realtime trước khi mở cho người chơi.',
    tags: ['PvP', 'Coming soon'],
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: COMING_SOON_MODULE_ID
    }
  },
  {
    id: 'tongmon',
    title: 'Tông Môn',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.AVAILABLE,
    icon: '🏯',
    shortDescription: 'Quản lý Trấn Yêu Tháp, Tàng Kinh Các, Đan Phong và Tu Luyện Phòng gắn với kinh tế nguyên tinh.',
    unlockNotes: 'Mở khi người chơi tái thiết tông môn tàn tạ, liên kết tiến trình PvE và dòng nguyên tinh.',
    tags: ['Kinh tế nguyên tinh'],
    menuSections: ['economy'],
    shell: {
      screenId: 'sect',
      moduleId: SECT_SCREEN_MODULE_ID
    }
  },
  {
    id: 'gacha',
    title: 'Gacha',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.AVAILABLE,
    icon: '🎲',
    shortDescription: `Quầy gacha phân tab Nhân Vật, Công Pháp, Vũ Khí, Sủng Thú với bảo hiểm ${SSR_PITY?.hardPity || 60}/${UR_PITY?.hardPity || 70} lượt cho meta SSR/UR; banner Prime hiện hành dùng ${PRIME_BANNER_PITY_SUMMARY}.`,
    unlockNotes: `Banner UR bảo hiểm SSR ở lượt ${UR_PITY?.softGuarantees?.[0]?.pull || 50}; banner Prime hiện hành (${CURRENT_PRIME_BANNER?.label || 'mặc định'}) dùng runtime config limited-prime: ${PRIME_BANNER_PITY_SUMMARY}${PRIME_BANNER_SUPPORT_PITY_SUMMARY ? `; ${PRIME_BANNER_SUPPORT_PITY_SUMMARY}` : ''}.`,
    tags: ['Kinh tế nguyên tinh'],
    menuSections: ['economy'],
    shell: {
      screenId: 'gacha',
      moduleId: GACHA_SCREEN_MODULE_ID
    }
  },
  {
    id: 'lineup',
    title: 'Đội Hình',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.AVAILABLE,
    icon: '🧾',
    shortDescription: 'Quản lý các đội hình đề xuất cho PvE, PvP thử nghiệm và hạ tầng kinh tế.',
    unlockNotes: 'Mở khi người chơi hoàn tất hướng dẫn xây dựng đội hình đầu tiên trong phần Chiến Dịch.',
    tags: ['Kinh tế nguyên tinh'],
    menuSections: ['economy'],
    shell: {
      screenId: 'lineup',
      moduleId: LINEUP_SCREEN_MODULE_ID,
      defaultParams: {
        shortDescription: 'Theo dõi đội hình đề xuất và cấu trúc tổ đội tối ưu cho từng mục tiêu.',
        lineups: [
          {
            id: 'starter-balance',
            title: 'Khởi đầu Cân bằng',
            role: 'PvE cốt truyện',
            description: 'Đội hình 3 DPS linh hoạt kèm 1 hỗ trợ buff và 1 tanker giữ aggro cho các màn đầu.',
            members: []
          }
        ]
      }
    }
  },
  {
    id: 'collection',
    title: 'Bộ Sưu Tập',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.AVAILABLE,
    icon: '📚',
    shortDescription: 'Hiển thị hồ sơ nhân vật, sủng thú, công pháp, rank budget, sao và class từ dữ liệu tổng hợp.',
    unlockNotes: 'Mở khi người chơi bắt đầu thu thập nhân vật và sủng thú để theo dõi tiến trình nâng sao và rank budget.',
    tags: ['Kinh tế nguyên tinh'],
    menuSections: ['economy'],
    shell: {
      screenId: 'collection',
      moduleId: COLLECTION_SCREEN_MODULE_ID
    }
  },
  {
    id: 'market',
    title: 'Chợ Đen & Shop Dev',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '💰',
    shortDescription: `Trao đổi vật phẩm giữa người chơi với thuế theo bậc từ ${Math.round((BASE_TAX_RATE || 0) * 100)}% tới ${Math.round((TOP_TAX_RATE || 0) * 100)}% cùng shop dev bán vật phẩm bằng tiền thật.`,
    unlockNotes: 'Mở khi nền kinh tế ổn định để người chơi giao dịch, đồng thời kích hoạt kênh shop của dev.',
    tags: ['Kinh tế nguyên tinh', 'Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: COMING_SOON_MODULE_ID
    }
  },
  {
    id: 'events',
    title: 'Sự Kiện & Vé Số',
    type: MODE_TYPES.ECONOMY,
    status: MODE_STATUS.COMING_SOON,
    icon: '🎟️',
    shortDescription: 'Event giới hạn thời gian kết hợp vé số dùng tiền tệ trong game với cơ chế chia doanh thu rõ ràng.',
    unlockNotes: `Vé số chuyển ${Math.round((LOTTERY_SPLIT.devVault || 0) * 100)}% cho quỹ vận hành và ${Math.round((LOTTERY_SPLIT.prizePool || 0) * 100)}% vào quỹ giải thưởng, kích hoạt theo lịch sự kiện.`,
    tags: ['Kinh tế nguyên tinh', 'Coming soon'],
    menuSections: ['economy'],
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: COMING_SOON_MODULE_ID
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
      fallbackModuleId: COMING_SOON_MODULE_ID
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
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'main-menu',
      fallbackModuleId: COMING_SOON_MODULE_ID
    }
  },
  {
    id: 'chess-strategy-rpg',
    title: 'Chess Strategy RPG',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '♞',
    shortDescription: 'Mode chiến thuật bàn cờ theo turn với luồng điều hướng riêng; hiện tại dựng hub UI trước khi mở trận.',
    unlockNotes: 'MVP hiện mở màn hình hub riêng để chốt UX/UI và checklist spec trước khi tích hợp gameplay.',
    tags: ['PvE'],
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'chess-strategy-rpg-ready',
      moduleId: CHESS_STRATEGY_RPG_READY_SCREEN_MODULE_ID
    }
  },
  {
    id: 'chess-strategy-rpg-battle',
    title: 'Chess Strategy RPG · Trận Đấu',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '⚔️',
    shortDescription: 'Màn hình chiến đấu chiến thuật gồm 3 hub chọn map, chọn tu vi và khởi tạo bàn cờ bất quy tắc.',
    unlockNotes: 'Bấm nút Tấn Công từ ready screen để mở chọn map/tu vi rồi bắt đầu trận mô phỏng.',
    tags: ['PvE'],
    menuSections: [],
    parentId: 'chess-strategy-rpg',
    shell: {
      screenId: 'chess-strategy-rpg-battle',
      moduleId: CHESS_STRATEGY_RPG_BATTLE_SCREEN_MODULE_ID
    }
  },
  {
    id: 'chess-strategy-rpg-match',
    title: 'Chess Strategy RPG · Trận Chính',
    type: MODE_TYPES.PVE,
    status: MODE_STATUS.AVAILABLE,
    icon: '🧭',
    shortDescription: 'Màn hình trận chính tách riêng khỏi mô phỏng hub, hiển thị bàn cờ lớn với góc nhìn nghiêng.',
    unlockNotes: 'Từ hub giữa, bấm Bắt đầu để mở trận chính theo seed và cảnh giới đã chọn.',
    tags: ['PvE'],
    menuSections: [],
    parentId: 'chess-strategy-rpg',
    shell: {
      screenId: 'chess-strategy-rpg-match',
      moduleId: CHESS_STRATEGY_RPG_MATCH_SCREEN_MODULE_ID
    }
  },

  {
    id: 'co-ty-phu',
    title: 'Cờ Tỷ Phú',
    type: MODE_TYPES.PVP,
    status: MODE_STATUS.AVAILABLE,
    icon: '🎲',
    shortDescription: 'Chế độ cờ theo lượt trong cụm Chiến Trường với bàn 80 ô cho vòng MVP đầu tiên.',
    unlockNotes: 'MVP hiện cho phép vào thẳng bàn cờ để kiểm tra route và bố cục bàn 80 ô.',
    tags: ['PvP'],
    menuSections: ['core-pve'],
    parentId: 'arena-hub',
    shell: {
      screenId: 'co-ty-phu-ready',
      moduleId: MONOPOLY_READY_SCREEN_MODULE_ID
    }
  },
  {
    id: 'co-ty-phu-battle',
    title: 'Cờ Tỷ Phú · Trận Đấu',
    type: MODE_TYPES.PVP,
    status: MODE_STATUS.AVAILABLE,
    icon: '🎲',
    shortDescription: 'Màn hình bàn cờ chính cho chế độ Cờ Tỷ Phú.',
    unlockNotes: 'Đi qua màn hình chuẩn bị và bấm Bắt đầu để vào trận.',
    tags: ['PvP'],
    menuSections: [],
    parentId: 'co-ty-phu',
    shell: {
      screenId: 'co-ty-phu',
      moduleId: MONOPOLY_SCREEN_MODULE_ID
    }
  }
] satisfies ReadonlyArray<ModeConfig>;

const MODE_INDEX: Readonly<Record<string, ModeConfig>> = MODES.reduce<Record<string, ModeConfig>>((acc, mode) => {
  acc[mode.id] = mode;
  return acc;
}, {});

interface ListModesOptions {
  includeStatuses?: ReadonlyArray<ModeStatus>;
}

function hasMenuSection(mode: ModeConfig, sectionId: string): boolean {
  return Array.isArray(mode.menuSections) && mode.menuSections.includes(sectionId);
}

function toIncludedStatusSet(includeStatuses?: ReadonlyArray<ModeStatus>): ReadonlySet<ModeStatus> | null {
  if (!Array.isArray(includeStatuses) || includeStatuses.length === 0) return null;
  return new Set(includeStatuses);
}

function shouldIncludeMode(mode: ModeConfig, includeSet: ReadonlySet<ModeStatus> | null): boolean {
  if (!includeSet) return true;
  return includeSet.has(mode.status);
}

function listModesForSectionWithSet(sectionId: string, includeSet: ReadonlySet<ModeStatus> | null): ModeConfig[] {
  return MODES.filter(mode => {
    return hasMenuSection(mode, sectionId) && shouldIncludeMode(mode, includeSet);
  });
}

function listModesForSection(sectionId: string, options: ListModesOptions = {}): ModeConfig[]{
  return listModesForSectionWithSet(sectionId, toIncludedStatusSet(options.includeStatuses));
}

type MenuSectionEntryDefinition = {
  id: string;
  type: 'group' | 'mode';
  cardId: string;
  childModeIds: ReadonlyArray<string>;
};

function getMenuSections(options: ListModesOptions = {}){
  const includeSet = toIncludedStatusSet(options.includeStatuses);

  const filterChildModeIds = (childIds: ReadonlyArray<string> = []) => {
    return childIds.filter(childId => {
      const mode = MODE_INDEX[childId];
      if (!mode) return false;
      return shouldIncludeMode(mode, includeSet);
    });
  };
  return MENU_SECTION_DEFINITIONS.map(section => {
    const entries: MenuSectionEntryDefinition[] = [];

    MODE_GROUPS.forEach(group => {
      if (!hasMenuSection(group, section.id)) return;
      const childModeIds = filterChildModeIds(group.childModeIds);
      if (childModeIds.length === 0) return;
      entries.push({
        id: group.id,
        type: 'group',
        cardId: group.id,
        childModeIds
      });
    });

    const standaloneModes = listModesForSectionWithSet(section.id, includeSet)
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
   }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

export {
  MODES,
  MODE_GROUPS,
  MODE_TYPES,
  MODE_STATUS,
  MENU_SECTION_DEFINITIONS,
  MODE_INDEX,
  listModesForSection,
  getMenuSections
};