import { pickRandom } from '../../engine';

import type { SessionState } from '@shared-types/pve';
import type { PveDeckEntry } from '@shared-types/combat';
import type { SummonBarHandles } from '@shared-types/ui';

type DeckEntry = PveDeckEntry;

type LockedDeckCache = {
  deckRef: ReadonlyArray<DeckEntry>;
  ids: ReadonlySet<string>;
};
type DeckFilterCache = {
  gameRef: SessionState;
  deckRef: ReadonlyArray<DeckEntry>;
  lockedDeckRef: ReadonlyArray<DeckEntry>;
  result: ReadonlyArray<DeckEntry>;
};

type SessionDeckDeps = {
  getGame: () => SessionState | null;
  handSize: number;
  isUniqueGlobalSummonBlocked: (game: SessionState, card: DeckEntry) => boolean;
  queueSummonFromDeckSelection: (params: {
    game: SessionState;
    card: DeckEntry;
    cell: { cx: number; cy: number };
  }) => boolean;
};

type SessionDeckController = {
  ensureDeck: (game?: SessionState | null) => DeckEntry[];
  ensureLockedPlayerDeck: (game?: SessionState | null) => ReadonlyArray<DeckEntry>;
  isCardInLockedDeck: (cardId: string, game?: SessionState | null) => boolean;
  findDeckEntryIndexById: (deck: ReadonlyArray<DeckEntry>, id: string | null | undefined) => number;
  removeDeckEntryAtIndex: (deck: ReadonlyArray<DeckEntry>, removeIndex: number) => DeckEntry[];
  getCardCost: (card: DeckEntry | null | undefined) => number;
  refillDeck: () => void;
  selectFirstAffordable: () => void;
  flushSummonBarRender: () => void;
  renderSummonBar: () => void;
  handleSummonBarPick: (card: unknown) => void;
  canAffordCard: (card: unknown) => boolean;
  getDeckForSummonBar: () => DeckEntry[];
  handleCanvasSummonCellClick: (cell: { cx: number; cy: number }) => boolean;
};

const EMPTY_DECK_ENTRIES: DeckEntry[] = [];
const RESOLVED_PROMISE = Promise.resolve();

const isInitializedGame = (value: unknown): value is SessionState & { _inited: true } => (
  !!value && typeof value === 'object' && (value as { _inited?: unknown })._inited === true
);

const isDeckEntry = (value: unknown): value is DeckEntry => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { id?: unknown };
  return typeof candidate.id === 'string' && candidate.id.trim() !== '';
};

const sanitizeDeckEntries = (
  value: unknown,
  cache: WeakMap<ReadonlyArray<unknown>, ReadonlyArray<DeckEntry>>,
): DeckEntry[] => {
  if (!Array.isArray(value)) return EMPTY_DECK_ENTRIES;
  const cached = cache.get(value);
  if (cached) return cached as DeckEntry[];
  let normalized: DeckEntry[] | null = null;
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    if (isDeckEntry(entry)) {
      if (normalized) normalized.push(entry);
      continue;
    }
    if (!normalized) {
      normalized = (value.slice(0, index) as DeckEntry[]);
    }
  }
  const result = normalized ?? (value as DeckEntry[]);
  cache.set(value, result);
  return result;
};

