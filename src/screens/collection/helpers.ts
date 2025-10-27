import { ROSTER } from '../../catalog.ts';
import { UNITS } from '../../units.ts';
import type { UnitDefinition } from '../../units.ts';
import type { RosterEntryLite } from '@types/lineup';
import type { LineupCurrencies, LineupCurrencyConfig } from '@types/currency';
import { normalizeCurrencyBalances } from '@types/currency';
import type { CollectionEntry, CurrencyCatalog, CurrencyBalanceProvider, UnknownRecord } from './types.ts';

const isRosterEntryLite = (value: unknown): value is RosterEntryLite => (
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)
);

export const ABILITY_TYPE_LABELS = Object.freeze({
  basic: 'Đánh thường',
  active: 'Kĩ năng',
  ultimate: 'Tuyệt kỹ',
  talent: 'Thiên phú',
  technique: 'Tuyệt học',
  passive: 'Nội tại',
});

const TARGET_LABELS: Record<string, string> = Object.freeze({
  single: 'Đơn mục tiêu',
  singleTarget: 'Đơn mục tiêu',
  randomEnemies: 'Địch ngẫu nhiên',
  randomRow: 'Một hàng ngẫu nhiên',
  randomColumn: 'Một cột ngẫu nhiên',
  allEnemies: 'Toàn bộ địch',
  allAllies: 'Toàn bộ đồng minh',
  allies: 'Đồng minh',
  self: 'Bản thân',
  'self+2allies': 'Bản thân + 2 đồng minh',
});

export interface AbilityFact {
  icon: string | null;
  label: string | null;
  value: string;
  tooltip: string | null;
}

export function cloneRoster(input: ReadonlyArray<RosterEntryLite> | null | undefined): CollectionEntry[]{
  if (Array.isArray(input)){
    const clones = input
      .filter(isRosterEntryLite)
      .map((entry) => ({ ...entry } as CollectionEntry));
    if (clones.length > 0){
      return clones;
    }
  }
  return ROSTER.map((unit): CollectionEntry => ({ ...unit }));
}

export function buildRosterWithCost(rosterSource: ReadonlyArray<CollectionEntry>): CollectionEntry[]{
  const costs = new Map<string, number>(UNITS.map((unit: UnitDefinition) => [unit.id, unit.cost] as const));
  return rosterSource.map((entry) => ({
    ...entry,
    id: typeof entry.id === 'string' ? entry.id : String(entry.id ?? ''),
    cost: typeof entry.cost === 'number' && Number.isFinite(entry.cost)
      ? entry.cost
      : entry.cost === null
        ? null
        : costs.get(typeof entry.id === 'string' ? entry.id : String(entry.id ?? '')) ?? null,
  }));
}

export const resolveCurrencyBalance: CurrencyBalanceProvider = (currencyId, providedCurrencies, playerState) => {
  const tryExtract = (candidate: unknown): number | null => {
    if (candidate == null) return null;
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === 'string' && candidate.trim() !== '' && !Number.isNaN(Number(candidate))){
      return Number(candidate);
    }
    if (typeof candidate === 'object'){
      const record = candidate as Record<string, unknown>;
      const balance = record.balance ?? record.amount ?? record.value ?? null;
      if (typeof balance === 'number' && Number.isFinite(balance)){
        return balance;
      }
    }
    return null;
  };

  const inspectContainer = (container: LineupCurrencies | null | undefined): number | null => {
    if (!container) return null;
    if (Array.isArray(container)){
      for (const entry of container){
        if (!entry) continue;
        if (typeof entry === 'number'){
          if (Number.isFinite(entry)){ return entry; }
          continue;
        }
        if (typeof entry === 'string'){
          const parsed = Number(entry);
          if (!Number.isNaN(parsed)){ return parsed; }
        }
        if (typeof entry !== 'object' || Array.isArray(entry)) continue;
        const record = entry as { id?: unknown; currencyId?: unknown; key?: unknown; balance?: unknown; amount?: unknown; value?: unknown; total?: unknown };
        const id = (record.id || record.currencyId || record.key) as string | undefined;
        if (id === currencyId){
          const extracted = tryExtract(record.balance ?? record.amount ?? record.value ?? record.total ?? record);
          if (extracted != null) return extracted;
        }
      }
      return null;
    }
    if (typeof container === 'object'){
      const record = container as LineupCurrencyConfig;
      if (currencyId in record){
        const extracted = tryExtract(record[currencyId]);
        if (extracted != null) return extracted;
      }
      if (record.balances && currencyId in record.balances){
        const extracted = tryExtract(record.balances[currencyId]);
        if (extracted != null) return extracted;
      }
    }
    return null;
  };

  const fromProvided = inspectContainer(providedCurrencies);
  if (fromProvided != null) return fromProvided;
  const fromState = inspectContainer(normalizeCurrencyBalances(playerState ?? null));
  if (fromState != null) return fromState;
  return 0;
};

