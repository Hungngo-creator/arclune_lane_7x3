// @ts-check

/**
 * @typedef {Record<string, unknown> & { id?: string; key?: string; type?: string; name?: string; tags?: ReadonlyArray<string>; categories?: ReadonlyArray<string>; label?: string; [extra: string]: unknown; }} KitTraitObject
 */

/**
 * @typedef {ReadonlyArray<string | KitTraitObject | boolean | number | null | undefined> | Record<string, unknown> | null | undefined} KitTraits
 */

/**
 * @typedef {Record<string, unknown> & { type?: string; kind?: string; category?: string; tags?: ReadonlyArray<string>; categories?: ReadonlyArray<string>; label?: string; summon?: SummonSpecLike | null | undefined; revive?: Record<string, unknown> | null | undefined; instant?: boolean; instantCast?: boolean; cast?: string; immediate?: boolean; reduceDamage?: number; shield?: number; barrier?: number; buffs?: ReadonlyArray<Record<string, unknown>> | null | undefined; }} UltMetadata
 */

/**
 * @typedef {Record<string, unknown> & { pattern?: string; placement?: string; patternKey?: string; shape?: string; area?: string; slots?: ReadonlyArray<number | null | undefined>; count?: number; summonCount?: number; ttl?: number; ttlTurns?: number; inherit?: unknown; limit?: number; replace?: unknown; creep?: unknown; }} SummonSpecLike
 */

/**
 * @typedef {SummonSpecLike & { slots?: ReadonlyArray<number>; pattern?: string; ttl?: number; ttlTurns?: number; }} NormalizedSummonSpec
 */

/**
 * @typedef {Record<string, unknown> & { type?: string; kind?: string; category?: string; tags?: ReadonlyArray<string>; metadata?: UltMetadata | null | undefined; meta?: UltMetadata | null | undefined; summon?: SummonSpecLike | null | undefined; revive?: Record<string, unknown> | null | undefined; summonCount?: number; placement?: string; pattern?: string; ttl?: number; ttlTurns?: number; limit?: number; inherit?: unknown; replace?: unknown; creep?: unknown; }} UltSpec
 */

/**
 * @typedef {Record<string, unknown> & { kit?: KitData | null | undefined; traits?: KitTraits; ult?: UltSpec | null | undefined; }} KitMeta
 */

/**
 * @typedef {Record<string, unknown> & { traits?: KitTraits; ult?: UltSpec | null | undefined; }} KitData
 */

/**
 * @typedef {object} UltBehavior
 * @property {ReadonlyArray<string>} tags
 * @property {boolean} hasInstant
 * @property {boolean} hasDefensive
 * @property {boolean} hasRevive
 * @property {Record<string, unknown> | null} revive
 * @property {NormalizedSummonSpec | null} summon
 */

/**
 * @typedef {object} OnSpawnRageMap
 * @property {number} [revive]
 * @property {number} [leader]
 * @property {number} [deck]
 * @property {number} [nonLeader]
 * @property {number} [default]
 * @property {number} [value]
 */

/**
 * @typedef {Record<string, unknown> & { type?: string; kind?: string; effect?: string; phase?: string; stage?: string; when?: string; target?: string; amount?: number; value?: number; }} OnSpawnEffect
 */

/**
 * @typedef {Record<string, unknown> & { rage?: number | string | OnSpawnRageMap | null; effects?: ReadonlyArray<OnSpawnEffect | null | undefined>; revive?: { rage?: number } | null | undefined; onRevive?: { rage?: number } | null | undefined; revived?: { rage?: number } | null | undefined; deck?: { rage?: number } | null | undefined; default?: { rage?: number } | null | undefined; reviveRage?: number | null | undefined; defaultRage?: number | null | undefined; rageOnSummon?: number | null | undefined; }} OnSpawnConfig
 */

/**
 * @typedef {object} ExtractOnSpawnRageOptions
 * @property {boolean} [isLeader]
 * @property {boolean} [revive]
 * @property {{ rage?: number } | null | undefined} [reviveSpec]
 */

const KNOWN_SUMMON_KEYS = ['summon', 'summoner', 'immediateSummon'];
const KNOWN_REVIVE_KEYS = ['revive', 'reviver'];
const DEFENSIVE_TAGS = ['defense', 'defensive', 'protection', 'shield', 'barrier', 'support'];
const INSTANT_TAGS = ['instant', 'instant-cast', 'instantCast'];

