import type { UnitArt } from '../../types/art.ts';

export type HeroCue = 'intro' | 'hover' | 'tap' | 'sensitive' | 'idle';

export type HeroTone = 'greeting' | 'focus' | 'gentle' | 'motivate' | 'warning' | 'calm';

export type HeroGender = 'male' | 'female' | 'neutral';

export interface HeroDialogue {
  heroId: string;
  cue: HeroCue;
  zone: string | null;
  text: string;
  tone: HeroTone;
  label: string;
}

export interface HeroDialogueLine {
  text: string;
  tone?: HeroTone | null;
  label?: string | null;
}

export interface HeroHotspot {
  key: string;
  label?: string | null;
  description?: string | null;
  cue?: HeroCue;
  type?: string | null;
}

export interface HeroProfile {
  id: string;
  name?: string | null;
  title?: string | null;
  faction?: string | null;
  role?: string | null;
  motto?: string | null;
  portrait?: string | null;
  art: UnitArt | null;
  hotspots: ReadonlyArray<HeroHotspot>;
}

export interface MenuSectionEntry {
  id: string;
  type: string;
  cardId?: string | null;
  childModeIds?: ReadonlyArray<string>;
}

export interface MenuSection {
  id: string;
  title: string;
  entries?: ReadonlyArray<MenuSectionEntry | null>;
}

export interface MenuCardMetadata {
  key: string;
  id?: string | null;
  title?: string | null;
  label?: string | null;
  description?: string | null;
  icon?: string | null;
  tags?: ReadonlyArray<string> | null;
  status?: string | null;
  params?: Record<string, unknown> | null;
  parentId?: string | null;
  isGroup?: boolean;
  childModeIds?: ReadonlyArray<string> | null;
  extraClasses?: ReadonlyArray<string> | null;
}

export interface MainMenuShellTooltipOptions {
  id?: string | null;
  slot?: string | null;
  title?: string | null;
  description?: string | null;
  reward?: string | null;
  translationKey?: string | null;
  startAt?: string | null;
  endAt?: string | null;
}

export interface MainMenuShell {
  enterScreen?: (screenId: string, params?: Record<string, unknown> | null) => void;
  showTooltip?: (options: MainMenuShellTooltipOptions) => void;
  hideTooltip?: (options: { id?: string | null; slot?: string | null }) => void;
}

export type ComingSoonHandler = (mode: MenuCardMetadata) => void;

export type CleanupFn = () => void;
export type CleanupRegistrar = (fn: CleanupFn) => void;

export interface MainMenuState {
  root: HTMLElement | null;
  shell?: MainMenuShell | null;
  sections?: ReadonlyArray<MenuSection>;
  metadata?: ReadonlyArray<MenuCardMetadata>;
  heroId?: string;
  playerGender?: string;
  onShowComingSoon?: ComingSoonHandler;
}

export interface RenderedMainMenu {
  destroy: () => void;
}