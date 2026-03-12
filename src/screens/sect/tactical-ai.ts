import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { UNITS } from '../../units.ts';
import { loadPlayerProfile, patchPlayerProfile } from '../../utils/player-profile.ts';
import { normalizeUnitId } from '../../utils/unit-id.ts';
import type { MainMenuShell } from '../main-menu/types.ts';
import type { GambitActionType } from '../../types/pve.ts';

const STYLE_ID = 'sect-tactical-ai-style-v1';
const SLOT_COUNT = 5;
const DEFAULT_THRESHOLD = 30;

type GambitOption = { value: string; label: string };
type GambitActionOption = { value: GambitActionType; label: string };
type TacticalAiEditorRow = {
  readonly root: HTMLDivElement;
  readonly condition: HTMLSelectElement;
  readonly action: HTMLSelectElement;
  readonly threshold: HTMLInputElement;
  snapshot: string;
};

const CONDITION_OPTIONS: GambitOption[] = [
  { value: 'always', label: 'Luôn luôn' },
  { value: 'self_hp_below', label: 'Tự thân HP < X%' },
  { value: 'self_has_debuff', label: 'Tự thân có Debuff' },
  { value: 'self_full_fury', label: 'Tự thân đầy nộ' },
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
  { value: 'ult', label: 'Kỹ năng (ULT)' },
  { value: 'skill1', label: 'Kỹ năng 1' },
  { value: 'skill2', label: 'Kỹ năng 2' },
  { value: 'skill3', label: 'Kỹ năng 3' },
];

const CONDITION_OPTIONS_HTML = CONDITION_OPTIONS.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join('');
const ACTION_OPTIONS_HTML = ACTION_OPTIONS.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join('');

const CSS = `
.app--sect-tactical-ai{padding:20px 16px 48px;}
.tactical-ai{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:16px;color:#e9f2ff;}
.tactical-ai__layout{display:grid;grid-template-columns:280px 1fr;gap:16px;min-height:560px;}
.tactical-ai__left,.tactical-ai__right{border:1px solid rgba(125,211,252,.28);border-radius:14px;background:rgba(10,18,28,.75);padding:14px;}
.tactical-ai__left-list{display:flex;flex-direction:column;gap:8px;max-height:520px;overflow:auto;}
.tactical-ai__unit{display:flex;gap:10px;align-items:center;border:1px solid rgba(125,211,252,.2);background:rgba(15,25,38,.7);border-radius:10px;padding:8px;cursor:pointer}
.tactical-ai__unit.is-active{border-color:#67e8f9;box-shadow:0 0 0 1px rgba(103,232,249,.3) inset;}
.tactical-ai__avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:rgba(125,211,252,.22)}
.tactical-ai__slot{display:grid;grid-template-columns:2fr 2fr 90px;gap:10px;align-items:center;margin-bottom:10px;}
.tactical-ai__toolbar{display:flex;justify-content:space-between;align-items:center;}
.tactical-ai select,.tactical-ai input{width:100%;padding:9px;border-radius:8px;background:#0f1a28;color:#e9f2ff;border:1px solid rgba(125,211,252,.25)}
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

  const allUnits = [...UNITS];
  let activeUnitId = allUnits[0]?.id ?? '';
  const tacticalConfig = loadConfig();
  let saveTimerId: number | null = null;
  const unitButtons = new Map<string, HTMLButtonElement>();
  const editorRows: TacticalAiEditorRow[] = [];

  const readEditorSnapshot = (editor: TacticalAiEditorRow): string => (
    `${editor.condition.value}|${editor.action.value}|${editor.threshold.value}`
  );

  const flushSave = (): void => {
    if (saveTimerId != null) {
      window.clearTimeout(saveTimerId);
      saveTimerId = null;
    }
    patchPlayerProfile({ tacticalAiByUnit: tacticalConfig });
  };

  const scheduleSave = (): void => {
    if (saveTimerId != null) {
      window.clearTimeout(saveTimerId);
    }
    saveTimerId = window.setTimeout(() => {
      saveTimerId = null;
      patchPlayerProfile({ tacticalAiByUnit: tacticalConfig });
    }, 120);
  };

  const hydrateEditorValues = (): void => {
    const unitRows = getUnitRows(tacticalConfig, activeUnitId);
    for (let i = 0; i < SLOT_COUNT; i += 1) {
      const slot = unitRows[i] ?? {};
      const editor = editorRows[i];
      if (!editor) continue;
      editor.condition.value = String(slot.condition ?? 'always');
      editor.action.value = String(slot.action ?? 'basic');
      editor.threshold.value = String(slot.threshold ?? DEFAULT_THRESHOLD);
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
    allUnits.forEach((unit) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tactical-ai__unit${unit.id === activeUnitId ? ' is-active' : ''}`;
      btn.innerHTML = `<span class="tactical-ai__avatar">${unit.name.slice(0, 1)}</span><span>${unit.name}</span>`;
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
        <select class="tactical-ai__condition">${CONDITION_OPTIONS_HTML}</select>
        <select class="tactical-ai__action">${ACTION_OPTIONS_HTML}</select>
        <input class="tactical-ai__threshold" type="number" />
      `;

      const condition = row.querySelector<HTMLSelectElement>('.tactical-ai__condition');
      const action = row.querySelector<HTMLSelectElement>('.tactical-ai__action');
      const threshold = row.querySelector<HTMLInputElement>('.tactical-ai__threshold');
      if (!condition || !action || !threshold) continue;

      editorRows.push({
        root: row,
        condition,
        action,
        threshold,
        snapshot: `${condition.value}|${action.value}|${threshold.value}`,
      });
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
      condition: editor.condition.value,
      action: editor.action.value,
      threshold: Number(editor.threshold.value || 0),
      enabled: true,
    };
    scheduleSave();
  };

  renderUnits();
  buildEditor();
  hydrateEditorValues();
  list.addEventListener('click', onUnitSelect);
  right.addEventListener('change', onEditorChange);

  const onUnload = () => flushSave();
  window.addEventListener('beforeunload', onUnload);

  return {
    destroy(){
      window.removeEventListener('beforeunload', onUnload);
      list.removeEventListener('click', onUnitSelect);
      right.removeEventListener('change', onEditorChange);
      flushSave();
      mount.destroy();
    }
  };
}

export const render = renderScreen;
