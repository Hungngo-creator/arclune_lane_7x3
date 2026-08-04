import type { SessionState } from '@shared-types/combat';
import type { Side, UnitToken } from '../../types/units.ts';
import { nextCombatIid, nextEventSerial } from './sequence.ts';
import type { ReincarnationRecord } from './reincarnation.ts';
import { ensureTrueSelfCombatRecord } from './true-self.ts';
import { ensureCombatIdentity } from './combat-identity.ts';
import { commitNonDeathRemoval } from './non-death-removal.ts';
import { normalizeCombatHpState, normalizeCombatHpValue } from '../number-utils.ts';

export interface RebirthAuthorization { tokenId: string; effectId: string; deathId: string; trueSelfId: string; incarnationSerial: number; lifeSerial: number; consumed: boolean }
export interface RebirthRequest { deathId: string; trueSelfId: string; authorizationTokenId: string; spawn: { side: Side; cx: number; cy: number }; template: UnitToken; policies: { hp: number | 'full'; rage: number; preserveStatusIds?: readonly string[] } }
export interface RebirthEligibility { allowed: boolean; reason: 'allowed' | 'battle-ended' | 'not-entered' | 'departed-from-battle' | 'identity-mismatch' | 'missing-authority' | 'effect-blocked' | 'invalid-spawn' | 'iid-conflict' }
export interface RebirthResult { committed: boolean; reason: RebirthEligibility['reason']; trueSelfId: string; oldIid: string | number | null; newIid: string | number | null; incarnationSerial: number }
type Runtime = { battleEnd?: { ended?: boolean }; reincarnationByDeathId?: Record<string, ReincarnationRecord>; rebirthAuthorizations?: Record<string, RebirthAuthorization>; rebirthAuthorizationSerial?: number; combatEvents?: Record<string, unknown>[] };
const rt=(game:SessionState):Runtime=>(game.runtime??={}) as Runtime;

