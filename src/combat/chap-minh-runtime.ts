import { gainFury } from '../utils/fury.ts';
import {
  AOE_TARGET_TAG_IDS,
  RULE_BYPASS_TAG_IDS,
  hasAnyTag,
  normalizeTagList,
} from '../data/tags.ts';
import { grantShield } from './apply-damage.ts';
import { commitHpMutation, createHpZeroCandidate, createNaturalAction, markDeathPrevented, resolveHpLoss, resolveMaxHpMutation, resolveSourceAttribution, withActionExecution } from './kernel/index.ts';
import { toFiniteNumber, toFloorInt } from './number-utils.ts';
import { bucketTokensByActualSide, forEachPartitionToken } from './token-side-utils.ts';
import { createCrossSlotLookup, readTokenSlotAndColumn } from './board-position-utils.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const CHAP_MINH_ID = 'huyen_vu_chap_minh';
const CHAP_MINH_LINK_REDUCTION = 0.30;
const CHAP_MINH_AOE_COLUMN_REDUCTION = 0.35;
const CHAP_MINH_ACTION_END_FURY_GAIN = 2;
const CHAP_MINH_BACKLASH_SELF_REDUCTION = 0.3;
type ChapMinhStateCarrier = UnitToken & {
  _chapMinhLinkedSlots?: number[];
  _chapMinhLinkedSlotLookup?: Record<number, true>;
  _chapMinhAccumulated?: number;
  _chapMinhPhaseShiftUsed?: boolean;
  _chapMinhLostMaxHp?: number;
  _chapMinhRecoverPerTurn?: number;
};

const isAliveChapMinh = (token: UnitToken | null | undefined): token is ChapMinhStateCarrier => (
  !!token && token.alive && token.id === CHAP_MINH_ID
);

const isChapMinh = (token: UnitToken | null | undefined): token is ChapMinhStateCarrier => (
  !!token && token.id === CHAP_MINH_ID
);

function hasLookupEntries(lookup: Record<number, true> | null | undefined): boolean {
  if (!lookup) return false;
  for (const _slot in lookup) {
    return true;
  }
  return false;
}

function buildLinkedLookup(slots: ReadonlyArray<number> | null | undefined): Record<number, true> {
  const lookup: Record<number, true> = {};
  if (!Array.isArray(slots)) return lookup;
  for (const linkedSlot of slots) {
    lookup[linkedSlot] = true;
  }
  return lookup;
}

export function activateChapMinhLink(caster: UnitToken): void {
  if (!isAliveChapMinh(caster)) return;
  const { slot } = readTokenSlotAndColumn(caster);
  const linkedSlots = [...createCrossSlotLookup(slot)];
  caster._chapMinhLinkedSlots = linkedSlots;
  caster._chapMinhLinkedSlotLookup = buildLinkedLookup(linkedSlots);
  caster._chapMinhAccumulated = Math.max(0, toFiniteNumber(caster._chapMinhAccumulated, 0));
}

export function applyChapMinhActionEnd(game: SessionState | null | undefined, caster: UnitToken | null | undefined): void {
  if (!game || !isAliveChapMinh(caster)) return;
  gainFury(caster, { amount: CHAP_MINH_ACTION_END_FURY_GAIN, type: 'generic' });
  const { column } = readTokenSlotAndColumn(caster);
  const shieldAmount = Math.max(0, Math.floor((caster.hpMax ?? 0) * 0.15));
  if (shieldAmount <= 0) return;

  forEachPartitionToken(game.tokens, caster.side, 'ally', (token) => {
    const { column: tokenColumn } = readTokenSlotAndColumn(token);
    if (tokenColumn !== column) return;
    grantShield(token, shieldAmount, { durationTurns: 1 });
  });
}

function extractNormalizedSkillTags(skill: unknown): string[] {
  if (!skill || typeof skill !== 'object') return [];
  const rawTags = (skill as { tags?: unknown }).tags;
  return normalizeTagList(Array.isArray(rawTags) ? rawTags : []);
}

function classifyMitigationSkill(skill: unknown): { hasRuleBypassTag: boolean; isAoE: boolean } {
  const tags = extractNormalizedSkillTags(skill);
  return {
    hasRuleBypassTag: hasAnyTag(tags, RULE_BYPASS_TAG_IDS),
    isAoE: hasAnyTag(tags, AOE_TARGET_TAG_IDS),
  };
}

