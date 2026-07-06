export const AUDIO_ENABLED_STORAGE_KEY = 'arclune.audio.enabled';

export function isAudioEnabled(): boolean {
  try {
    return localStorage.getItem(AUDIO_ENABLED_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setAudioEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUDIO_ENABLED_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage failures; callers still use the in-memory value they just set.
  }
}
