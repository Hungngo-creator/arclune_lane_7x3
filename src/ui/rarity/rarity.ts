import rarityTokensSource from './rarity_tokens.json';
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
}

const RARITY_SEQUENCE: Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'];

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

const RARITY_CSS = `
.rarity-aura {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  contain: layout style paint;
  display: block;
  z-index: 1;
  --rarity-color: #ffffff;
  --rarity-ring-scale: 1;
  --rarity-glow-base: 1;
  --rarity-glow-low: calc(var(--rarity-glow-base) * 0.7);
  --rarity-glow-active: var(--rarity-glow-base);
  --rarity-spark-count: 0;
  --rarity-ring-opacity: 0.85;
  --rarity-glow-opacity: 0.65;
  --rarity-glow-scale: 1;
  --rarity-glow-blur: calc(9px * var(--rarity-glow-active));
  --rarity-shimmer-period: 6s;
  --rarity-shimmer-delay: 0s;
  --rarity-sweep-opacity: 0.65;
}

body.low-power .rarity-aura {
  --rarity-glow-active: var(--rarity-glow-low);
  --rarity-spark-count: 0;
  --rarity-sweep-opacity: 0;
}

.rarity-aura.is-rounded {
  border-radius: 9999px;
}

.rarity-aura .ring,
.rarity-aura .glow,
.rarity-aura .sweep,
.rarity-aura .spark-layer,
.rarity-aura .badge {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.rarity-aura .ring {
  box-shadow: 0 0 0 2px var(--rarity-color) inset, 0 0 0 1px rgba(0, 0, 0, 0.35);
  opacity: var(--rarity-ring-opacity);
  transform: scale(var(--rarity-ring-scale));
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.rarity-aura .glow {
  background: radial-gradient(62% 62% at 50% 50%, color-mix(in srgb, var(--rarity-color) 65%, transparent), transparent 72%);
  filter: blur(var(--rarity-glow-blur));
  opacity: var(--rarity-glow-opacity);
  transform: scale(var(--rarity-glow-scale));
  transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease;
}

.rarity-aura .badge {
  inset: auto auto 6px 6px;
  width: auto;
  padding: 2px 6px;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  pointer-events: none;
}

.rarity-aura[data-variant="deck"] .badge {
  display: none;
}

.rarity-aura[data-variant="gacha"] .badge {
  font-size: 14px;
}

.rarity-aura .spark-layer {
  display: none;
  overflow: visible;
}

.rarity-aura .spark {
  position: absolute;
  width: 6px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  opacity: 0;
  transform-origin: center;
  animation: spark-flare var(--spark-duration, 900ms) ease-out var(--spark-delay, 0ms) forwards;
}

.rarity-aura.has-spark .spark-layer {
  display: block;
}

@keyframes spark-flare {
  0% {
    opacity: 0;
    transform: translate(var(--spark-x, 0), var(--spark-y, 0)) scale(0.6) rotate(0deg);
  }
  10% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
  100% {
    opacity: 0;
    transform: translate(var(--spark-x, 0), var(--spark-y, 0)) scale(1.2) rotate(12deg);
  }
}

.rarity-aura .sweep {
  display: none;
  overflow: hidden;
  mix-blend-mode: screen;
  opacity: var(--rarity-sweep-opacity);
}

.rarity-aura .sweep::before {
  content: "";
  position: absolute;
  inset: -12%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0));
  transform: translateX(-120%) skewX(-10deg);
  filter: blur(2px);
  animation: sweep 1.4s ease-in-out var(--sweep-delay, 0ms) 1;
}

.rarity-aura.has-sweep .sweep {
  display: block;
}

.rarity-aura.prism::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  mix-blend-mode: screen;
  opacity: 0.9;
  background: linear-gradient(90deg, #ff7ab6, #ffffff, #7ecbff, #f8d66d, #ff7ab6);
  animation: prism-cycle 2.4s linear infinite;
}

body.low-power .rarity-aura.prism::after {
  display: none;
}

@keyframes sweep {
  from {
    transform: translateX(-120%) skewX(-8deg);
  }
  to {
    transform: translateX(120%) skewX(-8deg);
  }
}

@keyframes prism-cycle {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes shimmer-cycle {
  0% {
    opacity: var(--rarity-glow-opacity);
  }
  6% {
    opacity: calc(var(--rarity-glow-opacity) + 0.2);
  }
  12% {
    opacity: var(--rarity-glow-opacity);
  }
  100% {
    opacity: var(--rarity-glow-opacity);
  }
}

.rarity-aura[data-variant="deck"] .glow {
  --rarity-shimmer-period: 6s;
  animation: shimmer-cycle var(--rarity-shimmer-period) ease-in-out infinite;
}

.rarity-aura[data-variant="collection"] .glow {
  --rarity-shimmer-period: 10s;
  animation: shimmer-cycle var(--rarity-shimmer-period) ease-in-out infinite;
}

.rarity-aura[data-variant="gacha"] .glow {
  animation: none;
}

.rarity-aura.is-pre .ring {
  opacity: 0.4;
}

.rarity-aura.is-pre .glow {
  opacity: calc(var(--rarity-glow-opacity) * 0.5);
  transform: scale(0.92);
}

.rarity-aura.is-bloom .ring {
  transform: scale(calc(var(--rarity-ring-scale) * 1.08));
}

.rarity-aura.is-bloom .glow {
  opacity: min(1, calc(var(--rarity-glow-opacity) * 1.2));
  transform: scale(1.08);
}

.rarity-aura.is-reveal .ring {
  transform: scale(var(--rarity-ring-scale));
  opacity: var(--rarity-ring-opacity);
}

.rarity-aura.is-reveal .glow {
  opacity: var(--rarity-glow-opacity);
  transform: scale(1);
}

.rarity-aura.has-sweep.is-reveal .sweep::before {
  animation-play-state: running;
}

body.low-power .rarity-aura.has-sweep .sweep::before {
  display: none;
}

body.low-power .rarity-aura.has-spark .spark-layer {
  display: none;
}

.rarity-N {
  --rarity-color: #9AA3AF;
}

.rarity-R {
  --rarity-color: #2ED3A0;
}

.rarity-SR {
  --rarity-color: #00E5FF;
}

.rarity-SSR {
  --rarity-color: #7C4DFF;
}

.rarity-UR {
  --rarity-color: #FFD773;
}

.rarity-PRIME {
  --rarity-color: #FFFFFF;
}

.rarity-aura[data-variant="deck"],
.rarity-aura[data-variant="collection"] {
  mix-blend-mode: normal;
}

.rarity-aura[data-variant="gacha"] {
  mix-blend-mode: normal;
}

.rarity-aura.is-muted .ring,
.rarity-aura.is-muted .glow {
  opacity: 0;
}

.rarity-aura.has-sweep .sweep::before {
  animation-duration: 1.6s;
}

.rarity-aura[data-variant="gacha"].has-sweep .sweep::before {
  animation-duration: 1.8s;
}

.rarity-aura[data-variant="gacha"].prism.has-sweep .sweep::before {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0));
}

.rarity-aura[data-variant="collection"] .ring {
  opacity: 0.7;
}

.rarity-aura[data-variant="collection"] .glow {
  filter: blur(calc(8px * var(--rarity-glow-active)));
}

.rarity-aura[data-variant="deck"] .ring {
  opacity: 0.75;
}

.rarity-aura[data-variant="deck"] .glow {
  filter: blur(calc(7px * var(--rarity-glow-active)));
}

.rarity-aura[data-variant="deck"].is-hovered .glow,
.rarity-aura[data-variant="deck"].is-selected .glow {
  opacity: min(1, calc(var(--rarity-glow-opacity) * 1.2));
}

.rarity-aura[data-variant="collection"].has-sweep .sweep,
.rarity-aura[data-variant="deck"].has-sweep .sweep {
  display: none;
}

body.low-power .rarity-aura.is-bloom .glow {
  transform: scale(1.02);
}
`;

