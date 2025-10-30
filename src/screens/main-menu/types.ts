import type { UnitArt } from '@shared-types/art';

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
  readonly text: string;
  readonly tone?: HeroTone | null;
  readonly label?: string | null;
}

export interface HeroHotspot {
  readonly key: string;
  readonly label?: string | null;
  readonly description?: string | null;
  readonly cue?: HeroCue;
  readonly type?: string | null;
}

export interface HeroProfile {
  readonly id: string;
  readonly name?: string | null;
  readonly title?: string | null;
  readonly faction?: string | null;
  readonly role?: string | null;
  readonly motto?: string | null;
  readonly portrait?: string | null;
  readonly art: UnitArt | null;
  readonly hotspots: ReadonlyArray<HeroHotspot>;
}

export interface MenuSectionEntry {
  readonly id: string;
  readonly type: string;
  readonly cardId?: string | null;
  readonly childModeIds: ReadonlyArray<string>;
}

export interface MenuSection {
  readonly id: string;
  readonly title: string;
  readonly entries: ReadonlyArray<MenuSectionEntry>;
}

export interface MenuCardMetadata {
  readonly key: string;
  readonly id?: string | null;
  readonly title?: string | null;
  readonly label?: string | null;
  readonly description?: string | null;
  readonly icon?: string | null;
  readonly tags?: ReadonlyArray<string> | null;
  readonly status?: string | null;
  readonly params?: Readonly<Record<string, unknown>> | null;
  readonly parentId?: string | null;
  readonly isGroup?: boolean;
  readonly childModeIds?: ReadonlyArray<string> | null;
  readonly extraClasses?: ReadonlyArray<string> | null;
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
  readonly enterScreen?: (screenId: string, params?: Readonly<Record<string, unknown>> | null) => void;
  readonly showTooltip?: (options: MainMenuShellTooltipOptions) => void;
  readonly hideTooltip?: (options: { id?: string | null; slot?: string | null }) => void;
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