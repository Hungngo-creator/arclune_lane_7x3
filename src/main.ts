import type { CreateSessionOptions, SessionState } from '@types/pve';
import type { GameConfig } from '@types/config';
import type { GameEventHandler, GameEventType } from './events.ts';

import { createPveSession } from './modes/pve/session.ts';
import { ensureNestedModuleSupport } from './utils/dummy.js';

export {
  gameEvents,
  emitGameEvent,
  dispatchGameEvent,
  addGameEventListener,
  TURN_START,
  TURN_END,
  ACTION_START,
  ACTION_END,
  TURN_REGEN,
  BATTLE_END,
} from './events.ts';

type RootSource = Element | Document | null | undefined;
type RootTarget = Element | Document | null;

type SessionConfigOverrides = Partial<CreateSessionOptions> &
  Partial<GameConfig> &
  Record<string, unknown>;

export interface StartGameOptions extends SessionConfigOverrides {
  root?: RootSource;
  rootEl?: RootSource;
  element?: RootSource;
}

type BaseSessionHandle = ReturnType<typeof createPveSession>;

export interface ActiveSessionHandle extends BaseSessionHandle {
  start(startConfig?: StartGameOptions | null): SessionState | null;
  stop(): void;
  updateConfig(next?: SessionConfigOverrides | null): void;
  setUnitSkin(unitId: string, skinKey: string | null | undefined): boolean;
  onEvent<T extends GameEventType>(type: T, handler: GameEventHandler<T>): () => void;
}

let currentSession: ActiveSessionHandle | null = null;

function resolveRoot(
  config: Pick<StartGameOptions, 'root' | 'rootEl' | 'element'> | null | undefined,
): RootTarget {
  if (!config) return typeof document !== 'undefined' ? document : null;
  if (config.root) return config.root;
  if (config.rootEl) return config.rootEl;
  if (config.element) return config.element;
  return typeof document !== 'undefined' ? document : null;
}

export function startGame(options?: StartGameOptions | null): SessionState {
  ensureNestedModuleSupport();
  const sanitizedOptions = (options ?? {}) as StartGameOptions;
  const { root, rootEl, element, ...rest } = sanitizedOptions;
  const rootTarget = resolveRoot({ root, rootEl, element });
  const initialConfig: SessionConfigOverrides = { ...rest };
  if (!currentSession) {
    currentSession = createPveSession(rootTarget, initialConfig);
  }
  const startConfig: StartGameOptions = { ...initialConfig, root: rootTarget };
  const session = currentSession.start(startConfig);
  if (!session) {
    throw new Error('PvE board markup not found; render the layout before calling startGame');
  }
  return session;
}

export function stopGame(): void {
  if (!currentSession) return;
  currentSession.stop();
  currentSession = null;
}

export function updateGameConfig(config: SessionConfigOverrides | null | undefined = {}): void {
  if (!currentSession) return;
  currentSession.updateConfig(config ?? {});
}

export function getCurrentSession(): ActiveSessionHandle | null {
  return currentSession;
}

export function setUnitSkin(unitId: string, skinKey: string | null | undefined): boolean {
  if (!currentSession) return false;
  return currentSession.setUnitSkin(unitId, skinKey);
}

export function onGameEvent<T extends GameEventType>(
  type: T,
  handler: GameEventHandler<T>,
): () => void {
  if (!currentSession) return () => {};
  return currentSession.onEvent(type, handler);
}
