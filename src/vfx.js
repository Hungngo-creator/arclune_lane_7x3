// 0.6 vfx.js
// VFX layer: spawn pop, hit ring, ranged tracer, melee step-in/out
// Không thay đổi logic combat/turn — chỉ vẽ đè.
// Durations: spawn 500ms, hit 380ms, tracer 400ms, melee 1200ms.

import { projectCellOblique } from './engine.js';
import { CFG, CHIBI } from './config.js';

const now = () => performance.now();
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) * 0.5;

function pool(Game) {
  if (!Game.vfx) Game.vfx = [];
  return Game.vfx;
}

/* ------------------- Adders ------------------- */
export function vfxAddSpawn(Game, cx, cy, side) {
  pool(Game).push({ type: 'spawn', t0: now(), dur: 500, cx, cy, side });
}

export function vfxAddHit(Game, target, opts = {}) {
  pool(Game).push({ type: 'hit', t0: now(), dur: 380, ref: target, ...opts });
}

export function vfxAddTracer(Game, attacker, target, opts = {}) {
  pool(Game).push({ type: 'tracer', t0: now(), dur: opts.dur || 400, refA: attacker, refB: target });
}

export function vfxAddMelee(Game, attacker, target, { dur = 1800 } = {}) {
  // Overlay step-in/out (không di chuyển token thật)
  pool(Game).push({ type: 'melee', t0: now(), dur, refA: attacker, refB: target });
}
function drawChibiOverlay(ctx, x, y, r, facing, color) {
  const lw = Math.max(CHIBI.line, Math.floor(r*0.28));
  const hr = Math.max(3, Math.floor(r*CHIBI.headR));
  const torso = r*CHIBI.torso, arm=r*CHIBI.arm, leg=r*CHIBI.leg, wep=r*CHIBI.weapon;

  ctx.save(); ctx.translate(x,y); ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle = color; ctx.lineWidth = lw;

  // đầu
  ctx.beginPath(); ctx.arc(0, -torso-hr, hr, 0, Math.PI*2); ctx.stroke();
  // thân
  ctx.beginPath(); ctx.moveTo(0, -torso); ctx.lineTo(0, 0); ctx.stroke();
  // tay (tay trước cầm kiếm theo hướng facing)
  ctx.beginPath();
  ctx.moveTo(0, -torso*0.6); ctx.lineTo(-arm*0.8, -torso*0.2);
  ctx.moveTo(0, -torso*0.6); ctx.lineTo( arm*0.8*facing, -torso*0.2);
  ctx.stroke();
  // chân
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-leg*0.6, leg*0.9);
  ctx.moveTo(0, 0); ctx.lineTo( leg*0.6, leg*0.9);
  ctx.stroke();
  // kiếm
  const hx = arm*0.8*facing, hy = -torso*0.2;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + wep*facing, hy); ctx.stroke();

  ctx.restore();
}
/* ------------------- Drawer ------------------- */
export function vfxDraw(ctx, Game, cam) {
  const list = pool(Game);
  if (!list.length || !Game.grid) return;

  const keep = [];
  for (const e of list) {
    const t = (now() - e.t0) / e.dur;
    const done = t >= 1;
    const tt = Math.max(0, Math.min(1, t));

    if (e.type === 'spawn') {
      const p = projectCellOblique(Game.grid, e.cx, e.cy, cam);
      const r0 = Math.max(8, Math.floor(Game.grid.tile * 0.22 * p.scale));
      const r = r0 + Math.floor(r0 * 1.8 * tt);
      ctx.save();
      ctx.globalAlpha = 1 - tt;
      ctx.strokeStyle = e.side === 'ally' ? '#9ef0a4' : '#ffb4c0';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    else if (e.type === 'hit') {
      const ref = e.ref && Game.tokens.find(tk => tk === e.ref || (tk.iid && e.ref.iid && tk.iid === e.ref.iid));
      if (ref) {
        const p = projectCellOblique(Game.grid, ref.cx, ref.cy, cam);
        const r = Math.floor(Game.grid.tile * 0.25 * (0.6 + 1.1 * tt) * p.scale);
        ctx.save();
        ctx.globalAlpha = 0.9 * (1 - tt);
        ctx.strokeStyle = '#e6f2ff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }
    else if (e.type === 'tracer') {
  // disabled: không vẽ “đường trắng” nữa
}
    else if (e.type === 'melee') {
  const A = e.refA, B = e.refB;
  if (A && B && A.alive && B.alive) {
    const pa = projectCellOblique(Game.grid, A.cx, A.cy, cam);
    const pb = projectCellOblique(Game.grid, B.cx, B.cy, cam);

    // Đi vào ~40%, dừng ngắn, rồi lùi về (easeInOut) – không chạm hẳn mục tiêu để đỡ che
    const tN = Math.max(0, Math.min(1, (now() - e.t0) / e.dur));
    const k = easeInOut(tN) * 0.88;
    const mx = lerp(pa.x, pb.x, k);
    const my = lerp(pa.y, pb.y, k);

    // scale theo chiều sâu (khớp render token)
    const depth = Game.grid.rows - 1 - A.cy;
    const kDepth = (cam?.depthScale ?? 0.94);
    const r = Math.max(6, Math.floor(Game.grid.tile * 0.36 * Math.pow(kDepth, depth)));

    const facing = (A.side === 'ally') ? 1 : -1;
    const color  = A.color || (A.side === 'ally' ? '#9adcf0' : '#ffb4c0');

    ctx.save();
    ctx.globalAlpha = 0.95;
    drawChibiOverlay(ctx, mx, my, r, facing, color);
    ctx.restore();
  }
}

    if (!done) keep.push(e);
  }
  Game.vfx = keep;
}
