import rarityTokensSource from './rarity_tokens.json';
import rarityCss from './rarity.css';
import { ensureStyleTag } from '../dom.ts';

const STYLE_ID = 'ui-rarity-style';

type TokenConfigInput = {
  readonly hex: string;
  readonly glow: number;
  readonly ring: number;
  readonly spark: number;
  readonly prism?: boolean;
};

type TokenConfig = Readonly<{
  hex: string;
  glow: number;
  glowLow: number;
  ring: number;
  spark: number;
  prism: boolean;
}>;

export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'PRIME';
export type AuraVariant = 'gacha' | 'deck' | 'collection';
export type PowerMode = 'normal' | 'low';

interface MountOptions {
  label?: boolean;
  rounded?: boolean;
}

interface NormalizedOptions {
  label: boolean;
  rounded: boolean;
}

interface AuraState {
  host: HTMLElement;
  overlay: HTMLDivElement;
  ring: HTMLDivElement;
  glow: HTMLDivElement;
  sweep: HTMLDivElement;
  sparkLayer: HTMLDivElement | null;
  badge: HTMLDivElement | null;
  rarity: Rarity;
  variant: AuraVariant;
  label: boolean;
  rounded: boolean;
  token: TokenConfig;
  originalPosition: string | null;
  didSetPosition: boolean;
  revealTimers: number[];
  revealRaf: number | null;
  sparkTimers: number[];
  classObserver: MutationObserver | null;
  classPoller: number | null;
}

const RARITY_SEQUENCE: Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'];

function normalizePowerMode(input: unknown): PowerMode {
  return input === 'low' ? 'low' : 'normal';
}

function normalizeRarityInput(input: string | Rarity): Rarity {
  const key = String(input).trim().toUpperCase();
  if (RARITY_SEQUENCE.includes(key as Rarity)){
    return key as Rarity;
  }
  throw new Error(`Rarity không hợp lệ: ${input}`);
}

export function normalizeRarity(value: unknown): Rarity {
  return normalizeRarityInput(value as string | Rarity);
}

export function coerceRarity(value: unknown, fallback: Rarity = 'N'): Rarity {
  try {
    return normalizeRarity(value);
  } catch (error) {
    return fallback;
  }
}

function createTokenConfig(input: TokenConfigInput): TokenConfig {
  const { hex, glow, ring, spark, prism = false } = input;
  return Object.freeze({
    hex,
    glow,
    glowLow: glow * 0.7,
    ring,
    spark,
    prism,
  });
}

function normalizeTokenMap(source: Record<string, TokenConfigInput>): Record<Rarity, TokenConfig> {
  const tokens = new Map<Rarity, TokenConfig>();
  Object.entries(source ?? {}).forEach(([rawKey, rawValue]) => {
    const rarity = normalizeRarityInput(rawKey);
    tokens.set(rarity, createTokenConfig(rawValue));
  });
  RARITY_SEQUENCE.forEach(key => {
    if (!tokens.has(key)){
      throw new Error(`Thiếu token cho bậc ${key}`);
    }
  });
  return Object.freeze(Object.fromEntries(tokens) as Record<Rarity, TokenConfig>);
}

const RARITY_TOKENS = normalizeTokenMap(rarityTokensSource as Record<string, TokenConfigInput>);

ensureStyleTag(STYLE_ID, { css: rarityCss });

const auraStates = new WeakMap<HTMLElement, AuraState>();
const activeStates = new Set<AuraState>();
const sparkUsage = new WeakMap<HTMLDivElement, number>();

let currentPowerMode: PowerMode = 'normal';
let activeSparkCount = 0;

const MAX_ACTIVE_SPARKS = 16;
const SPARK_DURATION = 900;
const BLOOM_DELAY = 300;
const REVEAL_DELAY = 900;
const TIMELINE_TOTAL = 1300;

function getToken(rarity: Rarity): TokenConfig {
  return RARITY_TOKENS[rarity];
}

