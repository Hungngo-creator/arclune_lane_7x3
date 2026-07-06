export type FrameRateCap = 30 | 60;

const STORAGE_KEY = 'arclune.frameRateCap';
const DEFAULT_FRAME_RATE_CAP: FrameRateCap = 60;

const canUseLocalStorage = (): boolean => (
  typeof window !== 'undefined' && !!window.localStorage
);

const normalizeFrameRateCap = (value: unknown): FrameRateCap => (
  value === 30 || value === '30' ? 30 : DEFAULT_FRAME_RATE_CAP
);

export function getFrameRateCap(): FrameRateCap {
  if (!canUseLocalStorage()) return DEFAULT_FRAME_RATE_CAP;
  return normalizeFrameRateCap(window.localStorage.getItem(STORAGE_KEY));
}

export function setFrameRateCap(value: FrameRateCap): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, String(normalizeFrameRateCap(value)));
}
