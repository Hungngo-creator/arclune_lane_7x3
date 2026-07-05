import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { CAMPAIGN_STAGE_DATA, resolveBossName } from '../../data/campaign-stages.ts';
import { ROSTER, getMetaById } from '../../catalog.ts';
import { normalizeElementKey } from '../../utils/domain-normalization.ts';

import type { MainMenuShell } from '../main-menu/types.ts';
import type { CampaignStageDefinition } from '../../data/campaign-stages.ts';

type CampaignView = 'menu' | 'world_map' | 'stage_detail';

interface LocationGroup {
  id: string;
  name: string;
  lore: string;
  terrainHint: string;
  stages: CampaignStageDefinition[];
}

interface WorldNode {
  id: string;
  label: string;
  left: number;
  top: number;
  isLocked: boolean;
}

interface RenderContext {
  root: HTMLElement;
  shell?: MainMenuShell | null;
  params?: Record<string, unknown> | null;
}

const STYLE_ID = 'campaign-world-map-style';
const WORLD_SIZE = 3000;

const CSS = /* css */ `
  .app--campaign-world-map{padding:14px 12px 16px;color:#ecf6f4;min-height:100dvh;box-sizing:border-box;display:flex;}
  .campaign-world-map{position:relative;max-width:1240px;width:100%;min-height:calc(100dvh - 32px);margin:0 auto;border-radius:20px;overflow:hidden;border:1px solid rgba(128,220,201,.25);background:#08141c;box-shadow:0 18px 48px rgba(0,0,0,.35);display:flex;flex-direction:column;}
  .campaign-world-map__hud{position:relative;z-index:4;padding:18px 20px 8px;display:flex;justify-content:space-between;align-items:flex-start;}
  .campaign-world-map__title{margin:0;font-size:28px;letter-spacing:.06em;text-transform:uppercase;}
  .campaign-world-map__subtitle{margin:6px 0 0;color:#b6d8d4;font-size:13px;letter-spacing:.03em;}
  .campaign-world-map__back{border:none;width:44px;height:44px;border-radius:999px;background:rgba(239,254,250,.92);color:#1f3342;cursor:pointer;font-size:24px;line-height:1;}
  .campaign-world-map__corner-actions{position:absolute;inset:76px 20px 20px;z-index:4;pointer-events:none;}
  .campaign-world-map__corner-btn{position:absolute;pointer-events:auto;border:1px solid rgba(230,230,255,.38);border-radius:14px;background:rgba(0,0,0,.72);color:#f5f2ff;padding:10px 14px;font-weight:800;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.35);}
  .campaign-world-map__corner-btn--tl{top:0;left:0}.campaign-world-map__corner-btn--tr{top:0;right:0}.campaign-world-map__corner-btn--bl{bottom:0;left:0}.campaign-world-map__corner-btn--br{bottom:0;right:0}
  .campaign-world-map--vinh-da{background:#000;border-color:rgba(160,148,255,.32);}
  .campaign-world-map--vinh-da .campaign-world-map__bg{background:radial-gradient(circle at 50% 40%,rgba(58,45,116,.32),transparent 24%),#000;}
  .leader-modal{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:rgba(0,0,0,.58);padding:16px;}
  .leader-modal[hidden]{display:none}.leader-modal__panel{width:min(720px,96vw);max-height:80vh;overflow:auto;border-radius:18px;border:1px solid rgba(206,205,255,.3);background:#09101b;color:#f4f7ff;padding:16px;box-shadow:0 18px 60px rgba(0,0,0,.55)}
  .leader-modal__head{display:flex;align-items:center;justify-content:space-between;gap:12px}.leader-modal__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:12px}.leader-card{border:1px solid rgba(171,198,255,.22);border-radius:14px;background:rgba(18,31,52,.88);color:inherit;text-align:left;padding:12px;cursor:pointer}.leader-card--active{border-color:#f7d28a;box-shadow:0 0 0 2px rgba(247,210,138,.18)}.leader-card__name{font-weight:900}.leader-card__meta{margin-top:6px;color:#b5c5e6;font-size:12px}
  .campaign-world-map__viewport{position:relative;flex:1;min-height:360px;margin:6px 14px 16px;border-radius:16px;overflow:hidden;border:1px solid rgba(124,204,194,.3);background:#020b13;touch-action:none;cursor:grab;}
  .campaign-world-map__viewport.is-dragging{cursor:grabbing;}
  campaign-world-map__canvas{position:absolute;width:${WORLD_SIZE}px;height:${WORLD_SIZE}px;transform:translate3d(0,0,0);transform-origin:0 0;will-change:transform;contain:layout paint style;backface-visibility:hidden;}
  .campaign-world-map__bg{position:absolute;inset:0;background:
      radial-gradient(circle at 22% 28%, rgba(90,148,98,.24) 0 14%, transparent 38%),
      radial-gradient(circle at 66% 18%, rgba(117,120,146,.26) 0 12%, transparent 34%),
      radial-gradient(circle at 56% 66%, rgba(43,108,124,.3) 0 9%, transparent 30%),
      conic-gradient(from 220deg at 50% 55%, rgba(20,41,52,.95), rgba(18,51,58,.9), rgba(16,28,37,.95), rgba(20,41,52,.95));
    background-size:100% 100%,100% 100%,100% 100%,100% 100%;
    contain:strict;
  }
  .campaign-world-map__terrain{position:absolute;inset:0;opacity:.36;contain:strict;background:
      repeating-linear-gradient(145deg, rgba(197,226,209,.08) 0 2px, transparent 2px 12px),
      radial-gradient(110% 70% at 48% 54%, transparent 0 46%, rgba(130,180,190,.14) 54% 58%, transparent 64%),
      linear-gradient(120deg, transparent 0 35%, rgba(103,162,182,.26) 40% 43%, transparent 52% 100%);
  }
  .campaign-node{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:8px;background:none;border:none;color:#f8f8de;cursor:pointer;z-index:2;}
  .campaign-node__badge{min-width:128px;padding:9px 12px;border-radius:13px;border:1px solid rgba(255,225,176,.6);background:rgba(44,56,74,.78);font-weight:800;letter-spacing:.03em;}
  .campaign-node__dot{width:20px;height:20px;border-radius:50%;background:#f6ddb6;border:2px solid #fff3d2;box-shadow:0 0 0 4px rgba(255,237,194,.25),0 0 16px rgba(255,219,152,.65);}
  .campaign-node--active .campaign-node__badge{border-color:#ffd9ad;background:rgba(54,72,94,.8);}
  .campaign-node--active .campaign-node__dot{box-shadow:0 0 0 6px rgba(255,237,194,.25),0 0 24px rgba(255,219,152,.8);}
  .campaign-node--locked{opacity:.45;cursor:not-allowed;}
  .campaign-node--locked .campaign-node__dot{background:#92a0ad;border-color:#cad5e4;box-shadow:0 0 0 2px rgba(202,213,228,.2);}
  .campaign-world-map__overlay{position:absolute;inset:0;display:flex;opacity:0;pointer-events:none;transition:opacity .26s ease;z-index:5;padding:74px 0 0;}
  .campaign-world-map--stage-detail .campaign-world-map__overlay{opacity:1;pointer-events:auto;}
  .campaign-panel{height:100%;padding:18px 16px 16px;background:linear-gradient(180deg,rgba(16,36,40,.91),rgba(14,28,34,.94));border-left:1px solid rgba(145,223,205,.16);border-right:1px solid rgba(145,223,205,.16);transform:translateY(14px);transition:transform .26s ease;}
   .campaign-world-map--stage-detail .campaign-panel{transform:translateY(0);}
  .campaign-panel--left{width:30%;border-left:none;}
  .campaign-panel--middle{width:40%;border:none;background:linear-gradient(180deg,rgba(6,16,22,.22),rgba(6,16,22,.55));display:flex;flex-direction:column;gap:10px;}
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
  .campaign-empty{margin-top:18px;padding:12px;border:1px dashed rgba(173,216,230,.32);border-radius:12px;background:rgba(17,33,43,.48);color:#a9d0c8;}
  .icon-row{display:flex;flex-wrap:wrap;gap:8px;}
  .icon-chip{width:40px;height:40px;border-radius:10px;border:1px solid rgba(174,225,215,.35);background:rgba(15,31,40,.82);color:#fff;display:grid;place-items:center;cursor:help;}
  .icon-chip img{max-width:24px;max-height:24px;}
  .boss-chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
  .boss-chip{font-size:11px;padding:4px 8px;border-radius:999px;border:1px solid rgba(168,233,219,.4);background:rgba(18,42,53,.66);color:#c8efdf;}
  .campaign-enter{margin-top:auto;border:none;border-radius:12px;padding:12px 14px;background:linear-gradient(135deg,#f9cb84,#f0a85e);color:#1e1d1a;font-weight:800;cursor:pointer;}
  @media (max-width: 780px){
    .app--campaign-world-map{padding:8px 6px 10px;}
    .campaign-world-map{min-height:calc(100dvh - 18px);border-radius:14px;}
    .campaign-world-map__hud{padding:14px 12px 6px;}
    .campaign-world-map__title{font-size:24px;}
    .campaign-world-map__viewport{margin:6px 8px 10px;min-height:320px;}
    .campaign-world-map__overlay{padding:64px 0 0;}
  }
`;

