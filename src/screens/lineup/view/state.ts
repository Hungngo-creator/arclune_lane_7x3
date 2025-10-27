import { ROSTER } from '../../../catalog.ts';
import { listCurrencies } from '../../../data/economy.ts';
import { createNumberFormatter } from '../../../utils/format.ts';
import type { LineupSlot, LineupState, EquipmentLoadout } from './types/ui';
import type {
  LineupDefinition,
  LineupMemberConfig,
  LineupPassiveConfig,
  RosterEntryLite,
} from '@types/lineup';

export interface RosterUnit {
  id: string;
  name: string;
  role: string;
  rank: string;
  tags: string[];
  power: number | null;
  avatar: string | null;
  passives: unknown[];
  raw: Record<string, unknown> | null;
}

export interface LineupBenchCell {
  index: number;
  unitId: string | null;
  label: string | null;
  meta: Record<string, unknown> | null;
}

export interface LineupPassive {
  index: number;
  id: string;
  name: string;
  description: string;
  requirement: string;
  requiredUnitIds: string[];
  requiredTags: string[];
  isEmpty: boolean;
  autoActive: boolean;
  source: unknown;
}

export interface LineupFilter {
  type: 'all' | 'class' | 'rank' | 'tag';
  value: string | null;
}

export interface LineupFilterOptions {
  classes: string[];
  ranks: string[];
  tags: string[];
}

export type CurrencyBalances = Map<string, number>;

export type LineupMessageType = 'info' | 'error';

export interface LineupViewState {
  selectedLineupId: string | null;
  selectedUnitId: string | null;
  activeBenchIndex: number | null;
  filter: LineupFilter;
  message: string;
  messageType: LineupMessageType;
  currencyBalances: CurrencyBalances;
  lineupState: Map<string, LineupState>;
  roster: RosterUnit[];
  rosterLookup: Map<string, RosterUnit>;
  filterOptions: LineupFilterOptions;
}

interface AssignmentResult {
  unitId: string | null;
  label: string | null;
}

const currencyCatalog = listCurrencies();
const currencyIndex = new Map(currencyCatalog.map(currency => [currency.id, currency]));
const numberFormatter = createNumberFormatter('vi-VN');

const isObjectLike = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const isRosterEntryLite = (value: unknown): value is RosterEntryLite => isObjectLike(value);

const isLineupDefinition = (value: unknown): value is LineupDefinition => isObjectLike(value);

const isLineupMemberConfig = (value: unknown): value is LineupMemberConfig => isObjectLike(value);

const isLineupPassiveConfig = (value: unknown): value is LineupPassiveConfig => isObjectLike(value);

function cloneRoster(source: ReadonlyArray<RosterEntryLite> | null | undefined): RosterEntryLite[] {
  if (Array.isArray(source) && source.length > 0){
    const clones = source.filter(isRosterEntryLite).map(entry => ({ ...entry }));
    if (clones.length > 0){
      return clones;
    }
  }
  return ROSTER.map(entry => ({ ...entry }));
}

function normalizeRosterEntry(entry: RosterEntryLite | null | undefined, index: number): RosterUnit {
  const source: RosterEntryLite = entry ?? {};
  const id = source.id ?? source.key ?? `unit-${index}`;
  const name = source.name ?? source.title ?? `Nhân vật #${index + 1}`;
  const role = source.class ?? source.role ?? source.archetype ?? '';
  const rank = source.rank ?? source.tier ?? '';
  const tags = Array.isArray(source.tags)
    ? source.tags.slice()
    : Array.isArray(source.labels)
      ? source.labels.slice()
      : [];
  const numericPower = Number(source.power);
  const numericCp = Number(source.cp);
  const power = Number.isFinite(numericPower)
    ? numericPower
    : (Number.isFinite(numericCp) ? numericCp : null);
  const avatar = typeof source.avatar === 'string'
    ? source.avatar
    : typeof source.icon === 'string'
      ? source.icon
      : typeof source.portrait === 'string'
        ? source.portrait
        : null;
  const passives = Array.isArray(source.passives) ? source.passives.slice() : [];
  return {
    id: String(id),
    name: typeof name === 'string' ? name : `Nhân vật #${index + 1}`,
    role: typeof role === 'string' ? role : '',
    rank: typeof rank === 'string' ? rank : '',
    tags: tags.map(tag => String(tag)),
    power: power ?? null,
    avatar,
    passives,
    raw: isObjectLike(source) ? { ...source } : null,
  };
}

