import { describe, expect, test } from '@jest/globals';

import { normalizeDeckEntries } from '../src/modes/pve/session-state.ts';

describe('normalizeDeckEntries', () => {
  test('normalizes class alias and elemental metadata keys', () => {
    const [entry] = normalizeDeckEntries([
      {
        id: 'thien_luu',
        class: 'archer',
        element: 'Hỏa',
        metadata: {
          element: 'Thủy',
          elements: ['KIM', 'Mộc', 'unknown'],
        },
      },
    ]);

    expect(entry.class).toBe('Ranger');
    expect((entry as { element?: string }).element).toBe('fire');
    expect((entry.metadata as { element?: string })?.element).toBe('water');
    expect((entry.metadata as { elements?: string[] })?.elements).toEqual(['metal', 'wood']);
  });
});
