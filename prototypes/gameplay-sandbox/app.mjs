import { Battle, replay } from './engine.mjs';
import { AE_BY_CLASS, ELEMENT_COUNTER, RANK_MULT, DEFAULT_OPTIONS, NUMERIC_PROFILE } from './profiles.mjs';
import { traceReport } from './trace-report.mjs';

const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => Math.round(value).toLocaleString('vi-VN');
let battle = new Battle(), chosenAbility = null, chosenTarget = null, timer = null;
for (const [id, values, selected] of [['classes', Object.keys(AE_BY_CLASS), 'Warrior'], ['ranks', Object.keys(RANK_MULT), 'SSR'], ['element-a', Object.keys(ELEMENT_COUNTER), 'Light'], ['element-b', Object.keys(ELEMENT_COUNTER), 'Dark']]) {
  $(id).innerHTML = values.map(v => `<option ${v === selected ? 'selected' : ''}>${v}</option>`).join('');
}
$('class-table').innerHTML = Object.entries(AE_BY_CLASS).map(([cls, ae]) => `<div>${cls}<strong>+${ae} AE</strong></div>`).join('');

function stopAuto() { clearInterval(timer); timer = null; $('auto').textContent = 'Tự chạy trận'; }
function report(error) { stopAuto(); $('error').textContent = error.message; renderActions(); }
function actor() { return battle.active ? battle.unit(battle.active.actorId) : null; }
function name(id) { if (!id) return ''; const unit = battle.unit(id); return `${battle.kit(unit).name} (${unit.side})`; }
function selectDefault() {
  const unit = actor();
  if (!unit || battle.active.blocked) { chosenAbility = null; chosenTarget = null; return; }
  if (!chosenAbility || !battle.canUse(unit, chosenAbility).ok) {
    chosenAbility = battle.ultimateReady(unit) ? 'ultimate' : 'basic';
  }
  const choices = battle.targetChoices(unit, chosenAbility);
  if (!choices.some(u => u.id === chosenTarget)) chosenTarget = choices[0]?.id ?? null;
}
function card(unit, legal) {
  if (!unit) return '';
  const states = Object.entries(unit.states), kit = battle.kit(unit), maxHp = battle.maxHp(unit);
  const active = battle.active?.actorId === unit.id;
  const initials = kit.name.split(' ').slice(0, 2).map(w => w[0]).join('');
  return `<button class="unit ${unit.side === 'B' ? 'enemy' : ''} ${active ? 'active' : ''} ${legal ? 'legal' : ''} ${chosenTarget === unit.id ? 'selected' : ''} ${!unit.alive ? 'dead' : ''}" data-unit="${escape(unit.id)}" aria-label="${escape(kit.name)} đội ${unit.side}, Slot ${unit.slot}, HP ${number(unit.hp)} trên ${number(maxHp)}" title="ATK ${number(battle.stats(unit).atk)} · WIL ${number(battle.stats(unit).wil)} · ARM ${number(battle.stats(unit).arm)} · RES ${number(battle.stats(unit).res)}">
    <span class="slot-number">${unit.slot}${unit.leader ? ' ♛' : ''}</span><div class="unit-top"><span class="portrait">${escape(initials)}</span><div><div class="unit-name">${escape(kit.name)}</div><div class="unit-meta">${escape(unit.rank)} · ${escape(unit.class)} · ${escape(unit.element)}</div></div></div>
    <div class="bar"><i style="width:${Math.max(0, Math.min(100, unit.hp / maxHp * 100))}%"></i></div><div class="health-text"><span>${number(unit.hp)} / ${number(maxHp)}</span><span>HP</span></div>
    <div class="bar rage"><i style="width:${unit.rage}%"></i></div><div class="health-text"><span>Rage ${number(unit.rage)}/${NUMERIC_PROFILE.rageMax}</span><span>${unit.shield ? 'Shield ' + number(unit.shield) : ''}</span></div>
    <div class="badges">${states.map(([family, s]) => `<span class="badge">${s.profile.targetConstraint ? 'Taunt' : family === 'defense' ? 'ARM/RES +10%' : escape(family)}</span>`).join('')}${unit.stunned ? '<span class="badge cc">Choáng</span>' : ''}${unit.maxHpContributions.passive ? '<span class="badge capacity">MaxHP +' + number(unit.maxHpContributions.passive) + '</span>' : ''}</div></button>`;
}
function renderBoard() {
  let legal = [];
  if (actor() && chosenAbility) legal = battle.targetChoices(actor(), chosenAbility).map(u => u.id);
  for (const [side, slots] of [['A', [7, 4, 1, 8, 5, 2, 9, 6, 3]], ['B', [3, 6, 9, 2, 5, 8, 1, 4, 7]]]) {
    $('side-' + side.toLowerCase()).innerHTML = slots.map(slot => {
      const unit = battle.units.find(u => u.side === side && u.slot === slot);
      return `<div class="slot ${unit ? '' : 'slot-empty'}">${unit ? card(unit, legal.includes(unit.id)) : 'SLOT ' + slot}</div>`;
    }).join('');
    $('ae-' + side.toLowerCase()).textContent = `${number(battle.ae[side])} / ${NUMERIC_PROFILE.aeCap} AE`;
  }
  $('opportunity').textContent = `Cơ hội #${battle.opportunities} / ${NUMERIC_PROFILE.maxOpportunities}`;
  const limited = battle.outcome === 'DRAW' && battle.trace.at(-1)?.type === 'SANDBOX_LIMIT';
  $('result').textContent = limited ? `Dừng hòa: đạt giới hạn thử nghiệm ${NUMERIC_PROFILE.maxOpportunities} cơ hội. Các bên vẫn còn sống.` : battle.outcome ? battle.outcome === 'DRAW' ? 'Trận thử kết thúc hòa' : 'Đội ' + battle.outcome + ' thắng' : '';
}
function renderActions() {
  const unit = actor(), blocked = battle.active?.blocked, opponent = unit?.side === 'B' && !$('control-b').checked;
  $('active-name').textContent = unit ? `${battle.kit(unit).name} · Đội ${unit.side}` : 'Trận đã kết thúc';
  $('active-note').textContent = blocked ? 'Choáng tiêu thụ cơ hội này. Các checkpoint hồi máu / CD đầu cơ hội đã chạy.' : unit ? `Slot ${unit.slot} · Natural opportunity ${unit.opportunity}${opponent ? ' · Bấm AI để đối thủ hành động' : ''}` : 'Đổi thiết lập hoặc bắt đầu một trận mới.';
  $('abilities').innerHTML = unit ? Object.entries(battle.kit(unit).abilities).map(([id, a]) => {
    const permission = battle.canUse(unit, id);
    return `<button class="ability ${id === chosenAbility ? 'chosen' : ''}" data-ability="${escape(id)}" ${!permission.ok || blocked || opponent ? 'disabled' : ''}><strong>${escape(a.name)}</strong><small>${a.form === 'AUTOMATIC' ? `Tự động · 15 AE · CD ${Math.max(0, unit.cdReadyAt - unit.opportunity)}` : a.form === 'ULTIMATE' ? '100 Rage' + (a.hpCostRate ? ' + 15% HP' : '') : `${a.ae} AE${a.hpCostRate ? ' + 15% HP' : ''}`}</small>${!permission.ok && a.form !== 'AUTOMATIC' ? '<small>' + escape(permission.reason) + '</small>' : ''}</button>`;
  }).join('') : '';
  const choices = unit && chosenAbility ? battle.targetChoices(unit, chosenAbility) : [];
  const shape = unit && chosenAbility ? battle.kit(unit).abilities[chosenAbility].target.shape : null;
  $('targets').innerHTML = choices.map(u => `<button data-target="${escape(u.id)}" class="${u.id === chosenTarget ? 'chosen' : ''}" ${opponent || blocked || shape !== 'SELECTABLE_SINGLE' ? 'disabled' : ''}>${escape(battle.kit(u).name)} · ${u.side}/${u.slot}</button>`).join('');
  $('target-panel').hidden = !unit || blocked;
  $('selection-note').textContent = blocked ? 'Cơ hội bị CC tiêu thụ; không có Action hay class AE gain.' : unit && chosenAbility ? `${battle.kit(unit).abilities[chosenAbility].name} → ${shape === 'ALL' ? 'toàn bộ mục tiêu hợp lệ' : choices.find(u => u.id === chosenTarget) ? name(chosenTarget) : 'mục tiêu theo profile'}` : '';
  $('execute').disabled = !!battle.outcome || !!opponent || !!timer;
  $('execute').innerHTML = blocked ? 'Tiêu thụ cơ hội CC <span>→</span>' : 'Thực thi Action <span>→</span>';
  $('ai-step').disabled = !!battle.outcome || !!timer;
  $('auto').disabled = !!battle.outcome;
}
function eventText(e) {
  const who = name(e.actorId);
  switch (e.type) {
    case 'BATTLE_START': return `Bắt đầu trận · seed ${e.seed}`;
    case 'OPPORTUNITY_BEGIN': return `${who} · bắt đầu cơ hội ${e.opportunity}`;
    case 'ACTION_BEGIN': return `${who} dùng ${battle.kit(battle.unit(e.actorId)).abilities[e.abilityId].name}${e.parentId ? ' · child Action' : ''}`;
    case 'DAMAGE_RECEIPT': return `${who} → ${name(e.targetId)}: ${number(e.actualHpDamage)} HP damage${e.shieldAbsorbed ? ', Shield hấp thụ ' + number(e.shieldAbsorbed) : ''}${e.convertedToTrue ? ' · TRUE theo snapshot <30%' : ''}${e.counter.classBonus + e.counter.elementBonus ? ' · bonus ' + Math.round((e.counter.classBonus + e.counter.elementBonus) * 100) + '%' : ''}`;
    case 'HEAL_RECEIPT': return `${who}: hồi ${number(e.actual)} / yêu cầu ${number(e.requested)}`;
    case 'AE_GRANTED': return `Đội ${e.side}: +${number(e.actual)} AE → ${number(e.current)}${e.source === 'AE_ACTION_REGEN_BY_CLASS' ? ' · class gain sau Action' : ''}`;
    case 'RAGE_GRANTED': return `${who}: +${number(e.amount)} Rage · profile thử nghiệm`;
    case 'COST_COMMITTED': return `${who}: trả ${number(e.ae)} AE${e.rage ? ' + ' + number(e.rage) + ' Rage' : ''}${e.hp ? ' + ' + number(e.hp) + ' HP Cost' : ''}${e.waivedAE ? ' · child miễn AE' : ''}`;
    case 'STATE_APPLIED': case 'STATE_REFRESHED': return `${who}: ${e.type === 'STATE_REFRESHED' ? 'refresh' : 'nhận'} ${e.family === 'guard' ? 'Taunt / lịch Heal' : 'ARM/RES +10%'} · window ${e.revision}`;
    case 'STATE_EXPIRED': return `${who}: ${e.family} hết hiệu lực tại ${e.phase}`;
    case 'PERIODIC_HEAL_CHECKPOINT': return `${who}: tick 4% MaxHP sống ${number(e.liveMaxHp)} → yêu cầu ${number(e.amount)} mỗi recipient`;
    case 'MAX_HP_RECONCILED': return `${who}: MaxHP ${number(e.before)} → ${number(e.after)}; HP ${number(e.hpBefore)} → ${number(e.hpAfter)} · reconciliation`;
    case 'PASSIVE_THRESHOLD': return `${who}: Damage ${number(e.actualHpDamage)} ${e.qualified ? '>' : '≤ / không hợp lệ'} ${number(e.strictThreshold)} · ${e.qualified ? 'passive đạt ngưỡng' : 'không tăng MaxHP'}`;
    case 'AUTOMATIC_PREDICATE': return `${who}: Skill3 ${e.legal ? 'đủ điều kiện' : 'chưa đủ điều kiện'} · AE ${number(e.ae)} / CD ${e.cd}`;
    case 'COOLDOWN_WRITTEN': case 'COOLDOWN_CHECKPOINT': return `${who}: CD ${e.remaining}`;
    case 'STUN_RESULT': return `${who}: ${e.success ? 'bị choáng' : 'không nhận choáng'} · xác suất ${e.chance * 100}%`;
    case 'CC_OPPORTUNITY_LOST': return `${who}: mất cơ hội do choáng · không Action, không class AE`;
    case 'HIT_MISSED': return `${who}: đòn đánh trượt`;
    case 'HP_ZERO': return `${who}: HP về 0`;
    case 'DEATH_CONFIRMED': return `${who}: xác nhận chết`;
    case 'ACTION_COMPLETED': return `${who}: Action hoàn tất${e.natural ? ' · Natural' : ''}`;
    case 'ACTION_DIRECT_EFFECTS_COMPLETE': return `${e.actionId}: direct effects terminal`;
    case 'OPPORTUNITY_END': return `${who}: cơ hội đã tiêu thụ`;
    case 'TURN_BOUNDARY': return `Global Turn Boundary · chuyển khỏi đội ${e.afterSide}`;
    case 'BATTLE_ENDED': return `Kết thúc trận · ${e.winner === 'DRAW' ? 'hòa' : 'đội ' + e.winner + ' thắng'}`;
    case 'SANDBOX_LIMIT': return `Dừng hòa tại ${e.opportunities} cơ hội · giới hạn của bản thử`;
    case 'RNG': return `Seeded draw #${e.draw} · ${e.cause}`;
    default: return e.type;
  }
}
function renderTrace() {
  const filter = $('trace-filter').value;
  const category = type => /DAMAGE|HEAL|MISSED|MAX_HP/.test(type) ? 'DAMAGE' : /AE_|RAGE_|COST/.test(type) ? 'RESOURCE' : /STATE|STUN|COOLDOWN|CC_|PREDICATE|THRESHOLD/.test(type) ? 'STATE' : 'OTHER';
  const events = battle.trace.filter(e => filter === 'ALL' || category(e.type) === filter).slice(-150).reverse();
  $('trace').innerHTML = events.map(e => `<li><span class="seq">${String(e.seq).padStart(3, '0')}</span><details class="${e.type === 'DAMAGE_RECEIPT' ? 'event-damage' : /HEAL/.test(e.type) ? 'event-heal' : category(e.type) === 'RESOURCE' ? 'event-resource' : ''}"><summary>${escape(eventText(e))}</summary><pre>${escape(JSON.stringify(e, null, 2))}</pre></details></li>`).join('');
}
function render() { selectDefault(); renderBoard(); renderActions(); renderTrace(); }
function syncSetup() {
  for (const [key, value] of Object.entries(battle.options)) {
    const input = $('setup').elements.namedItem(key);
    if (!input) continue;
    if (input.type === 'checkbox') input.checked = value; else input.value = value;
  }
  $('setup').elements.namedItem('alwaysHit').checked = battle.options.hitChance === 1;
}
function performAI() {
  const action = battle.chooseAI();
  if (!action) return;
  battle.step(action.abilityId, action.targetId); chosenAbility = null; chosenTarget = null;
  if (battle.outcome) stopAuto();
  render();
}
document.addEventListener('click', event => {
  const ability = event.target.closest('[data-ability]'), target = event.target.closest('[data-target], [data-unit]');
  if (ability && !ability.disabled) { chosenAbility = ability.dataset.ability; chosenTarget = null; render(); }
  if (target && actor() && chosenAbility && !timer && (actor().side === 'A' || $('control-b').checked) && !battle.active.blocked) {
    const id = target.dataset.target ?? target.dataset.unit;
    if (battle.targetChoices(actor(), chosenAbility).some(u => u.id === id)) { chosenTarget = id; render(); }
  }
});
$('execute').addEventListener('click', () => { try { $('error').textContent = ''; battle.step(chosenAbility, chosenTarget); chosenAbility = null; chosenTarget = null; render(); } catch (e) { report(e); } });
$('ai-step').addEventListener('click', () => { try { $('error').textContent = ''; performAI(); } catch (e) { report(e); } });
$('auto').addEventListener('click', () => {
  if (timer) { stopAuto(); render(); return; }
  timer = setInterval(() => { try { performAI(); } catch (e) { report(e); render(); } }, 500);
  $('auto').textContent = 'Dừng tự chạy'; renderActions();
});
$('control-b').addEventListener('change', render);
$('trace-filter').addEventListener('change', renderTrace);
function download(filename, data, spacing = 2) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, spacing)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('export').addEventListener('click', () => download(`arclune-replay-${battle.options.seed}.json`, battle.exportReplay()));
$('trace-export').addEventListener('click', () => {
  const detail = $('trace-detail').value;
  const currentUnits = battle.units.map(u => ({ actorId: u.id, alive: u.alive, hp: u.hp, maxHp: battle.maxHp(u), rage: u.rage }));
  download(`arclune-${detail === 'full' ? 'trace' : 'summary'}-${battle.options.seed}.json`, traceReport({ options: battle.options, outcome: battle.outcome, trace: battle.trace, currentUnits }, detail), 0);
});
$('import').addEventListener('change', async event => {
  try {
    stopAuto(); const file = event.target.files[0]; if (!file) return;
    if (file.size > 2_000_000) throw new Error('Replay quá lớn (tối đa 2 MB).');
    const restored = replay(JSON.parse(await file.text())); battle = restored;
    chosenAbility = null; chosenTarget = null; $('error').textContent = ''; syncSetup(); render();
  } catch (e) { report(e); } finally { event.target.value = ''; }
});
$('reset').addEventListener('click', () => { stopAuto(); battle = new Battle(battle.options); chosenAbility = null; chosenTarget = null; $('error').textContent = ''; render(); });
$('setup').addEventListener('submit', event => {
  event.preventDefault();
  try {
    stopAuto(); const form = new FormData(event.target), options = {};
    for (const key of ['seed', 'startingAE', 'startingRage']) options[key] = Number(form.get(key));
    for (const key of ['trainingClass', 'trainingRank', 'alliedElement', 'enemyElement']) options[key] = form.get(key);
    for (const key of ['rankEnabled', 'classBonusEnabled', 'elementBonusEnabled']) options[key] = form.has(key);
    options.hitChance = form.has('alwaysHit') ? 1 : DEFAULT_OPTIONS.hitChance;
    battle = new Battle(options); chosenAbility = null; chosenTarget = null; $('error').textContent = ''; render();
  } catch (e) { report(e); }
});
render();
