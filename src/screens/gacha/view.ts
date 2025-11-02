import { assertElement, ensureStyleTag, mountSection } from '../../ui/dom.ts';
import {
  mountRarityAura,
  unmountRarity,
  normalizeRarity,
  playGachaReveal,
} from '../../ui/rarity/rarity.ts';
import type { MountedSection } from '../../ui/dom.ts';
import type { Rarity } from '../../ui/rarity/rarity.ts';

const STYLE_ID = 'gacha-view-style';

interface GachaCardInput {
  readonly id?: string | number | null;
  readonly name?: string | null;
  readonly title?: string | null;
  readonly label?: string | null;
  readonly rarity: Rarity | string;
  readonly description?: string | null;
  readonly artwork?: string | null;
}

interface NormalizedGachaCard {
  readonly id: string;
  readonly name: string;
  readonly rarity: Rarity;
  readonly description: string | null;
  readonly artwork: string | null;
}

export interface GachaViewOptions {
  readonly root: HTMLElement | null | undefined;
  readonly cards?: ReadonlyArray<GachaCardInput> | null;
  readonly title?: string | null;
  readonly subtitle?: string | null;
  readonly onRevealDone?: (() => void) | null;
}

export interface GachaViewHandle {
  readonly root: HTMLElement;
  readonly section: HTMLElement;
  reveal(): void;
  updateCards(cards: ReadonlyArray<GachaCardInput>): void;
  setRevealDoneCallback(callback: (() => void) | null | undefined): void;
  destroy(): void;
}

interface AuraEntry {
  readonly id: string;
  readonly el: HTMLElement;
  readonly rarity: Rarity;
}

function ensureStyles(): void {
  const css = `
    .app--gacha{padding:32px 16px 64px;background:linear-gradient(160deg,rgba(6,10,16,.94),rgba(12,18,28,.88));min-height:100vh;box-sizing:border-box;}
    .gacha-view{display:flex;flex-direction:column;gap:24px;margin:0 auto;max-width:1280px;color:#e8f3ff;}
    .gacha-view__header{display:flex;flex-direction:column;gap:6px;align-items:flex-start;}
    .gacha-view__title{margin:0;font-size:34px;letter-spacing:.08em;text-transform:uppercase;}
    .gacha-view__subtitle{margin:0;font-size:15px;color:rgba(174,228,255,.82);letter-spacing:.04em;}
    .gacha-view__actions{display:flex;gap:12px;align-items:center;}
    .gacha-view__reveal{padding:11px 22px;border-radius:999px;border:1px solid rgba(174,228,255,.38);background:rgba(16,28,42,.86);color:#aee4ff;letter-spacing:.12em;text-transform:uppercase;font-size:12px;font-weight:600;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
    .gacha-view__reveal:hover:enabled{transform:translateY(-2px);border-color:rgba(174,228,255,.56);box-shadow:0 14px 32px rgba(6,12,20,.45);}
    .gacha-view__reveal:disabled{opacity:.55;cursor:not-allowed;}
    .gacha-view__results{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;}
    .gacha-card{position:relative;min-height:220px;border-radius:22px;padding:16px;background:rgba(10,18,30,.88);border:1px solid rgba(125,211,252,.18);overflow:hidden;display:flex;flex-direction:column;gap:12px;justify-content:flex-end;box-shadow:0 18px 42px rgba(6,12,20,.4);}
    .gacha-card__art{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:.18;}
    .gacha-card__art img{width:120%;height:120%;object-fit:cover;filter:blur(2px);}
    .gacha-card__content{position:relative;z-index:1;display:flex;flex-direction:column;gap:6px;}
    .gacha-card__name{margin:0;font-size:18px;font-weight:600;letter-spacing:.04em;}
    .gacha-card__desc{margin:0;font-size:13px;line-height:1.5;color:rgba(196,228,255,.84);}
    @media(max-width:720px){
      .app--gacha{padding:24px 12px 48px;}
      .gacha-view__title{font-size:28px;}
      .gacha-card{min-height:200px;padding:14px;}
    }
  `;
  ensureStyleTag(STYLE_ID, { css });
}

function toNormalizedCard(card: GachaCardInput, index: number): NormalizedGachaCard {
  const rarity = normalizeRarity(card.rarity);
  const idSource = card.id ?? `gacha-card-${index}`;
  const id = String(idSource);
  const rawName = card.name ?? card.title ?? card.label;
  const name = rawName && rawName.trim().length > 0 ? rawName.trim() : `Thẻ #${index + 1}`;
  const description = card.description?.trim?.() ? card.description.trim() : null;
  const artwork = card.artwork && card.artwork.trim().length > 0 ? card.artwork.trim() : null;
  return { id, name, rarity, description, artwork };
}

