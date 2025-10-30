import type { UltMetadata, UltSkillConfig, UnitKitConfig } from '../types/config.ts';

interface KitTraitObject extends Record<string, unknown> {
  id?: string;
  key?: string;
  type?: string;
  name?: string;
  tags?: ReadonlyArray<string>;
  categories?: ReadonlyArray<string>;
  label?: string;
}

type KitTraitEntry = string | KitTraitObject | boolean | number | null | undefined;

type KitTraits =
  | ReadonlyArray<KitTraitEntry>
  | Record<string, unknown>
  | null
  | undefined;

type SummonSpec = Record<string, unknown>;

interface SummonSpecLike extends SummonSpec {
  pattern?: string;
  placement?: string;
  patternKey?: string;
  shape?: string;
  area?: string;
  slots?: ReadonlyArray<number | null | undefined>;
  count?: number;
  summonCount?: number;
  ttl?: number;
  ttlTurns?: number;
  inherit?: unknown;
  limit?: number;
  replace?: unknown;
  creep?: unknown;
}

interface NormalizedSummonSpec extends SummonSpecLike {
  slots?: ReadonlyArray<number>;
  pattern?: string;
  ttl?: number;
  ttlTurns?: number;
}

interface UltSpec extends UltSkillConfig {
  metadata?: (UltMetadata & { summon?: SummonSpecLike | null }) | null;
  meta?: (UltMetadata & { summon?: SummonSpecLike | null }) | null;
  summon?: SummonSpecLike | null;
}

interface KitData extends UnitKitConfig {
  traits?: KitTraits;
  ult?: UltSpec | null;
}

interface KitMeta extends UnitKitConfig {
  kit?: KitData | null;
  traits?: KitTraits;
  ult?: UltSpec | null;
}

interface UltBehavior {
  tags: ReadonlyArray<string>;
  hasInstant: boolean;
  hasDefensive: boolean;
  hasRevive: boolean;
  revive: Record<string, unknown> | null;
  summon: NormalizedSummonSpec | null;
}

interface OnSpawnRageMap {
  revive?: number;
  leader?: number;
  deck?: number;
  nonLeader?: number;
  default?: number;
  value?: number;
}

interface OnSpawnEffect extends Record<string, unknown> {
  type?: string;
  kind?: string;
  effect?: string;
  phase?: string;
  stage?: string;
  when?: string;
  target?: string;
  amount?: number;
  value?: number;
}

interface OnSpawnConfig extends Record<string, unknown> {
  rage?: number | string | OnSpawnRageMap | null;
  effects?: ReadonlyArray<OnSpawnEffect | null | undefined>;
  revive?: { rage?: number } | null;
  onRevive?: { rage?: number } | null;
  revived?: { rage?: number } | null;
  deck?: { rage?: number } | null;
  default?: { rage?: number } | null;
  reviveRage?: number | null;
  defaultRage?: number | null;
  rageOnSummon?: number | null;
}

interface ExtractOnSpawnRageOptions {
  isLeader?: boolean;
  revive?: boolean;
  reviveSpec?: { rage?: number } | null;
}

const KNOWN_SUMMON_KEYS = ['summon', 'summoner', 'immediateSummon'] satisfies ReadonlyArray<string>;
const KNOWN_REVIVE_KEYS = ['revive', 'reviver'] satisfies ReadonlyArray<string>;
const DEFENSIVE_TAGS = ['defense', 'defensive', 'protection', 'shield', 'barrier', 'support'] satisfies ReadonlyArray<string>;
const INSTANT_TAGS = ['instant', 'instant-cast', 'instantCast'] satisfies ReadonlyArray<string>;

type CloneableArray = ReadonlyArray<unknown>;
type CloneableRecord = Record<string, unknown>;

