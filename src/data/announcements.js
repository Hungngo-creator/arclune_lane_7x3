// @ts-check
import { CURRENCY_IDS, convertCurrency, formatBalance, getLotterySplit } from './economy.js';

/** @typedef {import('@types/config').AnnouncementEntry} AnnouncementEntry */
/** @typedef {import('@types/config').AnnouncementSlot} AnnouncementSlot */

/** @type {import('@types/config').LotterySplit} */
const LOTTERY_SPLIT = getLotterySplit();
const LOTTERY_DEV_PERCENT = Math.round((LOTTERY_SPLIT.devVault || 0) * 100);
const LOTTERY_PRIZE_PERCENT = Math.round((LOTTERY_SPLIT.prizePool || 0) * 100);

const TT_CONVERSION_CHAIN = [
  formatBalance(1, CURRENCY_IDS.TT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.THNT), CURRENCY_IDS.THNT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.TNT), CURRENCY_IDS.TNT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.HNT), CURRENCY_IDS.HNT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.VNT), CURRENCY_IDS.VNT)
].join(' = ');

/**
 * @param {AnnouncementEntry | null | undefined} entry
 * @param {Date} now
 */
function isEntryActive(entry, now){
  if (!entry) return false;
  if (!entry.startAt && !entry.endAt) return true;
  const start = entry.startAt ? new Date(entry.startAt) : null;
  const end = entry.endAt ? new Date(entry.endAt) : null;
  if (start && Number.isFinite(start.getTime()) && now < start) return false;
  if (end && Number.isFinite(end.getTime()) && now > end) return false;
  return true;
}

