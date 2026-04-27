//home (termux)/arclune_lane_7x3/src/main.ts

import './aether.ts';
import type { CreateSessionOptions, SessionState } from '@shared-types/pve';
import type { GameConfig } from '@shared-types/config';
import type { GameEventHandler, GameEventType } from './events';
import { addGameEventListener } from './events';

import { createPveSession } from '@modes/pve/session';
import { ensureNestedModuleSupport } from './utils/dummy';

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
} from './events';

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
const pendingSkins = new Map<string, string | null>();

const isPlainRecord = (value: unknown): value is Record<string, unknown> => (
  !!value && typeof value === 'object'
);

const toRootSource = (value: unknown): RootSource => {
  if (value == null) return value as null | undefined;
  if (typeof Element !== 'undefined' && value instanceof Element) return value;
  if (typeof Document !== 'undefined' && value instanceof Document) return value;
  if (typeof (value as { nodeType?: unknown }).nodeType === 'number'){
    return value as Element | Document;
  }
  return undefined;
};

const toSessionConfigOverrides = (value: unknown): SessionConfigOverrides => {
  if (!isPlainRecord(value)){
    return {};
  }
  return { ...(value as Record<string, unknown>) } as SessionConfigOverrides;
};

const defaultRootTarget = (): RootTarget => (typeof document !== 'undefined' ? document : null);

function resolveRoot(
  config: Pick<StartGameOptions, 'root' | 'rootEl' | 'element'> | null | undefined,
): RootTarget {
  if (!config) return defaultRootTarget();
  return config.root ?? config.rootEl ?? config.element ?? defaultRootTarget();
}

const resolveRootFromRawOptions = (rawOptions: Record<string, unknown>): RootTarget => resolveRoot({
  root: toRootSource(rawOptions.root),
  rootEl: toRootSource(rawOptions.rootEl),
  element: toRootSource(rawOptions.element),
});

const flushPendingSkins = (session: ActiveSessionHandle | null): void => {
  if (!session || pendingSkins.size === 0) return;
  for (const [unitId, skinKey] of pendingSkins) {
    if (session.setUnitSkin(unitId, skinKey)) {
      pendingSkins.delete(unitId);
    }
  }
};

export function startGame(options?: StartGameOptions | null): SessionState {
  ensureNestedModuleSupport();
  const rawOptions = isPlainRecord(options) ? options : {};
  const { root, rootEl, element, ...rest } = rawOptions as Record<string, unknown>;
  const rootTarget = resolveRootFromRawOptions({ root, rootEl, element });
  const initialConfig = toSessionConfigOverrides(rest);
  if (!currentSession) {
    currentSession = createPveSession(rootTarget, initialConfig);
  }
  const session = currentSession.start({ ...initialConfig, root: rootTarget });
  if (!session) {
    throw new Error('PvE board markup not found; render the layout before calling startGame');
  }
  flushPendingSkins(currentSession);
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
  const normalizedSkinKey = skinKey ?? null;
  pendingSkins.set(unitId, normalizedSkinKey);
  if (!currentSession) {
    return true;
  }
  const applied = currentSession.setUnitSkin(unitId, normalizedSkinKey);
  if (applied) pendingSkins.delete(unitId);
  return applied;
}

export function onGameEvent<T extends GameEventType>(
  type: T,
  handler: GameEventHandler<T>,
): () => void {
  const subscribe = currentSession?.onEvent ?? addGameEventListener;
  return subscribe(type, handler);
}