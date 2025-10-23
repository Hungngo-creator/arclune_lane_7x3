import type { CleanupFn, CleanupRegistrar, MainMenuState, RenderedMainMenu } from '../types.ts';
import { HERO_DEFAULT_ID } from '../dialogues.ts';
import { ensureStyles, createHeader, createHeroSection, createModesSection, createSidebar } from './layout.ts';

export function renderMainMenuView(state: MainMenuState): RenderedMainMenu | null {
  const {
    root,
    shell = null,
    sections = [],
    metadata = [],
    heroId = HERO_DEFAULT_ID,
    playerGender = 'neutral',
    onShowComingSoon
  } = state;

  if (!root) return null;

  ensureStyles();
  root.innerHTML = '';
  root.classList.remove('app--pve');
  root.classList.add('app--main-menu');

  const cleanups: CleanupFn[] = [];
  const addCleanup: CleanupRegistrar = fn => {
    if (typeof fn === 'function'){
      cleanups.push(fn);
    }
  };

  const container = document.createElement('div');
  container.className = 'main-menu-v2';

  const header = createHeader();
  container.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'main-menu-v2__layout';
  container.appendChild(layout);

  const primary = document.createElement('div');
  primary.className = 'main-menu-v2__primary';
  const hero = createHeroSection({ heroId, playerGender, addCleanup });
  primary.appendChild(hero);
  const modes = createModesSection({ sections, metadata, shell, onShowComingSoon, addCleanup });
  primary.appendChild(modes);

  const sidebar = createSidebar({ shell, addCleanup });

  layout.appendChild(primary);
  layout.appendChild(sidebar);

  root.appendChild(container);

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
      if (container.parentNode === root){
        root.removeChild(container);
      }
      root.classList.remove('app--main-menu');
    }
  };
}
