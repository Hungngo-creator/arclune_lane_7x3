import type { LineupViewState, LineupMessageType, LineupPassive, RosterUnit } from './state.ts';
import {
  assignUnitToBench,
  assignUnitToSlot,
  removeUnitFromBench,
  removeUnitFromSlot,
  setLeader,
  unlockSlot,
  formatCurrencyBalance,
} from './state.ts';
import type { LineupState } from '@types/ui';

export type CleanupCallback = () => void;

export interface LineupEventElements {
  backButton: HTMLButtonElement;
  slotsGrid: HTMLElement;
  benchGrid: HTMLElement;
  benchDetails: HTMLElement;
  passiveGrid: HTMLElement;
  rosterFilters: HTMLElement;
  rosterList: HTMLElement;
  leaderAvatar: HTMLButtonElement;
  leaderSection: HTMLElement;
  passiveOverlay: HTMLElement;
  passiveClose: HTMLButtonElement;
  leaderOverlay: HTMLElement;
  leaderOverlayBody: HTMLElement;
  leaderClose: HTMLButtonElement;
}

export interface OverlayController {
  getActive: () => HTMLElement | null;
  close: (overlay: HTMLElement | null) => void;
}

export interface LineupEventHelpers {
  getSelectedLineup: () => LineupState | null;
  setMessage: (text: string, type?: LineupMessageType) => void;
  renderSlots: () => void;
  renderBench: () => void;
  renderBenchDetails: () => void;
  renderLeader: () => void;
  renderPassives: () => void;
  renderFilters: () => void;
  renderRoster: () => void;
  updateActiveBenchHighlight: () => void;
  syncBenchDetailsHeight: () => void;
  openPassiveDetails: (passive: LineupPassive) => void;
  openLeaderPicker: () => void;
  refreshWallet: () => void;
}

export interface LineupEventContext {
  shell: { enterScreen?: (screenId: string) => void } | null;
  state: LineupViewState;
  elements: LineupEventElements;
  overlays: OverlayController;
  helpers: LineupEventHelpers;
  rosterLookup: Map<string, RosterUnit>;
}

