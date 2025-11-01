import type { LineupViewState, LineupMessageType, LineupPassive, RosterUnit } from './state.ts';
import {
  assignUnitToCell,
  removeUnitFromCell,
  setLeader,
  unlockCell,
  formatCurrencyBalance,
} from './state.ts';
import type { LineupState } from '@shared-types/ui';

export type CleanupCallback = () => void;

export interface LineupEventElements {
  backButton: HTMLButtonElement;
  cellsGrid: HTMLElement;
  cellDetails: HTMLElement;
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
  renderCells: () => void;
  renderCellDetails: () => void;
  renderLeader: () => void;
  renderPassives: () => void;
  renderFilters: () => void;
  renderRoster: () => void;
  updateActiveCellHighlight: () => void;
  syncGridDetailsHeight: () => void;
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
    cellsGrid,
    cellDetails: _cellDetails,
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
      helpers.syncGridDetailsHeight();
    });
    leaderObserver.observe(leaderSection);
    cleanup.push(() => {
      if (leaderObserver){
        leaderObserver.disconnect();
      }
    });
  }

  const handleWindowResize = () => helpers.syncGridDetailsHeight();
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

const getCellLabel = (lineup: LineupState, cellIndex: number): string => {
    const cell = lineup.cells[cellIndex];
    if (!cell){
      return 'Ô đội hình';
  }
const firstReserveIndex = lineup.cells.find(entry => entry.section === 'reserve')?.index ?? lineup.cells.length;
    const displayIndex = cell.section === 'formation'
      ? cell.index + 1
      : (cell.index - firstReserveIndex + 1);
    const sectionName = cell.section === 'formation' ? 'Ô ra trận' : 'Ô dự phòng';
    return `${sectionName} #${Math.max(displayIndex, 1)}`;
};

