import type { CollectionTabKey, FilterState } from './types.ts';

export function createFilterState(initial?: Partial<FilterState>): FilterState{
  return {
    activeTab: initial?.activeTab ?? 'awakening',
    selectedUnitId: initial?.selectedUnitId ?? null,
  };
}

export function updateActiveTab(state: FilterState, tab: CollectionTabKey): void{
  state.activeTab = tab;
}

export function updateSelectedUnit(state: FilterState, unitId: string | null): void{
  state.selectedUnitId = unitId;
}