function isPlainRecord(value: unknown): value is CloneableRecord {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isCloneCandidate(value: unknown): value is CloneableArray | CloneableRecord {
  return Array.isArray(value) || isPlainRecord(value);
}

function coerceKit(metaOrKit: KitMeta | KitData | null | undefined): KitData | null {
  if (!metaOrKit) return null;
  if ('kit' in metaOrKit && metaOrKit.kit) return metaOrKit.kit as KitData;
  return metaOrKit as KitData;
}

function normalizeKey(key: unknown): string {
  return typeof key === 'string' ? key.trim().toLowerCase() : '';
}

function readTrait(traits: KitTraits, key: string): boolean | KitTraitObject | string | number | null {
  if (!traits) return null;
  const target = normalizeKey(key);
  if (!target) return null;

  if (Array.isArray(traits)){
    for (const entry of traits){
      if (entry == null) continue;
      if (typeof entry === 'string'){
        if (normalizeKey(entry) === target) return true;
        continue;
      }
      if (typeof entry === 'object'){
        const candidate = entry as KitTraitObject;
        const id = normalizeKey(candidate.id || candidate.key || candidate.type || candidate.name);
        if (id === target) return candidate;
        if (candidate[target] != null){
          return candidate[target] as boolean | KitTraitObject | string | number | null;
        }
      }
    }
    return null;
  }

  if (typeof traits === 'object'){
    for (const [k, value] of Object.entries(traits)){
      if (normalizeKey(k) === target){
        return value as boolean | KitTraitObject | string | number | null;
      }
    }
  }
  return null;
}

function cloneShallow<T extends CloneableArray>(value: T): T;
function cloneShallow<T extends CloneableRecord>(value: T): T;
function cloneShallow<T extends CloneableArray | CloneableRecord>(value: T): T;
function cloneShallow<T>(value: T | null | undefined): T | null;
function cloneShallow<T>(value: T | null | undefined): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object') return value;
  if (!isCloneCandidate(value)) return value;
  if (Array.isArray(value)){
   const result = value.map((entry) => (isCloneCandidate(entry) ? cloneShallow(entry) : entry));
    return result as T;
  }

  const out: CloneableRecord = { ...(value as CloneableRecord) };
  for (const [key, entry] of Object.entries(out)){
    if (isCloneCandidate(entry)){
      out[key] = cloneShallow(entry);
    }
  }
  return out as T;
}

function extractUltSummonFields(ult: UltSpec | null | undefined): Partial<NormalizedSummonSpec> | null {
  if (!ult || typeof ult !== 'object') return null;
  const out: Partial<NormalizedSummonSpec> & Record<string, unknown> = {};
  let hasValue = false;
  const assign = (key: keyof NormalizedSummonSpec, value: unknown, clone = false) => {
    if (value === undefined || value === null) return;
    if (clone && isCloneCandidate(value)){
      out[key] = cloneShallow(value);
    } else {
      out[key] = value as NormalizedSummonSpec[typeof key];
    }
    hasValue = true;
  };

  const pattern = ult.pattern ?? ult.placement;
  if (pattern !== undefined && pattern !== null) assign('pattern', pattern);
  const count = ult.count ?? ult.summonCount;
  if (count !== undefined && count !== null) assign('count', count);
  const ttlTurns = ult.ttlTurns ?? ult.ttl;
  if (ttlTurns !== undefined && ttlTurns !== null) assign('ttlTurns', ttlTurns);
  const ttl = ult.ttl ?? ult.ttlTurns;
  if (ttl !== undefined && ttl !== null) assign('ttl', ttl);
  assign('inherit', ult.inherit, true);
  const limit = ult.limit;
  if (limit !== undefined && limit !== null) assign('limit', limit);
  assign('replace', ult.replace);
  assign('creep', ult.creep, true);

  return hasValue ? out : null;
}

function applyUltSummonDefaults(
  spec: SummonSpecLike | null | undefined,
  ult: UltSpec | null | undefined
): SummonSpecLike | null {
  const fields = extractUltSummonFields(ult);
  if (!fields) return spec ?? null;
  const out: SummonSpecLike = spec ?? {};
  const target: SummonSpec = out;
  for (const [key, value] of Object.entries(fields)){
    const current = target[key];
    if (current === undefined || current === null){
      target[key] = value;
    }
  }
  return out;
}