export function normalizeRoster(source: ReadonlyArray<RosterEntryLite> | null | undefined): RosterUnit[] {
  const cloned = cloneRoster(source);
  return cloned.map((entry, index) => normalizeRosterEntry(entry, index));
}

function normalizeAssignment(input: unknown, rosterIndex: Set<string>): AssignmentResult {
  if (!input){
    return { unitId: null, label: null };
  }
  if (typeof input === 'string'){
    const trimmed = input.trim();
    if (trimmed && rosterIndex.has(trimmed)){
      return { unitId: trimmed, label: null };
    }
    return { unitId: null, label: trimmed || null };
  }
  if (Array.isArray(input)){
    if (input.length >= 2 && typeof input[0] === 'string' && rosterIndex.has(input[0])){
      return { unitId: input[0], label: null };
    }
    if (input.length === 1){
      return normalizeAssignment(input[0], rosterIndex);
    }
  }
  if (typeof input === 'object'){
    const record = input as Record<string, unknown>;
    const candidateId = record.unitId ?? record.id ?? record.key ?? null;
    const label = record.name ?? record.title ?? record.label ?? record.displayName ?? record.note ?? null;
    if (candidateId && rosterIndex.has(String(candidateId))){
      return { unitId: String(candidateId), label: typeof label === 'string' ? label : null };
    }
    if (typeof label === 'string' && label.trim()){
      return { unitId: null, label };
    }
  }
  return { unitId: null, label: null };
}

function normalizeCost(cost: unknown, fallbackCurrencyId: string | null): { currencyId: string; amount: number } | null {
  if (cost == null){
    return null;
  }
  if (Array.isArray(cost)){
    if (cost.length >= 2 && typeof cost[0] === 'string' && !Number.isNaN(Number(cost[1]))){
      const amount = Number(cost[1]);
      if (Number.isFinite(amount) && amount > 0){
        return { currencyId: cost[0], amount };
      }
    }
    if (cost.length === 1){
      return normalizeCost(cost[0], fallbackCurrencyId);
    }
  }
  if (typeof cost === 'number'){
    if (!Number.isFinite(cost) || cost <= 0){
      return null;
    }
    return { currencyId: fallbackCurrencyId || 'VNT', amount: cost };
  }
  if (typeof cost === 'string'){
    const parsed = Number(cost);
    if (!Number.isNaN(parsed) && parsed > 0){
      return { currencyId: fallbackCurrencyId || 'VNT', amount: parsed };
    }
    return { currencyId: cost, amount: 1 };
  }
  if (typeof cost === 'object'){
    const record = cost as Record<string, unknown> & { values?: unknown[] };
    const currencyId = record.currencyId ?? record.id ?? record.type ?? record.code ?? fallbackCurrencyId ?? 'VNT';
    const rawAmount = record.amount ?? record.value ?? record.cost ?? record.price ?? record.count ?? null;
    const amount = Number(rawAmount);
    if (Number.isFinite(amount) && amount > 0){
      return { currencyId: String(currencyId), amount };
    }
    if (Array.isArray(record.values) && record.values.length >= 2){
      const [id, value] = record.values;
      const candidateAmount = Number(value);
      if (Number.isFinite(candidateAmount) && candidateAmount > 0){
        const resolvedId = typeof id === 'string' && id ? id : String(currencyId);
        return { currencyId: resolvedId, amount: candidateAmount };
      }
    }
  }
  return null;
}

