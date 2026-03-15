import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { UNITS } from '../../units.ts';
import { loadPlayerProfile, patchPlayerProfile } from '../../utils/player-profile.ts';
import { normalizeUnitId } from '../../utils/unit-id.ts';
import { isCollectionPlayableUnit } from '../collection/helpers.ts';
import type { MainMenuShell } from '../main-menu/types.ts';
import type { GambitActionType } from '../../types/pve.ts';

const STYLE_ID = 'sect-tactical-ai-style-v1';
const SLOT_COUNT = 5;
const DEFAULT_THRESHOLD = 30;
const PLAYABLE_UNITS = UNITS.filter(isCollectionPlayableUnit);

type GambitOption = { value: string; label: string };
type GambitActionOption = { value: GambitActionType; label: string };
type TacticalAiEditorRow = {
  readonly root: HTMLDivElement;
  readonly condition: HTMLButtonElement;
  readonly action: HTMLButtonElement;
  readonly threshold: HTMLInputElement;
  conditionValue: string;
  actionValue: GambitActionType;
  snapshot: string;
};

const CONDITION_OPTIONS: GambitOption[] = [
  { value: 'always', label: 'Luôn luôn' },
  { value: 'self_hp_below', label: 'Tự thân HP < X%' },
  { value: 'self_has_debuff', label: 'Tự thân có Debuff' },
  { value: 'ally_lowest_hp', label: 'Đồng minh thấp HP nhất' },
  { value: 'ally_controlled', label: 'Đồng minh bị khống chế' },
  { value: 'pool_aether_above', label: 'Bể AE chung > X' },
  { value: 'enemy_lowest_hp', label: 'Địch thấp HP nhất' },
  { value: 'enemy_is_boss', label: 'Mục tiêu là Boss' },
  { value: 'enemy_role_is', label: 'Mục tiêu vai trò chỉ định' },
  { value: 'enemy_has_shield', label: 'Địch đang có Shield' },
];

const ACTION_OPTIONS: GambitActionOption[] = [
  { value: 'basic', label: 'Đánh thường' },
  { value: 'skill1', label: 'Kỹ năng 1' },
  { value: 'skill2', label: 'Kỹ năng 2' },
  { value: 'skill3', label: 'Kỹ năng 3' },
];

const CONDITION_LABEL_BY_VALUE = new Map(CONDITION_OPTIONS.map((option) => [option.value, option.label]));
const ACTION_LABEL_BY_VALUE = new Map(ACTION_OPTIONS.map((option) => [option.value, option.label]));
const THRESHOLD_ENABLED_CONDITIONS = new Set(['self_hp_below', 'pool_aether_above']);

const CSS = `
.app--sect-tactical-ai{padding:20px 16px 48px;}
.tactical-ai{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:16px;color:#e9f2ff;}
.tactical-ai__layout{display:grid;grid-template-columns:280px 1fr;gap:16px;min-height:560px;}
.tactical-ai__left,.tactical-ai__right{border:1px solid rgba(125,211,252,.28);border-radius:14px;background:rgba(10,18,28,.75);padding:14px;}
.tactical-ai__left-list{display:flex;flex-direction:column;gap:8px;max-height:520px;overflow:auto;}
.tactical-ai__unit{display:flex;gap:10px;align-items:center;border:1px solid rgba(125,211,252,.2);background:rgba(15,25,38,.7);border-radius:10px;padding:8px;cursor:pointer}
.tactical-ai__unit.is-active{border-color:#67e8f9;box-shadow:0 0 0 1px rgba(103,232,249,.3) inset;}
.tactical-ai__avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:rgba(125,211,252,.22)}
.tactical-ai__slot{display:grid;grid-template-columns:2fr 2fr 120px;gap:10px;align-items:center;margin-bottom:10px;}
.tactical-ai__toolbar{display:flex;justify-content:space-between;align-items:center;}
.tactical-ai input{width:100%;padding:9px;border-radius:8px;background:#0f1a28;color:#e9f2ff;border:1px solid rgba(125,211,252,.25)}
.tactical-ai__picker-trigger{width:100%;text-align:left;padding:9px;border-radius:8px;background:#0f1a28;color:#e9f2ff;border:1px solid rgba(125,211,252,.25)}
.tactical-ai__picker-overlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:1000;background:rgba(2,6,15,.72);padding:16px}
.tactical-ai__picker-overlay.is-open{display:flex}
.tactical-ai__picker-panel{width:min(680px,100%);max-height:min(80vh,680px);overflow:auto;border:1px solid rgba(125,211,252,.28);border-radius:14px;background:rgba(10,18,28,.97);padding:14px;display:flex;flex-direction:column;gap:10px}
.tactical-ai__picker-title{margin:0;font-size:20px;font-weight:700}
.tactical-ai__picker-option{width:100%;display:flex;gap:10px;align-items:flex-start;padding:10px;border-radius:10px;border:1px solid rgba(125,211,252,.25);background:rgba(15,25,38,.8);color:#e9f2ff;text-align:left}
.tactical-ai__picker-option.is-active{border-color:#67e8f9;box-shadow:0 0 0 1px rgba(103,232,249,.3) inset}
.tactical-ai__picker-option-index{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(125,211,252,.2);font-size:12px;font-weight:700;flex:0 0 auto}
`;