export function registerRebirthAuthorization(game: SessionState, effectId: string, record: ReincarnationRecord): RebirthAuthorization {
  if (record.state === 'departed-from-battle') throw new Error('[rebirth] departed-from-battle');
  const openWinner = record.state === 'entered' && record.winningClaim?.effectId === effectId;
  const reservation = record.state === 'rebirth-reserved' && record.reservation?.effectId === effectId && !record.reservation.consumed;
  if (!openWinner && !reservation) throw new Error('[rebirth] authorization requires a winning open claim or unconsumed reservation');
  const state=rt(game); const serial=state.rebirthAuthorizationSerial=(state.rebirthAuthorizationSerial??0)+1;
  const token={tokenId:`rebirth-auth-${serial}`,effectId,deathId:record.deathId,trueSelfId:record.trueSelfId,incarnationSerial:record.incarnationSerial,lifeSerial:record.deadLifeSerial,consumed:false};
  (state.rebirthAuthorizations??={})[token.tokenId]=token; return token;
}
export function evaluateRebirthEligibility(game:SessionState,request:RebirthRequest):RebirthEligibility {
  const state=rt(game); if(state.battleEnd?.ended)return{allowed:false,reason:'battle-ended'};
  const record=state.reincarnationByDeathId?.[request.deathId]; if(record?.state==='departed-from-battle')return{allowed:false,reason:'departed-from-battle'};
  if(!record||(record.state!=='entered'&&record.state!=='rebirth-reserved'))return{allowed:false,reason:'not-entered'};
  if(record.trueSelfId!==request.trueSelfId)return{allowed:false,reason:'identity-mismatch'};
  const auth=state.rebirthAuthorizations?.[request.authorizationTokenId];
  if(!auth||auth.consumed||auth.deathId!==record.deathId||auth.trueSelfId!==record.trueSelfId||auth.incarnationSerial!==record.incarnationSerial||auth.lifeSerial!==record.deadLifeSerial)return{allowed:false,reason:'missing-authority'};
  const {cx,cy,side}=request.spawn; if((side!=='ally'&&side!=='enemy')||!Number.isInteger(cx)||!Number.isInteger(cy)||cx<0||cx>=3||cy<0||cy>=3)return{allowed:false,reason:'invalid-spawn'};
  if(game.tokens.some(token=>token.side===side&&token.cx===cx&&token.cy===cy&&token.lifeState!=='removed'&&token.lifeState!=='erased'))return{allowed:false,reason:'invalid-spawn'};
  const queued=(game as SessionState & {queued?:Record<string,Map<number,{cx:number;cy:number}>>}).queued?.[side];
  if(queued&&[...queued.values()].some(item=>item.cx===cx&&item.cy===cy))return{allowed:false,reason:'invalid-spawn'};
  return{allowed:true,reason:'allowed'};
}
export function applyRebirthConsequences():Record<string,never>{return {};}
export function commitRebirth(game:SessionState,request:RebirthRequest):RebirthResult {
  const eligibility=evaluateRebirthEligibility(game,request), state=rt(game), record=state.reincarnationByDeathId?.[request.deathId], self=ensureTrueSelfCombatRecord(game,request.trueSelfId);
  if(!eligibility.allowed||!record)return{committed:false,reason:eligibility.reason,trueSelfId:request.trueSelfId,oldIid:record?.targetIid??null,newIid:null,incarnationSerial:self.incarnationSerial};
  const auth=state.rebirthAuthorizations![request.authorizationTokenId]!; auth.consumed=true;
  if (record.reservation) record.reservation.consumed = true;
  const old=game.tokens.find(token=>(token.iid??token.id)===record.targetIid); if(old)commitNonDeathRemoval(game,old,'REBIRTH_RETIRED','rebirth');
  self.incarnationSerial=Math.max(self.incarnationSerial,record.incarnationSerial)+1; if(!self.deathHistory.includes(record.deathId))self.deathHistory.push(record.deathId);
  const newIid=nextCombatIid(game), keep=new Set(request.policies.preserveStatusIds??[]);
  const unit=ensureCombatIdentity({...request.template,iid:newIid,trueSelfId:request.trueSelfId,incarnationSerial:self.incarnationSerial,lifeSerial:1,side:request.spawn.side,cx:request.spawn.cx,cy:request.spawn.cy,lifeState:'alive',alive:true,rage:request.policies.rage,statuses:(request.template.statuses??[]).filter(status=>keep.has(String(status.id)))} as UnitToken,'collection-unit');
  normalizeCombatHpState(unit); unit.hp=request.policies.hp==='full'?unit.hpMax:Math.max(1,Math.min(unit.hpMax,normalizeCombatHpValue(request.policies.hp,'rebirth.hp'))); game.tokens.push(unit); record.state='reborn';
  const eventSerial=nextEventSerial(game); self.rebirthHistory.push({deathId:record.deathId,oldIid:record.targetIid,newIid,eventSerial,incarnationSerial:self.incarnationSerial});
  (state.combatEvents??=[]).push({type:'REBIRTH_COMMITTED',eventSerial,deathId:record.deathId,trueSelfId:request.trueSelfId,oldIid:record.targetIid,newIid,lifeSerial:1,incarnationSerial:self.incarnationSerial,authorizationTokenId:auth.tokenId});
  return{committed:true,reason:'allowed',trueSelfId:request.trueSelfId,oldIid:record.targetIid,newIid,incarnationSerial:self.incarnationSerial};
}

export function commitRebirthEffect(game: SessionState, deathId: string, effectId: string, spawn: RebirthRequest['spawn'], template: UnitToken, policies: RebirthRequest['policies']): RebirthResult {
  const record=rt(game).reincarnationByDeathId?.[deathId];
  if(!record)return{committed:false,reason:'not-entered',trueSelfId:'',oldIid:null,newIid:null,incarnationSerial:1};
  const authorization=registerRebirthAuthorization(game,effectId,record);
  return commitRebirth(game,{deathId,trueSelfId:record.trueSelfId,authorizationTokenId:authorization.tokenId,spawn,template,policies});
}