ensureStyleTag(STYLE_ID, { css: RARITY_CSS });

const auraStates = new WeakMap<HTMLElement, AuraState>();
const activeStates = new Set<AuraState>();

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
    while (state.sparkLayer.firstChild){
      state.sparkLayer.removeChild(state.sparkLayer.firstChild);
    }
  }
  activeSparkCount = Math.max(0, activeSparkCount - state.sparkTimers.length);
  clearTimers(state.sparkTimers, clearTimeout);
  state.sparkTimers.length = 0;
}

function applyCssVariables(state: AuraState): void {
  const { overlay, token } = state;
  overlay.style.setProperty('--rarity-color', token.hex);
  overlay.style.setProperty('--rarity-ring-scale', token.ring.toString());
  overlay.style.setProperty('--rarity-glow-base', token.glow.toString());
  overlay.style.setProperty('--rarity-glow-low', token.glowLow.toString());
  overlay.style.setProperty('--rarity-glow-active', currentPowerMode === 'low' ? token.glowLow.toString() : token.glow.toString());
  overlay.style.setProperty('--rarity-spark-count', (currentPowerMode === 'low' ? 0 : token.spark).toString());
  overlay.style.setProperty('--rarity-sweep-opacity', token.prism ? '0.75' : '0.65');
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
  currentPowerMode = mode;
  const doc = typeof document !== 'undefined' ? document : null;
  const body = doc?.body ?? null;
  if (body){
    body.classList.toggle('low-power', mode === 'low');
  }
  activeStates.forEach(state => {
    applyCssVariables(state);
    applyClasses(state);
    if (mode === 'low'){
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

function scheduleTimeout(state: AuraState, delay: number, cb: () => void): void {
  const id = setTimeout(cb, delay);
  state.revealTimers.push(id);
}

function spawnSparks(state: AuraState): void {
  const token = state.token;
  if (currentPowerMode === 'low' || token.spark <= 0 || state.variant !== 'gacha'){
    return;
  }
  const available = Math.max(0, MAX_ACTIVE_SPARKS - activeSparkCount);
  if (available <= 0){
    return;
  }
  const spawnCount = Math.min(token.spark, available);
  const layer = ensureSparkLayer(state);
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
    const cleanupId = setTimeout(() => {
      if (spark.parentNode === layer){
        layer.removeChild(spark);
      }
      activeSparkCount = Math.max(0, activeSparkCount - 1);
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