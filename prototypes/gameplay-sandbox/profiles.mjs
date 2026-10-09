// Experimental numeric profile. Semantic tables below cite merged canon;
// numeric fixtures must never become the authority for future kit design.
export const SOURCE_REF = '0a474a73223246c7d8496629003ec89f36538ff9';
export const PROFILE_VERSION = 'sandbox-v2';
export const AE_BY_CLASS = Object.freeze({ Support: 10, Mage: 7, Summoner: 7, Warrior: 5, Tanker: 5, Ranger: 5, Assassin: 3 });
export const CLASS_BONUS = Object.freeze({
  Assassin: { Mage: .10, Support: .05 }, Mage: { Warrior: .10, Tanker: .05 },
  Tanker: { Assassin: .10, Summoner: .05 }, Warrior: { Tanker: .10, Ranger: .05 },
  Ranger: { Mage: .10, Support: .05 }, Summoner: { Ranger: .10, Warrior: .05 },
  Support: { Summoner: .10, Mage: .05 },
});
export const ELEMENT_COUNTER = Object.freeze({ Fire: ['Metal'], Metal: ['Wood'], Wood: ['Earth'], Earth: ['Lightning'], Lightning: ['Blood'], Blood: ['Water'], Water: ['Fire'], Light: ['Dark'], Dark: ['Light'], Wind: [], Neutral: [] });
// Current legacy catalog values, explicitly provisional here; 01 defines the
// Rank concept/order, not these numeric multipliers. No Rank multiplier on Damage.
export const RANK_MULT = Object.freeze({ N: .8, R: .85, SR: .95, SSR: 1.1, UR: 1.3, Prime: 1.55 });
export const NUMERIC_PROFILE = Object.freeze({
  aeCap: 100, rageMax: 100, ragePerCompletedRoot: 20,
  mitigationConstant: 100, hitChance: .96, maxOpportunities: 400,
});
export const CLASS_STATS = Object.freeze({
  Tanker: { maxHp: 9090.90909090909, atk: 1100, wil: 950, arm: 120, res: 100 },
  Mage: { maxHp: 6500, atk: 700, wil: 1450, arm: 45, res: 90 },
  Warrior: { maxHp: 7600, atk: 1600, wil: 600, arm: 95, res: 45 },
  Support: { maxHp: 8000, atk: 650, wil: 1200, arm: 65, res: 90 },
  Ranger: { maxHp: 6500, atk: 1700, wil: 550, arm: 50, res: 50 },
  Assassin: { maxHp: 6000, atk: 1900, wil: 450, arm: 40, res: 45 },
  Summoner: { maxHp: 6800, atk: 800, wil: 1300, arm: 50, res: 85 },
});

const component = (type, stat, rate) => ({ type, amount: { terms: [{ stat, rate }] } });
const mixed = (rate = 1) => [component('PHYSICAL', 'atk', rate), component('WILL', 'wil', rate)];
// 04 §11.11 / TGT-008: attack owners default independently to retained Slots.
// Selection shape is independent of binding; a selectable Slot is still tauntable.
const single = { relation: 'ENEMY', shape: 'SELECTABLE_SINGLE', binding: 'POSITION' };
const entitySingle = { ...single, binding: 'ENTITY' };
const self = { relation: 'SELF', shape: 'SELF', binding: 'ENTITY' };
const allEnemies = { relation: 'ENEMY', shape: 'ALL', binding: 'POSITION' };
const damage = (components, extra = {}) => ({ op: 'DAMAGE', binding: 'POSITION', recipientCheckpoint: 'PRE_DAMAGE', emptyPolicy: 'MISS', invalidPolicy: 'SKIP', components, ...extra });
const basic = { name: 'Đánh thường', form: 'BASIC', ae: 0, target: single, effects: [damage(mixed())] };