function normalizeOptions(variant: AuraVariant, options?: MountOptions | null): NormalizedOptions {
  return {
    label: options?.label ?? variant !== 'deck',
    rounded: Boolean(options?.rounded),
  };
}

function getRarityClass(rarity: Rarity): string {
  return `rarity-${rarity}`;
}

function clearTimers(ids: number[], clearFn: (id: number) => void): void {
  ids.splice(0, ids.length).forEach(id => clearFn(id));
}

function clearReveal(state: AuraState): void {
  if (typeof cancelAnimationFrame === 'function' && state.revealRaf !== null){
    cancelAnimationFrame(state.revealRaf);
  } else if (state.revealRaf !== null){
    clearTimeout(state.revealRaf);
  }
  state.revealRaf = null;
  clearTimers(state.revealTimers, clearTimeout);
  state.overlay.classList.remove('is-pre', 'is-bloom', 'is-reveal');
}

function clearSparks(state: AuraState): void {
  if (state.sparkLayer){
    sparkUsage.delete(state.sparkLayer);
    while (state.sparkLayer.firstChild){
      state.sparkLayer.removeChild(state.sparkLayer.firstChild);
    }
  }
  activeSparkCount = Math.max(0, activeSparkCount - state.sparkTimers.length);
  clearTimers(state.sparkTimers, clearTimeout);
  state.sparkTimers.length = 0;
}

function applyCssVariables(state: AuraState): void {
  const { overlay, token, variant } = state;
  overlay.style.setProperty('--rarity-color', token.hex);
  overlay.style.setProperty('--rarity-ring-scale', token.ring.toString());
  overlay.style.setProperty('--rarity-glow-base', token.glow.toString());
  overlay.style.setProperty('--rarity-glow-low', token.glowLow.toString());
  overlay.style.setProperty('--rarity-glow-active', currentPowerMode === 'low' ? token.glowLow.toString() : token.glow.toString());
  const sparkCount = variant === 'gacha' && currentPowerMode !== 'low' ? token.spark : 0;
  overlay.style.setProperty('--rarity-spark-count', sparkCount.toString());
  const sweepOpacity = variant === 'gacha'
    ? (token.prism ? '0.75' : '0.65')
    : '0';
  overlay.style.setProperty('--rarity-sweep-opacity', sweepOpacity);
}

function ensureSparkLayer(state: AuraState): HTMLDivElement {
  if (!state.sparkLayer){
    const layer = document.createElement('div');
    layer.className = 'spark-layer';
    state.overlay.appendChild(layer);
    state.sparkLayer = layer;
  }
  return state.sparkLayer;
}

function ensureBadge(state: AuraState): HTMLDivElement | null {
  if (!state.label){
    if (state.badge && state.badge.parentNode){
      state.badge.parentNode.removeChild(state.badge);
    }
    state.badge = null;
    state.overlay.classList.remove('has-badge');
    return null;
  }
  if (!state.badge){
    const badge = document.createElement('div');
    badge.className = 'badge';
    state.overlay.appendChild(badge);
    state.badge = badge;
  }
  state.overlay.classList.add('has-badge');
  state.badge!.textContent = state.rarity;
  return state.badge!;
}

function applyClasses(state: AuraState): void {
  const { overlay, rarity, variant, token } = state;
  RARITY_SEQUENCE.forEach(key => {
    const className = getRarityClass(key);
    if (key === rarity){
      overlay.classList.add(className);
    } else {
      overlay.classList.remove(className);
    }
  });
  overlay.dataset.variant = variant;
  overlay.classList.toggle('prism', token.prism);
  overlay.classList.toggle('is-rounded', state.rounded);
  const wantsSweep = variant === 'gacha' && (rarity === 'UR' || rarity === 'PRIME');
  const wantsSpark = variant === 'gacha' && token.spark > 0 && currentPowerMode !== 'low';
  overlay.classList.toggle('has-sweep', wantsSweep && currentPowerMode !== 'low');
  overlay.classList.toggle('has-spark', wantsSpark);
  if (!overlay.classList.contains('has-spark')){
    clearSparks(state);
  }
  if (!overlay.classList.contains('has-sweep') && state.sweep.parentNode === state.overlay){
    state.sweep.classList.remove('active');
  }
}

