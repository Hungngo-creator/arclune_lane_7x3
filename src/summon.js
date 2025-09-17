// v0.7.3
import { slotToCell, cellReserved } from './engine.js';
import { vfxAddSpawn } from './vfx.js';
import { getUnitArt } from './art.js';
// local helper
const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

// en-queue các yêu cầu “Immediate” trong lúc 1 unit đang hành động
// req: { by?:unitId, side:'ally'|'enemy', slot:1..9, unit:{...} }
export function enqueueImmediate(Game, req){
  if (req.by){
    const mm = Game.meta.get(req.by);
    const ok = !!(mm && mm.class === 'Summoner' && mm.kit?.ult?.type === 'summon');
    if (!ok) return false;
  }
  const { cx, cy } = slotToCell(req.side, req.slot);
  if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) return false;

  Game.actionChain.push({
    side: req.side,
    slot: req.slot,
    unit: req.unit || { id:'creep', name:'Creep', color:'#ffd27d' }
  });
  return true;
}

// xử lý toàn bộ chain của 1 phe sau khi actor vừa hành động
// trả về slot lớn nhất đã hành động trong chain (để cập nhật turn.last)
export function processActionChain(Game, side, baseSlot, hooks){
  const list = Game.actionChain.filter(x => x.side === side);
  if (!list.length) return baseSlot ?? null;

  list.sort((a,b)=> a.slot - b.slot);

  let maxSlot = baseSlot ?? 0;
  for (const item of list){
    const { cx, cy } = slotToCell(side, item.slot);
    if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) continue;

    // spawn creep immediate
    const extra = item.unit || {};
    const art = getUnitArt(extra.id || 'minion');
    Game.tokens.push({
      id: extra.id || 'creep', name: extra.name || 'Creep',
      color: extra.color || art?.palette?.primary || '#ffd27d',
      cx, cy, side, alive:true,
      isMinion: !!extra.isMinion,
      ownerIid: extra.ownerIid,
      bornSerial: extra.bornSerial,
      ttlTurns: extra.ttlTurns,
      hpMax: extra.hpMax, hp: extra.hp, atk: extra.atk, art
    });
    try { vfxAddSpawn(Game, cx, cy, side); } catch(_){}
    // gắn instance id
    const spawned = Game.tokens[Game.tokens.length - 1];
    spawned.iid = hooks.allocIid?.() ?? (spawned.iid||0);

    // creep hành động NGAY trong chain (1 lượt), chỉ basic theo spec creep cơ bản
    // (nếu về sau cần hạn chế further — thêm flags trong meta.creep)
    // gọi lại doActionOrSkip để dùng chung status/ult-guard (creep thường không có ult)
    const creep = Game.tokens.find(t => t.alive && t.side===side && t.cx===cx && t.cy===cy);
    if (creep) hooks.doActionOrSkip?.(Game, creep, hooks);

    if (item.slot > maxSlot) maxSlot = item.slot;
  }

  Game.actionChain = Game.actionChain.filter(x => x.side !== side);
  return maxSlot;
}
