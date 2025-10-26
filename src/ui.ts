// v0.7.1
import { CFG } from './config.ts';
import {
  ACTION_END,
  TURN_END,
  TURN_START,
  addGameEventListener,
  gameEvents,
} from './events.ts';
import type { GameEventDetail, GameEventType } from './events.ts';
import { assertElement } from './ui/dom.ts';

import type { HudHandles, SummonBarCard, SummonBarHandles, SummonBarOptions } from './types/ui.ts';

type HudGameLike = { cost?: number | null; costCap?: number | null } | null | undefined;

type QueryableRoot = ParentNode & { querySelector?: typeof Document.prototype.querySelector };

function canQuery(node: unknown): node is QueryableRoot {
  return !!node && typeof (node as QueryableRoot).querySelector === 'function';
}

export function initHUD(doc: Document, root?: QueryableRoot | null): HudHandles {
  const queryFromRoot = <T extends Element>(id: string): T | null => {
    if (canQuery(root)){
      const el = root.querySelector<T>(`#${id}`);
      if (el) return el;
    }
    return null;
  };

  const costNow = queryFromRoot<HTMLElement>('costNow') || doc.getElementById('costNow');
  const costRing = queryFromRoot<HTMLElement>('costRing') || doc.getElementById('costRing');
  const costChip = queryFromRoot<HTMLElement>('costChip') || doc.getElementById('costChip');

  const update = (Game: HudGameLike): void => {
    if (!Game) return;

    const capRaw = Game.costCap ?? CFG.COST_CAP ?? 30;
    const cap = Number.isFinite(capRaw) && capRaw > 0 ? capRaw : 1;
    const now = Math.max(0, Math.floor(Game.cost ?? 0));
    const ratio = Math.max(0, Math.min(1, now / cap));

    if (costNow) costNow.textContent = String(now);
    if (costRing){
      const deg = `${(ratio * 360).toFixed(1)}deg`;
      costRing.style.setProperty('--deg', deg);
    }
    if (costChip){
      costChip.classList.toggle('full', now >= cap);
    }
  };

  const handleGameEvent = (event: GameEventDetail<GameEventType>): void => {
    const detail = event.detail as { game?: HudGameLike } | undefined;
    const state = detail?.game ?? null;
    if (state) update(state);
  };

  let cleanedUp = false;
  const disposers: Array<() => void> = [];
  const cleanup = (): void => {
    if (cleanedUp) return;
    cleanedUp = true;
    while (disposers.length > 0){
      const dispose = disposers.pop();
      if (dispose){
        dispose();
      }
    }
  };

  if (gameEvents){
    const types = [TURN_START, TURN_END, ACTION_END] as const;
    for (const type of types){
      disposers.push(addGameEventListener(type, handleGameEvent));
    }
  }

  return { update, cleanup } satisfies HudHandles;
}

type Debounced<TArgs extends unknown[]> = {
  (...args: TArgs): void;
  cancel(): void;
  flush(...args: TArgs): void;
};

function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, wait: number): Debounced<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: TArgs): void => {
    if (timer){
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timer){
      clearTimeout(timer);
      timer = null;
    }
  };

  debounced.flush = (...args: TArgs): void => {
    if (timer){
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };

  return debounced;
}

