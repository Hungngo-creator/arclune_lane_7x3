import { ROSTER, getMetaById } from '../../catalog.ts';
import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import type { MainMenuShell } from '../main-menu/types.ts';

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
  ENEMY_ATTACK_RANGE,
  ENEMY_LIMIT,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_START_PADDING,
  GROUND_PERCENT,
  LEADER_ATTACK_RANGE,
  LEADER_BASIC_ATTACK_COOLDOWN_SECONDS,
  LEADER_BASIC_ATTACK_DAMAGE,
  LANDMINE_BLAST_RADIUS,
  LANDMINE_FUSE_SECONDS,
  LANDMINE_TRIGGER_RADIUS,
  LANDMINE_TRUE_DAMAGE,
  LEADER_EDGE_PADDING_LEFT,
  LEADER_EDGE_PADDING_RIGHT,
  LEADER_SPEED,
  LEADER_START_X,
  LEADER_WIDTH,
  STYLE_ID,
  SWAMP_RADIUS,
  WORLD_WIDTH
} from './constants.ts';
import { DEFAULT_ENEMY_TEMPLATE, ENEMY_TEMPLATES } from './enemies.ts';
import type { EnemyKind, EnemyTemplate } from './enemies.ts';
import {
  BUILD_LEVEL_COST,
  BUILD_NODE_OPTIONS,
  GROUND_BUILD_NODE_OPTIONS,
  BUILD_SITES,
  UPGRADE_NODE_LABEL,
  getStructureLevelStat
} from './structures.ts';
import type { StructureType, WallBranchLv3, WallBranchLv5 } from './structures.ts';
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
  .vinh-da-game__plot.has-structure{width:96px;height:58px;margin-left:-48px;background:rgba(8,8,16,.22);}
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
  let leaderX = LEADER_START_X;
  let targetX = leaderX;
  let cameraX = 0;
  let lastTime = performance.now();
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
  let leaderAttackCooldown = 0;

  const section = document.createElement('section');
  section.className = 'vinh-da-game';
  const mount = mountSection({ root, section, rootClasses: 'app--vinh-da-gameplay' });
  section.innerHTML = `
    <div class="vinh-da-game__hud">
      <div class="vinh-da-game__panel">
        <strong>Vĩnh Dạ · ${leader?.name ?? leaderId ?? 'Leader'}</strong>
        <div>Huyết ấn thạch: <span data-role="blood-seal-stone">${bloodSealStone}</span></div>
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
  const siteElements = new Map<string, HTMLElement>();
  const buildMenuElements = new Map<string, HTMLDivElement>();
  const buildNodeOptions = [...BUILD_NODE_OPTIONS, ...GROUND_BUILD_NODE_OPTIONS] as const;
  const structureClassNames = buildNodeOptions.map(option => `vinh-da-game__structure--${option.type}`);
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
  const spend = (cost: number): boolean => {
    if (!canAfford(cost)) return false;
    bloodSealStone -= cost;
    renderEconomy();
    return true;
  };
  const clampLeaderX = (x: number): number => Math.max(LEADER_EDGE_PADDING_LEFT, Math.min(WORLD_WIDTH - LEADER_EDGE_PADDING_RIGHT, x));
  const getBuildSite = (siteId: string | null | undefined): BuildSite | null => BUILD_SITES.find(site => site.id === siteId) ?? null;
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
    const nodeOptions = site.kind === 'ground'
      ? GROUND_BUILD_NODE_OPTIONS
      : BUILD_NODE_OPTIONS;
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
      const canMount = structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && Boolean(type) && type !== 'wall' && site.allowed.includes('wall');
      node.hidden = structure
        ? !(isLv3Branch || isLv5Branch || canMount || (isUpgradeNode && structure.level < 6 && structure.level !== 2 && structure.level !== 4))
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
    for (const site of BUILD_SITES){
      const structure = structures.get(site.id);
      const shouldRenderGroundSite = site.kind !== 'ground' || groundPlotsVisible || site.id === openSiteId || site.id === selectedGroundPlotId || Boolean(structure);
      if (site.x >= minX && site.x <= maxX && shouldRenderGroundSite){
        createBuildSiteElement(site);
        renderBuildSite(site.id);
      } else if (site.id !== openSiteId){
        const siteElement = siteElements.get(site.id);
        const menuElement = buildMenuElements.get(site.id);
        if (siteElement && menuElement){
          siteElement.remove();
          menuElement.remove();
          siteElements.delete(site.id);
          buildMenuElements.delete(site.id);
        }
      }
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

  const spawnEnemy = (side: Side, kind: EnemyKind = 'twisted'): void => {
    if (enemies.length >= ENEMY_LIMIT) return;
    const template = ENEMY_TEMPLATES[kind] ?? DEFAULT_ENEMY_TEMPLATE;
    enemies.push({
      id: nextEnemyId,
      x: side === 'left' ? ENEMY_START_PADDING : WORLD_WIDTH - ENEMY_START_PADDING,
      kind: template.kind,
      hp: template.hp,
      maxHp: template.hp,
      speed: template.speed,
      baseSpeed: template.speed,
      weight: template.weight,
      attackCooldown: template.attackCooldown,
      canFly: template.canFly,
      side
    });
    nextEnemyId += 1;
  };
  const removeEnemyAt = (index: number, reward: boolean): void => {
    const [enemy] = enemies.splice(index, 1);
    if (!enemy) return;
    enemyElements.get(enemy.id)?.remove();
    enemyElements.delete(enemy.id);
    if (reward){
      bloodSealStone += ENEMY_TEMPLATES[enemy.kind].reward;
      renderEconomy();
    }
  };
  const clearEnemiesWithoutReward = (): void => {
    while (enemies.length > 0) removeEnemyAt(enemies.length - 1, false);
    enemySpawnTimer = 0;
  };
  const getBlockingWall = (enemy: Enemy): { site: BuildSite; runtime: StructureRuntime } | null => {
    for (const siteId of structureSiteIdsOfType('wall')){
      const structure = structures.get(siteId);
      if (!structure) continue;
      const site = getBuildSite(siteId);
      if (!site || (enemy.side === 'left' ? site.x >= CRYSTAL_X : site.x <= CRYSTAL_X)) continue;
      const runtime = ensureStructureRuntime(structure);
      if (runtime.hp > 0 && Math.abs(enemy.x - site.x) <= ENEMY_ATTACK_RANGE) return { site, runtime };
    }
    return null;
  };
  const damageEnemy = (enemy: Enemy, amount: number): boolean => {
    enemy.hp -= amount;
    return enemy.hp <= 0;
  };
  const reduceStructureDamage = (structure: PlacedStructure, runtime: StructureRuntime, attacker: Enemy | null, amount: number): number => {
    if (structure.type !== 'wall' || structure.branchLv3 !== 'slippery' || !attacker) return amount;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const cooldowns = runtime.attackerCooldowns ??= new Map<string, number>();
    const key = `slippery:${attacker.id}`;
    if ((cooldowns.get(key) ?? 0) > 0 || Math.random() >= (stat.slipperyChance ?? 0)) return amount;
    cooldowns.set(key, stat.slipperyCooldownSeconds ?? 3);
    return amount * (stat.slipperyDamageMultiplier ?? 1);
  };
  const triggerWallHitEffects = (structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, attacker: Enemy): void => {
    if (structure.type !== 'wall') return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const cooldowns = runtime.attackerCooldowns ??= new Map<string, number>();
    if (structure.branchLv3 === 'spike' && stat.spikeTrueDamage && damageEnemy(attacker, stat.spikeTrueDamage)) return;
    if (structure.branchLv3 === 'shock'){
      const key = `shock:${attacker.id}`;
      if ((cooldowns.get(key) ?? 0) <= 0){
        attacker.x += (attacker.side === 'left' ? -1 : 1) * (stat.shockKnockback ?? 0);
        cooldowns.set(key, stat.shockCooldownSeconds ?? 3);
      }
    }
    if (structure.branchLv5 === 'curse'){
      const key = `curse:${attacker.id}`;
      if ((cooldowns.get(key) ?? 0) <= 0){
        const loss = attacker.maxHp * (stat.curseMaxHpPercent ?? 0);
        attacker.maxHp = Math.max(1, attacker.maxHp - loss);
        attacker.hp = Math.min(attacker.hp, attacker.maxHp);
        cooldowns.set(key, stat.curseCooldownSeconds ?? 3);
      }
    }
  };
  const damageStructure = (site: BuildSite, runtime: StructureRuntime, amount: number, attacker: Enemy | null = null): boolean => {
    const structure = structures.get(site.id);
    const finalAmount = structure ? reduceStructureDamage(structure, runtime, attacker, amount) : amount;
    runtime.hp -= finalAmount;
    if (structure && attacker && runtime.hp > 0) triggerWallHitEffects(structure, site, runtime, attacker);
    if (runtime.hp > 0) return false;
    deleteStructure(site.id);
    renderBuildSite(site.id);
    return true;
  };
  const damageBase = (amount: number): boolean => {
    baseHp = Math.max(0, baseHp - amount);
    return baseHp <= 0;
  };
  const getEnemyTemplate = (enemy: Enemy): EnemyTemplate => ENEMY_TEMPLATES[enemy.kind] ?? DEFAULT_ENEMY_TEMPLATE;
  const getEnemyPrimaryTargetX = (enemy: Enemy): number => enemy.canFly ? leaderX : CRYSTAL_X;
  const getEnemyMoveDirection = (enemy: Enemy, targetX = getEnemyPrimaryTargetX(enemy)): number => enemy.x < targetX ? 1 : -1;
  const getStructureAhead = (enemy: Enemy, range: number): { site: BuildSite; runtime: StructureRuntime } | null => {
    const direction = getEnemyMoveDirection(enemy);
    let closest: { site: BuildSite; runtime: StructureRuntime; distance: number } | null = null;
    for (const structure of structures.values()){
      if (structure.type === 'wall') continue;
      const site = getBuildSite(structure.siteId);
      if (!site) continue;
      const distance = Math.abs(enemy.x - site.x);
      const isAhead = direction > 0 ? site.x >= enemy.x : site.x <= enemy.x;
      if (!isAhead || distance > range) continue;
      const runtime = ensureStructureRuntime(structure);
      if (runtime.hp <= 0 || (closest && distance >= closest.distance)) continue;
      closest = { site, runtime, distance };
    }
    return closest ? { site: closest.site, runtime: closest.runtime } : null;
  };
  const tryEnemyAttack = (enemy: Enemy, template: EnemyTemplate, attack: () => void): boolean => {
    if (enemy.attackCooldown > 0) return true;
    attack();
    enemy.attackCooldown = template.attackCooldown;
    return true;
  };
  const getEnemyEffectiveSpeed = (enemy: Enemy): number => {
    if (enemy.canFly) return enemy.baseSpeed;
    for (const siteId of structureSiteIdsOfType('swamp')){
      const site = getBuildSite(siteId);
      if (site && Math.abs(enemy.x - site.x) <= SWAMP_RADIUS){
        if (enemy.weight <= 1) return enemy.baseSpeed * 0.5;
        if (enemy.weight === 2) return enemy.baseSpeed * 0.75;
        return enemy.baseSpeed;
      }
    }
    return enemy.baseSpeed;
  };
  const moveEnemyToward = (enemy: Enemy, targetX: number, dt: number, speed = getEnemyEffectiveSpeed(enemy)): void => {
    enemy.x += getEnemyMoveDirection(enemy, targetX) * speed * dt;
  };
  const attackEnemyTarget = (enemy: Enemy, template: EnemyTemplate, targetX: number, dt: number): void => {
    if (Math.abs(enemy.x - targetX) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => { damageBase(template.damage); });
      return;
    }
    moveEnemyToward(enemy, targetX, dt);
  };
  const updateMeleeBasicEnemy = (enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => { damageStructure(wall.site, wall.runtime, template.damage, enemy); });
      return;
    }
    attackEnemyTarget(enemy, template, getEnemyPrimaryTargetX(enemy), dt);
  };
  const updateSuicideBomberEnemy = (enemy: Enemy, template: EnemyTemplate, index: number, dt: number): void => {
    const wall = getBlockingWall(enemy);
    if (wall && Math.abs(enemy.x - wall.site.x) <= template.attackRange){
      damageStructure(wall.site, wall.runtime, template.damage, enemy);
      removeEnemyAt(index, false);
      return;
    }
    if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange){
      damageBase(template.damage);
      removeEnemyAt(index, false);
      return;
    }
    moveEnemyToward(enemy, CRYSTAL_X, dt);
  };
  const updateFlyingEnemy = (enemy: Enemy, template: EnemyTemplate, index: number, dt: number): void => {
    const targetX = getEnemyPrimaryTargetX(enemy);
    if (Math.abs(enemy.x - targetX) <= template.attackRange){
      damageBase(template.damage);
      removeEnemyAt(index, false);
      return;
    }
    moveEnemyToward(enemy, targetX, dt, enemy.baseSpeed);
  };
  const updateDarkMageEnemy = (enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => { damageStructure(wall.site, wall.runtime, template.damage, enemy); });
      return;
    }
    if (Math.abs(enemy.x - CRYSTAL_X) > template.attackRange){
      moveEnemyToward(enemy, CRYSTAL_X, dt);
      return;
    }
    enemy.mageOrbTimer = (enemy.mageOrbTimer ?? 0) + dt;
    while (enemy.mageOrbTimer >= 2 && (enemy.mageOrbs ?? 0) < 3){
      enemy.mageOrbTimer -= 2;
      enemy.mageOrbs = (enemy.mageOrbs ?? 0) + 1;
    }
    if ((enemy.mageOrbs ?? 0) >= 3){
      tryEnemyAttack(enemy, template, () => {
        damageBase(template.damage * (enemy.mageOrbs ?? 3));
        enemy.mageOrbs = 0;
        enemy.mageOrbTimer = 0;
      });
    }
  };
  const damageDragonStructureCounter = (site: BuildSite, runtime: StructureRuntime): boolean => {
    const structure = structures.get(site.id);
    if (!structure || structure.type === 'wall') return false;
    runtime.dragonHitCount = (runtime.dragonHitCount ?? 0) + 1;
    if (runtime.dragonHitCount < structure.level) return false;
    deleteStructure(site.id);
    renderBuildSite(site.id);
    return true;
  };
  const updateResentfulDragonEnemy = (enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const structureAhead = getStructureAhead(enemy, template.attackRange);
    if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange || structureAhead){
      tryEnemyAttack(enemy, template, () => {
        if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange) damageBase(template.damage);
        if (structureAhead) damageDragonStructureCounter(structureAhead.site, structureAhead.runtime);
      });
      return;
    }
    moveEnemyToward(enemy, CRYSTAL_X, dt, enemy.baseSpeed);
  };
  const isUnitInLandmineTriggerRadius = (site: BuildSite): boolean => (
    Math.abs(leaderX - site.x) <= LANDMINE_TRIGGER_RADIUS
    || enemies.some(enemy => Math.abs(enemy.x - site.x) <= LANDMINE_TRIGGER_RADIUS)
  );
  const explodeLandmine = (site: BuildSite): void => {
    for (let i = enemies.length - 1; i >= 0; i -= 1){
      const enemy = enemies[i];
      if (enemy && Math.abs(enemy.x - site.x) <= LANDMINE_BLAST_RADIUS && damageEnemy(enemy, LANDMINE_TRUE_DAMAGE)) removeEnemyAt(i, true);
    }
    deleteStructure(site.id);
    renderBuildSite(site.id);
  };
  const updateEnemies = (dt: number): void => {
    enemySpawnTimer += dt;
    leaderAttackCooldown = Math.max(0, leaderAttackCooldown - dt);
    while (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL){
      enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
      spawnEnemy(nextEnemyId % 2 === 0 ? 'left' : 'right');
    }

    for (let i = enemies.length - 1; i >= 0; i -= 1){
      const enemy = enemies[i];
      if (!enemy) continue;
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
      const template = getEnemyTemplate(enemy);
      switch (enemy.kind){
        case 'suicideBomber':
          updateSuicideBomberEnemy(enemy, template, i, dt);
          break;
        case 'mutantBird':
          updateFlyingEnemy(enemy, template, i, dt);
          break;
        case 'darkMage':
          updateDarkMageEnemy(enemy, template, dt);
          break;
        case 'resentfulDragon':
          updateResentfulDragonEnemy(enemy, template, dt);
          break;
        case 'twisted':
        case 'crawler':
        case 'madDog':
        case 'ironMan':
          updateMeleeBasicEnemy(enemy, template, dt);
          break;
      }
      if (!enemies.includes(enemy)) continue;
      if (leaderAttackCooldown === 0 && Math.abs(enemy.x - leaderX) <= LEADER_ATTACK_RANGE){
        leaderAttackCooldown = LEADER_BASIC_ATTACK_COOLDOWN_SECONDS;
        if (damageEnemy(enemy, LEADER_BASIC_ATTACK_DAMAGE)) removeEnemyAt(i, true);
      }
    }
  };
  const updateStructureRuntimeTimers = (runtime: StructureRuntime, dt: number): void => {
    for (const [key, remaining] of runtime.attackerCooldowns ?? []){
      const next = Math.max(0, remaining - dt);
      if (next > 0) runtime.attackerCooldowns?.set(key, next);
      else runtime.attackerCooldowns?.delete(key);
    }
  };
  const updateWallRegeneration = (structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
    if (structure.type !== 'wall') return;
    const maxHp = getStructureMaxHp(structure);
    const regen = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5).hpRegen ?? 0;
    runtime.hp = Math.min(maxHp, runtime.hp + regen * dt);
  };
  const updateStructures = (dt: number): void => {
    for (const structure of structures.values()){
      const runtime = ensureStructureRuntime(structure);
      updateStructureRuntimeTimers(runtime, dt);
      updateWallRegeneration(structure, runtime, dt);
    }
    for (const type of ['watchtower', 'elementalTower'] as const){
      for (const siteId of structureSiteIdsOfType(type)){
        const structure = structures.get(siteId);
        if (!structure) continue;
        const site = getBuildSite(structure.siteId);
      if (!site) continue;
      const runtime = ensureStructureRuntime(structure);
      runtime.cooldown = Math.max(0, runtime.cooldown - dt);
      if (runtime.cooldown > 0) continue;
      const stat = getStructureLevelStat(structure.type, structure.level);
      const target = enemies.find(enemy => Math.abs(enemy.x - site.x) <= (stat.range ?? 0));
      if (!target) continue;
      runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
      if (damageEnemy(target, stat.damage ?? 0)) removeEnemyAt(enemies.indexOf(target), true);
        }
    }

    for (const siteId of [...structureSiteIdsOfType('landmine')]){
      const structure = structures.get(siteId);
      const site = getBuildSite(siteId);
      if (!structure || !site) continue;
      const runtime = ensureStructureRuntime(structure);
      if (!runtime.armed && isUnitInLandmineTriggerRadius(site)){
        runtime.armed = true;
        runtime.fuse = LANDMINE_FUSE_SECONDS;
      }
      if (!runtime.armed) continue;
      runtime.fuse = Math.max(0, (runtime.fuse ?? LANDMINE_FUSE_SECONDS) - dt);
      if (runtime.fuse <= 0) explodeLandmine(site);
    }
  };
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
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const left = keys.has('arrowleft') || keys.has('a');
    const right = keys.has('arrowright') || keys.has('d');
    const keyboardDirection = Number(right) - Number(left);
    if (keyboardDirection !== 0) targetX = leaderX;
    leaderX += keyboardDirection !== 0
      ? keyboardDirection * LEADER_SPEED * dt
      : Math.max(-LEADER_SPEED * dt, Math.min(LEADER_SPEED * dt, targetX - leaderX));
    leaderX = clampLeaderX(leaderX);
    updateEnemies(dt);
    updateStructures(dt);
    updateCamera();
    renderEnemies();
    rafId = window.requestAnimationFrame(tick);
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
        if (site && type && structure?.type === 'wall' && structure.level >= 6 && !structure.mountedStructure && type !== 'wall' && spend(BUILD_LEVEL_COST[1])){
          const upgraded = { ...structure, mountedStructure: type };
          setStructure(upgraded);
          renderBuildSite(site.id);
        } else if (site && type && !structure && site.allowed.includes(type) && spend(BUILD_LEVEL_COST[1])){
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
