import { AE_BY_CLASS, CLASS_BONUS, ELEMENT_COUNTER, RANK_MULT, CLASS_STATS, NUMERIC_PROFILE, DEFAULT_OPTIONS, KITS, PROFILE_VERSION, SOURCE_REF, scenarioUnits } from './profiles.mjs';

const clone = value => structuredClone(value);
const EPS = 1e-9;
const owns = (object, key) => Object.hasOwn(object, key);
const textKey = value => typeof value === 'string' && value.length > 0 && !['__proto__', 'prototype', 'constructor'].includes(value);
const fail = message => { throw new Error(message); };
const finite = (value, min = 0, max = Infinity) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const knownKeys = (object, keys, path) => {
  if (!object || typeof object !== 'object' || Array.isArray(object)) fail(`${path}: expected object`);
  for (const key of Object.keys(object)) if (!keys.includes(key)) fail(`${path}: unsupported field ${key}`);
};
const requireNumber = (value, path, min = 0, max = Infinity) => { if (!finite(value, min, max)) fail(`${path}: invalid number`); };
const validFormula = (formula, path) => {
  knownKeys(formula, ['constant', 'terms'], path);
  if (formula.constant !== undefined) requireNumber(formula.constant, path);
  if (formula.terms !== undefined) {
    if (!Array.isArray(formula.terms)) fail(`${path}: terms must be an array`);
    for (const term of formula.terms) {
      knownKeys(term, ['stat', 'rate'], path);
      if (!['atk', 'wil', 'arm', 'res', 'maxHp'].includes(term.stat)) fail(`${path}: unsupported stat`);
      requireNumber(term.rate, path);
    }
  }
  if (formula.constant === undefined && !formula.terms?.length) fail(`${path}: empty formula`);
};
const kitDamaging = (kit, id, ancestors = []) => !ancestors.includes(id) && !!kit.abilities[id]?.effects?.some(e => e.op === 'DAMAGE' || e.op === 'CHILD' && kitDamaging(kit, e.ability, [...ancestors, id]));

