import { z } from 'zod';

import { loadConfig } from './load-config.ts';
import { CURRENCY_IDS, convertCurrency, formatBalance, getLotterySplit } from './economy.ts';

import type {
  AnnouncementEntry,
  AnnouncementSlot,
  LotterySplit
} from '../types/config.ts';

const AnnouncementEntryConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  tooltip: z.string().optional(),
  rewardCallout: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  translationKey: z.string().optional()
});

const AnnouncementSlotConfigSchema = z.object({
  key: z.string(),
  label: z.string(),
  entries: z.array(AnnouncementEntryConfigSchema)
});

const AnnouncementsConfigSchema = z.array(AnnouncementSlotConfigSchema);

const LOTTERY_SPLIT: LotterySplit = getLotterySplit();
const LOTTERY_DEV_PERCENT = Math.round((LOTTERY_SPLIT.devVault || 0) * 100);
const LOTTERY_PRIZE_PERCENT = Math.round((LOTTERY_SPLIT.prizePool || 0) * 100);

const TT_CONVERSION_CHAIN = [
  formatBalance(1, CURRENCY_IDS.TT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.ThNT), CURRENCY_IDS.ThNT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.TNT), CURRENCY_IDS.TNT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.HNT), CURRENCY_IDS.HNT),
  formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.VNT), CURRENCY_IDS.VNT)
].join(' = ');

const announcementConfig = await loadConfig(
  new URL('./announcements.config.ts', import.meta.url),
  AnnouncementsConfigSchema
);

const MACROS: Readonly<Record<string, string>> = Object.freeze({
  LOTTERY_PRIZE_PERCENT: `${LOTTERY_PRIZE_PERCENT}`,
  LOTTERY_DEV_PERCENT: `${LOTTERY_DEV_PERCENT}`,
  TT_CONVERSION_CHAIN
});

function applyMacros(value: string | null | undefined): string | null | undefined {
  if (value === undefined || value === null) return value;
  let result = value;
  for (const [token, replacement] of Object.entries(MACROS)){
    result = result.replaceAll(`{{${token}}}`, replacement);
  }
  return result;
}

function isEntryActive(entry: AnnouncementEntry | null | undefined, now: Date){
  if (!entry) return false;
  if (!entry.startAt && !entry.endAt) return true;
  const start = entry.startAt ? new Date(entry.startAt) : null;
  const end = entry.endAt ? new Date(entry.endAt) : null;
  if (start && Number.isFinite(start.getTime()) && now < start) return false;
  if (end && Number.isFinite(end.getTime()) && now > end) return false;
  return true;
}

export const SIDE_SLOT_ANNOUNCEMENTS: ReadonlyArray<AnnouncementSlot> = Object.freeze(
  announcementConfig.map((slot) => ({
    key: slot.key,
    label: slot.label,
    entries: Object.freeze(
      slot.entries.map((entry) => Object.freeze({
        ...entry,
        shortDescription: applyMacros(entry.shortDescription) ?? entry.shortDescription,
        tooltip: applyMacros(entry.tooltip) ?? undefined,
        rewardCallout: applyMacros(entry.rewardCallout) ?? undefined,
        startAt: entry.startAt ?? null,
        endAt: entry.endAt ?? null
      }))
    )
  }))
);

/**
 * @param {string} slotKey
 * @param {{ now?: Date }} [options]
 * @returns {{ slot: AnnouncementSlot; entry: AnnouncementEntry } | null}
 */
export function selectAnnouncementEntry(
  slotKey: string,
  options: { now?: Date } = {}
): { slot: AnnouncementSlot; entry: AnnouncementEntry } | null {
  const now = options.now instanceof Date ? options.now : new Date();
  const slot = SIDE_SLOT_ANNOUNCEMENTS.find(item => item.key === slotKey);
  if (!slot) return null;
  const entry = slot.entries.find(item => isEntryActive(item, now)) || slot.entries[0] || null;
  if (!entry) return null;
  return { slot, entry };
}

export function getAllSidebarAnnouncements(options: { now?: Date } = {}){
  const now = options.now instanceof Date ? options.now : new Date();
  return SIDE_SLOT_ANNOUNCEMENTS.map(slot => {
    const entry = slot.entries.find(item => isEntryActive(item, now)) || slot.entries[0] || null;
    return {
      key: slot.key,
      label: slot.label,
      entry
    };
  }).filter((item): item is typeof item & { entry: AnnouncementEntry } => Boolean(item.entry));
}