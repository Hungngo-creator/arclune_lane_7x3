import type { Side, UnitToken } from '@shared-types/units';

export interface SidePartition {
  allyTokens: UnitToken[];
  enemyTokens: UnitToken[];
}

export interface SideBuckets {
  ally: UnitToken[];
  enemy: UnitToken[];
}

type PartitionOptions = {
  includeDead?: boolean;
  sortByBoardPosition?: boolean;
};

const BOARD_POSITION_SORT = (a: UnitToken, b: UnitToken): number => (a.cy - b.cy) || (a.cx - b.cx);

function shouldIncludeToken(token: UnitToken, options: PartitionOptions): boolean {
  if (options.includeDead === true) return true;
  return !!token?.alive;
}

function sortBucketsByBoardPosition(buckets: SideBuckets): void {
  buckets.ally.sort(BOARD_POSITION_SORT);
  buckets.enemy.sort(BOARD_POSITION_SORT);
}

export function bucketTokensByActualSide(
  tokens: ReadonlyArray<UnitToken>,
  options: PartitionOptions = {},
): SideBuckets {
  const buckets: SideBuckets = {
    ally: [],
    enemy: [],
  };

  for (const token of tokens) {
    if (!shouldIncludeToken(token, options)) continue;
    if (token.side === 'ally') buckets.ally.push(token);
    else buckets.enemy.push(token);
  }

  if (options.sortByBoardPosition) {
    sortBucketsByBoardPosition(buckets);
  }

  return buckets;
}

export function partitionTokensBySide(
  tokens: ReadonlyArray<UnitToken>,
  perspectiveSide: Side,
  options: PartitionOptions = {},
): SidePartition {
  const buckets = bucketTokensByActualSide(tokens, options);
  if (perspectiveSide === 'ally') {
    return {
      allyTokens: buckets.ally,
      enemyTokens: buckets.enemy,
    };
  }
  return {
    allyTokens: buckets.enemy,
    enemyTokens: buckets.ally,
  };
}

export function forEachPartitionToken(
  tokens: ReadonlyArray<UnitToken>,
  perspectiveSide: Side,
  kind: 'ally' | 'enemy',
  visitor: (token: UnitToken) => void,
  options: PartitionOptions = {},
): void {
  const includeDead = options.includeDead === true;
  for (const token of tokens) {
    if (!includeDead && !token?.alive) continue;
    const isAllyFromPerspective = token.side === perspectiveSide;
    const matches = kind === 'ally' ? isAllyFromPerspective : !isAllyFromPerspective;
    if (!matches) continue;
    visitor(token);
  }
}

export interface TokenSampleOptions {
  allowDuplicates?: boolean;
  randomValue?: () => number;
  exclude?: (token: UnitToken) => boolean;
}

const clampRandomIndex = (value: number, size: number): number => {
  if (size <= 1) return 0;
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 1) return size - 1;
  return Math.floor(value * size);
};

export function sampleTokens(
  tokens: ReadonlyArray<UnitToken>,
  limit: number,
  options: TokenSampleOptions = {},
): UnitToken[] {
  if (limit <= 0 || tokens.length === 0) return [];
  const randomValue = options.randomValue ?? (() => Math.random());
  const allowDuplicates = options.allowDuplicates === true;
  let pool: UnitToken[];

  if (typeof options.exclude === 'function') {
    pool = [];
    for (const token of tokens) {
      if (options.exclude(token)) continue;
      pool.push(token);
    }
  } else if (allowDuplicates) {
    pool = tokens as UnitToken[];
  } else {
    pool = [...tokens];
  }

  if (pool.length === 0) return [];
  if (allowDuplicates) {
    const sampled: UnitToken[] = [];
    for (let i = 0; i < limit; i += 1) {
      const picked = pool[clampRandomIndex(randomValue(), pool.length)];
      if (picked) sampled.push(picked);
    }
    return sampled;
  }

  if (pool.length <= limit) return pool;
  for (let i = 0; i < limit; i += 1) {
    const swapIndex = i + clampRandomIndex(randomValue(), pool.length - i);
    [pool[i], pool[swapIndex]] = [pool[swapIndex], pool[i]];
  }
  return pool.slice(0, limit);
}