function statusLabel(stage: CampaignStageDefinition): string {
  if (stage.status === 'cleared') return `⭐ ${stage.stars || 0} sao`;
  if (stage.status === 'open') return 'Đang mở';
  return '🔒 Chưa mở';
}

function bossPortraitPath(unitId: string): string {
  const normalized = normalizeElementKey(unitId);
  return `assets/units/${normalized}/default.svg`;
}

function bossInfoChips(unitId: string): string {
  const meta = getMetaById(unitId);
  if (!meta) return '';
  const chips = [
    meta.rarity ? `<span class="boss-chip">${meta.rarity}</span>` : '',
    meta.classRole ? `<span class="boss-chip">${meta.classRole}</span>` : '',
    meta.element ? `<span class="boss-chip">${meta.element}</span>` : ''
  ].filter(Boolean).join('');

return chips ? `<div class="boss-chip-row">${chips}</div>` : '';
}

function buildLocations(): LocationGroup[] {
  const grouped = new Map<string, LocationGroup>();
  CAMPAIGN_STAGE_DATA.forEach((stage) => {
    const previous = grouped.get(stage.locationId);
    if (previous){
      previous.stages.push(stage);
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

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1){
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function computeWorldNodes(locations: LocationGroup[]): WorldNode[] {
  return locations.map((location, index) => {
    const seed = hashSeed(location.id);
    const padding = 240;
    const left = padding + seededRandom(seed) * (WORLD_SIZE - padding * 2);
    const top = padding + seededRandom(seed + 101) * (WORLD_SIZE - padding * 2);

    const hasClearedStage = location.stages.some((stage) => stage.status === 'cleared');
    const previousCleared = index === 0 || locations[index - 1]?.stages.some((stage) => stage.status === 'cleared');
    const isLocked = !hasClearedStage && !previousCleared;

    return {
      id: location.id,
      label: location.name,
      left,
      top,
      isLocked,
    };
  });
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null, params = null } = context;
  const modeKey = params?.modeKey === 'vinh-da' ? 'vinh-da' : 'campaign';
  const isVinhDa = modeKey === 'vinh-da';
  let selectedLeaderId = typeof params?.leaderId === 'string' ? params.leaderId : ROSTER[0]?.id;
  ensureStyleTag(STYLE_ID, { css: CSS });

  const locations = buildLocations();
  const worldNodes = computeWorldNodes(locations);
  const locationById = new Map(locations.map((location) => [location.id, location]));

  let currentView: CampaignView = 'world_map';
  let selectedLocation = locations[0] ?? null;
  let selectedStage = null as CampaignStageDefinition | null;
  let offsetX = 0;
  let offsetY = 0;
  let queuedPointerDeltaX = 0;
  let queuedPointerDeltaY = 0;
  let pointerRafId = 0;

  const container = document.createElement('section');
  container.className = `campaign-world-map${isVinhDa ? ' campaign-world-map--vinh-da' : ''}`;
  const mount = mountSection({ root, section: container, rootClasses: 'app--campaign-world-map' });

  container.innerHTML = `
    <header class="campaign-world-map__hud">
      <div>
        <h1 class="campaign-world-map__title">${isVinhDa ? 'Vĩnh Dạ · World Map' : 'Campaign · World Map'}</h1>
        <p class="campaign-world-map__subtitle">Bấm trực tiếp node sáng để mở danh sách Stage.</p>
      </div>
      <button class="campaign-world-map__back" type="button" aria-label="Trở về menu chính">↩</button>
    </header>
    ${isVinhDa ? '<div class="campaign-world-map__corner-actions"><button class="campaign-world-map__corner-btn campaign-world-map__corner-btn--tl" type="button" data-role="select-leader">Chọn Tướng</button><button class="campaign-world-map__corner-btn campaign-world-map__corner-btn--tr" type="button">Thành Trì</button><button class="campaign-world-map__corner-btn campaign-world-map__corner-btn--bl" type="button">Kho</button><button class="campaign-world-map__corner-btn campaign-world-map__corner-btn--br" type="button">Nhiệm Vụ</button></div>' : ''}
    <div class="campaign-world-map__viewport" data-role="viewport">
      <div class="campaign-world-map__canvas" data-role="canvas">
        <div class="campaign-world-map__bg"></div>
        <div class="campaign-world-map__terrain"></div>
      </div>
    </div>
    <div class="campaign-world-map__overlay">
      <aside class="campaign-panel campaign-panel--left">
        <h3>Stage theo Location</h3>
        <div class="campaign-stage-list" data-role="stage-list"></div>
      </aside>
      <div class="campaign-panel campaign-panel--middle" data-role="location-info"></div>
      <aside class="campaign-panel campaign-panel--right" data-role="stage-info"></aside>
    </div>
    <div class="leader-modal" data-role="leader-modal" hidden></div>
  `;

  const viewport = container.querySelector('[data-role="viewport"]');
  const canvas = container.querySelector('[data-role="canvas"]');
  const stageList = container.querySelector('[data-role="stage-list"]');
  const stageInfo = container.querySelector('[data-role="stage-info"]');
  const locationInfo = container.querySelector('[data-role="location-info"]');
  const backButton = container.querySelector('.campaign-world-map__back');

  function setCurrentView(next: CampaignView): void {
    currentView = next;
    container.classList.toggle('campaign-world-map--stage-detail', currentView === 'stage_detail');
  }

  function clampOffset(nextX: number, nextY: number): { x: number; y: number } {
    if (!(viewport instanceof HTMLElement)) return { x: nextX, y: nextY };
    const boundsX = Math.max(0, WORLD_SIZE - viewport.clientWidth);
    const boundsY = Math.max(0, WORLD_SIZE - viewport.clientHeight);
    return {
      x: Math.max(-boundsX, Math.min(0, nextX)),
      y: Math.max(-boundsY, Math.min(0, nextY)),
    };
  }

  let lastAppliedOffsetX = Number.NaN;
  let lastAppliedOffsetY = Number.NaN;

  function applyCanvasTransform(): void {
    if (!(canvas instanceof HTMLElement)) return;
    const clamped = clampOffset(offsetX, offsetY);
    offsetX = clamped.x;
    offsetY = clamped.y;
    if (offsetX === lastAppliedOffsetX && offsetY === lastAppliedOffsetY) return;
    lastAppliedOffsetX = offsetX;
    lastAppliedOffsetY = offsetY;
    canvas.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  }

  function centerOnNode(node: WorldNode): void {
    if (!(viewport instanceof HTMLElement)) return;
    const targetX = -(node.left - viewport.clientWidth / 2);
    const targetY = -(node.top - viewport.clientHeight / 2);
    const clamped = clampOffset(targetX, targetY);
    offsetX = clamped.x;
    offsetY = clamped.y;
    applyCanvasTransform();
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
      stageInfo.innerHTML = '<div class="campaign-empty">Chọn một stage ở panel trái để xem Boss info, Passive và nút Attack.</div>';
      return;
    }

    const bossName = resolveBossName(selectedStage.bossId);
    stageInfo.innerHTML = `
      <div class="campaign-boss">
        <img class="campaign-boss__portrait" src="${bossPortraitPath(selectedStage.bossId)}" alt="${bossName}"/>
        <div>
          <h2 class="campaign-boss__title">${selectedStage.id} · ${selectedStage.title}</h2>
          <div class="campaign-boss__name">Boss: ${bossName}</div>
          ${bossInfoChips(selectedStage.bossId)}
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
      <button class="campaign-enter" type="button" data-role="attack">ATTACK ·</button>
    `;

    const attackButton = stageInfo.querySelector('[data-role="attack"]');
    if (attackButton instanceof HTMLButtonElement){
      attackButton.disabled = selectedStage.status === 'locked';
      attackButton.addEventListener('click', () => {
        if (!shell || typeof shell.enterScreen !== 'function') return;
        shell.enterScreen(isVinhDa ? 'vinh-da-gameplay' : 'pve-session', {
          modeKey,
          stageId: selectedStage?.id,
          bossId: selectedStage?.bossId,
          leaderId: selectedLeaderId,
        });
      });
    }
  }

  function renderList(): void {
    if (!(stageList instanceof HTMLElement) || !selectedLocation) return;
    stageList.innerHTML = '';
    const fragment = document.createDocumentFragment();
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
        setCurrentView('stage_detail');
        renderList();
        renderInfo();
      });
      fragment.appendChild(card);
    });
    stageList.appendChild(fragment);
  }

  function renderNodes(): void {
    if (!(canvas instanceof HTMLElement)) return;
    canvas.querySelectorAll('.campaign-node').forEach((node) => node.remove());

    const fragment = document.createDocumentFragment();
    worldNodes.forEach((nodeData) => {
      const location = locationById.get(nodeData.id);
      if (!location) return;

      const node = document.createElement('button');
      node.type = 'button';
      node.className = [
        'campaign-node',
        selectedLocation?.id === location.id ? 'campaign-node--active' : '',
        nodeData.isLocked ? 'campaign-node--locked' : ''
      ].filter(Boolean).join(' ');
      node.style.left = `${Math.round(nodeData.left)}px`;
      node.style.top = `${Math.round(nodeData.top)}px`;
      node.innerHTML = `<span class="campaign-node__badge">${nodeData.label}${nodeData.isLocked ? ' · Locked' : ''}</span><span class="campaign-node__dot"></span>`;

      if (nodeData.isLocked){
        node.disabled = true;
      } else {
        node.addEventListener('click', () => {
          selectedLocation = location;
          selectedStage = null;
          setCurrentView('stage_detail');
          centerOnNode(nodeData);
          renderNodes();
          renderLocationInfo();
          renderList();
          renderInfo();
        });
      }

      fragment.appendChild(node);
    });
    canvas.appendChild(fragment);
  }

  if (viewport instanceof HTMLElement){
    let pointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    viewport.addEventListener('pointerdown', (event) => {
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      queuedPointerDeltaX += deltaX;
      queuedPointerDeltaY += deltaY;
      if (pointerRafId) return;
      pointerRafId = window.requestAnimationFrame(() => {
        pointerRafId = 0;
        offsetX += queuedPointerDeltaX;
        offsetY += queuedPointerDeltaY;
        queuedPointerDeltaX = 0;
        queuedPointerDeltaY = 0;
        applyCanvasTransform();
      });
    });

    const releasePointer = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      viewport.classList.remove('is-dragging');
      viewport.releasePointerCapture(event.pointerId);
      queuedPointerDeltaX = 0;
      queuedPointerDeltaY = 0;
      if (pointerRafId){
        window.cancelAnimationFrame(pointerRafId);
        pointerRafId = 0;
      }
    };

    viewport.addEventListener('pointerup', releasePointer);
    viewport.addEventListener('pointercancel', releasePointer);
  }

  if (backButton instanceof HTMLButtonElement){
    backButton.addEventListener('click', () => {
      if (currentView === 'stage_detail'){
        setCurrentView('world_map');
        return;
      }
      if (shell && typeof shell.enterScreen === 'function'){
        setCurrentView('menu');
        shell.enterScreen(isVinhDa ? 'arena-hub' : 'main-menu');
      }
    });
  }

  const leaderButton = container.querySelector('[data-role="select-leader"]');
  const leaderModal = container.querySelector('[data-role="leader-modal"]');
  const renderLeaderModal = (): void => {
    if (!(leaderModal instanceof HTMLElement)) return;
    leaderModal.innerHTML = `
      <div class="leader-modal__panel">
        <div class="leader-modal__head"><h2>Chọn Tướng</h2><button type="button" data-role="close-leader">Đóng</button></div>
        <div class="leader-modal__grid">
          ${ROSTER.map((unit) => `<button type="button" class="leader-card${unit.id === selectedLeaderId ? ' leader-card--active' : ''}" data-leader-id="${unit.id}"><div class="leader-card__name">${unit.name}</div><div class="leader-card__meta">${unit.rank} · ${unit.class} · ${unit.base_element}</div></button>`).join('')}
        </div>
      </div>`;
  };
  if (leaderButton instanceof HTMLButtonElement && leaderModal instanceof HTMLElement){
    leaderButton.addEventListener('click', () => {
      renderLeaderModal();
      leaderModal.hidden = false;
    });
    leaderModal.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-role="close-leader"]') || target === leaderModal){
        leaderModal.hidden = true;
        return;
      }
      const card = target?.closest<HTMLButtonElement>('[data-leader-id]');
      if (!card) return;
      selectedLeaderId = card.dataset.leaderId || selectedLeaderId;
      renderLeaderModal();
    });
  }

  if (worldNodes[0]){
    centerOnNode(worldNodes[0]);
  }

  setCurrentView('world_map');
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