// A bounded prototype input format, NOT a replacement compiler for 04.
// Anything outside the supported subset must reject, never silently degrade.
export function validateKits(kits) {
  for (const [key, kit] of Object.entries(kits)) {
    knownKeys(kit, ['name', 'class', 'rank', 'provenance', 'states', 'passive', 'automatic', 'abilities'], key);
    if (!textKey(key) || !owns(AE_BY_CLASS, kit.class) || !owns(RANK_MULT, kit.rank) || typeof kit.name !== 'string' || !kit.name || typeof kit.provenance !== 'string' || !kit.provenance) fail(`${key}: invalid identity`);
    if (!kit.states || !kit.abilities?.basic) fail(`${key}: missing states/basic`);
    for (const [family, state] of Object.entries(kit.states)) {
      if (!textKey(family)) fail('Invalid State family');
      knownKeys(state, ['clock', 'laterOpportunities', 'statMultipliers', 'tickAt', 'healRate', 'recipients', 'targetConstraint'], family);
      if (!['OWNER_OPPORTUNITY_START', 'OWNER_OPPORTUNITY_END'].includes(state.clock)) fail(`${family}: unsupported clock`);
      if (!Number.isInteger(state.laterOpportunities) || state.laterOpportunities < 1) fail(`${family}: invalid duration`);
      if (state.statMultipliers) for (const [stat, rate] of Object.entries(state.statMultipliers)) {
        if (!['arm', 'res'].includes(stat)) fail(`${family}: unsupported modifier`);
        requireNumber(rate, family);
      }
      if (state.tickAt !== undefined) {
        if (state.clock !== 'OWNER_OPPORTUNITY_START' || !Number.isInteger(state.tickAt) || state.tickAt < 1 || state.tickAt >= state.laterOpportunities) fail(`${family}: tick/expiry conflict`);
        requireNumber(state.healRate, family, 0, 1);
        if (!Array.isArray(state.recipients) || !state.recipients.length || new Set(state.recipients).size !== state.recipients.length || state.recipients.some(r => !['SELF', 'ALLIED_LEADER'].includes(r))) fail(`${family}: invalid recipients`);
      } else if (state.healRate !== undefined || state.recipients !== undefined) fail(`${family}: missing tick clock`);
      if (state.targetConstraint !== undefined && state.targetConstraint !== 'SELECTABLE_SINGLE_RECIPIENT_DAMAGE') fail(`${family}: unsupported target constraint`);
    }
    if (kit.passive) {
      const p = kit.passive;
      knownKeys(p, ['checkpoint', 'threshold', 'comparator', 'thresholdBasis', 'gainRate', 'gainBasis', 'reconciliation', 'reset'], key);
      if (p.checkpoint !== 'HOSTILE_EXACT_ACTION_TERMINAL' || p.comparator !== 'STRICT_GT' || p.thresholdBasis !== 'ACTION_START_MAX_HP' || p.gainBasis !== 'LIVE_APPLICATION_MAX_HP' || p.reconciliation !== 'PRESERVE_ABSOLUTE_HP') fail(`${key}: unsupported passive profile`);
      requireNumber(p.threshold, key, 0, 1); requireNumber(p.gainRate, key, 0, 1);
      if (!Array.isArray(p.reset) || p.reset.some(c => !['HP_ZERO', 'LEAVE_FIELD', 'RETURN_TO_DECK', 'REINCARNATION_ENTRY'].includes(c))) fail(`${key}: invalid reset causes`);
    }
    if (kit.automatic) {
      const a = kit.automatic;
      knownKeys(a, ['checkpoint', 'afterModeHook', 'minHpRatio', 'ae', 'ability', 'observedFields', 'includeFieldInitialization'], key);
      if (a.checkpoint !== 'OWN_NATURAL_COMPLETION_AND_WAITING_COMMITS' || a.afterModeHook !== 'AE_ACTION_REGEN_BY_CLASS' || a.includeFieldInitialization !== false || JSON.stringify(a.observedFields) !== '["HP","MAX_HP","SIDE_AE"]' || kit.abilities[a.ability]?.form !== 'AUTOMATIC') fail(`${key}: unsupported automatic dependency/observation`);
      requireNumber(a.minHpRatio, key, 0, 1); requireNumber(a.ae, key);
      if (kit.abilities[a.ability].ae !== a.ae) fail(`${key}: inconsistent automatic cost`);
    }
    for (const [abilityId, ability] of Object.entries(kit.abilities)) {
      if (!textKey(abilityId)) fail('Invalid Ability identity');
      knownKeys(ability, ['name', 'form', 'ae', 'target', 'effects', 'hpCostRate', 'paidDirectMultiplier'], abilityId);
      if (!['BASIC', 'SKILL', 'ULTIMATE', 'AUTOMATIC'].includes(ability.form) || typeof ability.name !== 'string' || !ability.name) fail(`${abilityId}: unsupported form`);
      requireNumber(ability.ae, abilityId);
      if (ability.hpCostRate !== undefined) requireNumber(ability.hpCostRate, abilityId, 0, .99);
      if (ability.paidDirectMultiplier !== undefined) {
        requireNumber(ability.paidDirectMultiplier, abilityId, 1);
        if (ability.hpCostRate === undefined) fail(`${abilityId}: multiplier lacks paid-HP binding`);
      }
      const target = ability.target;
      knownKeys(target, ['relation', 'shape', 'binding', 'slot'], abilityId);
      const binding = target.binding ?? (target.shape === 'SELF' ? 'ENTITY' : kitDamaging(kit, abilityId) ? 'POSITION' : null);
      if (!['SELF', 'ALLY', 'ENEMY'].includes(target.relation) || !['SELF', 'ALL', 'SELECTABLE_SINGLE', 'FIXED_SLOT'].includes(target.shape) || !['ENTITY', 'POSITION'].includes(binding)) fail(`${abilityId}: unsupported target profile`);
      if ((target.shape === 'SELF') !== (target.relation === 'SELF') || target.shape === 'SELF' && binding !== 'ENTITY' || target.shape === 'FIXED_SLOT' && binding !== 'POSITION') fail(`${abilityId}: incompatible target binding`);
      if (target.shape === 'FIXED_SLOT' ? !Number.isInteger(target.slot) || target.slot < 1 || target.slot > 9 : target.slot !== undefined) fail(`${abilityId}: invalid fixed Slot`);
      if (!Array.isArray(ability.effects) || !ability.effects.length) fail(`${abilityId}: empty graph`);
      for (const effect of ability.effects) {
        if (effect.op === 'DAMAGE') {
          knownKeys(effect, ['op', 'binding', 'recipientCheckpoint', 'emptyPolicy', 'invalidPolicy', 'components', 'convertToTrueBelowTargetHp'], abilityId);
          if (effect.binding !== undefined && !['ENTITY', 'POSITION'].includes(effect.binding)) fail(`${abilityId}: unsupported Damage binding`);
          if (effect.recipientCheckpoint !== 'PRE_DAMAGE' || effect.emptyPolicy !== 'MISS' || effect.invalidPolicy !== 'SKIP') fail(`${abilityId}: unsupported Damage recipient checkpoint/policy`);
          if (!Array.isArray(effect.components) || !effect.components.length) fail(`${abilityId}: missing components`);
          for (const c of effect.components) {
            knownKeys(c, ['type', 'amount'], abilityId);
            if (!['PHYSICAL', 'WILL', 'TRUE'].includes(c.type)) fail(`${abilityId}: unsupported Damage type`);
            validFormula(c.amount, abilityId);
          }
          if (effect.convertToTrueBelowTargetHp !== undefined) requireNumber(effect.convertToTrueBelowTargetHp, abilityId, 0, 1);
        } else if (effect.op === 'HEAL' || effect.op === 'MAX_HP') {
          knownKeys(effect, ['op', 'recipient', 'amount', ...(effect.op === 'MAX_HP' ? ['source'] : [])], abilityId);
          if (!['SELF', 'TARGET', 'ALLIED_LEADER'].includes(effect.recipient)) fail(`${abilityId}: invalid recipient`);
          validFormula(effect.amount, abilityId);
          if (effect.op === 'MAX_HP' && !textKey(effect.source)) fail(`${abilityId}: missing MaxHP source`);
        } else if (effect.op === 'STATE') {
          knownKeys(effect, ['op', 'recipient', 'family'], abilityId);
          if (effect.recipient !== 'SELF' || !owns(kit.states, effect.family)) fail(`${abilityId}: unsupported State`);
        } else if (effect.op === 'STUN') {
          knownKeys(effect, ['op', 'chance', 'lostOpportunities'], abilityId);
          requireNumber(effect.chance, abilityId, 0, 1);
          if (effect.lostOpportunities !== 1) fail(`${abilityId}: unsupported CC clock`);
        } else if (effect.op === 'COOLDOWN') {
          knownKeys(effect, ['op', 'laterOpportunities'], abilityId);
          if (effect.laterOpportunities !== 1) fail(`${abilityId}: unsupported CD clock`);
        } else if (effect.op === 'CHILD') {
          knownKeys(effect, ['op', 'ability', 'waiveAE'], abilityId);
          if (!owns(kit.abilities, effect.ability) || typeof effect.waiveAE !== 'boolean' || ['ULTIMATE', 'BASIC'].includes(kit.abilities[effect.ability].form)) fail(`${abilityId}: invalid child`);
          const childTarget = kit.abilities[effect.ability].target;
          if (childTarget.shape !== 'SELF' && (childTarget.relation !== target.relation || childTarget.shape !== target.shape || childTarget.slot !== target.slot)) fail(`${abilityId}: unsupported child target selection`);
        } else fail(`${abilityId}: unsupported operation ${effect.op}`);
      }
    }
    const visit = (id, ancestors) => {
      if (ancestors.includes(id)) fail(`${key}: cyclic child graph`);
      for (const e of kit.abilities[id].effects) if (e.op === 'CHILD') visit(e.ability, [...ancestors, id]);
    };
    for (const id of Object.keys(kit.abilities)) visit(id, []);
  }
}

