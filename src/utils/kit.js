const KNOWN_SUMMON_KEYS = ['summon', 'summoner', 'immediateSummon'];
const KNOWN_REVIVE_KEYS = ['revive', 'reviver'];
const DEFENSIVE_TAGS = ['defense', 'defensive', 'protection', 'shield', 'barrier', 'support'];
const INSTANT_TAGS = ['instant', 'instant-cast', 'instantCast'];

function coerceKit(metaOrKit){
  if (!metaOrKit) return null;
  if (metaOrKit.kit) return metaOrKit.kit;
  return metaOrKit;
}

function normalizeKey(key){
  return typeof key === 'string' ? key.trim().toLowerCase() : '';
}

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
        const id = normalizeKey(entry.id || entry.key || entry.type || entry.name);
        if (id === target) return entry;
        if (entry[target] != null) return entry[target];
      }
    }
    return null;
  }

  if (typeof traits === 'object'){
    for (const [k, value] of Object.entries(traits)){
      if (normalizeKey(k) === target) return value;
    }
  }
  return null;
}

function cloneShallow(value){
  if (!value || typeof value !== 'object') return value ?? null;
  if (Array.isArray(value)) return value.map(cloneShallow);
  const out = { ...value };
  for (const [k, v] of Object.entries(out)){
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = { ...v };
    if (Array.isArray(v)) out[k] = v.map(cloneShallow);
  }
  return out;
}