export function collectUltTags(metaOrKit: KitMeta | KitData | null | undefined): Set<string> {
  const kit = coerceKit(metaOrKit);
  const ult = kit?.ult;
  const tags = new Set<string>();
  const add = (val: unknown) => {
    if (typeof val === 'string' && val.trim() !== '') tags.add(val.trim());
  };
  const addMany = (vals: unknown) => {
    if (!Array.isArray(vals)) return;
    for (const val of vals){ add(val); }
  };

  if (!ult) return tags;
  add(ult.type);
  add(ult.kind);
  add(ult.category);
  addMany(ult.tags);

  const metadata = ult.metadata || ult.meta || null;
  if (metadata){
    add(metadata.type);
    add(metadata.kind);
    add(metadata.category);
    addMany(metadata.categories);
    addMany(metadata.tags);
    if (metadata.label) add(metadata.label);
  }

  const traitUlt = readTrait(kit?.traits ?? null, 'ult');
  if (traitUlt){
    if (typeof traitUlt === 'string') add(traitUlt);
    if (Array.isArray(traitUlt)) addMany(traitUlt);
    if (traitUlt && typeof traitUlt === 'object'){
      const traitObj = traitUlt as KitTraitObject;
      add(traitObj.type);
      addMany(traitObj.tags);
      addMany(traitObj.categories);
      if (typeof traitObj.label === 'string') add(traitObj.label);
    }
  }

  return tags;
}

export function getSummonSpec(metaOrKit: KitMeta | KitData | null | undefined): NormalizedSummonSpec | null {
  const kit = coerceKit(metaOrKit);
  if (!kit) return null;

  let spec: SummonSpecLike | null = null;
  for (const key of KNOWN_SUMMON_KEYS){
    const trait = readTrait(kit.traits ?? null, key);
    if (trait){
      if (trait === true) {
        spec = {};
      } else if (typeof trait === 'object'){
        spec = cloneShallow(trait);
      } else if (typeof trait === 'number'){
        spec = { count: trait };
      } else {
        spec = {};
      }
      break;
    }
  }

  const ult = kit.ult || null;
  if (!spec && ult){
    if (ult.summon){
      spec = cloneShallow(ult.summon);
    } else if (ult.metadata?.summon){
      spec = cloneShallow(ult.metadata.summon);
    } else if (ult.meta?.summon){
      spec = cloneShallow(ult.meta.summon);
    }
  }

  const tags = collectUltTags(kit);
  if (!spec && kitUltHasTag(kit, 'summon', tags)){
    if (ult?.summon){
      spec = cloneShallow(ult.summon);
    }
    spec = applyUltSummonDefaults(spec, ult);
  }
  if (ult && typeof ult.type === 'string' && ult.type.toLowerCase() === 'summon'){
    spec = applyUltSummonDefaults(spec, ult);
  }

  if (!spec) return null;

  const normalized = { ...(cloneShallow(spec) ?? spec ?? {}) } as NormalizedSummonSpec;
  if (!normalized.pattern && typeof normalized.placement === 'string'){
    normalized.pattern = normalized.placement;
  }
  if (!normalized.pattern && typeof normalized.patternKey === 'string'){
    normalized.pattern = normalized.patternKey;
  }
  if (normalized.ttl == null && typeof normalized.ttlTurns === 'number'){
    normalized.ttl = normalized.ttlTurns;
  }
  if (normalized.ttlTurns == null && typeof normalized.ttl === 'number'){
    normalized.ttlTurns = normalized.ttl;
  }
  if (Array.isArray(normalized.slots)){
    normalized.slots = normalized.slots.filter((s): s is number => typeof s === 'number' && Number.isFinite(s)).map((s) => Number(s));
  }
  return normalized;
}

export function getReviveSpec(metaOrKit: KitMeta | KitData | null | undefined): Record<string, unknown> | null {
  const kit = coerceKit(metaOrKit);
  if (!kit) return null;
  for (const key of KNOWN_REVIVE_KEYS){
    const trait = readTrait(kit.traits ?? null, key);
    if (trait){
      if (trait === true) return {};
      if (typeof trait === 'object') return cloneShallow(trait);
      return {};
    }
  }
  const ult = kit.ult || null;
  if (ult?.revive) return cloneShallow(ult.revive);
  if (ult?.metadata?.revive) return cloneShallow(ult.metadata.revive);
  if (kitUltHasTag(kit, 'revive')){
    const revive = ult?.revive ?? {};
    return cloneShallow(revive);
  }
  return null;
}