// Resolve each attack owner independently. Parent/Ability binding is never an
// exception grant to a Damage Effect or child. Runtime consumes resolved data.
export function normalizeKits(authored) {
  validateKits(authored);
  const kits = clone(authored);
  for (const kit of Object.values(kits)) for (const [id, ability] of Object.entries(kit.abilities)) {
    ability.target.binding ??= ability.target.shape === 'SELF' ? 'ENTITY' : kitDamaging(kit, id) ? 'POSITION' : null;
    for (const effect of ability.effects) if (effect.op === 'DAMAGE') effect.binding ??= 'POSITION';
  }
  return kits;
}

export function matchup(attacker, defender, options) {
  const classBonus = options.classBonusEnabled ? CLASS_BONUS[attacker.class]?.[defender.class] ?? 0 : 0;
  const elementBonus = options.elementBonusEnabled && ELEMENT_COUNTER[attacker.element]?.includes(defender.element) ? .1 : 0;
  return { classBonus, elementBonus, multiplier: 1 + classBonus + elementBonus };
}

export class Battle {
  constructor(options = {}, unitSpecs = null, kits = KITS) {
    knownKeys(options, Object.keys(DEFAULT_OPTIONS), 'options');
    this.options = { ...DEFAULT_OPTIONS, ...clone(options) };
    const o = this.options;
    if (!Number.isInteger(o.seed) || o.seed < 0 || o.seed > 0xffffffff) fail('Invalid seed');
    requireNumber(o.startingAE, 'startingAE', 0, NUMERIC_PROFILE.aeCap);
    requireNumber(o.startingRage, 'startingRage', 0, NUMERIC_PROFILE.rageMax);
    requireNumber(o.hitChance, 'hitChance', 0, 1);
    for (const flag of ['rankEnabled', 'classBonusEnabled', 'elementBonusEnabled']) if (typeof o[flag] !== 'boolean') fail(`Invalid ${flag}`);
    if (!owns(AE_BY_CLASS, o.trainingClass) || !owns(RANK_MULT, o.trainingRank) || !owns(ELEMENT_COUNTER, o.alliedElement) || !owns(ELEMENT_COUNTER, o.enemyElement)) fail('Unsupported fixture metadata');
    this.kits = normalizeKits(kits);
    this.authoredKits = clone(kits);
    this.specs = clone(unitSpecs ?? scenarioUnits(o));
    this.trace = []; this.commands = []; this.processed = {}; this.actionSerial = 0; this.windowSerial = 0;
    this.rngState = o.seed || 0x6d2b79f5; this.drawSerial = 0;
    this.ae = { A: o.startingAE, B: o.startingAE }; this.side = 'A'; this.pointer = { A: 0, B: 0 };
    this.opportunities = 0; this.active = null; this.outcome = null; this.observing = false;
    this.units = this.specs.map(spec => {
      knownKeys(spec, ['id', 'kit', 'side', 'slot', 'element', 'leader', 'rank', 'class', 'baseStats', 'hp', 'shield', 'rage'], 'unit');
      if (!owns(this.kits, spec.kit)) fail('Unsupported unit kit');
      const kit = this.kits[spec.kit];
      if (!textKey(spec.id) || !['A', 'B'].includes(spec.side) || !Number.isInteger(spec.slot) || spec.slot < 1 || spec.slot > 9 || !owns(ELEMENT_COUNTER, spec.element) || spec.leader !== undefined && typeof spec.leader !== 'boolean') fail('Unsupported unit');
      const cls = spec.class ?? kit.class, rank = spec.rank ?? kit.rank;
      if (!owns(CLASS_STATS, cls) || !owns(RANK_MULT, rank)) fail('Unsupported Class/Rank');
      const base = clone(spec.baseStats ?? CLASS_STATS[cls]);
      knownKeys(base, ['maxHp', 'atk', 'wil', 'arm', 'res'], 'baseStats');
      for (const s of ['maxHp', 'atk', 'wil', 'arm', 'res']) requireNumber(base[s], s, s === 'maxHp' ? 1 : 0);
      const multiplier = o.rankEnabled ? RANK_MULT[rank] : 1;
      const stats = Object.fromEntries(Object.entries(base).map(([s, value]) => [s, value * multiplier]));
      const hp = spec.hp ?? stats.maxHp, shield = spec.shield ?? 0, rage = spec.rage ?? o.startingRage;
      requireNumber(hp, 'HP', 0, stats.maxHp); requireNumber(shield, 'Shield'); requireNumber(rage, 'Rage', 0, NUMERIC_PROFILE.rageMax);
      return { ...spec, class: cls, rank, stats, hp, shield, rage, alive: hp > 0, present: hp > 0, opportunity: 0, states: {}, maxHpContributions: {}, cdReadyAt: 0, waiting: false, stunned: false };
    });
    if (new Set(this.units.map(u => u.id)).size !== this.units.length) fail('Duplicate Entity IDs');
    for (const side of ['A', 'B']) {
      const units = this.units.filter(u => u.side === side);
      if (new Set(units.map(u => u.slot)).size !== units.length || units.filter(u => u.leader).length !== 1 || !units.find(u => u.leader && u.slot === 8)) fail('Expected unique Slots and one Leader at Slot8 per Side');
      // Shared AE contention between multiple automatic observers requires an
      // explicit composition law. This prototype has no such law; reject it.
      if (units.filter(u => this.kit(u).automatic).length > 1) fail('Unsupported competing automatic observers on one Side');
    }
    this.emit('BATTLE_START', { seed: o.seed, profile: PROFILE_VERSION, sourceRef: SOURCE_REF });
    this.checkBattleEnd(); this.prepare();
  }
  kit(unit) { return this.kits[unit.kit]; }
  unit(id) { const u = this.units.find(u => u.id === id); if (!u) fail(`Unknown Entity ${id}`); return u; }
  emit(type, data = {}) { const event = { seq: this.trace.length + 1, type, ...clone(data) }; this.trace.push(event); return event; }
  random(cause) {
    let x = this.rngState; x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.rngState = x >>> 0; const value = this.rngState / 0x100000000;
    this.emit('RNG', { draw: ++this.drawSerial, cause, value }); return value;
  }
  maxHp(unit) { return unit.stats.maxHp + Object.values(unit.maxHpContributions).reduce((a, b) => a + b, 0); }
  stats(unit) {
    const result = { ...unit.stats, maxHp: this.maxHp(unit) };
    for (const state of Object.values(unit.states)) for (const [stat, rate] of Object.entries(state.profile.statMultipliers ?? {})) result[stat] *= rate;
    return result;
  }
  formula(formula, snapshot) { return (formula.constant ?? 0) + (formula.terms ?? []).reduce((sum, t) => sum + snapshot[t.stat] * t.rate, 0); }
  leader(side) { return this.units.find(u => u.side === side && u.leader); }
  valid(unit) { return unit.alive && unit.present; }
  pool(actor, target) {
    return this.units.filter(u => this.valid(u) && (target.relation === 'SELF' ? u.id === actor.id : target.relation === 'ALLY' ? u.side === actor.side : u.side !== actor.side));
  }
  damaging(actor, abilityId, ancestors = []) {
    if (ancestors.includes(abilityId)) fail('Cyclic child graph');
    return this.kit(actor).abilities[abilityId].effects.some(e => e.op === 'DAMAGE' || e.op === 'CHILD' && this.damaging(actor, e.ability, [...ancestors, abilityId]));
  }
  targetChoices(actor, abilityId) {
    const ability = this.kit(actor).abilities[abilityId];
    if (!ability) fail('Unknown Ability');
    let pool = this.pool(actor, ability.target);
    if (ability.target.shape === 'FIXED_SLOT') return pool.filter(u => u.slot === ability.target.slot);
    if (ability.target.shape === 'SELECTABLE_SINGLE' && ability.target.relation === 'ENEMY' && this.damaging(actor, abilityId)) {
      const forced = pool.filter(u => Object.values(u.states).some(s => s.profile.targetConstraint === 'SELECTABLE_SINGLE_RECIPIENT_DAMAGE'));
      if (forced.length > 1) fail('REQUIRED_EXPLICIT: conflicting Taunt recipients');
      if (forced.length) pool = forced;
    }
    return pool;
  }
  ultimateReady(actor) { return actor.rage >= NUMERIC_PROFILE.rageMax && this.canUse(actor, 'ultimate', false).ok; }
  canUse(actor, abilityId, enforcePriority = true) {
    const ability = this.kit(actor).abilities[abilityId];
    if (!ability || ability.form === 'AUTOMATIC') return { ok: false, reason: 'Kỹ năng tự động' };
    if (!this.valid(actor)) return { ok: false, reason: 'Nhân vật không còn trên sân' };
    if (ability.form === 'ULTIMATE' && actor.rage < NUMERIC_PROFILE.rageMax) return { ok: false, reason: 'Chưa đầy Rage' };
    if (this.ae[actor.side] < ability.ae) return { ok: false, reason: 'Thiếu AE' };
    if (ability.hpCostRate && actor.hp * (1 - ability.hpCostRate) <= 0) return { ok: false, reason: 'Không trả được HP Cost' };
    if (!this.targetChoices(actor, abilityId).length) return { ok: false, reason: 'Không có mục tiêu hợp lệ' };
    if (enforcePriority && ability.form !== 'ULTIMATE' && this.ultimateReady(actor)) return { ok: false, reason: 'Ultimate đầy Rage có ưu tiên tại Natural Action' };
    return { ok: true };
  }
  selectTargets(actor, abilityId, requested) {
    const ability = this.kit(actor).abilities[abilityId];
    const choices = this.targetChoices(actor, abilityId);
    if (!choices.length) fail('No legal targets');
    if (['SELF', 'ALL', 'FIXED_SLOT'].includes(ability.target.shape)) return choices;
    if (!requested) fail('An explicit single-recipient decision is required');
    const selected = choices.find(u => u.id === requested);
    if (selected) return [selected];
    // A Taunt narrows the ordinary legal decision, but never makes an otherwise
    // invalid input legal. The UI and AI both see the narrowed pool beforehand.
    const ordinary = this.pool(actor, ability.target).find(u => u.id === requested);
    if (ordinary && choices.length === 1 && Object.values(choices[0].states).some(s => s.profile.targetConstraint)) return choices;
    fail('Invalid selected recipient');
  }
  lockTargets(targets) {
    // Retain supplied selection data, including coordinates, for independently
    // bound consuming owners. Entity data here does not authorize tracking.
    return { entityIds: targets.map(u => u.id), positions: targets.map(u => ({ side: u.side, slot: u.slot })) };
  }
  resolveTargets(actor, input, binding) {
    if (!['ENTITY', 'POSITION'].includes(binding)) fail('Unresolved executable target binding');
    if (binding === 'ENTITY') return input.entityIds.map(id => this.unit(id)).filter(u => this.valid(u));
    return input.positions.flatMap(position => {
      const occupants = this.units.filter(u => this.valid(u) && u.side === position.side && u.slot === position.slot);
      if (occupants.length > 1) fail('Ambiguous occupied Slot');
      return occupants;
    });
  }
  recipients(actor, targets, kind) { return kind === 'SELF' ? [actor] : kind === 'ALLIED_LEADER' ? [this.leader(actor.side)] : targets; }