export function describeUlt(unit: CollectionEntry | null | undefined): string{
  return unit?.name ? `Bộ kỹ năng của ${unit.name}.` : 'Chọn nhân vật để xem mô tả chi tiết.';
}

export function formatResourceCost(cost: unknown): string{
  if (!cost || typeof cost !== 'object') return 'Không tốn tài nguyên';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(cost as Record<string, unknown>)){
    if (!Number.isFinite(value)) continue;
    const label = key === 'aether' ? 'Aether' : key.replace(/_/g, ' ');
    parts.push(`${value as number} ${label}`);
  }
  return parts.length ? parts.join(' + ') : 'Không tốn tài nguyên';
}

export function formatDuration(duration: unknown): string | null{
  if (!duration) return null;
  if (typeof duration === 'number') return `Hiệu lực ${duration} lượt`;
  if (typeof duration === 'string'){
    return duration === 'battle' ? 'Hiệu lực tới hết trận' : null;
  }
  if (typeof duration !== 'object') return null;
  const record = duration as Record<string, unknown> & { turns?: number | 'battle'; start?: string; bossModifier?: number; affectedStat?: string };
  const parts: string[] = [];
  if (record.turns === 'battle'){
    parts.push('Hiệu lực tới hết trận');
  } else if (typeof record.turns === 'number' && Number.isFinite(record.turns)){
    parts.push(`Hiệu lực ${record.turns} lượt`);
  }
  if (record.start === 'nextTurn'){
    parts.push('Bắt đầu từ lượt kế tiếp');
  }
  if (typeof record.bossModifier === 'number' && Number.isFinite(record.bossModifier) && typeof record.turns === 'number'){
    const bossTurns = Math.max(1, Math.floor(record.turns * record.bossModifier));
    parts.push(`Boss PvE: ${bossTurns} lượt`);
  }
  if (typeof record.affectedStat === 'string' && record.affectedStat){
    parts.push(`Ảnh hưởng: ${record.affectedStat}`);
  }
  return parts.length ? parts.join(' · ') : null;
}

export function formatTargetLabel(target: unknown): string | null{
  if (target == null) return null;
  if (typeof target === 'number'){
    return `Nhắm tới ${target} mục tiêu`;
  }
  const key = target.toString();
  return TARGET_LABELS[key] || key;
}

export function formatSummonSummary(summon: unknown): string | null{
  if (!summon || typeof summon !== 'object') return null;
  const record = summon as Record<string, unknown> & { count?: number; placement?: string; pattern?: string; limit?: number; ttlTurns?: number; ttl?: number; replace?: string; inherit?: Record<string, number> };
  const parts: string[] = [];
  if (Number.isFinite(record.count)){
    parts.push(`Triệu hồi ${record.count} đơn vị`);
  } else {
    parts.push('Triệu hồi đơn vị');
  }
  if (record.placement || record.pattern){
    parts.push(`ô ${record.placement || record.pattern}`);
  }
  if (record.limit != null){
    parts.push(`giới hạn ${record.limit}`);
  }
  const ttl = (record.ttlTurns ?? record.ttl) as number | undefined;
  if (Number.isFinite(ttl) && (ttl ?? 0) > 0){
    parts.push(`tồn tại ${ttl} lượt`);
  }
  if (record.replace){
    parts.push(`thay ${record.replace}`);
  }
  if (record.inherit && typeof record.inherit === 'object'){
    const inheritParts: string[] = [];
    for (const [stat, value] of Object.entries(record.inherit)){
      if (!Number.isFinite(value)) continue;
      inheritParts.push(`${Math.round((value as number) * 100)}% ${stat.toUpperCase()}`);
    }
    if (inheritParts.length){
      parts.push(`kế thừa ${inheritParts.join(', ')}`);
    }
  }
  return parts.join(' · ');
}

