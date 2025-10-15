import { getUnitArt } from '../../art.js';

export const HERO_DEFAULT_ID = 'leaderA';

const HERO_LIBRARY = {
  leaderA: {
    id: 'leaderA',
    name: 'Uyên',
    title: 'Hộ Độn Tuyến Đầu',
    faction: 'Đoàn Thủ Hộ Lam Quang',
    role: 'Kỵ sĩ phòng tuyến',
    portrait: 'leaderA',
    motto: 'Giữ vững ánh lam, bảo hộ tuyến đầu.',
    hotspots: [
      {
        key: 'sigil',
        label: 'Ấn Tịnh Quang',
        description: 'Điều chỉnh giáp hộ thân – cực kỳ nhạy cảm.',
        cue: 'sensitive',
        type: 'sensitive'
      }
    ],
    dialogues: {
      intro: {
        male: [
          { text: 'Huynh đến đúng lúc, đội trinh sát đang chờ hiệu lệnh.', tone: 'greeting' },
          { text: 'Sương sớm thuận lợi cho một trận phản công, huynh thấy sao?', tone: 'greeting' }
        ],
        female: [
          { text: 'Tỷ về rồi à? Học viện chắc nhớ tỷ lắm.', tone: 'greeting' },
          { text: 'Đại tỷ đến rồi, đội hình lập tức trật tự hơn hẳn.', tone: 'greeting' }
        ],
        neutral: [
          { text: 'Ngày mới, chiến tuyến mới. Ta luôn sẵn sàng.', tone: 'greeting' },
          { text: 'Chúng ta hành quân khi ánh lam còn phủ cả mặt đất.', tone: 'greeting' }
        ]
      },
      hover: {
        male: [
          { text: 'Yên tâm, áo giáp đã được gia cố. Chỉ cần huynh ra hiệu.', tone: 'focus' },
          { text: 'Huynh cứ nói, Uyên sẽ nghe.', tone: 'focus' }
        ],
        female: [
          { text: 'Tỷ định thay đổi đội hình à? Uyên sẽ thích ứng ngay.', tone: 'focus' },
          { text: 'Đừng quên khởi động, tỷ nhé. Giáp lam khá nặng đó.', tone: 'gentle' }
        ],
        neutral: [
          { text: 'Tôi đang nghe chỉ huy. Có nhiệm vụ mới không?', tone: 'focus' }
        ]
      },
      tap: {
        male: [
          { text: 'Cho Uyên tọa độ, huynh sẽ thấy tuyến đầu mở ra.', tone: 'motivate' },
          { text: 'Một mệnh lệnh thôi, huynh.', tone: 'motivate' }
        ],
        female: [
          { text: 'Uyên ổn cả, tỷ cứ tập trung chỉ huy.', tone: 'motivate' },
          { text: 'Chúng ta sẽ thắng gọn, tỷ tin chứ?', tone: 'motivate' }
        ],
        neutral: [
          { text: 'Chỉ cần hiệu lệnh, tôi sẽ dẫn đầu ngay.', tone: 'motivate' },
          { text: 'Cả đội đang nhìn vào chỉ huy đấy.', tone: 'motivate' }
        ]
      },
      sensitive: {
        male: [
          { text: 'Ấy! Đừng chạm vào ấn Tịnh Quang, dễ kích hoạt giáp hộ thân đó!', tone: 'warning' },
          { text: 'Huynh nghịch thế là bộ giáp khóa cứng mất!', tone: 'warning' }
        ],
        female: [
          { text: 'Khoan! Tỷ mà chạm nữa là cơ chế an toàn tự đóng lại đấy!', tone: 'warning' },
          { text: 'Ấn ấy nối trực tiếp với mạch nguyên tinh, nhạy lắm!', tone: 'warning' }
        ],
        neutral: [
          { text: 'Phần ấn điều khiển cực nhạy, xin đừng động vào.', tone: 'warning' },
          { text: 'Chạm mạnh là hệ thống phòng ngự lập tức kích hoạt đấy!', tone: 'warning' }
        ]
      },
      idle: {
        male: [
          { text: 'Bầu trời trong như vậy, chắc chắn là điềm tốt.', tone: 'calm' }
        ],
        female: [
          { text: 'Uyên sẽ kiểm tra lại dây khóa. Tỷ cứ yên tâm.', tone: 'calm' }
        ],
        neutral: [
          { text: 'Một hơi thở sâu trước trận chiến luôn giúp tinh thần vững hơn.', tone: 'calm' }
        ]
      }
    }
  },
  default: {
    id: HERO_DEFAULT_ID,
    name: 'Chiến binh Arclune',
    title: 'Hộ vệ tiền tuyến',
    faction: 'Arclune',
    role: 'Đa năng',
    portrait: HERO_DEFAULT_ID,
    motto: 'Vì ánh sáng Arclune.',
    hotspots: [
      {
        key: 'sigil',
        label: 'Phù hiệu chiến',
        description: 'Điểm neo năng lượng cần tránh va chạm.',
        cue: 'sensitive',
        type: 'sensitive'
      }
    ],
    dialogues: {
      intro: {
        neutral: [
          { text: 'Sẵn sàng cho mọi nhiệm vụ.', tone: 'greeting' }
        ]
      },
      hover: {
        neutral: [
          { text: 'Đợi lệnh từ chỉ huy.', tone: 'focus' }
        ]
      },
      tap: {
        neutral: [
          { text: 'Tiến lên vì Arclune!', tone: 'motivate' }
        ]
      },
      sensitive: {
        neutral: [
          { text: 'Điểm đó nhạy cảm đấy, xin nhẹ tay.', tone: 'warning' }
        ]
      },
      idle: {
        neutral: [
          { text: 'Luôn giữ trạng thái chiến đấu.', tone: 'calm' }
        ]
      }
    }
  }
};