export const createSessionDeckController = (deps: SessionDeckDeps): SessionDeckController => {
  let lockedDeckCache: LockedDeckCache | null = null;
  let lockedDeckNormalizeCache: {
    gameRef: SessionState;
    sourceRef: ReadonlyArray<unknown>;
    normalized: ReadonlyArray<DeckEntry>;
  } | null = null;
  let deckFilterCache: DeckFilterCache | null = null;
  const sanitizedDeckEntriesCache = new WeakMap<ReadonlyArray<unknown>, ReadonlyArray<DeckEntry>>();
  const refillDeckExcludeIds = new Set<string>();
  let summonBarRenderPending = false;

  const invalidateLockedDeckCache = (): void => {
    lockedDeckCache = null;
    lockedDeckNormalizeCache = null;
    deckFilterCache = null;
  };

  const getLockedDeckIdSet = (lockedDeck: ReadonlyArray<DeckEntry>): ReadonlySet<string> => {
    if (lockedDeckCache?.deckRef === lockedDeck) {
      return lockedDeckCache.ids;
    }
    const ids = new Set<string>();
    for (let i = 0; i < lockedDeck.length; i += 1) {
      const entry = lockedDeck[i];
      if (!entry?.id) continue;
      ids.add(entry.id);
    }
    lockedDeckCache = {
      deckRef: lockedDeck,
      ids,
    };
    return ids;
  };

  const ensureLockedPlayerDeck = (game: SessionState | null | undefined = deps.getGame()): ReadonlyArray<DeckEntry> => {
    const session = isInitializedGame(game) ? game : null;
    if (!session) return EMPTY_DECK_ENTRIES;
    const lockedSource = Array.isArray(session.playerDeckLocked) && session.playerDeckLocked.length
      ? session.playerDeckLocked
      : session.unitsAll;
    if (
      lockedDeckNormalizeCache
      && lockedDeckNormalizeCache.gameRef === session
      && lockedDeckNormalizeCache.sourceRef === lockedSource
    ) {
      return lockedDeckNormalizeCache.normalized;
    }
    const lockedDeck = sanitizeDeckEntries(lockedSource, sanitizedDeckEntriesCache);
    if (lockedDeck !== session.playerDeckLocked) {
      session.playerDeckLocked = lockedDeck;
      invalidateLockedDeckCache();
    }
    lockedDeckNormalizeCache = {
      gameRef: session,
      sourceRef: lockedSource,
      normalized: lockedDeck,
    };
    return lockedDeck;
  };

  const ensureDeck = (game: SessionState | null | undefined = deps.getGame()): DeckEntry[] => {
    const session = isInitializedGame(game) ? game : null;
    if (!session) return [];
    const deck = sanitizeDeckEntries(session.deck3, sanitizedDeckEntriesCache);
    const lockedDeck = ensureLockedPlayerDeck(session);
    if (
      deckFilterCache
      && deckFilterCache.gameRef === session
      && deckFilterCache.deckRef === deck
      && deckFilterCache.lockedDeckRef === lockedDeck
    ) {
      return deckFilterCache.result as DeckEntry[];
    }
    const lockedIds = getLockedDeckIdSet(lockedDeck);
    let filteredDeck: DeckEntry[] | null = null;
    for (let i = 0; i < deck.length; i += 1) {
      const entry = deck[i];
      if (!entry || !lockedIds.has(entry.id)) {
        if (!filteredDeck) filteredDeck = deck.slice(0, i) as DeckEntry[];
        continue;
      }
      if (filteredDeck) filteredDeck.push(entry);
    }
    const result = filteredDeck ?? deck;
    if (filteredDeck || deck !== session.deck3) {
      session.deck3 = result;
    }
    deckFilterCache = {
      gameRef: session,
      deckRef: deck,
      lockedDeckRef: lockedDeck,
      result,
    };
    return result;
  };

  const isCardInLockedDeck = (cardId: string, game: SessionState | null | undefined = deps.getGame()): boolean => {
    if (!isInitializedGame(game)) return false;
    const lockedDeck = ensureLockedPlayerDeck(game);
    return getLockedDeckIdSet(lockedDeck).has(cardId);
  };

  const findDeckEntryIndexById = (
    deck: ReadonlyArray<DeckEntry>,
    id: string | null | undefined,
  ): number => {
    if (!id) return -1;
    for (let i = 0; i < deck.length; i += 1) {
      if (deck[i]?.id === id) return i;
    }
    return -1;
  };

  const removeDeckEntryAtIndex = (
    deck: ReadonlyArray<DeckEntry>,
    removeIndex: number,
  ): DeckEntry[] => {
    if (removeIndex < 0 || removeIndex >= deck.length) return deck as DeckEntry[];
    const mutableDeck = deck as DeckEntry[];
    mutableDeck.splice(removeIndex, 1);
    return mutableDeck;
  };

  const getCardCost = (card: DeckEntry | null | undefined): number => {
    if (!card) return 0;
    const parsed = Number(card.cost);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const selectFirstAffordable = (): void => {
    const game = deps.getGame();
    if (!game) return;

    const deck = ensureDeck(game);
    if (!deck.length){
      game.selectedId = null;
      return;
    }

    let cheapestAffordable: DeckEntry | null = null;
    let cheapestAffordableCost = Infinity;
    let cheapestOverall: DeckEntry | null = null;
    let cheapestOverallCost = Infinity;

    for (let index = 0; index < deck.length; index += 1){
      const card = deck[index];
      if (!card) continue;

      const cardCost = getCardCost(card);

      if (cardCost < cheapestOverallCost){
        cheapestOverall = card;
        cheapestOverallCost = cardCost;
      }

      const affordable = cardCost <= game.cost;
      if (affordable && cardCost < cheapestAffordableCost){
        cheapestAffordable = card;
        cheapestAffordableCost = cardCost;
      }
    }

    const chosen = (cheapestAffordable || cheapestOverall) ?? null;
    game.selectedId = chosen ? chosen.id : null;
  };

  const refillDeck = (): void => {
    const game = deps.getGame();
    if (!game) return;

    const deck = ensureDeck(game);
    const need = deps.handSize - deck.length;
    if (need <= 0) return;

    const exclude = refillDeckExcludeIds;
    exclude.clear();
    for (const id of game.usedUnitIds) {
      exclude.add(id);
    }
    for (let i = 0; i < deck.length; i += 1) {
      const entry = deck[i];
      if (!entry?.id) continue;
      exclude.add(entry.id);
    }
    const lockedDeck = ensureLockedPlayerDeck(game);
    const more = pickRandom(lockedDeck, exclude, need);
    deck.push(...more);
    game.deck3 = deck;
  };

  const flushSummonBarRender = (): void => {
    summonBarRenderPending = false;
    const game = deps.getGame();
    const bar: SummonBarHandles | null | undefined = game?.ui?.bar;
    if (bar?.render) bar.render();
  };

  const renderSummonBar = (): void => {
    if (summonBarRenderPending) return;
    summonBarRenderPending = true;
    if (typeof queueMicrotask === 'function'){
      queueMicrotask(flushSummonBarRender);
      return;
    }
    RESOLVED_PROMISE.then(flushSummonBarRender);
  };

  const handleSummonBarPick = (card: unknown): void => {
    const game = deps.getGame();
    if (!game || !isDeckEntry(card)) return;
    const entry = card;
    if (!isCardInLockedDeck(entry.id, game)) return;
    game.selectedId = entry.id;
    renderSummonBar();
  };

  const canAffordCard = (card: unknown): boolean => {
    const game = deps.getGame();
    if (!game || !isDeckEntry(card)) return false;
    const entry = card;
    if (deps.isUniqueGlobalSummonBlocked(game, entry)) return false;
    return game.cost >= getCardCost(entry);
  };

  const getDeckForSummonBar = (): DeckEntry[] => {
    const game = deps.getGame();
    if (!game) return [];
    return ensureDeck(game);
  };

  const handleCanvasSummonCellClick = (cell: { cx: number; cy: number }): boolean => {
    const game = deps.getGame();
    if (!game) return false;
    const deck = ensureDeck(game);
    const selectedIndex = findDeckEntryIndexById(deck, game.selectedId);
    if (selectedIndex < 0) return false;
    const card = deck[selectedIndex];
    if (!card || !isCardInLockedDeck(card.id, game)) return false;
    if (deps.isUniqueGlobalSummonBlocked(game, card)) return false;
    if (!deps.queueSummonFromDeckSelection({ game, card, cell })) return false;

    game.deck3 = removeDeckEntryAtIndex(deck, selectedIndex);
    game.selectedId = null;
    refillDeck();
    selectFirstAffordable();
    renderSummonBar();
    return true;
  };

  return {
    ensureDeck,
    ensureLockedPlayerDeck,
    isCardInLockedDeck,
    findDeckEntryIndexById,
    removeDeckEntryAtIndex,
    getCardCost,
    refillDeck,
    selectFirstAffordable,
    flushSummonBarRender,
    renderSummonBar,
    handleSummonBarPick,
    canAffordCard,
    getDeckForSummonBar,
    handleCanvasSummonCellClick,
  };
};

export { isDeckEntry };
