import { MODE_INDEX, MODE_STATUS } from '../../data/modes.ts';
import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { createModeCard } from '../main-menu/view/events.ts';
import type {
  CleanupFn,
  CleanupRegistrar,
  MainMenuShell,
  MenuCardMetadata,
} from '../main-menu/types.ts';
import type { ModeConfig } from '@shared-types/config';

const STYLE_ID = 'arena-hub-screen-style';
const CHILD_MODE_IDS = ['arena', 'beast-arena', 'ares', 'challenge', 'campaign'] as const;
const DEFAULT_TITLE = 'Arena Hub';
const DEFAULT_DESCRIPTION = 'Tụ điểm tổng hợp các hoạt động chiến đấu luân phiên để người chơi bước vào chiến dịch, thử thách và mùa giải.';

interface ArenaHubDefinition {
  readonly label?: string | null;
  readonly description?: string | null;
}

interface ArenaHubShell extends Pick<MainMenuShell, 'enterScreen'> {}

interface ArenaHubRenderOptions {
  readonly root: HTMLElement | null;
  readonly shell?: ArenaHubShell | null;
  readonly definition?: ArenaHubDefinition | null;
  readonly params?: unknown;
  readonly screenId?: string | null;
}

interface ArenaHubViewController {
  destroy: () => void;
}

function ensureStyles(): void {
  const css = `
    .app--arena-hub{padding:32px 16px 64px;}
    .arena-hub{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:32px;color:inherit;}
    .arena-hub__header{display:flex;flex-direction:column;gap:18px;}
    .arena-hub__title{margin:0;font-size:40px;letter-spacing:.08em;text-transform:uppercase;}
    .arena-hub__description{margin:0;color:#9cbcd9;line-height:1.6;font-size:16px;}
    .arena-hub__back{align-self:flex-start;padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(12,22,32,.82);color:#aee4ff;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
    .arena-hub__back:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.52);box-shadow:0 12px 26px rgba(6,12,20,.4);}
    .arena-hub__back:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .arena-hub__content{display:flex;flex-direction:column;gap:24px;}
    .arena-hub__cards{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));}
    .arena-hub__cards .mode-card{width:100%;}
    .arena-hub__cards .mode-card__status{top:16px;right:16px;}
    .arena-hub__cards .mode-card:hover{transform:translateY(-2px);}
    .arena-hub__empty{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
    @media(max-width:640px){
      .arena-hub__title{font-size:32px;}
      .arena-hub__cards{grid-template-columns:minmax(0,1fr);}
    }
  `;

  ensureStyleTag(STYLE_ID, { css });
}

function cloneParams(params: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!params) {
    return null;
  }
  return { ...params };
}

function toMenuCardMetadata(mode: ModeConfig): MenuCardMetadata {
  const params = mode.status === MODE_STATUS.AVAILABLE
    ? cloneParams(mode.shell?.defaultParams)
    : null;
  return {
    key: mode.id,
    id: mode.shell?.screenId || mode.id,
    title: mode.title,
    description: mode.shortDescription,
    icon: mode.icon,
    tags: Array.isArray(mode.tags) ? [...mode.tags] : [],
    status: mode.status,
    params,
    parentId: mode.parentId ?? null,
  } satisfies MenuCardMetadata;
}

export function render(options: ArenaHubRenderOptions): ArenaHubViewController {
  const { root, shell = null, definition = null } = options ?? { root: null };
  if (!root) {
    throw new Error('render Arena Hub cần một phần tử root hợp lệ.');
  }

  ensureStyles();

  const cleanups: CleanupFn[] = [];
  const addCleanup: CleanupRegistrar = fn => {
    if (typeof fn === 'function') {
      cleanups.push(fn);
    }
  };

  const container = document.createElement('div');
  container.className = 'arena-hub';
  const mount = mountSection({
    root,
    section: container,
    rootClasses: 'app--arena-hub',
  });

  const header = document.createElement('header');
  header.className = 'arena-hub__header';
  container.appendChild(header);

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'arena-hub__back';
  backButton.textContent = '← Trở về menu chính';
  const handleBack = (event: MouseEvent) => {
    event.preventDefault();
    if (shell && typeof shell.enterScreen === 'function') {
      shell.enterScreen('main-menu');
    }
  };
  backButton.addEventListener('click', handleBack);
  addCleanup(() => backButton.removeEventListener('click', handleBack));
  header.appendChild(backButton);

  const title = document.createElement('h1');
  title.className = 'arena-hub__title';
  const normalizedTitle = definition?.label && definition.label.trim().length
    ? definition.label.trim()
    : DEFAULT_TITLE;
  title.textContent = normalizedTitle;
  header.appendChild(title);

  const descriptionText = definition?.description && definition.description.trim().length
    ? definition.description
    : DEFAULT_DESCRIPTION;
  const description = document.createElement('p');
  description.className = 'arena-hub__description';
  description.textContent = descriptionText;
  header.appendChild(description);

  const content = document.createElement('section');
  content.className = 'arena-hub__content';
  container.appendChild(content);

  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'arena-hub__cards';
  content.appendChild(cardsWrapper);

  const childMetadata = CHILD_MODE_IDS.map(childId => MODE_INDEX[childId]).filter((mode): mode is ModeConfig => Boolean(mode));

  if (childMetadata.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'arena-hub__empty';
    emptyMessage.textContent = 'Chưa có chế độ nào khả dụng.';
    content.appendChild(emptyMessage);
  } else {
    childMetadata.forEach(mode => {
      const metadata = toMenuCardMetadata(mode);
      const card = createModeCard(metadata, shell, undefined, addCleanup);
      cardsWrapper.appendChild(card);
    });
  }

  return {
    destroy() {
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('[arena-hub] cleanup failed', error);
        }
      });
      cleanups.length = 0;
      mount.destroy();
    },
  } satisfies ArenaHubViewController;
    }