export function startSummonBar<TCard extends SummonBarCard = SummonBarCard>(
  doc: Document,
  options?: SummonBarOptions<TCard>,
  root?: QueryableRoot | null,
): SummonBarHandles {
  const {
    onPick = () => {},
    canAfford = () => true,
    getDeck = () => [] as ReadonlyArray<TCard>,
    getSelectedId = () => null,
  } = options ?? {};

  const queryFromRoot = <T extends Element>(selector: string, id?: string): T | null => {
    if (canQuery(root)){
      const el = root.querySelector<T>(selector);
      if (el) return el;
    }
    if (id && typeof doc.getElementById === 'function'){
      return doc.getElementById(id) as T | null;
    }
    return null;
  };

  const hostElement = queryFromRoot<HTMLElement>('#cards', 'cards');
  if (!hostElement){
    return { render: () => {} } satisfies SummonBarHandles;
  }
  const host = assertElement<HTMLElement>(hostElement, {
    guard: (node): node is HTMLElement => node instanceof HTMLElement,
    message: 'Summon bar cần một phần tử host hợp lệ.',
  });

  host.innerHTML = '';
  host.addEventListener('click', (event: Event) => {
    const target = event.target instanceof Element
      ? event.target
      : event.currentTarget instanceof Element
        ? event.currentTarget
        : null;
    const btn = target ? target.closest<HTMLButtonElement>('button.card') : null;
    if (!btn || btn.disabled || !host.contains(btn)) return;

    const deck = getDeck();
    const targetId = btn.dataset.id;
    if (!targetId) return;
    const card = deck.find((c) => c.id === targetId);
    if (!card || !canAfford(card)) return;

    onPick(card);
    Array.from(host.children).forEach((node) => {
      if (node instanceof HTMLElement){
        node.classList.toggle('active', node === btn);
      }
    });
  });

  const gap = CFG.UI?.CARD_GAP ?? 12;
  const minSize = CFG.UI?.CARD_MIN ?? 40;
  const boardEl = queryFromRoot<HTMLElement>('#board', 'board');

  const syncCardSize = debounce(() => {
    if (!boardEl) return;
    const rect = boardEl.getBoundingClientRect();
    const width = boardEl.clientWidth || rect.width || 0;
    const cell = Math.max(minSize, Math.floor((width - gap * 6) / 7));
    host.style.setProperty('--cell', `${cell}px`);
  }, 120);
  syncCardSize.flush();

  let cleanupResize: () => void = () => {};
  if (boardEl && typeof ResizeObserver === 'function'){
    const observer = new ResizeObserver(() => syncCardSize());
    observer.observe(boardEl);
    cleanupResize = (): void => {
      observer.disconnect();
      syncCardSize.cancel();
    };
  } else {
    const handleResize = (): void => syncCardSize();
    window.addEventListener('resize', handleResize);
    cleanupResize = (): void => {
      window.removeEventListener('resize', handleResize);
      syncCardSize.cancel();
    };
  }

  let removalObserver: MutationObserver | null = null;
  if (host && typeof MutationObserver === 'function'){
    const targetRoot = doc.body || doc.documentElement;
    const observerTarget = targetRoot
      ? assertElement<Element>(targetRoot, 'Cần một phần tử gốc để quan sát trạng thái kết nối.')
      : null;
    if (observerTarget){
      removalObserver = new MutationObserver(() => {
        if (!host.isConnected){
          cleanupResize();
          removalObserver?.disconnect();
          removalObserver = null;
        }
      });
      removalObserver.observe(observerTarget, { childList: true, subtree: true });
    }
  }

  const makeBtn = (card: TCard): HTMLButtonElement => {
    const btn = doc.createElement('button');
    btn.className = 'card';
    btn.dataset.id = card.id;
    btn.innerHTML = `<span class="cost">${card.cost}</span>`;
    const affordable = canAfford(card);
    btn.disabled = !affordable;
    btn.classList.toggle('disabled', !affordable);
    return btn;
  };

  const btns: HTMLButtonElement[] = [];

  const render = (): void => {
    const deck = getDeck();
    while (btns.length < deck.length){
      const btn = makeBtn(deck[btns.length]);
      host.appendChild(btn);
      btns.push(btn);
    }
    for (let i = 0; i < btns.length; i += 1){
      const button = btns[i];
      const card = deck[i];
      if (!card){
        button.hidden = true;
        continue;
      }
      button.hidden = false;
      button.dataset.id = card.id;
      const span = button.querySelector<HTMLSpanElement>('.cost');
      if (span) span.textContent = String(card.cost);
      const affordable = canAfford(card);
      button.disabled = !affordable;
      button.classList.toggle('disabled', !affordable);
      button.style.opacity = '';
      button.classList.toggle('active', getSelectedId() === card.id);
    }
  };

  if (gameEvents){
    const rerender = (): void => render();
    const types = [TURN_START, TURN_END, ACTION_END] as const;
    for (const type of types){
      addGameEventListener(type, () => rerender());
    }
  }

  return { render } satisfies SummonBarHandles;
}