export const KITS = {
  gideon: {
    name: 'Gideon Vale', class: 'Tanker', rank: 'SSR', provenance: 'Gideon Canon R2',
    states: {
      defense: { clock: 'OWNER_OPPORTUNITY_END', laterOpportunities: 2, statMultipliers: { arm: 1.1, res: 1.1 } },
      guard: { clock: 'OWNER_OPPORTUNITY_START', laterOpportunities: 2, tickAt: 1, healRate: .04, recipients: ['SELF', 'ALLIED_LEADER'], targetConstraint: 'SELECTABLE_SINGLE_RECIPIENT_DAMAGE' },
    },
    passive: { checkpoint: 'HOSTILE_EXACT_ACTION_TERMINAL', threshold: .30, comparator: 'STRICT_GT', thresholdBasis: 'ACTION_START_MAX_HP', gainRate: .13, gainBasis: 'LIVE_APPLICATION_MAX_HP', reconciliation: 'PRESERVE_ABSOLUTE_HP', reset: ['HP_ZERO', 'LEAVE_FIELD', 'RETURN_TO_DECK', 'REINCARNATION_ENTRY'] },
    automatic: { checkpoint: 'OWN_NATURAL_COMPLETION_AND_WAITING_COMMITS', afterModeHook: 'AE_ACTION_REGEN_BY_CLASS', minHpRatio: .70, ae: 15, ability: 'skill3', observedFields: ['HP', 'MAX_HP', 'SIDE_AE'], includeFieldInitialization: false },
    abilities: {
      basic,
      skill1: { name: 'Quang Chủ che chở', form: 'SKILL', ae: 20, target: self, effects: [
        { op: 'HEAL', recipient: 'SELF', amount: { terms: [{ stat: 'wil', rate: 1.5 }, { stat: 'atk', rate: 1.2 }] } },
        { op: 'STATE', recipient: 'SELF', family: 'defense' },
      ] },
      skill2: { name: 'Khiên trấn áp', form: 'SKILL', ae: 25, target: single, effects: [damage(mixed()), { op: 'STUN', chance: .15, lostOpportunities: 1 }] },
      skill3: { name: 'Lời thề bảo hộ', form: 'AUTOMATIC', ae: 15, target: self, effects: [{ op: 'STATE', recipient: 'SELF', family: 'guard' }, { op: 'COOLDOWN', laterOpportunities: 1 }] },
      ultimate: { name: 'Quang Chủ giáng lâm', form: 'ULTIMATE', ae: 0, target: single, effects: [
        { op: 'CHILD', ability: 'skill2', waiveAE: true },
        { op: 'CHILD', ability: 'skill3', waiveAE: true },
      ] },
    },
  },
  phanTinh: {
    name: 'Phần Tinh', class: 'Mage', rank: 'SSR', provenance: 'Phần Tinh Canon R2', states: {},
    abilities: {
      // Canon R2 §§3–4 explicitly locks these exact attacks to Entity IDs.
      // Declare each consuming Damage owner too; this is no shared default.
      basic: { ...basic, target: entitySingle, effects: [damage(mixed(), { binding: 'ENTITY' })] },
      skill1: { name: 'Viêm Bạo', form: 'SKILL', ae: 25, hpCostRate: .15, paidDirectMultiplier: 1.4, target: entitySingle, effects: [damage([component('WILL', 'wil', 2)], { binding: 'ENTITY' })] },
      ultimate: { name: 'Tinh Hỏa Liệu Nguyên', form: 'ULTIMATE', ae: 0, hpCostRate: .15, paidDirectMultiplier: 1.4, target: { ...allEnemies, binding: 'ENTITY' }, effects: [damage(mixed(3), { binding: 'ENTITY', convertToTrueBelowTargetHp: .30 })] },
    },
  },
  trainingSupport: {
    name: 'Leader tập luyện', class: 'Support', rank: 'SSR', provenance: 'SYNTHETIC_FIXTURE', states: {},
    abilities: {
      basic,
      skill1: { name: 'Tiếp sức', form: 'SKILL', ae: 20, target: { relation: 'ALLY', shape: 'SELECTABLE_SINGLE', binding: 'ENTITY' }, effects: [{ op: 'HEAL', recipient: 'TARGET', amount: { terms: [{ stat: 'wil', rate: 2.5 }] } }] },
      ultimate: { name: 'Hồi phục đội', form: 'ULTIMATE', ae: 0, target: { relation: 'ALLY', shape: 'ALL', binding: 'ENTITY' }, effects: [{ op: 'HEAL', recipient: 'TARGET', amount: { terms: [{ stat: 'wil', rate: 3 }] } }] },
    },
  },
  trainingWarrior: {
    name: 'Quân tập luyện', class: 'Warrior', rank: 'SSR', provenance: 'SYNTHETIC_FIXTURE', states: {},
    abilities: {
      basic,
      skill1: { name: 'Đòn mạnh', form: 'SKILL', ae: 20, target: single, effects: [damage(mixed(2.5))] },
      skill2: { name: 'Đánh Slot 8', form: 'SKILL', ae: 15, target: { relation: 'ENEMY', shape: 'FIXED_SLOT', binding: 'POSITION', slot: 8 }, effects: [damage(mixed(1.8))] },
      ultimate: { name: 'Quét đội hình', form: 'ULTIMATE', ae: 0, target: allEnemies, effects: [damage(mixed(2.2))] },
    },
  },
};

// Authoring templates must not alias mutable definitions across Characters or
// Ability owners; editing one exact binding must not rewrite another owner.
for (const key of Object.keys(KITS)) {
  KITS[key] = structuredClone(KITS[key]);
  KITS[key].abilities = Object.fromEntries(Object.entries(KITS[key].abilities).map(([id, ability]) => [id, structuredClone(ability)]));
}

export const DEFAULT_OPTIONS = Object.freeze({ seed: 79, startingAE: 35, startingRage: 0, rankEnabled: true, classBonusEnabled: true, elementBonusEnabled: true, trainingRank: 'SSR', trainingClass: 'Warrior', alliedElement: 'Light', enemyElement: 'Dark', hitChance: NUMERIC_PROFILE.hitChance });

export function scenarioUnits(options) {
  return [
    { id: 'a-guard', kit: 'gideon', side: 'A', slot: 1, element: options.alliedElement },
    { id: 'a-mage', kit: 'phanTinh', side: 'A', slot: 3, element: options.alliedElement },
    { id: 'a-leader', kit: 'trainingSupport', side: 'A', slot: 8, leader: true, element: options.alliedElement },
    { id: 'b-guard', kit: 'gideon', side: 'B', slot: 1, element: options.enemyElement },
    { id: 'b-striker', kit: 'trainingWarrior', side: 'B', slot: 3, class: options.trainingClass, rank: options.trainingRank, element: options.enemyElement },
    { id: 'b-leader', kit: 'trainingSupport', side: 'B', slot: 8, leader: true, element: options.enemyElement },
  ];
}
