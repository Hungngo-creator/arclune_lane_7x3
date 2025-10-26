import type { SessionState } from './combat';

export interface HudHandles {
  update(game: Pick<SessionState, 'cost' | 'costCap'> | { cost?: number | null; costCap?: number | null }): void;
  cleanup(): void;
}

export interface SummonBarCard {
  id: string;
  cost: number;
  [extra: string]: unknown;
}

export interface SummonBarOptions<TCard extends SummonBarCard = SummonBarCard> {
  onPick?: (card: TCard) => void;
  canAfford?: (card: TCard) => boolean;
  getDeck?: () => ReadonlyArray<TCard>;
  getSelectedId?: () => TCard['id'] | null | undefined;
}

export interface SummonBarHandles {
  render(): void;
}

export interface EquipmentLoadout {
  weaponId?: string | null;
  artifactIds?: ReadonlyArray<string> | null;
  relicIds?: ReadonlyArray<string> | null;
  accessoryIds?: ReadonlyArray<string> | null;
  [slot: string]: unknown;
}

export interface LineupSlot {
  index: number;
  unitId: string | null;
  label: string | null;
  unlocked: boolean;
  unlockCost: { currencyId: string; amount: number } | null;
  equipment: EquipmentLoadout | null;
  meta: Record<string, unknown> | null;
}

export interface LineupState {
  id: string;
  name: string;
  role: string;
  description: string;
  slots: LineupSlot[];
  bench: Array<{ index: number; unitId: string | null; label: string | null; meta: Record<string, unknown> | null }>;
  passives: Array<{
    index: number;
    id: string;
    name: string;
    description: string;
    requirement: string;
    requiredUnitIds: string[];
    requiredTags: string[];
    isEmpty: boolean;
    autoActive: boolean;
    source: unknown;
  }>;
  leaderId: string | null;
  defaultCurrencyId: string | null;
}