  prepare() {
    if (this.outcome || this.active) return;
    const eligible = this.units.filter(u => u.side === this.side && this.valid(u)).sort((a, b) => a.slot - b.slot);
    if (!eligible.length) { this.checkBattleEnd(); return; }
    const actor = eligible.find(u => u.slot > this.pointer[this.side]) ?? eligible[0];
    actor.waiting = false;
    actor.opportunity++; this.opportunities++;
    this.active = { actorId: actor.id, serial: actor.opportunity, blocked: actor.stunned };
    this.emit('OPPORTUNITY_BEGIN', { actorId: actor.id, opportunity: actor.opportunity, side: actor.side, slot: actor.slot });
    for (const [family, state] of Object.entries(actor.states)) {
      if (state.profile.clock !== 'OWNER_OPPORTUNITY_START') continue;
      const age = actor.opportunity - state.createdAt;
      if (age >= state.profile.laterOpportunities) {
        delete actor.states[family]; this.emit('STATE_EXPIRED', { actorId: actor.id, family, revision: state.revision, phase: 'OPPORTUNITY_START' });
      } else if (age === state.profile.tickAt && !state.ticked) {
        state.ticked = true;
        const amount = this.maxHp(actor) * state.profile.healRate;
        this.emit('PERIODIC_HEAL_CHECKPOINT', { actorId: actor.id, family, revision: state.revision, liveMaxHp: this.maxHp(actor), amount });
        // One common live amount, distinct legal recipients/receipts.
        for (const recipient of state.profile.recipients) for (const unit of this.recipients(actor, [], recipient)) this.heal(unit, amount, `state:${state.revision}`, actor.id);
      }
    }
    this.emit('COOLDOWN_CHECKPOINT', { actorId: actor.id, remaining: Math.max(0, actor.cdReadyAt - actor.opportunity) });
  }
  finishOpportunity(actor, completed) {
    if (this.outcome) { this.active = null; this.emit('OPPORTUNITY_TERMINATED', { actorId: actor.id }); return; }
    for (const [family, state] of Object.entries(actor.states)) {
      if (state.profile.clock === 'OWNER_OPPORTUNITY_END' && actor.opportunity - state.createdAt >= state.profile.laterOpportunities) {
        delete actor.states[family]; this.emit('STATE_EXPIRED', { actorId: actor.id, family, revision: state.revision, phase: 'OPPORTUNITY_END' });
      }
    }
    this.pointer[actor.side] = actor.slot;
    this.emit('OPPORTUNITY_END', { actorId: actor.id, completed });
    this.emit('TURN_BOUNDARY', { afterSide: actor.side });
    this.side = actor.side === 'A' ? 'B' : 'A'; this.active = null;
    this.checkBattleEnd();
    if (!this.outcome && this.opportunities >= NUMERIC_PROFILE.maxOpportunities) {
      this.outcome = 'DRAW'; this.emit('SANDBOX_LIMIT', { opportunities: this.opportunities });
    }
    this.prepare();
  }
  step(abilityId = null, targetId = null, requestId = `command-${this.commands.length + 1}`) {
    if (!textKey(requestId)) fail('Invalid request identity');
    const command = { type: 'STEP', abilityId, targetId, requestId };
    const prior = this.processed[requestId];
    if (prior) {
      if (JSON.stringify(prior.command) !== JSON.stringify(command)) fail('Request identity reused for different input');
      return clone(prior.result);
    }
    if (this.outcome || !this.active) fail('Battle has ended');
    const actor = this.unit(this.active.actorId);
    let targets = [];
    if (!this.active.blocked) {
      const legal = this.canUse(actor, abilityId);
      if (!legal.ok) fail(legal.reason);
      targets = this.selectTargets(actor, abilityId, targetId);
    }
    // All read-only validation is done before the accepted command commits.
    this.commands.push(clone(command));
    const fromSeq = this.trace.length;
    if (this.active.blocked) {
      actor.stunned = false; this.emit('CC_OPPORTUNITY_LOST', { actorId: actor.id });
      this.finishOpportunity(actor, false);
    } else {
      this.runAction(actor, abilityId, targets, { natural: true });
      this.finishOpportunity(actor, true);
    }
    const result = { fromSeq: fromSeq + 1, toSeq: this.trace.length, outcome: this.outcome };
    this.processed[requestId] = { command, result };
    return clone(result);
  }
  runAction(actor, abilityId, targets, invocation = {}) {
    if (!this.valid(actor) || this.outcome) return null;
    const ability = this.kit(actor).abilities[abilityId];
    const targetInput = clone(Array.isArray(targets) ? this.lockTargets(targets) : targets);
    // Admission retains coordinates/identity data once; no subsequent selection
    // or Taunt observation may replace this input. Each Damage owns its binding.
    targets = this.resolveTargets(actor, targetInput, ability.target.binding);
    const aeCost = invocation.waiveAE ? 0 : ability.ae;
    const rageCost = ability.form === 'ULTIMATE' ? NUMERIC_PROFILE.rageMax : 0;
    const hpCost = actor.hp * (ability.hpCostRate ?? 0);
    if (this.ae[actor.side] < aeCost || actor.rage < rageCost || actor.hp <= hpCost) fail('Required atomic Cost failed');
    const id = `action-${++this.actionSerial}`;
    this.ae[actor.side] -= aeCost; actor.rage -= rageCost; actor.hp -= hpCost;
    this.emit('COST_COMMITTED', { actionId: id, actorId: actor.id, ae: aeCost, rage: rageCost, hp: hpCost, waivedAE: !!invocation.waiveAE });
    const context = {
      id, rootId: invocation.rootId ?? id, parentId: invocation.parentId ?? null, actor, abilityId,
      natural: !!invocation.natural, targets: [...targets], targetInput, sourceSnapshot: this.stats(actor), actualDamage: {},
      targetSnapshots: Object.fromEntries(targetInput.entityIds.map(unitId => { const u = this.unit(unitId); return [u.id, { hp: u.hp, maxHp: this.maxHp(u) }]; })),
      thresholdSnapshots: Object.fromEntries(this.units.filter(u => this.valid(u) && u.side !== actor.side && this.kit(u).passive).map(u => [u.id, this.maxHp(u)])),
      directMultiplier: ability.hpCostRate !== undefined ? ability.paidDirectMultiplier ?? 1 : 1,
    };
    this.emit('ACTION_BEGIN', { actionId: id, rootId: context.rootId, parentId: context.parentId, actorId: actor.id, abilityId, natural: context.natural, targets: targets.map(u => u.id), targetLock: { binding: ability.target.binding, checkpoint: 'ACTION_TARGET_CONTEXT', ...(ability.target.binding === 'POSITION' ? { positions: targetInput.positions } : { entityIds: targetInput.entityIds }) }, sourceSnapshot: context.sourceSnapshot, thresholdSnapshots: context.thresholdSnapshots });
    this.observeMutations([{ field: 'SIDE_AE', side: actor.side }, { field: 'HP', actorId: actor.id }].filter(m => m.field === 'SIDE_AE' ? aeCost > 0 : hpCost > 0), invocation.automatic ? actor.id : null);
    for (const effect of ability.effects) {
      if (!this.valid(actor) || this.outcome) break;
      if (effect.op === 'DAMAGE') this.damage(context, effect);
      else if (effect.op === 'HEAL') for (const unit of this.recipients(actor, targets, effect.recipient)) this.heal(unit, this.formula(effect.amount, context.sourceSnapshot), id, actor.id);
      else if (effect.op === 'MAX_HP') for (const unit of this.recipients(actor, targets, effect.recipient)) this.changeMaxHp(unit, effect.source, this.formula(effect.amount, context.sourceSnapshot), id);
      else if (effect.op === 'STATE') {
        const old = actor.states[effect.family];
        actor.states[effect.family] = { profile: clone(this.kit(actor).states[effect.family]), createdAt: actor.opportunity, revision: ++this.windowSerial, ticked: false };
        this.emit(old ? 'STATE_REFRESHED' : 'STATE_APPLIED', { actionId: id, actorId: actor.id, family: effect.family, revision: this.windowSerial });
      } else if (effect.op === 'COOLDOWN') {
        actor.cdReadyAt = actor.opportunity + effect.laterOpportunities;
        this.emit('COOLDOWN_WRITTEN', { actionId: id, actorId: actor.id, remaining: effect.laterOpportunities });
      } else if (effect.op === 'STUN') {
        // Skill2 status stays on the resolved hit recipient, including a miss;
        // death after Damage skips status rather than querying a replacement.
        for (const unit of context.damageTargets ?? targets) {
          if (!this.valid(unit)) { this.emit('STUN_TARGET_INVALID', { actionId: id, actorId: unit.id }); continue; }
          const value = this.random(`${id}:stun:${unit.id}`);
          const success = value < effect.chance;
          if (success) unit.stunned = true;
          this.emit('STUN_RESULT', { actionId: id, actorId: unit.id, success, value, chance: effect.chance });
        }
      } else if (effect.op === 'CHILD') {
        const child = this.kit(actor).abilities[effect.ability];
        const childInput = child.target.relation === 'SELF' ? this.lockTargets([actor]) : targetInput;
        // Inherit supplied selection data, never the parent's binding exception.
        // An empty coordinate remains an admitted Slot attack with a MISS result.
        if (child.target.binding === 'POSITION' || this.resolveTargets(actor, childInput, child.target.binding).length) this.runAction(actor, effect.ability, childInput, { rootId: context.rootId, parentId: id, waiveAE: effect.waiveAE });
        else this.emit('CHILD_TARGET_INVALID', { actionId: id, child: effect.ability });
      }
    }
    if (this.outcome) { this.emit('ACTION_TERMINATED', { actionId: id, reason: 'BATTLE_TERMINAL' }); return context; }
    this.emit('ACTION_DIRECT_EFFECTS_COMPLETE', { actionId: id });
    for (const [unitId, basis] of Object.entries(context.thresholdSnapshots)) {
      const unit = this.unit(unitId), passive = this.kit(unit).passive, actual = context.actualDamage[unitId] ?? 0;
      const qualified = actual > passive.threshold * basis && this.valid(unit);
      this.emit('PASSIVE_THRESHOLD', { actionId: id, actorId: unit.id, actualHpDamage: actual, actionStartMaxHp: basis, strictThreshold: passive.threshold * basis, qualified });
      if (qualified) this.changeMaxHp(unit, 'passive', this.maxHp(unit) * passive.gainRate, id);
    }
    this.emit('ACTION_COMPLETED', { actionId: id, actorId: actor.id, natural: context.natural });
    if (context.natural && this.valid(actor) && !this.outcome) {
      this.grantAE(actor.side, AE_BY_CLASS[actor.class], id, 'AE_ACTION_REGEN_BY_CLASS');
      const before = actor.rage; actor.rage = Math.min(NUMERIC_PROFILE.rageMax, actor.rage + NUMERIC_PROFILE.ragePerCompletedRoot);
      this.emit('RAGE_GRANTED', { actionId: id, actorId: actor.id, amount: actor.rage - before, profile: 'EXPERIMENTAL_COMPLETED_ROOT' });
      actor.waiting = true;
      this.observeAutomatic(actor, 'OWN_NATURAL_COMPLETION');
    }
    return context;
  }

