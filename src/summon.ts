// v0.7.3
import { slotToCell, cellReserved } from './engine.ts';
import { asSessionWithVfx, vfxAddSpawn } from './vfx.ts';
import { getUnitArt } from './art.ts';
import { kitSupportsSummon } from './utils/kit.ts';
import { prepareUnitForPassives, applyOnSpawnEffects } from './passives.ts';

import type { PassiveKitDefinition, SessionState } from '@shared-types/combat';
import type { ActionChainEntry, Side, SummonRequest, UnitToken } from '@shared-types/units';
import type { SequentialTurnState, TurnContext, TurnHooks, TurnSnapshot } from '@shared-types/turn-order';

type SummonChainHooks = Partial<
  Pick<TurnHooks, 'allocIid' | 'doActionOrSkip' | 'performUlt' | 'getTurnOrderIndex'>
>;

const DEFAULT_SUMMON_UNIT: NonNullable<SummonRequest['unit']> = {
  id: 'creep',
  name: 'Creep',
  color: '#ffd27d',
};

const tokensAlive = (Game: SessionState): UnitToken[] =>
  Game.tokens.filter((t): t is UnitToken => t.alive);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isPassiveKit = (value: unknown): value is PassiveKitDefinition => {
  if (!isRecord(value)) return false;
  const passives = (value as { passives?: unknown }).passives;
  return passives == null || Array.isArray(passives);
};

const getKitDefinition = (metaEntry: unknown): PassiveKitDefinition | null => {
  if (!isRecord(metaEntry)) return null;
  const kitCandidate = 'kit' in metaEntry ? (metaEntry.kit as unknown) : null;
  return isPassiveKit(kitCandidate) ? kitCandidate : null;
};

const isSequentialTurn = (turn: TurnSnapshot | null | undefined): turn is SequentialTurnState =>
  !!turn && Array.isArray((turn as SequentialTurnState).order);

const getTurnSnapshotInfo = (turn: TurnSnapshot | null | undefined): { orderLength: number | null; cycle: number } => {
  if (!turn) return { orderLength: null, cycle: 0 };
  const cycle = Number.isFinite(turn.cycle) ? turn.cycle : 0;
  if (isSequentialTurn(turn)) {
    return { orderLength: turn.order.length, cycle };
  }
  return { orderLength: null, cycle };
};

// en-queue các yêu cầu “Immediate” trong lúc 1 unit đang hành động
// req: { by?:unitId, side:'ally'|'enemy', slot:1..9, unit:{...} }
export function enqueueImmediate(Game: SessionState, req: SummonRequest): boolean {
  if (req.by){
    const metaEntry =
      typeof Game.meta?.get === 'function' ? Game.meta.get(req.by) : null;
    const record = metaEntry && typeof metaEntry === 'object' ? metaEntry as Record<string, unknown> : null;
    const ok = Boolean(
      record
        && record['class'] === 'Summoner'
        && kitSupportsSummon(record),
    );
    if (!ok) return false;
  }
  const { cx, cy } = slotToCell(req.side, req.slot);
  if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) return false;

  const entry: ActionChainEntry = {
    side: req.side,
    slot: req.slot,
    unit: req.unit ?? DEFAULT_SUMMON_UNIT,
  };
  Game.actionChain.push(entry);
  return true;
}

// xử lý toàn bộ chain của 1 phe sau khi actor vừa hành động
// trả về slot lớn nhất đã hành động trong chain để tiện logging
export function processActionChain(
  Game: SessionState,
  side: Side,
  baseSlot: number | null | undefined,
  hooks: SummonChainHooks = {},
): number | null {
  const list = Game.actionChain.filter((x): x is ActionChainEntry => x.side === side);
  if (!list.length) return baseSlot ?? null;

  list.sort((a, b) => a.slot - b.slot);

  let maxSlot = baseSlot ?? 0;
  for (const item of list){
    const { cx, cy } = slotToCell(side, item.slot);
    if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) continue;

    const extra = item.unit ?? {};
    const art = getUnitArt(extra.id ?? 'minion');
    const newToken: UnitToken = {
      id: (extra.id ?? 'creep') as string,
      name: extra.name ?? 'Creep',
      color: extra.color ?? art?.palette.primary ?? '#ffd27d',
      cx,
      cy,
      side,
      alive: true,
      isMinion: Boolean(extra.isMinion),
      ownerIid: extra.ownerIid,
      bornSerial: extra.bornSerial,
      ttlTurns: extra.ttlTurns,
      hpMax: extra.hpMax,
      hp: extra.hp,
      atk: extra.atk,
      art,
      skinKey: art?.skinKey ?? null,
      iid: extra.iid,
    };
    Game.tokens.push(newToken);
      try {
        const sessionVfx = asSessionWithVfx(Game);
        if (sessionVfx) {
          vfxAddSpawn(sessionVfx, cx, cy, side);
        }
      } catch (_err) {
        // bỏ qua lỗi hiệu ứng
      }

    const spawned = Game.tokens[Game.tokens.length - 1] ?? null;
    if (spawned){
      const metaEntry =
        extra.id && typeof Game.meta?.get === 'function'
          ? Game.meta.get(extra.id)
          : null;
      const kit = getKitDefinition(metaEntry);
      const onSpawnConfig = kit?.onSpawn && isRecord(kit.onSpawn) ? kit.onSpawn : null;
      prepareUnitForPassives(spawned);
      applyOnSpawnEffects(Game, spawned, onSpawnConfig ?? undefined);
      spawned.iid = hooks.allocIid?.() ?? spawned.iid ?? 0;
    }

    const creep = Game.tokens.find((t): t is UnitToken => t.alive && t.side === side && t.cx === cx && t.cy === cy) ?? null;
    if (creep){
      const { orderLength, cycle } = getTurnSnapshotInfo(Game.turn);;
      const turnContext: TurnContext = {
        side,
        slot: item.slot,
        orderIndex: hooks.getTurnOrderIndex?.(Game, side, item.slot) ?? -1,
        orderLength,
        cycle,
      };
      hooks.doActionOrSkip?.(Game, creep, { performUlt: hooks.performUlt, turnContext });
    }

    if (item.slot > maxSlot) maxSlot = item.slot;
  }

  Game.actionChain = Game.actionChain.filter((x) => x.side !== side);
  return maxSlot;
}