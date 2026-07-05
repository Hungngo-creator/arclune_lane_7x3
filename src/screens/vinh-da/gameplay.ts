import { ROSTER, getMetaById } from '../../catalog.ts';
import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import type { MainMenuShell } from '../main-menu/types.ts';

interface RenderContext {
  root: HTMLElement;
  shell?: MainMenuShell | null;
  params?: Record<string, unknown> | null;
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
const CASTLE_SIZE = CASTLE_OUTER_RIGHT - CASTLE_OUTER_LEFT;
const CRYSTAL_X = WORLD_CENTER_X;
const LEADER_START_X = CRYSTAL_X + 110;
const BUILD_RANGE = 150;
const BUILD_SLOTS = 5;
const BUILD_NODE_LABELS = ['Tháp', 'Tường', 'Bẫy', 'Pha lê', 'Ấn'];
const BUILD_ROCKS = [
  { id: 'left', x: CASTLE_OUTER_LEFT - CASTLE_SIZE },
  { id: 'right', x: CASTLE_OUTER_RIGHT + CASTLE_SIZE }
] as const;
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
  .vinh-da-game__rock{position:absolute;bottom:42%;width:96px;height:58px;margin-left:-48px;border:0;border-radius:46% 54% 38% 42%;background:linear-gradient(150deg,#7e7b8e,#383746 58%,#1f1f2a);box-shadow:inset -12px -10px 18px rgba(0,0,0,.32),0 8px 22px rgba(0,0,0,.35);cursor:pointer;z-index:2;}
  .vinh-da-game__rock::after{content:"";position:absolute;left:18px;top:12px;width:42px;height:10px;border-radius:999px;background:rgba(255,255,255,.18);transform:rotate(-12deg);}
  .vinh-da-game__build-menu{position:absolute;bottom:calc(42% + 36px);width:170px;height:170px;margin-left:-85px;pointer-events:none;opacity:0;transform:scale(.88);transition:opacity .16s ease,transform .16s ease;z-index:4;}
  .vinh-da-game__build-menu.is-open{opacity:1;transform:scale(1);pointer-events:auto;}
  .vinh-da-game__build-node{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px;border-radius:999px;border:1px solid rgba(230,220,255,.42);background:rgba(8,8,16,.22);backdrop-filter:blur(2px);color:#f5f0ff;display:grid;place-items:center;font-size:24px;box-shadow:0 0 20px rgba(170,140,255,.2);}
  .vinh-da-game__build-node small{position:absolute;top:48px;font-size:9px;color:#d6ccff;text-shadow:0 1px 4px #000;white-space:nowrap;}
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
  let openRockId: string | null = null;
  const keys = new Set<string>();

  const section = document.createElement('section');
  section.className = 'vinh-da-game';
  const mount = mountSection({ root, section, rootClasses: 'app--vinh-da-gameplay' });
  section.innerHTML = `
    <div class="vinh-da-game__hud">
      <div class="vinh-da-game__panel"><strong>Vĩnh Dạ · ${leader?.name ?? leaderId ?? 'Leader'}</strong></div>
      <button class="vinh-da-game__back" type="button" aria-label="Về World Map">↩</button>
    </div>
    <div class="vinh-da-game__viewport" data-role="viewport">
      <div class="vinh-da-game__world" data-role="world">
        <div class="vinh-da-game__castle" aria-hidden="true"></div>
        <div class="vinh-da-game__crystal" aria-label="Pha lê thành trì"></div>
        <div class="vinh-da-game__ground" aria-hidden="true"></div>
        ${BUILD_ROCKS.map((rock) => `<button class="vinh-da-game__rock" data-rock-id="${rock.id}" style="left:${rock.x}px" type="button" aria-label="Ụ đá xây dựng"></button><div class="vinh-da-game__build-menu" data-build-menu="${rock.id}" style="left:${rock.x}px">${Array.from({ length: BUILD_SLOTS }, (_, index) => {
          const angle = -90 + index * 360 / BUILD_SLOTS;
          const x = Math.cos(angle * Math.PI / 180) * 58;
          const y = Math.sin(angle * Math.PI / 180) * 58;
          return `<button class="vinh-da-game__build-node" type="button" style="transform:translate(${x}px,${y}px)" aria-label="${BUILD_NODE_LABELS[index]}">+<small>${BUILD_NODE_LABELS[index]}</small></button>`;
        }).join('')}</div>`).join('')}
        <div class="vinh-da-game__leader" data-role="leader" title="${leader?.name ?? leaderId ?? 'Leader'}"></div>
      </div>
    </div>`;

  const world = section.querySelector<HTMLElement>('[data-role="world"]');
  const sprite = section.querySelector<HTMLElement>('[data-role="leader"]');
  const viewport = section.querySelector<HTMLElement>('[data-role="viewport"]');
  const buildMenus = Array.from(section.querySelectorAll<HTMLElement>('[data-build-menu]'));

  const clampLeaderX = (x: number): number => Math.max(80, Math.min(WORLD_WIDTH - 120, x));
  const nearestRock = (): (typeof BUILD_ROCKS)[number] | null => BUILD_ROCKS.find(rock => Math.abs(leaderX - rock.x) <= BUILD_RANGE) ?? null;
  const setOpenRock = (rockId: string | null): void => {
    openRockId = rockId;
    for (const menu of buildMenus) menu.classList.toggle('is-open', menu.dataset.buildMenu === rockId);
  };

  const updateCamera = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    cameraX = Math.max(0, Math.min(WORLD_WIDTH - width, leaderX - width * 0.5));
    if (world) world.style.transform = `translate3d(${-cameraX}px,0,0)`;
    if (sprite) sprite.style.transform = `translate3d(${leaderX}px,0,0)`;
    if (openRockId && !nearestRock()) setOpenRock(null);
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
    updateCamera();
    rafId = window.requestAnimationFrame(tick);
  };

  const moveToClientX = (clientX: number): void => {
    targetX = clampLeaderX(clientX + cameraX - 23);
    setOpenRock(null);
  };
  const onViewportPointerDown = (event: PointerEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('.vinh-da-game__rock,.vinh-da-game__build-node,.vinh-da-game__back')) return;
    moveToClientX(event.clientX);
  };
  const onRockClick = (event: Event): void => {
    const rockButton = (event.target instanceof Element ? event.target : null)?.closest<HTMLElement>('[data-rock-id]');
    if (!rockButton) return;
    const rock = nearestRock();
    if (!rock || rock.id !== rockButton.dataset.rockId){
      targetX = clampLeaderX(Number.parseFloat(rockButton.style.left) || leaderX);
      setOpenRock(null);
      return;
    }
    setOpenRock(openRockId === rock.id ? null : rock.id);
  };
  const onKeyDown = (event: KeyboardEvent): void => { keys.add(event.key.toLowerCase()); };
  const onKeyUp = (event: KeyboardEvent): void => { keys.delete(event.key.toLowerCase()); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  viewport?.addEventListener('pointerdown', onViewportPointerDown);
  section.addEventListener('click', onRockClick);
  section.querySelector('.vinh-da-game__back')?.addEventListener('click', () => {
    shell?.enterScreen?.('campaign-world-map', { modeKey: 'vinh-da', leaderId, stageId: params?.stageId });
  });
  updateCamera();
  rafId = window.requestAnimationFrame(tick);

  return {
    destroy(){
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      viewport?.removeEventListener('pointerdown', onViewportPointerDown);
      section.removeEventListener('click', onRockClick);
      mount.destroy();
    }
  };
}

export const render = renderScreen;
