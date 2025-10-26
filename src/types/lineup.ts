import type { UnknownRecord } from './common.ts';
import type { LineupCurrencyValue } from './currency.ts';

export interface RosterEntryLite extends UnknownRecord {
  id?: string | number | null;
  key?: string | number | null;
  name?: string | null;
  title?: string | null;
  class?: string | null;
  role?: string | null;
  archetype?: string | null;
  rank?: string | null;
  tier?: string | null;
  tags?: ReadonlyArray<unknown> | null;
  labels?: ReadonlyArray<unknown> | null;
  power?: number | string | null;
  cp?: number | string | null;
  avatar?: string | null;
  icon?: string | null;
  portrait?: string | null;
  passives?: ReadonlyArray<unknown> | null;
  kit?: UnknownRecord | null;
}

export interface LineupMemberConfig extends UnknownRecord {
  unitId?: string | null;
  id?: string | number | null;
  key?: string | number | null;
  name?: string | null;
  title?: string | null;
  label?: string | null;
  unlocked?: boolean | null;
  cost?: LineupCurrencyValue | ReadonlyArray<LineupCurrencyValue> | null;
  unlockCost?: LineupCurrencyValue | ReadonlyArray<LineupCurrencyValue> | null;
  equipment?: UnknownRecord | null;
}

export interface LineupPassiveConfig extends UnknownRecord {
  id?: string | number | null;
  key?: string | number | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  effect?: string | null;
  text?: string | null;
  requirement?: string | null;
  condition?: string | null;
  prerequisite?: string | null;
  requiredUnitIds?: ReadonlyArray<string | number | null | undefined> | null;
  requiredUnitId?: string | number | null;
  requires?: ReadonlyArray<unknown> | null;
  requiredTags?: ReadonlyArray<unknown> | null;
  tagsRequired?: ReadonlyArray<unknown> | null;
  autoActive?: boolean | null;
  alwaysActive?: boolean | null;
  isActive?: boolean | null;
}

export interface LineupDefinition extends UnknownRecord {
  id?: string | number | null;
  key?: string | number | null;
  name?: string | null;
  title?: string | null;
  role?: string | null;
  type?: string | null;
  description?: string | null;
  summary?: string | null;
  slots?: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
  members?: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
  bench?: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
  reserve?: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
  passives?: ReadonlyArray<LineupPassiveConfig | null | undefined> | null;
  passiveSlots?: ReadonlyArray<LineupPassiveConfig | null | undefined> | null;
  slotCosts?: ReadonlyArray<LineupCurrencyValue | null | undefined> | null;
  unlockCosts?: ReadonlyArray<LineupCurrencyValue | null | undefined> | null;
  slotCost?: LineupCurrencyValue | null;
  unlockCost?: LineupCurrencyValue | null;
  unlockCurrency?: string | null;
  currencyId?: string | null;
  defaultCurrencyId?: string | null;
  benchSize?: number | string | null;
  initialUnlockedSlots?: number | string | null;
  leaderId?: string | null;
  lineupId?: string | null;
  leader?: string | null;
  captainId?: string | null;
  currency?: string | null;
}