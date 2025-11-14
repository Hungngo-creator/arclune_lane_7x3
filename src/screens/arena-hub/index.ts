import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { createModeCard } from '../main-menu/view/events.ts';
import type { CleanupFn, CleanupRegistrar, MainMenuShell, MenuCardMetadata } from '../main-menu/types.ts';
import { MODE_INDEX, MODES } from '../../data/modes.ts';
import type { ModeConfig } from '@shared-types/config';

const STYLE_ID = 'arena-hub-screen-style';
const ARENA_HUB_ID = 'arena-hub';
const CHILD_ORDER: ReadonlyArray<string> = ['arena', 'beast-arena', 'ares', 'challenge', 'campaign'];

const CSS = /* css */ `
  .app--arena-hub{
    padding:32px 16px 64px;
  }
  .arena-hub{
    max-width:1040px;
    margin:0 auto;
    display:flex;
    flex-direction:column;
    gap:32px;
    color:inherit;
  }
  .arena-hub__header{
    display:flex;
    flex-direction:column;
    gap:16px;
  }
  .arena-hub__back{
    align-self:flex-start;
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:10px 18px;
    border-radius:999px;
    border:1px solid rgba(125,211,252,0.45);
    background:rgba(15,26,40,0.85);
    color:#d7ecff;
    cursor:pointer;
    font-size:13px;
    letter-spacing:.12em;
    text-transform:uppercase;
    transition:background 0.2s ease,border-color 0.2s ease,color 0.2s ease;
  }
  .arena-hub__back:hover,
  .arena-hub__back:focus-visible{
    background:rgba(18,32,48,0.95);
    border-color:rgba(125,211,252,0.75);
    color:#f1fbff;
    outline:none;
  }
  .arena-hub__titles{
    display:flex;
    flex-direction:column;
    gap:10px;
    max-width:640px;
  }
  .arena-hub__title{
    margin:0;
    font-size:40px;
    text-transform:uppercase;
    letter-spacing:.1em;
  }
  .arena-hub__subtitle{
    margin:0;
    color:#9cbcd9;
    line-height:1.6;
    font-size:16px;
  }
  .arena-hub__grid{
    display:grid;
    gap:20px;
  }
  @media(min-width:720px){
    .arena-hub__grid{
      grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
    }
  }
  .arena-hub__card{
    width:100%;
  }
`;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: MainMenuShell | null;
  readonly definition?: { label?: string | null; description?: string | null } | null;
}

function ensureStyles(): void{
  ensureStyleTag(STYLE_ID, { css: CSS });
}

function toMetadata(mode: ModeConfig): MenuCardMetadata{
  const params = mode.shell?.defaultParams;
  const normalizedParams = params && typeof params === 'object' && !Array.isArray(params)
    ? { ...params } as Record<string, unknown>
    : null;
  return {
    key: mode.id,
    id: mode.shell?.screenId || mode.id,
    title: mode.title || mode.id,
    description: mode.shortDescription,
    icon: mode.icon,
    tags: Array.isArray(mode.tags) ? [...mode.tags] : [],
    status: mode.status,
    params: normalizedParams,
    parentId: mode.parentId ?? null,
  } satisfies MenuCardMetadata;
}

function getChildModes(): ReadonlyArray<ModeConfig>{
  const ordered = CHILD_ORDER
    .map(id => MODE_INDEX[id])
    .filter((mode): mode is ModeConfig => Boolean(mode) && mode.parentId === ARENA_HUB_ID);
  const seen = new Set(ordered.map(mode => mode.id));
  const extras = MODES.filter(mode => mode.parentId === ARENA_HUB_ID && !seen.has(mode.id));
  return [...ordered, ...extras];
}

export function renderScreen(context: RenderContext): { destroy: () => void }{
  const { root, shell = null, definition = null } = context;
  if (!root){
    throw new Error('renderScreen cần root hợp lệ.');
  }

  ensureStyles();

  const cleanups: CleanupFn[] = [];
  const addCleanup: CleanupRegistrar = fn => {
    if (typeof fn === 'function'){
      cleanups.push(fn);
    }
  };

  const container = document.createElement('div');
  container.className = 'arena-hub';
  const mount = mountSection({ root, section: container });

  const header = document.createElement('header');
  header.className = 'arena-hub__header';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'arena-hub__back';
  backButton.setAttribute('aria-label', 'Trở về menu chính');
  backButton.textContent = '← Trở về menu chính';
  const handleBack = (event: Event) => {
    event.preventDefault();
    if (shell && typeof shell.enterScreen === 'function'){
      shell.enterScreen('main-menu');
    }
  };
  backButton.addEventListener('click', handleBack);
  addCleanup(() => backButton.removeEventListener('click', handleBack));
  header.appendChild(backButton);

  const titles = document.createElement('div');
  titles.className = 'arena-hub__titles';
  const title = document.createElement('h1');
  title.className = 'arena-hub__title';
  title.textContent = definition?.label || 'Arena Hub';
  titles.appendChild(title);
  if (definition?.description){
    const subtitle = document.createElement('p');
    subtitle.className = 'arena-hub__subtitle';
    subtitle.textContent = definition.description;
    titles.appendChild(subtitle);
  }
  header.appendChild(titles);

  container.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'arena-hub__grid';
  const childModes = getChildModes();
  childModes.forEach(mode => {
    const metadata = toMetadata(mode);
    const card = createModeCard(metadata, shell, undefined, addCleanup, { extraClass: 'arena-hub__card' });
    card.classList.add('arena-hub__card');
    grid.appendChild(card);
  });
  container.appendChild(grid);

  return {
    destroy(){
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('[arena-hub] cleanup failed', error);
        }
      });
      cleanups.length = 0;
      mount.destroy();
    }
  };
}

export const render = renderScreen;