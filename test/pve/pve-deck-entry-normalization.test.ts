import { describe, expect, test } from '@jest/globals';

import {
  getPreferredDeckEntries,
  getPreferredDeckInput,
  normalizeConfig,
  normalizeDeckEntries,
  resolveEnemyUnits,
} from '../src/modes/pve/session-state.ts';

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

  test('fallback sang cost budget theo rank/class khi unit tách runtime không có cost tĩnh', () => {
    const normalized = normalizeDeckEntries(['ly_thanh_thu', 'nguyen_le']);
    expect(normalized).toHaveLength(2);
    expect(Number(normalized[0]?.cost ?? 0)).toBeGreaterThan(0);
    expect(Number(normalized[1]?.cost ?? 0)).toBeGreaterThan(0);
  });
});

describe('preferred deck resolution', () => {
  test('ưu tiên lineupDeck > playerDeck > deck và tái sử dụng normalized list nếu đã chuẩn', () => {
    const normalized = normalizeDeckEntries(['thien_luu']);
    expect(getPreferredDeckInput({ lineupDeck: [], playerDeck: normalized, deck: ['other'] })).toBe(normalized);
    expect(getPreferredDeckEntries({ lineupDeck: [], playerDeck: normalized, deck: ['other'] })).toBe(normalized);

    const fallbackDeck = getPreferredDeckEntries({ lineupDeck: [], playerDeck: [], deck: ['thien_luu'] });
    expect(fallbackDeck).toHaveLength(1);
    expect(fallbackDeck[0]?.id).toBe('thien_luu');
  });

  test('cache normalize toàn cục: cùng raw deck reference trả cùng normalized reference qua nhiều lần gọi', () => {
    const rawDeck = ['thien_luu', 'nguyen_le'];
    const first = getPreferredDeckEntries({ lineupDeck: rawDeck });
    const second = getPreferredDeckEntries({ lineupDeck: rawDeck });
    expect(second).toBe(first);
  });
});

test('AI preset deck ưu tiên deck rồi unitsAll qua cùng luồng normalize', () => {
  const byDeck = resolveEnemyUnits({
    aiPreset: {
      deck: ['thien_luu'],
      unitsAll: ['nguyen_le'],
    } as any,
    preferredDeck: null,
    fallbackDeck: null,
  });
  expect(byDeck).toHaveLength(1);
  expect(byDeck[0]?.id).toBe('thien_luu');

  const byUnitsAll = resolveEnemyUnits({
    aiPreset: {
      deck: [],
      unitsAll: ['nguyen_le'],
    } as any,
    preferredDeck: null,
    fallbackDeck: null,
  });
  expect(byUnitsAll).toHaveLength(1);
  expect(byUnitsAll[0]?.id).toBe('nguyen_le');
});

describe('normalizeConfig deck cache', () => {
  test('tái sử dụng cùng normalized deck khi nhiều field dùng chung input array', () => {
    const sharedDeck = ['thien_luu', 'nguyen_le'];
    const normalized = normalizeConfig({
      lineupDeck: sharedDeck,
      playerDeck: sharedDeck,
      deck: sharedDeck,
      aiPreset: {
        deck: sharedDeck,
        unitsAll: sharedDeck,
      } as any,
    });

    expect(normalized.lineupDeck).toBe(normalized.playerDeck);
    expect(normalized.playerDeck).toBe(normalized.deck);
    expect(normalized.aiPreset?.deck).toBe(normalized.deck);
    expect(normalized.aiPreset?.unitsAll).toBe(normalized.deck);
  });
});