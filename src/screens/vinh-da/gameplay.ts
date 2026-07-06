import { ROSTER, getMetaById } from '../../catalog.ts';
import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import type { MainMenuShell } from '../main-menu/types.ts';
import { getFrameRateCap } from '../../utils/frame-rate.ts';

import {
  BUILD_RANGE,
  BUILD_SITE_RENDER_BUFFER,
  BUILD_SITE_RENDER_THRESHOLD,
  CASTLE_LEFT,
  CASTLE_TOWER_OFFSET,
  CASTLE_TOWER_WIDTH,
  CASTLE_WIDTH,
  CRYSTAL_X,
  DEFAULT_STRUCTURE_COOLDOWN,
  GROUND_PERCENT,
  LEADER_EDGE_PADDING_LEFT,
  LEADER_EDGE_PADDING_RIGHT,
  LEADER_SPEED,
  LEADER_START_X,
  LEADER_WIDTH,
  STYLE_ID,
  WORLD_WIDTH
} from './constants.ts';
import type { EnemyKind } from './enemies.ts';
import {
  BUILD_LEVEL_COST,
  BUILD_NODE_OPTIONS,
  GROUND_BUILD_NODE_OPTIONS,
  BUILD_SITES,
  UPGRADE_NODE_LABEL,
  getStructureLevelStat,
  isStructureAllowedOnBuildSite,
} from './structures.ts';
import type { StructureType, WallBranchLv3, WallBranchLv5 } from './structures.ts';
import {
  DAY_DURATION_SECONDS,
  damageBase as runtimeDamageBase,
  damageStructure as runtimeDamageStructure,
  clearEnemiesWithoutReward as runtimeClearEnemiesWithoutReward,
  removeEnemyAt as runtimeRemoveEnemyAt,
  spawnEnemy as runtimeSpawnEnemy,
  updateDayNightTimer as runtimeUpdateDayNightTimer,
  updateEnemies as runtimeUpdateEnemies,
  updateStructures as runtimeUpdateStructures
} from './simulation.ts';
import type { DayNightPhase, VinhDaSimulationContext, VinhDaSimulationState } from './simulation.ts';
import type { BuildSite, Enemy, PlacedStructure, Side, StructureRuntime } from './types.ts';

interface RenderContext {
  root: HTMLElement;
  shell?: MainMenuShell | null;
  params?: Record<string, unknown> | null;
}