function normalizeLineupEntry(entry: LineupDefinition | null | undefined, index: number, rosterIndex: Set<string>): LineupState {
  const source: LineupDefinition = entry && isLineupDefinition(entry) ? entry : {};
  const id = source.id ?? source.key ?? `lineup-${index}`;
  const name = source.name ?? source.title ?? `Đội hình #${index + 1}`;
  const role = source.role ?? source.type ?? '';
  const description = source.description ?? source.summary ?? '';
  const rawSlots = Array.isArray(source.slots) ? source.slots : [];
  const memberList = Array.isArray(source.members) ? source.members : [];
  const defaultCurrencyId = source.unlockCurrency ?? source.currencyId ?? source.defaultCurrencyId ?? null;
  const slotCosts = Array.isArray(source.slotCosts) ? source.slotCosts : null;
  const unlockCosts = Array.isArray(source.unlockCosts) ? source.unlockCosts : slotCosts;
  let unlockedCount = Math.min(3, 5);
  if (Number.isFinite(source.initialUnlockedSlots as number)){
    unlockedCount = Math.max(0, Math.min(5, Number(source.initialUnlockedSlots)));
  } else if (rawSlots.some(slot => isLineupMemberConfig(slot) && slot.unlocked === false)){
    unlockedCount = rawSlots.filter(slot => isLineupMemberConfig(slot) && slot.unlocked !== false).length;
  }
  const slots: LineupSlot[] = new Array(5).fill(null).map((_, slotIndex) => {
    const slotInput = rawSlots[slotIndex] ?? memberList[slotIndex] ?? null;
    const { unitId, label } = normalizeAssignment(slotInput, rosterIndex);
    const record = isLineupMemberConfig(slotInput) ? slotInput : null;
    const slotUnlock = record?.unlocked ?? null;
    const unlocked = slotUnlock != null ? Boolean(slotUnlock) : slotIndex < unlockedCount;
    const costSource = record?.cost
      ?? record?.unlockCost
      ?? (Array.isArray(unlockCosts) ? unlockCosts[slotIndex] : null)
      ?? source.slotCost
      ?? source.unlockCost
      ?? null;
    const unlockCost = normalizeCost(costSource, typeof defaultCurrencyId === 'string' ? defaultCurrencyId : null);
    const equipment = record?.equipment as EquipmentLoadout | null | undefined;
    return {
      index: slotIndex,
      unitId: unitId || null,
      label: label || null,
      unlocked,
      unlockCost,
      equipment: equipment ?? null,
      meta: record ? { ...record } : null,
    };
  });

  const benchSource = Array.isArray(source.bench)
    ? source.bench
    : Array.isArray(source.reserve)
      ? source.reserve
      : Array.isArray(source.members)
       ? source.members.slice(5)
        : [];
  const bench: LineupBenchCell[] = new Array(10).fill(null).map((_, benchIndex) => {
    const benchInput = benchSource[benchIndex] ?? null;
    const { unitId, label } = normalizeAssignment(benchInput, rosterIndex);
    return {
      index: benchIndex,
      unitId,
      label,
      meta: isLineupMemberConfig(benchInput) ? { ...benchInput } : null,
    };
  });

  const passiveSource = Array.isArray(source.passives)
    ? source.passives
    : Array.isArray(source.passiveSlots)
      ? source.passiveSlots
      : [];
  const passives: LineupPassive[] = new Array(6).fill(null).map((_, passiveIndex) => {
    const passiveInput = passiveSource[passiveIndex] ?? null;
    if (!passiveInput){
      return {
        index: passiveIndex,
        id: `passive-${passiveIndex}`,
        name: 'Chưa thiết lập',
        description: '',
        requirement: '',
        requiredUnitIds: [],
        requiredTags: [],
        isEmpty: true,
        autoActive: false,
        source: null,
      };
    }
    const passive = isLineupPassiveConfig(passiveInput) ? passiveInput : {};
    const idValue = passive.id ?? passive.key ?? `passive-${passiveIndex}`;
    const nameValue = passive.name ?? passive.title ?? `Passive #${passiveIndex + 1}`;
    const descriptionValue = passive.description ?? passive.effect ?? passive.text ?? '';
    const requirementValue = passive.requirement ?? passive.condition ?? passive.prerequisite ?? '';
    const requiredUnitIds = Array.isArray(passive.requiredUnitIds)
      ? passive.requiredUnitIds.map(String)
      : Array.isArray(passive.requires)
        ? passive.requires.filter(item => typeof item === 'string').map(String)
        : (typeof passive.requiredUnitId === 'string' ? [passive.requiredUnitId] : []);
    const requiredTags = Array.isArray(passive.requiredTags)
      ? passive.requiredTags.map(String)
      : Array.isArray(passive.tagsRequired)
        ? passive.tagsRequired.map(String)
        : [];
    const auto = passive.autoActive === true || passive.alwaysActive === true || passive.isActive === true;
    return {
      index: passiveIndex,
      id: String(idValue),
      name: typeof nameValue === 'string' ? nameValue : `Passive #${passiveIndex + 1}`,
      description: typeof descriptionValue === 'string' ? descriptionValue : '',
      requirement: typeof requirementValue === 'string' ? requirementValue : '',
      requiredUnitIds,
      requiredTags,
      isEmpty: false,
      autoActive: Boolean(auto),
      source: isLineupPassiveConfig(passiveInput) ? passiveInput : null,
    };
  });

  const leaderIdValue = source.leaderId ?? source.leader ?? source.captainId ?? null;
  const fallbackLeader = slots.find(slot => slot.unitId)?.unitId ?? null;
  const defaultCurrencyIdValue = defaultCurrencyId ?? source.currency ?? null;

  return {
    id: String(id),
    name: typeof name === 'string' ? name : `Đội hình #${index + 1}`,
    role: typeof role === 'string' ? role : '',
    description: typeof description === 'string' ? description : '',
    slots,
    bench,
    passives,
    leaderId: (typeof leaderIdValue === 'string' && rosterIndex.has(leaderIdValue)) ? leaderIdValue : fallbackLeader,
    defaultCurrencyId: typeof defaultCurrencyIdValue === 'string' ? defaultCurrencyIdValue : null,
  };
}

