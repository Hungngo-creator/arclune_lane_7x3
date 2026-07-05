import { ROSTER, getMetaById } from '../../catalog.ts';
import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import type { MainMenuShell } from '../main-menu/types.ts';

interface RenderContext {
  root: HTMLElement;
  shell?: MainMenuShell | null;
  params?: Record<string, unknown> | null;
}

const STYLE_ID = 'vinh-da-gameplay-style';
const WORLD_WIDTH = 3600;
const LEADER_SPEED = 420;
const CSS = /* css */ `
  .app--vinh-da-gameplay{min-height:100dvh;background:#020204;color:#f7f2ff;overflow:hidden;}
  .vinh-da-game{position:relative;min-height:100dvh;overflow:hidden;background:linear-gradient(#020204 0 58%,#07070b 58% 100%);}
  .vinh-da-game__hud{position:absolute;z-index:3;top:14px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;pointer-events:none;}
  .vinh-da-game__panel{pointer-events:auto;border:1px solid rgba(210,200,255,.24);border-radius:14px;background:rgba(0,0,0,.58);padding:10px 12px;box-shadow:0 10px 32px rgba(0,0,0,.35);}
  .vinh-da-game__back{border:0;border-radius:999px;background:#f3edff;color:#111020;width:42px;height:42px;font-size:22px;cursor:pointer;}
  .vinh-da-game__viewport{position:absolute;inset:0;overflow:hidden;}
  .vinh-da-game__world{position:absolute;left:0;top:0;width:${WORLD_WIDTH}px;height:100%;transform:translate3d(0,0,0);will-change:transform;background:radial-gradient(circle at 50% 28%,rgba(87,68,168,.34),transparent 18%),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 220px);}
  .vinh-da-game__ground{position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(#121018,#050507);border-top:1px solid rgba(210,200,255,.18);}
  .vinh-da-game__castle{position:absolute;left:1700px;bottom:42%;width:190px;height:170px;background:linear-gradient(180deg,#202033,#0d0d16);border:2px solid rgba(226,222,255,.2);box-shadow:0 0 44px rgba(83,65,170,.3);}
  .vinh-da-game__castle::before,.vinh-da-game__castle::after{content:"";position:absolute;bottom:0;width:54px;height:230px;background:#11111f;border:2px solid rgba(226,222,255,.18)}
  .vinh-da-game__castle::before{left:-60px}.vinh-da-game__castle::after{right:-60px}
  .vinh-da-game__leader{position:absolute;bottom:42%;width:46px;height:82px;border-radius:10px 10px 6px 6px;background:linear-gradient(180deg,#f4d78a,#7447ff);box-shadow:0 0 26px rgba(245,215,138,.55);transform:translate3d(0,0,0);will-change:transform;}
  .vinh-da-game__hint{font-size:12px;color:#c7bee9;margin-top:4px;}
`;

export function renderScreen(context: RenderContext): { destroy: () => void }{
  const { root, shell = null, params = null } = context;
  ensureStyleTag(STYLE_ID, { css: CSS });

  const leaderId = typeof params?.leaderId === 'string' ? params.leaderId : ROSTER[0]?.id;
  const leader = leaderId ? getMetaById(leaderId) : null;
  let leaderX = WORLD_WIDTH / 2;
  let cameraX = 0;
  let lastTime = performance.now();
  let rafId = 0;
  const keys = new Set<string>();

  const section = document.createElement('section');
  section.className = 'vinh-da-game';
  const mount = mountSection({ root, section, rootClasses: 'app--vinh-da-gameplay' });
  section.innerHTML = `
    <div class="vinh-da-game__hud">
      <div class="vinh-da-game__panel">
        <strong>Vĩnh Dạ · ${leader?.name ?? leaderId ?? 'Leader'}</strong>
        <div class="vinh-da-game__hint">Di chuyển: ←/→ hoặc A/D · Stage ${params?.stageId ?? 'unknown'}</div>
      </div>
      <button class="vinh-da-game__back" type="button" aria-label="Về World Map">↩</button>
    </div>
    <div class="vinh-da-game__viewport" data-role="viewport">
      <div class="vinh-da-game__world" data-role="world">
        <div class="vinh-da-game__castle" aria-hidden="true"></div>
        <div class="vinh-da-game__ground" aria-hidden="true"></div>
        <div class="vinh-da-game__leader" data-role="leader" title="${leader?.name ?? leaderId ?? 'Leader'}"></div>
      </div>
    </div>`;

  const world = section.querySelector<HTMLElement>('[data-role="world"]');
  const sprite = section.querySelector<HTMLElement>('[data-role="leader"]');
  const viewport = section.querySelector<HTMLElement>('[data-role="viewport"]');

  const updateCamera = (): void => {
    const width = viewport?.clientWidth || window.innerWidth || 1;
    cameraX = Math.max(0, Math.min(WORLD_WIDTH - width, leaderX - width * 0.5));
    if (world) world.style.transform = `translate3d(${-cameraX}px,0,0)`;
    if (sprite) sprite.style.transform = `translate3d(${leaderX}px,0,0)`;
  };

  const tick = (now: number): void => {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const left = keys.has('arrowleft') || keys.has('a');
    const right = keys.has('arrowright') || keys.has('d');
    leaderX += (Number(right) - Number(left)) * LEADER_SPEED * dt;
    leaderX = Math.max(80, Math.min(WORLD_WIDTH - 120, leaderX));
    updateCamera();
    rafId = window.requestAnimationFrame(tick);
  };

  const onKeyDown = (event: KeyboardEvent): void => { keys.add(event.key.toLowerCase()); };
  const onKeyUp = (event: KeyboardEvent): void => { keys.delete(event.key.toLowerCase()); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
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
      mount.destroy();
    }
  };
}

export const render = renderScreen;
