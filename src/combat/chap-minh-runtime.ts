import { slotIndex } from '../engine.ts';
import { normalizeTagList } from '../data/tags.ts';
import { applyDamage, grantShield } from './apply-damage.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const CHAP_MINH_ID = 'huyen_vu_chap_minh';
const CHAP_MINH_LINK_REDUCTION = 0.30;
const CHAP_MINH_AOE_COLUMN_REDUCTION = 0.35;
const RULE_BYPASS_TAGS = new Set(['global-rule']);
const AOE_TAGS = new Set(['aoe', 'random-aoe']);

type ChapMinhStateCarrier = UnitToken & {
  _chapMinhLinkedSlots?: number[];
  _chapMinhAccumulated?: number;
  _chapMinhPhaseShiftUsed?: boolean;
  _chapMinhLostMaxHp?: number;
  _chapMinhRecoverPerTurn?: number;
};

const toFinite = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const isAliveChapMinh = (token: UnitToken | null | undefined): token is ChapMinhStateCarrier => (
  !!token && token.alive && token.id === CHAP_MINH_ID
);

const resolveCrossSlots = (centerSlot: number): number[] => {
  const row = Math.floor((centerSlot - 1) / 3);
  const col = (centerSlot - 1) % 3;
  const slots: number[] = [];
  const candidates = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ] as const;
  for (const [r, c] of candidates) {
    if (r < 0 || r > 2 || c < 0 || c > 2) continue;
    slots.push(r * 3 + c + 1);
  }
  return slots;
};

export function activateChapMinhLink(caster: UnitToken): void {
  if (!isAliveChapMinh(caster)) return;
  const slot = slotIndex(caster.side, caster.cx, caster.cy);
  caster._chapMinhLinkedSlots = resolveCrossSlots(slot);
  caster._chapMinhAccumulated = Math.max(0, toFinite(caster._chapMinhAccumulated, 0));
}

export function applyChapMinhActionEnd(game: SessionState | null | undefined, caster: UnitToken | null | undefined): void {
  if (!game || !isAliveChapMinh(caster)) return;
  const casterSlot = slotIndex(caster.side, caster.cx, caster.cy);
  const column = ((casterSlot - 1) % 3) + 1;
  const shieldAmount = Math.max(0, Math.floor((caster.hpMax ?? 0) * 0.15));
  if (shieldAmount <= 0) return;

  for (const token of game.tokens) {
    if (!token.alive || token.side !== caster.side) continue;
    const tokenColumn = ((slotIndex(token.side, token.cx, token.cy) - 1) % 3) + 1;
    if (tokenColumn !== column) continue;
    grantShield(token, shieldAmount);
  }
}

function extractNormalizedSkillTags(skill: unknown): string[] {
  if (!skill || typeof skill !== 'object') return [];
  const rawTags = (skill as { tags?: unknown }).tags;
  return normalizeTagList(Array.isArray(rawTags) ? rawTags : []);
}

function hasRuleBypassTag(skill: unknown): boolean {
  return extractNormalizedSkillTags(skill).some((tag) => RULE_BYPASS_TAGS.has(tag));
}

function inferAoEFromSkill(skill: unknown): boolean {
  return extractNormalizedSkillTags(skill).some((tag) => AOE_TAGS.has(tag));
}