export function kitSupportsSummon(metaOrKit: KitMeta | KitData | null | undefined): boolean {
  return getSummonSpec(metaOrKit) != null;
}

export function kitUltHasTag(
  metaOrKit: KitMeta | KitData | null | undefined,
  tag: string,
  precomputedTags: Set<string> | null = null
): boolean {
  if (!tag) return false;
  const tags = precomputedTags ?? collectUltTags(metaOrKit);
  const target = normalizeKey(tag);
  for (const t of tags){
    if (normalizeKey(t) === target) return true;
  }
  return false;
}

export function detectUltBehavior(metaOrKit: KitMeta | KitData | null | undefined): UltBehavior {
  const kit = coerceKit(metaOrKit);
  const ult = kit?.ult;
  const tags = collectUltTags(kit);
  const metadata = ult?.metadata || ult?.meta || ({} as UltMetadata);
  const traits = kit?.traits ?? null;

  const hasInstant = Boolean(
    metadata.instant === true ||
      metadata.instantCast === true ||
      metadata.cast === 'instant' ||
      (ult && (ult.instant || ult.cast === 'instant' || ult.immediate === true)) ||
      INSTANT_TAGS.some((instantTag) => kitUltHasTag(kit, instantTag)) ||
      readTrait(traits, 'instantUlt') === true ||
      readTrait(traits, 'instantUltimate') === true
  );

  const hasDefensive = Boolean(
    metadata.defensive === true ||
      metadata.role === 'defensive' ||
      DEFENSIVE_TAGS.some((defTag) => kitUltHasTag(kit, defTag)) ||
      (ult && (
        typeof ult.reduceDamage === 'number' ||
        typeof ult.shield === 'number' ||
        typeof ult.barrier === 'number' ||
        Array.isArray(ult.shields) ||
        (Array.isArray(ult.buffs) && ult.buffs.some((b) => normalizeKey((b as Record<string, unknown>).effect) === 'shield'))
      )) ||
      readTrait(traits, 'defensiveUlt') === true ||
      readTrait(traits, 'guardianUlt') === true
  );

  const revive = getReviveSpec(kit);
  const hasRevive = !!revive;

  return {
    tags: Array.from(tags),
    hasInstant,
    hasDefensive,
    hasRevive,
    revive,
    summon: getSummonSpec(kit)
  };
}

function extractRageFromEffects(onSpawn: OnSpawnConfig | null | undefined, opts: ExtractOnSpawnRageOptions = {}): number | null {
  const effects = Array.isArray(onSpawn?.effects) ? onSpawn.effects : [];
  for (const effect of effects){
    if (!effect) continue;
    const effectObj = effect as OnSpawnEffect;
    const type = normalizeKey(effectObj.type || effectObj.kind || effectObj.effect);
    if (!type) continue;
    if (type === 'setrage' || type === 'addrage' || type === 'giverage'){
      if (opts.revive && normalizeKey(effectObj.phase || effectObj.stage || effectObj.when) === 'revive' && typeof effectObj.amount === 'number'){
        return effectObj.amount;
      }
      if (opts.isLeader && normalizeKey(effectObj.target) === 'leader' && typeof effectObj.amount === 'number'){
        return effectObj.amount;
      }
      if (!opts.isLeader && (effectObj.target == null || ['deck', 'nonleader', 'non-leader'].includes(normalizeKey(effectObj.target)))){
        if (typeof effectObj.amount === 'number') return effectObj.amount;
      }
      if (typeof effectObj.value === 'number') return effectObj.value;
      if (typeof effectObj.amount === 'number') return effectObj.amount;
    }
  }
  return null;
}