export function normalizeLineups(
  rawLineups: ReadonlyArray<LineupDefinition | null | undefined> | null,
  roster: RosterUnit[],
): LineupState[] {
  const rosterIndex = new Set(roster.map(unit => unit.id));
  if (!Array.isArray(rawLineups) || rawLineups.length === 0){
    const slots: LineupSlot[] = new Array(5).fill(null).map((_, index) => ({
      index,
      unitId: null,
      label: null,
      unlocked: index < 3,
      unlockCost: null,
      equipment: null,
      meta: null,
    }));
    const bench: LineupBenchCell[] = new Array(10).fill(null).map((_, index) => ({
      index,
      unitId: null,
      label: null,
      meta: null,
    }));
    const passives: LineupPassive[] = new Array(6).fill(null).map((_, index) => ({
      index,
      id: `passive-${index}`,
      name: 'Chưa thiết lập',
      description: '',
      requirement: '',
      requiredUnitIds: [],
      requiredTags: [],
      isEmpty: true,
      autoActive: false,
      source: null,
    }));
    return [{
      id: 'lineup-default',
      name: 'Đội hình mẫu',
      role: '',
      description: 'Thiết lập đội hình gồm tối đa 5 vị trí chủ lực và 10 vị trí dự bị.',
      slots,
      bench,
      passives,
      leaderId: null,
      defaultCurrencyId: null,
    }];
  }
  return rawLineups.map((entry, index) => normalizeLineupEntry(entry ?? null, index, rosterIndex));
}