const CSS = /* css */ `
  .app--vinh-da-gameplay{min-height:100dvh;background:#020204;color:#f7f2ff;overflow:hidden;touch-action:none;}
  .vinh-da-game{position:relative;min-height:100dvh;overflow:hidden;background:linear-gradient(#020204 0 58%,#07070b 58% 100%);touch-action:none;user-select:none;}
  .vinh-da-game__hud{position:absolute;z-index:5;top:14px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;pointer-events:none;}
  .vinh-da-game__panel{pointer-events:auto;border:1px solid rgba(210,200,255,.2);border-radius:12px;background:rgba(0,0,0,.5);padding:8px 12px;box-shadow:0 10px 24px rgba(0,0,0,.28);font-size:16px;line-height:1.2;}
  .vinh-da-game__back{pointer-events:auto;border:0;border-radius:999px;background:#f3edff;color:#111020;width:42px;height:42px;font-size:22px;cursor:pointer;}
  .vinh-da-game__viewport{position:absolute;inset:0;overflow:hidden;cursor:pointer;}
  .vinh-da-game__world{position:absolute;left:0;top:0;width:${WORLD_WIDTH}px;height:100%;transform:translate3d(0,0,0);will-change:transform;background:radial-gradient(circle at 50% 28%,rgba(87,68,168,.34),transparent 18%),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 220px);}
  .vinh-da-game__ground{position:absolute;left:0;right:0;bottom:0;height:${GROUND_PERCENT};background:linear-gradient(#121018,#050507);border-top:1px solid rgba(210,200,255,.18);}
  .vinh-da-game__castle{position:absolute;left:${CASTLE_LEFT}px;bottom:${GROUND_PERCENT};width:${CASTLE_WIDTH}px;height:170px;background:linear-gradient(180deg,#202033,#0d0d16);border:2px solid rgba(226,222,255,.2);box-shadow:0 0 44px rgba(83,65,170,.3);}
  .vinh-da-game__castle::before,.vinh-da-game__castle::after{content:"";position:absolute;bottom:0;width:${CASTLE_TOWER_WIDTH}px;height:230px;background:#11111f;border:2px solid rgba(226,222,255,.18)}
  .vinh-da-game__castle::before{left:-${CASTLE_TOWER_OFFSET}px}.vinh-da-game__castle::after{right:-${CASTLE_TOWER_OFFSET}px}
  .vinh-da-game__crystal{position:absolute;left:${CRYSTAL_X}px;bottom:calc(${GROUND_PERCENT} + 34px);width:50px;height:72px;transform:translateX(-50%) rotate(45deg);border-radius:12px;background:linear-gradient(135deg,#eaffff,#a887ff 45%,#4cf6ff);box-shadow:0 0 18px #dff,0 0 42px rgba(121,93,255,.78);animation:vinh-da-crystal-shine 1.8s ease-in-out infinite;}
  .vinh-da-game__crystal::after{content:"";position:absolute;inset:8px 20px;background:rgba(255,255,255,.72);filter:blur(2px);}
  .vinh-da-game__leader{position:absolute;bottom:${GROUND_PERCENT};width:46px;height:82px;border-radius:10px 10px 6px 6px;background:linear-gradient(180deg,#f4d78a,#7447ff);box-shadow:0 0 26px rgba(245,215,138,.55);transform:translate3d(0,0,0);will-change:transform;z-index:2;}
  .vinh-da-game__enemy{position:absolute;bottom:${GROUND_PERCENT};width:38px;height:52px;margin-left:-19px;border-radius:18px 18px 8px 8px;background:linear-gradient(180deg,#d14b5f,#381018);box-shadow:0 0 18px rgba(209,75,95,.34);transform:translate3d(0,0,0);will-change:transform;z-index:2;}
  .vinh-da-game__rock{position:absolute;bottom:${GROUND_PERCENT};width:96px;height:58px;margin-left:-48px;border:0;border-radius:46% 54% 38% 42%;background:linear-gradient(150deg,#7e7b8e,#383746 58%,#1f1f2a);box-shadow:inset -12px -10px 18px rgba(0,0,0,.32),0 8px 22px rgba(0,0,0,.35);cursor:pointer;z-index:2;}
  .vinh-da-game__rock::after{content:"";position:absolute;left:18px;top:12px;width:42px;height:10px;border-radius:999px;background:rgba(255,255,255,.18);transform:rotate(-12deg);}
  .vinh-da-game__wall-slot{position:absolute;bottom:${GROUND_PERCENT};width:70px;height:78px;margin-left:-35px;border:1px dashed rgba(210,200,255,.32);border-radius:10px;background:linear-gradient(180deg,rgba(121,93,255,.12),rgba(16,14,26,.28));box-shadow:0 0 18px rgba(121,93,255,.16);cursor:pointer;z-index:2;}
  .vinh-da-game__wall-slot::after{content:"";position:absolute;left:12px;right:12px;bottom:10px;height:8px;border-radius:999px;background:rgba(210,200,255,.18);}
  .vinh-da-game__plot{position:absolute;bottom:${GROUND_PERCENT};width:86px;height:40px;margin-left:-43px;border:1px solid rgba(91,255,178,.58);border-radius:999px;background:rgba(91,255,178,.035);box-shadow:none;cursor:pointer;z-index:1;}
  .vinh-da-game__plot::after{content:"";position:absolute;left:16px;right:16px;top:50%;height:1px;background:rgba(91,255,178,.72);transform:translateY(-50%);}
  .vinh-da-game__rock.has-structure,.vinh-da-game__plot.has-structure{border-radius:10px 10px 4px 4px;border:1px solid rgba(226,222,255,.28);box-shadow:0 0 24px rgba(133,105,255,.45);}
  .vinh-da-game__plot.has-structure{width:96px;height:58px;margin-left:-48px;border-color:rgba(91,255,178,.72);outline:1px solid rgba(91,255,178,.32);background:rgba(8,8,16,.22);box-shadow:none;}
  .vinh-da-game__structure--watchtower{background:linear-gradient(180deg,#3a2b67,#12111f);}
  .vinh-da-game__structure--elementalTower{background:linear-gradient(180deg,#1f5b73,#101621);}
  .vinh-da-game__structure--barracks{background:linear-gradient(180deg,#463624,#14100d);}
  .vinh-da-game__structure--church{background:linear-gradient(180deg,#efe5ff,#44305f);}
  .vinh-da-game__structure--crystalSeal{background:linear-gradient(135deg,#eaffff,#7b5cff 48%,#39e8ff);}
  .vinh-da-game__structure--landmine{background:radial-gradient(circle at 50% 50%,#ff544d 0 18%,#2a1412 19% 54%,#100807 55% 100%);}
  .vinh-da-game__structure--swamp{background:radial-gradient(ellipse at 50% 62%,rgba(88,151,97,.85),rgba(28,57,48,.92) 58%,rgba(9,19,18,.96));}
  .vinh-da-game__rock.has-structure::before,.vinh-da-game__plot.has-structure::before,.vinh-da-game__wall-slot.has-structure::before{content:attr(data-structure-label);position:absolute;left:50%;bottom:64px;transform:translateX(-50%);font-size:11px;color:#eee6ff;text-shadow:0 1px 5px #000;white-space:nowrap;}
  .vinh-da-game__structure--wall{border-style:solid;border-color:rgba(226,222,255,.34);background:repeating-linear-gradient(90deg,#2e2944 0 18px,#181625 18px 36px);box-shadow:0 0 22px rgba(133,105,255,.38);}
  .vinh-da-game__structure--wall::before{bottom:84px;}
  .vinh-da-game__build-menu{position:absolute;bottom:calc(${GROUND_PERCENT} + 36px);width:170px;height:170px;margin-left:-85px;pointer-events:none;opacity:0;transform:scale(.88);transition:opacity .16s ease,transform .16s ease;z-index:4;}
  .vinh-da-game__build-menu.is-open{opacity:1;transform:scale(1);pointer-events:auto;}
  .vinh-da-game__build-node{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px;border-radius:999px;border:1px solid rgba(230,220,255,.42);background:rgba(8,8,16,.22);backdrop-filter:blur(2px);color:#f5f0ff;display:grid;place-items:center;font-size:24px;box-shadow:0 0 20px rgba(170,140,255,.2);}
  .vinh-da-game__build-node small{position:absolute;top:48px;font-size:9px;color:#d6ccff;text-shadow:0 1px 4px #000;white-space:nowrap;}
  .vinh-da-game__build-node:nth-child(1){transform:translate(0,-58px);}
  .vinh-da-game__build-node:nth-child(2){transform:translate(50px,-29px);}
  .vinh-da-game__build-node:nth-child(3){transform:translate(50px,29px);}
  .vinh-da-game__build-node:nth-child(4){transform:translate(0,58px);}
  .vinh-da-game__build-node:nth-child(5){transform:translate(-50px,29px);}
  .vinh-da-game__build-node:nth-child(6){transform:translate(-50px,-29px);}
  .vinh-da-game__build-menu.is-upgrade-menu{width:96px;height:96px;margin-left:-48px;}
  .vinh-da-game__build-menu.is-upgrade-menu .vinh-da-game__build-node{transform:translate(0,0);}
  .vinh-da-game__build-node[hidden]{display:none;}
  @keyframes vinh-da-crystal-shine{0%,100%{filter:brightness(1);transform:translateX(-50%) rotate(45deg) scale(1)}50%{filter:brightness(1.45);transform:translateX(-50%) rotate(45deg) scale(1.06)}}
`;