const GENDER_MAP = {
  male: 'male',
  m: 'male',
  nam: 'male',
  anh: 'male',
  huynh: 'male',
  female: 'female',
  f: 'female',
  nu: 'female',
  chi: 'female',
  ty: 'female',
  undefined: 'neutral',
  null: 'neutral'
};

const CUE_LABELS = {
  intro: 'Chào hỏi',
  hover: 'Phản hồi',
  tap: 'Hiệu lệnh',
  sensitive: 'Cảnh báo',
  idle: 'Độc thoại'
};

const CUE_TONES = {
  greeting: 'greeting',
  focus: 'focus',
  gentle: 'gentle',
  motivate: 'motivate',
  warning: 'warning',
  calm: 'calm'
};

const TONE_TO_CUE = {
  intro: 'greeting',
  hover: 'focus',
  tap: 'motivate',
  sensitive: 'warning',
  idle: 'calm'
};

function normalizeGender(value){
  if (typeof value === 'string'){
    const key = value.trim().toLowerCase();
    if (key in GENDER_MAP) return GENDER_MAP[key];
  }
  return 'neutral';
}

function ensureArray(value){
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickLine(pool){
  const list = ensureArray(pool).filter(Boolean);
  if (!list.length) return null;
  const index = Math.floor(Math.random() * list.length);
  const item = list[index];
  if (item && typeof item === 'object'){ return { text: item.text || '', tone: item.tone || null, label: item.label || null }; }
  return { text: String(item || ''), tone: null, label: null };
}

function inferTone(cue){
  return CUE_TONES[cue] || TONE_TO_CUE[cue] || 'calm';
}

function inferLabel(cue){
  return CUE_LABELS[cue] || 'Tương tác';
}

export function getHeroProfile(heroId = HERO_DEFAULT_ID){
  const profile = HERO_LIBRARY[heroId] || HERO_LIBRARY.default;
  const art = getUnitArt(profile.portrait || heroId || HERO_DEFAULT_ID) || null;
  return {
    id: profile.id,
    name: profile.name,
    title: profile.title,
    faction: profile.faction,
    role: profile.role,
    motto: profile.motto,
    portrait: profile.portrait || heroId || HERO_DEFAULT_ID,
    hotspots: (profile.hotspots || []).map(item => ({ ...item })),
    art
  };
}

export function getHeroHotspots(heroId = HERO_DEFAULT_ID){
  const profile = HERO_LIBRARY[heroId] || HERO_LIBRARY.default;
  return (profile.hotspots || []).map(item => ({ ...item }));
}

export function getHeroDialogue(heroId, cue, options = {}){
  const targetCue = cue || 'intro';
  const gender = normalizeGender(options.gender);
  const zone = options.zone || null;
  const profile = HERO_LIBRARY[heroId] || HERO_LIBRARY.default;
  const fallback = HERO_LIBRARY.default;
  const table = profile.dialogues?.[targetCue] || fallback.dialogues?.[targetCue] || null;
  const pool = table ? (table[gender] || table.neutral || table.default || null) : null;
  const picked = pickLine(pool);
  const text = picked?.text?.trim() ? picked.text.trim() : '...';
  const tone = picked?.tone || inferTone(targetCue);
  const label = picked?.label || inferLabel(targetCue);
  return {
    heroId: profile.id,
    cue: targetCue,
    zone,
    text,
    tone,
    label
  };
}

export function listAvailableHeroes(){
  return Object.keys(HERO_LIBRARY).filter(key => key !== 'default');
}
