import { normalizeClassName, normalizeElementKey } from '../utils/domain-normalization.ts';

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

const readElement = (value: unknown): ReturnType<typeof normalizeElementKey> => {
  const direct = normalizeElementKey(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return null;
  return (
    normalizeElementKey(record.element)
    ?? normalizeElementKey(asRecord(record.metadata)?.element)
    ?? null
  );
};

const readClass = (value: unknown): ReturnType<typeof normalizeClassName> => {
  const direct = normalizeClassName(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return null;
  return (
    normalizeClassName(record.class)
    ?? normalizeClassName(record.className)
    ?? normalizeClassName(asRecord(record.metadata)?.class)
    ?? normalizeClassName(asRecord(record.metadata)?.className)
    ?? null
  );
};

export function getElementBonus(attackerElement: unknown, defenderElement: unknown): number {
  const attacker = readElement(attackerElement);
  const defender = readElement(defenderElement);
  if (!attacker || !defender) return 0;

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
  canApplyBurn?: boolean | null;
  synergyMode?: 'damage' | 'burn' | 'auto' | null;
};

export function getSynergyBonus(attacker: unknown, sideUnits: unknown, _context?: SynergyContext | null): number {
  const attackerElement = readElement(attacker);
  if (attackerElement !== 'fire') return 0;

  const lineup = Array.isArray(sideUnits) ? sideUnits : [];
  if (lineup.length === 0) return 0;

  let hasWind = false;
  let hasFire = false;
  for (const unit of lineup) {
    const element = readElement(unit);
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
  const elementBonus = getElementBonus(attacker, defender);
  const synergyBonus = getSynergyBonus(attacker, sideUnits, context);

  return {
    classBonus,
    elementBonus,
    synergyBonus,
    totalBonus: classBonus + elementBonus + synergyBonus,
  };
}
