//v0.7
// meta.js — gom lookup + stat khởi tạo + nộ khởi điểm
import {
  CLASS_BASE, getMetaById, isSummoner as _isSummoner,
  applyRankAndMods
} from './catalog.js';

// Dùng trực tiếp catalog cho tra cứu
export const Meta = {
  get: getMetaById,
  classOf(id){ return this.get(id)?.class ?? null; },
  rankOf(id){  return this.get(id)?.rank  ?? null; },
  kit(id){     return this.get(id)?.kit   ?? null; },
  // chỉ coi là Summoner khi ult.type='summon'
  isSummoner(id){
    const m = this.get(id);
    return !!(m && m.class === 'Summoner' && m.kit?.ult?.type === 'summon');
  }
};

// Tạo chỉ số instance theo class+rank+mods (SPD không nhân theo rank)
export function makeInstanceStats(unitId){
  const m = Meta.get(unitId);
  if (!m) return {};
  const fin = applyRankAndMods(CLASS_BASE[m.class], m.rank, m.mods);
  return {
    hpMax: fin.HP|0, hp: fin.HP|0,
    atk: fin.ATK|0, wil: fin.WIL|0,
    arm: fin.ARM||0, res: fin.RES||0,
    agi: fin.AGI|0, per: fin.PER|0,
    spd: fin.SPD||1,
    aeMax: fin.AEmax|0, ae: 0, aeRegen: fin.AEregen||0
  };
}

// Nộ khi vào sân (trừ leader). Revive: theo spec của skill.
export function initialRageFor(unitId, opts = {}){
  const onSpawn = Meta.kit(unitId)?.onSpawn;
  if (!onSpawn) return 0;
  if (onSpawn.exceptLeader && opts.isLeader) return 0;
  if (opts.revive) return Math.max(0, opts.reviveSpec?.rage ?? 0);
  return onSpawn.rage ?? 0;
}