function syncInteractionClasses(state: AuraState): void {
  const { host, overlay } = state;
  overlay.classList.toggle('is-hovered', host.classList.contains('is-hovered'));
  overlay.classList.toggle('is-selected', host.classList.contains('is-selected'));
}

function stopInteractionSync(state: AuraState): void {
  if (state.classObserver){
    state.classObserver.disconnect();
    state.classObserver = null;
  }
  if (state.classPoller !== null){
    clearInterval(state.classPoller);
    state.classPoller = null;
  }
}

function startInteractionSync(state: AuraState): void {
  stopInteractionSync(state);
  syncInteractionClasses(state);
  if (typeof MutationObserver === 'function'){
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations){
        if (mutation.type === 'attributes' && mutation.attributeName === 'class'){
          syncInteractionClasses(state);
          break;
        }
      }
    });
    observer.observe(state.host, { attributes: true, attributeFilter: ['class'] });
    state.classObserver = observer;
    return;
  }
  if (typeof window !== 'undefined' && typeof window.setInterval === 'function'){
    state.classPoller = window.setInterval(() => syncInteractionClasses(state), 250);
  }
}

function setupOverlay(host: HTMLElement, variant: AuraVariant): AuraState {
  const existing = auraStates.get(host);
  if (existing){
    existing.variant = variant;
    return existing;
  }

  const overlay = document.createElement('div');
  overlay.className = 'rarity-aura';
  overlay.dataset.variant = variant;

  const glow = document.createElement('div');
  glow.className = 'glow';
  overlay.appendChild(glow);

  const ring = document.createElement('div');
  ring.className = 'ring';
  overlay.appendChild(ring);

  const sweep = document.createElement('div');
  sweep.className = 'sweep';
  overlay.appendChild(sweep);

  const state: AuraState = {
    host,
    overlay,
    ring,
    glow,
    sweep,
    sparkLayer: null,
    badge: null,
    rarity: 'N',
    variant,
    label: false,
    rounded: false,
    token: getToken('N'),
    originalPosition: null,
    didSetPosition: false,
    revealTimers: [],
    revealRaf: null,
    sparkTimers: [],
    classObserver: null,
    classPoller: null,
  };

  const computedPosition = typeof window !== 'undefined' && window?.getComputedStyle
    ? window.getComputedStyle(host).position
    : host.style.position;
  const inlinePosition = host.style.position;
  if (!computedPosition || computedPosition === 'static'){
    host.style.position = 'relative';
    state.didSetPosition = true;
  }
  state.originalPosition = inlinePosition || null;

  host.appendChild(overlay);
  auraStates.set(host, state);
  activeStates.add(state);
  return state;
}

function updateState(state: AuraState, rarity: Rarity, variant: AuraVariant, options: NormalizedOptions): void {
  state.rarity = rarity;
  state.variant = variant;
  state.label = options.label;
  state.rounded = options.rounded;
  state.token = getToken(rarity);
  applyCssVariables(state);
  applyClasses(state);
  ensureBadge(state);
}

export function mountRarityAura(host: HTMLElement, rarity: Rarity, variant: AuraVariant, options?: MountOptions): void {
  if (!host || typeof document === 'undefined'){
    return;
  }
  const normalizedRarity = normalizeRarityInput(rarity);
  const normalizedOptions = normalizeOptions(variant, options);
  const state = setupOverlay(host, variant);
  updateState(state, normalizedRarity, variant, normalizedOptions);
  startInteractionSync(state);
}

export function updateRarity(host: HTMLElement, rarity: Rarity): void {
  const state = auraStates.get(host);
  if (!state){
    return;
  }
  const normalizedRarity = normalizeRarityInput(rarity);
  updateState(state, normalizedRarity, state.variant, {
    label: state.label,
    rounded: state.rounded,
  });
}