/**
 * @param {KitMeta | KitData | null | undefined} metaOrKit
 * @returns {KitData | null}
 */
function coerceKit(metaOrKit){
  if (!metaOrKit) return null;
  if ('kit' in metaOrKit && metaOrKit.kit) return /** @type {KitData} */ (metaOrKit.kit);
  return /** @type {KitData} */ (metaOrKit);
}

/**
 * @param {unknown} key
 * @returns {string}
 */
function normalizeKey(key){
  return typeof key === 'string' ? key.trim().toLowerCase() : '';
}

/**
 * @param {KitTraits | null | undefined} traits
 * @param {string} key
 * @returns {boolean | KitTraitObject | string | number | null}
 */
function readTrait(traits, key){
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
        const candidate = /** @type {KitTraitObject} */ (entry);
        const id = normalizeKey(candidate.id || candidate.key || candidate.type || candidate.name);
        if (id === target) return candidate;
        if (candidate[target] != null){
          return /** @type {boolean | KitTraitObject | string | number | null} */ (candidate[target]);
        }
      }
    }
    return null;
  }

  if (typeof traits === 'object'){
    for (const [k, value] of Object.entries(traits)){
      if (normalizeKey(k) === target){
        return /** @type {boolean | KitTraitObject | string | number | null} */ (value);
      }
    }
  }
  return null;
}

/**
 * @template T
 * @param {T | null | undefined} value
 * @returns {T | null}
 */
function cloneShallow(value){
  if (value == null || typeof value !== 'object') return (value ?? null);
  if (Array.isArray(value)) return /** @type {T | null} */ (value.map(cloneShallow));
  const out = /** @type {Record<string, unknown>} */ ({ ...value });
  for (const [k, v] of Object.entries(out)){
    if (Array.isArray(v)){
      out[k] = v.map(cloneShallow);
      continue;
    }
    if (v && typeof v === 'object'){
      out[k] = cloneShallow(v);
    }
  }
  return /** @type {T} */ (out);
}

/**
 * @param {UltSpec | null | undefined} ult
 * @returns {Partial<NormalizedSummonSpec> | null}
 */
