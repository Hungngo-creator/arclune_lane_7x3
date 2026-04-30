import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { getCultivationCost } from '../../cultivation.ts';
import { loadPlayerProfile, patchPlayerProfile } from '../../utils/player-profile.ts';
import type { MainMenuShell } from '../main-menu/types.ts';

const STYLE_ID = 'sect-screen-style-v1';
const DEFAULT_SECT_NAME = 'Tông Môn Vô Danh';
const SECT_OPTIONS = ['Thiên Cơ Lâu', 'Tu Luyện Phòng', 'Bách Khí Các', 'Luyện Đan Các', 'Dược Các', 'Bảo Khố'] as const;
const CULTIVATION_OPTION_INDEX = SECT_OPTIONS.indexOf('Tu Luyện Phòng');
const OFFLINE_CULTIVATION_MAX_MINUTES = 12 * 60;
const BASE_SUBREALM_MINUTES = 120;
const EXTRA_SUBREALM_MINUTES_PER_REALM = 30;

const CSS = /* css */ `
  .app--sect{padding:32px 16px 64px;}
  .sect-screen{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:24px;min-height:70vh;}
  .sect-screen__top{display:flex;justify-content:center;align-items:center;min-height:48px;}
  .sect-screen__title{margin:0;font-size:34px;letter-spacing:.08em;text-transform:uppercase;color:#e6f2ff;text-align:center;}
  .sect-screen__layout{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:flex-start;min-height:520px;}
  .sect-screen__left{display:flex;flex-direction:column;gap:10px;}
  .sect-screen__hub-button{height:64px;padding:10px 12px;border-radius:12px;border:1px solid transparent;background:rgba(12,20,28,.72);color:#e6f2ff;display:flex;align-items:center;justify-content:center;text-align:center;letter-spacing:.04em;cursor:default;font-size:14px;}
  .sect-screen__hub-button--compact{width:75%;justify-self:start;}
  .sect-screen__center{border:1px dashed rgba(125,211,252,.14);border-radius:18px;min-height:500px;background:rgba(8,14,22,.15);}
  .sect-screen__back{align-self:flex-start;width:38px;height:38px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(16,26,36,.78);color:#aee4ff;display:grid;place-items:center;font-size:16px;line-height:1;cursor:pointer;padding:0;}
  .sect-screen__naming-overlay{position:fixed;inset:0;background:rgba(5,10,18,.72);display:flex;align-items:center;justify-content:center;padding:20px;z-index:70;}
  .sect-screen__naming-hub{width:min(520px,100%);border:1px solid rgba(125,211,252,.35);border-radius:18px;background:linear-gradient(160deg,rgba(11,20,30,.96),rgba(6,12,20,.96));padding:22px;display:flex;flex-direction:column;gap:12px;box-shadow:0 24px 54px rgba(0,0,0,.45);}
  .sect-screen__naming-title{margin:0;font-size:22px;letter-spacing:.05em;text-align:center;}
  .sect-screen__naming-input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(125,211,252,.38);background:rgba(10,18,28,.82);color:#e6f2ff;font-size:16px;}
  .sect-screen__naming-actions{display:flex;justify-content:flex-end;}
  .sect-screen__naming-save{padding:10px 18px;border-radius:12px;border:1px solid rgba(125,211,252,.45);background:rgba(19,34,50,.9);color:#e6f2ff;font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}
  .sect-screen__cultivation{padding:24px;display:flex;flex-direction:column;gap:12px;color:#d8ecff;}
  .sect-screen__cultivation-title{margin:0;font-size:24px;letter-spacing:.04em;}
  .sect-screen__cultivation-actions{display:flex;gap:10px;flex-wrap:wrap;}
  .sect-screen__cultivation-btn{padding:10px 14px;border-radius:10px;border:1px solid rgba(125,211,252,.35);background:rgba(18,30,44,.88);color:#e6f2ff;cursor:pointer;}
`;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: MainMenuShell | null;
}

function ensureStyles(): void {
  ensureStyleTag(STYLE_ID, { css: CSS });
}

function sanitizeSectName(value: string | null | undefined): string {
  const trimmed = String(value ?? '').trim().replace(/\s+/g, ' ');
  return trimmed || DEFAULT_SECT_NAME;
}

function saveSectName(name: string): string {
  const nextName = sanitizeSectName(name);
  patchPlayerProfile({ sectName: nextName });
  return nextName;
}

