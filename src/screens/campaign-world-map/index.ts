import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { CAMPAIGN_STAGE_DATA, resolveBossName } from '../../data/campaign-stages.ts';

import type { MainMenuShell } from '../main-menu/types.ts';
import type { CampaignStageDefinition } from '../../data/campaign-stages.ts';

const STYLE_ID = 'campaign-world-map-style';

const CSS = /* css */ `
  .app--campaign-world-map{padding:18px 16px 28px;color:#ecf6f4;}
  .campaign-world-map{position:relative;max-width:1240px;min-height:76vh;margin:0 auto;border-radius:20px;overflow:hidden;border:1px solid rgba(128,220,201,.25);background:#08141c;box-shadow:0 18px 48px rgba(0,0,0,.35);}
  .campaign-world-map__bg{position:absolute;inset:0;background:
      radial-gradient(circle at 22% 28%, rgba(90,148,98,.24) 0 14%, transparent 38%),
      radial-gradient(circle at 66% 18%, rgba(117,120,146,.26) 0 12%, transparent 34%),
      radial-gradient(circle at 56% 66%, rgba(43,108,124,.3) 0 9%, transparent 30%),
      conic-gradient(from 220deg at 50% 55%, rgba(20,41,52,.95), rgba(18,51,58,.9), rgba(16,28,37,.95), rgba(20,41,52,.95));
    filter:saturate(1.05) blur(1.5px);
    transform:scale(1.03);
  }
  .campaign-world-map__terrain{position:absolute;inset:0;opacity:.45;background:
      repeating-linear-gradient(145deg, rgba(197,226,209,.08) 0 2px, transparent 2px 12px),
      radial-gradient(110% 70% at 48% 54%, transparent 0 46%, rgba(130,180,190,.14) 54% 58%, transparent 64%),
      linear-gradient(120deg, transparent 0 35%, rgba(103,162,182,.26) 40% 43%, transparent 52% 100%);
  }
  .campaign-world-map__hud{position:relative;z-index:2;padding:18px 20px 8px;display:flex;justify-content:space-between;align-items:flex-start;}
  .campaign-world-map__title{margin:0;font-size:28px;letter-spacing:.06em;text-transform:uppercase;}
  .campaign-world-map__subtitle{margin:6px 0 0;color:#b6d8d4;font-size:13px;letter-spacing:.03em;}
  .campaign-world-map__back{border:none;width:44px;height:44px;border-radius:999px;background:rgba(239,254,250,.92);color:#1f3342;cursor:pointer;font-size:24px;line-height:1;}
  .campaign-world-map__nodes{position:relative;z-index:2;height:280px;margin:12px 26px 0;}
  .campaign-world-map__path{position:absolute;left:9%;right:10%;top:54%;height:2px;background:linear-gradient(90deg,rgba(255,227,176,.15),rgba(255,227,176,.9),rgba(255,227,176,.15));filter:drop-shadow(0 0 8px rgba(255,230,180,.45));}
  .campaign-node{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:8px;background:none;border:none;color:#f8f8de;cursor:pointer;z-index:2;}
  .campaign-node__badge{min-width:128px;padding:9px 12px;border-radius:13px;border:1px solid rgba(255,225,176,.6);background:rgba(44,56,74,.62);backdrop-filter:blur(5px);font-weight:800;letter-spacing:.03em;}
  .campaign-node__dot{width:20px;height:20px;border-radius:50%;background:#f6ddb6;border:2px solid #fff3d2;box-shadow:0 0 0 4px rgba(255,237,194,.25),0 0 16px rgba(255,219,152,.65);}
  .campaign-node--active .campaign-node__badge{border-color:#ffd9ad;background:rgba(54,72,94,.8);}
  .campaign-node--active .campaign-node__dot{box-shadow:0 0 0 6px rgba(255,237,194,.25),0 0 24px rgba(255,219,152,.8);}
  .campaign-world-map__overlay{position:absolute;inset:0;display:flex;opacity:0;pointer-events:none;transition:opacity .26s ease;z-index:3;}
  .campaign-world-map--overlay-visible .campaign-world-map__overlay{opacity:1;pointer-events:auto;}
  .campaign-panel{height:100%;padding:18px 16px 16px;backdrop-filter:blur(6px);background:linear-gradient(180deg,rgba(16,36,40,.84),rgba(14,28,34,.9));border-left:1px solid rgba(145,223,205,.16);border-right:1px solid rgba(145,223,205,.16);transform:translateY(14px);transition:transform .26s ease;}
  .campaign-world-map--overlay-visible .campaign-panel{transform:translateY(0);}
  .campaign-panel--left{width:30%;border-left:none;}
  campaign-panel--middle{width:40%;border:none;background:linear-gradient(180deg,rgba(6,16,22,.22),rgba(6,16,22,.55));display:flex;flex-direction:column;gap:10px;}
  .campaign-panel--right{width:30%;border-right:none;display:flex;flex-direction:column;}
  .campaign-stage-list{margin-top:10px;max-height:calc(100% - 30px);overflow:auto;display:flex;flex-direction:column;gap:10px;padding-right:4px;}
  .stage-card{width:100%;text-align:left;border-radius:12px;border:1px solid rgba(176,226,215,.28);background:rgba(25,45,52,.82);color:#ecfffb;padding:10px 12px;cursor:pointer;}
  .stage-card--active{border-color:#f2d4a7;background:rgba(46,74,79,.88);}
  .stage-card__top{display:flex;justify-content:space-between;font-size:13px;}
  .stage-card__title{margin-top:6px;font-size:14px;}
  .stage-card__status{margin-top:8px;color:#afddd4;font-size:12px;}
  .campaign-location{font-size:13px;color:#bddbd7;line-height:1.45;border:1px solid rgba(144,215,205,.22);border-radius:12px;padding:12px;background:rgba(20,36,44,.55);}
  .campaign-location__name{margin:0;font-size:19px;}
  .campaign-location__terrain{font-size:12px;color:#9dc4c0;margin-top:8px;}
  .campaign-boss{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(149,208,196,.2);}
  .campaign-boss__portrait{width:72px;height:72px;border-radius:12px;border:1px solid rgba(188,235,222,.38);background:rgba(16,31,40,.7);object-fit:cover;}
  .campaign-boss__title{margin:0;font-size:18px;}
  .campaign-boss__name{font-size:13px;color:#9fd0c7;}
  .campaign-info{display:flex;flex-direction:column;gap:10px;margin-top:12px;font-size:13px;}
  .campaign-info__quote{margin:0;padding:10px;border-left:3px solid rgba(244,189,166,.65);background:rgba(58,41,52,.3);font-style:italic;color:#ffd3cf;}
  .campaign-empty{margin-top:18px;padding:12px;border:1px dashed rgba(170,223,212,.3);border-radius:12px;color:#b5d8d3;font-size:13px;}
  .icon-row{display:flex;gap:8px;flex-wrap:wrap;}
  .icon-chip{width:34px;height:34px;border-radius:10px;border:1px solid rgba(172,226,210,.34);background:rgba(21,40,47,.82);display:grid;place-items:center;position:relative;}
  .icon-chip img{width:18px;height:18px;}
  .icon-chip::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);padding:6px 8px;border-radius:8px;background:rgba(5,12,18,.95);color:#eafff9;font-size:11px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .18s ease;}
  .icon-chip:hover::after,.icon-chip:focus-visible::after{opacity:1;}
  .campaign-enter{margin-top:auto;align-self:flex-end;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,222,168,.8);background:linear-gradient(135deg,#ffd08e,#f7a9a1);color:#2a1b1b;font-weight:800;letter-spacing:.06em;cursor:pointer;}
`;

