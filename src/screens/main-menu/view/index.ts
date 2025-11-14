import type { CleanupFn, CleanupRegistrar, MainMenuState, RenderedMainMenu } from '../types.ts';
import { mountSection } from '../../../ui/dom.ts';
import { ensureStyles, createHeader, createModesSection, createSidebar } from './layout.ts';

export function renderMainMenuView(state: MainMenuState): RenderedMainMenu | null {
  const {
    root,
    shell = null,
    sections = [],
    metadata = [],
    onShowComingSoon
  } = state;

  if (!root) return null;

  ensureStyles();

  const cleanups: CleanupFn[] = [];
  const addCleanup: CleanupRegistrar = fn => {
    if (typeof fn === 'function'){
      cleanups.push(fn);
    }
  };

  const container = document.createElement('div');
  container.className = 'main-menu-v2';
  const mount = mountSection({
    root,
    section: container,
    rootClasses: 'app--main-menu',
    removeRootClasses: 'app--pve',
  });

  const header = createHeader();
  container.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'main-menu-v2__layout';
  container.appendChild(layout);

  const primary = document.createElement('div');
  primary.className = 'main-menu-v2__primary';
  const modes = createModesSection({ sections, metadata, shell, onShowComingSoon, addCleanup });
  primary.appendChild(modes);

  const sidebar = createSidebar({ shell, addCleanup });

  layout.appendChild(primary);
  layout.appendChild(sidebar);

  return {
    destroy(){
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (err) {
          console.error('[main-menu] cleanup failed', err);
        }
      });
      cleanups.length = 0;
      mount.destroy();
    }
  };
}

export {
  ensureStyles,
  createHeader,
  createModesSection,
  createSidebar
} from './layout.ts';