  damage(context, effect) {
    if (!['ENTITY', 'POSITION'].includes(effect.binding) || effect.recipientCheckpoint !== 'PRE_DAMAGE' || effect.emptyPolicy !== 'MISS' || effect.invalidPolicy !== 'SKIP') fail('Unresolved executable Damage target plan');
    const ability = this.kit(context.actor).abilities[context.abilityId];
    const legal = this.pool(context.actor, ability.target);
    const resolved = this.resolveTargets(context.actor, context.targetInput, effect.binding).filter(u => legal.includes(u));
    // One occupant read at PRE_DAMAGE, then freeze recipients through commit.
    // Do not invoke selection/Taunt again or query between typed components.
    context.damageTargets = resolved;
    this.emit('DAMAGE_TARGETS_RESOLVED', { actionId: context.id, binding: effect.binding, checkpoint: effect.recipientCheckpoint, ...(effect.binding === 'POSITION' ? { positions: context.targetInput.positions } : { entityIds: context.targetInput.entityIds }), targets: resolved.map(u => u.id) });
    if (!resolved.length) this.emit('TARGET_MISSED', { actionId: context.id, reason: effect.binding === 'POSITION' ? 'NO_LEGAL_SLOT_OCCUPANT' : 'LOCKED_ENTITY_INVALID' });
    const plans = [];
    for (const unit of resolved) {
      if (!this.valid(unit)) continue;
      const hitValue = this.options.hitChance === 1 ? null : this.random(`${context.id}:hit:${unit.id}`);
      if (hitValue !== null && hitValue >= this.options.hitChance) {
        this.emit('HIT_MISSED', { actionId: context.id, actorId: unit.id, value: hitValue }); continue;
      }
      // Explicit Entity threshold snapshots retain their Action context; Slot
      // attacks snapshot the occupant at this Damage group's resolution point.
      const targetSnapshot = effect.binding === 'ENTITY' ? context.targetSnapshots[unit.id] : { hp: unit.hp, maxHp: this.maxHp(unit) };
      const conversion = effect.convertToTrueBelowTargetHp !== undefined && targetSnapshot.hp / targetSnapshot.maxHp < effect.convertToTrueBelowTargetHp;
      const counter = matchup(context.actor, unit, this.options), stats = this.stats(unit);
      const components = effect.components.map(component => {
        const type = conversion ? 'TRUE' : component.type;
        const raw = this.formula(component.amount, context.sourceSnapshot);
        const armor = type === 'PHYSICAL' ? stats.arm : type === 'WILL' ? stats.res : 0;
        const mitigation = type === 'TRUE' ? 1 : NUMERIC_PROFILE.mitigationConstant / (NUMERIC_PROFILE.mitigationConstant + armor);
        const amount = raw * counter.multiplier * mitigation * context.directMultiplier;
        return { type, raw, armor, mitigation, finalMultiplier: context.directMultiplier, finalDamage: amount };
      });
      const total = components.reduce((sum, c) => sum + c.finalDamage, 0);
      const shield = Math.min(unit.shield, total), actual = Math.min(unit.hp, Math.max(0, total - shield));
      plans.push({ unit, components, total, shield, actual, counter, targetSnapshot, convertedToTrue: conversion });
    }
    // One common read followed by one commit: no component/recipient can change
    // another's threshold, defense, Shield or HP allocation inside this batch.
    for (const p of plans) {
      p.unit.shield -= p.shield; p.unit.hp = Math.max(0, p.unit.hp - p.actual);
      context.actualDamage[p.unit.id] = (context.actualDamage[p.unit.id] ?? 0) + p.actual;
    }
    for (const p of plans) this.emit('DAMAGE_RECEIPT', {
      actionId: context.id, rootId: context.rootId, actorId: context.actor.id, targetId: p.unit.id,
      components: p.components.map(c => ({ ...c, actualHpDamage: p.total > 0 ? p.actual * c.finalDamage / p.total : 0, shieldAbsorbed: p.total > 0 ? p.shield * c.finalDamage / p.total : 0 })),
      actualHpDamage: p.actual, shieldAbsorbed: p.shield, overkill: Math.max(0, p.total - p.shield - p.actual),
      counter: p.counter, targetSnapshot: p.targetSnapshot, convertedToTrue: p.convertedToTrue,
    });
    for (const p of plans) if (p.unit.hp <= 0) this.lifecycle(p.unit, 'HP_ZERO', context.id);
    this.checkBattleEnd();
    this.observeMutations(plans.filter(p => p.actual > 0).map(p => ({ field: 'HP', actorId: p.unit.id })));
  }
  heal(unit, requested, cause, origin = null) {
    const actual = this.valid(unit) ? Math.min(requested, Math.max(0, this.maxHp(unit) - unit.hp)) : 0;
    unit.hp += actual;
    this.emit('HEAL_RECEIPT', { cause, actorId: unit.id, requested, actual, overheal: this.valid(unit) ? requested - actual : 0, valid: this.valid(unit) });
    if (actual > 0) this.observeMutations([{ field: 'HP', actorId: unit.id }], origin);
  }
  changeMaxHp(unit, source, gain, cause, remove = false) {
    const before = this.maxHp(unit);
    if (remove) delete unit.maxHpContributions[source];
    else unit.maxHpContributions[source] = (unit.maxHpContributions[source] ?? 0) + gain;
    const after = this.maxHp(unit), oldHp = unit.hp;
    unit.hp = Math.min(unit.hp, after);
    this.emit('MAX_HP_RECONCILED', { cause, actorId: unit.id, source, before, after, hpBefore: oldHp, hpAfter: unit.hp, removed: remove });
    if (before !== after) this.observeMutations([{ field: 'MAX_HP', actorId: unit.id }]);
  }
  lifecycle(unit, cause, actionId) {
    // No recovery adapter is admitted in this scenario. HP_ZERO first removes
    // its declared source; confirmed death is a separate terminal checkpoint.
    unit.alive = false; unit.present = false; unit.waiting = false;
    this.emit(cause, { actorId: unit.id, actionId });
    if (this.kit(unit).passive?.reset.includes(cause)) this.changeMaxHp(unit, 'passive', 0, cause, true);
    unit.states = {}; unit.stunned = false; unit.cdReadyAt = 0;
    this.emit('DEATH_CONFIRMED', { actorId: unit.id, actionId, recoveryProfile: 'NONE_IN_SANDBOX' });
  }
  grantAE(side, requested, cause, source) {
    const before = this.ae[side]; this.ae[side] = Math.min(NUMERIC_PROFILE.aeCap, before + requested);
    this.emit('AE_GRANTED', { cause, side, requested, actual: this.ae[side] - before, source, current: this.ae[side] });
    if (this.ae[side] !== before) this.observeMutations([{ field: 'SIDE_AE', side }]);
  }
  observeMutations(mutations, origin = null) {
    if (!mutations.length || this.observing || this.outcome) return;
    this.observing = true;
    try {
      const eligible = this.units.filter(u => u.id !== origin && this.kit(u).automatic && u.waiting && this.valid(u) && mutations.some(m => m.field === 'SIDE_AE' ? m.side === u.side : m.actorId === u.id));
      // Constructor rejects shared-pool contention; disjoint observers do not
      // acquire semantic priority from iteration order.
      for (const unit of eligible) this.observeAutomatic(unit, 'INDEPENDENT_COMMIT');
    } finally { this.observing = false; }
  }
  observeAutomatic(unit, cause) {
    const profile = this.kit(unit).automatic;
    if (!profile || !unit.waiting || !this.valid(unit) || this.outcome) return;
    const legal = unit.hp >= profile.minHpRatio * this.maxHp(unit) && unit.opportunity >= unit.cdReadyAt && this.ae[unit.side] >= profile.ae;
    this.emit('AUTOMATIC_PREDICATE', { actorId: unit.id, cause, hp: unit.hp, maxHp: this.maxHp(unit), ae: this.ae[unit.side], cd: Math.max(0, unit.cdReadyAt - unit.opportunity), legal });
    if (legal) this.runAction(unit, profile.ability, [unit], { automatic: true });
  }
  checkBattleEnd() {
    if (this.outcome) return;
    const dead = ['A', 'B'].filter(s => !this.valid(this.leader(s)) || !this.units.some(u => u.side === s && this.valid(u)));
    if (dead.length) {
      this.outcome = dead.length === 2 ? 'DRAW' : dead[0] === 'A' ? 'B' : 'A';
      for (const u of this.units) u.waiting = false;
      this.emit('BATTLE_ENDED', { winner: this.outcome, reason: 'TERMINAL_LEADER_DEATH_OR_EXTINCTION' });
    }
  }
  chooseAI() {
    if (!this.active || this.outcome) return null;
    if (this.active.blocked) return { abilityId: null, targetId: null };
    const actor = this.unit(this.active.actorId), abilities = this.kit(actor).abilities;
    const ids = this.ultimateReady(actor) ? ['ultimate'] : [...Object.keys(abilities).filter(id => id !== 'basic' && abilities[id].form !== 'ULTIMATE' && abilities[id].form !== 'AUTOMATIC'), 'basic'];
    // Explicit sandbox AI policy: emergency self-heal, ally-heal when injured,
    // otherwise first payable damaging skill, then Basic. Target ties use seed.
    const legal = ids.filter(id => this.canUse(actor, id).ok);
    let id = legal.find(id => {
      const a = abilities[id];
      if (a.effects.some(e => e.op === 'HEAL')) return this.targetChoices(actor, id).some(u => u.hp / this.maxHp(u) < .65);
      return true;
    }) ?? legal.at(-1);
    if (!id) fail('No playable AI action');
    const choices = this.targetChoices(actor, id);
    if (abilities[id].target.shape !== 'SELECTABLE_SINGLE') return { abilityId: id, targetId: null };
    const ratios = choices.map(u => u.hp / this.maxHp(u)), lowest = Math.min(...ratios);
    const tied = choices.filter(u => Math.abs(u.hp / this.maxHp(u) - lowest) < EPS);
    // AI planning is read-only: stable seed hash, no combat RNG consumption.
    // The authored target-preference policy is separate from trigger priority.
    const index = (this.rngState ^ this.opportunities) >>> 0;
    return { abilityId: id, targetId: tied[index % tied.length].id };
  }
  exportReplay() { return { format: PROFILE_VERSION, sourceRef: SOURCE_REF, options: clone(this.options), unitSpecs: clone(this.specs), kits: clone(this.authoredKits), commands: clone(this.commands) }; }
  snapshot() { return clone({ units: this.units, ae: this.ae, active: this.active, outcome: this.outcome, pointer: this.pointer, side: this.side, rngState: this.rngState, drawSerial: this.drawSerial, opportunities: this.opportunities, actionSerial: this.actionSerial, windowSerial: this.windowSerial, trace: this.trace }); }
}

export function replay(data) {
  knownKeys(data, ['format', 'sourceRef', 'options', 'unitSpecs', 'kits', 'commands'], 'replay');
  if (data.format !== PROFILE_VERSION || data.sourceRef !== SOURCE_REF || !Array.isArray(data.commands) || data.commands.length > NUMERIC_PROFILE.maxOpportunities) fail('Unsupported replay version/length');
  if (JSON.stringify(data.kits) !== JSON.stringify(KITS)) fail('Unsupported modified kit definitions in replay');
  const battle = new Battle(data.options, data.unitSpecs, data.kits);
  for (const command of data.commands) {
    knownKeys(command, ['type', 'abilityId', 'targetId', 'requestId'], 'command');
    if (command.type !== 'STEP' || typeof command.requestId !== 'string') fail('Unsupported replay command');
    battle.step(command.abilityId, command.targetId, command.requestId);
  }
  return battle;
}