function resolveMitigationRatio(
  target: UnitToken,
  attackerSkill: unknown,
  isAoE: boolean,
): { ratio: number; owner: ChapMinhStateCarrier | null } {
  let bestRatio = 0;
  let owner: ChapMinhStateCarrier | null = null;
  const bypassByRule = hasRuleBypassTag(attackerSkill);

  const candidate = (target._chapMinhLinkOwner as ChapMinhStateCarrier | undefined) ?? null;
  if (isAliveChapMinh(candidate) && candidate.side === target.side) {
    const slot = slotIndex(target.side, target.cx, target.cy);
    const inLink = Array.isArray(candidate._chapMinhLinkedSlots) && candidate._chapMinhLinkedSlots.includes(slot);
    const inColumn = (((slot - 1) % 3) + 1) === ((((slotIndex(candidate.side, candidate.cx, candidate.cy) - 1) % 3) + 1));
    if (inLink && !bypassByRule) {
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
  for (const token of game.tokens) {
    delete (token as UnitToken & { _chapMinhLinkOwner?: UnitToken })._chapMinhLinkOwner;
  }
  for (const owner of game.tokens) {
    if (!isAliveChapMinh(owner) || !Array.isArray(owner._chapMinhLinkedSlots)) continue;
    const ownerSlot = slotIndex(owner.side, owner.cx, owner.cy);
    const ownerColumn = ((ownerSlot - 1) % 3) + 1;
    for (const token of game.tokens) {
      if (!token.alive || token.side !== owner.side) continue;
      const tokenSlot = slotIndex(token.side, token.cx, token.cy);
      const tokenColumn = ((tokenSlot - 1) % 3) + 1;
      const inLink = owner._chapMinhLinkedSlots.includes(tokenSlot);
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
  const isAoE = !!options.isAoE || inferAoEFromSkill(options.skill);
  const { ratio, owner } = resolveMitigationRatio(target, options.skill, isAoE);
  if (ratio <= 0 || !owner) return { finalDamage: inputDamage, prevented: 0, owner: null };
  const reduced = Math.max(0, Math.floor(inputDamage * (1 - ratio)));
  return {
    finalDamage: reduced,
    prevented: Math.max(0, inputDamage - reduced),
    owner,
  };
}

export function applyChapMinhBacklash(owner: UnitToken | null | undefined): void {
  if (!isAliveChapMinh(owner)) return;
  const accumulated = Math.max(0, toFinite(owner._chapMinhAccumulated, 0));
  const threshold = Math.max(1, Math.floor((owner.hpMax ?? 0) * 0.7));
  if (accumulated <= threshold) return;

  const initial = accumulated * 0.7;
  const postSelfReduction = initial * 0.7;
  const arm = Math.max(0, toFinite(owner.arm, 0));
  const res = Math.max(0, toFinite(owner.res, 0));
  const defenseMultiplier = 0.5 * (100 / (100 + arm)) + 0.5 * (100 / (100 + res));
  const finalDamage = Math.max(1, Math.floor(postSelfReduction * defenseMultiplier));
  applyDamage(owner, finalDamage);
  owner._chapMinhAccumulated = 0;
}

export function recordChapMinhPreventedDamage(owner: UnitToken | null | undefined, prevented: number): void {
  if (!isAliveChapMinh(owner) || prevented <= 0) return;
  owner._chapMinhAccumulated = Math.max(0, toFinite(owner._chapMinhAccumulated, 0) + prevented);
  applyChapMinhBacklash(owner);
}

export function applyChapMinhPhaseShift(unit: UnitToken | null | undefined): void {
  if (!isAliveChapMinh(unit)) return;
  if (unit._chapMinhPhaseShiftUsed) return;
  const hpMax = Math.max(1, Math.floor(toFinite(unit.hpMax, 1)));
  const hp = Math.max(0, Math.floor(toFinite(unit.hp, hpMax)));
  if (hp > Math.floor(hpMax * 0.1)) return;

  const lost = Math.max(1, Math.floor(hpMax * 0.5));
  const nextHpMax = Math.max(1, hpMax - lost);
  unit.hpMax = nextHpMax;
  unit.hp = nextHpMax;
  unit._chapMinhLostMaxHp = lost;
  unit._chapMinhRecoverPerTurn = Math.max(1, Math.floor(lost * 0.2));
  unit._chapMinhPhaseShiftUsed = true;
}

export function recoverChapMinhMaxHpPerTurn(unit: UnitToken | null | undefined): void {
  if (!isAliveChapMinh(unit) || !unit._chapMinhPhaseShiftUsed) return;
  const lostRemain = Math.max(0, Math.floor(toFinite(unit._chapMinhLostMaxHp, 0)));
  if (lostRemain <= 0) return;
  const step = Math.max(1, Math.floor(toFinite(unit._chapMinhRecoverPerTurn, 0)));
  const gain = Math.min(lostRemain, step);
  unit.hpMax = Math.max(1, Math.floor(toFinite(unit.hpMax, 1)) + gain);
  unit._chapMinhLostMaxHp = Math.max(0, lostRemain - gain);
}
