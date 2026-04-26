import { describe, expect, test } from '@jest/globals';

import * as sessionModule from '../src/modes/pve/session.ts';
import { advanceSession, createPveSession, onSessionEvent } from '../src/modes/pve/session-runtime.ts';
import { createSession, normalizeConfig } from '../src/modes/pve/session-state.ts';

describe('pve session barrel exports', () => {
  test('re-export đủ runtime/state API chính để chuẩn bị tách module sau này', () => {
    expect(sessionModule.advanceSession).toBe(advanceSession);
    expect(sessionModule.createPveSession).toBe(createPveSession);
    expect(sessionModule.onSessionEvent).toBe(onSessionEvent);
    expect(sessionModule.createSession).toBe(createSession);
    expect(sessionModule.normalizeConfig).toBe(normalizeConfig);

    expect(sessionModule.sessionRuntime.advanceSession).toBe(advanceSession);
    expect(sessionModule.sessionState.createSession).toBe(createSession);
  });
});
