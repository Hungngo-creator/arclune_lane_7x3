//home (termux)/arclune_lane_7x3/src/screens/collection/state.ts

import type { CollectionTabKey, FilterState } from './types.ts';

export function createFilterState(initial?: Partial<FilterState>): FilterState{
  return {
    activeTab: initial?.activeTab ?? null,
    selectedUnitId: initial?.selectedUnitId ?? null,
  };
}

export function updateActiveTab(state: FilterState, tab: CollectionTabKey | null): void{
  state.activeTab = tab;
}

export function updateSelectedUnit(state: FilterState, unitId: string | null): void{
  state.selectedUnitId = unitId;
}