function resolveSubRealmMinutes(realm: number): number {
  return BASE_SUBREALM_MINUTES + Math.max(0, realm - 1) * EXTRA_SUBREALM_MINUTES_PER_REALM;
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null } = context;
  ensureStyles();

  const container = document.createElement('div');
  container.className = 'sect-screen';
  const mount = mountSection({ root, section: container, rootClasses: ['app--sect'] });

  const profile = loadPlayerProfile();

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'sect-screen__back';
  backButton.textContent = '←';
  const onBack = () => {
    if (shell && typeof shell.enterScreen === 'function') {
      shell.enterScreen('main-menu');
    }
  };
  backButton.addEventListener('click', onBack);
  container.appendChild(backButton);

  const topRow = document.createElement('header');
  topRow.className = 'sect-screen__top';
  const title = document.createElement('h1');
  title.className = 'sect-screen__title';
  title.textContent = sanitizeSectName(profile.sectName);
  topRow.appendChild(title);
  container.appendChild(topRow);

  const layout = document.createElement('div');
  layout.className = 'sect-screen__layout';

  const left = document.createElement('aside');
  left.className = 'sect-screen__left';
  const compactStartIndex = SECT_OPTIONS.indexOf('Thiên Cơ Lâu');
  SECT_OPTIONS.forEach((label, index) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'sect-screen__hub-button';
    if (compactStartIndex >= 0 && index >= compactStartIndex) {
      option.classList.add('sect-screen__hub-button--compact');
    }
    option.textContent = label;
    option.dataset.sectIndex = String(index);
    left.appendChild(option);
  });

  const onSelectOption = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('.sect-screen__hub-button');
    if (!button) return;
    if (button.dataset.sectIndex === '0') {
      shell?.enterScreen?.('sect-tactical-ai');
      return;
    }
    const optionIndex = Number(button.dataset.sectIndex ?? -1);
    cultivationPanel.hidden = optionIndex !== CULTIVATION_OPTION_INDEX;
    if (optionIndex === CULTIVATION_OPTION_INDEX) {
      renderCultivationPanel();
    }
  };
  left.addEventListener('click', onSelectOption);

  const center = document.createElement('section');
  center.className = 'sect-screen__center';
  const cultivationPanel = document.createElement('div');
  cultivationPanel.className = 'sect-screen__cultivation';
  cultivationPanel.hidden = true;
  cultivationPanel.innerHTML = `
    <h2 class="sect-screen__cultivation-title">Tu Luyện Phòng</h2>
    <p data-cultivation-status></p>
    <p data-cultivation-earned></p>
    <div class="sect-screen__cultivation-actions">
      <button type="button" class="sect-screen__cultivation-btn" data-cultivation-start>Bắt đầu treo máy</button>
      <button type="button" class="sect-screen__cultivation-btn" data-cultivation-claim>Nhận tu vi</button>
    </div>
  `;
  center.appendChild(cultivationPanel);
  layout.append(left, center);
  container.appendChild(layout);
  const cultivationStatus = cultivationPanel.querySelector<HTMLElement>('[data-cultivation-status]');
  const cultivationEarned = cultivationPanel.querySelector<HTMLElement>('[data-cultivation-earned]');
  const cultivationStartButton = cultivationPanel.querySelector<HTMLButtonElement>('[data-cultivation-start]');
  const cultivationClaimButton = cultivationPanel.querySelector<HTMLButtonElement>('[data-cultivation-claim]');
  let cultivationTimer = 0;

  const readCultivationState = () => {
    const latestProfile = loadPlayerProfile();
    const startedAtMs = Number(latestProfile.sectCultivation?.startedAtMs ?? 0);
    const totalMinutes = Number(latestProfile.sectCultivation?.totalMinutes ?? 0);
    return {
      startedAtMs: Number.isFinite(startedAtMs) && startedAtMs > 0 ? startedAtMs : 0,
      totalMinutes: Number.isFinite(totalMinutes) && totalMinutes > 0 ? Math.floor(totalMinutes) : 0,
      cultivationByUnit: latestProfile.cultivationByUnit ?? {},
    };
  };

  const renderCultivationPanel = () => {
    if (!cultivationStatus || !cultivationEarned) return;
    const state = readCultivationState();
    if (!state.startedAtMs) {
      cultivationStatus.textContent = 'Chưa bắt đầu treo máy.';
      cultivationEarned.textContent = `Tổng phút tu luyện đã nhận: ${state.totalMinutes}`;
      if (cultivationClaimButton) cultivationClaimButton.disabled = true;
      return;
    }
    const elapsedMinutes = Math.floor(Math.max(0, Date.now() - state.startedAtMs) / 60000);
    const pendingMinutes = Math.min(OFFLINE_CULTIVATION_MAX_MINUTES, elapsedMinutes);
    const unitCount = Object.keys(state.cultivationByUnit).length;
    cultivationStatus.textContent = `Đã treo máy: ${elapsedMinutes} phút (giới hạn nhận ${OFFLINE_CULTIVATION_MAX_MINUTES} phút/lần).`;
    cultivationEarned.textContent = `Phút treo máy chờ nhận: ${pendingMinutes}. Nhân vật đang theo dõi: ${unitCount}. Tổng phút đã nhận: ${state.totalMinutes}.`;
    if (cultivationClaimButton) cultivationClaimButton.disabled = pendingMinutes <= 0;
  };

  const onStartCultivation = () => {
    const now = Date.now();
    patchPlayerProfile({ sectCultivation: { startedAtMs: now, lastClaimedAtMs: now } });
    renderCultivationPanel();
  };

  const onClaimCultivation = () => {
    const state = readCultivationState();
    if (!state.startedAtMs) return;
    const now = Date.now();
    const elapsedMinutes = Math.floor(Math.max(0, now - state.startedAtMs) / 60000);
    const claimedMinutes = Math.min(OFFLINE_CULTIVATION_MAX_MINUTES, elapsedMinutes);
    const nextCultivationByUnit = { ...state.cultivationByUnit };
    for (const [unitId, progress] of Object.entries(state.cultivationByUnit)) {
      if (!unitId || !progress) continue;
      const realm = Math.max(1, Math.floor(Number(progress.realm ?? 1)));
      const subRealm = Math.max(0, Math.floor(Number(progress.subRealm ?? 0)));
      const minutePerSubRealm = resolveSubRealmMinutes(realm);
      if (minutePerSubRealm <= 0) continue;
      const gainedSubRealm = Math.floor(claimedMinutes / minutePerSubRealm);
      if (gainedSubRealm <= 0) continue;
      let nextSubRealm = subRealm;
      let remainingGain = gainedSubRealm;
      while (remainingGain > 0) {
        const nextCost = getCultivationCost(realm, nextSubRealm);
        if (!nextCost || nextCost.isBreakthrough) break;
        nextSubRealm = nextCost.nextSubRealm;
        remainingGain -= 1;
      }
      if (nextSubRealm > subRealm) {
        nextCultivationByUnit[unitId] = { realm, subRealm: nextSubRealm };
      }
    }
    patchPlayerProfile({
      sectCultivation: {
        startedAtMs: now,
        lastClaimedAtMs: now,
        totalMinutes: state.totalMinutes + claimedMinutes,
      },
      cultivationByUnit: nextCultivationByUnit,
    });
    renderCultivationPanel();
  };

  cultivationStartButton?.addEventListener('click', onStartCultivation);
  cultivationClaimButton?.addEventListener('click', onClaimCultivation);
  cultivationTimer = window.setInterval(renderCultivationPanel, 1000);

  const existingName = sanitizeSectName(profile.sectName);
  const shouldOpenNamingHub = !profile.sectName || !String(profile.sectName).trim();

  let overlay: HTMLElement | null = null;
  let submitHandler: ((event: Event) => void) | null = null;

  const closeOverlay = () => {
    if (!overlay) return;
    if (submitHandler) {
      const form = overlay.querySelector('form');
      if (form) form.removeEventListener('submit', submitHandler);
    }
    overlay.remove();
    overlay = null;
    submitHandler = null;
  };

  if (shouldOpenNamingHub) {
    overlay = document.createElement('div');
    overlay.className = 'sect-screen__naming-overlay';

    const form = document.createElement('form');
    form.className = 'sect-screen__naming-hub';
    form.innerHTML = `
      <h2 class="sect-screen__naming-title">Đặt tên Tông Môn</h2>
      <input class="sect-screen__naming-input" name="sect-name" maxlength="80" placeholder="Ví dụ: Thái Cổ Tối Cường Tông" required />
      <div class="sect-screen__naming-actions">
        <button type="submit" class="sect-screen__naming-save">Xác nhận</button>
      </div>
    `;

    submitHandler = (event: Event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="sect-name"]');
      if (!(input instanceof HTMLInputElement)) return;
      const savedName = saveSectName(input.value);
      title.textContent = savedName;
      closeOverlay();
    };

    form.addEventListener('submit', submitHandler);
    overlay.appendChild(form);
    container.appendChild(overlay);

    const input = form.querySelector('input[name="sect-name"]');
    if (input instanceof HTMLInputElement) {
      input.value = existingName === DEFAULT_SECT_NAME ? '' : existingName;
      window.setTimeout(() => input.focus(), 0);
    }
  }

  return {
    destroy() {
      backButton.removeEventListener('click', onBack);
      left.removeEventListener('click', onSelectOption);
      cultivationStartButton?.removeEventListener('click', onStartCultivation);
      cultivationClaimButton?.removeEventListener('click', onClaimCultivation);
      window.clearInterval(cultivationTimer);
      closeOverlay();
      mount.destroy();
    }
  };
}

export const render = renderScreen;