function ensureStyles(): void { ensureStyleTag(STYLE_ID, { css: CSS }); }

function loadConfig(): Record<string, unknown> {
  return { ...((loadPlayerProfile().tacticalAiByUnit as Record<string, unknown>) ?? {}) };
}

function sanitizeUnitId(value: unknown): string {
  return normalizeUnitId(typeof value === 'string' ? value : '');
}

function getUnitRows(config: Record<string, unknown>, unitId: string): Record<string, unknown>[] {
  const normalizedUnitId = sanitizeUnitId(unitId);
  if (!normalizedUnitId) return [];
  const existing = config[normalizedUnitId];
  if (Array.isArray(existing)) return existing as Record<string, unknown>[];
  const nextRows: Record<string, unknown>[] = [];
  config[normalizedUnitId] = nextRows;
  return nextRows;
}

export function renderScreen({ root, shell = null }: { root: HTMLElement; shell?: MainMenuShell | null }): { destroy: () => void } {
  ensureStyles();
  const container = document.createElement('div');
  container.className = 'tactical-ai';
  const mount = mountSection({ root, section: container, rootClasses: ['app--sect-tactical-ai'] });

  const toolbar = document.createElement('div');
  toolbar.className = 'tactical-ai__toolbar';
  const back = document.createElement('button');
  back.textContent = '← Trở về Tông Môn';
  back.onclick = () => shell?.enterScreen?.('sect');
  const title = document.createElement('h2');
  title.textContent = 'Thiên Cơ Các (Tactical AI)';
  toolbar.append(back, title);

  const layout = document.createElement('div');
  layout.className = 'tactical-ai__layout';
  const left = document.createElement('section');
  left.className = 'tactical-ai__left';
  const right = document.createElement('section');
  right.className = 'tactical-ai__right';

  const list = document.createElement('div');
  list.className = 'tactical-ai__left-list';
  left.appendChild(list);

  layout.append(left, right);
  container.append(toolbar, layout);

  const allUnits = PLAYABLE_UNITS;
  let activeUnitId = allUnits[0]?.id ?? '';
  const tacticalConfig = loadConfig();
  let saveTimerId: number | null = null;
  let isDirty = false;
  let lastSerializedConfig = JSON.stringify(tacticalConfig);
  const unitButtons = new Map<string, HTMLButtonElement>();
  const editorRows: TacticalAiEditorRow[] = [];
  const pickerOverlay = document.createElement('div');
  pickerOverlay.className = 'tactical-ai__picker-overlay';
  const pickerPanel = document.createElement('div');
  pickerPanel.className = 'tactical-ai__picker-panel';
  const pickerTitle = document.createElement('h3');
  pickerTitle.className = 'tactical-ai__picker-title';
  const pickerList = document.createElement('div');
  pickerPanel.append(pickerTitle, pickerList);
  pickerOverlay.appendChild(pickerPanel);
  container.appendChild(pickerOverlay);
  let pickerState: { rowIndex: number; type: 'condition' | 'action' } | null = null;

  const readEditorSnapshot = (editor: TacticalAiEditorRow): string => (
    `${editor.conditionValue}|${editor.actionValue}|${editor.threshold.value}`
  );

  const isConditionValue = (value: string): value is string => CONDITION_LABEL_BY_VALUE.has(value);
  const isActionValue = (value: string): value is GambitActionType => ACTION_LABEL_BY_VALUE.has(value as GambitActionType);
  const shouldEnableThreshold = (condition: string): boolean => THRESHOLD_ENABLED_CONDITIONS.has(condition);

  const syncThresholdState = (editor: TacticalAiEditorRow): void => {
    const enabled = shouldEnableThreshold(editor.conditionValue);
    editor.threshold.disabled = !enabled;
    editor.threshold.title = enabled ? 'Nhập giá trị ngưỡng bằng bàn phím.' : 'Điều kiện này không dùng ngưỡng.';
  };

  const applyEditorButtonLabels = (editor: TacticalAiEditorRow): void => {
    editor.condition.textContent = CONDITION_LABEL_BY_VALUE.get(editor.conditionValue) ?? 'Luôn luôn';
    editor.action.textContent = ACTION_LABEL_BY_VALUE.get(editor.actionValue) ?? 'Đánh thường';
  };

  const closePicker = (): void => {
    pickerState = null;
    pickerOverlay.classList.remove('is-open');
    pickerList.replaceChildren();
  };

  const openPicker = (rowIndex: number, type: 'condition' | 'action'): void => {
    const editor = editorRows[rowIndex];
    if (!editor) return;
    pickerState = { rowIndex, type };
    pickerTitle.textContent = type === 'condition' ? 'Chọn điều kiện kích hoạt' : 'Chọn hành động ưu tiên';
    pickerList.replaceChildren();

    const options = type === 'condition' ? CONDITION_OPTIONS : ACTION_OPTIONS;
    options.forEach((option, optionIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tactical-ai__picker-option';
      button.dataset.optionValue = option.value;
      if ((type === 'condition' && editor.conditionValue === option.value) || (type === 'action' && editor.actionValue === option.value)){
        button.classList.add('is-active');
      }
      const index = document.createElement('span');
      index.className = 'tactical-ai__picker-option-index';
      index.textContent = String(optionIndex + 1);
      const label = document.createElement('span');
      label.textContent = option.label;
      button.append(index, label);
      pickerList.appendChild(button);
    });

    pickerOverlay.classList.add('is-open');
  };

  const flushSave = (): void => {
    if (saveTimerId != null) {
      window.clearTimeout(saveTimerId);
      saveTimerId = null;
    }
    if (!isDirty) return;
    const serialized = JSON.stringify(tacticalConfig);
    if (serialized === lastSerializedConfig) {
      isDirty = false;
      return;
    }
    patchPlayerProfile({ tacticalAiByUnit: tacticalConfig });
    lastSerializedConfig = serialized;
    isDirty = false;
  };

  const scheduleSave = (): void => {
    isDirty = true;
    if (saveTimerId != null) {
      window.clearTimeout(saveTimerId);
    }
    saveTimerId = window.setTimeout(() => {
      flushSave();
    }, 120);
  };

  const hydrateEditorValues = (): void => {
    const unitRows = getUnitRows(tacticalConfig, activeUnitId);
    for (let i = 0; i < SLOT_COUNT; i += 1) {
      const slot = unitRows[i] ?? {};
      const editor = editorRows[i];
      if (!editor) continue;
      const condition = String(slot.condition ?? 'always');
      const action = String(slot.action ?? 'basic');
      editor.conditionValue = isConditionValue(condition) ? condition : 'always';
      editor.actionValue = isActionValue(action) ? action : 'basic';
      editor.threshold.value = String(slot.threshold ?? DEFAULT_THRESHOLD);
      applyEditorButtonLabels(editor);
      syncThresholdState(editor);
      editor.snapshot = readEditorSnapshot(editor);
    }
  };

  const applyActiveUnitStyles = (): void => {
    unitButtons.forEach((button, unitId) => {
      button.classList.toggle('is-active', unitId === activeUnitId);
    });
  };

  const renderUnits = (): void => {
    const fragment = document.createDocumentFragment();
    unitButtons.clear();
    allUnits.forEach((unit) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tactical-ai__unit${unit.id === activeUnitId ? ' is-active' : ''}`;

      const avatar = document.createElement('span');
      avatar.className = 'tactical-ai__avatar';
      avatar.textContent = unit.name.slice(0, 1);

      const label = document.createElement('span');
      label.textContent = unit.name;

      btn.append(avatar, label);
      btn.dataset.unitId = unit.id;
      unitButtons.set(unit.id, btn);
      fragment.appendChild(btn);
    });
    list.replaceChildren(fragment);
  };

  const buildEditor = (): void => {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < SLOT_COUNT; i += 1) {
      const row = document.createElement('div');
      row.className = 'tactical-ai__slot';
      row.dataset.slotIndex = String(i);
      row.innerHTML = `
        <button class="tactical-ai__picker-trigger tactical-ai__condition" type="button"></button>
        <button class="tactical-ai__picker-trigger tactical-ai__action" type="button"></button>
        <input class="tactical-ai__threshold" type="number" inputmode="numeric" step="1" min="0" max="100" />
      `;

      const condition = row.querySelector<HTMLButtonElement>('.tactical-ai__condition');
      const action = row.querySelector<HTMLButtonElement>('.tactical-ai__action');
      const threshold = row.querySelector<HTMLInputElement>('.tactical-ai__threshold');
      if (!condition || !action || !threshold) continue;

      const editor: TacticalAiEditorRow = {
        root: row,
        condition,
        action,
        threshold,
        conditionValue: 'always',
        actionValue: 'basic',
        snapshot: `${condition.value}|${action.value}|${threshold.value}`,
      };
      applyEditorButtonLabels(editor);
      syncThresholdState(editor);
      editorRows.push(editor);
      fragment.appendChild(row);
    }
    right.replaceChildren(fragment);
  };

  const onUnitSelect = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('.tactical-ai__unit');
    if (!button) return;
    const nextUnitId = sanitizeUnitId(button.dataset.unitId);
    if (!nextUnitId || nextUnitId === activeUnitId) return;
    activeUnitId = nextUnitId;
    applyActiveUnitStyles();
    hydrateEditorValues();
  };

  const onEditorChange = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    const row = target?.closest<HTMLElement>('.tactical-ai__slot');
    if (!row) return;
    const slotIndex = Number(row.dataset.slotIndex);
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= SLOT_COUNT) return;
    const editor = editorRows[slotIndex];
    if (!editor || editor.root !== row) return;

    const nextSnapshot = readEditorSnapshot(editor);
    if (nextSnapshot === editor.snapshot) return;
    editor.snapshot = nextSnapshot;

    const rows = getUnitRows(tacticalConfig, activeUnitId);
    rows[slotIndex] = {
      condition: editor.conditionValue,
      action: editor.actionValue,
      threshold: Number(editor.threshold.value || 0),
      enabled: true,
    };
    scheduleSave();
  };

  const onEditorClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const row = target?.closest<HTMLElement>('.tactical-ai__slot');
    if (!row) return;
    const slotIndex = Number(row.dataset.slotIndex);
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= SLOT_COUNT) return;

    const isConditionTrigger = !!target?.closest('.tactical-ai__condition');
    const isActionTrigger = !!target?.closest('.tactical-ai__action');
    if (isConditionTrigger){
      openPicker(slotIndex, 'condition');
      return;
    }
    if (isActionTrigger){
      openPicker(slotIndex, 'action');
    }
  };

  const onPickerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!pickerState) return;

    if (target === pickerOverlay){
      closePicker();
      return;
    }
    const option = target.closest<HTMLButtonElement>('.tactical-ai__picker-option');
    if (!option) return;
    const value = option.dataset.optionValue ?? '';
    const editor = editorRows[pickerState.rowIndex];
    if (!editor){
      closePicker();
      return;
    }

    if (pickerState.type === 'condition' && isConditionValue(value)){
      editor.conditionValue = value;
      syncThresholdState(editor);
    }
    if (pickerState.type === 'action' && isActionValue(value)){
      editor.actionValue = value;
    }

    applyEditorButtonLabels(editor);
    editor.root.dispatchEvent(new Event('change', { bubbles: true }));
    closePicker();
  };

  renderUnits();
  buildEditor();
  hydrateEditorValues();
  list.addEventListener('click', onUnitSelect);
  right.addEventListener('click', onEditorClick);
  right.addEventListener('change', onEditorChange);
  pickerOverlay.addEventListener('click', onPickerClick);

  const onUnload = () => flushSave();
  window.addEventListener('beforeunload', onUnload);

  return {
    destroy(){
      window.removeEventListener('beforeunload', onUnload);
      list.removeEventListener('click', onUnitSelect);
      right.removeEventListener('click', onEditorClick);
      right.removeEventListener('change', onEditorChange);
      pickerOverlay.removeEventListener('click', onPickerClick);
      flushSave();
      mount.destroy();
    }
  };
}

export const render = renderScreen;
