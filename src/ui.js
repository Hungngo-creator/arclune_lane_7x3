//v0.7.1
import { CFG } from './config.js';
import { gameEvents, TURN_START, TURN_END, ACTION_END } from './events.js';

export function initHUD(doc, root){
  const queryFromRoot = (id)=>{
    if (root && typeof root.querySelector === 'function'){
      const el = root.querySelector(`#${id}`);
      if (el) return el;
    }
    return null;
  };

  const costNow  = /** @type {HTMLElement|null} */ (queryFromRoot('costNow')  || doc.getElementById('costNow'));   // số cost hiện tại
  const costRing = /** @type {HTMLElement|null} */ (queryFromRoot('costRing') || doc.getElementById('costRing'));  // vòng tròn tiến trình
  const costChip = /** @type {HTMLElement|null} */ (queryFromRoot('costChip') || doc.getElementById('costChip'));  // chip bao ngoài
  function update(Game){
    if (!Game) return;

    const capRaw = Game.costCap ?? CFG.COST_CAP ?? 30;
    const cap = Number.isFinite(capRaw) && capRaw > 0 ? capRaw : 1;
    const now = Math.max(0, Math.floor(Game.cost ?? 0));
    const ratio = Math.max(0, Math.min(1, now / cap));

    if (costNow) costNow.textContent = String(now);
    // Vòng tròn tiến trình n/30
    if (costRing){
     const deg = (ratio * 360).toFixed(1) + 'deg';
     costRing.style.setProperty('--deg', deg);
   }
    // Khi max cap, làm chip sáng hơn
    if (costChip){
      costChip.classList.toggle('full', now >= cap);
    }
 }
  const handleGameEvent = (ev)=>{
    const state = ev?.detail?.game;
    if (state) update(state);
  };
  if (gameEvents && typeof gameEvents.addEventListener === 'function'){
    const types = [TURN_START, TURN_END, ACTION_END];
    for (const type of types){
      gameEvents.addEventListener(type, handleGameEvent);
    }
  }
 return { update };
 }
