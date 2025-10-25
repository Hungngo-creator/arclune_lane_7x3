const rosterPreviewConfig = {
  tpDelta: {
    HP: 20,
    ATK: 1,
    WIL: 1,
    ARM: 0.01,
    RES: 0.01,
    AGI: 1,
    PER: 1,
    AEmax: 10,
    AEregen: 0.5,
    HPregen: 2
  },
  statOrder: [
    'HP',
    'ATK',
    'WIL',
    'ARM',
    'RES',
    'AGI',
    'PER',
    'SPD',
    'AEmax',
    'AEregen',
    'HPregen'
  ],
  precision: {
    ARM: 100,
    RES: 100,
    SPD: 100,
    AEregen: 10
  }
} as const;

export default rosterPreviewConfig;