export function unmountRarity(host: HTMLElement): void {
  const state = auraStates.get(host);
  if (!state){
    return;
  }
  clearReveal(state);
  clearSparks(state);
  stopInteractionSync(state);
  if (state.overlay.parentNode === host){
    host.removeChild(state.overlay);
  }
  if (state.didSetPosition){
    if (state.originalPosition){
      host.style.position = state.originalPosition;
    } else {
      host.style.removeProperty('position');
    }
  }
  auraStates.delete(host);
  activeStates.delete(state);
}

export function setPowerMode(mode: PowerMode): void {
  const normalizedMode = normalizePowerMode(mode);
  if (normalizedMode === currentPowerMode){
    return;
  }
  currentPowerMode = normalizedMode;
  const doc = typeof document !== 'undefined' ? document : null;
  const body = doc?.body ?? null;
  if (body){
    body.classList.toggle('low-power', normalizedMode === 'low');
  }
  activeStates.forEach(state => {
    applyCssVariables(state);
    applyClasses(state);
    if (normalizedMode === 'low'){
      clearSparks(state);
    }
  });
}

interface RevealCard {
  el: HTMLElement;
  rarity: Rarity;
}

interface RevealOptions {
  staggerMs?: number;
  onDone?: () => void;
}

export interface PrepareGachaRevealOptions {
  label?: boolean;
  rounded?: boolean;
  getRarity?: (host: HTMLElement) => string | Rarity | null | undefined;
  staggerMs?: number;
  onDone?: () => void;
}

export interface GachaRevealController {
  reveal(): void;
  update(host: HTMLElement, rarity: Rarity | string): void;
  dispose(): void;
}

function scheduleTimeout(state: AuraState, delay: number, cb: () => void): void {
  const id = setTimeout(cb, delay);
  state.revealTimers.push(id);
}

function spawnSparks(state: AuraState): void {
  const token = state.token;
  if (currentPowerMode === 'low' || token.spark <= 0 || state.variant !== 'gacha'){
    return;
  }
  const availableGlobal = Math.max(0, MAX_ACTIVE_SPARKS - activeSparkCount);
  if (availableGlobal <= 0){
    return;
  }
  const layer = ensureSparkLayer(state);
  const existingForLayer = sparkUsage.get(layer) ?? 0;
  const availableForLayer = Math.max(0, token.spark - existingForLayer);
  const spawnCount = Math.min(availableForLayer, availableGlobal);
  if (spawnCount <= 0){
    return;
  }
  for (let index = 0; index < spawnCount; index += 1){
    const spark = document.createElement('div');
    spark.className = 'spark';
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 45 + 10;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    spark.style.setProperty('--spark-x', `${offsetX}px`);
    spark.style.setProperty('--spark-y', `${offsetY}px`);
    spark.style.setProperty('--spark-delay', `${Math.random() * 120}ms`);
    spark.style.setProperty('--spark-duration', `${SPARK_DURATION + Math.random() * 300}ms`);
    layer.appendChild(spark);
    activeSparkCount += 1;
    const currentLayerCount = (sparkUsage.get(layer) ?? 0) + 1;
    sparkUsage.set(layer, currentLayerCount);
    const cleanupId = setTimeout(() => {
      if (spark.parentNode === layer){
        layer.removeChild(spark);
      }
      activeSparkCount = Math.max(0, activeSparkCount - 1);
      const remaining = Math.max(0, (sparkUsage.get(layer) ?? 0) - 1);
      if (remaining <= 0){
        sparkUsage.delete(layer);
      } else {
        sparkUsage.set(layer, remaining);
      }
      const timerIndex = state.sparkTimers.indexOf(cleanupId);
      if (timerIndex >= 0){
        state.sparkTimers.splice(timerIndex, 1);
      }
    }, SPARK_DURATION + 320);
    state.sparkTimers.push(cleanupId);
  }
}