export function formatReviveSummary(revive: unknown): string | null{
  if (!revive || typeof revive !== 'object') return null;
  const record = revive as Record<string, unknown> & { targets?: number; priority?: string; hpPercent?: number; ragePercent?: number; lockSkillsTurns?: number };
  const parts: string[] = [];
  const targets = Number.isFinite(record.targets) ? Number(record.targets) : 1;
  parts.push(`Hồi sinh ${targets} đồng minh`);
  if (record.priority){
    parts.push(`ưu tiên ${record.priority}`);
  }
  if (Number.isFinite(record.hpPercent)){
    parts.push(`HP ${Math.round(Number(record.hpPercent) * 100)}%`);
  }
  if (Number.isFinite(record.ragePercent)){
    parts.push(`Nộ ${Math.round(Number(record.ragePercent) * 100)}%`);
  }
  if (Number.isFinite(record.lockSkillsTurns)){
    parts.push(`Khoá kỹ năng ${record.lockSkillsTurns} lượt`);
  }
  return parts.join(' · ');
}

export function formatLinksSummary(links: unknown): string | null{
  if (!links || typeof links !== 'object') return null;
  const record = links as Record<string, unknown> & { sharePercent?: number; maxConcurrent?: number; maxLinks?: number };
  const parts: string[] = [];
  const sharePercent = record.sharePercent ?? record.maxLinks;
  if (Number.isFinite(sharePercent)){
    parts.push(`Chia ${Math.round(Number(sharePercent) * 100)}% sát thương`);
  }
  if (record.maxConcurrent != null){
    parts.push(`tối đa ${record.maxConcurrent} mục tiêu`);
  }
  return parts.join(' · ');
}

export function formatTagLabel(tag: unknown): string{
  if (typeof tag !== 'string') return '';
  return tag.replace(/-/g, ' ');
}

export function labelForAbility(entry: unknown, fallback?: string | null): string{
  const record = entry as { type?: string } | null;
  if (record?.type && typeof record.type === 'string' && record.type in ABILITY_TYPE_LABELS){
    return ABILITY_TYPE_LABELS[record.type as keyof typeof ABILITY_TYPE_LABELS];
  }
  return fallback || 'Kĩ năng';
}

export function collectAbilityFacts(entry: unknown): AbilityFact[]{
  const facts: AbilityFact[] = [];
  const addFact = (icon: string | null, label: string | null, value: string | null, tooltip: string | null = null) => {
    if (!value) return;
    facts.push({
      icon: icon || null,
      label: label || null,
      value,
      tooltip: tooltip || null,
    });
  };

  if (entry && typeof entry === 'object'){
    const record = entry as Record<string, unknown>;

    if (record.cost && typeof record.cost === 'object'){
      const formattedCost = formatResourceCost(record.cost);
      if (formattedCost){
        addFact('💠', 'Chi phí', formattedCost);
      }
    }

    if (typeof record.hits === 'number' && record.hits > 0){
      const displayHits = record.hits === 1 ? '1 hit' : `${record.hits} hit`;
      addFact('✦', 'Số hit', displayHits);
    }

    if (typeof record.targets !== 'undefined'){
      const label = formatTargetLabel(record.targets);
      if (label){
        addFact('🎯', 'Mục tiêu', label);
      }
    }

    if (record.duration){
      const label = formatDuration(record.duration);
      if (label){
        addFact('⏳', 'Thời lượng', label);
      }
    }

    if (record.summon){
      const label = formatSummonSummary(record.summon);
      if (label){
        addFact('🜂', 'Triệu hồi', label);
      }
    }

    if (record.revive){
      const label = formatReviveSummary(record.revive);
      if (label){
        addFact('✙', 'Hồi sinh', label);
      }
    }

    if (record.link || record.links){
      const label = formatLinksSummary(record.link || record.links);
      if (label){
        addFact('⛓', 'Liên kết', label);
      }
    }

    if (Array.isArray(record.tags)){
      const resolvedTags = record.tags.map(formatTagLabel).filter(Boolean).join(', ');
      if (resolvedTags){
        addFact('🏷', 'Tags', resolvedTags);
      }
    }

    if (record.notes){
      const notes = Array.isArray(record.notes)
        ? record.notes
        : typeof record.notes === 'string'
          ? [record.notes]
          : [];
      const uniqueNotes = notes
        .map((note) => (typeof note === 'string' ? note.trim() : ''))
        .filter((note, index, array) => note && array.indexOf(note) === index);
      if (uniqueNotes.length){
        addFact('🗒', 'Ghi chú', uniqueNotes.join(' · '));
      }
    }
  }

  return facts;
}

export function getCurrencyCatalog(listCurrencies: () => unknown): CurrencyCatalog{
  const catalog = listCurrencies();
  if (Array.isArray(catalog)){
    return catalog as CurrencyCatalog;
  }
  return [];
}

export function ensureNumberFormatter(
  createNumberFormatter: (locale: string, options?: Intl.NumberFormatOptions) => Intl.NumberFormat,
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat{
  return createNumberFormatter(locale, options);
}