export const SIDE_SLOT_ANNOUNCEMENTS = /** @satisfies ReadonlyArray<AnnouncementSlot> */ ([
  {
    key: 'event',
    label: 'Sự kiện giới hạn',
    entries: [
      {
        id: 'primal-lottery',
        title: 'Chiến dịch Vé số Nguyên Tinh',
        shortDescription: `Mở lại vé số tuần, chia ${LOTTERY_PRIZE_PERCENT}% quỹ thưởng và ${LOTTERY_DEV_PERCENT}% vận hành.`,
        tooltip: 'Hoạt động vé số giới hạn thời gian: người chơi dùng tiền tệ trong game để mua vé; 50% doanh thu quay về ví dev để ổn định kinh tế, 50% tích vào giải thưởng cho cộng đồng.',
        rewardCallout: `Chuỗi quy đổi tham chiếu: ${TT_CONVERSION_CHAIN}.`,
        startAt: null,
        endAt: null,
        translationKey: 'sidebar.events.primalLottery'
      },
      {
        id: 'arena-season',
        title: 'Đấu Trường — Mùa 7 ngày',
        shortDescription: 'Deck vs deck do AI điều khiển, vận hành theo mùa 7 ngày với bảng xếp hạng riêng.',
        tooltip: 'Đấu Trường (PvE deck vs deck) chạy theo chu kỳ 7 ngày: dùng lại logic combat, bổ sung hệ thống phần thưởng và bảng xếp hạng để người chơi tranh hạng.',
        rewardCallout: 'Phần thưởng mùa làm mới mỗi tuần.',
        startAt: '2025-09-08T00:00:00+07:00',
        endAt: '2025-09-14T23:59:59+07:00',
        translationKey: 'sidebar.events.arenaSeason'
      }
    ]
  },
  {
    key: 'achievement',
    label: 'Thành tựu nổi bật',
    entries: [
      {
        id: 'beast-kings',
        title: 'Danh hiệu Thú Vương',
        shortDescription: 'Đạt 500/1000/10000 trận thắng trong một mùa đấu thú trường để nhận Thú Vương, Bách Thú Vương, Vạn Thú Vương.',
        tooltip: 'Chuỗi thành tựu đấu thú trường: Thú Vương (500 trận thắng), Bách Thú Vương (1000 trận), Vạn Thú Vương (10000 trận) trong cùng một mùa.',
        rewardCallout: 'Phần thưởng thành tựu sẽ cập nhật sau bản cân bằng tiền tệ.',
        startAt: null,
        endAt: null,
        translationKey: 'sidebar.achievements.beastKings'
      },
      {
        id: 'gacha-legends',
        title: 'Huyền thoại Gacha',
        shortDescription: 'Kẻ May Mắn và Cha của Kẻ May Mắn yêu cầu chuỗi SSR/UR hi hữu trong 10 lần triệu hồi.',
        tooltip: 'Thành tựu gacha: Kẻ May Mắn nhận 3 SSR trong một lần gacha 10; Cha của Kẻ May Mắn nhận 4 SSR hoặc 2 UR trong một lần gacha 10.',
        rewardCallout: 'Thành tựu tôn vinh vận may tuyệt đối trong banner trạm tiếp tế.',
        startAt: '2025-09-15T00:00:00+07:00',
        endAt: '2025-09-30T23:59:59+07:00',
        translationKey: 'sidebar.achievements.gachaLegends'
      }
    ]
  },
  {
    key: 'ladder',
    label: 'Đấu thú trường',
    entries: [
      {
        id: 'ladder-progress',
        title: 'Thang bậc đấu thú',
        shortDescription: 'Chuỗi thắng 1→186 trận đưa bạn từ Đồng đến Tối Cao; giữ top sẽ chạm Đấu Thần & Đấu Vương.',
        tooltip: 'Thắng liên tục mở khoá bậc: 1/3/6 trận đạt Đồng 1/2/3; 10/14/18 cho Bạc; 23→33 cho Vàng; 39→51 cho Bạch Kim; 58→72 cho Kim Cương; 80→96 cho Bậc Thầy; 105→123 cho Bá Chủ; 133→153 cho Thách Đấu; 164→186 cho Tối Cao. Top 1 giữ mùa đạt Đấu Thần, Top 2-4 đạt Đấu Vương.',
        rewardCallout: 'Mọi bậc đều có thưởng; phần thưởng đặc biệt cho Đấu Thần và Đấu Vương cuối mùa.',
        startAt: null,
        endAt: null,
        translationKey: 'sidebar.ladder.progress'
      },
      {
        id: 'defense-record',
        title: 'Giữ vững Đấu Thần',
        shortDescription: 'Đạt Đấu Thần và phòng thủ 300 lượt tấn công mà không thất bại để ghi dấu “Ngươi thật là ích kỷ a”.',
        tooltip: 'Thành tựu phòng thủ đấu thú trường: chịu 300 lần công kích khi ở rank Đấu Thần nhưng không bị đánh bại để nhận danh hiệu “Ngươi thật là ích kỷ a”.',
        rewardCallout: 'Kể cả phòng thủ cũng được ghi nhận trên bảng danh dự đấu thú.',
        startAt: '2025-10-01T00:00:00+07:00',
        endAt: null,
        translationKey: 'sidebar.ladder.defenseRecord'
      }
    ]
  },
  {
    key: 'community',
    label: 'Chat & xã hội',
    entries: [
      {
        id: 'community-channel',
        title: 'Kênh quân đoàn',
        shortDescription: 'Khung chat realtime + thông báo cộng đồng giúp bạn theo dõi đội hình và lịch sự kiện.',
        tooltip: 'Chat & Xã hội: khung chat realtime kết nối quân đoàn, kết hợp thông báo cộng đồng để hội viên bắt kịp hoạt động.',
        rewardCallout: 'Nhận ping khi đội mở lobby hoặc khi sự kiện đấu thú sắp khóa sổ.',
        startAt: null,
        endAt: null,
        translationKey: 'sidebar.community.channel'
      }
    ]
  }
]);

/**
 * @param {string} slotKey
 * @param {{ now?: Date }} [options]
 * @returns {{ slot: AnnouncementSlot; entry: AnnouncementEntry } | null}
 */
export function selectAnnouncementEntry(slotKey, options = {}){
  const now = options.now instanceof Date ? options.now : new Date();
  const slot = SIDE_SLOT_ANNOUNCEMENTS.find(item => item.key === slotKey);
  if (!slot) return null;
  const entry = slot.entries.find(item => isEntryActive(item, now)) || slot.entries[0] || null;
  if (!entry) return null;
  return { slot, entry };
}

/**
 * @param {{ now?: Date }} [options]
 * @returns {Array<{ key: AnnouncementSlot['key']; label: AnnouncementSlot['label']; entry: AnnouncementEntry | null }>}
 */
export function getAllSidebarAnnouncements(options = {}){
  const now = options.now instanceof Date ? options.now : new Date();
  return SIDE_SLOT_ANNOUNCEMENTS.map(slot => {
    const entry = slot.entries.find(item => isEntryActive(item, now)) || slot.entries[0] || null;
    return {
      key: slot.key,
      label: slot.label,
      entry
    };
  }).filter(item => Boolean(item.entry));
}