function requestFrame(callback: FrameRequestCallback): number {
  if (typeof requestAnimationFrame === 'function'){
    return requestAnimationFrame(callback);
  }
  const getNow = typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? () => performance.now()
    : () => Date.now();
  return setTimeout(() => callback(getNow()), 16);
}

export function playGachaReveal(cards: RevealCard[], options?: RevealOptions): void {
  if (!Array.isArray(cards) || typeof document === 'undefined'){
    options?.onDone?.();
    return;
  }
  const stagger = options?.staggerMs ?? 120;
  const states = cards
    .map(card => ({ card, state: auraStates.get(card.el) }))
    .filter((entry): entry is { card: RevealCard; state: AuraState } => Boolean(entry.state));

  if (states.length === 0){
    options?.onDone?.();
    return;
  }

  let completed = 0;
  const total = states.length;

  const startTimeline = () => {
    states.forEach((entry, index) => {
      const { state } = entry;
      clearReveal(state);
      state.overlay.classList.add('is-pre');
      state.overlay.classList.remove('is-bloom', 'is-reveal');
      const delayBase = index * stagger;
      scheduleTimeout(state, delayBase + BLOOM_DELAY, () => {
        state.overlay.classList.remove('is-pre');
        state.overlay.classList.add('is-bloom');
        spawnSparks(state);
      });
      scheduleTimeout(state, delayBase + REVEAL_DELAY, () => {
        state.overlay.classList.remove('is-bloom');
        state.overlay.classList.add('is-reveal');
      });
      scheduleTimeout(state, delayBase + TIMELINE_TOTAL, () => {
        state.overlay.classList.add('is-reveal');
        completed += 1;
        if (completed === total){
          options?.onDone?.();
        }
      });
    });
  };

  const stateForRaf = states[0]?.state;
  if (stateForRaf){
    stateForRaf.revealRaf = requestFrame(() => {
      stateForRaf.revealRaf = null;
      states.forEach(entry => {
        entry.state.overlay.classList.add('is-pre');
      });
      startTimeline();
    });
  } else {
    startTimeline();
  }
}

export function prepareGachaReveal(hosts: Iterable<HTMLElement>, options?: PrepareGachaRevealOptions): GachaRevealController {
  if (typeof document === 'undefined'){
    return {
      reveal(){},
      update(){},
      dispose(){},
    };
  }

  const label = options?.label ?? true;
  const rounded = options?.rounded ?? true;
  const resolveRarity = options?.getRarity ?? ((host: HTMLElement) => host.dataset.rarity);
  const mounted = new Map<HTMLElement, Rarity>();

  for (const rawHost of hosts ?? []){
    if (!(rawHost instanceof HTMLElement)){
      continue;
    }
    const rarity = coerceRarity(resolveRarity(rawHost), 'N');
    mounted.set(rawHost, rarity);
    rawHost.dataset.rarity = rarity;
    mountRarityAura(rawHost, rarity, 'gacha', { label, rounded });
  }

  let disposed = false;
  const revealOptions: RevealOptions = {
    staggerMs: options?.staggerMs,
    onDone: options?.onDone,
  };

  const controller: GachaRevealController = {
    reveal() {
      if (disposed || mounted.size === 0){
        return;
      }
      const cards = Array.from(mounted.entries()).map(([el, rarity]) => ({ el, rarity }));
      playGachaReveal(cards, revealOptions);
    },
    update(host, rarityInput) {
      if (disposed || !mounted.has(host)){
        return;
      }
      const rarity = normalizeRarity(rarityInput);
      mounted.set(host, rarity);
      host.dataset.rarity = rarity;
      updateRarity(host, rarity);
    },
    dispose() {
      if (disposed){
        return;
      }
      disposed = true;
      mounted.forEach((_rarity, host) => {
        unmountRarity(host);
      });
      mounted.clear();
    },
  };

  return controller;
}