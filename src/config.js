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

  fury: {
    max: 100,
    ultCost: 100,
    specialMax: {
      loithienanh: { max: 120, ultCost: 110 }
    },
    caps: {
      perTurn: 40,
      perSkill: 30,
      perHit: 20
    },
    gain: {
      turnStart: { amount: 3 },
      dealSingle: { base: 6, crit: 4, kill: 8, targetRatio: 10 },
      dealAoePerTarget: { base: 3, perTarget: 3, crit: 3, kill: 6, targetRatio: 6 },
      damageTaken: { base: 2, selfRatio: 18 }
    },
    drain: {
      perTargetBase: 10,
      perTargetPct: 0.25,
      skillTotalCap: 40
    }
  },

turnOrder: {
    pairScan: [1, 4, 7, 2, 5, 8, 3, 6, 9],
    sides: ['ally', 'enemy']
  },

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
    MAX_DPR: 2.5,
    MAX_PIXEL_AREA: 2_400_000,
    CARD_GAP: 12,
    CARD_MIN: 40
  },
  ANIMATION: {
    turnIntervalMs: 480,
    meleeDurationMs: 1100
  },
// === Debug flags (W0-J1) ===
  DEBUG: {
   SHOW_QUEUED: true,        // vẽ unit "Chờ Lượt" cho phe mình (ally) khi có
   SHOW_QUEUED_ENEMY: false  // kẻ địch không thấy (đúng design)
 },
 PERFORMANCE: {
   LOW_POWER_MODE: false,
    LOW_POWER_DPR: 1.5,
    LOW_POWER_SHADOWS: false,        // true: luôn ưu tiên preset bóng rẻ tiền
    LOW_SHADOW_PRESET: 'off',        // 'off' | 'medium' | 'soft' khi LOW_POWER_SHADOWS bật
    SHADOW_MEDIUM_THRESHOLD: 8,      // ≥ số token này thì giảm blur thay vì tắt hẳn
    SHADOW_DISABLE_THRESHOLD: 10,    // ≥ số token này thì chuyển sang preset rẻ nhất
    MEDIUM_SHADOW_PRESET: 'medium',  // 'medium' | 'soft' | 'off' khi đạt ngưỡng medium
    HIGH_LOAD_SHADOW_PRESET: 'off',  // preset áp dụng khi đạt ngưỡng disable
    SHADOW_HIGH_DPR_CUTOFF: 1.8,     // DPI (dpr) cao hơn ngưỡng sẽ giảm bóng
    HIGH_DPR_SHADOW_PRESET: 'medium' // preset cho màn hình dpr cao
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

CURRENT_BACKGROUND: 'daylight',
  BACKGROUNDS: {
    daylight: {
      props: [
        {
          type: 'stone-obelisk',
          cell: { cx: -0.8, cy: -0.2 },
          offset: { x: -0.35, y: -0.08 },
          scale: 1.02,
          alpha: 0.94
        },
        {
          type: 'stone-obelisk',
          cell: { cx: 6.8, cy: -0.25 },
          offset: { x: 0.32, y: -0.1 },
          scale: 1.02,
          alpha: 0.94,
          flip: -1
        },
        {
          type: 'sun-banner',
          cell: { cx: -1.05, cy: 2.24 },
          depth: 0.15,
          offset: { x: -0.28, y: 0.38 },
          sortBias: 18,
          scale: 1.08,
          alpha: 0.96
        },
        {
          type: 'sun-banner',
          cell: { cx: 7.05, cy: 2.28 },
          depth: 0.15,
          offset: { x: 0.28, y: 0.38 },
          sortBias: 18,
          scale: 1.08,
          alpha: 0.96,
          flip: -1
        }
      ]
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