function resolveMitigationRatio(
  target: UnitToken,
  hasRuleBypassTag: boolean,
  isAoE: boolean,
): { ratio: number; owner: ChapMinhStateCarrier | null } {
  let bestRatio = 0;
  let owner: ChapMinhStateCarrier | null = null;

  const candidate = (target._chapMinhLinkOwner as ChapMinhStateCarrier | undefined) ?? null;
  if (isAliveChapMinh(candidate) && candidate.side === target.side) {
    const { slot, column: tokenColumn } = readTokenSlotAndColumn(target);
    const { column: ownerColumn } = readTokenSlotAndColumn(candidate);
    const linkedLookup = candidate._chapMinhLinkedSlotLookup as Record<number, true> | undefined;
    const inLink = linkedLookup
      ? linkedLookup[slot] === true
      : (Array.isArray(candidate._chapMinhLinkedSlots) && candidate._chapMinhLinkedSlots.includes(slot));
    const inColumn = tokenColumn === ownerColumn;
    if (inLink && !hasRuleBypassTag) {
      bestRatio += CHAP_MINH_LINK_REDUCTION;
      owner = candidate;
    }
    if (inColumn && isAoE) {
      bestRatio += CHAP_MINH_AOE_COLUMN_REDUCTION;
      owner = owner ?? candidate;
    }
  }

  return { ratio: Math.max(0, Math.min(0.95, bestRatio)), owner };
}

export function refreshChapMinhOwnership(game: SessionState | null | undefined): void {
  if (!game) return;
  let hasAliveOwner = false;
  for (const token of game.tokens) {
    if (!isAliveChapMinh(token)) continue;
    if (!Array.isArray(token._chapMinhLinkedSlots) || token._chapMinhLinkedSlots.length === 0) continue;
    const linkedLookup = token._chapMinhLinkedSlotLookup as Record<number, true> | undefined;
    if (!hasLookupEntries(linkedLookup)) {
      token._chapMinhLinkedSlotLookup = buildLinkedLookup(token._chapMinhLinkedSlots);
    }
    hasAliveOwner = true;
  }

  for (const token of game.tokens) {
    if ((token as UnitToken & { _chapMinhLinkOwner?: UnitToken })._chapMinhLinkOwner) {
      delete (token as UnitToken & { _chapMinhLinkOwner?: UnitToken })._chapMinhLinkOwner;
    }
  }
  if (!hasAliveOwner) return;

  const groupedAliveBySide = bucketTokensByActualSide(game.tokens);

  for (const owner of game.tokens) {
    const linkedLookup = (owner as ChapMinhStateCarrier)._chapMinhLinkedSlotLookup as Record<number, true> | undefined;
    if (!isAliveChapMinh(owner) || !hasLookupEntries(linkedLookup)) continue;
    const safeLookup = linkedLookup as Record<number, true>;
    const { column: ownerColumn } = readTokenSlotAndColumn(owner);
    const sideTokens = owner.side === 'ally' ? groupedAliveBySide.ally : groupedAliveBySide.enemy;
    for (const token of sideTokens) {
      const { slot: tokenSlot, column: tokenColumn } = readTokenSlotAndColumn(token);
      const inLink = safeLookup[tokenSlot] === true;
      const inColumn = tokenColumn === ownerColumn;
      if (!inLink && !inColumn) continue;
      (token as UnitToken & { _chapMinhLinkOwner?: UnitToken })._chapMinhLinkOwner = owner;
    }
  }
}

export function applyChapMinhMitigation(
  target: UnitToken,
  incomingDamage: number,
  options: { isAoE?: boolean; skill?: unknown },
): { finalDamage: number; prevented: number; owner: ChapMinhStateCarrier | null } {
  const inputDamage = Math.max(0, Math.floor(incomingDamage));
  if (inputDamage <= 0) return { finalDamage: 0, prevented: 0, owner: null };
  const skillFlags = classifyMitigationSkill(options.skill);
  const isAoE = !!options.isAoE || skillFlags.isAoE;
  const { ratio, owner } = resolveMitigationRatio(target, skillFlags.hasRuleBypassTag, isAoE);
  if (ratio <= 0 || !owner) return { finalDamage: inputDamage, prevented: 0, owner: null };
  const reduced = Math.max(0, Math.floor(inputDamage * (1 - ratio)));
  return {
    finalDamage: reduced,
    prevented: Math.max(0, inputDamage - reduced),
    owner,
  };
}