function extractCurrencyBalances(source: unknown): CurrencyBalances {
  const balances: CurrencyBalances = new Map();
  if (!source){
    return balances;
  }
  const apply = (id: unknown, value: unknown) => {
    if (!id) return;
    const amount = Number(value);
    if (!Number.isNaN(amount)){
      balances.set(String(id), amount);
    }
  };

  if (Array.isArray(source)){
    source.forEach(entry => {
      if (!entry) return;
      if (typeof entry === 'number'){ apply('VNT', entry); return; }
      if (typeof entry === 'string'){
        const [id, value] = entry.split(':');
        if (id && value){
          apply(id.trim(), Number(value));
        }
        return;
      }
      if (typeof entry === 'object'){
        const record = entry as Record<string, unknown>;
        const id = record.currencyId ?? record.id ?? record.key ?? record.type;
        const value = record.balance ?? record.amount ?? record.value ?? record.total ?? null;
        apply(id, value);
      }
    });
    return balances;
  }

  if (typeof source === 'object'){
    Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
      if (value && typeof value === 'object' && ('balance' in (value as Record<string, unknown>) || 'amount' in (value as Record<string, unknown>) || 'value' in (value as Record<string, unknown>) || 'total' in (value as Record<string, unknown>))){
        const record = value as Record<string, unknown>;
        const id = record.currencyId ?? record.id ?? record.key ?? key;
        apply(id, record.balance ?? record.amount ?? record.value ?? record.total);
      } else {
        apply(key, value);
      }
    });
    const record = (source as Record<string, unknown>).balances;
    if (record && typeof record === 'object'){
      Object.entries(record as Record<string, unknown>).forEach(([key, value]) => apply(key, value));
    }
  }

  return balances;
}

export function createCurrencyBalances(primary: unknown, secondary: unknown): CurrencyBalances {
  const base = extractCurrencyBalances(primary);
  const override = extractCurrencyBalances(secondary);
  for (const [key, value] of override.entries()){
    base.set(key, value);
  }
  currencyCatalog.forEach(currency => {
    if (!base.has(currency.id)){
      base.set(currency.id, 0);
    }
  });
  return base;
}

export function formatCurrencyBalance(amount: number | null | undefined, currencyId: string): string {
  const currency = currencyIndex.get(currencyId);
  const formatted = numberFormatter.format(Number.isFinite(amount) ? Number(amount) : 0);
  const suffix = currency?.suffix || currencyId || '';
  return suffix ? `${formatted} ${suffix}` : formatted;
}

export function filterRoster(roster: RosterUnit[], filter: LineupFilter): RosterUnit[] {
  if (!filter || filter.type === 'all' || !filter.value){
    return roster;
  }
  const value = String(filter.value).toLowerCase();
  if (filter.type === 'class'){
    return roster.filter(unit => (unit.role || '').toLowerCase() === value);
  }
  if (filter.type === 'rank'){
    return roster.filter(unit => (unit.rank || '').toLowerCase() === value);
  }
  if (filter.type === 'tag'){
    return roster.filter(unit => unit.tags.some(tag => String(tag).toLowerCase() === value));
  }
  return roster;
}

export function createFilterOptions(roster: RosterUnit[]): LineupFilterOptions {
  const classes = new Set<string>();
  const ranks = new Set<string>();
  const tags = new Set<string>();
  roster.forEach(unit => {
    if (unit.role) classes.add(unit.role);
    if (unit.rank) ranks.add(unit.rank);
    (unit.tags || []).forEach(tag => tags.add(tag));
  });
  return {
    classes: Array.from(classes),
    ranks: Array.from(ranks),
    tags: Array.from(tags),
  };
}

export function collectAssignedUnitIds(lineup: LineupState): Set<string> {
  const ids = new Set<string>();
  lineup.slots.forEach(slot => {
    if (slot.unitId){
      ids.add(slot.unitId);
    }
  });
  lineup.bench.forEach(cell => {
    if (cell.unitId){
      ids.add(cell.unitId);
    }
  });
  if (lineup.leaderId){
    ids.add(lineup.leaderId);
  }
  return ids;
}

