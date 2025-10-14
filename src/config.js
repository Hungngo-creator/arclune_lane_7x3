// config.js v0.7.5
export const CFG = {
  GRID_COLS: 7,
  GRID_ROWS: 3,
  ALLY_COLS: 3,
  ENEMY_COLS: 3,
  COST_CAP: 30,
  SUMMON_LIMIT: 10,
 HAND_SIZE: 4,
FOLLOWUP_CAP_DEFAULT: 2,

  // === AI tuning ===
  AI: {
    WEIGHTS: {
      pressure: 0.42,
      safety: 0.20,
      eta: 0.16,
      summon: 0.08,
      kitInstant: 0.06,
      kitDefense: 0.04,
      kitRevive: 0.04
    },
    ROW_CROWDING_PENALTY: 0.85,
    ROLE: {
      Tanker:   { front: 0.08, back: -0.04 },
      Warrior:  { front: 0.04, back:  0.00 },
      Ranger:   { front:-0.03, back:  0.06 },
      Mage:     { front:-0.02, back:  0.05 },
      Assassin: { front: 0.03, back: -0.03 },
      Support:  { front:-0.02, back:  0.03 },
      Summoner: { front: 0.00, back:  0.04, summonBoost: 0.05 }
    }, DEBUG: { KEEP_TOP: 6 }
  },

  // === UI constants (C2) ===
  UI: {                           // <-- bỏ dấu phẩy ở đầu
    PAD: 12,
    BOARD_MAX_W: 900,
    BOARD_MIN_H: 220,
    BOARD_H_RATIO: 3/7,
    CARD_GAP: 12,
    CARD_MIN: 40
  },                              // <-- thêm dấu phẩy ở đây
// === Debug flags (W0-J1) ===
 DEBUG: {
   SHOW_QUEUED: true,        // vẽ unit "Chờ Lượt" cho phe mình (ally) khi có
   SHOW_QUEUED_ENEMY: false  // kẻ địch không thấy (đúng design)
 },
  COLORS: {
    ally: '#1e2b36',
    enemy: '#2a1c22',
    mid:  '#1c222a',
    line: '#24303c',
    tokenText: '#0d1216'
  },
  SCENE: {
    DEFAULT_THEME: 'daylight',
    CURRENT_THEME: 'daylight',
    THEMES: {
      daylight: {
        sky: {
          top: '#1b2434',
          mid: '#2f455e',
          bottom: '#55759a',
          glow: 'rgba(255, 236, 205, 0.35)'
        },
        horizon: {
          color: '#f4d9ad',
          glow: 'rgba(255, 236, 205, 0.55)',
          height: 0.22,
          thickness: 0.9
        },
        ground: {
          top: '#312724',
          accent: '#3f302c',
          bottom: '#181210',
          highlight: '#6c5344',
          parallax: 0.12,
          topScale: 0.9,
          bottomScale: 1.45
        }
      }
    }
  },

  CAMERA: 'landscape_oblique'
};

// Camera presets (giữ nguyên)
export const CAM = {
  landscape_oblique: { rowGapRatio: 0.62, topScale: 0.80, depthScale: 0.94 },
  portrait_leader45: { rowGapRatio: 0.72, topScale: 0.86, depthScale: 0.96 }
};
// === Token render style ===
export const TOKEN_STYLE = 'chibi'; // 'chibi' | 'disk'

// Proportions cho chibi (tính theo bán kính cơ sở r)
export const CHIBI = {
  // đường đậm hơn + tỉ lệ chibi mập mạp (đầu to, tay chân ngắn)
  line: 3,
  headR: 0.52,   // đầu to hơn
  torso: 0.70,   // thân ngắn hơn
  arm: 0.58,     // tay ngắn hơn
  leg: 0.68,     // chân ngắn hơn
  weapon: 0.78,  // vũ khí ngắn hơn để cân đối
  nameAlpha: 0.7
};
