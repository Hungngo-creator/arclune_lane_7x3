import { normalizeClassName, normalizeElementKey, type ElementKey } from '../utils/domain-normalization.ts';

const ELEMENT_CYCLE = ['fire', 'metal', 'wood', 'earth', 'lightning', 'blood', 'water'] as const;
const ELEMENT_BONUS = 0.1;
const SYNERGY_BONUS = 0.05;

type BonusMap = Readonly<Record<string, number>>;

const CLASS_BONUS_MAP: Readonly<Record<string, BonusMap>> = {
  Assassin: { Mage: 0.1, Support: 0.05 },
  Mage: { Warrior: 0.1, Tanker: 0.05 },
  Tanker: { Assassin: 0.1, Summoner: 0.05 },
  Warrior: { Tanker: 0.1, Ranger: 0.05 },
  Ranger: { Mage: 0.1, Support: 0.05 },
  Summoner: { Ranger: 0.1, Warrior: 0.05 },
  Support: { Summoner: 0.1, Mage: 0.05 },
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
};

const readRecordElement = (record: Record<string, unknown> | null): ElementKey | null => {
  if (!record) return null;
  const metadata = asRecord(record.metadata);
  const meta = asRecord(record.meta);
  return (
    normalizeElementKey(record.base_element)
    ?? normalizeElementKey(record.baseElement)
    ?? normalizeElementKey(record.element)
    ?? normalizeElementKey(record.nguyen_to)
    ?? normalizeElementKey(record.nguyenTo)
    ?? normalizeElementKey(record.he)
    ?? normalizeElementKey(metadata?.base_element)
    ?? normalizeElementKey(metadata?.baseElement)
    ?? normalizeElementKey(metadata?.element)
    ?? normalizeElementKey(meta?.base_element)
    ?? normalizeElementKey(meta?.baseElement)
    ?? normalizeElementKey(meta?.element)
    ?? null
  );
};

const readBaseElement = (value: unknown): ElementKey => {
  const direct = normalizeElementKey(value);
  if (direct) return direct;
  return readRecordElement(asRecord(value)) ?? 'neutral';
};

const readSkillElement = (skill: unknown): ElementKey | null => {
  const record = asRecord(skill);
  if (!record) return normalizeElementKey(skill);
  const metadata = asRecord(record.metadata);
  const meta = asRecord(record.meta);
  const payload = asRecord(record.payload);

  const fromField = (
    normalizeElementKey(record.element)
    ?? normalizeElementKey(record.skill_element)
    ?? normalizeElementKey(record.skillElement)
    ?? normalizeElementKey(metadata?.element)
    ?? normalizeElementKey(meta?.element)
    ?? normalizeElementKey(payload?.element)
  );
  if (fromField) return fromField;

  const tags = [record.tags, metadata?.tags, meta?.tags]
    .find((entry) => Array.isArray(entry));
  if (!Array.isArray(tags)) return null;

  for (const tag of tags) {
    if (typeof tag !== 'string') continue;
    const trimmed = tag.trim().toLowerCase();
    const direct = normalizeElementKey(trimmed);
    if (direct) return direct;
    const prefixed = normalizeElementKey(trimmed.replace(/^element[:_-]/, ''));
    if (prefixed) return prefixed;
  }

  return null;
};

const readClass = (value: unknown): ReturnType<typeof normalizeClassName> => {
  const direct = normalizeClassName(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return null;
  const metadata = asRecord(record.metadata);
  return (
    normalizeClassName(record.class)
    ?? normalizeClassName(record.className)
    ?? normalizeClassName(metadata?.class)
    ?? normalizeClassName(metadata?.className)
    ?? null
  );
};

export function resolveAttackerElement(attacker: unknown, skill?: unknown): ElementKey {
  return readSkillElement(skill) ?? readBaseElement(attacker);
}

export function resolveDefenderElement(defender: unknown): ElementKey {
  return readBaseElement(defender);
}

export function getElementBonus(attackerElement: unknown, defenderElement: unknown): number {
  const attacker = readBaseElement(attackerElement);
  const defender = readBaseElement(defenderElement);
  if (attacker === 'neutral' || defender === 'neutral') return 0;

  if ((attacker === 'light' && defender === 'dark') || (attacker === 'dark' && defender === 'light')) {
    return ELEMENT_BONUS;
  }

  if (attacker === 'wind' || defender === 'wind') return 0;

  const attackerIndex = ELEMENT_CYCLE.indexOf(attacker as (typeof ELEMENT_CYCLE)[number]);
  const defenderIndex = ELEMENT_CYCLE.indexOf(defender as (typeof ELEMENT_CYCLE)[number]);
  if (attackerIndex < 0 || defenderIndex < 0) return 0;

  const expectedDefenderIndex = (attackerIndex + 1) % ELEMENT_CYCLE.length;
  return defenderIndex === expectedDefenderIndex ? ELEMENT_BONUS : 0;
}

export function getClassBonus(attackerClass: unknown, defenderClass: unknown): number {
  const attacker = readClass(attackerClass);
  const defender = readClass(defenderClass);
  if (!attacker || !defender) return 0;
  return CLASS_BONUS_MAP[attacker]?.[defender] ?? 0;
}

export type SynergyContext = {
  skill?: unknown;
  canApplyBurn?: boolean | null;
  synergyMode?: 'damage' | 'burn' | 'auto' | null;
};

export function getSynergyBonus(attacker: unknown, sideUnits: unknown, context?: SynergyContext | null): number {
  const mode = context?.synergyMode ?? 'auto';
  if (mode === 'damage') return 0;
  if (mode === 'burn' && context?.canApplyBurn === false) return 0;

  const attackerElement = resolveAttackerElement(attacker, context?.skill);
  if (attackerElement !== 'fire') return 0;

  const lineup = Array.isArray(sideUnits) ? sideUnits : [];
  if (lineup.length === 0) return 0;

  let hasWind = false;
  let hasFire = false;
  for (const unit of lineup) {
    const unitRecord = asRecord(unit);
    const alive = unitRecord?.alive;
    if (alive === false) continue;
    const element = readBaseElement(unit);
    if (element === 'wind') hasWind = true;
    if (element === 'fire') hasFire = true;
    if (hasWind && hasFire) return SYNERGY_BONUS;
  }

  return 0;
}

export type CounterBonusMetadata = {
  classBonus: number;
  elementBonus: number;
  synergyBonus: number;
  totalBonus: number;
};

export function getCounterBonusMetadata(
  attacker: unknown,
  defender: unknown,
  sideUnits?: unknown,
  context?: SynergyContext | null,
): CounterBonusMetadata {
  const classBonus = getClassBonus(attacker, defender);
  const attackerElement = resolveAttackerElement(attacker, context?.skill);
  const defenderElement = resolveDefenderElement(defender);
  const elementBonus = getElementBonus(attackerElement, defenderElement);
  const synergyBonus = getSynergyBonus(attacker, sideUnits, context);

  return {
    classBonus,
    elementBonus,
    synergyBonus,
    totalBonus: classBonus + elementBonus + synergyBonus,
  };
}