export function renderGachaView(options: GachaViewOptions): GachaViewHandle {
  const host = assertElement<HTMLElement>(options.root, {
    guard: (node): node is HTMLElement => node instanceof HTMLElement,
    message: 'renderGachaView cần một phần tử root hợp lệ.',
  });

  ensureStyles();

  const section = document.createElement('section');
  section.className = 'gacha-view';
  section.dataset.view = 'gacha';

  const header = document.createElement('header');
  header.className = 'gacha-view__header';

  const title = document.createElement('h1');
  title.className = 'gacha-view__title';
  title.textContent = options.title?.trim() || 'Kết Quả Gacha';
  header.appendChild(title);

  if (options.subtitle){
    const subtitle = document.createElement('p');
    subtitle.className = 'gacha-view__subtitle';
    subtitle.textContent = options.subtitle;
    header.appendChild(subtitle);
  }

  const actions = document.createElement('div');
  actions.className = 'gacha-view__actions';
  const revealButton = document.createElement('button');
  revealButton.type = 'button';
  revealButton.className = 'gacha-view__reveal';
  revealButton.textContent = 'Bật Hiệu Ứng';
  actions.appendChild(revealButton);
  header.appendChild(actions);

  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'gacha-view__results';
  section.appendChild(grid);

  const mount: MountedSection<HTMLElement, HTMLElement> = mountSection({
    root: host,
    section,
    rootClasses: 'app--gacha',
  });

  const auraEntries: AuraEntry[] = [];
  let revealDoneCallback = typeof options.onRevealDone === 'function' ? options.onRevealDone : null;
  let isRevealing = false;

  const cleanupCallbacks: Array<() => void> = [];
  const addCleanup = (fn: (() => void) | null | undefined) => {
    if (typeof fn === 'function'){
      cleanupCallbacks.push(fn);
    }
  };

  function updateRevealButtonState(): void {
    revealButton.disabled = isRevealing || auraEntries.length === 0;
  }

  function disposeCardEntries(): void {
    while (auraEntries.length > 0){
      const entry = auraEntries.pop();
      if (entry){
        unmountRarity(entry.el);
      }
    }
  }

  function renderCards(cards: ReadonlyArray<GachaCardInput>): void {
    disposeCardEntries();
    grid.replaceChildren();
    cards.forEach((card, index) => {
      const normalized = toNormalizedCard(card, index);
      const cardEl = document.createElement('article');
      cardEl.className = 'gacha-card';
      cardEl.dataset.cardId = normalized.id;
      cardEl.dataset.rarity = normalized.rarity;
      cardEl.tabIndex = 0;

      if (normalized.artwork){
        const art = document.createElement('div');
        art.className = 'gacha-card__art';
        const img = document.createElement('img');
        img.alt = normalized.name;
        img.src = normalized.artwork;
        art.appendChild(img);
        cardEl.appendChild(art);
      }

      const content = document.createElement('div');
      content.className = 'gacha-card__content';

      const name = document.createElement('h3');
      name.className = 'gacha-card__name';
      name.textContent = normalized.name;
      content.appendChild(name);

      if (normalized.description){
        const desc = document.createElement('p');
        desc.className = 'gacha-card__desc';
        desc.textContent = normalized.description;
        content.appendChild(desc);
      }

      cardEl.appendChild(content);

      mountRarityAura(cardEl, normalized.rarity, 'gacha', { label: true });
      auraEntries.push({ id: normalized.id, el: cardEl, rarity: normalized.rarity });
      grid.appendChild(cardEl);
    });
    updateRevealButtonState();
  }

  function handleReveal(): void {
    if (isRevealing || auraEntries.length === 0){
      return;
    }
    isRevealing = true;
    updateRevealButtonState();
    const cards = auraEntries.map(entry => ({ el: entry.el, rarity: entry.rarity }));
    const onDone = () => {
      isRevealing = false;
      updateRevealButtonState();
      if (revealDoneCallback){
        revealDoneCallback();
      }
    };
    playGachaReveal(cards, { onDone });
  }

  revealButton.addEventListener('click', handleReveal);
  addCleanup(() => revealButton.removeEventListener('click', handleReveal));

  renderCards(options.cards ?? []);

  return {
    root: mount.root,
    section: mount.section,
    reveal: handleReveal,
    updateCards(nextCards) {
      renderCards(nextCards);
    },
    setRevealDoneCallback(callback) {
      revealDoneCallback = typeof callback === 'function' ? callback : null;
    },
    destroy() {
      cleanupCallbacks.forEach(fn => fn());
      cleanupCallbacks.length = 0;
      disposeCardEntries();
      mount.destroy();
    },
  } satisfies GachaViewHandle;
}
