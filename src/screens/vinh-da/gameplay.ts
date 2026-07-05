import { ROSTER, getMetaById } from '../../catalog.ts';
import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import type { MainMenuShell } from '../main-menu/types.ts';

interface RenderContext {
  root: HTMLElement;
  shell?: MainMenuShell | null;
  params?: Record<string, unknown> | null;
}

type BuildSiteKind = 'rock' | 'ground' | 'wall-slot';
type StructureType = 'watchtower' | 'wall' | 'elementalTower' | 'barracks' | 'church' | 'crystalSeal';

interface BuildSite {
  id: string;
  x: number;
  kind: BuildSiteKind;
  allowed: readonly StructureType[];
}

interface PlacedStructure {
  siteId: string;
  type: StructureType;
  level: number;
}

type Side = 'left' | 'right';

interface Enemy {
  id: number;
  x: number;
  hp: number;
  speed: number;
  side: Side;
}

interface StructureRuntime {
  cooldown: number;
  hp: number;
}

const STYLE_ID = 'vinh-da-gameplay-style';
const BASE_WORLD_WIDTH = 3600;
const SIDE_EXPANSION_MULTIPLIER = 3;
const WORLD_WIDTH = BASE_WORLD_WIDTH * (1 + SIDE_EXPANSION_MULTIPLIER * 2);
const WORLD_CENTER_X = WORLD_WIDTH / 2;
const LEADER_SPEED = 420;
const CASTLE_WIDTH = 190;
const CASTLE_LEFT = WORLD_CENTER_X - CASTLE_WIDTH * 0.5;
const CASTLE_TOWER_OFFSET = 60;
const CASTLE_TOWER_WIDTH = 54;
const CASTLE_OUTER_LEFT = CASTLE_LEFT - CASTLE_TOWER_OFFSET;
const CASTLE_OUTER_RIGHT = CASTLE_LEFT + CASTLE_WIDTH + CASTLE_TOWER_OFFSET;
const CRYSTAL_X = WORLD_CENTER_X;
const LEADER_START_X = CRYSTAL_X + 110;
const BUILD_RANGE = 150;
const BUILD_SITE_SPACING = 720;
const BUILD_SITE_CASTLE_PADDING = 360;
const BUILD_SITE_EDGE_PADDING = 160;
const BUILD_SITE_RENDER_BUFFER = 800;
const BUILD_SITE_RENDER_THRESHOLD = 160;
const ENEMY_LIMIT = 30;
const ENEMY_REWARD = 1;
const ENEMY_SPAWN_INTERVAL = 1.4;
const ENEMY_START_PADDING = 120;
const ENEMY_BASE_HP = 3;
const ENEMY_BASE_SPEED = 46;
const ENEMY_ATTACK_RANGE = 28;
const ENEMY_WALL_DAMAGE_PER_SECOND = 1;
const WALL_BASE_HP = 8;
const TOWER_RANGE = 460;
const TOWER_DAMAGE = 1;
const TOWER_COOLDOWN_SECONDS = 0.55;
const LEADER_ATTACK_RANGE = 58;
const LEADER_DAMAGE_PER_SECOND = 2.5;
const UPGRADE_NODE_LABEL = 'Nâng cấp';
const BUILD_LEVEL_COST = {
  1: 0,
  2: 1
} as const satisfies Record<number, number>;
const BUILD_NODE_OPTIONS = [
  { label: 'Tháp', type: 'watchtower' },
  { label: 'Tường', type: 'wall' },
  { label: 'Bẫy', type: 'elementalTower' },
  { label: 'Pha lê', type: 'crystalSeal' },
  { label: 'Ấn', type: 'church' },
  { label: 'Trại', type: 'barracks' }
] as const satisfies readonly { label: string; type: StructureType }[];
const GROUND_BUILD_SITE_ALLOWED = ['watchtower', 'elementalTower', 'barracks', 'church'] as const satisfies readonly StructureType[];
const createGroundBuildSites = (): BuildSite[] => {
  const sites: BuildSite[] = [];
  const addSide = (side: 'left' | 'right', startX: number, endX: number): void => {
    const direction = side === 'left' ? -1 : 1;
    let index = 1;
    for (let x = startX; direction < 0 ? x >= endX : x <= endX; x += direction * BUILD_SITE_SPACING){
      sites.push({ id: `ground-${side}-${index}`, x, kind: 'ground', allowed: GROUND_BUILD_SITE_ALLOWED });
      index += 1;
    }
  };

  addSide('left', CASTLE_OUTER_LEFT - BUILD_SITE_CASTLE_PADDING, BUILD_SITE_EDGE_PADDING);
  addSide('right', CASTLE_OUTER_RIGHT + BUILD_SITE_CASTLE_PADDING, WORLD_WIDTH - BUILD_SITE_EDGE_PADDING);
  return sites;
};
const BUILD_SITES = [
  { id: 'wall-left', x: CASTLE_OUTER_LEFT - 120, kind: 'wall-slot', allowed: ['wall'] },
  { id: 'wall-right', x: CASTLE_OUTER_RIGHT + 120, kind: 'wall-slot', allowed: ['wall'] },
  { id: 'castle-ground', x: CRYSTAL_X, kind: 'ground', allowed: ['church', 'crystalSeal'] },
  ...createGroundBuildSites()
] as const satisfies readonly BuildSite[];
const CSS = /* css */ `
  .app--vinh-da-gameplay{min-height:100dvh;background:#020204;color:#f7f2ff;overflow:hidden;touch-action:none;}
  .vinh-da-game{position:relative;min-height:100dvh;overflow:hidden;background:linear-gradient(#020204 0 58%,#07070b 58% 100%);touch-action:none;user-select:none;}
  .vinh-da-game__hud{position:absolute;z-index:5;top:14px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;pointer-events:none;}
  .vinh-da-game__panel{pointer-events:auto;border:1px solid rgba(210,200,255,.2);border-radius:12px;background:rgba(0,0,0,.5);padding:8px 12px;box-shadow:0 10px 24px rgba(0,0,0,.28);font-size:16px;line-height:1.2;}
  .vinh-da-game__back{pointer-events:auto;border:0;border-radius:999px;background:#f3edff;color:#111020;width:42px;height:42px;font-size:22px;cursor:pointer;}
  .vinh-da-game__viewport{position:absolute;inset:0;overflow:hidden;cursor:pointer;}
  .vinh-da-game__world{position:absolute;left:0;top:0;width:${WORLD_WIDTH}px;height:100%;transform:translate3d(0,0,0);will-change:transform;background:radial-gradient(circle at 50% 28%,rgba(87,68,168,.34),transparent 18%),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 220px);}
  .vinh-da-game__ground{position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(#121018,#050507);border-top:1px solid rgba(210,200,255,.18);}
  .vinh-da-game__castle{position:absolute;left:${CASTLE_LEFT}px;bottom:42%;width:${CASTLE_WIDTH}px;height:170px;background:linear-gradient(180deg,#202033,#0d0d16);border:2px solid rgba(226,222,255,.2);box-shadow:0 0 44px rgba(83,65,170,.3);}
  .vinh-da-game__castle::before,.vinh-da-game__castle::after{content:"";position:absolute;bottom:0;width:${CASTLE_TOWER_WIDTH}px;height:230px;background:#11111f;border:2px solid rgba(226,222,255,.18)}
  .vinh-da-game__castle::before{left:-${CASTLE_TOWER_OFFSET}px}.vinh-da-game__castle::after{right:-${CASTLE_TOWER_OFFSET}px}
  .vinh-da-game__crystal{position:absolute;left:${CRYSTAL_X}px;bottom:calc(42% + 34px);width:50px;height:72px;transform:translateX(-50%) rotate(45deg);border-radius:12px;background:linear-gradient(135deg,#eaffff,#a887ff 45%,#4cf6ff);box-shadow:0 0 18px #dff,0 0 42px rgba(121,93,255,.78);animation:vinh-da-crystal-shine 1.8s ease-in-out infinite;}
  .vinh-da-game__crystal::after{content:"";position:absolute;inset:8px 20px;background:rgba(255,255,255,.72);filter:blur(2px);}
  .vinh-da-game__leader{position:absolute;bottom:42%;width:46px;height:82px;border-radius:10px 10px 6px 6px;background:linear-gradient(180deg,#f4d78a,#7447ff);box-shadow:0 0 26px rgba(245,215,138,.55);transform:translate3d(0,0,0);will-change:transform;z-index:2;}
  .vinh-da-game__enemy{position:absolute;bottom:42%;width:38px;height:52px;margin-left:-19px;border-radius:18px 18px 8px 8px;background:linear-gradient(180deg,#d14b5f,#381018);box-shadow:0 0 18px rgba(209,75,95,.34);transform:translate3d(0,0,0);will-change:transform;z-index:2;}
  .vinh-da-game__rock{position:absolute;bottom:42%;width:96px;height:58px;margin-left:-48px;border:0;border-radius:46% 54% 38% 42%;background:linear-gradient(150deg,#7e7b8e,#383746 58%,#1f1f2a);box-shadow:inset -12px -10px 18px rgba(0,0,0,.32),0 8px 22px rgba(0,0,0,.35);cursor:pointer;z-index:2;}
  .vinh-da-game__rock::after{content:"";position:absolute;left:18px;top:12px;width:42px;height:10px;border-radius:999px;background:rgba(255,255,255,.18);transform:rotate(-12deg);}
  .vinh-da-game__wall-slot{position:absolute;bottom:42%;width:70px;height:78px;margin-left:-35px;border:1px dashed rgba(210,200,255,.32);border-radius:10px;background:linear-gradient(180deg,rgba(121,93,255,.12),rgba(16,14,26,.28));box-shadow:0 0 18px rgba(121,93,255,.16);cursor:pointer;z-index:2;}
  .vinh-da-game__wall-slot::after{content:"";position:absolute;left:12px;right:12px;bottom:10px;height:8px;border-radius:999px;background:rgba(210,200,255,.18);}
  .vinh-da-game__rock.has-structure{border-radius:10px 10px 4px 4px;border:1px solid rgba(226,222,255,.28);box-shadow:0 0 24px rgba(133,105,255,.45);}
  .vinh-da-game__structure--watchtower{background:linear-gradient(180deg,#3a2b67,#12111f);}
  .vinh-da-game__structure--elementalTower{background:linear-gradient(180deg,#1f5b73,#101621);}
  .vinh-da-game__structure--barracks{background:linear-gradient(180deg,#463624,#14100d);}
  .vinh-da-game__structure--church{background:linear-gradient(180deg,#efe5ff,#44305f);}
  .vinh-da-game__structure--crystalSeal{background:linear-gradient(135deg,#eaffff,#7b5cff 48%,#39e8ff);}
  .vinh-da-game__rock.has-structure::before,.vinh-da-game__wall-slot.has-structure::before{content:attr(data-structure-label);position:absolute;left:50%;bottom:64px;transform:translateX(-50%);font-size:11px;color:#eee6ff;text-shadow:0 1px 5px #000;white-space:nowrap;}
  .vinh-da-game__structure--wall{border-style:solid;border-color:rgba(226,222,255,.34);background:repeating-linear-gradient(90deg,#2e2944 0 18px,#181625 18px 36px);box-shadow:0 0 22px rgba(133,105,255,.38);}
  .vinh-da-game__structure--wall::before{bottom:84px;}
  .vinh-da-game__build-menu{position:absolute;bottom:calc(42% + 36px);width:170px;height:170px;margin-left:-85px;pointer-events:none;opacity:0;transform:scale(.88);transition:opacity .16s ease,transform .16s ease;z-index:4;}
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
  let bloodSealStone = 0;
  const keys = new Set<string>();
  const structures = new Map<string, PlacedStructure>();
  const structureRuntimes = new Map<string, StructureRuntime>();
  const enemies: Enemy[] = [];
  const enemyElements = new Map<number, HTMLElement>();
  let nextEnemyId = 1;
  let enemySpawnTimer = 0;

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
  const structureClassNames = BUILD_NODE_OPTIONS.map(option => `vinh-da-game__structure--${option.type}`);
  let lastRenderedCameraX = Number.POSITIVE_INFINITY;

  const getStructureMaxHp = (structure: PlacedStructure): number => structure.type === 'wall' ? WALL_BASE_HP * structure.level : 1;
  const ensureStructureRuntime = (structure: PlacedStructure): StructureRuntime => {
    const existing = structureRuntimes.get(structure.siteId);
    if (existing) return existing;
    const runtime = { cooldown: 0, hp: getStructureMaxHp(structure) };
    structureRuntimes.set(structure.siteId, runtime);
    return runtime;
  };
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
  const clampLeaderX = (x: number): number => Math.max(80, Math.min(WORLD_WIDTH - 120, x));
  const getBuildSite = (siteId: string | null | undefined): BuildSite | null => BUILD_SITES.find(site => site.id === siteId) ?? null;
  const nearestBuildSite = (): BuildSite | null => BUILD_SITES.find(site => Math.abs(leaderX - site.x) <= BUILD_RANGE) ?? null;
  const createBuildSiteElement = (site: BuildSite): void => {
    if (!buildSitesContainer || siteElements.has(site.id)) return;
    const button = document.createElement('button');
    button.className = site.kind === 'wall-slot' ? 'vinh-da-game__wall-slot' : 'vinh-da-game__rock';
    button.dataset.buildSiteId = site.id;
    button.style.left = `${site.x}px`;
    button.type = 'button';

    const menu = document.createElement('div');
    menu.className = 'vinh-da-game__build-menu';
    menu.dataset.buildMenu = site.id;
    menu.style.left = `${site.x}px`;
    BUILD_NODE_OPTIONS.forEach((option) => {
      const node = document.createElement('button');
      node.className = 'vinh-da-game__build-node';
      node.dataset.structureType = option.type;
      node.type = 'button';
      node.setAttribute('aria-label', option.label);
      node.hidden = !site.allowed.includes(option.type);
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
      const isUpgradeNode = node.dataset.action === 'upgrade';
      const cost = structure ? BUILD_LEVEL_COST[2] : BUILD_LEVEL_COST[1];
      node.hidden = structure
        ? !isUpgradeNode || structure.level >= 2
        : isUpgradeNode || !type || !site.allowed.includes(type);
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
    siteButton.dataset.structureLabel = structure ? BUILD_NODE_OPTIONS.find(option => option.type === structure.type)?.label ?? '' : '';
    siteButton.setAttribute('aria-label', structure ? `${siteButton.dataset.structureLabel} cấp ${structure.level}` : site?.kind === 'wall-slot' ? 'Điểm xây tường' : 'Ụ đá xây dựng');
    renderBuildMenu(siteId);
  };
  const renderVisibleBuildSites = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    const minX = cameraX - BUILD_SITE_RENDER_BUFFER;
    const maxX = cameraX + width + BUILD_SITE_RENDER_BUFFER;
    for (const site of BUILD_SITES){
      if (site.x >= minX && site.x <= maxX){
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
    if (siteId) renderBuildMenu(siteId);
    for (const menu of buildMenuElements.values()) menu.classList.toggle('is-open', menu.dataset.buildMenu === siteId);
  };

  const spawnEnemy = (side: Side): void => {
    if (enemies.length >= ENEMY_LIMIT) return;
    enemies.push({
      id: nextEnemyId,
      x: side === 'left' ? ENEMY_START_PADDING : WORLD_WIDTH - ENEMY_START_PADDING,
      hp: ENEMY_BASE_HP,
      speed: ENEMY_BASE_SPEED,
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
      bloodSealStone += ENEMY_REWARD;
      renderEconomy();
    }
  };
  const clearEnemiesWithoutReward = (): void => {
    while (enemies.length > 0) removeEnemyAt(enemies.length - 1, false);
    enemySpawnTimer = 0;
  };
  const getBlockingWall = (enemy: Enemy): { site: BuildSite; runtime: StructureRuntime } | null => {
    for (const [siteId, structure] of structures){
      if (structure.type !== 'wall') continue;
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
  const updateEnemies = (dt: number): void => {
    enemySpawnTimer += dt;
    while (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL){
      enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
      spawnEnemy(nextEnemyId % 2 === 0 ? 'left' : 'right');
    }

    for (let i = enemies.length - 1; i >= 0; i -= 1){
      const enemy = enemies[i];
      if (!enemy) continue;
      const wall = getBlockingWall(enemy);
      if (wall){
        wall.runtime.hp -= ENEMY_WALL_DAMAGE_PER_SECOND * dt;
        if (wall.runtime.hp <= 0){
          structures.delete(wall.site.id);
          structureRuntimes.delete(wall.site.id);
          renderBuildSite(wall.site.id);
        }
      } else {
        const direction = enemy.x < CRYSTAL_X ? 1 : -1;
        enemy.x += direction * enemy.speed * dt;
      }
      if (Math.abs(enemy.x - leaderX) <= LEADER_ATTACK_RANGE && damageEnemy(enemy, LEADER_DAMAGE_PER_SECOND * dt)) removeEnemyAt(i, true);
    }
  };
  const updateStructures = (dt: number): void => {
    for (const structure of structures.values()){
      if (structure.type !== 'watchtower' && structure.type !== 'elementalTower') continue;
      const site = getBuildSite(structure.siteId);
      if (!site) continue;
      const runtime = ensureStructureRuntime(structure);
      runtime.cooldown = Math.max(0, runtime.cooldown - dt);
      if (runtime.cooldown > 0) continue;
      const target = enemies.find(enemy => Math.abs(enemy.x - site.x) <= TOWER_RANGE);
      if (!target) continue;
      runtime.cooldown = TOWER_COOLDOWN_SECONDS;
      if (damageEnemy(target, TOWER_DAMAGE * structure.level)) removeEnemyAt(enemies.indexOf(target), true);
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
    targetX = clampLeaderX(clientX + cameraX - 23);
    setOpenBuildSite(null);
  };
  const onViewportPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-build-site-id],.vinh-da-game__build-node,.vinh-da-game__back')) return;
    moveToClientX(event.clientX);
  };
  const onGameClick = (event: Event): void => {
    const target = event.target instanceof Element ? event.target : null;
    const buildNode = target?.closest<HTMLElement>('.vinh-da-game__build-node');
    if (buildNode){
      const site = getBuildSite(openSiteId);
      const structure = site ? structures.get(site.id) : null;
      if (site && buildNode.dataset.action === 'upgrade'){
        if (structure && structure.level < 2 && spend(BUILD_LEVEL_COST[2])){
          const upgraded = { ...structure, level: structure.level + 1 };
          structures.set(site.id, upgraded);
          const runtime = ensureStructureRuntime(upgraded);
          runtime.hp = getStructureMaxHp(upgraded);
          renderBuildSite(site.id);
        }
      } else {
        const type = buildNode.dataset.structureType as StructureType | undefined;
        if (site && type && !structure && site.allowed.includes(type) && spend(BUILD_LEVEL_COST[1])){
          const placed = { siteId: site.id, type, level: 1 };
          structures.set(site.id, placed);
          ensureStructureRuntime(placed);
          renderBuildSite(site.id);
        }
      }
      setOpenBuildSite(null);
      return;
    }

    const siteButton = target?.closest<HTMLElement>('[data-build-site-id]');
    if (!siteButton) return;
    const site = nearestBuildSite();
    if (!site || site.id !== siteButton.dataset.buildSiteId){
      targetX = clampLeaderX(Number.parseFloat(siteButton.style.left) || leaderX);
      setOpenBuildSite(null);
      return;
    }
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
