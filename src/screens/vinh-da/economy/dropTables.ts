import type { EnemyKind, EnemyTier } from '../enemies.ts';
import { isTieredVinhDaResource } from './resources.ts';
import type { TieredAmount, VinhDaResourceId } from './resources.ts';

export type DropOutcome = {
  weight: number;
  drops: readonly Omit<TieredAmount, 'tier'>[];
};

export type DropPool = readonly DropOutcome[];

export type EnemyDropTable = readonly DropPool[];

const nothing = (weight: number): DropOutcome => ({ weight, drops: [] });
const amount = (resourceId: VinhDaResourceId, amount: number): Omit<TieredAmount, 'tier'> => ({ resourceId, amount });

const ENEMY_DROP_TABLES = Object.freeze({
  twisted: [
    [
      { weight: 40, drops: [amount('darkStone', 1)] },
      { weight: 20, drops: [amount('darkStone', 2)] },
      nothing(40)
    ],
    [
      { weight: 10, drops: [amount('blackBone', 1)] },
      { weight: 5, drops: [amount('blackBone', 2)] },
      nothing(85)
    ]
  ],
  crawler: [
    [
      { weight: 30, drops: [amount('darkStone', 1)] },
      { weight: 15, drops: [amount('darkStone', 2)] },
      { weight: 3, drops: [amount('darkStone', 3)] },
      nothing(52)
    ]
  ],
  apostle: [
    [{ weight: 100, drops: [amount('darkStone', 2)] }],
    [{ weight: 20, drops: [amount('darkStone', 1)] }, nothing(80)],
    [{ weight: 15, drops: [amount('apostleCloak', 1)] }, nothing(85)],
    [{ weight: 25, drops: [amount('hazySoul', 1)] }, nothing(75)]
  ],
  madDog: [
    [
      { weight: 20, drops: [amount('darkStone', 1)] },
      { weight: 5, drops: [amount('darkStone', 2)] },
      nothing(75)
    ]
  ],
  suicideBomber: [
    [{ weight: 10, drops: [amount('darkStone', 1)] }, nothing(90)],
    [{ weight: 20, drops: [amount('resentmentStone', 1)] }, nothing(80)]
  ],
  mutantBird: [
    [{ weight: 10, drops: [amount('darkStone', 1)] }, nothing(90)],
    [{ weight: 5, drops: [amount('blackBone', 1)] }, nothing(95)]
  ],
  darkMage: [
    [
      { weight: 40, drops: [amount('darkStone', 2)] },
      { weight: 20, drops: [amount('darkStone', 3)] },
      { weight: 10, drops: [amount('darkStone', 4)] },
      { weight: 5, drops: [amount('darkStone', 5)] },
      nothing(25)
    ],
    [
      { weight: 60, drops: [amount('mageStaff', 1)] },
      { weight: 10, drops: [amount('blackBone', 1)] },
      nothing(30)
    ],
    [
      { weight: 35, drops: [amount('hazySoul', 1)] },
      { weight: 10, drops: [amount('hazySoul', 2)] },
      nothing(55)
    ]
  ],
  ironMan: [
    [{ weight: 100, drops: [amount('darkStone', 2), amount('blackIron', 2), amount('blackBone', 2)] }],
    [{ weight: 10, drops: [amount('darkStone', 2), amount('blackIron', 2), amount('blackBone', 2)] }, nothing(90)],
    [{ weight: 25, drops: [amount('resentmentStone', 1)] }, nothing(75)]
  ],
  resentfulDragon: [
    [{ weight: 100, drops: [amount('darkStone', 10), amount('blackBone', 5), amount('fleshCrystal', 1), amount('dragonScale', 5)] }],
    [{ weight: 5, drops: [amount('darkStone', 2), amount('fleshCrystal', 1)] }, nothing(95)],
    [{ weight: 100, drops: [amount('nightCore', 1)] }],
    [{ weight: 25, drops: [amount('nightCore', 1)] }, nothing(75)]
  ]
} as const satisfies Record<EnemyKind, EnemyDropTable>);

const pickDropOutcome = (pool: DropPool, randomValue: () => number): DropOutcome | null => {
  const totalWeight = pool.reduce((total, outcome) => total + Math.max(0, outcome.weight), 0);
  if (totalWeight <= 0) return null;
  let roll = Math.max(0, Math.min(0.999999, randomValue())) * totalWeight;
  for (const outcome of pool){
    roll -= Math.max(0, outcome.weight);
    if (roll < 0) return outcome;
  }
  return pool[pool.length - 1] ?? null;
};

const addTieredAmount = (drops: TieredAmount[], resource: TieredAmount): void => {
  const existing = drops.find(item => item.resourceId === resource.resourceId && item.tier === resource.tier);
  if (existing) existing.amount += resource.amount;
  else drops.push(resource);
};

export const rollEnemyResourceDrops = (input: {
  kind: EnemyKind;
  enemyTier: EnemyTier;
  mapTier?: EnemyTier;
  randomValue?: () => number;
}): TieredAmount[] => {
  const table = ENEMY_DROP_TABLES[input.kind];
  const randomValue = input.randomValue ?? Math.random;
  const tier = input.mapTier ?? input.enemyTier;
  const drops: TieredAmount[] = [];
  for (const pool of table){
    const outcome = pickDropOutcome(pool, randomValue);
    if (!outcome) continue;
    for (const resource of outcome.drops){
      if (resource.amount <= 0) continue;
      addTieredAmount(drops, {
        ...resource,
        tier: isTieredVinhDaResource(resource.resourceId) ? tier : undefined
      });
    }
  }
  return drops;
};

