// FILE: src/aether.ts
import { AE_CLASS_COEFF } from './catalog.ts';

export class SharedAetherPool {
  public max: number = 100;
  public current: number = 50;
  public regenPerTurn: number = 0;

  private uiFill: HTMLElement | null = null;
  private side: 'ally' | 'enemy';

  constructor(side: 'ally' | 'enemy') {
    this.side = side;
    // Chờ HTML load xong mới vẽ để chống crash
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initUI());
      } else {
        this.initUI();
      }
    }
  }

  // --- LOGIC GAME CỦA NÍ ĐƯỢC GIỮ NGUYÊN ---
  public init(teamUnits: any[]) {
      this.max = 0;
      this.regenPerTurn = 0;
      for (const unit of teamUnits) {
          if (!unit) continue;
          this.max += (unit.aeMax || 0);
          const coeff = AE_CLASS_COEFF[unit.className as keyof typeof AE_CLASS_COEFF] || 0.55;
          this.regenPerTurn += ((unit.wil || 0) * coeff);
      }
      this.current = Math.floor(this.max / 2);
      this.regenPerTurn = Math.floor(this.regenPerTurn);
      this.updateUI();
  }

  public onTurnEnd() {
      this.current += this.regenPerTurn;
      if (this.current > this.max) {
          this.current = this.max;
      }
      this.updateUI();
  }

  public consume(cost: number): boolean {
      if (this.current >= cost) {
          this.current -= cost;
          this.updateUI();
          return true;
      }
      return false;
  }

  // --- LOGIC GIAO DIỆN MỚI ---
  private initUI() {
    if (typeof document === 'undefined') return;

    const containerId = `aether-pillar-${this.side}`;
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;

      const positionCss = this.side === 'ally' 
        ? 'left: 8%; transform: translateY(-50%);' 
        : 'right: 8%; transform: translateY(-50%);';

      const glowColor = this.side === 'ally' ? '#00ffff' : '#ff0055';
      const gradient = this.side === 'ally' 
        ? 'linear-gradient(to top, #0055ff, #00ffff)' 
        : 'linear-gradient(to top, #550000, #ff0055)';

      // Z-INDEX LÀ 9999 ĐỂ NỔI LÊN TRÊN MỌI THỨ
      container.style.cssText = `position: fixed; top: 50%; ${positionCss} width: 40px; height: 220px; background: rgba(10, 10, 30, 0.8); border: 2px solid ${glowColor}; border-radius: 8px; z-index: 99999; box-shadow: 0 0 15px ${glowColor}40; pointer-events: none;`;
      
      this.uiFill = document.createElement('div');
      this.uiFill.style.cssText = `position: absolute; bottom: 0; left: 0; width: 100%; background: ${gradient}; transition: height 0.4s ease-out; box-shadow: 0 0 10px ${glowColor};`;
      
      container.appendChild(this.uiFill);
      
       document.body.appendChild(container);
    } else {
      this.uiFill = container.firstElementChild as HTMLElement;
    }
  }

  public updateUI() {
    if (!document.getElementById(`aether-pillar-${this.side}`)) {
        this.initUI(); 
    }
    if (!this.uiFill) return;
    const percent = this.max > 0 ? (this.current / this.max) * 100 : 0;
    this.uiFill.style.height = `${Math.max(0, Math.min(100, percent))}%`;
  }
}

// 1. Tạo 2 trụ cho 2 bên
export const allyAetherPool = new SharedAetherPool('ally');
export const enemyAetherPool = new SharedAetherPool('enemy');

// 2. MÁNH KHÓE: Giữ lại biến globalAetherPool cũ để các file khác gọi không bị lỗi
export const globalAetherPool = {
  init: (units: any[]) => {
    allyAetherPool.init(units);
    // Khởi tạo tạm cho Kẻ thù để trụ Đỏ hiện lên
    if (enemyAetherPool.max === 0) {
        enemyAetherPool.max = 100;
        enemyAetherPool.current = 50;
        enemyAetherPool.updateUI();
    }
  },
  onTurnEnd: () => {
    allyAetherPool.onTurnEnd();
    enemyAetherPool.onTurnEnd();
  },
  consume: (cost: number) => allyAetherPool.consume(cost),
  updateUI: () => {
    allyAetherPool.updateUI();
    enemyAetherPool.updateUI();
  },
  get current() { return allyAetherPool.current; },
  get max() { return allyAetherPool.max; },
  get regenPerTurn() { return allyAetherPool.regenPerTurn; }
};
