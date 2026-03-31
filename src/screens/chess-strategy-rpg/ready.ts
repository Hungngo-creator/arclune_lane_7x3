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
    border-radius:999px;
    color:#e8f2ff;
    padding:10px 18px;
    cursor:pointer;
  }
  .chess-strategy-rpg-ready__title{margin:0;font-size:30px;letter-spacing:.04em;text-transform:uppercase;}
  .chess-strategy-rpg-ready__desc{max-width:700px;margin:0;color:#9ec3e8;line-height:1.6;}
  .chess-strategy-rpg-ready__spec{display:grid;gap:10px;padding:16px 18px;border-radius:18px;border:1px solid rgba(148,199,255,.2);background:rgba(9,20,32,.72);}
  .chess-strategy-rpg-ready__spec-title{margin:0;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:#dff0ff;}
  .chess-strategy-rpg-ready__spec-list{margin:0;padding-left:20px;display:grid;gap:8px;color:#e6f2ff;line-height:1.55;}
  .chess-strategy-rpg-ready__footer{margin-top:auto;display:flex;justify-content:flex-end;}
  .chess-strategy-rpg-ready__start{
    border:1px solid rgba(255,224,102,.4);
    background:rgba(52,38,16,.84);
    color:#ffe89b;
    border-radius:14px;
    padding:12px 24px;
    text-transform:uppercase;
    letter-spacing:.08em;
    font-weight:700;
    cursor:not-allowed;
    opacity:.95;
  }
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
    <button type="button" class="chess-strategy-rpg-ready__back">← Trở về Chiến Trường</button>
    <h1 class="chess-strategy-rpg-ready__title">Chess Strategy RPG</h1>
    <p class="chess-strategy-rpg-ready__desc">Hub chuẩn bị cho mode chiến thuật theo lượt. Trước mắt chỉ dựng UI mode mới và luồng điều hướng, chưa vào trận.</p>
    <section class="chess-strategy-rpg-ready__spec">
      <h2 class="chess-strategy-rpg-ready__spec-title">Spec đã khóa (tóm tắt v1)</h2>
      <ul class="chess-strategy-rpg-ready__spec-list">
        <li>4v4 theo lượt phe, mỗi tướng có Move + 1 Action.</li>
        <li>Base timer 8 giây/tướng + bank time theo phe.</li>
        <li>Turn cap mặc định: 7 lượt phe Player.</li>
        <li>Map seed + near-symmetry fairness, có cơ chế shrink từ turn 4.</li>
      </ul>
    </section>
    <div class="chess-strategy-rpg-ready__footer">
      <button type="button" class="chess-strategy-rpg-ready__start" disabled>Đang hoàn thiện trận đấu</button>
    </div>
  `;

  const backButton = section.querySelector('.chess-strategy-rpg-ready__back');
  const onBack = () => shell?.enterScreen?.('arena-hub');
  backButton?.addEventListener('click', onBack);

  return {
    destroy() {
      backButton?.removeEventListener('click', onBack);
      mount.destroy();
    }
  };
}

export const render = renderScreen;
