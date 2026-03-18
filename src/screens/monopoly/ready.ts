import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { getMonopolyYearEventDisplayCopy, MONOPOLY_YEAR_EVENT_RULE_SUMMARY } from './index.ts';

const STYLE_ID = 'monopoly-ready-style';

const CSS = /* css */ `
  .app--co-ty-phu-ready{
    min-height:100dvh;
    padding:20px 16px;
    box-sizing:border-box;
  }
  .monopoly-ready{
    max-width:1100px;
    margin:0 auto;
    min-height:calc(100dvh - 40px);
    border-radius:20px;
    border:1px solid rgba(125,211,252,.24);
    background:linear-gradient(160deg, rgba(11,20,34,.96), rgba(17,33,52,.88));
    color:#e6f2ff;
    display:flex;
    flex-direction:column;
    gap:16px;
    padding:24px;
  }
  .monopoly-ready__back{
    align-self:flex-start;
    border:1px solid rgba(148,199,255,.5);
    background:rgba(10,20,33,.85);
    border-radius:999px;
    color:#e8f2ff;
    padding:10px 18px;
    cursor:pointer;
  }
  .monopoly-ready__title{margin:0;font-size:30px;letter-spacing:.04em;text-transform:uppercase;}
  .monopoly-ready__desc{max-width:560px;margin:0;color:#9ec3e8;line-height:1.6;}
  .monopoly-ready__events{display:grid;gap:10px;padding:16px 18px;border-radius:18px;border:1px solid rgba(148,199,255,.2);background:rgba(9,20,32,.72);}
  .monopoly-ready__events-title{margin:0;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:#dff0ff;}
  .monopoly-ready__events-desc{margin:0;color:#9ec3e8;line-height:1.6;}
  .monopoly-ready__events-list{margin:0;padding-left:20px;display:grid;gap:8px;color:#e6f2ff;line-height:1.55;}
  .monopoly-ready__events-list strong{color:#ffffff;}
  .monopoly-ready__footer{margin-top:auto;display:flex;justify-content:flex-end;}
  .monopoly-ready__start{
    border:1px solid rgba(110,231,183,.52);
    background:linear-gradient(160deg, rgba(20,74,56,.95), rgba(13,110,88,.92));
    color:#e9fff7;
    border-radius:14px;
    padding:12px 24px;
    text-transform:uppercase;
    letter-spacing:.08em;
    font-weight:700;
    cursor:pointer;
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
  section.className = 'monopoly-ready';
  const mount = mountSection({ root, section, rootClasses: 'app--co-ty-phu-ready' });

  const eventItems = getMonopolyYearEventDisplayCopy()
    .map(event => `<li><strong>${event.name}:</strong> ${event.description}</li>`)
    .join('');

  section.innerHTML = `
    <button type="button" class="monopoly-ready__back">← Trở về Chiến Trường</button>
    <h1 class="monopoly-ready__title">Cờ Tỷ Phú</h1>
    <p class="monopoly-ready__desc">Màn hình chuẩn bị cho chế độ cờ tỷ phú. Bấm nút bắt đầu ở góc dưới bên phải để vào trận.</p>
    <section class="monopoly-ready__events">
      <h2 class="monopoly-ready__events-title">Sự kiện năm</h2>
      <p class="monopoly-ready__events-desc">${MONOPOLY_YEAR_EVENT_RULE_SUMMARY}</p>
      <ol class="monopoly-ready__events-list">${eventItems}</ol>
    </section>
    <div class="monopoly-ready__footer">
      <button type="button" class="monopoly-ready__start">Bắt đầu</button>
    </div>
  `;

  const backButton = section.querySelector('.monopoly-ready__back');
  const startButton = section.querySelector('.monopoly-ready__start');

  const onBack = () => shell?.enterScreen?.('arena-hub');
  const onStart = () => shell?.enterScreen?.('co-ty-phu');

  backButton?.addEventListener('click', onBack);
  startButton?.addEventListener('click', onStart);

  return {
    destroy() {
      backButton?.removeEventListener('click', onBack);
      startButton?.removeEventListener('click', onStart);
      mount.destroy();
    }
  };
}