function extractUltSummonFields(ult){
  if (!ult || typeof ult !== 'object') return null;
  const out = {};
  let hasValue = false;
  const assign = (key, value, clone = false) => {
    if (value === undefined) return;
    if (value === null) return;
    out[key] = clone ? cloneShallow(value) : value;
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

function applyUltSummonDefaults(spec, ult){
  const fields = extractUltSummonFields(ult);
  if (!fields) return spec;
  const out = spec ?? {};
  for (const [key, value] of Object.entries(fields)){
    if (out[key] === undefined || out[key] === null){
      out[key] = value;
    }
  }
  return out;
}

function collectUltTags(metaOrKit){
  const kit = coerceKit(metaOrKit);
  const ult = kit?.ult;
  const tags = new Set();
  const add = (val) => {
    if (typeof val === 'string' && val.trim() !== '') tags.add(val.trim());
  };
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

  const traitUlt = readTrait(kit?.traits, 'ult');
  if (traitUlt){
    if (typeof traitUlt === 'string') add(traitUlt);
    if (Array.isArray(traitUlt)) addMany(traitUlt);
    if (traitUlt && typeof traitUlt === 'object'){
      add(traitUlt.type);
      addMany(traitUlt.tags);
      addMany(traitUlt.categories);
      if (typeof traitUlt.label === 'string') add(traitUlt.label);
    }
  }

  return tags;
}

function getSummonSpec(metaOrKit){
  const kit = coerceKit(metaOrKit);
  if (!kit) return null;

  let spec = null;
  for (const key of KNOWN_SUMMON_KEYS){
    const trait = readTrait(kit.traits, key);
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
  if (!spec && tags.has('summon')){
    if (ult?.summon){
      spec = cloneShallow(ult.summon);
    }
    spec = applyUltSummonDefaults(spec, ult);
  }
  if (ult && typeof ult.type === 'string' && ult.type.toLowerCase() === 'summon'){
    spec = applyUltSummonDefaults(spec, ult);
  }

  if (!spec) return null;

  const normalized = cloneShallow(spec) || {};
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
  return normalized;
}

function getReviveSpec(metaOrKit){
  const kit = coerceKit(metaOrKit);
  if (!kit) return null;
  for (const key of KNOWN_REVIVE_KEYS){
    const trait = readTrait(kit.traits, key);
    if (trait){
      if (trait === true) return {};
      if (typeof trait === 'object') return cloneShallow(trait);
      return {};
    }
  }
  const ult = kit.ult || null;
  if (ult?.revive) return cloneShallow(ult.revive);
  if (ult?.metadata?.revive) return cloneShallow(ult.metadata.revive);
  if (collectUltTags(kit).has('revive')){
    return cloneShallow(ult?.revive || {});
  }
  return null;
}

function kitSupportsSummon(metaOrKit){
  return !!getSummonSpec(metaOrKit);
}

function kitUltHasTag(metaOrKit, tag){
  if (!tag) return false;
  const tags = collectUltTags(metaOrKit);
  const target = normalizeKey(tag);
  for (const t of tags){
    if (normalizeKey(t) === target) return true;
  }
  return false;
}

function detectUltBehavior(metaOrKit){
  const kit = coerceKit(metaOrKit);
  const ult = kit?.ult;
  const tags = collectUltTags(kit);
  const metadata = ult?.metadata || ult?.meta || {};
  const traits = kit?.traits || null;

  const hasInstant = Boolean(
    metadata.instant === true || metadata.instantCast === true || metadata.cast === 'instant'
      || (ult && (ult.instant || ult.cast === 'instant' || ult.immediate === true))
      || INSTANT_TAGS.some(tag => kitUltHasTag(kit, tag))
      || readTrait(traits, 'instantUlt') === true || readTrait(traits, 'instantUltimate') === true
  );

  const hasDefensive = Boolean(
    metadata.defensive === true || metadata.role === 'defensive'
      || DEFENSIVE_TAGS.some(tag => kitUltHasTag(kit, tag))
      || (ult && (typeof ult.reduceDamage === 'number' || typeof ult.shield === 'number' || typeof ult.barrier === 'number'
        || Array.isArray(ult.shields) || Array.isArray(ult.buffs) && ult.buffs.some(b => normalizeKey(b.effect) === 'shield')))
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

function extractRageFromEffects(onSpawn, opts){
  const effects = Array.isArray(onSpawn?.effects) ? onSpawn.effects : [];
  for (const effect of effects){
    if (!effect) continue;
    const type = normalizeKey(effect.type || effect.kind || effect.effect);
    if (!type) continue;
    if (type === 'setrage' || type === 'addrage' || type === 'giverage'){
      if (opts.revive && normalizeKey(effect.phase || effect.stage || effect.when) === 'revive' && typeof effect.amount === 'number'){
        return effect.amount;
      }
      if (opts.isLeader && normalizeKey(effect.target) === 'leader' && typeof effect.amount === 'number'){
        return effect.amount;
      }
      if (!opts.isLeader && (effect.target == null || ['deck', 'nonleader', 'non-leader'].includes(normalizeKey(effect.target)))){
        if (typeof effect.amount === 'number') return effect.amount;
      }
      if (typeof effect.value === 'number') return effect.value;
      if (typeof effect.amount === 'number') return effect.amount;
    }
  }
  return null;
}

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

  const fromEffects = extractRageFromEffects(onSpawn, opts);
  if (fromEffects != null) return Math.max(0, fromEffects);

  const rage = onSpawn.rage;
  if (typeof rage === 'number') return Math.max(0, rage);
  if (typeof rage === 'string' && rage.trim() !== ''){
    const parsed = Number(rage);
    if (!Number.isNaN(parsed)) return Math.max(0, parsed);
  }
  if (rage && typeof rage === 'object'){
    if (revive && typeof rage.revive === 'number') return Math.max(0, rage.revive);
    if (isLeader && typeof rage.leader === 'number') return Math.max(0, rage.leader);
    if (!isLeader){
      if (typeof rage.deck === 'number') return Math.max(0, rage.deck);
      if (typeof rage.nonLeader === 'number') return Math.max(0, rage.nonLeader);
    }
    if (typeof rage.default === 'number') return Math.max(0, rage.default);
    if (typeof rage.value === 'number') return Math.max(0, rage.value);
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

function verticalNeighbors(baseSlot){
  const row = (baseSlot - 1) % 3;
  const list = [];
  if (row > 0) list.push(baseSlot - 1);
  if (row < 2) list.push(baseSlot + 1);
  return list;
}

function rowNeighbors(baseSlot){
  const col = Math.floor((baseSlot - 1) / 3);
  const row = (baseSlot - 1) % 3;
  const left  = (col < 2) ? ((col + 1) * 3 + row + 1) : null;
  const right = (col > 0) ? ((col - 1) * 3 + row + 1) : null;
  return [right, left].filter(Boolean);
}

function resolveSummonSlots(spec, baseSlot){
  if (!spec || !Number.isFinite(baseSlot)) return [];
  if (Array.isArray(spec.slots) && spec.slots.length){
    return spec.slots.filter(s => Number.isFinite(s)).map(s => s|0);
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