//v0.7.1
import { CFG } from './config.js';

export function initHUD(doc){
  const costNow  = doc.getElementById('costNow');   // số cost hiện tại
 const costRing = doc.getElementById('costRing');  // vòng tròn tiến trình
 const costChip = doc.getElementById('costChip');  // chip bao ngoài
  function update(Game){
    if (!Game) return;

    const cap = Game.costCap ?? CFG.COST_CAP ?? 30;
    const now = Math.floor(Game.cost ?? 0);
    const ratio = Math.max(0, Math.min(1, now / cap));

    if (costNow) costNow.textContent = now;
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
   return { update };
 }
/* ---------- Summon Bar (deck-size = 4) ---------- */
export function startSummonBar(doc, options){
  options = options || {};
  const onPick = options.onPick || (()=>{});
  const canAfford = options.canAfford || (()=>true);
  const getDeck = options.getDeck || (()=>[]);
  const getSelectedId = options.getSelectedId || (()=>null);

const host = doc.getElementById('cards');
host.innerHTML = '';

// C2: đồng bộ cỡ ô cost theo bề rộng sân (7 cột), lấy số từ CFG.UI
const _GAP = CFG.UI?.CARD_GAP ?? 12;     // khớp CSS khoảng cách
const _MIN = CFG.UI?.CARD_MIN ?? 40;     // cỡ tối thiểu
const boardEl = doc.getElementById('board'); // cache DOM
function syncCardSize(){
  if (!boardEl) return;
  const w = boardEl.clientWidth || boardEl.getBoundingClientRect().width || 0;
  
  // 7 cột -> 6 khoảng cách
  const cell = Math.max(_MIN, Math.floor((w - _GAP*6)/7));
  host.style.setProperty('--cell', `${cell}px`);
}
syncCardSize();
window.addEventListener('resize', syncCardSize);
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

// trong makeBtn(c) ở ui.js
btn.addEventListener('click', ()=>{
  if (!canAfford(c)) return;
  onPick(c); // giao cho main quyết định selectedId
  [...host.children].forEach(x => x.classList.toggle('active', x===btn));
});

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
    if (!c){ b.hidden = true; continue; }
    b.hidden = false;
    b.dataset.id = c.id;

    // cập nhật cost (giữ UI “chỉ cost”)
    const span = b.querySelector('.cost');
    if (span) span.textContent = c.cost;

  const afford = canAfford(c);
  b.disabled = !afford;
  b.classList.toggle('disabled', !afford); // để CSS điều khiển độ sáng
  b.style.opacity = ''; // xóa mọi inline opacity cũ nếu còn
    b.classList.toggle('active', getSelectedId() === c.id);

    // click = chọn thẻ
    b.onclick = ()=> onPick(c);
  }
}
return { render };}