const handleCellInteraction = (event: Event) => {
    const cellEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-cell');
    if (!cellEl) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const cellIndex = Number(cellEl.dataset.cellIndex);
    if (!Number.isFinite(cellIndex)) return;
    const cell = lineup.cells[cellIndex];
    if (!cell) return;
    
    state.activeCellIndex = cellIndex;
    helpers.updateActiveCellHighlight();
    helpers.renderCellDetails();

const targetEl = event.target as HTMLElement | null;
    const actionable = targetEl?.closest<HTMLElement>('[data-cell-action]');
    const mouseEvent = event as MouseEvent | null;
    const hasModifier = Boolean(mouseEvent && (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.metaKey));
    let action = actionable?.dataset.cellAction ?? null;

    if (!action && hasModifier){
      action = cellEl.dataset.cellAltAction ?? (cell.unitId ? 'clear' : null);
    }

    if (!action){
      action = cellEl.dataset.cellAction ?? null;
    }

    if (!action){
      action = cellEl.dataset.cellDefaultAction ?? null;
    }

    const label = getCellLabel(lineup, cellIndex);

    if (action === 'unlock'){
      const result = unlockCell(lineup, cellIndex, state.currencyBalances);
      if (!result.ok){
        helpers.setMessage(result.message || 'Không thể mở khóa ô.', 'error');
        return;
      }
      const spentText = result.spent
        ? formatCurrencyBalance(result.spent.amount, result.spent.currencyId)
        : null;
      helpers.setMessage(
        spentText
         ? `Đã mở khóa ${label} (tốn ${spentText}).`
          : `Đã mở khóa ${label}.`,
        'info',
      );
      helpers.renderCells();
      helpers.renderLeader();
      helpers.renderPassives();
      helpers.renderRoster();
      helpers.refreshWallet();
      return;
    }

    if (!cell.unlocked){
      helpers.setMessage('Ô đang bị khóa.', 'error');
      return;
    }

    if (action === 'clear'){
      if (!cell.unitId){
        helpers.setMessage('Ô này đang trống.', 'info');
        return;
      }
      const removedUnitId = cell.unitId;
      removeUnitFromCell(lineup, cellIndex);
      if (state.selectedUnitId === removedUnitId){
        state.selectedUnitId = null;
      }
      helpers.setMessage('Đã bỏ nhân vật khỏi ô.', 'info');
      helpers.renderCells();
      helpers.renderLeader();
      helpers.renderPassives();
      helpers.renderRoster();
      return;
    }

    if (action === 'assign'){
      if (!state.selectedUnitId){
        helpers.setMessage('Chọn nhân vật từ roster trước.', 'info');
        return;
      }
      const assignResult = assignUnitToCell(lineup, cellIndex, state.selectedUnitId);
      if (!assignResult.ok){
        helpers.setMessage(assignResult.message || 'Không thể gán nhân vật.', 'error');
        return;
      }
      const unit = rosterLookup.get(state.selectedUnitId);
      helpers.setMessage(`Đã gán ${unit?.name || 'nhân vật'} vào ${label}.`, 'info');
      state.selectedUnitId = null;
      helpers.renderCells();
      helpers.renderLeader();
      helpers.renderPassives();
      helpers.renderRoster();
      return;
    }

    if (state.selectedUnitId){
      const result = assignUnitToCell(lineup, cellIndex, state.selectedUnitId);
      if (!result.ok){
        helpers.setMessage(result.message || 'Không thể gán nhân vật.', 'error');
        return;
      }
      const unit = rosterLookup.get(state.selectedUnitId);
      helpers.setMessage(`Đã gán ${unit?.name || 'nhân vật'} vào ${label}.`, 'info');
      state.selectedUnitId = null;
      helpers.renderCells();
      helpers.renderLeader();
      helpers.renderPassives();
      helpers.renderRoster();
      return;
    }

    if (cell.unitId){
      state.selectedUnitId = cell.unitId;
      const unit = rosterLookup.get(cell.unitId);
      helpers.setMessage(`Đã chọn ${unit?.name || 'nhân vật'} đang ở ${label}. Chọn ô khác để hoán đổi hoặc dùng Alt+nhấp để bỏ.`, 'info');
      helpers.renderRoster();
      helpers.renderCells();
    } else {
      helpers.setMessage('Chọn nhân vật từ roster để gán vào ô này.', 'info');
    }
  };
  cellsGrid.addEventListener('click', handleCellInteraction);
  cleanup.push(() => cellsGrid.removeEventListener('click', handleCellInteraction));

  const handleCellFocus = (event: Event) => {
    const cellEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('.lineup-cell');
    if (!cellEl) return;
    const lineup = helpers.getSelectedLineup();
    if (!lineup) return;
    const cellIndex = Number(cellEl.dataset.cellIndex);
    if (!Number.isFinite(cellIndex)) return;
    const cell = lineup.cells[cellIndex];
    if (!cell) return;

    if (state.activeCellIndex !== cellIndex){
      state.activeCellIndex = cellIndex;
      helpers.updateActiveCellHighlight();
      helpers.renderCellDetails();
    }

    const label = getCellLabel(lineup, cellIndex);

    if (!cell.unlocked){
      const costText = cell.unlockCost
        ? formatCurrencyBalance(cell.unlockCost.amount, cell.unlockCost.currencyId)
        : null;
      helpers.setMessage(
        costText
        ? `${label} đang khóa. Cần ${costText} để mở khóa. Nhấp để xác nhận.`
          : `${label} đang khóa. Nhấp để mở khóa.`,
        'info',
      );
      return;
    }

    if (cell.unitId){
      const unit = rosterLookup.get(cell.unitId);
      helpers.setMessage(`${label}: ${unit?.name || 'đã có nhân vật'}. Dùng Alt+nhấp để trả ô.`, 'info');
      return;
    }

    if (state.selectedUnitId){
      const unit = rosterLookup.get(state.selectedUnitId);
      helpers.setMessage(`${label} trống. Đã chọn ${unit?.name || 'nhân vật'}. Nhấp để gán.`, 'info');
    } else {
      helpers.setMessage(`${label} trống. Chọn nhân vật từ roster rồi nhấp để gán.`, 'info');
    }
  };
  cellsGrid.addEventListener('focusin', handleCellFocus);
  cleanup.push(() => cellsGrid.removeEventListener('focusin', handleCellFocus));
  cellsGrid.addEventListener('mouseenter', handleCellFocus, true);
  cleanup.push(() => cellsGrid.removeEventListener('mouseenter', handleCellFocus, true));

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
      helpers.setMessage(`Đã chọn ${unit?.name || 'nhân vật'}. Nhấn vào ô đội hình hoặc leader để gán.`, 'info');
    }
    helpers.renderRoster();
    helpers.renderCells();
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
    helpers.renderCells();
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
