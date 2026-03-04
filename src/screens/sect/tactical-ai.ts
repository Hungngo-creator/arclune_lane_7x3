import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { UNITS } from '../../units.ts';
import { loadPlayerProfile, patchPlayerProfile } from '../../utils/player-profile.ts';
import type { MainMenuShell } from '../main-menu/types.ts';
import type { GambitActionType } from '../../types/pve.ts';

const STYLE_ID = 'sect-tactical-ai-style-v1';
const SLOT_COUNT = 5;

type GambitOption = { value: string; label: string };
type GambitActionOption = { value: GambitActionType; label: string };

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
  return (loadPlayerProfile().tacticalAiByUnit as Record<string, unknown>) ?? {};
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

  const save = (): void => {
    patchPlayerProfile({ tacticalAiByUnit: loadConfig() });
  };

  const renderEditor = (): void => {
    right.innerHTML = '';
    const config = loadConfig();
    const unitRows = Array.isArray(config[activeUnitId]) ? (config[activeUnitId] as Record<string, unknown>[]) : [];

    for (let i = 0; i < SLOT_COUNT; i += 1) {
      const row = document.createElement('div');
      row.className = 'tactical-ai__slot';
      const slot = unitRows[i] ?? {};

      const condition = document.createElement('select');
      CONDITION_OPTIONS.forEach((opt) => {
        const op = document.createElement('option');
        op.value = opt.value;
        op.textContent = opt.label;
        condition.appendChild(op);
      });
      condition.value = String(slot.condition ?? 'always');

      const action = document.createElement('select');
      ACTION_OPTIONS.forEach((opt) => {
        const op = document.createElement('option');
        op.value = opt.value;
        op.textContent = opt.label;
        action.appendChild(op);
      });
      action.value = String(slot.action ?? 'basic');

      const threshold = document.createElement('input');
      threshold.type = 'number';
      threshold.value = String(slot.threshold ?? 30);

      const onChange = () => {
        const next = loadConfig();
        const rows = Array.isArray(next[activeUnitId]) ? [...(next[activeUnitId] as Record<string, unknown>[])] : [];
        rows[i] = {
          condition: condition.value,
          action: action.value,
          threshold: Number(threshold.value || 0),
          enabled: true,
        };
        next[activeUnitId] = rows;
        patchPlayerProfile({ tacticalAiByUnit: next });
      };

      condition.onchange = onChange;
      action.onchange = onChange;
      threshold.onchange = onChange;
      row.append(condition, action, threshold);
      right.appendChild(row);
    }
  };

  const renderUnits = (): void => {
    list.innerHTML = '';
    allUnits.forEach((unit) => {
      const btn = document.createElement('button');
      btn.className = `tactical-ai__unit${unit.id === activeUnitId ? ' is-active' : ''}`;
      btn.innerHTML = `<span class="tactical-ai__avatar">${unit.name.slice(0, 1)}</span><span>${unit.name}</span>`;
      btn.onclick = () => {
        activeUnitId = unit.id;
        renderUnits();
        renderEditor();
      };
      list.appendChild(btn);
    });
  };

  renderUnits();
  renderEditor();

  const onUnload = () => save();
  window.addEventListener('beforeunload', onUnload);

  return { destroy(){ window.removeEventListener('beforeunload', onUnload); save(); mount.destroy(); } };
}

export const render = renderScreen;