export function extractOnSpawnRage(onSpawn: OnSpawnConfig | null | undefined, opts: ExtractOnSpawnRageOptions = {}): number | null {
  if (!onSpawn) return null;
  const { isLeader = false, revive = false, reviveSpec = null } = opts;

  if (revive && reviveSpec && typeof reviveSpec.rage === 'number'){
    return Math.max(0, reviveSpec.rage);
  }
  if (revive){
    const reviveCfg = onSpawn.revive || onSpawn.onRevive || onSpawn.revived || null;
    if (reviveCfg && typeof reviveCfg.rage === 'number') return Math.max(0, reviveCfg.rage);
  }

  const fromEffects = extractRageFromEffects(onSpawn, { isLeader, revive, reviveSpec });
  if (fromEffects != null) return Math.max(0, fromEffects);

  const { rage } = onSpawn;
  if (typeof rage === 'number') return Math.max(0, rage);
  if (typeof rage === 'string' && rage.trim() !== ''){
    const parsed = Number(rage);
    if (!Number.isNaN(parsed)) return Math.max(0, parsed);
  }
  if (rage && typeof rage === 'object'){
    const rageObj = rage as OnSpawnRageMap;
    if (revive && typeof rageObj.revive === 'number') return Math.max(0, rageObj.revive);
    if (isLeader && typeof rageObj.leader === 'number') return Math.max(0, rageObj.leader);
    if (!isLeader){
      if (typeof rageObj.deck === 'number') return Math.max(0, rageObj.deck);
      if (typeof rageObj.nonLeader === 'number') return Math.max(0, rageObj.nonLeader);
    }
    if (typeof rageObj.default === 'number') return Math.max(0, rageObj.default);
    if (typeof rageObj.value === 'number'){
      return Math.max(0, rageObj.value);
    }
  }

  if (onSpawn.deck && typeof onSpawn.deck.rage === 'number' && !isLeader){
    return Math.max(0, onSpawn.deck.rage);
  }
  if (onSpawn.default && typeof onSpawn.default.rage === 'number'){
    return Math.max(0, onSpawn.default.rage);
  }
  if (revive && typeof onSpawn.reviveRage === 'number'){
    return Math.max(0, onSpawn.reviveRage);
  }
  if (typeof onSpawn.defaultRage === 'number'){
    return Math.max(0, onSpawn.defaultRage);
  }
  if (typeof onSpawn.rageOnSummon === 'number' && !isLeader){
    return Math.max(0, onSpawn.rageOnSummon);
  }
  return null;
}

function verticalNeighbors(baseSlot: number): ReadonlyArray<number> {
  const row = (baseSlot - 1) % 3;
  const list: number[] = [];
  if (row > 0) list.push(baseSlot - 1);
  if (row < 2) list.push(baseSlot + 1);
  return list;
}

function rowNeighbors(baseSlot: number): ReadonlyArray<number> {
  const col = Math.floor((baseSlot - 1) / 3);
  const row = (baseSlot - 1) % 3;
  const left = col < 2 ? ((col + 1) * 3 + row + 1) : null;
  const right = col > 0 ? ((col - 1) * 3 + row + 1) : null;
  const neighbors = [right, left].filter((slot): slot is number => typeof slot === 'number' && Number.isFinite(slot));
  return neighbors;
}

export function resolveSummonSlots(spec: SummonSpecLike | null | undefined, baseSlot: number): ReadonlyArray<number> {
  if (!spec || !Number.isFinite(baseSlot)) return [];
  if (Array.isArray(spec.slots) && spec.slots.length){
    return spec.slots
      .filter((slot): slot is number => typeof slot === 'number' && Number.isFinite(slot))
      .map((slot) => Number(slot));
  }

  const patternRaw = spec.pattern || spec.placement || spec.shape || spec.area;
  const pattern = normalizeKey(patternRaw);
  if (!pattern){
    return verticalNeighbors(baseSlot);
  }

  switch(pattern){
    case 'verticalneighbors':
    case 'columnneighbors':
    case 'column':
    case 'adjacentcolumn':
      return verticalNeighbors(baseSlot);
    case 'rowneighbors':
    case 'horizontalneighbors':
    case 'adjacentrow':
      return rowNeighbors(baseSlot);
    case 'adjacent':
    case 'adjacentall':
    case 'neighbors': {
      const merged = [...verticalNeighbors(baseSlot), ...rowNeighbors(baseSlot)];
      return Array.from(new Set(merged));
    }
    case 'self':
      return [baseSlot];
    default:
      return verticalNeighbors(baseSlot);
  }
}