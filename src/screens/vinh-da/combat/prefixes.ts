import type { EnemyKind, EnemyTier } from '../enemies.ts';
import type { TieredAmount, VinhDaResourceId } from '../economy/resources.ts';

export type CreaturePrefix = 'elite' | 'champion' | 'hero' | 'ancient' | 'fanatic' | 'host';
export type EnemyRole = 'normal' | 'miniBoss' | 'boss';
export type EnemyFaction = 'eternalNight' | 'bloodLord' | 'neutral';

export interface PrefixableEnemyStats {
  hp: number;
  atk: number;
  wil: number;
  arm: number;
  res: number;
  speed: number;
  attackCooldown: number;
}

export interface CreaturePrefixDefinition {
  label: string;
  hpPercent?: number;
  atkPercent?: number;
  wilPercent?: number;
  armPercent?: number;
  resPercent?: number;
  speedPercent?: number;
  cooldownPercent?: number;
  regenMaxHpPerSecond?: number;
  selfDamageMaxHpPerSecond?: number;
  controlResistPercent?: number;
  threatCostMultiplier: number;
  minNightIndex?: number;
  normalNightCap?: number | ((totalNormal: number) => number);
  role: 'normal' | 'special';
}

export const CREATURE_PREFIXES = Object.freeze({
  elite: { label: 'Tinh Anh', hpPercent: 0.35, atkPercent: 0.2, wilPercent: 0.2, armPercent: 0.1, resPercent: 0.1, speedPercent: 0.08, controlResistPercent: 0.1, threatCostMultiplier: 1.8, minNightIndex: 2, normalNightCap: total => Math.floor(total * 0.08), role: 'normal' },
  champion: { label: 'Quán Quân', hpPercent: 0.7, atkPercent: 0.35, wilPercent: 0.35, armPercent: 0.15, resPercent: 0.15, speedPercent: 0.12, cooldownPercent: -0.1, controlResistPercent: 0.2, threatCostMultiplier: 3, minNightIndex: 4, normalNightCap: 2, role: 'normal' },
  hero: { label: 'Anh Hùng', hpPercent: 1.2, atkPercent: 0.6, wilPercent: 0.6, armPercent: 0.25, resPercent: 0.25, speedPercent: 0.15, cooldownPercent: -0.15, controlResistPercent: 0.35, threatCostMultiplier: 5, minNightIndex: 2, normalNightCap: 1, role: 'normal' },
  ancient: { label: 'Cổ Lão', hpPercent: 0.9, atkPercent: 0.15, wilPercent: 0.15, armPercent: 0.3, resPercent: 0.3, speedPercent: -0.1, regenMaxHpPerSecond: 0.002, threatCostMultiplier: 2.8, role: 'special' },
  fanatic: { label: 'Cuồng Tín', hpPercent: 0.2, atkPercent: 0.45, wilPercent: 0.45, armPercent: -0.1, resPercent: -0.1, speedPercent: 0.1, selfDamageMaxHpPerSecond: 0.004, threatCostMultiplier: 2, role: 'special' },
  host: { label: 'Vật Chủ', hpPercent: 0.5, atkPercent: 0.1, wilPercent: 0.5, resPercent: 0.2, speedPercent: -0.05, threatCostMultiplier: 3.5, role: 'special' }
} as const satisfies Record<CreaturePrefix, CreaturePrefixDefinition>);

const add = (drops: TieredAmount[], resourceId: VinhDaResourceId, amount: number, tier?: EnemyTier): void => {
  const existing = drops.find(drop => drop.resourceId === resourceId && drop.tier === tier);
  if (existing) existing.amount += amount;
  else drops.push({ resourceId, amount, tier });
};

export const applyCreaturePrefixPostRank = <T extends PrefixableEnemyStats>(stats: T, prefix?: CreaturePrefix | null): T => {
  if (!prefix) return stats;
  const definition: CreaturePrefixDefinition = CREATURE_PREFIXES[prefix];
  return {
    ...stats,
    hp: stats.hp + stats.hp * (definition.hpPercent ?? 0),
    atk: stats.atk + stats.atk * (definition.atkPercent ?? 0),
    wil: stats.wil + stats.wil * (definition.wilPercent ?? 0),
    arm: stats.arm + stats.arm * (definition.armPercent ?? 0),
    res: stats.res + stats.res * (definition.resPercent ?? 0),
    speed: stats.speed + stats.speed * (definition.speedPercent ?? 0),
    attackCooldown: Math.max(0, stats.attackCooldown + stats.attackCooldown * (definition.cooldownPercent ?? 0))
  };
};

export const getPrefixThreatCostMultiplier = (prefix?: CreaturePrefix | null): number => prefix ? CREATURE_PREFIXES[prefix].threatCostMultiplier : 1;
export const canApplyCreaturePrefix = (role: EnemyRole, prefix?: CreaturePrefix | null): boolean => !prefix || (role === 'normal' ? CREATURE_PREFIXES[prefix].role === 'normal' : role === 'miniBoss' ? CREATURE_PREFIXES[prefix].role === 'special' : false);

export const getPrefixNightCap = (prefix: CreaturePrefix, totalNormal: number): number => {
  const cap = (CREATURE_PREFIXES[prefix] as CreaturePrefixDefinition).normalNightCap;
  return typeof cap === 'function' ? cap(totalNormal) : cap ?? Number.POSITIVE_INFINITY;
};

export const applyPrefixBonusDrops = (enemy: { prefix?: CreaturePrefix | null; kind: EnemyKind; faction?: EnemyFaction; tier: EnemyTier }, drops: TieredAmount[], randomValue: () => number): TieredAmount[] => {
  if (!enemy.prefix) return drops;
  const tier = enemy.tier;
  if (enemy.prefix === 'elite') { add(drops, 'darkStone', 1, tier); if (randomValue() < 0.2) add(drops, enemy.faction === 'bloodLord' ? 'wishStone' : enemy.kind === 'resentmentStatue' ? 'resentmentStone' : 'darkStone', 1, tier); }
  if (enemy.prefix === 'champion') { add(drops, 'darkStone', 2, tier); if (randomValue() < 0.35) add(drops, enemy.faction === 'bloodLord' ? 'wishStone' : 'resentmentStone', 1, tier); if (randomValue() < 0.1) add(drops, 'hazySoul', 1); }
  if (enemy.prefix === 'hero') { add(drops, 'darkStone', 3, tier); add(drops, enemy.faction === 'bloodLord' ? 'wishStone' : enemy.kind === 'resentmentStatue' ? 'resentmentStone' : 'darkStone', 1, tier); if (randomValue() < 0.35 && enemy.faction !== 'neutral') add(drops, enemy.faction === 'bloodLord' ? 'bloodLordSigil' : 'nightCore', 1, tier); }
  if (enemy.prefix === 'ancient' && randomValue() < 0.3 && enemy.faction === 'bloodLord') add(drops, 'wishStone', 1, tier);
  if (enemy.prefix === 'fanatic') { if (randomValue() < 0.25 && enemy.faction === 'bloodLord') add(drops, 'bloodLordSigil', 1, tier); if (randomValue() < 0.25 && enemy.faction === 'neutral') add(drops, 'hazySoul', 1); }
  if (enemy.prefix === 'host') { if (randomValue() < 0.5) add(drops, 'hazySoul', 1); if (randomValue() < 0.15) add(drops, 'nightCore', 1, tier); }
  return drops;
};