export function renderScreen(context: RenderContext): { destroy: () => void }{
  const { root, shell = null, params = null } = context;
  ensureStyleTag(STYLE_ID, { css: CSS });

  const leaderId = typeof params?.leaderId === 'string' ? params.leaderId : ROSTER[0]?.id;
  const leader = leaderId ? getMetaById(leaderId) : null;
  const frameCap = getFrameRateCap();
  const minFrameMs = 1000 / frameCap;
  let leaderX = LEADER_START_X;
  let targetX = leaderX;
  let cameraX = 0;
  let lastTime = performance.now();
  let lastFrameTime = performance.now();
  let rafId = 0;
  let openSiteId: string | null = null;
  let groundPlotsVisible = false;
  let selectedGroundPlotId: string | null = null;
  let bloodSealStone = 0;
  let baseHp = 100;
  const keys = new Set<string>();
  const structures = new Map<string, PlacedStructure>();
  const structureRuntimes = new Map<string, StructureRuntime>();
  const structureSitesByType = new Map<StructureType, Set<string>>();
  const enemies: Enemy[] = [];
  const enemyElements = new Map<number, HTMLElement>();
  let nextEnemyId = 1;
  let enemySpawnTimer = 0;
  let dayNightPhase: DayNightPhase = 'night';
  let phaseRemainingSeconds = DAY_DURATION_SECONDS;
  let leaderAttackCooldown = 0;

  const section = document.createElement('section');
  section.className = 'vinh-da-game';
  const mount = mountSection({ root, section, rootClasses: 'app--vinh-da-gameplay' });
  section.innerHTML = `
    <div class="vinh-da-game__hud">
      <div class="vinh-da-game__panel">
        <strong>Vĩnh Dạ · ${leader?.name ?? leaderId ?? 'Leader'}</strong>
        <div>Huyết ấn thạch: <span data-role="blood-seal-stone">${bloodSealStone}</span></div>
        <div>Phase: <span data-role="day-night-phase"></span></div>
        <div>Còn lại: <span data-role="phase-time-remaining"></span></div>
      </div>
      <button class="vinh-da-game__back" type="button" aria-label="Về World Map">↩</button>
    </div>
    <div class="vinh-da-game__viewport" data-role="viewport">
      <div class="vinh-da-game__world" data-role="world">
        <div class="vinh-da-game__castle" aria-hidden="true"></div>
        <div class="vinh-da-game__crystal" aria-label="Pha lê thành trì"></div>
        <div class="vinh-da-game__ground" aria-hidden="true"></div>
        <div data-role="build-sites"></div>
        <div data-role="enemies"></div>
        <div class="vinh-da-game__leader" data-role="leader" title="${leader?.name ?? leaderId ?? 'Leader'}"></div>
      </div>
    </div>`;

  const world = section.querySelector<HTMLElement>('[data-role="world"]');
  const sprite = section.querySelector<HTMLElement>('[data-role="leader"]');
  const viewport = section.querySelector<HTMLElement>('[data-role="viewport"]');
  const buildSitesContainer = section.querySelector<HTMLElement>('[data-role="build-sites"]');
  const enemiesContainer = section.querySelector<HTMLElement>('[data-role="enemies"]');
  const bloodSealStoneText = section.querySelector<HTMLElement>('[data-role="blood-seal-stone"]');
  const dayNightPhaseText = section.querySelector<HTMLElement>('[data-role="day-night-phase"]');
  const phaseTimeRemainingText = section.querySelector<HTMLElement>('[data-role="phase-time-remaining"]');
  const siteElements = new Map<string, HTMLElement>();
  const buildMenuElements = new Map<string, HTMLDivElement>();
  const buildNodeOptions = [...BUILD_NODE_OPTIONS, ...GROUND_BUILD_NODE_OPTIONS] as const;
  const structureClassNames = buildNodeOptions.map(option => `vinh-da-game__structure--${option.type}`);
  const buildSitesByX = [...BUILD_SITES].sort((a, b) => a.x - b.x);
  const buildSitesById = new Map(buildSitesByX.map(site => [site.id, site]));
  let lastRenderedCameraX = Number.POSITIVE_INFINITY;

  const getStructureMaxHp = (structure: PlacedStructure): number => getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5).hp;
  const ensureStructureRuntime = (structure: PlacedStructure): StructureRuntime => {
    const existing = structureRuntimes.get(structure.siteId);
    if (existing) return existing;
    const runtime = { cooldown: DEFAULT_STRUCTURE_COOLDOWN, hp: getStructureMaxHp(structure) };
    structureRuntimes.set(structure.siteId, runtime);
    return runtime;
  };
  const trackStructureType = (structure: PlacedStructure): void => {
    let siteIds = structureSitesByType.get(structure.type);
    if (!siteIds){
      siteIds = new Set<string>();
      structureSitesByType.set(structure.type, siteIds);
    }
    siteIds.add(structure.siteId);
  };
  const untrackStructureType = (structure: PlacedStructure): void => {
    const siteIds = structureSitesByType.get(structure.type);
    siteIds?.delete(structure.siteId);
    if (siteIds?.size === 0) structureSitesByType.delete(structure.type);
  };
  const setStructure = (structure: PlacedStructure): void => {
    const previous = structures.get(structure.siteId);
    if (previous) untrackStructureType(previous);
    structures.set(structure.siteId, structure);
    trackStructureType(structure);
  };
  const deleteStructure = (siteId: string): boolean => {
    const structure = structures.get(siteId);
    if (!structure) return false;
    untrackStructureType(structure);
    structures.delete(siteId);
    structureRuntimes.delete(siteId);
    return true;
  };
  const structureSiteIdsOfType = (type: StructureType): Iterable<string> => structureSitesByType.get(type) ?? [];

  const canAfford = (cost: number): boolean => bloodSealStone >= cost;
  const renderEconomy = (): void => {
    if (bloodSealStoneText) bloodSealStoneText.textContent = String(bloodSealStone);
  };
  const renderDayNightTimer = (): void => {
    if (dayNightPhaseText) dayNightPhaseText.textContent = simulationState.dayNightPhase === 'night' ? 'Đêm / combat' : 'Ngày';
    if (phaseTimeRemainingText){
      const totalSeconds = Math.max(0, Math.ceil(simulationState.phaseRemainingSeconds));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      phaseTimeRemainingText.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
  };
  const spend = (cost: number): boolean => {
    if (!canAfford(cost)) return false;
    bloodSealStone -= cost;
    renderEconomy();
    return true;
  };
  const clampLeaderX = (x: number): number => Math.max(LEADER_EDGE_PADDING_LEFT, Math.min(WORLD_WIDTH - LEADER_EDGE_PADDING_RIGHT, x));
  const getBuildSite = (siteId: string | null | undefined): BuildSite | null => siteId ? buildSitesById.get(siteId) ?? null : null;
  const nearestBuildSite = (): BuildSite | null => BUILD_SITES.find(site => Math.abs(leaderX - site.x) <= BUILD_RANGE) ?? null;
  const isGroundClick = (event: PointerEvent): boolean => {
    const bounds = viewport?.getBoundingClientRect();
    const viewportTop = bounds?.top ?? 0;
    const viewportHeight = bounds?.height || window.innerHeight || 1;
    return event.clientY >= viewportTop + viewportHeight * 0.58;
  };
  const getBuildSiteClassName = (site: BuildSite): string => {
    if (site.kind === 'wall-slot') return 'vinh-da-game__wall-slot';
    if (site.kind === 'ground') return 'vinh-da-game__plot';
    return 'vinh-da-game__rock';
  };
  const createBuildSiteElement = (site: BuildSite): void => {
    if (!buildSitesContainer || siteElements.has(site.id)) return;
    const button = document.createElement('button');
    button.className = getBuildSiteClassName(site);
    button.dataset.buildSiteId = site.id;
    button.style.left = `${site.x}px`;
    button.type = 'button';

    const menu = document.createElement('div');
    menu.className = 'vinh-da-game__build-menu';
    menu.dataset.buildMenu = site.id;
    menu.style.left = `${site.x}px`;
    const nodeOptions = buildNodeOptions.filter(option => isStructureAllowedOnBuildSite(option.type, site));
    nodeOptions.forEach((option) => {
      const node = document.createElement('button');
      node.className = 'vinh-da-game__build-node';
      node.dataset.structureType = option.type;
      node.type = 'button';
      node.setAttribute('aria-label', option.label);
      node.innerHTML = `+<small>${option.label}</small>`;
      menu.append(node);
    });
    const upgradeNode = document.createElement('button');
    upgradeNode.className = 'vinh-da-game__build-node';
    upgradeNode.dataset.action = 'upgrade';
    upgradeNode.type = 'button';
    upgradeNode.setAttribute('aria-label', UPGRADE_NODE_LABEL);
    upgradeNode.hidden = true;
    upgradeNode.innerHTML = `↑<small>${UPGRADE_NODE_LABEL}</small>`;
    menu.append(upgradeNode);

    const addActionNode = (action: string, label: string): void => {
      const node = document.createElement('button');
      node.className = 'vinh-da-game__build-node';
      node.dataset.action = action;
      node.type = 'button';
      node.setAttribute('aria-label', label);
      node.hidden = true;
      node.innerHTML = `◆<small>${label}</small>`;
      menu.append(node);
    };
    addActionNode('branch-lv3-spike', 'Gai nhọn');
    addActionNode('branch-lv3-slippery', 'Trơn tuột');
    addActionNode('branch-lv3-shock', 'Phản chấn');
    addActionNode('branch-lv5-biochemical', 'Sinh hoá');
    addActionNode('branch-lv5-curse', 'Nguyền rủa');
    addActionNode('branch-lv5-link', 'Liên kết');

    buildSitesContainer.append(button, menu);
    siteElements.set(site.id, button);
    buildMenuElements.set(site.id, menu);
    renderBuildSite(site.id);
  };
  const renderBuildMenu = (siteId: string): void => {
    const menu = buildMenuElements.get(siteId);
    const site = getBuildSite(siteId);
    if (!menu || !site) return;
    const structure = structures.get(siteId);
    menu.classList.toggle('is-upgrade-menu', Boolean(structure));
    for (const node of menu.querySelectorAll<HTMLElement>('.vinh-da-game__build-node')){
      const type = node.dataset.structureType as StructureType | undefined;
      const action = node.dataset.action;
      const isUpgradeNode = action === 'upgrade';
      const nextLevel = structure ? Math.min(structure.level + 1, 6) : 1;
      const cost = structure ? BUILD_LEVEL_COST[nextLevel as keyof typeof BUILD_LEVEL_COST] : BUILD_LEVEL_COST[1];
      const isLv3Branch = structure?.type === 'wall' && structure.level === 2 && action?.startsWith('branch-lv3-');
      const isLv5Branch = structure?.type === 'wall' && structure.level === 4 && action?.startsWith('branch-lv5-');
      const canBuildOnSurface = type ? isStructureAllowedOnBuildSite(type, site) : false;
      const canMount = structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && Boolean(type) && type !== 'wall' && canBuildOnSurface;
      node.hidden = structure
        ? (
            isUpgradeNode
              ? structure.level >= 6 || structure.level === 2 || structure.level === 4
              : action
                ? !(isLv3Branch || isLv5Branch)
                : !canMount
          )
        : isUpgradeNode || Boolean(action) || !type || !site.allowed.includes(type);
      if (node instanceof HTMLButtonElement) node.disabled = !node.hidden && !canAfford(cost);
    }
  };
  const renderBuildSite = (siteId: string): void => {
    const siteButton = siteElements.get(siteId);
    if (!siteButton) return;
    const site = getBuildSite(siteId);
    const structure = structures.get(siteId);
    const runtime = structure ? ensureStructureRuntime(structure) : null;
    siteButton.classList.remove(...structureClassNames);
    siteButton.classList.toggle('has-structure', Boolean(structure) && runtime !== null && runtime.hp > 0);
    if (structure && runtime !== null && runtime.hp > 0) siteButton.classList.add(`vinh-da-game__structure--${structure.type}`);
    siteButton.dataset.structureLabel = structure ? buildNodeOptions.find(option => option.type === structure.type)?.label ?? '' : '';
    siteButton.setAttribute('aria-label', structure ? `${siteButton.dataset.structureLabel} cấp ${structure.level}` : site?.kind === 'wall-slot' ? 'Điểm xây tường' : site?.kind === 'ground' ? 'Điểm đất xây dựng' : 'Ụ đá xây dựng');
    renderBuildMenu(siteId);
  };
  const renderVisibleBuildSites = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    const minX = cameraX - BUILD_SITE_RENDER_BUFFER;
    const maxX = cameraX + width + BUILD_SITE_RENDER_BUFFER;

    for (const [siteId, siteElement] of siteElements){
      const site = getBuildSite(siteId);
      const structure = structures.get(siteId);
      const shouldKeepGroundSite = site?.kind !== 'ground' || groundPlotsVisible || Boolean(structure);
      if (site && site.id !== openSiteId && (site.x < minX || site.x > maxX || !shouldKeepGroundSite)){
        const menuElement = buildMenuElements.get(site.id);
        siteElement.remove();
        menuElement?.remove();
        siteElements.delete(site.id);
        buildMenuElements.delete(site.id);
      }
    }

    for (const site of buildSitesByX){
      if (site.x < minX) continue;
      if (site.x > maxX) break;
      const structure = structures.get(site.id);
      const shouldRenderGroundSite = site.kind !== 'ground' || groundPlotsVisible || Boolean(structure);
      if (shouldRenderGroundSite) createBuildSiteElement(site);
    }
    lastRenderedCameraX = cameraX;
  };
  const setOpenBuildSite = (siteId: string | null): void => {
    openSiteId = siteId;
    selectedGroundPlotId = getBuildSite(siteId)?.kind === 'ground' ? siteId : null;
    if (siteId) renderBuildMenu(siteId);
    for (const menu of buildMenuElements.values()) menu.classList.toggle('is-open', menu.dataset.buildMenu === siteId);
  };
  const setGroundPlotsVisible = (visible: boolean): void => {
    if (groundPlotsVisible === visible) return;
    groundPlotsVisible = visible;
    if (!visible) selectedGroundPlotId = null;
    renderVisibleBuildSites();
  };

  const simulationState: VinhDaSimulationState = {
    get bloodSealStone(){ return bloodSealStone; },
    set bloodSealStone(value: number){ bloodSealStone = value; },
    get baseHp(){ return baseHp; },
    set baseHp(value: number){ baseHp = value; },
    get leaderX(){ return leaderX; },
    set leaderX(value: number){ leaderX = value; },
    enemies,
    nextEnemyId,
    enemySpawnTimer,
    dayNightPhase,
    phaseRemainingSeconds,
    leaderAttackCooldown,
    structures
  };
  const simulationContext: VinhDaSimulationContext = {
    state: simulationState,
    structureSitesByType,
    getBuildSite,
    ensureStructureRuntime,
    getStructureMaxHp,
    deleteStructure,
    structureSiteIdsOfType,
    renderEconomy,
    renderBuildSite,
    renderDayNightTimer,
    removeEnemyElement(enemyId: number): void {
      enemyElements.get(enemyId)?.remove();
      enemyElements.delete(enemyId);
    }
  };
  const syncSimulationState = (): void => {
    nextEnemyId = simulationState.nextEnemyId;
    enemySpawnTimer = simulationState.enemySpawnTimer;
    dayNightPhase = simulationState.dayNightPhase;
    phaseRemainingSeconds = simulationState.phaseRemainingSeconds;
    leaderAttackCooldown = simulationState.leaderAttackCooldown;
  };
  const spawnEnemy = (side: Side, kind: EnemyKind = 'twisted'): void => { runtimeSpawnEnemy(simulationContext, side, kind); syncSimulationState(); };
  const removeEnemyAt = (index: number, reward: boolean): void => { runtimeRemoveEnemyAt(simulationContext, index, reward); syncSimulationState(); };
  const clearEnemiesWithoutReward = (): void => { runtimeClearEnemiesWithoutReward(simulationContext); syncSimulationState(); };
  const damageStructure = (site: BuildSite, runtime: StructureRuntime, amount: number, attacker: Enemy | null = null): boolean => {
    const destroyed = runtimeDamageStructure(simulationContext, site, runtime, amount, attacker);
    syncSimulationState();
    return destroyed;
  };
  const damageBase = (amount: number): boolean => { const destroyed = runtimeDamageBase(simulationContext, amount); syncSimulationState(); return destroyed; };
  const updateEnemies = (dt: number): void => { runtimeUpdateEnemies(simulationContext, dt); syncSimulationState(); };
  const updateDayNightTimer = (dt: number): void => { runtimeUpdateDayNightTimer(simulationContext, dt); syncSimulationState(); };
  const updateStructures = (dt: number): void => { runtimeUpdateStructures(simulationContext, dt); syncSimulationState(); };

  const renderEnemies = (): void => {
    if (!enemiesContainer) return;
    const width = viewport?.clientWidth || window.innerWidth || 1;
    const minX = cameraX - BUILD_SITE_RENDER_BUFFER;
    const maxX = cameraX + width + BUILD_SITE_RENDER_BUFFER;
    for (const enemy of enemies){
      let element = enemyElements.get(enemy.id);
      const visible = enemy.x >= minX && enemy.x <= maxX;
      if (!visible){
        element?.remove();
        enemyElements.delete(enemy.id);
        continue;
      }
      if (!element){
        element = document.createElement('div');
        element.className = 'vinh-da-game__enemy';
        enemiesContainer.append(element);
        enemyElements.set(enemy.id, element);
      }
      element.style.transform = `translate3d(${enemy.x}px,0,0)`;
    }
  };

  const updateCamera = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    cameraX = Math.max(0, Math.min(WORLD_WIDTH - width, leaderX - width * 0.5));
    if (world) world.style.transform = `translate3d(${-cameraX}px,0,0)`;
    if (openSiteId && !nearestBuildSite()) setOpenBuildSite(null);
    if (Math.abs(cameraX - lastRenderedCameraX) > BUILD_SITE_RENDER_THRESHOLD) renderVisibleBuildSites();
    if (sprite) sprite.style.transform = `translate3d(${leaderX}px,0,0)`;
  };

  const tick = (now: number): void => {
    rafId = window.requestAnimationFrame(tick);
    if (now - lastFrameTime < minFrameMs) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    lastFrameTime = now;
    const left = keys.has('arrowleft') || keys.has('a');
    const right = keys.has('arrowright') || keys.has('d');
    const keyboardDirection = Number(right) - Number(left);
    if (keyboardDirection !== 0) targetX = leaderX;
    leaderX += keyboardDirection !== 0
      ? keyboardDirection * LEADER_SPEED * dt
      : Math.max(-LEADER_SPEED * dt, Math.min(LEADER_SPEED * dt, targetX - leaderX));
    leaderX = clampLeaderX(leaderX);
    updateDayNightTimer(dt);
    updateEnemies(dt);
    updateStructures(dt);
    updateCamera();
    renderEnemies();
  };

  const moveToClientX = (clientX: number): void => {
    targetX = clampLeaderX(clientX + cameraX - LEADER_WIDTH * 0.5);
    setOpenBuildSite(null);
  };
  const onViewportPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-build-site-id],.vinh-da-game__build-node,.vinh-da-game__back')) return;
    if (isGroundClick(event)){
      moveToClientX(event.clientX);
      setGroundPlotsVisible(true);
      return;
    }
    moveToClientX(event.clientX);
    setGroundPlotsVisible(false);
  };
  const onGameClick = (event: Event): void => {
    const target = event.target instanceof Element ? event.target : null;
    const buildNode = target?.closest<HTMLElement>('.vinh-da-game__build-node');
    if (buildNode){
      const site = getBuildSite(openSiteId);
      const structure = site ? structures.get(site.id) : null;
      const action = buildNode.dataset.action;
      if (site && structure && action){
        const nextLevel = structure.level + 1;
        if (action === 'upgrade' && structure.level < 6 && structure.level !== 2 && structure.level !== 4 && spend(BUILD_LEVEL_COST[nextLevel as keyof typeof BUILD_LEVEL_COST])){
          const upgraded = { ...structure, level: nextLevel };
          setStructure(upgraded);
          const runtime = ensureStructureRuntime(upgraded);
          runtime.hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
          } else if (structure.type === 'wall' && structure.level === 2 && action.startsWith('branch-lv3-') && spend(BUILD_LEVEL_COST[3])){
          const upgraded = { ...structure, level: 3, branchLv3: action.slice('branch-lv3-'.length) as WallBranchLv3 };
          setStructure(upgraded);
          ensureStructureRuntime(upgraded).hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
        } else if (structure.type === 'wall' && structure.level === 4 && action.startsWith('branch-lv5-') && spend(BUILD_LEVEL_COST[5])){
          const upgraded = { ...structure, level: 5, branchLv5: action.slice('branch-lv5-'.length) as WallBranchLv5 };
          setStructure(upgraded);
          ensureStructureRuntime(upgraded).hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
        }
      } else {
        const type = buildNode.dataset.structureType as StructureType | undefined;
        if (site && type && structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && type !== 'wall' && isStructureAllowedOnBuildSite(type, site) && spend(BUILD_LEVEL_COST[1])){
          const upgraded = { ...structure, mountedStructure: type };
          setStructure(upgraded);
          renderBuildSite(site.id);
        } else if (site && type && !structure && isStructureAllowedOnBuildSite(type, site) && spend(BUILD_LEVEL_COST[1])){
          const placed = { siteId: site.id, type, level: 1 };
          setStructure(placed);
          ensureStructureRuntime(placed);
          renderBuildSite(site.id);
        }
      }
      setOpenBuildSite(null);
      setGroundPlotsVisible(false);
      return;
    }

    const siteButton = target?.closest<HTMLElement>('[data-build-site-id]');
    if (!siteButton) return;
    const site = nearestBuildSite();
    if (!site || site.id !== siteButton.dataset.buildSiteId){
      targetX = clampLeaderX(Number.parseFloat(siteButton.style.left) || leaderX);
      setOpenBuildSite(null);
      if (getBuildSite(siteButton.dataset.buildSiteId)?.kind !== 'ground') setGroundPlotsVisible(false);
      return;
    }
    selectedGroundPlotId = site.kind === 'ground' ? site.id : null;
    if (site.kind !== 'ground') setGroundPlotsVisible(false);
    setOpenBuildSite(openSiteId === site.id ? null : site.id);
  };
  const onViewportResize = (): void => { renderVisibleBuildSites(); };
  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onViewportResize);
  const onKeyDown = (event: KeyboardEvent): void => { keys.add(event.key.toLowerCase()); };
  const onKeyUp = (event: KeyboardEvent): void => { keys.delete(event.key.toLowerCase()); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  if (viewport) resizeObserver?.observe(viewport);
  viewport?.addEventListener('pointerdown', onViewportPointerDown);
  section.addEventListener('click', onGameClick);
  section.querySelector('.vinh-da-game__back')?.addEventListener('click', () => {
    shell?.enterScreen?.('campaign-world-map', { modeKey: 'vinh-da', leaderId, stageId: params?.stageId });
  });
  updateCamera();
  renderDayNightTimer();
  spawnEnemy('left');
  spawnEnemy('right');
  renderEnemies();
  rafId = window.requestAnimationFrame(tick);

  return {
    destroy(){
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      resizeObserver?.disconnect();
      clearEnemiesWithoutReward();
      viewport?.removeEventListener('pointerdown', onViewportPointerDown);
      section.removeEventListener('click', onGameClick);
      mount.destroy();
    }
  };
}

export const render = renderScreen;
