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