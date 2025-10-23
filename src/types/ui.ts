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