/* ---------- Summon Bar (deck-size = 4) ---------- */
export function startSummonBar(doc, options, root){
  options = options || {};
  const onPick = options.onPick || (()=>{});
  const canAfford = options.canAfford || (()=>true);
  const getDeck = options.getDeck || (()=>[]);
  const getSelectedId = options.getSelectedId || (()=>null);

  const queryFromRoot = (selector, id)=>{
    if (root && typeof root.querySelector === 'function'){
      const el = root.querySelector(selector);
      if (el) return el;
    }
    if (id && typeof doc.getElementById === 'function'){
      return doc.getElementById(id);
    }
    return null;
  };

  const host = /** @type {HTMLElement|null} */ (queryFromRoot('#cards', 'cards'));
  if (!host){
    return { render: ()=>{} };
  }

  if (host){
    host.innerHTML = '';
    host.addEventListener('click', (event) => {
      const target = event.target instanceof Element
        ? event.target
        : event.currentTarget instanceof Element
          ? event.currentTarget
          : null;
      const btn = target ? target.closest('button.card') : null;
      if (!btn || btn.disabled || !host.contains(btn)) return;

      const deck = getDeck() || [];
      const targetId = btn.dataset.id;
      if (!targetId) return;
      const card = deck.find((c) => `${c.id}` === targetId);
      if (!card || !canAfford(card)) return;

      onPick(card);
      [...host.children].forEach((node) => node.classList.toggle('active', node === btn));
    });
  }

// C2: đồng bộ cỡ ô cost theo bề rộng sân (7 cột), lấy số từ CFG.UI
  const _GAP = (CFG.UI?.CARD_GAP) ?? 12;     // khớp CSS khoảng cách
  const _MIN = (CFG.UI?.CARD_MIN) ?? 40;     // cỡ tối thiểu
  const boardEl = /** @type {HTMLElement|null} */ (queryFromRoot('#board', 'board')); // cache DOM

  function debounce(fn, wait){
    let timer = null;
    function debounced(...args){
      if (timer){
        clearTimeout(timer);
      }
      timer = setTimeout(()=>{
        timer = null;
        fn.apply(this, args);
      }, wait);
    }
    debounced.cancel = ()=>{
      if (timer){
        clearTimeout(timer);
        timer = null;
      }
    };

    debounced.flush = (...args)=>{
      if (timer){
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(this, args);
    };
    return debounced;
  }
  const syncCardSize = debounce(()=>{
    if (!boardEl) return;
    const w = boardEl.clientWidth || boardEl.getBoundingClientRect().width || 0;

    // 7 cột -> 6 khoảng cách
    const cell = Math.max(_MIN, Math.floor((w - _GAP * 6) / 7));
    if (host){
      host.style.setProperty('--cell', `${cell}px`);
    }
  }, 120);
  syncCardSize.flush();

  let cleanupResize = ()=>{};
  if (boardEl && typeof ResizeObserver === 'function'){
    const observer = new ResizeObserver(()=> syncCardSize());
    observer.observe(boardEl);
    cleanupResize = ()=>{
      observer.disconnect();
      syncCardSize.cancel();
    };
  } else {
    const handleResize = ()=> syncCardSize();
    window.addEventListener('resize', handleResize);
    cleanupResize = ()=>{
      window.removeEventListener('resize', handleResize);
      syncCardSize.cancel();
    };
  }

let removalObserver = null;
  if (host && typeof MutationObserver === 'function'){
    const target = doc.body || doc.documentElement;
    if (target){
      removalObserver = new MutationObserver(()=>{
        if (!host.isConnected){
          cleanupResize();
          removalObserver.disconnect();
          removalObserver = null;
        }
      });
      removalObserver.observe(target, { childList: true, subtree: true });
    }
}

  // mỗi thẻ cost là 1 ô vuông, chỉ hiện cost
  function makeBtn(c){
    const btn = doc.createElement('button');
    btn.className = 'card';
    btn.dataset.id = c.id;
    // chỉ hiện cost, không hiện tên
    btn.innerHTML = `<span class="cost">${c.cost}</span>`;

// trạng thái đủ/thiếu cost
    const ok = canAfford(c);
    btn.disabled = !ok;
    btn.classList.toggle('disabled', !ok);  // chỉ để CSS quyết định độ sáng
 return btn;
  }
let btns = []; // sẽ chứa đúng 3 button được tạo bằng makeBtn

  function render(){
    const deck = getDeck();              // luôn gồm tối đa 3 thẻ hiện hành
    // đảm bảo đủ số nút (tạo mới bằng makeBtn – chỉ hiện cost)
    while (btns.length < deck.length){
      const btn = makeBtn(deck[btns.length]);
      host.appendChild(btn);
      btns.push(btn);
    }
    // cập nhật trạng thái từng nút theo deck hiện tại
    for (let i = 0; i < btns.length; i++){
      const b = btns[i];
      const c = deck[i];
      if (!c){
        b.hidden = true;
        continue;
      }
      b.hidden = false;
      b.dataset.id = c.id;

      // cập nhật cost (giữ UI “chỉ cost”)
      const span = b.querySelector('.cost');
      if (span) span.textContent = String(c.cost);

      const afford = canAfford(c);
      b.disabled = !afford;
      b.classList.toggle('disabled', !afford); // để CSS điều khiển độ sáng
      b.style.opacity = ''; // xóa mọi inline opacity cũ nếu còn
      b.classList.toggle('active', getSelectedId() === c.id);
    }
  }
  if (gameEvents && typeof gameEvents.addEventListener === 'function'){
    const rerender = ()=> render();
    const types = [TURN_START, TURN_END, ACTION_END];
    for (const type of types){
      gameEvents.addEventListener(type, rerender);
    }
  }

  return { render };
}