function extractUltSummonFields(ult){
  if (!ult || typeof ult !== 'object') return null;
const out = /** @type {Partial<NormalizedSummonSpec> & Record<string, unknown>} */ ({});
  let hasValue = false;
  /**
   * @param {keyof NormalizedSummonSpec} key
   * @param {unknown} value
   * @param {boolean} [clone]
   */
  const assign = (key, value, clone = false) => {
    if (value === undefined || value === null) return;
if (clone && value && typeof value === 'object'){
      out[key] = Array.isArray(value) ? value.map(cloneShallow) : cloneShallow(value);
    } else {
      out[key] = value;
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

  return hasValue ? /** @type {Partial<NormalizedSummonSpec>} */ (out) : null;
}

/**
 * @param {SummonSpecLike | null | undefined} spec
 * @param {UltSpec | null | undefined} ult
 * @returns {SummonSpecLike | null}
 */
function applyUltSummonDefaults(spec, ult){
  const fields = extractUltSummonFields(ult);
  if (!fields) return spec ?? null;
  const out = spec ?? /** @type {SummonSpecLike} */ ({});
  const target = /** @type {SummonSpecLike & Record<string, unknown>} */ (out);
  for (const [key, value] of Object.entries(fields)){
    const current = target[key];
    if (current === undefined || current === null){
target[key] = value;
    }
  }
  return out;
}

/**
 * @param {KitMeta | KitData | null | undefined} metaOrKit
 * @returns {Set<string>}
 */
function collectUltTags(metaOrKit){
  const kit = coerceKit(metaOrKit);
  const ult = kit?.ult;
  /** @type {Set<string>} */
  const tags = new Set();
  /**
   * @param {unknown} val
   */
  const add = (val) => {
    if (typeof val === 'string' && val.trim() !== '') tags.add(val.trim());
  };
    /**
   * @param {unknown} vals
   */
  const addMany = (vals) => {
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
      const traitObj = /** @type {KitTraitObject} */ (traitUlt);
      add(traitObj.type);
      addMany(traitObj.tags);
      addMany(traitObj.categories);
      if (typeof traitObj.label === 'string') add(traitObj.label);
    }
  }

  return tags;
}

/**
 * @param {KitMeta | KitData | null | undefined} metaOrKit
 * @returns {NormalizedSummonSpec | null}
 */
function getSummonSpec(metaOrKit){
  const kit = coerceKit(metaOrKit);
  if (!kit) return null;

/** @type {SummonSpecLike | null} */
  let spec = null;
  for (const key of KNOWN_SUMMON_KEYS){
    const trait = readTrait(kit.traits ?? null, key);
    if (trait){
      if (trait === true) {
        spec = {};
      } else if (typeof trait === 'object'){
        spec = /** @type {SummonSpecLike | null} */ (cloneShallow(trait));
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
      spec = /** @type {SummonSpecLike | null} */ (cloneShallow(ult.summon));
    } else if (ult.metadata?.summon){
      spec = /** @type {SummonSpecLike | null} */ (cloneShallow(ult.metadata.summon));
    } else if (ult.meta?.summon){
      spec = /** @type {SummonSpecLike | null} */ (cloneShallow(ult.meta.summon));
    }
  }

  const tags = collectUltTags(kit);
  if (!spec && kitUltHasTag(kit, 'summon', tags)){
    if (ult?.summon){
      spec = /** @type {SummonSpecLike | null} */ (cloneShallow(ult.summon));
    }
    spec = applyUltSummonDefaults(spec, ult);
  }
  if (ult && typeof ult.type === 'string' && ult.type.toLowerCase() === 'summon'){
    spec = applyUltSummonDefaults(spec, ult);
  }

  if (!spec) return null;

  const normalized = /** @type {NormalizedSummonSpec} */ (cloneShallow(spec) || {});
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
    normalized.slots = normalized.slots.filter((s) => Number.isFinite(s)).map((s) => Number(s));
  }
  return normalized;
}

/**
 * @param {KitMeta | KitData | null | undefined} metaOrKit
 * @returns {Record<string, unknown> | null}
 */
function getReviveSpec(metaOrKit){
  const kit = coerceKit(metaOrKit);
  if (!kit) return null;
  for (const key of KNOWN_REVIVE_KEYS){
  const trait = readTrait(kit.traits ?? null, key);
    if (trait){
      if (trait === true) return {};
      if (typeof trait === 'object') return /** @type {Record<string, unknown>} */ (cloneShallow(trait) || {});
      return {};
    }
  }
  const ult = kit.ult || null;
  if (ult?.revive) return /** @type {Record<string, unknown>} */ (cloneShallow(ult.revive) || {});
  if (ult?.metadata?.revive) return /** @type {Record<string, unknown>} */ (cloneShallow(ult.metadata.revive) || {});
  if (kitUltHasTag(kit, 'revive')){
    return /** @type {Record<string, unknown>} */ (cloneShallow(ult?.revive || {}) || {});
  }
  return null;
}

/**
 * @param {KitMeta | KitData | null | undefined} metaOrKit
 * @returns {boolean}
 */
function kitSupportsSummon(metaOrKit){
  return getSummonSpec(metaOrKit) != null;
}

/**
 * @param {KitMeta | KitData | null | undefined} metaOrKit
 * @param {string} tag
 * @param {Set<string> | null} [precomputedTags]
 * @returns {boolean}
 */
function kitUltHasTag(metaOrKit, tag, precomputedTags = null){
  if (!tag) return false;
  const tags = precomputedTags ?? collectUltTags(metaOrKit);
  const target = normalizeKey(tag);
  for (const t of tags){
    if (normalizeKey(t) === target) return true;
  }
  return false;
}

/**
 * @param {KitMeta | KitData | null | undefined} metaOrKit
 * @returns {UltBehavior}
 */
function detectUltBehavior(metaOrKit){
  const kit = coerceKit(metaOrKit);
  const ult = kit?.ult;
  const tags = collectUltTags(kit);
  const metadata = ult?.metadata || ult?.meta || /** @type {UltMetadata} */ ({});
  const traits = kit?.traits ?? null;

  const hasInstant = Boolean(
    metadata.instant === true || metadata.instantCast === true || metadata.cast === 'instant'
      || (ult && (ult.instant || ult.cast === 'instant' || ult.immediate === true))
      || INSTANT_TAGS.some((tag) => kitUltHasTag(kit, tag))
      || readTrait(traits, 'instantUlt') === true || readTrait(traits, 'instantUltimate') === true
  );

  const hasDefensive = Boolean(
    metadata.defensive === true || metadata.role === 'defensive'
      || DEFENSIVE_TAGS.some((tag) => kitUltHasTag(kit, tag))
      || (ult && (typeof ult.reduceDamage === 'number' || typeof ult.shield === 'number' || typeof ult.barrier === 'number'
        || Array.isArray(ult.shields) || Array.isArray(ult.buffs) && ult.buffs.some((b) => normalizeKey(b.effect) === 'shield')))
      || readTrait(traits, 'defensiveUlt') === true || readTrait(traits, 'guardianUlt') === true
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

/**
 * @param {OnSpawnConfig | null | undefined} onSpawn
 * @param {ExtractOnSpawnRageOptions} [opts]
 * @returns {number | null}
 */
function extractRageFromEffects(onSpawn, opts = {}){
  const effects = Array.isArray(onSpawn?.effects) ? onSpawn.effects : [];
  for (const effect of effects){
    if (!effect) continue;
    const effectObj = /** @type {OnSpawnEffect} */ (effect);
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

/**
 * @param {OnSpawnConfig | null | undefined} onSpawn
 * @param {ExtractOnSpawnRageOptions} [opts]
 * @returns {number | null}
 */
function extractOnSpawnRage(onSpawn, opts = {}){
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

  const rage = onSpawn.rage;
  if (typeof rage === 'number') return Math.max(0, rage);
  if (typeof rage === 'string' && rage.trim() !== ''){
    const parsed = Number(rage);
    if (!Number.isNaN(parsed)) return Math.max(0, parsed);
  }
  if (rage && typeof rage === 'object'){
    const rageObj = /** @type {OnSpawnRageMap} */ (rage);
    if (revive && typeof rageObj.revive === 'number') return Math.max(0, rageObj.revive);
    if (isLeader && typeof rageObj.leader === 'number') return Math.max(0, rageObj.leader);
    if (!isLeader){
      if (typeof rageObj.deck === 'number') return Math.max(0, rageObj.deck);
      if (typeof rageObj.nonLeader === 'number') return Math.max(0, rageObj.nonLeader);
    }
    if (typeof rageObj.default === 'number') return Math.max(0, rageObj.default);
    if (typeof rageObj.value === 'number') return Math.max(0, rageObj.value);;
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

/**
 * @param {number} baseSlot
 * @returns {ReadonlyArray<number>}
 */
function verticalNeighbors(baseSlot){
  const row = (baseSlot - 1) % 3;
  /** @type {number[]} */
  const list = [];
  if (row > 0) list.push(baseSlot - 1);
  if (row < 2) list.push(baseSlot + 1);
  return list;
}

/**
 * @param {number} baseSlot
 * @returns {ReadonlyArray<number>}
 */
function rowNeighbors(baseSlot){
  const col = Math.floor((baseSlot - 1) / 3);
  const row = (baseSlot - 1) % 3;
  const left  = (col < 2) ? ((col + 1) * 3 + row + 1) : null;
  const right = (col > 0) ? ((col - 1) * 3 + row + 1) : null;
  return /** @type {ReadonlyArray<number>} */ ([right, left].filter(Boolean));
}

/**
 * @param {SummonSpecLike | null | undefined} spec
 * @param {number} baseSlot
 * @returns {ReadonlyArray<number>}
 */
function resolveSummonSlots(spec, baseSlot){
  if (!spec || !Number.isFinite(baseSlot)) return [];
  if (Array.isArray(spec.slots) && spec.slots.length){
    return spec.slots.filter((s) => Number.isFinite(s)).map((s) => Number(s));
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

export {
  kitSupportsSummon,
  getSummonSpec,
  detectUltBehavior,
  extractOnSpawnRage,
  resolveSummonSlots,
  kitUltHasTag,
  collectUltTags,
  getReviveSpec
};