export function evaluatePassive(
  passive: LineupPassive,
  assignedUnitIds: Set<string>,
  rosterLookup: Map<string, RosterUnit>,
): boolean {
  if (!passive || passive.isEmpty){
    return false;
  }
  if (passive.autoActive){
    return true;
  }
  if (passive.requiredUnitIds && passive.requiredUnitIds.length > 0){
    for (const required of passive.requiredUnitIds){
      if (!assignedUnitIds.has(required)){
        return false;
      }
    }
  }
  if (passive.requiredTags && passive.requiredTags.length > 0){
    const availableTags = new Set<string>();
    assignedUnitIds.forEach(id => {
      const unit = rosterLookup.get(id);
      if (!unit) return;
      if (unit.role) availableTags.add(unit.role);
      if (unit.rank) availableTags.add(unit.rank);
      (unit.tags || []).forEach(tag => availableTags.add(tag));
    });
    const hasAllTags = passive.requiredTags.every(tag => availableTags.has(tag));
    if (!hasAllTags){
      return false;
    }
  }
  if (!passive.requiredUnitIds?.length && !passive.requiredTags?.length){
    return assignedUnitIds.size > 0;
  }
  return true;
}

export function removeUnitFromPlacements(
  lineup: LineupState,
  unitId: string | null,
  options: { keepLeader?: boolean } = {},
): void {
  if (!unitId) return;
  const { keepLeader = false } = options;
  lineup.slots.forEach(slot => {
    if (slot.unitId === unitId){
      slot.unitId = null;
    }
  });
  lineup.bench.forEach(cell => {
    if (cell.unitId === unitId){
      cell.unitId = null;
    }
  });
  if (!keepLeader && lineup.leaderId === unitId){
    lineup.leaderId = null;
  }
}

export function assignUnitToSlot(
  lineup: LineupState,
  slotIndex: number,
  unitId: string,
): { ok: boolean; message?: string } {
  const slot = lineup.slots[slotIndex];
  if (!slot){
    return { ok: false, message: 'Không tìm thấy vị trí.' };
  }
  if (!slot.unlocked){
    return { ok: false, message: 'Vị trí đang bị khóa.' };
  }
  if (slot.unitId === unitId){
    return { ok: true };
  }
  removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
  slot.unitId = unitId;
  slot.label = null;
  return { ok: true };
}

export function assignUnitToBench(
  lineup: LineupState,
  benchIndex: number,
  unitId: string,
): { ok: boolean; message?: string } {
  const cell = lineup.bench[benchIndex];
  if (!cell){
    return { ok: false, message: 'Không tìm thấy ô dự bị.' };
  }
  if (cell.unitId === unitId){
    return { ok: true };
  }
  removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
  cell.unitId = unitId;
  cell.label = null;
  return { ok: true };
}

export function removeUnitFromBench(lineup: LineupState, benchIndex: number): void {
  const cell = lineup.bench[benchIndex];
  if (!cell) return;
  cell.unitId = null;
}

export function isUnitPlaced(lineup: LineupState, unitId: string | null): boolean {
  if (!unitId) return false;
  if (lineup.leaderId === unitId) return true;
  if (lineup.slots.some(slot => slot.unitId === unitId)) return true;
  if (lineup.bench.some(cell => cell.unitId === unitId)) return true;
  return false;
}

export function setLeader(
  lineup: LineupState | null,
  unitId: string | null,
  rosterLookup: Map<string, RosterUnit>,
): { ok: boolean; message?: string } {
  if (!lineup){
    return { ok: false, message: 'Không tìm thấy đội hình.' };
  }
  if (!unitId){
    lineup.leaderId = null;
    return { ok: true };
  }
  const unit = rosterLookup.get(unitId);
  if (!unit){
    return { ok: false, message: 'Không tìm thấy nhân vật.' };
  }
  if (!isUnitPlaced(lineup, unitId)){
    const slot = lineup.slots.find(entry => entry.unlocked && !entry.unitId);
    if (slot){
      assignUnitToSlot(lineup, slot.index, unitId);
    } else {
      const bench = lineup.bench.find(entry => !entry.unitId);
      if (bench){
        assignUnitToBench(lineup, bench.index, unitId);
      } else {
        return { ok: false, message: 'Không còn vị trí trống để gán leader.' };
      }
    }
  }
  lineup.leaderId = unitId;
  return { ok: true };
      }