interface RenderContext {
  root: HTMLElement;
  shell?: MainMenuShell | null;
}

interface CampaignLocation {
  id: string;
  name: string;
  lore: string;
  terrainHint: string;
  stages: CampaignStageDefinition[];
}

function bossPortraitPath(unitId: string): string {
  return `assets/units/${unitId}/default.svg`;
}

function statusLabel(stage: CampaignStageDefinition): string {
  if (stage.status === 'locked') return '🔒 Chưa mở';
  if (stage.status === 'cleared') return `★`.repeat(Math.max(stage.stars, 1));
  return 'Đang mở';
}

const LOCATION_POSITIONS: Record<string, string> = {
  'jade-forest': '17% 66%',
  'dragon-spine': '47% 49%',
  'ember-delta': '76% 38%',
};

function buildLocations(): CampaignLocation[] {
  const grouped = new Map<string, CampaignLocation>();
  CAMPAIGN_STAGE_DATA.forEach((stage) => {
    const existing = grouped.get(stage.locationId);
    if (existing) {
      existing.stages.push(stage);
      return;
    }
    grouped.set(stage.locationId, {
      id: stage.locationId,
      name: stage.locationName,
      lore: stage.locationLore,
      terrainHint: stage.terrainHint,
      stages: [stage],
    });
  });
  return Array.from(grouped.values());
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null } = context;
  ensureStyleTag(STYLE_ID, { css: CSS });

  const locations = buildLocations();
  let selectedLocation = locations[0] ?? null;
  let selectedStage = null as CampaignStageDefinition | null;
  let overlayVisible = false;
  const container = document.createElement('section');
  container.className = 'campaign-world-map';
  const mount = mountSection({ root, section: container, rootClasses: 'app--campaign-world-map' });

  container.innerHTML = `
    <div class="campaign-world-map__bg"></div>
    <div class="campaign-world-map__terrain"></div>
    <header class="campaign-world-map__hud">
      <div>
        <h1 class="campaign-world-map__title">Campaign · World Map</h1>
        <p class="campaign-world-map__subtitle">Chọn Location để mở Hub, sau đó chọn stage ở panel trái.</p>
      </div>
      <button class="campaign-world-map__back" type="button" aria-label="Trở về menu chính">↩</button>
    </header>
    <div class="campaign-world-map__nodes">
      <div class="campaign-world-map__path"></div>
    </div>
    <div class="campaign-world-map__overlay">
      <aside class="campaign-panel campaign-panel--left">
        <h3>Stage theo Location</h3>
        <div class="campaign-stage-list" data-role="stage-list"></div>
      </aside>
      <div class="campaign-panel campaign-panel--middle" data-role="location-info"></div>
      <aside class="campaign-panel campaign-panel--right" data-role="stage-info"></aside>
    </div>
  `;

  const stageList = container.querySelector('[data-role="stage-list"]');
  const stageInfo = container.querySelector('[data-role="stage-info"]');
  const locationInfo = container.querySelector('[data-role="location-info"]');
  const nodesWrap = container.querySelector('.campaign-world-map__nodes');
  const backButton = container.querySelector('.campaign-world-map__back');

  function setOverlayVisible(next: boolean): void {
    overlayVisible = next;
    container.classList.toggle('campaign-world-map--overlay-visible', overlayVisible);
  }

  function renderLocationInfo(): void {
    if (!(locationInfo instanceof HTMLElement) || !selectedLocation) return;
    locationInfo.innerHTML = `
      <div class="campaign-location">
        <h2 class="campaign-location__name">${selectedLocation.name}</h2>
        <p>${selectedLocation.lore}</p>
        <div class="campaign-location__terrain"><strong>Địa hình:</strong> ${selectedLocation.terrainHint}</div>
      </div>
    `;
  }

  function renderInfo(): void {
    if (!(stageInfo instanceof HTMLElement)) return;
    if (!selectedStage) {
      stageInfo.innerHTML = `<div class="campaign-empty">Chọn một stage ở panel trái để xem Boss info, Passive và nút Attack.</div>`;
      return;
    }
    const bossName = resolveBossName(selectedStage.bossId);
    stageInfo.innerHTML = `
      <div class="campaign-boss">
        <img class="campaign-boss__portrait" src="${bossPortraitPath(selectedStage.bossId)}" alt="${bossName}"/>
        <div>
          <h2 class="campaign-boss__title">${selectedStage.id} · ${selectedStage.title}</h2>
          <div class="campaign-boss__name">Boss: ${bossName}</div>
        </div>
      </div>
      <div class="campaign-info">
        <div><strong>Lực chiến đề cử:</strong> ${selectedStage.recommendedPower}</div>
        <p class="campaign-info__quote">${selectedStage.bossQuote}</p>
        <div><strong>Passive:</strong></div>
        <div class="icon-row">
          ${selectedStage.passives.map((passive) => `<button class="icon-chip" data-tip="${passive.name}: ${passive.description}" type="button" aria-label="${passive.name}"><img src="${passive.icon}" alt="${passive.name}"/></button>`).join('')}
        </div>
        <div><strong>Boss Skills:</strong></div>
        <div class="icon-row">
          ${selectedStage.skills.map((skill, index) => `<button class="icon-chip" data-tip="${skill.name}" type="button" aria-label="${skill.name}"><span>${index + 1}</span></button>`).join('')}
        </div>
      </div>
      <button class="campaign-enter" type="button" data-role="attack">ATTACK · NHẬP TRẬN</button>
    `;
    const attackButton = stageInfo.querySelector('[data-role="attack"]');
    if (attackButton instanceof HTMLButtonElement){
      attackButton.disabled = selectedStage.status === 'locked';
      attackButton.addEventListener('click', () => {
        if (!shell || typeof shell.enterScreen !== 'function') return;
        shell.enterScreen('pve-session', {
          modeKey: 'campaign',
          stageId: selectedStage?.id,
          bossId: selectedStage?.bossId,
        });
      });
    }
  }

  function renderList(): void {
    if (!(stageList instanceof HTMLElement) || !selectedLocation) return;
    stageList.innerHTML = '';
    selectedLocation.stages.forEach((stage) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `stage-card${selectedStage?.id === stage.id ? ' stage-card--active' : ''}`;
      card.innerHTML = `
        <div class="stage-card__top"><strong>${stage.id}</strong><span>${stage.chapter}</span></div>
        <div class="stage-card__title">${stage.title}</div>
        <div class="stage-card__status">${statusLabel(stage)}</div>
      `;
      card.addEventListener('click', () => {
        selectedStage = stage;
        renderList();
        renderInfo();
      });
      stageList.appendChild(card);
    });
  }

  locations.forEach((location) => {
    if (!(nodesWrap instanceof HTMLElement)) return;
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `campaign-node${selectedLocation?.id === location.id ? ' campaign-node--active' : ''}`;
    const [left = '50%', top = '50%'] = (LOCATION_POSITIONS[location.id] ?? '50% 50%').split(' ');
    node.style.left = left;
    node.style.top = top;
    node.innerHTML = `<span class="campaign-node__badge">${location.name}</span><span class="campaign-node__dot"></span>`;
    node.addEventListener('click', () => {
      selectedLocation = location;
      selectedStage = null;
      setOverlayVisible(true);
      renderNodes();
      renderLocationInfo();
      renderList();
      renderInfo();
    });
    nodesWrap.appendChild(node);
  });

  function renderNodes(): void {
    if (!(nodesWrap instanceof HTMLElement)) return;
    const nodes = nodesWrap.querySelectorAll('.campaign-node');
    nodes.forEach((node, index) => {
      const location = locations[index];
      node.classList.toggle('campaign-node--active', Boolean(location && selectedLocation?.id === location.id));
    });
  }

  if (backButton instanceof HTMLButtonElement){
    backButton.addEventListener('click', () => {
      if (shell && typeof shell.enterScreen === 'function') shell.enterScreen('main-menu');
    });
  }

  setOverlayVisible(Boolean(selectedLocation));
  renderNodes();
  renderLocationInfo();
  renderList();
  renderInfo();

  return {
    destroy(){
      mount.destroy();
    }
  };
}

export const render = renderScreen;
