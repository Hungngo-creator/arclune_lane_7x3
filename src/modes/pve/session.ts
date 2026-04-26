import * as sessionState from './session-state.ts';
import * as sessionRuntime from './session-runtime.ts';

export * from './session-state.ts';
export * from './session-runtime.ts';

// Namespace re-exports giúp chuyển dần sang module nhỏ mà không vỡ import cũ.
export { sessionState, sessionRuntime };
export const sessionModules = Object.freeze({ sessionState, sessionRuntime } as const);