export function applyChapMinhBacklash(owner: UnitToken | null | undefined, game?: SessionState | null): void {
  if (!isAliveChapMinh(owner)) return;
  const accumulated = Math.max(0, toFiniteNumber(owner._chapMinhAccumulated, 0));
  const threshold = Math.max(1, Math.floor((owner.hpMax ?? 0) * 0.7));
  if (accumulated <= threshold) return;

  const backlashBase = Math.max(1, Math.floor(accumulated * (1 - CHAP_MINH_BACKLASH_SELF_REDUCTION)));
  const arm = Math.max(0, toFiniteNumber(owner.arm, 0));
  const res = Math.max(0, toFiniteNumber(owner.res, 0));
  const defenseMultiplier = 0.5 * (100 / (100 + arm)) + 0.5 * (100 / (100 + res));
  const finalDamage = Math.max(1, Math.floor(backlashBase * defenseMultiplier));
  const source = resolveSourceAttribution({ immediateSource: owner, controller: owner, trueSelf: owner.trueSelfId ?? null, owner });
  if (game) {
    const identity = createNaturalAction(game, 'chap-minh-backlash');
    withActionExecution(game, identity, () => {
      const mutation = resolveHpLoss(owner, finalDamage, 'self-damage', source, true);
      commitHpMutation(game, owner, mutation, identity);
      if (mutation.hpBefore > 0 && mutation.hpAfter === 0) createHpZeroCandidate(game, owner, identity, source, 'self-damage', mutation.effectiveAmount);
    });
  } else commitHpMutation(null, owner, resolveHpLoss(owner, finalDamage, 'self-damage', source, true));
  owner._chapMinhAccumulated = 0;
}

export function recordChapMinhPreventedDamage(owner: UnitToken | null | undefined, prevented: number, game?: SessionState | null): void {
  if (!isAliveChapMinh(owner) || prevented <= 0) return;
  owner._chapMinhAccumulated = Math.max(0, toFiniteNumber(owner._chapMinhAccumulated, 0) + prevented);
  applyChapMinhBacklash(owner, game);
}

export function applyChapMinhPhaseShift(unit: UnitToken | null | undefined): void {
  if (!isChapMinh(unit)) return;
  if (unit._chapMinhPhaseShiftUsed) return;
  const hpMax = Math.max(1, toFloorInt(unit.hpMax, 1));
  const hp = Math.max(0, toFloorInt(unit.hp, hpMax));
  if (hp > Math.floor(hpMax * 0.1)) return;

  const lost = Math.max(1, Math.floor(hpMax * 0.5));
  const nextHpMax = Math.max(1, hpMax - lost);
  const source = resolveSourceAttribution({ immediateSource: unit, controller: unit, trueSelf: unit.trueSelfId ?? null, owner: unit });
  commitHpMutation(null, unit, resolveMaxHpMutation(unit, nextHpMax, 'set-value', 'set-full', source));
  markDeathPrevented(unit, nextHpMax);
  unit._chapMinhLostMaxHp = lost;
  unit._chapMinhRecoverPerTurn = Math.max(1, Math.floor(lost * 0.2));
  unit._chapMinhPhaseShiftUsed = true;
}

export function recoverChapMinhMaxHpPerTurn(unit: UnitToken | null | undefined): void {
  if (!isAliveChapMinh(unit) || !unit._chapMinhPhaseShiftUsed) return;
  const lostRemain = Math.max(0, toFloorInt(unit._chapMinhLostMaxHp, 0));
  if (lostRemain <= 0) return;
  const step = Math.max(1, toFloorInt(unit._chapMinhRecoverPerTurn, 0));
  const gain = Math.min(lostRemain, step);
  unit.hpMax = Math.max(1, toFloorInt(unit.hpMax, 1) + gain);
  unit._chapMinhLostMaxHp = Math.max(0, lostRemain - gain);
}
