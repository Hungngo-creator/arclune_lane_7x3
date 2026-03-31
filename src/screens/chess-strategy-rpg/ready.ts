import { ensureStyleTag, mountSection } from '../../ui/dom.ts';

const STYLE_ID = 'chess-strategy-rpg-ready-style';

const CSS = /* css */ `
  .app--chess-strategy-rpg-ready{
    min-height:100dvh;
    padding:20px 16px;
    box-sizing:border-box;
  }
  .chess-strategy-rpg-ready{
    max-width:1100px;
    margin:0 auto;
    min-height:calc(100dvh - 40px);
    border-radius:20px;
    border:1px solid rgba(125,211,252,.24);
    background:linear-gradient(160deg, rgba(11,20,34,.96), rgba(17,33,52,.88));
    color:#e6f2ff;
    display:flex;
    flex-direction:column;
    gap:18px;
    padding:24px;
  }
  .chess-strategy-rpg-ready__back{
    align-self:flex-start;
    border:1px solid rgba(148,199,255,.5);
    background:rgba(10,20,33,.85);
    width:34px;
    height:34px;
    display:grid;
    place-items:center;
    border-radius:10px;
    color:#e8f2ff;
    padding:0;
    cursor:pointer;
    font-size:18px;
    line-height:1;
  }
  .chess-strategy-rpg-ready__title{margin:0;font-size:30px;letter-spacing:.04em;text-transform:uppercase;}
  .chess-strategy-rpg-ready__desc{max-width:700px;margin:0;color:#9ec3e8;line-height:1.6;}
  .chess-strategy-rpg-ready__spec{display:grid;gap:10px;padding:16px 18px;border-radius:18px;border:1px solid rgba(148,199,255,.2);background:rgba(9,20,32,.72);}
  .chess-strategy-rpg-ready__spec-title{margin:0;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:#dff0ff;}
  .chess-strategy-rpg-ready__spec-list{margin:0;padding-left:20px;display:grid;gap:8px;color:#e6f2ff;line-height:1.55;}
  .chess-strategy-rpg-ready__footer{margin-top:auto;display:flex;justify-content:flex-end;}
  .chess-strategy-rpg-ready__attack{
    border:1px solid rgba(246,198,99,.66);
    background:linear-gradient(140deg,#f9cb84,#f0a85e);
    color:#2b2211;
    border-radius:14px;
    padding:12px 24px;
    text-transform:uppercase;
    letter-spacing:.08em;
    font-weight:800;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    gap:10px;
  }
 .chess-strategy-rpg-ready__attack-icon{font-size:18px;line-height:1;}
`;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: { enterScreen?: (screenId: string) => void } | null;
}

function ensureStyles(): void {
  ensureStyleTag(STYLE_ID, { css: CSS });
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null } = context;
  ensureStyles();

  const section = document.createElement('section');
  section.className = 'chess-strategy-rpg-ready';
  const mount = mountSection({ root, section, rootClasses: 'app--chess-strategy-rpg-ready' });

  section.innerHTML = `
    <button type="button" class="chess-strategy-rpg-ready__back" aria-label="Trở về Chiến Trường">←</button>
    <h1 class="chess-strategy-rpg-ready__title">Chess Strategy RPG</h1>
    <p class="chess-strategy-rpg-ready__desc">Đã mở nhánh chiến đấu riêng của mode ngang cấp Campaign: bấm nút tấn công để vào cụm 3 hub chọn map và bắt đầu trận bàn cờ.</p>
    <section class="chess-strategy-rpg-ready__spec">
      <h2 class="chess-strategy-rpg-ready__spec-title">Checklist áp dụng từ spec</h2>
      <ul class="chess-strategy-rpg-ready__spec-list">
        <li>4 tướng người chơi lấy theo lineup 10 ô (ưu tiên từ trái qua, trên xuống).</li>
        <li>Map trận tạo từ seed chữ+số, lõi tối thiểu 9x9 ô vuông + ô ngẫu nhiên mở rộng.</li>
        <li>Hub giữa dùng dữ liệu tu vi chuẩn từ cultivation.ts (đồng bộ economy hiện tại).</li>
        <li>Vào trận sẽ import HP/ATK/WIL/RES/ARM/AE và kit của 4 tướng.</li>
      </ul>
    </section>
    <div class="chess-strategy-rpg-ready__footer">
      <button type="button" class="chess-strategy-rpg-ready__attack"><span class="chess-strategy-rpg-ready__attack-icon">⚔️</span>Tấn Công</button>
    </div>
  `;

  const backButton = section.querySelector('.chess-strategy-rpg-ready__back');
  const attackButton = section.querySelector('.chess-strategy-rpg-ready__attack');

  const onBack = () => shell?.enterScreen?.('arena-hub');
  const onAttack = () => shell?.enterScreen?.('chess-strategy-rpg-battle');
  backButton?.addEventListener('click', onBack);
  attackButton?.addEventListener('click', onAttack);

  return {
    destroy() {
      backButton?.removeEventListener('click', onBack);
      attackButton?.removeEventListener('click', onAttack);
      mount.destroy();
    }
  };
}

export const render = renderScreen;