export function bindLineupEvents(context: LineupEventContext): CleanupCallback[] {
  const { state, elements, helpers, overlays, rosterLookup, shell } = context;
  const {
    backButton,
    slotsGrid,
    benchGrid,
    benchDetails,
    passiveGrid,
    rosterFilters,
    rosterList,
    leaderAvatar,
    leaderSection,
    passiveOverlay,
    passiveClose,
    leaderOverlay,
    leaderOverlayBody,
    leaderClose,
  } = elements;

  const cleanup: CleanupCallback[] = [];

  let leaderObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver === 'function'){
    leaderObserver = new ResizeObserver(() => {
      helpers.syncBenchDetailsHeight();
    });
    leaderObserver.observe(leaderSection);
    cleanup.push(() => {
      if (leaderObserver){
        leaderObserver.disconnect();
      }
    });
  }

  const handleWindowResize = () => helpers.syncBenchDetailsHeight();
  if (typeof window !== 'undefined'){
    window.addEventListener('resize', handleWindowResize);
    cleanup.push(() => {
      window.removeEventListener('resize', handleWindowResize);
    });
  }

  const handleBack = () => {
    if (shell && typeof shell.enterScreen === 'function'){
      shell.enterScreen('main-menu');
    } else if (typeof window !== 'undefined'){
      if (window.history && typeof window.history.back === 'function'){
        window.history.back();
      } else {
        window.dispatchEvent(new CustomEvent('lineup:back'));
      }
    }
  };
  backButton.addEventListener('click', handleBack);
  cleanup.push(() => backButton.removeEventListener('click', handleBack));

  const handleBenchInteraction = (event: Event) => {
    const benchEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-bench__cell');
    if (!benchEl) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const benchIndex = Number(benchEl.dataset.benchIndex);
    if (!Number.isFinite(benchIndex)) return;
    const cell = lineup.bench[benchIndex];
    if (!cell) return;

    if (state.selectedUnitId){
      const result = assignUnitToBench(lineup, benchIndex, state.selectedUnitId);
      if (!result.ok){
        helpers.setMessage(result.message || 'Không thể gán nhân vật.', 'error');
      } else {
        helpers.setMessage('Đã thêm nhân vật vào dự bị.', 'info');
      }
      helpers.renderSlots();
      helpers.renderBench();
      helpers.renderBenchDetails();
      helpers.renderLeader();
      helpers.renderPassives();
      helpers.renderRoster();
      return;
    }

    const mouseEvent = event as MouseEvent;
    if (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.metaKey){
      if (cell.unitId){
        removeUnitFromBench(lineup, benchIndex);
        state.activeBenchIndex = benchIndex;
        helpers.renderSlots();
        helpers.renderBench();
        helpers.renderBenchDetails();
        helpers.renderPassives();
        helpers.renderRoster();
        helpers.renderLeader();
        helpers.setMessage('Đã bỏ nhân vật khỏi dự bị.', 'info');
      }
      return;
    }

    state.activeBenchIndex = benchIndex;
    helpers.updateActiveBenchHighlight();
    helpers.renderBenchDetails();
  };
  benchGrid.addEventListener('click', handleBenchInteraction);
  cleanup.push(() => benchGrid.removeEventListener('click', handleBenchInteraction));

  const handleBenchFocus = (event: Event) => {
    const benchEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-bench__cell');
    if (!benchEl) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const benchIndex = Number(benchEl.dataset.benchIndex);
    if (!Number.isFinite(benchIndex)) return;
    if (state.activeBenchIndex === benchIndex) return;
    state.activeBenchIndex = benchIndex;
    helpers.updateActiveBenchHighlight();
    helpers.renderBenchDetails();
  };
  benchGrid.addEventListener('focusin', handleBenchFocus);
  cleanup.push(() => benchGrid.removeEventListener('focusin', handleBenchFocus));
  benchGrid.addEventListener('mouseenter', handleBenchFocus, true);
  cleanup.push(() => benchGrid.removeEventListener('mouseenter', handleBenchFocus, true));

  const handleSlotInteraction = (event: Event) => {
    const slotEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-slot');
    if (!slotEl) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const slotIndex = Number(slotEl.dataset.slotIndex);
    if (!Number.isFinite(slotIndex)) return;
    const slot = lineup.slots[slotIndex];
    if (!slot) return;

    const actionButton = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('.lineup-button');
    const action = actionButton?.dataset.slotAction ?? null;

    if (action === 'unlock'){
      const result = unlockSlot(lineup, slotIndex, state.currencyBalances);
      if (!result.ok){
        helpers.setMessage(result.message || 'Không thể mở khóa vị trí.', 'error');
        return;
      }
      const spentText = result.spent
        ? formatCurrencyBalance(result.spent.amount, result.spent.currencyId)
        : null;
      helpers.setMessage(
        spentText
          ? `Đã mở khóa vị trí ${slotIndex + 1} (tốn ${spentText}).`
          : `Đã mở khóa vị trí ${slotIndex + 1}.`,
        'info',
      );
      helpers.renderSlots();
      helpers.renderBench();
      helpers.renderBenchDetails();
      helpers.renderLeader();
      helpers.renderPassives();
      helpers.renderRoster();
      helpers.refreshWallet();
      return;
    }

    if (!slot.unlocked){
      helpers.setMessage('Vị trí đang bị khóa.', 'error');
      return;
    }

    const mouseEvent = event as MouseEvent;
    const isModifierClear = action === 'clear'
      || (mouseEvent && (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.metaKey));
    if (isModifierClear){
      if (!slot.unitId){
        helpers.setMessage('Ô này đang trống.', 'info');
        return;
      }
      const removedUnitId = slot.unitId;
      removeUnitFromSlot(lineup, slotIndex);
      if (state.selectedUnitId === removedUnitId){
        state.selectedUnitId = null;
      }
      helpers.setMessage('Đã bỏ nhân vật khỏi vị trí.', 'info');
      helpers.renderSlots();
      helpers.renderBench();
      helpers.renderBenchDetails();
      helpers.renderLeader();
      helpers.renderPassives();
      helpers.renderRoster();
      return;
    }

    if (!state.selectedUnitId){
      if (slot.unitId){
        state.selectedUnitId = slot.unitId;
        const unit = rosterLookup.get(slot.unitId);
        helpers.setMessage(`Đã chọn ${unit?.name || 'nhân vật'} đang ở vị trí ${slotIndex + 1}. Chọn ô khác để hoán đổi hoặc nhấn "Bỏ".`, 'info');
        helpers.renderRoster();
        helpers.renderSlots();
      } else {
        helpers.setMessage('Chọn nhân vật từ roster để gán vào vị trí này.', 'info');
      }
      return;
    }

    const result = assignUnitToSlot(lineup, slotIndex, state.selectedUnitId);
    if (!result.ok){
      helpers.setMessage(result.message || 'Không thể gán nhân vật.', 'error');
      return;
    }
    const unit = rosterLookup.get(state.selectedUnitId);
    helpers.setMessage(`Đã gán ${unit?.name || 'nhân vật'} vào vị trí ${slotIndex + 1}.`, 'info');
    state.selectedUnitId = null;
    helpers.renderSlots();
    helpers.renderBench();
    helpers.renderBenchDetails();
    helpers.renderLeader();
    helpers.renderPassives();
    helpers.renderRoster();
  };
  slotsGrid.addEventListener('click', handleSlotInteraction);
  cleanup.push(() => slotsGrid.removeEventListener('click', handleSlotInteraction));

  const handleSlotFocus = (event: Event) => {
    const slotEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-slot');
    if (!slotEl) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const slotIndex = Number(slotEl.dataset.slotIndex);
    if (!Number.isFinite(slotIndex)) return;
    const slot = lineup.slots[slotIndex];
    if (!slot) return;

    if (!slot.unlocked){
      const costText = slot.unlockCost
        ? formatCurrencyBalance(slot.unlockCost.amount, slot.unlockCost.currencyId)
        : null;
      helpers.setMessage(
        costText
          ? `Vị trí ${slotIndex + 1} đang khóa. Cần ${costText} để mở khóa.`
          : `Vị trí ${slotIndex + 1} đang khóa.`,
        'info',
      );
      return;
    }

    if (slot.unitId){
      const unit = rosterLookup.get(slot.unitId);
      helpers.setMessage(`Vị trí ${slotIndex + 1}: ${unit?.name || 'đã có nhân vật'}. Dùng "Bỏ" để trả vị trí.`, 'info');
      return;
    }

    if (state.selectedUnitId){
      const unit = rosterLookup.get(state.selectedUnitId);
      helpers.setMessage(`Vị trí ${slotIndex + 1} trống. Đã chọn ${unit?.name || 'nhân vật'}. Nhấn "Gán" để thêm.`, 'info');
    } else {
      helpers.setMessage(`Vị trí ${slotIndex + 1} trống. Chọn nhân vật từ roster rồi nhấn "Gán".`, 'info');
    }
  };
  slotsGrid.addEventListener('focusin', handleSlotFocus);
  cleanup.push(() => slotsGrid.removeEventListener('focusin', handleSlotFocus));
  slotsGrid.addEventListener('mouseenter', handleSlotFocus, true);
  cleanup.push(() => slotsGrid.removeEventListener('mouseenter', handleSlotFocus, true));

  const handlePassiveClick = (event: Event) => {
    const btn = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-passive');
    if (!btn) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const index = Number(btn.dataset.passiveIndex);
    if (!Number.isFinite(index)) return;
    const passive = lineup.passives[index] as LineupPassive | undefined;
    if (!passive || passive.isEmpty) return;
    helpers.openPassiveDetails(passive);
  };
  passiveGrid.addEventListener('click', handlePassiveClick);
  cleanup.push(() => passiveGrid.removeEventListener('click', handlePassiveClick));

  const handleRosterFilter = (event: Event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-roster__filter');
    if (!button) return;
    const type = (button.dataset.filterType || 'all') as LineupViewState['filter']['type'];
    const value = button.dataset.filterValue ?? null;
    state.filter = { type, value };
    helpers.renderFilters();
    helpers.renderRoster();
  };
  rosterFilters.addEventListener('click', handleRosterFilter);
  cleanup.push(() => rosterFilters.removeEventListener('click', handleRosterFilter));

  const handleRosterSelect = (event: Event) => {
    const entry = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-roster__entry');
    if (!entry) return;
    const unitId = entry.dataset.unitId || null;
    if (!unitId) return;
    if (state.selectedUnitId === unitId){
      state.selectedUnitId = null;
      helpers.setMessage('Đã bỏ chọn nhân vật.', 'info');
    } else {
      state.selectedUnitId = unitId;
      const unit = rosterLookup.get(unitId);
      helpers.setMessage(`Đã chọn ${unit?.name || 'nhân vật'}. Nhấn vào ô chủ lực, ô dự bị hoặc leader để gán.`, 'info');
    }
    helpers.renderRoster();
    helpers.renderSlots();
  };
  rosterList.addEventListener('click', handleRosterSelect);
  cleanup.push(() => rosterList.removeEventListener('click', handleRosterSelect));

  const handleLeaderOpen = () => {
    helpers.openLeaderPicker();
  };
  leaderAvatar.addEventListener('click', handleLeaderOpen);
  cleanup.push(() => leaderAvatar.removeEventListener('click', handleLeaderOpen));

  const handlePassiveClose = () => {
    overlays.close(passiveOverlay);
  };
  passiveClose.addEventListener('click', handlePassiveClose);
  cleanup.push(() => passiveClose.removeEventListener('click', handlePassiveClose));

  const handleLeaderClose = () => {
    overlays.close(leaderOverlay);
  };
  leaderClose.addEventListener('click', handleLeaderClose);
  cleanup.push(() => leaderClose.removeEventListener('click', handleLeaderClose));

  const handlePassiveOverlayClick = (event: Event) => {
    if (event.target === passiveOverlay){
      overlays.close(passiveOverlay);
    }
  };
  passiveOverlay.addEventListener('click', handlePassiveOverlayClick);
  cleanup.push(() => passiveOverlay.removeEventListener('click', handlePassiveOverlayClick));

  const handleLeaderOverlayClick = (event: Event) => {
    if (event.target === leaderOverlay){
      overlays.close(leaderOverlay);
    }
  };
  leaderOverlay.addEventListener('click', handleLeaderOverlayClick);
  cleanup.push(() => leaderOverlay.removeEventListener('click', handleLeaderOverlayClick));

  const handleLeaderOption = (event: Event) => {
    const option = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-overlay__option');
    if (!option) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const unitId = option.dataset.unitId ?? null;
    const result = setLeader(lineup, unitId || null, rosterLookup);
    if (!result.ok){
      helpers.setMessage(result.message || 'Không thể đặt leader.', 'error');
    } else {
      if (unitId){
        const unit = rosterLookup.get(unitId);
        helpers.setMessage(`Đã chọn ${unit?.name || 'leader'}.`, 'info');
      } else {
        helpers.setMessage('Đã bỏ chọn leader.', 'info');
      }
    }
    helpers.renderLeader();
    helpers.renderSlots();
    helpers.renderBench();
    helpers.renderPassives();
    helpers.renderRoster();
    overlays.close(leaderOverlay);
  };
  leaderOverlayBody.addEventListener('click', handleLeaderOption);
  cleanup.push(() => leaderOverlayBody.removeEventListener('click', handleLeaderOption));

  const handleGlobalKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape'){
      const active = overlays.getActive();
      if (active){
        overlays.close(active);
      }
    }
  };
  document.addEventListener('keydown', handleGlobalKey);
  cleanup.push(() => document.removeEventListener('keydown', handleGlobalKey));

  return cleanup;
}
